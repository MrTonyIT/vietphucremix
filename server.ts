import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { CATALOG_ITEMS, CULTURE_CONTEXTS, OUTFIT_RECIPES } from './src/data/catalog';
import { SCENE_DEFINITIONS, SceneDefinition } from './src/data/scenes';
import { INSPIRATION_GALLERY, InspirationGalleryEntry, matchInspirationGallery } from './src/data/inspirationGallery';
import {
  CatalogItem,
  EntityDisplayData,
  EntitySlug,
  OutfitAction,
  SlotType,
  ChatRequestSchema,
  RecommendRequestSchema,
  GenderType,
  AgeGroupType,
  normalizeStyleId,
} from './src/types/fashion';
import { calculateHeuristicScore, validateOutfit, getOutfitFingerprint } from './src/utils/outfitValidator';

export const VERIFIED_CULTURE_CLAIMS: Record<
  EntitySlug,
  { claimId: string; referenceSource: string; sourcedFact: string; reviewStatus: 'REVIEWED' | 'NEEDS_REVIEW' }
> = {
  'ao-dai': {
    claimId: 'claim-aodai-lemur-1930',
    referenceSource: 'Ngàn năm áo mũ (Trần Quang Đức, 2013) & Tư liệu đồng phục nữ sinh Gia Long/Đồng Khánh',
    sourcedFact: 'Áo dài tân thời phát triển từ áo ngũ thân, được họa sĩ Lemur Cát Tường và Lê Phổ tinh giản chỉ còn 2 tà trước và sau, ôm nhẹ đường cong cơ thể, trở thành quốc phục đại diện vẻ đẹp thanh tân.',
    reviewStatus: 'REVIEWED',
  },
  'ngu-than': {
    claimId: 'claim-nguthan-minhmang-1827',
    referenceSource: 'Khâm định Đại Nam hội điển sự lệ & Khảo cứu Trang phục Việt Nam (Đoàn Thị Tình)',
    sourcedFact: 'Tên gọi "Ngũ thân" xuất phát từ kết cấu gồm 5 mảnh vải: 2 thân trước, 2 thân sau và 1 thân con (tiền thân) lót bên trong ngực phải; cài 5 khuy tượng trưng cho đức hạnh Ngũ thường (Nhân, Lễ, Nghĩa, Trí, Tín).',
    reviewStatus: 'REVIEWED',
  },
  'tu-than': {
    claimId: 'claim-tuthan-kinhbac-yem',
    referenceSource: 'Văn hóa mặc truyền thống của người Việt ở đồng bằng Bắc Bộ (Viện VHNTQGVN)',
    sourcedFact: 'Áo tứ thân gồm 4 vạt vải: 2 vạt sau may liền sống lưng, 2 vạt trước buông rủ để buộc chéo vạt trước bụng; bên trong trang phục bắt buộc phải có chiếc Yếm (cổ sen hoặc cổ xây) và thắt lưng lụa bao.',
    reviewStatus: 'REVIEWED',
  },
};

// Support .env.local first, then fallback to .env
dotenv.config({ path: ['.env.local', '.env'] });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enforce request body size limit to prevent payload floods
app.use(express.json({ limit: '256kb' }));

const catalogMap = new Map<string, CatalogItem>(
  CATALOG_ITEMS.map((item) => [item.id, item])
);

// In-memory IP rate limiter for /api/chat (30 requests / minute)
// Includes periodic cleanup interval to prevent memory leaks
const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Rate limit & Concurrency control for /api/inspiration-image (5 requests / min, max 1 active concurrent)
const imageGenRateLimitMap = new Map<string, { count: number; resetAt: number; activeRequests: number }>();

const RATE_LIMIT_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const rateLimitCleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRateLimitMap.entries()) {
    if (now > record.resetAt) {
      ipRateLimitMap.delete(ip);
    }
  }
  for (const [ip, record] of imageGenRateLimitMap.entries()) {
    if (now > record.resetAt && record.activeRequests === 0) {
      imageGenRateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_CLEANUP_INTERVAL_MS);

// Allow timer to not block process exit
if (rateLimitCleanupTimer.unref) {
  rateLimitCleanupTimer.unref();
}

function checkChatRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (record.count >= 30) {
    return false;
  }
  record.count++;
  return true;
}

function checkImageGenRateLimit(ip: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  let record = imageGenRateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + 60000, activeRequests: 0 };
    imageGenRateLimitMap.set(ip, record);
  }
  if (record.activeRequests >= 1) {
    return { allowed: false, reason: 'Bạn đang có một yêu cầu tạo ảnh đang xử lý. Vui lòng đợi hoàn tất trước khi bấm tiếp.' };
  }
  if (record.count >= 5) {
    return { allowed: false, reason: 'Hạn mức tạo ảnh cảm hứng là 5 lần/phút để bảo tồn tài nguyên. Vui lòng đợi 1 phút.' };
  }
  record.count++;
  record.activeRequests++;
  return { allowed: true };
}

function releaseImageGenSlot(ip: string): void {
  const record = imageGenRateLimitMap.get(ip);
  if (record && record.activeRequests > 0) {
    record.activeRequests--;
  }
}

// In-memory LRU Cache for Inspiration Images (max 50 entries)
interface CachedInspirationResult {
  fingerprint: string;
  source: 'mockup' | 'gallery' | 'live';
  status: 'ready' | 'mockup_ready';
  providerStatus?: 'not_configured' | 'unsupported' | 'ready';
  sceneId: string;
  sceneName: string;
  prompt: string;
  disclaimer: string;
  timestamp: string;
  provider: string;
  outfitSummary: {
    entitySlug: string;
    mainColor: string;
    itemCount: number;
    itemNames: string[];
  };
  matchedGallery?: {
    id: string;
    title: string;
    matchType: 'exact' | 'similar';
    differenceNote?: string;
    sourceAttribution: string;
    paletteColors: string[];
    assetStatus?: string;
    reviewStatus?: string;
  };
}

const inspirationCache = new Map<string, CachedInspirationResult>();
const MAX_INSPIRATION_CACHE_ENTRIES = 50;

const InspirationImageRequestSchema = z.object({
  outfitItemIds: z.array(z.string().min(1)).min(1, 'Cần ít nhất 1 món đồ để tạo cảm hứng').max(10),
  sceneId: z.string().min(1).default('scene-studio'),
  characterPresetId: z.string().optional().default('preset-female-editorial-01'),
  stylePreset: z.string().optional().default('editorial'),
  baseRevision: z.number().optional(),
});

// Request Schemas
const SwapItemRequestSchema = z.object({
  currentItemIds: z.array(z.string().min(1)).min(1),
  targetSlot: z.enum(['main', 'lower', 'inner', 'headwear', 'footwear', 'accessory']),
  newItemId: z.string().min(1),
});

const CompareRequestSchema = z.object({
  outfitA: z.object({
    name: z.string().min(1),
    entitySlug: z.enum(['ao-dai', 'ngu-than', 'tu-than']),
    itemIds: z.array(z.string()),
  }),
  outfitB: z.object({
    name: z.string().min(1),
    entitySlug: z.enum(['ao-dai', 'ngu-than', 'tu-than']),
    itemIds: z.array(z.string()),
  }),
  criteria: z.object({
    event: z.string().optional(),
    style: z.string().optional(),
    preferredColor: z.string().optional(),
  }).optional(),
});

// Tool Argument Schemas (Validated with Zod at execution boundary)
const SwapOutfitItemArgsSchema = z.object({
  targetSlot: z.preprocess(
    (val) => String(val || '').trim().toLowerCase(),
    z.enum(['main', 'lower', 'inner', 'headwear', 'footwear', 'accessory'])
  ),
  desiredStyleOrColor: z.string().max(100).optional(),
});

const RecommendOutfitsArgsSchema = z.object({
  event: z.preprocess(
    (val) => (val ? String(val).trim().toUpperCase() : undefined),
    z.enum(['KY_YEU', 'LE_HOI_TRUONG', 'CHUP_ANH_NGHE_THUAT', 'DAO_PHO']).optional()
  ),
  entitySlug: z.preprocess(
    (val) => (val ? String(val).trim().toLowerCase() : undefined),
    z.enum(['ao-dai', 'ngu-than', 'tu-than']).optional()
  ),
  stylePreference: z.string().max(100).optional(),
  preferredColor: z.string().max(100).optional(),
});

