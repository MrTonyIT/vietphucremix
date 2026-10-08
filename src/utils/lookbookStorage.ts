import { z } from 'zod';
import { CATALOG_ITEMS, OUTFIT_RECIPES } from '../data/catalog';
import { CatalogItem, EntitySlug, SlotType } from '../types/fashion';

export const LOOKBOOK_STORAGE_KEY = 'vietphuc_lookbook_v1';

// Strict schema for Lookbook storage entries
export const LookbookEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  entitySlug: z.enum(['ao-dai', 'ngu-than', 'tu-than']),
  itemIds: z.array(z.string()).min(1),
  savedAt: z.any().transform((val) => {
    if (typeof val === 'string' && val.trim().length > 0) {
      if (val === 'Không rõ thời gian') return val;
      const parsed = Date.parse(val);
      if (!isNaN(parsed) || val.includes('/') || val.includes('-') || val.includes(':')) {
        return val.trim();
      }
      return 'Không rõ thời gian';
    }
    if (val instanceof Date && !isNaN(val.getTime())) {
      return val.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
    // Any corrupted object, null, undefined, invalid type: never JSON.stringify or fabricate current date
    return 'Không rõ thời gian';
  }),
  colorHarmony: z.string().optional(),
  recipeId: z.string().optional(),
  sceneId: z.string().optional(),
  sceneName: z.string().optional(),
  version: z.number().optional(),
});

export type LookbookEntry = z.infer<typeof LookbookEntrySchema>;

const catalogMap = new Map<string, CatalogItem>(
  CATALOG_ITEMS.map((item) => [item.id, item])
);

/**
 * Safely retrieves all saved lookbook entries from localStorage.
 * Automatically recovers from corrupted JSON, invalid objects, or empty storage without crashing.
 */
export function getSavedLookbooks(): LookbookEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOOKBOOK_STORAGE_KEY);
    if (!raw) return [];
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      console.warn('[Lookbook] JSON hỏng trong localStorage, khởi tạo lại an toàn:', parseErr);
      localStorage.removeItem(LOOKBOOK_STORAGE_KEY);
      return [];
    }

    if (!Array.isArray(parsed)) {
      console.warn('[Lookbook] Dữ liệu lookbook không phải mảng, khởi tạo lại.');
      return [];
    }

    // Filter and sanitize entries with Zod schema
    const validEntries: LookbookEntry[] = [];
    for (const item of parsed) {
      const result = LookbookEntrySchema.safeParse(item);
      if (result.success) {
        validEntries.push(result.data);
      } else {
        console.warn('[Lookbook] Bỏ qua entry không hợp lệ:', item, result.error);
      }
    }

    return validEntries;
  } catch (error) {
    console.error('[Lookbook] Lỗi đọc localStorage:', error);
    return [];
  }
}

/**
 * Safely saves a lookbook entry with quota overflow handling.
 */
