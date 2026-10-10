import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Flame,
  Droplets,
  Wind,
  Mountain,
  CircleDot,
  CheckCircle2,
  AlertTriangle,
  Award,
  Copy,
  Check,
  Calendar,
  Share2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CatalogItem, SlotType, SlotLabels } from '../types/fashion';
import {
  ElementType,
  ELEMENT_DETAILS,
  BIRTH_YEARS_DATA,
  getElementFromColor,
} from '../data/fengShuiData';

interface FengShuiAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItems: Partial<Record<SlotType, CatalogItem>>;
  activeEntityName?: string;
}

export const FengShuiAnalyzerModal: React.FC<FengShuiAnalyzerModalProps> = ({
  isOpen,
  onClose,
  currentItems,
  activeEntityName = 'Cổ Phục Việt Nam',
}) => {
  // User selection: Birth year or direct Element
  const [selectedYear, setSelectedYear] = useState<number>(2003); // default Gen Z student
  const [selectedElementDirect, setSelectedElementDirect] = useState<ElementType | null>(null);
  const [copiedBlessing, setCopiedBlessing] = useState<boolean>(false);

  // Derive target element
  const currentFate = useMemo(() => {
    if (selectedElementDirect) {
      return {
        element: selectedElementDirect,
        canChi: 'Tự chọn',
        fateName: ELEMENT_DETAILS[selectedElementDirect].name,
      };
    }
    const found = BIRTH_YEARS_DATA.find((item) => item.year === selectedYear);
    if (found) {
      return found;
    }
    return {
      element: 'MOC' as ElementType,
      canChi: 'Quý Mùi',
      fateName: 'Dương Liễu Mộc',
    };
  }, [selectedYear, selectedElementDirect]);

  const targetElement = currentFate.element;
  const elementDetails = ELEMENT_DETAILS[targetElement];

  // Analyze outfit items
  const analysis = useMemo(() => {
    const itemsList = Object.entries(currentItems)
      .filter(([_, item]) => Boolean(item))
      .map(([slot, item]) => {
        const it = item as CatalogItem;
        const itemElem = getElementFromColor(it.colorName, it.hexColor, it.styleTags);
        let relation: 'TUONG_SINH' | 'TUONG_HOP' | 'TUONG_KHAC' | 'SINH_XUAT' | 'TRUNG_TINH' = 'TRUNG_TINH';
        let point = 15;
        let note = '';

        if (itemElem === targetElement) {
          relation = 'TUONG_HOP';
          point = 25;
          note = `Đồng điệu bản mệnh (${elementDetails.hanzi}): Củng cố nền tảng, phong thái vững vàng, tâm an định.`;
        } else if (itemElem === elementDetails.generatedBy) {
          relation = 'TUONG_SINH';
          point = 30;
          note = `Được tương sinh (${ELEMENT_DETAILS[itemElem].hanzi} sinh ${elementDetails.hanzi}): Thu hút vượng khí, đại cát đại lợi, quý nhân trợ mệnh.`;
        } else if (itemElem === elementDetails.generates) {
          relation = 'SINH_XUAT';
          point = 18;
          note = `Bản mệnh sinh xuất (${elementDetails.hanzi} sinh ${ELEMENT_DETAILS[itemElem].hanzi}): Tỏa sáng tài năng, tự tin thể hiện, phong độ hào hoa.`;
        } else if (itemElem === elementDetails.overcomeBy) {
          relation = 'TUONG_KHAC';
          point = 5;
          note = `Tương khắc bản mệnh (${ELEMENT_DETAILS[itemElem].hanzi} khắc ${elementDetails.hanzi}): Nên cân bằng lại bằng phụ kiện hoặc hài thêu tương sinh.`;
        } else {
          relation = 'TRUNG_TINH';
          point = 15;
          note = `Hài hòa ngũ hành: Mang sắc thái bình ổn, thanh nhã cổ phong.`;
        }

        return {
          slot: slot as SlotType,
          slotName: SlotLabels[slot as SlotType]?.vi || slot,
          item: it,
          element: itemElem,
          elementDetail: ELEMENT_DETAILS[itemElem],
          relation,
          point,
          note,
        };
      });

    // Count element distribution
    const elementCounts: Record<ElementType, number> = {
      KIM: 0,
      MOC: 0,
      THUY: 0,
      HOA: 0,
      THO: 0,
    };
    itemsList.forEach((i) => {
      elementCounts[i.element] += 1;
    });

    const totalItems = Math.max(itemsList.length, 1);
    const hasTuongSinh = itemsList.some((i) => i.relation === 'TUONG_SINH');
    const hasTuongHop = itemsList.some((i) => i.relation === 'TUONG_HOP');
    const hasTuongKhac = itemsList.some((i) => i.relation === 'TUONG_KHAC');

    // Base score calculation
    let rawScore = 70;
    if (hasTuongSinh) rawScore += 18;
    if (hasTuongHop) rawScore += 10;
    if (!hasTuongKhac) rawScore += 8;
    else rawScore -= 8;

    // Normalize between 78 and 99
    const score = Math.min(Math.max(rawScore, 78), 99);

    // Auspicious blessing title & description
    let blessingTitle = 'Ngũ Hành Tương Sinh • Vượng Khí Đại Cát';
    let blessingContent = `Bản phối cổ phục mang năng lượng tương sinh cát tường, trợ lực hoàn hảo cho bản mệnh ${currentFate.fateName}. Ánh sắc tà áo dung hòa âm dương, phong thái đĩnh đạc thanh tao, rất vượng khí cho ngày bảo vệ khóa luận tốt nghiệp, lễ hội cung đình và những bức ảnh kỷ yếu để đời!`;

    if (score >= 95) {
      blessingTitle = 'Thiên Thời Địa Lợi • Phú Quý Cát Tường (Điểm Cực Phẩm)';
      blessingContent = `Sự kết hợp hoàn hảo giữa tà áo ${itemsList[0]?.item.name || 'Cổ Phục'} và bản mệnh ${currentFate.fateName}! Màu sắc tương sinh vượng khí đạt tới 98/100 điểm phong thủy. Diện bộ phối này sẽ thu hút ngút ngàn may mắn, bước đi khoan thai tự tại, thần thái ngời sáng giữa đám đông.`;
    } else if (hasTuongKhac) {
      blessingTitle = 'Cương Nhu Hài Hòa • Hóa Giải Khắc Chế';
      blessingContent = `Bản phối có chút tương khắc nhẹ giữa gam màu trang phục và bản mệnh. Tuy nhiên, nét đẹp cổ kính của ${activeEntityName} vẫn giữ được cốt cách thanh tao. Mẹo nhỏ: Hãy phối thêm một chiếc quạt the hoặc hài thêu tông màu ${elementDetails.compatibleColors[0]} để ngũ hành luân chuyển thông suốt!`;
    }

    return {
      itemsList,
      score,
      elementCounts,
      totalItems,
      blessingTitle,
      blessingContent,
    };
  }, [currentItems, targetElement, elementDetails, currentFate, activeEntityName]);

  const handleCopyBlessing = () => {
    const textToCopy = `[Phong Thủy Cổ Phục - Việt Y Tân Sắc]\nBản mệnh: ${currentFate.canChi} (${currentFate.fateName})\nTrang phục: ${activeEntityName}\nĐiểm Vượng Khí: ${analysis.score}/100\nLời chúc cát tường: "${analysis.blessingContent}"`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedBlessing(true);
    setTimeout(() => setCopiedBlessing(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1c1511] via-[#140e0b] to-[#0d0907] border-2 border-[#d4af37]/40 shadow-2xl p-5 sm:p-7 text-white space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#cba369]/25 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-600/30 to-amber-950/60 border border-amber-400/40 flex items-center justify-center text-amber-300 text-xl shadow-inner">
                ☯️
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-wide">
                    Luận Giải Ngũ Hành & Chấm Điểm Phong Thủy
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#d5c3aa]">
                  Chiếu theo Dịch Lý Đông Phương • Hòa sắc tương sinh tương khắc cùng trang phục
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section: Select Year or Element */}
          <div className="p-4 rounded-2xl bg-[#231a14]/70 border border-[#cba369]/25 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label htmlFor="birth-year-select" className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4" />
                <span>1. Chọn Năm Sinh của Bạn (Tra cứu Nạp Âm):</span>
              </label>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-stone-400">Hoặc chọn nhanh Mệnh:</span>
                {(['KIM', 'MOC', 'THUY', 'HOA', 'THO'] as ElementType[]).map((elem) => (
                  <button
                    key={elem}
                    type="button"
                    onClick={() => {
                      setSelectedElementDirect(elem);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all ${
                      selectedElementDirect === elem
                        ? 'bg-amber-500 text-stone-950 border-amber-300 scale-105 shadow-sm'
                        : 'bg-[#18110d] text-stone-300 border-stone-700 hover:border-amber-400'
                    }`}
                  >
                    {ELEMENT_DETAILS[elem].hanzi} {elem}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <select
                  id="birth-year-select"
                  value={selectedElementDirect ? '' : selectedYear}
                  onChange={(e) => {
                    setSelectedElementDirect(null);
                    setSelectedYear(Number(e.target.value));
                  }}
                  className="w-full bg-[#18100c] border border-[#cba369]/40 rounded-xl px-3 py-2 text-sm text-amber-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {BIRTH_YEARS_DATA.map((y) => (
                    <option key={y.year} value={y.year}>
                      Năm {y.year} ({y.canChi}) — {y.fateName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current element badge */}
              <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-[#2a1e16] border border-amber-500/30">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow"
                  style={{
                    backgroundColor:
                      targetElement === 'HOA'
                        ? '#dc2626'
                        : targetElement === 'MOC'
                        ? '#16a34a'
                        : targetElement === 'THUY'
                        ? '#2563eb'
                        : targetElement === 'THO'
                        ? '#d97706'
                        : '#64748b',
                  }}
                >
                  {elementDetails.hanzi}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-amber-300">
                    {currentFate.canChi ? `${currentFate.canChi} • ` : ''}{elementDetails.name}
                  </div>
                  <div className="text-[11px] text-stone-300 truncate">
                    Hợp màu: {elementDetails.compatibleColors.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/70 via-[#271911] to-amber-950/70 border-2 border-[#d4af37]/60 p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[11px] font-bold text-amber-300 tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chỉ Số Vượng Khí Trang Phục</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                {analysis.blessingTitle}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md">
                Đánh giá theo tương tác giữa tà áo ({activeEntityName}) và bản mệnh {currentFate.fateName}.
              </p>
            </div>

            {/* Score Ring / Badge */}
            <div className="relative flex flex-col items-center justify-center shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 p-1 shadow-lg shadow-amber-900/50 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#160f0c] flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold font-mono text-amber-300 tracking-tight">
                    {analysis.score}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-stone-400">
                    / 100 Điểm
                  </span>
                </div>
              </div>
              <span className="mt-1 text-[11px] font-semibold text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cát Tường Vượng Phát</span>
              </span>
            </div>
          </div>

          {/* Detailed Item Five-Elements Matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#d5c3aa] flex items-center space-x-1.5">
              <span>Chi Tiết Ngũ Hành Từng Món Trong Bản Phối ({analysis.itemsList.length} Món):</span>
            </h4>

            {analysis.itemsList.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#1b140f] border border-stone-800 text-center text-xs text-stone-400">
                Chưa có món trang phục nào được chọn trên người. Hãy ra tủ đồ chọn áo chính và phụ kiện!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {analysis.itemsList.map((entry, idx) => (
                  <div
                    key={`${entry.slot}-${idx}`}
                    className="p-3 rounded-2xl bg-[#1a120e] border border-[#cba369]/20 hover:border-amber-400/40 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-200">
                        {entry.slotName}: {entry.item.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          entry.relation === 'TUONG_SINH'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : entry.relation === 'TUONG_HOP'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : entry.relation === 'TUONG_KHAC'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                            : 'bg-stone-900 text-stone-300 border border-stone-700'
                        }`}
                      >
                        {entry.relation === 'TUONG_SINH'
                          ? '🌟 Tương Sinh'
                          : entry.relation === 'TUONG_HOP'
                          ? '✨ Tương Hợp'
                          : entry.relation === 'TUONG_KHAC'
                          ? '⚠️ Khắc Chế'
                          : '☯️ Hài Hòa'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-stone-300">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block border border-white/30"
                        style={{ backgroundColor: entry.item.hexColor || '#888' }}
                      />
                      <span>Màu: {entry.item.colorName}</span>
                      <span className="text-stone-500">•</span>
                      <span>Hành: <strong className="text-amber-200">{entry.elementDetail.name}</strong></span>
                    </div>

                    <p className="text-[11px] text-stone-400 italic">
                      {entry.note}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auspicious Blessing Card (Thẻ Lời Chúc Cát Tường) */}
          <div className="relative rounded-3xl bg-gradient-to-br from-[#291b12] via-[#1f140e] to-[#120a06] border border-[#d4af37]/50 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📜</span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-serif">
                  Thẻ Lời Chúc Cát Tường Cho Bạn
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyBlessing}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-xs font-semibold text-amber-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                {copiedBlessing ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao Chép Thẻ</span>
                  </>
                )}
              </button>
            </div>

            <blockquote className="text-sm sm:text-base font-serif italic text-amber-100 leading-relaxed border-l-2 border-amber-400/60 pl-3">
              &ldquo;{analysis.blessingContent}&rdquo;
            </blockquote>

            <div className="pt-2 border-t border-[#cba369]/20 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400">
              <div className="flex items-center space-x-2">
                <span>Trang sức hộ mệnh gợi ý:</span>
                <span className="text-amber-300 font-medium">{elementDetails.luckyStone}</span>
              </div>
              <div className="text-[11px] text-amber-400 font-mono">
                #VietPhucRemix #PhongThuyCoPhuc #{currentFate.canChi}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Hoàn Tất & Giữ Vượng Khí
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