const GetCultureContextArgsSchema = z.object({
  entitySlug: z.preprocess(
    (val) => (val ? String(val).trim().toLowerCase() : undefined),
    z.enum(['ao-dai', 'ngu-than', 'tu-than']).optional()
  ),
});

// Gemini Client Setup
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Keep the configured model: GEMINI_MODEL priority, fallback to project default models/gemini-3.8-flash
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'models/gemini-3.8-flash';

let aiClient: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Test / Mock Transport Hook for SDK integration testing
let mockAiClientForTesting: any = null;
export function setMockAiClient(client: any) {
  mockAiClientForTesting = client;
}

// Function Declarations for Gemini
const recommendOutfitsDeclaration: FunctionDeclaration = {
  name: 'recommend_outfits',
  description: 'Tìm kiếm bộ phối phù hợp từ kho công thức và catalog của Việt Phục Remix dựa theo sự kiện, nhóm áo, phong cách hoặc màu sắc.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      event: { type: Type.STRING, description: 'Bối cảnh sự kiện (KY_YEU, LE_HOI_TRUONG, CHUP_ANH_NGHE_THUAT, DAO_PHO)' },
      entitySlug: { type: Type.STRING, description: 'Nhóm áo (ao-dai, ngu-than, tu-than)' },
      stylePreference: { type: Type.STRING, description: 'Phong cách ưu tiên (truyen-thong, thanh-lich, tre-trung, remix, dan-gian)' },
      preferredColor: { type: Type.STRING, description: 'Màu sắc mong muốn (trắng, hồng, xanh, vàng, nâu, đỏ)' },
    },
  },
};

const swapOutfitItemDeclaration: FunctionDeclaration = {
  name: 'swap_outfit_item',
  description: 'Đổi đúng MỘT món đồ trong trang phục hiện tại tại vị trí slot chỉ định (ví dụ đổi giày, nón, phụ kiện), trong khi giữ nguyên 100% tất cả các món đồ ở các vị trí khác.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      targetSlot: {
        type: Type.STRING,
        description: 'Vị trí slot muốn đổi: main, lower, inner, headwear, footwear, accessory',
      },
      desiredStyleOrColor: {
        type: Type.STRING,
        description: 'Mô tả màu sắc hoặc phong cách mong muốn cho món mới (ví dụ: sneaker, hài thêu sen, nón lá, túi cói, trẻ trung, năng động)',
      },
    },
    required: ['targetSlot'],
  },
};

const getCultureContextDeclaration: FunctionDeclaration = {
  name: 'get_culture_context',
  description: 'Tra cứu thông tin ngữ cảnh văn hóa, nguồn tài liệu đối chiếu, sự thật văn hóa và lưu ý bối cảnh cho nhóm phục trang.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      entitySlug: {
        type: Type.STRING,
        description: 'Nhóm áo cần tra cứu: ao-dai, ngu-than, hoặc tu-than',
      },
    },
    required: ['entitySlug'],
  },
};

// API: Health check and metadata
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Việt Phục Remix',
    checkpoint: 'Checkpoint 4 — Lookbook, So sánh & Hoàn thiện',
    geminiModel: GEMINI_MODEL,
    hasApiKey: Boolean(GEMINI_API_KEY),
    serverAuthority: true,
    totalCatalogItems: CATALOG_ITEMS.length,
    totalRecipes: OUTFIT_RECIPES.length,
    timestamp: new Date().toISOString(),
  });
});

