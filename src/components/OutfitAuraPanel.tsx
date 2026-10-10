import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Compass,
  Sparkles,
  Copy,
  Check,
  MapPin,
  Camera,
  Layers,
  ChevronRight,
  Flame,
  Droplets,
  Mountain,
  Trees,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { CatalogItem, EntitySlug, SlotType } from '../types/fashion';

export interface OutfitAuraPanelProps {
  entitySlug: EntitySlug;
  items: Partial<Record<SlotType, CatalogItem>>;
  onOpenFengShui?: () => void;
  onOpenSpotRadar?: () => void;
  onOpenPoseGuide?: () => void;
}

// Map color hues to traditional Vietnamese color names & Five Elements
function analyzeColorElement(hex?: string): {
  traditionalName: string;
  element: 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
  elementIcon: React.ReactNode;
  elementColor: string;
} {
  if (!hex) {
    return {
      traditionalName: 'Huyền Sắc',
      element: 'Thủy',
      elementIcon: <Droplets className="w-3.5 h-3.5 text-blue-400" />,
      elementColor: 'text-blue-400',
    };
  }

  const cleanHex = hex.replace('#', '').toLowerCase();
  const r = parseInt(cleanHex.substring(0, 2) || '0', 16);
  const g = parseInt(cleanHex.substring(2, 4) || '0', 16);
  const b = parseInt(cleanHex.substring(4, 6) || '0', 16);

  // High brightness, low saturation -> Kim (White, silver, cream)
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  if (diff < 35 && max > 180) {
    return {
      traditionalName: 'Bạch Ngọc Thuần Khiết',
      element: 'Kim',
      elementIcon: <Sun className="w-3.5 h-3.5 text-stone-200" />,
      elementColor: 'text-stone-200',
    };
  }

  // Low brightness -> Thủy (Black, deep navy)
  if (max < 50) {
    return {
      traditionalName: 'Mặc Hắc Trầm Ổn',
      element: 'Thủy',
      elementIcon: <Droplets className="w-3.5 h-3.5 text-blue-400" />,
      elementColor: 'text-blue-400',
    };
  }

  // Green dominant -> Mộc
  if (g > r && g > b) {
    return {
      traditionalName: 'Thanh Lục Bích Ngọc',
      element: 'Mộc',
      elementIcon: <Trees className="w-3.5 h-3.5 text-emerald-400" />,
      elementColor: 'text-emerald-400',
    };
  }

  // Blue dominant -> Thủy
  if (b > r && b > g) {
    return {
      traditionalName: 'Thanh Lam Cố Đô',
      element: 'Thủy',
      elementIcon: <Droplets className="w-3.5 h-3.5 text-sky-400" />,
      elementColor: 'text-sky-400',
    };
  }

  // Red/Pink dominant -> Hỏa
  if (r > g && r > b) {
    if (g > 150) {
      // Yellow/Gold/Amber -> Thổ
      return {
        traditionalName: 'Hoàng Kim Vương Triều',
        element: 'Thổ',
        elementIcon: <Mountain className="w-3.5 h-3.5 text-amber-400" />,
        elementColor: 'text-amber-400',
      };
    }
    if (b > 100) {
      return {
        traditionalName: 'Tử Đằng Quyến Rũ',
        element: 'Hỏa',
        elementIcon: <Flame className="w-3.5 h-3.5 text-purple-400" />,
        elementColor: 'text-purple-400',
      };
    }
    return {
      traditionalName: 'Chu Sa Cung Đình',
      element: 'Hỏa',
      elementIcon: <Flame className="w-3.5 h-3.5 text-rose-400" />,
      elementColor: 'text-rose-400',
    };
  }

  // Default Earth / Warm brown
  return {
    traditionalName: 'Hổ Phách Trầm Hương',
    element: 'Thổ',
    elementIcon: <Mountain className="w-3.5 h-3.5 text-amber-500" />,
    elementColor: 'text-amber-500',
  };
}

const HERITAGE_SPOTS_INFO: Record<
  EntitySlug,
  {
    primarySpot: string;
    secondarySpot: string;
    vibe: string;
    signaturePose: string;
    idealAccessory: string;
  }
