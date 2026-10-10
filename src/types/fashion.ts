import { z } from 'zod';

export type SlotType = 'main' | 'lower' | 'inner' | 'headwear' | 'footwear' | 'accessory';
export type EntitySlug = 'ao-dai' | 'ngu-than' | 'tu-than';
export type EventType = 'KY_YEU' | 'LE_HOI_TRUONG' | 'CHUP_ANH_NGHE_THUAT' | 'DAO_PHO';
export type ModernLevel = 'TRADITIONAL' | 'BALANCED' | 'REMIX';

export type GenderType = 'all' | 'nam' | 'nu';
export type AgeGroupType = 'all' | 'tre_em' | 'thanh_nien' | 'trung_nien' | 'cao_nien';

export const GENDER_OPTIONS = [
  { id: 'all', vi: 'Tất cả' },
  { id: 'nu', vi: 'Nữ' },
  { id: 'nam', vi: 'Nam' },
] as const;

export const AGE_GROUP_OPTIONS = [
  { id: 'all', vi: 'Mọi độ tuổi' },
  { id: 'tre_em', vi: 'Trẻ em (Dưới 12 tuổi)' },
  { id: 'thanh_nien', vi: 'Thanh thiếu niên / Gen Z (13 - 25)' },
  { id: 'trung_nien', vi: 'Trung niên (26 - 55)' },
  { id: 'cao_nien', vi: 'Cao niên / Người lớn tuổi (Trên 55)' },
] as const;

export const SlotLabels: Record<SlotType, { vi: string; requiredDescription: string }> = {
  main: { vi: 'Áo chính', requiredDescription: 'Bắt buộc chọn 1 áo chính định hình phom dáng' },
  lower: { vi: 'Quần / Váy', requiredDescription: 'Phần mặc dưới đồng bộ (bắt buộc: quần lụa/váy đầm)' },
  inner: { vi: 'Áo lót / Yếm', requiredDescription: 'Yếm bên trong (bắt buộc với Tứ thân)' },
  headwear: { vi: 'Nón / Khăn vấn', requiredDescription: 'Khăn vấn, nón lá hoặc nón quai thao (Tùy chọn)' },
  footwear: { vi: 'Giày / Hài / Guốc', requiredDescription: 'Bắt buộc: hài thêu, guốc mộc truyền thống hoặc sneaker' },
  accessory: { vi: 'Phụ kiện cầm tay', requiredDescription: 'Quạt trầm, túi cói, kiềng bạc (Tùy chọn)' },
};

export const STYLE_OPTIONS = [
  { id: 'all', vi: 'Tất cả phong cách' },
  { id: 'truyen-thong', vi: 'Truyền thống thuần chất' },
  { id: 'remix', vi: 'Remix cách tân trẻ trung' },
  { id: 'thanh-lich', vi: 'Thanh lịch học đường' },
  { id: 'trang-nghiem', vi: 'Trang trọng cổ phong' },
  { id: 'dan-gian', vi: 'Dân gian mộc mạc' },
] as const;

export type StyleId = typeof STYLE_OPTIONS[number]['id'];

export const COLOR_OPTIONS = [
  { id: '', vi: 'Tất cả bảng màu' },
  { id: 'trang', vi: 'Bạch ngọc / Trắng kem' },
  { id: 'xanh', vi: 'Cẩm thạch / Lam sẫm' },
  { id: 'hong', vi: 'Hồng phấn pastel (Remix)' },
  { id: 'vang', vi: 'Hoàng yến / Vàng hổ phách' },
  { id: 'nau', vi: 'Nâu sồng mộc mạc' },
  { id: 'do', vi: 'Đỏ mận / Đỏ thắm' },
] as const;

export function normalizeStyleId(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim().toLowerCase();
  if (trimmed === 'truyền thống' || trimmed === 'truyen-thong' || trimmed === 'truyenthong') return 'truyen-thong';
  if (trimmed === 'remix' || trimmed === 'cách tân' || trimmed === 'tre-trung') return 'remix';
  if (trimmed === 'thanh lịch' || trimmed === 'thanh-lich') return 'thanh-lich';
  if (trimmed === 'trang trọng' || trimmed === 'trang-nghiem' || trimmed === 'cổ phong') return 'trang-nghiem';
  if (trimmed === 'dân gian' || trimmed === 'dan-gian') return 'dan-gian';
  return trimmed;
}

export const EntityDisplayData: Record<EntitySlug, {
  name: string;
  tagline: string;
  badge: string;
  era: string;
  themeColor: string;
  accentBorder: string;
}> = {
  'ao-dai': {
    name: 'Áo Dài Học Đường',
    tagline: 'Thướt tha, thanh lịch, biểu tượng quen thuộc của thời áo trắng',
    badge: 'Nữ sinh & Kỷ yếu',
    era: 'Thế kỷ XX – Đương đại',
    themeColor: 'from-amber-900/40 via-stone-900 to-stone-950',
    accentBorder: 'border-amber-500/40',
  },
  'ngu-than': {
    name: 'Áo Ngũ Thân Tay Chẽn',
    tagline: 'Kín đáo, đĩnh đạc, chuẩn mực cổ phục cung đình & nho gia',
    badge: 'Lịch thiệp & Trang nghiêm',
    era: 'Thời Nguyễn (TK XVIII – XIX)',
    themeColor: 'from-emerald-950/40 via-stone-900 to-stone-950',
    accentBorder: 'border-emerald-500/40',
  },
  'tu-than': {
    name: 'Áo Tứ Thân Kinh Bắc',
    tagline: 'Duyên dáng, đậm hồn dân ca quan họ và lễ hội mùa xuân',
    badge: 'Dân gian & Nghệ thuật',
    era: 'Đồng bằng Bắc Bộ cổ truyền',
    themeColor: 'from-rose-950/40 via-stone-900 to-stone-950',
    accentBorder: 'border-rose-500/40',
  },
};

