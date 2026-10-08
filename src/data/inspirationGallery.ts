export interface InspirationGalleryEntry {
  id: string;
  title: string;
  entitySlug: 'ao-dai' | 'tu-than' | 'ngu-than';
  matchedItemIds: string[];
  sceneId: string;
  assetStatus: 'ASSET_NEEDED' | 'DRAFT' | 'NEEDS_REVIEW';
  reviewStatus: 'DRAFT' | 'NEEDS_REVIEW';
  disclaimer: string;
  aestheticPromptSummary: string;
  paletteColors: string[];
  backdropGradient: string;
}

export interface GalleryMatchResult {
  entry: InspirationGalleryEntry;
  matchType: 'exact' | 'similar';
  differenceNote?: string;
}

/**
 * Danh mục phác thảo cảm hứng văn hóa và bối cảnh (Draft Reference Gallery).
 * LƯU Ý TRUNG THỰC (ĐỢT 03):
 * - Dự án chưa có file ảnh chụp/raster thật trong kho lưu trữ, do đó toàn bộ bản ghi
 *   được gắn nhãn assetStatus = 'ASSET_NEEDED' và reviewStatus = 'DRAFT' hoặc 'NEEDS_REVIEW'.
 * - Không bịa đặt chứng nhận 'verified_cultural_editorial' hay người duyệt giả định.
 */
export const INSPIRATION_GALLERY: InspirationGalleryEntry[] = [
  {
    id: 'insp-aodai-school-white',
    title: 'Phác thảo Áo Dài Trắng Nữ Sinh Sân Trường',
    entitySlug: 'ao-dai',
    matchedItemIds: [
      'item-main-aodai-trang',
      'item-lower-quan-lua-trang',
      'item-foot-guoc-moc-quai-nhung',
    ],
    sceneId: 'scene-school',
    assetStatus: 'ASSET_NEEDED',
    reviewStatus: 'DRAFT',
    disclaimer: 'Bản phác thảo tham khảo (Dự thảo / Cần bổ sung ảnh thực tế) — Không phải ảnh chụp hay phục dựng bảo tàng.',
    aestheticPromptSummary: 'Nữ sinh trong tà áo dài trắng lụa Hà Đông cổ cao kín đáo, quần lụa trắng, guốc mộc mộc mạc bên hành lang trường cổ kính ngập nắng.',
    paletteColors: ['#faf9f6', '#ffffff', '#e2e8f0', '#d97706'],
    backdropGradient: 'from-amber-900/30 to-stone-900/80',
  },
  {
    id: 'insp-aodai-street-pink',
    title: 'Phác thảo Áo Dài Cách Tân Hồng Phấn Dạo Phố',
    entitySlug: 'ao-dai',
    matchedItemIds: [
      'item-main-aodai-hong-dao',
      'item-lower-quan-lua-trang',
      'item-acc-tui-coi-mini',
    ],
    sceneId: 'scene-street',
    assetStatus: 'ASSET_NEEDED',
    reviewStatus: 'DRAFT',
    disclaimer: 'Gợi ý phối màu hiện đại (Dự thảo) — Chi tiết phụ kiện có thể chênh lệch theo kiểu phối.',
    aestheticPromptSummary: 'Tà áo dài lụa tơ hồng pastel cổ tròn phối quần lụa trắng, túi cói tròn dạo bước bên bờ hồ.',
    paletteColors: ['#f7c6c7', '#ffffff', '#ec4899', '#059669'],
    backdropGradient: 'from-pink-950/30 to-stone-900/80',
  },
  {
    id: 'insp-tuthan-heritage-brown',
    title: 'Phác thảo Áo Tứ Thân Kinh Bắc Không Gian Lễ Hội',
    entitySlug: 'tu-than',
    matchedItemIds: [
      'item-main-tuthan-nau-song',
      'item-inner-yem-canh-sen-vang',
      'item-lower-vay-dam-den',
      'item-head-non-quai-thao',
      'item-foot-guoc-moc-quai-nhung',
    ],
    sceneId: 'scene-heritage',
    assetStatus: 'ASSET_NEEDED',
    reviewStatus: 'DRAFT',
    disclaimer: 'Tái hiện không gian lễ hội Kinh Bắc mang tính cảm hứng (Dự thảo) — Cần ảnh chụp thực tế.',
    aestheticPromptSummary: 'Liền chị duyên dáng trong áo tứ thân đũi nâu mộc, yếm vàng cánh sen, váy sồi đen xòe rộng, nón quai thao và guốc mộc bên mái đình rêu phong.',
    paletteColors: ['#58311b', '#ffd166', '#232323', '#f4a261'],
    backdropGradient: 'from-amber-950/30 to-stone-900/80',
  },
  {
    id: 'insp-nguthan-studio-emerald',
    title: 'Phác thảo Áo Ngũ Thân Xanh Cẩm Thạch Studio Editorial',
    entitySlug: 'ngu-than',
    matchedItemIds: [
      'item-main-nguthan-xanh-ngoc',
      'item-lower-quan-lua-trang',
      'item-head-khan-van-dong',
      'item-foot-hai-theu-hoa-sen',
    ],
    sceneId: 'scene-studio',
    assetStatus: 'ASSET_NEEDED',
    reviewStatus: 'DRAFT',
    disclaimer: 'Ý tưởng phong cách chụp Studio hiện đại cho ngũ thân (Dự thảo) — Cần ảnh chụp thực tế.',
    aestheticPromptSummary: 'Áo ngũ thân tay chẽn xanh cẩm thạch lập lĩnh cài 5 khuy đồng, khăn vấn lam đậm và hài thêu hoa sen dưới ánh sáng studio.',
    paletteColors: ['#2d6a4f', '#ffffff', '#1d3557', '#ca8a04'],
    backdropGradient: 'from-emerald-950/30 to-stone-900/80',
  },
];