> = {
  'ngu-than': {
    primarySpot: 'Đại Nội Huế & Cung Diên Thọ',
    secondarySpot: 'Làng cổ Đường Lâm & Văn Miếu',
    vibe: 'Cốt cách trang nghiêm triều Nguyễn, phong thái tri thức sĩ tử',
    signaturePose: 'Chắp hai tay ngang bụng chỉnh tề, mắt nhìn thẳng tự tin hoặc tay nâng vạt áo tấc bước đi nhẹ nhàng.',
    idealAccessory: 'Quạt xếp gỗ trầm, tráp gỗ hoặc kính râm gọng tròn retro.',
  },
  'ao-dai': {
    primarySpot: 'Hồ Hoàn Kiếm & Bưu Điện Sài Gòn',
    secondarySpot: 'Chùa Thiên Mụ & Làng Lụa Vạn Phúc',
    vibe: 'Thanh lịch học đường, duyên dáng đương đại kết hợp hoài niệm',
    signaturePose: 'Đứng góc nghiêng 45 độ, một tay khép hờ nâng nhẹ tà áo, nụ cười đoan trang thanh thoát.',
    idealAccessory: 'Nón lá bài thơ, túi cói đan tay hoặc sneaker trắng tối giản.',
  },
  'tu-than': {
    primarySpot: 'Chùa Thầy & Quần Thể Chùa Bút Tháp',
    secondarySpot: 'Làng Dân Ca Quan Họ Bắc Ninh & Đền Đô',
    vibe: 'Mộc mạc dân gian Kinh Bắc, phóng khoáng mà kín đáo tình tứ',
    signaturePose: 'Tay nâng vành nón quai thao hờ hững che nửa khuôn mặt, tà áo tứ thân tung bay theo bước chân.',
    idealAccessory: 'Nón quai thao ba tầm, cơi trầu têm cánh phượng hoặc hài nhung.',
  },
};