export function saveLookbookEntry(
  entry: Omit<LookbookEntry, 'id' | 'savedAt'>
): { success: boolean; entry?: LookbookEntry; error?: string } {
  try {
    const current = getSavedLookbooks();
    const newEntry: LookbookEntry = {
      ...entry,
      version: entry.version || 2,
      id: `lookbook-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      savedAt: new Date().toLocaleDateString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    };

    // Prepend to top
    const updated = [newEntry, ...current];
    localStorage.setItem(LOOKBOOK_STORAGE_KEY, JSON.stringify(updated));
    return { success: true, entry: newEntry };
  } catch (err: any) {
    console.error('[Lookbook] Không thể lưu vào localStorage:', err);
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      return {
        success: false,
        error: 'Bộ nhớ trình duyệt (localStorage) đã đầy. Vui lòng xóa bớt một số bộ phối cũ trong Lookbook.',
      };
    }
    return { success: false, error: 'Lỗi khi lưu Lookbook: ' + err.message };
  }
}

/**
 * Deletes a lookbook entry by ID.
 */
export function deleteLookbookEntry(id: string): boolean {
  try {
    const current = getSavedLookbooks();
    const filtered = current.filter((item) => item.id !== id);
    localStorage.setItem(LOOKBOOK_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('[Lookbook] Lỗi xóa entry:', err);
    return false;
  }
}

export interface LookbookSnapshot {
  items: Partial<Record<SlotType, CatalogItem>>;
  duplicateItemIds: string[];
  unknownItemIds: string[];
  unavailableItemIds: string[];
  missingItemIds: string[];
  missingRequiredSlots: SlotType[];
  missingOptionalSlots: SlotType[];
  hasUnavailableOrMissing: boolean;
  hasDuplicates: boolean;
  isComplete: boolean;
  totalRequested: number;
  resolvedCount: number;
}

/**
 * Trích xuất trung thực trạng thái snapshot của bộ Lookbook.
 * RÀNG BUỘC (ĐỢT 3):
 * - Kiểm tra raw IDs trước resolve: phát hiện ID trùng lặp (duplicates), ID lạ (unknown) và ID tạm khóa (unavailable).
 * - Không tự ý thay thế món thiếu bằng món mặc định trong Compare hay Builder.
 * - Kiểm tra danh sách requiredSlots và optionalSlots theo recipe của nhóm trang phục.
 * - Giữ nguyên toàn bộ các món còn lại mà không làm crash ứng dụng.
 */
export function resolveLookbookSnapshot(
  itemIds: string[],
  entitySlug: EntitySlug
): LookbookSnapshot {
  const items: Partial<Record<SlotType, CatalogItem>> = {};
  const duplicateItemIds: string[] = [];
  const unknownItemIds: string[] = [];
  const unavailableItemIds: string[] = [];
  const seenIds = new Set<string>();

  // 1. Detect duplicates and validate existence in catalog
  for (const id of itemIds) {
    if (typeof id !== 'string') continue;
    if (seenIds.has(id)) {
      if (!duplicateItemIds.includes(id)) duplicateItemIds.push(id);
    } else {
      seenIds.add(id);
    }

    const found = catalogMap.get(id);
    if (!found) {
      unknownItemIds.push(id);
    } else if (!found.available) {
      unavailableItemIds.push(id);
    } else {
      items[found.slot] = found;
    }
  }

  const missingItemIds = [...unknownItemIds, ...unavailableItemIds];

  // 2. Cross-reference required and optional slots from recipe
  const recipe = OUTFIT_RECIPES.find((r) => r.entitySlug === entitySlug) || OUTFIT_RECIPES[0];
  const missingRequiredSlots: SlotType[] = [];
  const missingOptionalSlots: SlotType[] = [];

  for (const slot of recipe.requiredSlots) {
    if (!items[slot]) {
      missingRequiredSlots.push(slot);
    }
  }

  for (const slot of recipe.optionalSlots) {
    if (!items[slot]) {
      missingOptionalSlots.push(slot);
    }
  }

  const isComplete =
    missingRequiredSlots.length === 0 &&
    unknownItemIds.length === 0 &&
    unavailableItemIds.length === 0 &&
    duplicateItemIds.length === 0;

  return {
    items,
    duplicateItemIds,
    unknownItemIds,
    unavailableItemIds,
    missingItemIds,
    missingRequiredSlots,
    missingOptionalSlots,
    hasUnavailableOrMissing: missingItemIds.length > 0,
    hasDuplicates: duplicateItemIds.length > 0,
    isComplete,
    totalRequested: itemIds.length,
    resolvedCount: Object.keys(items).length,
  };
}

/**
 * Resolves item IDs into full CatalogItem objects for Builder.
 * TUÂN THỦ:
 * - Trả về chi tiết các món bị thiếu (unknown/unavailable) và trùng lặp.
 * - Không tự ý chèn các món recipe mặc định vào các slot bị thiếu.
 */
export function resolveLookbookItems(
  itemIds: string[],
  entitySlug?: EntitySlug
): {
  items: Partial<Record<SlotType, CatalogItem>>;
  duplicateItemIds: string[];
  unknownItemIds: string[];
  unavailableItemIds: string[];
  missingItemIds: string[];
  missingRequiredSlots: SlotType[];
  missingOptionalSlots: SlotType[];
  entitySlug: EntitySlug;
  isComplete: boolean;
} {
  const resolved = resolveLookbookSnapshot(
    itemIds,
    entitySlug || 'ao-dai'
  );

  // Infer entity from main item if present, else use provided or default
  const main = resolved.items.main;
  const resolvedSlug: EntitySlug =
    main && main.entitySlug !== 'all'
      ? (main.entitySlug as EntitySlug)
      : entitySlug || 'ao-dai';

  return {
    items: resolved.items,
    duplicateItemIds: resolved.duplicateItemIds,
    unknownItemIds: resolved.unknownItemIds,
    unavailableItemIds: resolved.unavailableItemIds,
    missingItemIds: resolved.missingItemIds,
    missingRequiredSlots: resolved.missingRequiredSlots,
    missingOptionalSlots: resolved.missingOptionalSlots,
    entitySlug: resolvedSlug,
    isComplete: resolved.isComplete,
  };
}

/**
 * Nạp sẵn 2 bộ phối mẫu vào Lookbook khi cần kiểm tra nhanh tính năng So sánh.
 */
export function seedSampleLookbooks(): LookbookEntry[] {
  const sample1: LookbookEntry = {
    id: `lookbook-sample-aodai`,
    name: 'Áo Dài Trắng Học Đường (Mẫu)',
    entitySlug: 'ao-dai',
    itemIds: [
      'item-main-aodai-trang',
      'item-lower-quan-lua-trang',
      'item-head-non-la-bai-tho',
      'item-foot-guoc-moc-quai-nhung',
      'item-acc-kieng-bac-cham',
    ],
    savedAt: '01/10/2026, 09:30',
    colorHarmony: 'Bạch sắc tinh khôi',
  };

  const sample2: LookbookEntry = {
    id: `lookbook-sample-nguthan`,
    name: 'Ngũ Thân Tay Chẽn Remix Sneaker (Mẫu)',
    entitySlug: 'ngu-than',
    itemIds: [
      'item-main-nguthan-xanh-ngoc',
      'item-lower-quan-lua-trang',
      'item-head-khan-van-dong',
      'item-foot-sneaker-canvas-retro',
      'item-acc-quat-tram-huong',
    ],
    savedAt: '01/10/2026, 14:15',
    colorHarmony: 'Thanh lịch tương phản đương đại',
  };

  try {
    const current = getSavedLookbooks();
    const existingIds = new Set(current.map((e) => e.id));
    const toAdd = [sample1, sample2].filter((s) => !existingIds.has(s.id));
    const updated = [...toAdd, ...current];
    localStorage.setItem(LOOKBOOK_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Lỗi khi seed sample lookbooks:', err);
    return getSavedLookbooks();
  }
}
