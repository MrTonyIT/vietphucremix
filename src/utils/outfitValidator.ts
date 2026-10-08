import { CATALOG_ITEMS, OUTFIT_RECIPES } from '../data/catalog';
import { CatalogItem, EntitySlug, OutfitRecipe, SlotType, normalizeStyleId } from '../types/fashion';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  findings: string[];
}

const catalogMap = new Map<string, CatalogItem>(
  CATALOG_ITEMS.map((item) => [item.id, item])
);

export function getCatalogItem(id: string): CatalogItem | undefined {
  return catalogMap.get(id);
}

/**
 * Produces a deterministic fingerprint hash of the current outfit item IDs.
 * Used for stale action detection (baseOutfitRevision).
 */
export function getOutfitFingerprint(itemIds: string[]): string {
  const sorted = [...itemIds].filter(Boolean).sort();
  return sorted.join('|');
}

/**
 * Validates a list of item IDs against structural and recipe outfit rules.
 * Strictly guarantees slot exclusivity and required pieces (e.g. Yếm for Tứ Thân).
 * Note: Structural validity confirms outfit integrity, NOT historical authenticity.
 */
export function validateOutfit(itemIds: string[], entitySlug: EntitySlug): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const findings: string[] = [];

  const items: CatalogItem[] = [];
  const slotCount: Partial<Record<SlotType, number>> = {};

  for (const id of itemIds) {
    if (!id || typeof id !== 'string') {
      errors.push('Mã món đồ không hợp lệ (trống hoặc sai định dạng).');
      continue;
    }
    const item = catalogMap.get(id);
    if (!item) {
      errors.push(`Món đồ với mã ID "${id}" không tồn tại trong catalog.`);
      continue;
    }
    if (!item.available) {
      errors.push(`Món đồ "${item.name}" hiện không khả dụng.`);
      continue;
    }
    items.push(item);
    slotCount[item.slot] = (slotCount[item.slot] || 0) + 1;
  }

  // Check slot exclusivity (max 1 item per slot)
  for (const [slot, count] of Object.entries(slotCount)) {
    if (count && count > 1) {
      errors.push(`Vị trí "${slot}" có nhiều hơn 1 món đồ (${count} món). Mỗi vị trí chỉ được gắn tối đa 1 món.`);
    }
  }

  // Check required main item
  const mainItem = items.find((i) => i.slot === 'main');
  if (!mainItem) {
    errors.push('Bắt buộc phải có đúng 1 áo chính (main) định hình phom dáng.');
  } else if (mainItem.entitySlug !== entitySlug) {
    errors.push(`Áo chính "${mainItem.name}" thuộc nhóm ${mainItem.entitySlug}, không tương thích với nhóm đã chọn (${entitySlug}).`);
  }

  // Check required lower piece (pants/skirts)
  const lowerItem = items.find((i) => i.slot === 'lower');
  if (!lowerItem) {
    errors.push('Bắt buộc phải có phần mặc dưới (quần lụa hoặc chân váy đầm).');
  }

  // Check footwear
  const footItem = items.find((i) => i.slot === 'footwear');
  if (!footItem) {
    errors.push('Bắt buộc phải có giày, hài hoặc guốc mộc để hoàn thiện bộ đồ.');
  }

  // Group-specific structural rules
  if (entitySlug === 'tu-than') {
    const innerItem = items.find((i) => i.slot === 'inner');
    if (!innerItem) {
      errors.push('Trang phục Áo Tứ Thân bắt buộc phải có Áo Yếm (inner) bên trong.');
    } else {
      findings.push('Đã trang bị Áo Yếm cho cấu trúc trang phục Tứ Thân.');
    }

    if (lowerItem && (lowerItem.renderVariant.includes('pants') || lowerItem.id.includes('quan'))) {
      warnings.push('Áo tứ thân thường phối cùng váy đầm; bạn đang phối quần (phong cách biến thể).');
    }
  }

  if (entitySlug === 'ao-dai') {
    const innerItem = items.find((i) => i.slot === 'inner');
    if (innerItem) {
      warnings.push('Áo dài tân thời không cần trang bị yếm bên trong.');
    }
    findings.push('Cấu trúc áo dài 2 tà trước sau với quần ống rộng.');
  }

  if (entitySlug === 'ngu-than') {
    const headItem = items.find((i) => i.slot === 'headwear');
    if (headItem && headItem.id.includes('khan-van')) {
      findings.push('Khăn vấn đi kèm áo ngũ thân tay chẽn.');
    }
  }

  // Modern remix detection
  const modernItems = items.filter((i) => i.isModern);
  if (modernItems.length > 0) {
    findings.push(`Bộ phối có ${modernItems.length} chi tiết cách tân (Remix): ${modernItems.map((i) => i.name).join(', ')}.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    findings,
  };
}

/**
 * Calculates a qualitative heuristic match score and color harmony label.
 * Event (40%), Style (30%), Color (20%), Modern (10%).
 * 
 * RÀNG BUỘC ĐỢT 4:
 * - Điểm chỉ là tham khảo tạo hình; không tuyên bố xác nhận lịch sử hay khách quan tuyệt đối.
 * - Bộ thiếu/invalid KHÔNG được nhận điểm cao như bộ hoàn chỉnh (tính theo tỷ lệ hoàn thiện slot).
 * - Điểm tối đa 95%, tối thiểu 15%.
 */
export function calculateHeuristicScore(
  recipe: OutfitRecipe,
  items: CatalogItem[],
  criteria: {
    event?: string;
    style?: string;
    preferredColor?: string;
  }
): { score: number; colorHarmony: string; rationale: string; disclaimer: string } {
  // Required slots check based on entity
  const requiredSlots: SlotType[] =
    recipe.entitySlug === 'tu-than'
      ? ['main', 'lower', 'inner', 'footwear']
      : ['main', 'lower', 'footwear'];

  const presentRequired = requiredSlots.filter((slot) => items.some((i) => i.slot === slot)).length;
  const completionRatio = presentRequired / requiredSlots.length;

  // Base score scales with structural completion
  let score = Math.round(completionRatio * 60);

  // If missing essential pieces, penalty reflects incomplete outfit
  if (completionRatio < 1) {
    const missingCount = requiredSlots.length - presentRequired;
    const missingSlotNames = requiredSlots
      .filter((slot) => !items.some((i) => i.slot === slot))
      .join(', ');
    return {
      score: Math.max(score, 15),
      colorHarmony: 'Chưa hoàn chỉnh',
      rationale: `Bộ đồ còn thiếu ${missingCount} vị trí cốt lõi (${missingSlotNames}) để có thể đánh giá hòa sắc và bối cảnh đầy đủ.`,
      disclaimer: 'Điểm số mang tính chất tham khảo tạo hình đương đại (Heuristic Matching); không đại diện cho tính chuẩn xác lịch sử hay xếp hạng giá trị cổ phục.',
    };
  }

  // 1. Event Match (Up to 15%)
  if (criteria.event) {
    const matchingEventCount = items.filter((i) =>
      i.eventTags.includes(criteria.event! as any)
    ).length;
    const eventRatio = matchingEventCount / Math.max(items.length, 1);
    score += Math.round(eventRatio * 15);
  } else {
    score += 8;
  }

  // 2. Style Match (Up to 10%)
  if (criteria.style && criteria.style !== 'all') {
    const targetStyleNorm = normalizeStyleId(criteria.style);
    const matchingStyleCount = items.filter((i) =>
      i.styleTags.some((tag) => {
        const tagNorm = normalizeStyleId(tag);
        return tagNorm === targetStyleNorm || tagNorm.includes(targetStyleNorm) || targetStyleNorm.includes(tagNorm);
      })
    ).length;
    const styleRatio = matchingStyleCount / Math.max(items.length, 1);
    score += Math.round(styleRatio * 10);
  } else {
    score += 5;
  }

  // 3. Color Harmony (Up to 10%)
  if (criteria.preferredColor) {
    const prefColorLower = criteria.preferredColor.toLowerCase();
    const hasPreferred = items.some((i) =>
      i.colorName.toLowerCase().includes(prefColorLower) ||
      i.colorId.toLowerCase().includes(prefColorLower)
    );
    if (hasPreferred) {
      score += 10;
    }
  } else {
    score += 5;
  }

  // Cap score: min 20%, max 95%
  score = Math.min(Math.max(score, 20), 95);

  // Derive Color Harmony & Rationale strictly from ACTUAL present items
  const mainItem = items.find((i) => i.slot === 'main');
  const lowerItem = items.find((i) => i.slot === 'lower');
  const innerItem = items.find((i) => i.slot === 'inner');
  const footItem = items.find((i) => i.slot === 'footwear');

  const presentColors: string[] = [];
  if (mainItem) presentColors.push(mainItem.colorName);
  if (innerItem) presentColors.push(`Yếm ${innerItem.colorName}`);
  if (lowerItem) presentColors.push(lowerItem.colorName);

  let colorHarmony = recipe.colorHarmony;
  let rationale = 'Phối màu cân đối giữa trang phục chính và phụ kiện.';

  if (presentColors.length > 0) {
    colorHarmony = `${presentColors.join(' & ')}`;
    rationale = `Sự kết hợp sắc thái giữa ${presentColors.join(', ')}${footItem ? ` cùng ${footItem.name}` : ''} tạo cảm quan thị giác hài hòa, phù hợp bối cảnh sự kiện.`;
  }

  return {
    score,
    colorHarmony,
    rationale,
    disclaimer: 'Điểm số mang tính chất tham khảo tạo hình đương đại (Heuristic Matching); không đại diện cho tính chuẩn xác lịch sử hay xếp hạng giá trị cổ phục.',
  };
}