export const OutfitAuraPanel: React.FC<OutfitAuraPanelProps> = ({
  entitySlug,
  items,
  onOpenFengShui,
  onOpenSpotRadar,
  onOpenPoseGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'palette' | 'spots' | 'remix'>('palette');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const equippedItemsList = [
    { slotName: 'Áo chính', item: items.main },
    { slotName: 'Quần/Váy', item: items.lower },
    { slotName: 'Áo lót/Yếm', item: items.inner },
    { slotName: 'Khăn/Nón', item: items.headwear },
    { slotName: 'Hài/Giày', item: items.footwear },
    { slotName: 'Phụ kiện', item: items.accessory },
  ].filter((entry): entry is { slotName: string; item: CatalogItem } => Boolean(entry.item));

  const spotInfo = HERITAGE_SPOTS_INFO[entitySlug] || HERITAGE_SPOTS_INFO['ngu-than'];

  const handleCopyHex = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  // Tỷ lệ ngũ hành tổng hợp
  const elementsCount: Record<string, number> = { Kim: 0, Mộc: 0, Thủy: 0, Hỏa: 0, Thổ: 0 };
  equippedItemsList.forEach(({ item }) => {
    const analysis = analyzeColorElement(item.hexColor);
    elementsCount[analysis.element] = (elementsCount[analysis.element] || 0) + 1;
  });

  const dominantElement = Object.entries(elementsCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Thổ';

  return (
    <div className="rounded-3xl bg-[#140e0a]/85 backdrop-blur-md border border-[#cba369]/30 p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header with Mini Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#cba369]/20 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#cba369]/30 to-[#9b3424]/30 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-inner">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white font-serif flex items-center gap-1.5">
              <span>Hòa Sắc & Giám Định Khí Chất</span>
            </h4>
            <p className="text-[11px] text-[#d5c3aa]">
              Trích xuất bảng màu thời trang & mẹo chụp di sản
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-1 rounded-xl bg-[#0b0806]/80 border border-[#cba369]/25 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('palette')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              activeTab === 'palette'
                ? 'bg-[#cba369]/30 text-[#f5d99f] border border-[#d4af37]/40 shadow-sm'
                : 'text-[#d5c3aa] hover:text-white'
            }`}
          >
            <Palette className="w-3 h-3" />
            <span>Màu & Ngũ Hành</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('spots')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              activeTab === 'spots'
                ? 'bg-[#cba369]/30 text-[#f5d99f] border border-[#d4af37]/40 shadow-sm'
                : 'text-[#d5c3aa] hover:text-white'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Tọa Độ & Dáng</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('remix')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              activeTab === 'remix'
                ? 'bg-[#cba369]/30 text-[#f5d99f] border border-[#d4af37]/40 shadow-sm'
                : 'text-[#d5c3aa] hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Chỉ Số Remix</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Color Palette & Five Elements */}
      <AnimatePresence mode="wait">
        {activeTab === 'palette' && (
          <motion.div
            key="tab-palette"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-3.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#f5efe6] font-medium flex items-center gap-1.5">
                <span>Dải màu thực tế trang bị</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#cba369]/20 text-[#f5d99f] border border-[#cba369]/30">
                  {equippedItemsList.length} sắc tố
                </span>
              </span>
              <span className="text-[11px] text-[#d5c3aa] italic">
                Chạm để sao chép mã màu
              </span>
            </div>

            {/* Color Swatches Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {equippedItemsList.length > 0 ? (
                equippedItemsList.map(({ slotName, item }) => {
                  const hex = item.hexColor || '#888888';
                  const analysis = analyzeColorElement(hex);
                  const isCopied = copiedHex === hex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={(e) => handleCopyHex(hex, e)}
                      className="group relative p-2.5 rounded-2xl bg-[#0c0806]/85 hover:bg-[#1a120c] border border-[#cba369]/25 hover:border-[#d4af37]/60 transition-all text-left flex items-center space-x-2.5 cursor-pointer shadow-md"
                      title={`Sao chép mã ${hex}`}
                    >
                      {/* Color Circle */}
                      <div
                        className="w-7 h-7 rounded-xl shrink-0 shadow-inner border border-white/25 flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ backgroundColor: hex }}
                      >
                        {isCopied && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-[#d5c3aa] uppercase tracking-wider truncate">
                          {slotName}
                        </div>
                        <div className="text-xs font-bold text-white truncate group-hover:text-[#f5d99f] transition-colors">
                          {analysis.traditionalName}
                        </div>
                        <div className="text-[10px] font-mono text-[#cba369] flex items-center justify-between">
                          <span>{hex.toUpperCase()}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full py-4 text-center text-xs text-stone-400">
                  Chưa trang bị món nào để trích xuất màu.
                </div>
              )}
            </div>

            {/* Five Elements Summary Bar */}
            <div className="p-3 rounded-2xl bg-[#0c0806]/90 border border-[#cba369]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[#f5efe6] font-semibold">Khí chất chủ đạo:</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-600/40 text-amber-300 font-bold text-[11px] flex items-center gap-1">
                    Hành {dominantElement}
                  </span>
                </div>
                <p className="text-[11px] text-[#d5c3aa] leading-relaxed">
                  {dominantElement === 'Hỏa' && 'Hỏa phát vượng: Tươi tắn, nhiệt huyết, ăn ảnh và thu hút ánh nhìn lễ hội.'}
                  {dominantElement === 'Thổ' && 'Thổ vững vàng: Trầm ấm, hoài cổ, biểu trưng sự quyền quý và hiếu lễ.'}
                  {dominantElement === 'Kim' && 'Kim thanh bạch: Nhã nhặn, tinh tế, mang khí chất sĩ tử nho nhã thuần khiết.'}
                  {dominantElement === 'Thủy' && 'Thủy uyển chuyển: Sâu lắng, trí tuệ, tôn vinh nét đài các thâm trầm cung đình.'}
                  {dominantElement === 'Mộc' && 'Mộc sinh sôi: Tươi mới, thanh xuân, hòa hợp thiên nhiên cảnh vật đất trời.'}
                </p>
              </div>

              {onOpenFengShui && (
                <button
                  type="button"
                  onClick={onOpenFengShui}
                  className="shrink-0 min-h-[36px] px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-700/80 to-amber-900/80 hover:from-amber-600 hover:to-amber-800 text-white text-xs font-bold border border-amber-400/40 transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-sm hover:scale-[1.02]"
                >
                  <span>Bảng Tra Mệnh Chi Tiết</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 2: Heritage Spots & Pose Guidance */}
        {activeTab === 'spots' && (
          <motion.div
            key="tab-spots"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="p-3.5 rounded-2xl bg-[#0c0806]/85 border border-[#cba369]/25 space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
                <MapPin className="w-4 h-4 text-[#d4af37]" />
                <span>Tọa độ Di Sản Đề Xuất (Ăn Ảnh Nhất)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-[#18110b] border border-[#cba369]/20">
                  <div className="text-[10px] text-[#d5c3aa] uppercase">Bối cảnh ưu tiên 1</div>
                  <div className="font-semibold text-white mt-0.5">{spotInfo.primarySpot}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#18110b] border border-[#cba369]/20">
                  <div className="text-[10px] text-[#d5c3aa] uppercase">Bối cảnh ưu tiên 2</div>
                  <div className="font-semibold text-white mt-0.5">{spotInfo.secondarySpot}</div>
                </div>
              </div>
              <div className="text-[11px] text-[#e5ceb5] italic">
                {spotInfo.vibe}
              </div>
            </div>

            {/* Pose Tip */}
            <div className="p-3.5 rounded-2xl bg-[#0c0806]/85 border border-purple-500/25 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-300">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Mẹo Tạo Dáng Chuẩn Phom</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-200 border border-purple-500/30">
                  Phom {entitySlug === 'ngu-than' ? 'Ngũ Thân' : entitySlug === 'ao-dai' ? 'Áo Dài' : 'Tứ Thân'}
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {spotInfo.signaturePose}
              </p>
              <div className="text-[11px] text-amber-200/90 flex items-center gap-1.5 pt-1 border-t border-purple-500/20">
                <span>Phụ kiện ăn ảnh:</span>
                <span className="font-medium text-amber-300">{spotInfo.idealAccessory}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {onOpenSpotRadar && (
                <button
                  type="button"
                  onClick={onOpenSpotRadar}
                  className="min-h-[38px] py-2 px-3 rounded-xl bg-[#221811] hover:bg-[#342419] text-[#f5d99f] text-xs font-bold border border-[#cba369]/30 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Radar 12 Tọa Độ</span>
                </button>
              )}

              {onOpenPoseGuide && (
                <button
                  type="button"
                  onClick={onOpenPoseGuide}
                  className="min-h-[38px] py-2 px-3 rounded-xl bg-gradient-to-r from-purple-800/80 to-purple-900/80 hover:from-purple-700 text-white text-xs font-bold border border-purple-400/40 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-purple-200" />
                  <span>Cẩm Nang Dáng</span>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 3: Editorial Remix Index */}
        {activeTab === 'remix' && (
          <motion.div
            key="tab-remix"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Metric Bars */}
            <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#0c0806]/85 border border-[#cba369]/25">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#f5efe6] font-medium">Độ Chuẩn Mực Cổ Phục</span>
                  <span className="text-amber-300 font-bold">88%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-stone-900 overflow-hidden border border-white/10">
                  <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full w-[88%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#f5efe6] font-medium">Tính Ứng Dụng Học Đường / Dạo Phố</span>
                  <span className="text-emerald-300 font-bold">95%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-stone-900 overflow-hidden border border-white/10">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full w-[95%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#f5efe6] font-medium">Chỉ Số Ăn Ảnh Kỷ Yếu (Aura Index)</span>
                  <span className="text-purple-300 font-bold">96%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-stone-900 overflow-hidden border border-white/10">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-rose-400 rounded-full w-[96%]" />
                </div>
              </div>
            </div>

            {/* Contemporary Editorial Advice */}
            <div className="p-3.5 rounded-2xl bg-[#0c0806]/85 border border-[#cba369]/25 space-y-1.5 text-xs">
              <div className="flex items-center space-x-1.5 text-[#d4af37] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Gợi ý Phối Phong Cách Đương Đại (Remix Styling)</span>
              </div>
              <p className="text-stone-300 leading-relaxed text-[11px]">
                Bộ trang phục hiện tại giữ chuẩn mực cấu trúc ngũ thân / tứ thân truyền thống, có thể kết hợp nhẹ nhàng cùng phụ kiện hiện đại (giày sneaker trắng tối giản, đồng hồ cổ điển, kính mắt bản mỏng) để diện trong các buổi lễ tốt nghiệp, sự kiện văn hóa học đường hoặc triển lãm nghệ thuật đương đại.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