export const CatalogItemSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  entitySlug: z.enum(['ao-dai', 'ngu-than', 'tu-than', 'all']),
  slot: z.enum(['main', 'lower', 'inner', 'headwear', 'footwear', 'accessory']),
  colorId: z.string(),
  colorName: z.string(),
  hexColor: z.string(),
  styleTags: z.array(z.string()),
  eventTags: z.array(z.string()),
  isModern: z.boolean(),
  renderVariant: z.string(),
  description: z.string(),
  available: z.boolean(),
  genderSuitability: z.enum(['nam', 'nu', 'unisex']).default('unisex'),
  ageGroups: z.array(z.enum(['tre_em', 'thanh_nien', 'trung_nien', 'cao_nien'])).default(['thanh_nien', 'trung_nien']),
});

export type CatalogItem = z.infer<typeof CatalogItemSchema>;

export const CultureContextSchema = z.object({
  entitySlug: z.enum(['ao-dai', 'ngu-than', 'tu-than']),
  title: z.string(),
  historicalEra: z.string(),
  referenceSource: z.string(),
  reviewStatus: z.enum(['REVIEWED', 'NEEDS_REVIEW']),
  sourcedFact: z.string(),
  stylingNote: z.string(),
  caution: z.string(),
});

export type CultureContext = z.infer<typeof CultureContextSchema>;

export const OutfitRecipeSchema = z.object({
  id: z.string(),
  recipeName: z.string(),
  entitySlug: z.enum(['ao-dai', 'ngu-than', 'tu-than']),
  requiredSlots: z.array(z.enum(['main', 'lower', 'inner', 'headwear', 'footwear', 'accessory'])),
  optionalSlots: z.array(z.enum(['main', 'lower', 'inner', 'headwear', 'footwear', 'accessory'])),
  defaultItemIds: z.record(z.string(), z.string()),
  description: z.string(),
  matchScore: z.number().min(0).max(100),
  colorHarmony: z.string(),
  items: z.record(z.string(), CatalogItemSchema).optional(),
  culture: CultureContextSchema.optional(),
});

export type OutfitRecipe = z.infer<typeof OutfitRecipeSchema>;

export interface CurrentOutfitState {
  recipeId: string;
  entitySlug: EntitySlug;
  items: Partial<Record<SlotType, CatalogItem>>;
  lockedSlots: SlotType[];
  versionHash: string;
}

export interface OutfitAction {
  type: 'SWAP_ITEM' | 'APPLY_OUTFIT';
  label: string;
  targetSlot?: SlotType;
  newItemId?: string;
  newItemName?: string;
  candidateItemIds?: string[];
  baseOutfitRevision: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: OutfitAction;
  source?: 'gemini' | 'local_fallback';
  evidence?: {
    claimId?: string;
    entitySlug: EntitySlug;
    title: string;
    historicalEra: string;
    referenceSource: string;
    reviewStatus: string;
    sourcedFact: string;
    stylingNote: string;
    caution: string;
    isMock?: boolean;
  };
  aiStylistInsights?: {
    aestheticVibe: string;
    stylingTip: string;
  };
}

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  text: z.string().max(2000),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  recentMessages: z.array(ChatMessageSchema).max(10).optional(),
  currentItemIds: z.array(z.string()),
  event: z.string().optional(),
  entitySlug: z.enum(['ao-dai', 'ngu-than', 'tu-than']).optional(),
  stylePreferences: z.array(z.string()).optional(),
  preferredColor: z.string().optional(),
  lockedItemIds: z.array(z.string()).optional(),
  outfitRevision: z.string().optional(),
  gender: z.enum(['all', 'nam', 'nu']).optional(),
  ageGroup: z.enum(['all', 'tre_em', 'thanh_nien', 'trung_nien', 'cao_nien']).optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const RecommendRequestSchema = z.object({
  event: z.string().optional(),
  entitySlug: z.enum(['ao-dai', 'ngu-than', 'tu-than']).optional(),
  style: z.string().optional(),
  preferredColor: z.string().optional(),
  lockedItemIds: z.array(z.string()).optional(),
  currentItemIds: z.array(z.string()).optional(),
  gender: z.enum(['all', 'nam', 'nu']).optional(),
  ageGroup: z.enum(['all', 'tre_em', 'thanh_nien', 'trung_nien', 'cao_nien']).optional(),
});

export type RecommendRequest = z.infer<typeof RecommendRequestSchema>;