/**
 * So khớp trung thực giữa bộ phối hiện tại và thư viện phác thảo tham khảo:
 * - EXACT: Chỉ khi khớp đúng entity, đúng scene và TOÀN BỘ các món chính/dưới/giày trong entry đều khớp trong outfit.
 * - SIMILAR: Khi cùng entity, cùng scene và cùng áo chính, nhưng khác quần hoặc giày hoặc phụ kiện. Cung cấp differenceNote rõ ràng.
 * - NULL: Khác áo chính hoặc khác bối cảnh (không gán bừa).
 */
export function matchInspirationGallery(
  outfitItemIds: string[],
  entitySlug: string,
  sceneId: string
): GalleryMatchResult | null {
  const outfitSet = new Set(outfitItemIds);

  for (const entry of INSPIRATION_GALLERY) {
    if (entry.entitySlug !== entitySlug || entry.sceneId !== sceneId) {
      continue;
    }

    // Check if main item of entry is in outfit
    const entryMainId = entry.matchedItemIds.find((id) => id.includes('main'));
    if (entryMainId && !outfitSet.has(entryMainId)) {
      // Main item doesn't match: can't be even similar for this entry
      continue;
    }

    // Check how many items match
    const missingInOutfit = entry.matchedItemIds.filter((id) => !outfitSet.has(id));
    const isExact = missingInOutfit.length === 0;

    if (isExact) {
      return {
        entry,
        matchType: 'exact',
      };
    }

    // If main item matches, evaluate differences
    const diffParts: string[] = [];
    if (missingInOutfit.some((id) => id.includes('quan') || id.includes('vay') || id.includes('lower'))) {
      diffParts.push('món mặc dưới khác với bản phác thảo');
    }
    if (missingInOutfit.some((id) => id.includes('foot') || id.includes('guoc') || id.includes('hai') || id.includes('sneaker'))) {
      diffParts.push('giày/guốc khác với mẫu chuẩn');
    }
    if (missingInOutfit.some((id) => id.includes('head') || id.includes('non') || id.includes('khan'))) {
      diffParts.push('phụ kiện nón/khăn khác biệt');
    }
    if (missingInOutfit.some((id) => id.includes('inner') || id.includes('yem'))) {
      diffParts.push('áo yếm khác biệt');
    }

    const differenceNote = diffParts.length > 0
      ? `Bản phối hiện tại có ${diffParts.join(', ')} so với bộ tham chiếu (${entry.title}).`
      : `Bản phối có một số phụ kiện khác với bộ tham chiếu.`;

    return {
      entry,
      matchType: 'similar',
      differenceNote,
    };
  }

  return null;
}