// API: Get Catalog items (supports filtering by slot and entitySlug)
app.get('/api/catalog', (req, res) => {
  try {
    const { slot, entitySlug } = req.query;
    let items = [...CATALOG_ITEMS];

    if (slot && typeof slot === 'string') {
      items = items.filter(item => item.slot === slot);
    }

    if (entitySlug && typeof entitySlug === 'string') {
      items = items.filter(item => item.entitySlug === entitySlug || item.entitySlug === 'all');
    }

    res.json({
      success: true,
      total: items.length,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Get default outfits and populated recipes
const getOutfitsDefaultHandler: express.RequestHandler = (req, res) => {
  try {
    const { entitySlug } = req.query;

    const recipes = entitySlug
      ? OUTFIT_RECIPES.filter((r) => r.entitySlug === entitySlug)
      : OUTFIT_RECIPES;

    const populatedRecipes = recipes.map((recipe) => {
      const items: Record<string, any> = {};
      for (const [slot, itemId] of Object.entries(recipe.defaultItemIds)) {
        const found = catalogMap.get(itemId);
        if (found) {
          items[slot] = found;
        }
      }
      const culture = CULTURE_CONTEXTS[recipe.entitySlug];
      return {
        ...recipe,
        items,
        culture,
      };
    });

    res.json({
      success: true,
      recipes: populatedRecipes,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

app.get('/api/outfits/default', getOutfitsDefaultHandler);
app.get('/api/recipes', getOutfitsDefaultHandler);

// API: Get culture context with citations
app.get('/api/culture/:slug', (req, res) => {
  const slug = req.params.slug as EntitySlug;
  const culture = CULTURE_CONTEXTS[slug];
  if (!culture) {
    return res.status(404).json({
      success: false,
      error: `Không tìm thấy ngữ cảnh văn hóa cho nhóm áo: ${slug}`,
    });
  }
  res.json({
    success: true,
    culture,
  });
});

// Helper: Build candidate outfits respecting locks and criteria (used by both /api/recommend and recommend_outfits tool)
function buildCandidateOutfits({
  event,
  entitySlug,
  style,
  preferredColor,
  lockedItemIds = [],
  currentItemIds = [],
  gender = 'all',
  ageGroup = 'thanh_nien',
}: {
  event?: string;
  entitySlug?: EntitySlug;
  style?: string;
  preferredColor?: string;
  lockedItemIds?: string[];
  currentItemIds?: string[];
  gender?: GenderType;
  ageGroup?: AgeGroupType;
}) {
  const targetRecipes = entitySlug
    ? OUTFIT_RECIPES.filter((r) => r.entitySlug === entitySlug)
    : OUTFIT_RECIPES;

  // Map of locked items from current outfit
  const lockedItemsMap: Partial<Record<SlotType, CatalogItem>> = {};
  for (const id of lockedItemIds) {
    const item = catalogMap.get(id);
    if (item && item.available) {
      lockedItemsMap[item.slot] = item;
    }
  }

  const candidates = targetRecipes.map((recipe) => {
    const candidateItemMap: Partial<Record<SlotType, CatalogItem>> = {};

    // 1. Populate base items from recipe defaults
    for (const [slot, defaultId] of Object.entries(recipe.defaultItemIds)) {
      const defaultItem = catalogMap.get(defaultId);
      if (defaultItem) {
        candidateItemMap[slot as SlotType] = defaultItem;
      }
    }

    // 2. Adjust items if specific style or preferred color matches alternatives (SKIP locked slots)
    if (preferredColor || style || (gender && gender !== 'all') || (ageGroup && ageGroup !== 'all')) {
      for (const [slotKey, currentItem] of Object.entries(candidateItemMap)) {
        const slot = slotKey as SlotType;
        if (lockedItemsMap[slot]) continue; // Do not touch locked slots
        if (!currentItem) continue;

        const alternatives = CATALOG_ITEMS.filter(
          (item) =>
            item.slot === slot &&
            item.available &&
            item.id !== currentItem.id &&
            (item.entitySlug === recipe.entitySlug || item.entitySlug === 'all') &&
            (!gender || gender === 'all' || item.genderSuitability === 'unisex' || item.genderSuitability === gender)
        );

        for (const alt of alternatives) {
          const matchesColor =
            preferredColor &&
            (alt.colorId.toLowerCase().includes(preferredColor.toLowerCase()) ||
              alt.colorName.toLowerCase().includes(preferredColor.toLowerCase()));

          const matchesStyle =
            style &&
            alt.styleTags.some((tag) =>
              tag.toLowerCase().includes(style.toLowerCase())
            );

          const matchesAge = ageGroup && ageGroup !== 'all' && alt.ageGroups.includes(ageGroup);

          if (matchesColor || matchesStyle || matchesAge) {
            candidateItemMap[slot] = alt;
            break;
          }
        }
      }
    }

    // 3. Strictly enforce locked items onto the candidate outfit
    for (const [slotKey, lockedItem] of Object.entries(lockedItemsMap)) {
      const slot = slotKey as SlotType;
      if (lockedItem && (lockedItem.entitySlug === recipe.entitySlug || lockedItem.entitySlug === 'all')) {
        candidateItemMap[slot] = lockedItem;
      }
    }

    const candidateItemsList = Object.values(candidateItemMap).filter(Boolean) as CatalogItem[];
    const candidateItemIds = candidateItemsList.map((i) => i.id);

    const scoring = calculateHeuristicScore(recipe, candidateItemsList, {
      event,
      style,
      preferredColor,
    });

    let adjustedScore = scoring.score;

    // Bonus / Penalty for Gender & Age Suitability
    if (gender && gender !== 'all') {
      const isMale = gender === 'nam';
      // In Vietnamese culture, Áo Tứ Thân is traditionally female attire with Yếm
      if (isMale && recipe.entitySlug === 'tu-than') {
        adjustedScore -= 18;
      }
      const genderMatches = candidateItemsList.filter(
        (it) => it.genderSuitability === 'unisex' || it.genderSuitability === gender
      ).length;
      adjustedScore += Math.round((genderMatches / candidateItemsList.length) * 6);
    }

    if (ageGroup && ageGroup !== 'all') {
      const ageMatches = candidateItemsList.filter(
        (it) => it.ageGroups && it.ageGroups.includes(ageGroup)
      ).length;
      adjustedScore += Math.round((ageMatches / candidateItemsList.length) * 6);

      // Cao niên / Trung niên preference for majestic Ngu Than
      if ((ageGroup === 'cao_nien' || ageGroup === 'trung_nien') && recipe.entitySlug === 'ngu-than') {
        adjustedScore += 8;
      }
      if (ageGroup === 'tre_em' && recipe.entitySlug === 'tu-than') {
        adjustedScore -= 5;
      }
    }

    adjustedScore = Math.min(Math.max(adjustedScore, 15), 95);

    const validation = validateOutfit(candidateItemIds, recipe.entitySlug);

    return {
      id: `candidate-${recipe.id}-${Date.now()}`,
      recipeId: recipe.id,
      recipeName: recipe.recipeName,
      entitySlug: recipe.entitySlug,
      items: candidateItemMap as Record<SlotType, CatalogItem>,
      itemIds: candidateItemIds,
      matchScore: adjustedScore,
      colorHarmony: scoring.colorHarmony,
      rationale: scoring.rationale,
      disclaimer: scoring.disclaimer,
      validation,
      preservedLockedItems: lockedItemIds.filter((id) => candidateItemIds.includes(id)),
    };
  });

  // Sort descending by matchScore
  candidates.sort((a, b) => b.matchScore - a.matchScore);
  return candidates;
}

// API: POST /api/recommend — Generate candidate outfits based on heuristic and user criteria
app.post('/api/recommend', (req, res) => {
  try {
    const parseResult = RecommendRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Tham số yêu cầu không hợp lệ.',
        details: parseResult.error.format(),
      });
    }

    const {
      event,
      entitySlug,
      style,
      preferredColor,
      lockedItemIds = [],
      currentItemIds = [],
      gender = 'all',
      ageGroup = 'thanh_nien',
    } = parseResult.data;

    // Check locked item IDs against catalog
    const unknownLockedIds = lockedItemIds.filter((id) => !catalogMap.has(id));
    if (unknownLockedIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Mã món đồ bị khóa không tồn tại trong Catalog: ${unknownLockedIds.join(', ')}`,
      });
    }

    const candidates = buildCandidateOutfits({
      event,
      entitySlug,
      style: normalizeStyleId(style),
      preferredColor,
      lockedItemIds,
      currentItemIds,
      gender,
      ageGroup,
    });

    res.json({
      success: true,
      total: candidates.length,
      candidates,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: POST /api/swap-item — Swap exactly one item while strictly preserving all other items
app.post('/api/swap-item', (req, res) => {
  try {
    const parseResult = SwapItemRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Dữ liệu đổi món không hợp lệ: cần currentItemIds (mảng), targetSlot (vị trí hợp lệ), newItemId (mã món).',
        details: parseResult.error.format(),
      });
    }

    const { currentItemIds, targetSlot, newItemId } = parseResult.data;

    // Strictly verify all current items exist and are available (NO silent dropping!)
    const unknownCurrentIds: string[] = [];
    const unavailableCurrentIds: string[] = [];
    for (const id of currentItemIds) {
      const item = catalogMap.get(id);
      if (!item) {
        unknownCurrentIds.push(id);
      } else if (!item.available) {
        unavailableCurrentIds.push(id);
      }
    }

    if (unknownCurrentIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Phát hiện mã món đồ không tồn tại trong Catalog: ${unknownCurrentIds.join(', ')}`,
      });
    }

    if (unavailableCurrentIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Phát hiện món đồ tạm ngưng khả dụng trong Catalog: ${unavailableCurrentIds.join(', ')}`,
      });
    }

    const newItem = catalogMap.get(newItemId);
    if (!newItem) {
      return res.status(400).json({
        success: false,
        error: `Không tìm thấy món đồ mới với ID: ${newItemId}`,
      });
    }

    if (!newItem.available) {
      return res.status(400).json({
        success: false,
        error: `Món đồ "${newItem.name}" hiện đang tạm khóa hoặc không khả dụng.`,
      });
    }

    if (newItem.slot !== targetSlot) {
      return res.status(400).json({
        success: false,
        error: `Món đồ "${newItem.name}" thuộc vị trí "${newItem.slot}", không thể gán vào vị trí "${targetSlot}".`,
      });
    }

    // 1. Identify items currently in other slots (PRESERVED 100%)
    const preservedItemIds: string[] = [];
    const preservedItemsMap: Record<string, CatalogItem> = {};

    for (const id of currentItemIds) {
      const item = catalogMap.get(id)!;
      if (item.slot !== targetSlot) {
        preservedItemIds.push(id);
        preservedItemsMap[item.slot] = item;
      }
    }

    // 2. Put the new item into the target slot
    preservedItemIds.push(newItem.id);
    preservedItemsMap[targetSlot] = newItem;

    // 3. Determine active entity from main item (or fallback)
    const mainItem = preservedItemsMap.main;
    if (!mainItem) {
      return res.status(400).json({
        success: false,
        error: 'Trang phục thiếu áo chính định hình phom dáng, không thể hoàn tất đổi món.',
      });
    }

    const activeEntity: EntitySlug =
      mainItem.entitySlug !== 'all' ? (mainItem.entitySlug as EntitySlug) : 'ao-dai';

    // Verify compatibility of new item with active entity
    if (newItem.entitySlug !== 'all' && newItem.entitySlug !== activeEntity) {
      return res.status(400).json({
        success: false,
        error: `Món đồ "${newItem.name}" chỉ dành cho nhóm ${newItem.entitySlug}, không tương thích với nhóm ${activeEntity}.`,
      });
    }

    // 4. Validate the resulting outfit
    const validation = validateOutfit(preservedItemIds, activeEntity);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: `Trang phục sau khi đổi không đạt cấu trúc: ${validation.errors.join('; ')}`,
        validation,
      });
    }

    res.json({
      success: true,
      updatedItemIds: preservedItemIds,
      updatedItems: preservedItemsMap,
      swappedSlot: targetSlot,
      swappedItem: newItem,
      validation,
      contextFindings: validation.findings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: POST /api/compare — Compare two outfits under the exact same evaluation criteria
app.post('/api/compare', (req, res) => {
  try {
    const parseResult = CompareRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Dữ liệu so sánh không hợp lệ: cần outfitA, outfitB có tên và danh sách mã món đồ.',
        details: parseResult.error.format(),
      });
    }

    const { outfitA, outfitB, criteria } = parseResult.data;

    const resolveSnapshot = (outfit: { name: string; entitySlug: EntitySlug; itemIds: string[] }) => {
      const itemsMap: Partial<Record<SlotType, CatalogItem>> = {};
      const missingItemIds: string[] = [];

      for (const id of outfit.itemIds) {
        const item = catalogMap.get(id);
        if (item && item.available) {
          itemsMap[item.slot] = item;
        } else {
          missingItemIds.push(id);
        }
      }

      const recipe = OUTFIT_RECIPES.find((r) => r.entitySlug === outfit.entitySlug) || OUTFIT_RECIPES[0];
      const itemsList = Object.values(itemsMap).filter(Boolean) as CatalogItem[];
      const scoring = calculateHeuristicScore(recipe, itemsList, criteria || {});
      const validation = validateOutfit(outfit.itemIds, outfit.entitySlug);
      const isComplete = validation.isValid && missingItemIds.length === 0;
      const finalScore = isComplete ? scoring.score : Math.min(scoring.score, 40);
      const finalRationale = isComplete
        ? scoring.rationale
        : `Bộ đồ chưa hoàn chỉnh hoặc có lỗi cấu trúc kỹ thuật: ${[...validation.errors, ...missingItemIds.map((id) => `Món không tìm thấy: ${id}`)].join('; ')}. Không chấm điểm hoàn chỉnh.`;

      return {
        name: outfit.name,
        entitySlug: outfit.entitySlug,
        items: itemsMap,
        missingItemIds,
        hasUnavailableOrMissing: missingItemIds.length > 0,
        isComplete,
        score: finalScore,
        colorHarmony: scoring.colorHarmony,
        rationale: finalRationale,
        validation,
      };
    };

    const evaluatedA = resolveSnapshot(outfitA);
    const evaluatedB = resolveSnapshot(outfitB);

    res.json({
      success: true,
      criteria: criteria || {},
      outfitA: evaluatedA,
      outfitB: evaluatedB,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: POST /api/inspiration-image — Photorealistic / Vector Mockup Inspiration with Scene Context
app.post('/api/inspiration-image', async (req, res) => {
  const clientIp =
    req.ip ||
    (typeof req.headers['x-forwarded-for'] === 'string'
      ? req.headers['x-forwarded-for'].split(',')[0].trim()
      : req.socket?.remoteAddress) ||
    '127.0.0.1';

  // 1. Rate Limiting & Concurrency Control
  const rateLimitCheck = checkImageGenRateLimit(clientIp);
  if (!rateLimitCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: rateLimitCheck.reason,
    });
  }

  try {
    // 2. Schema Validation
    const parsed = InspirationImageRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Dữ liệu yêu cầu tạo ảnh không hợp lệ: ' + parsed.error.issues.map((i) => i.message).join('; '),
      });
    }

    const { outfitItemIds, sceneId, characterPresetId, stylePreset, baseRevision } = parsed.data;

    // 3. Resolve Items & Validate Outfit
    const resolvedItems: CatalogItem[] = [];
    const missingIds: string[] = [];

    for (const id of outfitItemIds) {
      const item = catalogMap.get(id);
      if (item && item.available) {
        resolvedItems.push(item);
      } else {
        missingIds.push(id);
      }
    }

    if (missingIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Không tìm thấy các món đồ trong danh mục: ${missingIds.join(', ')}`,
      });
    }

    const mainItem = resolvedItems.find((i) => i.slot === 'main');
    if (!mainItem) {
      return res.status(400).json({
        success: false,
        error: 'Bộ phối thiếu áo chính (main coat/robe). Không thể tạo ảnh cảm hứng khi thiếu áo chính.',
      });
    }

    const targetSlug: EntitySlug = mainItem.entitySlug === 'all' ? 'ao-dai' : mainItem.entitySlug;
    const outfitValidation = validateOutfit(outfitItemIds, targetSlug);
    if (!outfitValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: `Bộ phối chưa đạt chuẩn cấu trúc văn hóa: ${outfitValidation.errors.join('; ')}`,
      });
    }

    // 4. Resolve Scene (Strict: reject unknown scene IDs, do not silently default to studio)
    const scene = SCENE_DEFINITIONS.find((s) => s.id === sceneId);
    if (!scene) {
      return res.status(400).json({
        success: false,
        error: `Mã bối cảnh "${sceneId}" không tồn tại. Các bối cảnh hợp lệ: ${SCENE_DEFINITIONS.map((s) => s.id).join(', ')}.`,
      });
    }

    // 5. Build Cultural & Aesthetic Prompt
    const innerItem = resolvedItems.find((i) => i.slot === 'inner');
    const lowerItem = resolvedItems.find((i) => i.slot === 'lower');
    const headwearItem = resolvedItems.find((i) => i.slot === 'headwear');
    const footwearItem = resolvedItems.find((i) => i.slot === 'footwear');
    const accessoryItem = resolvedItems.find((i) => i.slot === 'accessory');

    const promptSegments: string[] = [
      'Full-body editorial fashion photography of a young Vietnamese woman standing in an elegant pose',
    ];

    if (mainItem.entitySlug === 'ao-dai') {
      promptSegments.push(`wearing a Vietnamese Ao Dai tunic in ${mainItem.colorName || 'silk'}, featuring graceful raglan sleeves and side slits draping over trousers`);
    } else if (mainItem.entitySlug === 'ngu-than') {
      promptSegments.push(`wearing an authentic Vietnamese historic Ao Ngu Than (five-panel tunic) in ${mainItem.colorName || 'rich brocade'}, standing mandarin collar with 5 delicate traditional buttons along right lapel, loose straight silhouette`);
    } else if (mainItem.entitySlug === 'tu-than') {
      promptSegments.push(`wearing a traditional Vietnamese Ao Tu Than (four-panel flowing robe) in ${mainItem.colorName || 'fine silk'}, draped panels tied gracefully at the waist`);
    }

    if (innerItem) {
      promptSegments.push(`revealing a traditional halter-neck inner Ao Yem in ${innerItem.colorName} silk underneath with elegant curved neckline`);
    }

    if (lowerItem) {
      promptSegments.push(`paired with ${lowerItem.name.toLowerCase()} in ${lowerItem.colorName} flowing down to ankles`);
    }

    if (headwearItem) {
      promptSegments.push(`accessorized with traditional ${headwearItem.name.toLowerCase()}`);
    }

    if (footwearItem) {
      promptSegments.push(`wearing classic ${footwearItem.name.toLowerCase()}`);
    }

    if (accessoryItem) {
      promptSegments.push(`holding ${accessoryItem.name.toLowerCase()}`);
    }

    promptSegments.push(`set in ${scene.promptBackgroundDescription}`);
    promptSegments.push('soft natural editorial lighting, cinematic depth of field, high-end Vietnamese fashion magazine aesthetic, culturally respectful, 3:4 portrait aspect ratio');

    const finalPrompt = promptSegments.join(', ');

    // 6. Check Matched Curated Cultural Gallery using Strict Multi-Item Matching
    const galleryMatch = matchInspirationGallery(outfitItemIds, targetSlug, scene.id);

    const provider = process.env.IMAGE_PROVIDER || 'none';

    // 7. Deterministic Fingerprint Hash
    const sortedIds = [...outfitItemIds].sort().join(',');
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${sortedIds}:${scene.id}:${characterPresetId}:${stylePreset}:${provider}:v2`)
      .digest('hex')
      .substring(0, 16);

    // 8. Cache Lookup
    const cached = inspirationCache.get(fingerprint);
    if (cached) {
      return res.json({
        success: true,
        cached: true,
        data: cached,
      });
    }

    // 9. Process Result based on Provider
    // Mặc định an toàn: 'none' (Minh họa phối đồ + bối cảnh vector, không giả lập inference hoàn tất)
    const resultPayload: CachedInspirationResult = {
      fingerprint,
      source: 'mockup',
      status: 'mockup_ready',
      providerStatus: provider === 'none' ? 'not_configured' : 'unsupported',
      sceneId: scene.id,
      sceneName: scene.name,
      prompt: finalPrompt,
      disclaimer: 'Minh họa phối cảnh vector — Chi tiết phục trang hiển thị theo các món thực tế trong danh mục. Không phải ảnh chụp thực tế hay ảnh sinh bởi AI.',
      timestamp: new Date().toISOString(),
      provider,
      outfitSummary: {
        entitySlug: targetSlug,
        mainColor: mainItem.colorName,
        itemCount: resolvedItems.length,
        itemNames: resolvedItems.map((i) => i.name),
      },
      matchedGallery: galleryMatch
        ? {
            id: galleryMatch.entry.id,
            title: galleryMatch.entry.title,
            matchType: galleryMatch.matchType,
            differenceNote: galleryMatch.differenceNote,
            sourceAttribution: 'Tài liệu phác thảo tham khảo (Dự thảo)',
            paletteColors: galleryMatch.entry.paletteColors,
            assetStatus: galleryMatch.entry.assetStatus,
            reviewStatus: galleryMatch.entry.reviewStatus,
          }
        : undefined,
    };

    // Store in LRU Cache
    if (inspirationCache.size >= MAX_INSPIRATION_CACHE_ENTRIES) {
      const firstKey = inspirationCache.keys().next().value;
      if (firstKey) inspirationCache.delete(firstKey);
    }
    inspirationCache.set(fingerprint, resultPayload);

    return res.json({
      success: true,
      cached: false,
      data: resultPayload,
    });
  } catch (error: any) {
    console.error('[API Inspiration Image Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Lỗi xử lý tạo ảnh cảm hứng.',
    });
  } finally {
    releaseImageGenSlot(clientIp);
  }
});

// API: POST /api/chat — Dual-layer Gemini Assistant with Authoritative Tools
app.post('/api/chat', async (req, res) => {
  try {
    // 0. Enforce Rate Limiting (30 reqs/min per IP)
    const clientIp =
      req.ip ||
      (typeof req.headers['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : req.socket?.remoteAddress) ||
      '127.0.0.1';

    if (!checkChatRateLimit(clientIp)) {
      return res.status(429).json({
        success: false,
        error: 'Bạn đang gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng đợi 1 phút trước khi thử lại.',
        reply: 'Hệ thống đang tiếp nhận quá nhiều yêu cầu cùng lúc. Bạn vui lòng đợi ít phút nhé!',
      });
    }

    // 1. Validate payload using Zod
    const parseResult = ChatRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Dữ liệu yêu cầu không hợp lệ.',
        details: parseResult.error.format(),
      });
    }

    const {
      message,
      recentMessages = [],
      currentItemIds,
      event = 'KY_YEU',
      entitySlug,
      stylePreferences = [],
      preferredColor,
      lockedItemIds = [],
      outfitRevision,
      gender = 'all',
      ageGroup = 'thanh_nien',
    } = parseResult.data;

    // 2. Validate raw current item IDs against Catalog (Reject unknown or duplicate IDs immediately)
    const unknownCurrentIds = currentItemIds.filter((id) => !catalogMap.has(id));
    if (unknownCurrentIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Mã món đồ trong bộ trang phục không tồn tại trong Catalog: ${unknownCurrentIds.join(', ')}`,
      });
    }

    const uniqueCurrentIds = new Set(currentItemIds);
    if (uniqueCurrentIds.size !== currentItemIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Phát hiện mã món đồ bị trùng lặp trong bộ trang phục hiện tại.',
      });
    }

    const unknownLockedIds = lockedItemIds.filter((id) => !catalogMap.has(id));
    if (unknownLockedIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Mã món đồ bị khóa không tồn tại trong Catalog: ${unknownLockedIds.join(', ')}`,
      });
    }

    const currentItemsList = currentItemIds.map((id) => catalogMap.get(id)!);
    const mainItem = currentItemsList.find((i) => i.slot === 'main');
    if (!mainItem) {
      return res.status(400).json({
        success: false,
        error: 'Bộ trang phục hiện tại thiếu áo chính định hình phom dáng, không thể tiến hành tư vấn tạo hình.',
      });
    }

    const currentFingerprint = getOutfitFingerprint(currentItemIds);
    const activeEntity: EntitySlug =
      (mainItem.entitySlug !== 'all' ? mainItem.entitySlug : entitySlug) || entitySlug || 'ao-dai';

    let serverAction: OutfitAction | undefined = undefined;
    const turnActions: OutfitAction[] = [];
    let cultureEvidence: any = null;
    let aiStylistInsights: { aestheticVibe: string; stylingTip: string } | undefined = undefined;

    // Helper: Internal Tool Executor (Authority rests 100% with Server)
    const executeToolInternal = (toolName: string, rawArgs: Record<string, any>) => {
      if (toolName === 'swap_outfit_item') {
        const parseArgs = SwapOutfitItemArgsSchema.safeParse(rawArgs);
        if (!parseArgs.success) {
          return {
            success: false,
            reason: 'INVALID_ARGS',
            message: `Tham số đổi món không hợp lệ: ${parseArgs.error.issues.map((i) => i.message).join('; ')}`,
          };
        }

        const { targetSlot, desiredStyleOrColor } = parseArgs.data;

        // Check if slot or item in this slot is locked
        const currentSlotItem = currentItemsList.find((i) => i.slot === targetSlot);
        if (currentSlotItem && lockedItemIds.includes(currentSlotItem.id)) {
          return {
            success: false,
            reason: 'SLOT_LOCKED',
            message: `Món đồ "${currentSlotItem.name}" tại vị trí [${targetSlot}] đang bị người dùng khóa cố định. Không được phép tự ý thay thế.`,
          };
        }

        // Find available candidate replacements
        const candidates = CATALOG_ITEMS.filter(
          (item) =>
            item.slot === targetSlot &&
            item.available &&
            item.id !== currentSlotItem?.id &&
            (item.entitySlug === activeEntity || item.entitySlug === 'all')
        );

        if (candidates.length === 0) {
          return {
            success: false,
            reason: 'NO_CANDIDATES',
            message: `Hiện tại kho catalog chỉ có ${currentSlotItem ? `1 lựa chọn cho vị trí [${targetSlot}] ("${currentSlotItem.name}")` : `0 món khả dụng cho vị trí [${targetSlot}]`}. Đã hết món thay thế khác khả dụng cho nhóm ${EntityDisplayData[activeEntity]?.name || activeEntity}.`,
          };
        }

        // Rank candidates by desired style/color preference
        const targetQuery = (desiredStyleOrColor || '').toLowerCase();
        const ranked = [...candidates].sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;
          if (targetQuery) {
            if (a.name.toLowerCase().includes(targetQuery)) scoreA += 5;
            if (b.name.toLowerCase().includes(targetQuery)) scoreB += 5;
            if (a.colorName.toLowerCase().includes(targetQuery)) scoreA += 4;
            if (b.colorName.toLowerCase().includes(targetQuery)) scoreB += 4;
            if (a.styleTags.some((t) => targetQuery.includes(t.toLowerCase()))) scoreA += 3;
            if (b.styleTags.some((t) => targetQuery.includes(t.toLowerCase()))) scoreB += 3;
            if (targetQuery.includes('remix') && a.isModern) scoreA += 4;
            if (targetQuery.includes('remix') && b.isModern) scoreB += 4;
          }
          return scoreB - scoreA;
        });

        const chosenItem = ranked[0];

        // Construct candidate outfit: STRICTLY preserve all other slots
        const updatedItemIds: string[] = [];
        for (const item of currentItemsList) {
          if (item.slot !== targetSlot) {
            updatedItemIds.push(item.id);
          }
        }
        updatedItemIds.push(chosenItem.id);

        const validation = validateOutfit(updatedItemIds, activeEntity);
        if (!validation.isValid) {
          return {
            success: false,
            reason: 'INVALID_OUTFIT_RESULT',
            message: `Bộ trang phục sau thao tác không đạt cấu trúc hợp lệ: ${validation.errors.join('; ')}`,
          };
        }

        const action: OutfitAction = {
          type: 'SWAP_ITEM',
          label: `Thử đổi sang: ${chosenItem.name}`,
          targetSlot,
          newItemId: chosenItem.id,
          newItemName: chosenItem.name,
          baseOutfitRevision: currentFingerprint,
        };
        turnActions.push(action);

        return {
          success: true,
          swappedItem: {
            id: chosenItem.id,
            sku: chosenItem.sku,
            name: chosenItem.name,
            colorName: chosenItem.colorName,
            isModern: chosenItem.isModern,
            description: chosenItem.description,
          },
          preservedSlots: currentItemsList.filter((i) => i.slot !== targetSlot).map((i) => i.slot),
          findings: validation.findings,
        };
      }

      if (toolName === 'recommend_outfits') {
        const parseArgs = RecommendOutfitsArgsSchema.safeParse(rawArgs);
        if (!parseArgs.success) {
          return {
            success: false,
            reason: 'INVALID_ARGS',
            message: `Tham số gợi ý không hợp lệ: ${parseArgs.error.issues.map((i) => i.message).join('; ')}`,
          };
        }

        const targetEvent = parseArgs.data.event || event;
        const targetEntity = parseArgs.data.entitySlug || activeEntity;
        const targetStyle = parseArgs.data.stylePreference;
        const targetColor = parseArgs.data.preferredColor || preferredColor;

        const candidates = buildCandidateOutfits({
          event: targetEvent,
          entitySlug: targetEntity,
          style: targetStyle,
          preferredColor: targetColor,
          lockedItemIds,
          currentItemIds,
          gender,
          ageGroup,
        });

        if (candidates.length === 0) {
          return { success: false, message: 'Không tìm thấy công thức phù hợp với các ràng buộc.' };
        }

        const topCandidate = candidates[0];

        const action: OutfitAction = {
          type: 'APPLY_OUTFIT',
          label: `Áp dụng: ${topCandidate.recipeName}`,
          candidateItemIds: topCandidate.itemIds,
          baseOutfitRevision: currentFingerprint,
        };
        turnActions.push(action);

        return {
          success: true,
          recipeName: topCandidate.recipeName,
          entitySlug: topCandidate.entitySlug,
          matchScore: topCandidate.matchScore,
          colorHarmony: topCandidate.colorHarmony,
          rationale: topCandidate.rationale,
          items: Object.values(topCandidate.items).map((i) => ({
            slot: i.slot,
            name: i.name,
            colorName: i.colorName,
            isModern: i.isModern,
          })),
          preservedLockedItems: topCandidate.preservedLockedItems,
        };
      }

      if (toolName === 'get_culture_context') {
        const parseArgs = GetCultureContextArgsSchema.safeParse(rawArgs);
        if (!parseArgs.success) {
          return {
            success: false,
            reason: 'INVALID_ARGS',
            message: `Tham số văn hóa không hợp lệ: ${parseArgs.error.issues.map((i) => i.message).join('; ')}`,
          };
        }

        const targetSlug = parseArgs.data.entitySlug || activeEntity;
        const cultureData = CULTURE_CONTEXTS[targetSlug];
        if (!cultureData) {
          return { success: false, message: `Không tìm thấy ngữ cảnh văn hóa cho ${targetSlug}.` };
        }

        const verifiedClaim = VERIFIED_CULTURE_CLAIMS[targetSlug];
        cultureEvidence = {
          ...cultureData,
          claimId: verifiedClaim?.claimId || `claim-${targetSlug}`,
        } as any;

        return {
          success: true,
          claimId: verifiedClaim?.claimId || `claim-${targetSlug}`,
          title: cultureData.title,
          historicalEra: cultureData.historicalEra,
          referenceSource: cultureData.referenceSource,
          reviewStatus: cultureData.reviewStatus,
          sourcedFact: cultureData.sourcedFact,
          stylingNote: cultureData.stylingNote,
          caution: cultureData.caution,
        };
      }

      return { success: false, reason: 'UNKNOWN_TOOL', message: `Công cụ ${toolName} không nằm trong danh sách cho phép.` };
    };

    // 3. Dispatch to Gemini or Local Heuristic Fallback
    let reply = '';
    let source: 'gemini' | 'local_fallback' = 'local_fallback';

    const activeClient = mockAiClientForTesting || aiClient;

    if (activeClient) {
      let clientDisconnected = false;
      const abortController = new AbortController();

      // Reliable detection of client disconnect before response completion:
      // In Node.js/Express, req emits 'close' as soon as the request body is consumed (complete=true).
      // A genuine client abort/disconnect is signaled when res closes before writableEnded,
      // or when the underlying socket emits close/error before response completion.
      const onClientClose = () => {
        if (!res.writableEnded) {
          clientDisconnected = true;
          abortController.abort(new Error('CLIENT_CLOSED'));
        }
      };

      res.on('close', onClientClose);
      res.on('error', onClientClose);
      req.on('aborted', onClientClose);
      req.socket?.on('close', onClientClose);

      const deadlineMs = Number(process.env.GEMINI_DEADLINE_MS) || 30000;
      const timeoutId = setTimeout(() => {
        abortController.abort(new Error('GEMINI_TIMEOUT_DEADLINE'));
      }, deadlineMs);

      try {
        const currentSummary = currentItemsList
          .map((i) => `[${i.slot}] ${i.name} (màu: ${i.colorName}${lockedItemIds.includes(i.id) ? ' - ĐANG KHÓA CỐ ĐỊNH' : ''})`)
          .join('; ');

        // Sanitize client-controlled context strings
        const safeEvent = ['KY_YEU', 'LE_HOI_TRUONG', 'CHUP_ANH_NGHE_THUAT', 'DAO_PHO'].includes(event) ? event : 'KY_YEU';
        const safeStyle = (stylePreferences[0] || '').slice(0, 50);
        const safeColor = (preferredColor || '').slice(0, 30);
        const safeGender = gender === 'nam' ? 'Nam' : gender === 'nu' ? 'Nữ' : 'Tất cả / Chung';
        const safeAgeGroup =
          ageGroup === 'tre_em'
            ? 'Trẻ em (Dưới 12 tuổi)'
            : ageGroup === 'thanh_nien'
            ? 'Thanh thiếu niên / Gen Z (13 - 25 tuổi)'
            : ageGroup === 'trung_nien'
            ? 'Trung niên (26 - 55 tuổi)'
            : ageGroup === 'cao_nien'
            ? 'Cao niên / Người lớn tuổi (Trên 55 tuổi)'
            : 'Mọi độ tuổi';

        const systemInstruction = `Bạn là Trợ lý Thời trang Việt Phục Remix. Luôn trả lời bằng tiếng Việt thân thiện, tự nhiên, am hiểu thời trang và tôn trọng bản sắc văn hóa dân tộc.
BỐI CẢNH ỨNG DỤNG HIỆN TẠI (Server-authoritative):
- Đối tượng mặc: Giới tính [${safeGender}], Độ tuổi [${safeAgeGroup}]
- Nhóm trang phục: ${EntityDisplayData[activeEntity]?.name || activeEntity} (${activeEntity})
- Bối cảnh sự kiện: ${safeEvent}
- Phong cách ưu tiên: ${safeStyle || 'Không ràng buộc'}
- Tông màu mong muốn: ${safeColor || 'Không ràng buộc'}
- Các món đang mặc: ${currentSummary || 'Chưa trang bị'}
- Vị trí đang khóa: ${lockedItemIds.length > 0 ? lockedItemIds.map((id) => catalogMap.get(id)?.name).join(', ') : 'Không có vị trí nào bị khóa'}

NHIỆM VỤ ĐẶC TRƯNG — STYLING NARRATIVE & CULTURAL RATIONALE (LẬP LUẬN TẠO PHONG CÁCH):
Khi người dùng hỏi ý kiến về trang phục hoặc yêu cầu điều chỉnh/đổi món, bạn KHÔNG chỉ đưa câu xác nhận khô khan mà BẮT BUỘC phải thực hiện:
1. Phân tích sự hài hòa giữa sắc độ trang phục và bối cảnh sự kiện (ví dụ: lý do phối áo ngũ thân cẩm thạch trầm với sneaker canvas/loafer tạo tinh thần "Tân cổ giao duyên" đúng gu Gen Z nhưng vẫn giữ cốt cách đĩnh đạc; hoặc áo dài hoa nhí pastel tạo vẻ tươi trẻ dạo phố).
2. Đưa ra lời khuyên tế nhị, thực tế về cách tạo dáng (pose), cách cầm quạt/túi khi chụp kỷ yếu hoặc đi sự kiện trường.
3. Ở cuối câu trả lời, BẮT BUỘC đính kèm khối thông tin phong cách theo đúng định dạng sau:
[STYLIST_INSIGHTS]
Vibe: <Tên phong thái súc tích 2-4 từ, ví dụ: 'Thanh tân học đường' | 'Trọng thể cổ phong' | 'Tân cổ giao duyên' | 'Duyên dáng Kinh Bắc'>
Tip: <Lời khuyên cụ thể 1-2 câu về tư thế pose dáng chụp ảnh, cách cầm quạt hoặc xách túi gấm thực tế>
[/STYLIST_INSIGHTS]

QUY TẮC BẮT BUỘC:
1. Khi người dùng muốn đổi món đồ, tìm gợi ý hoặc hỏi về trang phục/văn hóa, BẮT BUỘC phải gọi công cụ (tool) tương ứng (swap_outfit_item, recommend_outfits, get_culture_context) để lấy dữ liệu thực tế.
2. Tuyệt đối không tự bịa ID sản phẩm, mã SKU, đường link ngoài hay kiến thức lịch sử ngoài dữ liệu tool trả về.
3. swap_outfit_item chỉ đổi đúng 1 món tại slot yêu cầu, tuyệt đối không tự ý đổi áo chính nếu người dùng chỉ hỏi đổi giày/phụ kiện. Nếu slot bị khóa (SLOT_LOCKED), giải thích lịch sự.
4. Lời khuyên phối màu hiện đại là gợi ý styling sáng tạo, không tuyên bố bộ đồ là "chuẩn xác lịch sử tuyệt đối".
5. Phù hợp độ tuổi và giới tính:
   - Nếu đối tượng là 'cao_nien' hoặc 'trung_nien', ưu tiên ngôn từ trang trọng, mực thước, khuyên chọn tông màu chàm, nhung gụ, cổ phong lịch thiệp, hài thêu hoặc guốc mộc, KHÔNG khuyên dùng sneaker phá cách trừ khi người dùng yêu cầu rõ ràng.
   - Nếu đối tượng là 'nam', ưu tiên áo ngũ thân tay chẽn hoặc áo dài nam phom đứng đắn, khăn vấn chữ Nhất hoặc topknot búi cao nho nhã.
   - Nếu đối tượng là 'tre_em', ưu tiên màu sắc tươi sáng, trang phục gọn gàng thoải mái vận động.
6. Lời thoại tự nhiên, truyền cảm hứng, ngắn gọn và giàu tính thẩm mỹ.`;

        // Format recent messages for multi-turn history
        const contents: any[] = [];
        for (const msg of recentMessages.slice(-6)) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.text }],
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        // Tool Loop: Max 3 model calls with tools, total model calls <= 4, max 6 tool executions
        let modelCallCount = 0;
        let toolExecCount = 0;
        let finalResponse: any = null;

        while (modelCallCount < 4) {
          modelCallCount++;
          const isLastCall = modelCallCount >= 3 || toolExecCount >= 6;

          const config: any = {
            systemInstruction,
            abortSignal: abortController.signal,
          };

          if (!isLastCall) {
            config.tools = [
              {
                functionDeclarations: [
                  recommendOutfitsDeclaration,
                  swapOutfitItemDeclaration,
                  getCultureContextDeclaration,
                ],
              },
            ];
          }

          finalResponse = (await activeClient.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config,
          })) as any;

          const candidate = finalResponse?.candidates?.[0];
          const functionCalls = finalResponse?.functionCalls;

          if (functionCalls && functionCalls.length > 0 && !isLastCall) {
            // Append model turn
            if (candidate?.content) {
              contents.push(candidate.content);
            } else {
              contents.push({
                role: 'model',
                parts: functionCalls.map((call: any) => ({
                  functionCall: {
                    name: call.name,
                    args: call.args,
                    ...(call.id ? { id: call.id } : {}),
                  },
                })),
              });
            }

            const toolResponseParts: any[] = [];
            for (const call of functionCalls) {
              toolExecCount++;
              if (toolExecCount > 6) {
                toolResponseParts.push({
                  functionResponse: {
                    name: call.name,
                    response: { success: false, message: 'Đã đạt giới hạn tối đa 6 lượt thực thi công cụ cho một yêu cầu.' },
                    ...(call.id ? { id: call.id } : {}),
                  },
                });
                continue;
              }

              const result = executeToolInternal(call.name, call.args || {});
              toolResponseParts.push({
                functionResponse: {
                  name: call.name,
                  response: result,
                  ...(call.id ? { id: call.id } : {}),
                },
              });
            }

            // Append tool responses turn (Role MUST be 'user' in generateContent)
            contents.push({
              role: 'user',
              parts: toolResponseParts,
            });
          } else {
            // Final narrative received
            break;
          }
        }

        reply = finalResponse?.text || '';
        if (reply) {
          source = 'gemini';
          // Extract structured Stylist Insights if generated by Gemini
          const insightsMatch = reply.match(/\[STYLIST_INSIGHTS\]\s*(?:Vibe|Phong thái)?:\s*([^\n\r]+)\s*(?:Tip|Mẹo phối|Tạo dáng)?:\s*([\s\S]*?)\[\/STYLIST_INSIGHTS\]/i);
          if (insightsMatch) {
            aiStylistInsights = {
              aestheticVibe: insightsMatch[1].trim(),
              stylingTip: insightsMatch[2].trim(),
            };
            reply = reply.replace(/\[STYLIST_INSIGHTS\][\s\S]*?\[\/STYLIST_INSIGHTS\]/i, '').trim();
          }

          // Resolve multiple actions if any occurred in the turn
          if (turnActions.length === 1) {
            serverAction = turnActions[0];
          } else if (turnActions.length > 1) {
            // Resolve to the latest explicit action that aligns with the turn's progressive refinement
            serverAction = turnActions[turnActions.length - 1];
          }
        } else {
          // If model produced no narrative, reset action to prevent stale proposal
          serverAction = undefined;
        }
      } catch (geminiError: any) {
        // Check if the abort was caused by client disconnection or socket closure
        const isClientAbort =
          clientDisconnected ||
          (abortController.signal.aborted && abortController.signal.reason?.message === 'CLIENT_CLOSED') ||
          res.writableEnded ||
          res.destroyed ||
          !req.socket?.writable;

        if (isClientAbort) {
          // Client closed connection: clean up and return immediately without running fallback or writing to dead socket
          return;
        }

        console.warn('[Gemini Assistant] Lỗi khi gọi Gemini API, chuyển sang Local Fallback Engine:', geminiError?.message || geminiError);
        source = 'local_fallback';
        serverAction = undefined;
        turnActions.length = 0; // Prevent carrying any dangling action from a failed multi-turn call
      } finally {
        clearTimeout(timeoutId);
        res.off('close', onClientClose);
        res.off('error', onClientClose);
        req.off('aborted', onClientClose);
        req.socket?.off('close', onClientClose);
      }

      // If client closed connection while processing, do not proceed with fallback or response
      if (clientDisconnected || res.writableEnded || res.destroyed || !req.socket?.writable) {
        return;
      }
    }

    // Local Fallback Reasoning if Gemini unavailable, blocked, or failed
    if (!reply) {
      const msgLower = message.toLowerCase();

      // Check if message is a question seeking alternatives (e.g. "Có đôi giày khác không?", "Có mẫu nào khác không?")
      // Do NOT treat "có ... không" as a negation!
      const isAlternativeQuestion =
        /(?:có|còn|xem|tìm|thử)\s+.*(?:khác|nào|gì|sao|thêm)\s*(?:không|ko|\?)/i.test(msgLower) ||
        /^(?:có|còn)\s+.*(?:không|ko|\?)$/i.test(msgLower) ||
        /(?:có\s+đôi|có\s+mẫu|có\s+chiếc|có\s+món|có\s+áo|có\s+quần|có\s+giày|có\s+nón|có\s+phụ\s+kiện)\s+.*(?:khác|mới)/i.test(msgLower);

      // Check explicit negation (e.g. "không đổi giày nhé", "đừng đổi giày", "chớ thay giày", "giữ nguyên")
      const isExplicitNegation =
        !isAlternativeQuestion &&
        (/(?:không|đừng|chớ|chẳng|ko|thôi)\s+(?:cần\s+|muốn\s+|nên\s+)?(?:đổi|thay)/i.test(msgLower) ||
          /(?:không|đừng|chớ|chẳng|ko)\s+(?:đổi|thay)\s+(?:món|áo|quần|váy|yếm|giày|hài|guốc|nón|mũ|khăn|phụ\s+kiện|gì)/i.test(msgLower) ||
          /(?:giữ\s+nguyên|không\s+thay\s+đổi|đừng\s+thay\s+đổi)/i.test(msgLower) ||
          /(?:không\s+đổi|đừng\s+đổi|chớ\s+đổi|không\s+thay|đừng\s+thay|chớ\s+thay)/i.test(msgLower));

      if (isExplicitNegation) {
        serverAction = undefined;
        reply = `[Trợ lý Cục bộ]: Đã ghi nhận! Tôi sẽ giữ nguyên trang phục hiện tại theo ý bạn, không thực hiện thao tác đổi món nào.`;
      }
      // 1. Cultural question (Never swap!)
      else if (
        msgLower.includes('văn hóa') ||
        msgLower.includes('nguồn gốc') ||
        msgLower.includes('lịch sử') ||
        msgLower.includes('ý nghĩa') ||
        msgLower.includes('sự tích') ||
        msgLower.includes('tại sao')
      ) {
        // Detect if user asks explicitly about another entity than current outfit
        let targetCultureSlug: EntitySlug = activeEntity;
        if (msgLower.includes('tứ thân') || msgLower.includes('tu than')) {
          targetCultureSlug = 'tu-than';
        } else if (msgLower.includes('ngũ thân') || msgLower.includes('ngu thân')) {
          targetCultureSlug = 'ngu-than';
        } else if (msgLower.includes('áo dài') || msgLower.includes('ao dai')) {
          targetCultureSlug = 'ao-dai';
        }

        const result = executeToolInternal('get_culture_context', { entitySlug: targetCultureSlug });
        if (result.success) {
          reply = `[Trợ lý Cục bộ]: Về trang phục ${result.title} (${result.historicalEra}): ${result.sourcedFact}. Nguồn tư liệu: ${result.referenceSource}.`;
        } else {
          reply = '[Trợ lý Cục bộ]: Dữ liệu văn hóa cho nhóm áo này đang được đối chiếu từ tài liệu Ngàn năm áo mũ và các nguồn sử liệu.';
        }
      }
      // 2. Footwear Swap / Question
      else if (
        msgLower.includes('giày') ||
        msgLower.includes('sneaker') ||
        msgLower.includes('hài') ||
        msgLower.includes('guốc')
      ) {
        const wantsModern = msgLower.includes('trẻ trung') || msgLower.includes('năng động') || msgLower.includes('remix') || msgLower.includes('sneaker');
        const result = executeToolInternal('swap_outfit_item', {
          targetSlot: 'footwear',
          desiredStyleOrColor: wantsModern ? 'sneaker remix trẻ trung' : message,
        });

        if (result.success && result.swappedItem) {
          serverAction = turnActions[turnActions.length - 1];
          const isModern = result.swappedItem.isModern;
          reply = `[Trợ lý Cục bộ]: Tôi gợi ý bạn thử "${result.swappedItem.name}" (${result.swappedItem.colorName})${
            isModern ? ' mang phong cách cách tân (Remix) trẻ trung' : ' mang phong cách thanh lịch truyền thống'
          }. Các vị trí còn lại trên trang phục được giữ nguyên 100%. Bạn có thể nhấn nút bên dưới để áp dụng!`;
        } else {
          serverAction = undefined;
          reply = `[Trợ lý Cục bộ]: ${result.message || 'Hiện chưa tìm thấy giày/hài thay thế phù hợp trong catalog.'}`;
        }
      }
      // 3. Headwear Swap
      else if (
        msgLower.includes('nón') ||
        msgLower.includes('mũ') ||
        msgLower.includes('khăn')
      ) {
        const result = executeToolInternal('swap_outfit_item', {
          targetSlot: 'headwear',
          desiredStyleOrColor: message,
        });

        if (result.success && result.swappedItem) {
          serverAction = turnActions[turnActions.length - 1];
          reply = `[Trợ lý Cục bộ]: Gợi ý cho bạn: "${result.swappedItem.name}". Món này phù hợp với phong thái ${EntityDisplayData[activeEntity]?.name || activeEntity}, giữ nguyên các món khác. Bấm nút bên dưới để áp dụng!`;
        } else {
          serverAction = undefined;
          reply = `[Trợ lý Cục bộ]: ${result.message || 'Hiện chưa tìm thấy nón/khăn thay thế phù hợp trong catalog.'}`;
        }
      }
      // 4. Accessory Swap
      else if (
        msgLower.includes('phụ kiện') ||
        msgLower.includes('quạt') ||
        msgLower.includes('túi') ||
        msgLower.includes('kiềng')
      ) {
        const result = executeToolInternal('swap_outfit_item', {
          targetSlot: 'accessory',
          desiredStyleOrColor: message,
        });

        if (result.success && result.swappedItem) {
          serverAction = turnActions[turnActions.length - 1];
          reply = `[Trợ lý Cục bộ]: Tôi gợi ý bạn thêm "${result.swappedItem.name}". Món này tạo điểm nhấn tinh tế khi tạo dáng chụp ảnh. Hãy bấm xác nhận bên dưới nếu bạn thích nhé!`;
        } else {
          serverAction = undefined;
          reply = `[Trợ lý Cục bộ]: ${result.message || 'Hiện chưa tìm thấy phụ kiện thay thế phù hợp trong catalog.'}`;
        }
      }
      // 5. Outfit Recommendation
      else if (msgLower.includes('gợi ý') || msgLower.includes('bộ khác') || msgLower.includes('phối bộ')) {
        const result = executeToolInternal('recommend_outfits', {
          event,
          entitySlug: activeEntity,
          stylePreference: stylePreferences[0],
          preferredColor,
        });

        if (result.success) {
          serverAction = turnActions[turnActions.length - 1];
          reply = `[Trợ lý Cục bộ]: Dựa trên bối cảnh ${event} và nhóm ${EntityDisplayData[activeEntity]?.name || activeEntity}, tôi gợi ý công thức "${result.recipeName}" đạt ${result.matchScore}% độ khớp tiêu chí. Hòa sắc: ${result.colorHarmony}.`;
        } else {
          serverAction = undefined;
          reply = `[Trợ lý Cục bộ]: ${result.message || 'Không tìm thấy bộ phối phù hợp.'}`;
        }
      }
      // 6. Default greeting
      else {
        serverAction = undefined;
        reply = `[Trợ lý Cục bộ]: Xin chào! Tôi là Trợ lý Thời trang Việt Phục Remix (chế độ Cục bộ). Bạn có thể yêu cầu tôi đổi giày/hài năng động hơn, đổi nón lá, thêm quạt cầm tay hoặc hỏi về câu chuyện văn hóa của bộ ${EntityDisplayData[activeEntity]?.name || activeEntity} đang mặc nhé!`;
      }
    }

    if (res.writableEnded || res.destroyed || !req.socket?.writable) {
      return;
    }

    // Contextual Stylist Insights Fallback if not produced by model or in fallback mode
    if (!aiStylistInsights) {
      const hasModernFootwear = currentItemsList.some((i) => i.slot === 'footwear' && i.isModern);
      if (activeEntity === 'ao-dai') {
        aiStylistInsights = {
          aestheticVibe: hasModernFootwear ? 'Tân Cổ Giao Duyên (Áo Dài Remix)' : 'Thanh Tân Học Đường',
          stylingTip: 'Khi chụp kỷ yếu, đứng nghiêng góc 45 độ, một tay cầm nón lá hoặc đóa sen ngang ngực, tay kia khẽ nâng nhẹ tà áo sau để tạo độ bay tự nhiên.',
        };
      } else if (activeEntity === 'ngu-than') {
        aiStylistInsights = {
          aestheticVibe: hasModernFootwear ? 'Tân Cổ Giao Duyên (Ngũ Thân Remix)' : 'Trọng Thể Cổ Phong',
          stylingTip: 'Giữ phong thái đĩnh đạc, hai tay chắp nhẹ phía trước hoặc cầm quạt xếp khép hờ ngang thắt lưng để tôn trọn phom áo năm thân và hàng khuy đồng vương giả.',
        };
      } else {
        aiStylistInsights = {
          aestheticVibe: 'Duyên Dáng Kinh Bắc',
          stylingTip: 'Cầm nghiêng nón quai thao bên hông, bước chân nhẹ nhàng khoan thai để tà áo và dải yếm lụa vàng bay mềm mại theo từng nhịp chuyển động.',
        };
      }
    }

    res.json({
      success: true,
      reply,
      action: serverAction,
      source,
      evidence: cultureEvidence
        ? {
            claimId: (cultureEvidence as any).claimId || `claim-${cultureEvidence.entitySlug}`,
            entitySlug: cultureEvidence.entitySlug,
            title: cultureEvidence.title,
            historicalEra: cultureEvidence.historicalEra,
            referenceSource: cultureEvidence.referenceSource,
            reviewStatus: cultureEvidence.reviewStatus,
            sourcedFact: cultureEvidence.sourcedFact,
            stylingNote: cultureEvidence.stylingNote,
            caution: cultureEvidence.caution,
            isMock: Boolean(mockAiClientForTesting),
          }
        : undefined,
      aiStylistInsights,
    });
  } catch (error: any) {
    if (res.writableEnded || res.destroyed || !req.socket?.writable) {
      return;
    }
    console.error('[API Chat Error]:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi xử lý yêu cầu hội thoại.',
      reply: 'Hệ thống tạm thời bận. Bạn vẫn có thể tiếp tục phối đồ thủ công bằng cách bấm trực tiếp vào từng thẻ món đồ trên bảng điều khiển!',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Việt Phục Remix] Server started at http://0.0.0.0:${PORT}`);
  });
}

// Don't auto-start server when imported by tests
const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectExecution && process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, startServer };
