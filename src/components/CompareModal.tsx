import React, { useState, useMemo } from 'react';
import {
  X,
  Scale,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Palette,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { OutfitVisualizer } from './OutfitVisualizer';
import { ShopeeSearchButton } from './ShopeeSearchButton';
import {
  CatalogItem,
  EntityDisplayData,
  EntitySlug,
  EventType,
  OutfitRecipe,
  SlotLabels,
  SlotType,
} from '../types/fashion';
import {
  LookbookEntry,
  LookbookSnapshot,
  resolveLookbookSnapshot,
  seedSampleLookbooks,
} from '../utils/lookbookStorage';
import { calculateHeuristicScore, validateOutfit } from '../utils/outfitValidator';
import { useModalA11y } from '../utils/useModalA11y';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lookbookEntries: LookbookEntry[];
  onRefreshEntries: () => void;
  onApplyOutfit: (entry: LookbookEntry) => void;
  recipes: OutfitRecipe[];
  defaultContext?: {
    event: EventType;
    style?: string;
    preferredColor?: string;
  };
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  lookbookEntries,
  onRefreshEntries,
  onApplyOutfit,
  recipes,
  defaultContext,
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  useModalA11y({
    isOpen,
    onClose,
    modalRef,
  });

  // Shared context criteria for comparative scoring
  const [compareEvent, setCompareEvent] = useState<EventType>(
    defaultContext?.event || 'KY_YEU'
  );
  const [compareStyle, setCompareStyle] = useState<string>(
    defaultContext?.style || 'truyền thống'
  );
  const [compareColor, setCompareColor] = useState<string>(
    defaultContext?.preferredColor || ''
  );

  // Sync criteria with current Builder context whenever the modal opens
  const prevIsOpenRef = React.useRef(false);
  React.useEffect(() => {
    if (isOpen && !prevIsOpenRef.current && defaultContext) {
      setCompareEvent(defaultContext.event || 'KY_YEU');
      setCompareStyle(defaultContext.style || 'truyền thống');
      setCompareColor(defaultContext.preferredColor || '');
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, defaultContext]);

  const handleResetToBuilderContext = () => {
    if (defaultContext) {
      setCompareEvent(defaultContext.event || 'KY_YEU');
      setCompareStyle(defaultContext.style || 'truyền thống');
      setCompareColor(defaultContext.preferredColor || '');
    }
  };

  // Selected Outfit IDs (must be 2 different outfits)
  const [selectedIdA, setSelectedIdA] = useState<string>(() => {
    return lookbookEntries[0]?.id || '';
  });
  const [selectedIdB, setSelectedIdB] = useState<string>(() => {
    return lookbookEntries[1]?.id || (lookbookEntries[0]?.id !== lookbookEntries[1]?.id ? lookbookEntries[1]?.id : '') || '';
  });

  // Sync initial selection when entries change
  React.useEffect(() => {
    if (lookbookEntries.length >= 2) {
      if (!selectedIdA || !lookbookEntries.some((e) => e.id === selectedIdA)) {
        setSelectedIdA(lookbookEntries[0].id);
      }
      if (!selectedIdB || selectedIdB === lookbookEntries[0]?.id || !lookbookEntries.some((e) => e.id === selectedIdB)) {
        setSelectedIdB(lookbookEntries[1].id);
      }
    } else if (lookbookEntries.length === 1) {
      setSelectedIdA(lookbookEntries[0].id);
      setSelectedIdB('');
    }
  }, [lookbookEntries]);

  // Keyboard shortcut: Escape to close
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSeedSamples = () => {
    const updated = seedSampleLookbooks();
    onRefreshEntries();
    if (updated.length >= 2) {
      setSelectedIdA(updated[0].id);
      setSelectedIdB(updated[1].id);
    }
  };

  const outfitA = lookbookEntries.find((e) => e.id === selectedIdA);
  const outfitB = lookbookEntries.find((e) => e.id === selectedIdB);

  const isSameOutfit = Boolean(selectedIdA && selectedIdB && selectedIdA === selectedIdB);
  const hasInsufficientEntries = lookbookEntries.length < 2;

  // Snapshot resolution (truthful, no fake fallback item substitution)
  const snapshotA: LookbookSnapshot | null = outfitA
    ? resolveLookbookSnapshot(outfitA.itemIds, outfitA.entitySlug)
    : null;

  const snapshotB: LookbookSnapshot | null = outfitB
    ? resolveLookbookSnapshot(outfitB.itemIds, outfitB.entitySlug)
    : null;

  // Recipe reference
  const recipeA = recipes.find((r) => r.entitySlug === outfitA?.entitySlug) || recipes[0];
  const recipeB = recipes.find((r) => r.entitySlug === outfitB?.entitySlug) || recipes[0];

  // Evaluation criteria shared by BOTH outfits
  const criteria = {
    event: compareEvent,
    style: compareStyle || undefined,
    preferredColor: compareColor || undefined,
  };

  // Evaluation A
  const itemsA = snapshotA ? Object.values(snapshotA.items).filter(Boolean) as CatalogItem[] : [];
  const evalA = outfitA && recipeA
    ? calculateHeuristicScore(recipeA, itemsA, criteria)
    : null;
  const validationA = outfitA
    ? validateOutfit(outfitA.itemIds, outfitA.entitySlug)
    : null;

  // Evaluation B
  const itemsB = snapshotB ? Object.values(snapshotB.items).filter(Boolean) as CatalogItem[] : [];
  const evalB = outfitB && recipeB
    ? calculateHeuristicScore(recipeB, itemsB, criteria)
    : null;
  const validationB = outfitB
    ? validateOutfit(outfitB.itemIds, outfitB.entitySlug)
    : null;

  const allSlots: SlotType[] = ['main', 'lower', 'inner', 'headwear', 'footwear', 'accessory'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-stone-900 border border-stone-800 rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden focus:outline-none"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 id="compare-modal-title" className="text-base sm:text-lg font-bold text-white font-serif">
                  So Sánh 2 Bộ Phối Lookbook (Compare)
                </h3>
              </div>
              <p className="text-xs text-stone-300 hidden sm:block">
                Đặt 2 bộ trang phục cạnh nhau dưới cùng một bối cảnh đánh giá, so sánh slot món đồ và phom dáng độc lập.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center text-sm cursor-pointer transition-colors"
            aria-label="Đóng bảng so sánh"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Insufficient entries banner */}
        {hasInsufficientEntries && (
          <div className="p-4 bg-amber-950/30 border-b border-amber-800/40 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Bạn đang có {lookbookEntries.length} bộ trong Lookbook. Tính năng So sánh yêu cầu chọn đúng 2 bộ khác nhau.
              </span>
            </div>
            <button
              onClick={handleSeedSamples}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium text-xs flex items-center space-x-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nạp 2 bộ mẫu để thử so sánh ngay</span>
            </button>
          </div>
        )}

        {/* Selection & Shared Evaluation Context Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-950/40 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Selector A */}
            <div className="space-y-1">
              <label htmlFor="compare-select-a" className="text-xs font-semibold text-amber-300 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Bộ Phối A (Bên trái):</span>
              </label>
              <select
                id="compare-select-a"
                value={selectedIdA}
                onChange={(e) => setSelectedIdA(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="" disabled>-- Chọn bộ thứ nhất --</option>
                {lookbookEntries.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({EntityDisplayData[e.entitySlug]?.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Selector B */}
            <div className="space-y-1">
              <label htmlFor="compare-select-b" className="text-xs font-semibold text-rose-300 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Bộ Phối B (Bên phải):</span>
              </label>
              <select
                id="compare-select-b"
                value={selectedIdB}
                onChange={(e) => setSelectedIdB(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="" disabled>-- Chọn bộ thứ hai --</option>
                {lookbookEntries.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({EntityDisplayData[e.entitySlug]?.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Validation Notice for Same Outfit Selection */}
          {isSameOutfit && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Lưu ý:</strong> Bạn đang chọn cùng một bộ phối cho cả 2 bên. Hãy chọn 2 bộ phối khác nhau trong danh sách để so sánh đối chiếu chuẩn xác.
              </span>
            </div>
          )}

          {/* Shared Context Criteria */}
          <div className="pt-2 border-t border-stone-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-stone-400">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-stone-300">Bối cảnh đối chiếu chung:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Event selector */}
              <div className="flex items-center space-x-1 bg-stone-900 px-2 py-1 rounded-lg border border-stone-700">
                <label htmlFor="compare-select-event" className="text-[11px] text-stone-400 cursor-pointer">Sự kiện:</label>
                <select
                  id="compare-select-event"
                  value={compareEvent}
                  onChange={(e) => setCompareEvent(e.target.value as EventType)}
                  className="bg-transparent text-amber-300 text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="KY_YEU" className="bg-stone-900 text-stone-200">Kỷ yếu học đường</option>
                  <option value="LE_HOI_TRUONG" className="bg-stone-900 text-stone-200">Lễ hội văn hóa trường</option>
                  <option value="CHUP_ANH_NGHE_THUAT" className="bg-stone-900 text-stone-200">Chụp ảnh nghệ thuật</option>
                  <option value="DAO_PHO" className="bg-stone-900 text-stone-200">Dạo phố giao lưu</option>
                </select>
              </div>

              {/* Style preference */}
              <div className="flex items-center space-x-1 bg-stone-900 px-2 py-1 rounded-lg border border-stone-700">
                <label htmlFor="compare-select-style" className="text-[11px] text-stone-400 cursor-pointer">Phong cách:</label>
                <select
                  id="compare-select-style"
                  value={compareStyle}
                  onChange={(e) => setCompareStyle(e.target.value)}
                  className="bg-transparent text-amber-300 text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="truyền thống" className="bg-stone-900 text-stone-200">Truyền thống thuần chất</option>
                  <option value="remix" className="bg-stone-900 text-stone-200">Remix cách tân trẻ trung</option>
                  <option value="thanh lịch" className="bg-stone-900 text-stone-200">Thanh lịch nhẹ nhàng</option>
                  <option value="trang trọng" className="bg-stone-900 text-stone-200">Trang trọng cổ phong</option>
                </select>
              </div>

              {/* Color preference */}
              <div className="flex items-center space-x-1 bg-stone-900 px-2 py-1 rounded-lg border border-stone-700">
                <label htmlFor="compare-select-color" className="text-[11px] text-stone-400 cursor-pointer">Tông màu:</label>
                <select
                  id="compare-select-color"
                  value={compareColor}
                  onChange={(e) => setCompareColor(e.target.value)}
                  className="bg-transparent text-amber-300 text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-stone-900 text-stone-200">Không ràng buộc</option>
                  <option value="trắng" className="bg-stone-900 text-stone-200">Bạch ngọc / Trắng</option>
                  <option value="xanh" className="bg-stone-900 text-stone-200">Lam sẫm / Xanh ngọc</option>
                  <option value="vàng" className="bg-stone-900 text-stone-200">Hoàng yến / Vàng</option>
                  <option value="đỏ" className="bg-stone-900 text-stone-200">Hồng điều / Đỏ thắm</option>
                </select>
              </div>

              {/* Reset to Builder context */}
              {defaultContext && (
                <button
                  onClick={handleResetToBuilderContext}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center space-x-1 cursor-pointer transition-colors text-[11px]"
                  title="Đặt lại bối cảnh đối chiếu theo bộ lọc Builder hiện tại"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>Đồng bộ theo Builder</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Comparison Content Body: Responsive columns (stacked on mobile, side-by-side on desktop) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {(!outfitA || !outfitB) ? (
            <div className="text-center py-12 space-y-3">
              <Scale className="w-12 h-12 text-stone-600 mx-auto" />
              <h4 className="text-sm font-semibold text-stone-300">
                Chưa đủ thông tin để tiến hành so sánh
              </h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Vui lòng chọn 2 bộ phối khác nhau từ danh sách Lookbook phía trên để phân tích và đối chiếu chi tiết.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* === CỘT A (BỘ THỨ NHẤT) === */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-3xl p-5 flex flex-col space-y-4">
                {/* Header Card A */}
                <div className="flex items-start justify-between border-b border-stone-800/80 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <h4 className="text-base font-bold text-white font-serif">
                        {outfitA.name}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-stone-400">
                      <span className="px-2 py-0.5 rounded-md bg-stone-800 text-amber-300 font-medium">
                        {EntityDisplayData[outfitA.entitySlug]?.name}
                      </span>
                      <span>Lưu lúc: {outfitA.savedAt}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onApplyOutfit(outfitA);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-600 hover:text-white text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all flex items-center space-x-1 cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mặc bộ này</span>
                  </button>
                </div>

                {/* Duplicate Item Alert A (if any) */}
                {snapshotA?.hasDuplicates && (
                  <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-700/60 text-xs text-rose-200 space-y-1">
                    <div className="flex items-center space-x-1.5 font-semibold text-rose-300">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Phát hiện món bị trùng lặp ID trong bộ phối A</span>
                    </div>
                    <p className="text-[11px] text-rose-200/90 leading-relaxed">
                      Mã món trùng: <code>{snapshotA.duplicateItemIds.join(', ')}</code>.
                    </p>
                  </div>
                )}

                {/* Missing Item Alert A (if any) */}
                {snapshotA?.hasUnavailableOrMissing && (
                  <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-700/60 text-xs text-amber-200 space-y-1">
                    <div className="flex items-center space-x-1.5 font-semibold text-amber-300">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Phát hiện món không khả dụng trong Catalog</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      Mã món bị thiếu/gỡ: <code>{snapshotA.missingItemIds.join(', ')}</code>.
                      Hệ thống giữ nguyên toàn bộ các món còn lại mà không tự tạo điểm giả hay thay đổi bất chợt.
                    </p>
                  </div>
                )}

                {/* Missing Required Slots A (if any) */}
                {snapshotA?.missingRequiredSlots && snapshotA.missingRequiredSlots.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-700/60 text-xs text-amber-200 space-y-1">
                    <div className="flex items-center space-x-1.5 font-semibold text-amber-300">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Bộ A chưa đầy đủ vị trí bắt buộc</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      Thiếu các slot: {snapshotA.missingRequiredSlots.map((s) => SlotLabels[s]?.vi || s).join(', ')}.
                    </p>
                  </div>
                )}

                {/* Visualizer A (Independent SVG instanceId to prevent def clash) */}
                <div className="w-full">
                  <OutfitVisualizer
                    entitySlug={outfitA.entitySlug}
                    items={snapshotA?.items || {}}
                    instanceId="compare-outfit-a"
                    className="max-h-[380px]"
                  />
                </div>

                {/* Match Score & Rationale A */}
                {evalA && (
                  <div className="bg-stone-900/90 p-4 rounded-2xl border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-400 font-medium">Độ phù hợp bối cảnh:</span>
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-lg font-bold font-mono ${snapshotA?.isComplete && validationA?.isValid ? 'text-amber-400' : 'text-stone-400'}`}>
                          {evalA.score}%
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {snapshotA?.isComplete && validationA?.isValid ? '(chấm theo tiêu chí chung)' : '(cấu trúc chưa hoàn thiện)'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-stone-300">
                      <span className="font-semibold text-stone-200">Hài hòa màu sắc: </span>
                      <span className="italic text-amber-200">{evalA.colorHarmony}</span>
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed italic">
                      "{evalA.rationale}"
                    </p>

                    {/* Cultural Validation Summary */}
                    {validationA && (
                      <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px]">
                        <span className="text-stone-400">Đánh giá cấu trúc:</span>
                        <span
                          className={`font-semibold flex items-center space-x-1 ${
                            validationA.isValid ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {validationA.isValid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Đầy đủ phom dáng cơ bản</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3" />
                              <span>Có lưu ý cấu trúc ({validationA.errors.length + validationA.warnings.length})</span>
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Slot-by-Slot Item Breakdown A */}
                <div className="space-y-2 pt-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Chi tiết từng vị trí ({snapshotA?.resolvedCount || 0} món)
                  </h5>

                  <div className="space-y-2">
                    {allSlots.map((slot) => {
                      const item = snapshotA?.items[slot];
                      const slotLabel = SlotLabels[slot]?.vi || slot;

                      return (
                        <div
                          key={slot}
                          className="bg-stone-900/60 border border-stone-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-[11px] font-semibold text-stone-300">
                                {slotLabel}
                              </span>
                              {item?.isModern && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/40 text-purple-300 border border-purple-700/50">
                                  Remix
                                </span>
                              )}
                            </div>

                            {item ? (
                              <div className="text-xs font-medium text-stone-100 flex items-center space-x-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-stone-600 shrink-0"
                                  style={{ backgroundColor: item.hexColor }}
                                />
                                <span>{item.name}</span>
                              </div>
                            ) : (
                              <div className="text-xs text-stone-500 italic">
                                Không trang bị
                              </div>
                            )}
                          </div>

                          {/* Shopee search link for item */}
                          {item && (
                            <div className="shrink-0 self-start sm:self-auto">
                              <ShopeeSearchButton itemName={item.name} compact />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* === CỘT B (BỘ THỨ HAI) === */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-3xl p-5 flex flex-col space-y-4">
                {/* Header Card B */}
                <div className="flex items-start justify-between border-b border-stone-800/80 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <h4 className="text-base font-bold text-white font-serif">
                        {outfitB.name}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-stone-400">
                      <span className="px-2 py-0.5 rounded-md bg-stone-800 text-rose-300 font-medium">
                        {EntityDisplayData[outfitB.entitySlug]?.name}
                      </span>
                      <span>Lưu lúc: {outfitB.savedAt}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onApplyOutfit(outfitB);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 hover:text-white text-rose-300 text-xs font-semibold border border-rose-500/30 transition-all flex items-center space-x-1 cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mặc bộ này</span>
                  </button>
                </div>

                {/* Duplicate Item Alert B (if any) */}
                {snapshotB?.hasDuplicates && (
                  <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-700/60 text-xs text-rose-200 space-y-1">
                    <div className="flex items-center space-x-1.5 font-semibold text-rose-300">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Phát hiện món bị trùng lặp ID trong bộ phối B</span>
                    </div>
                    <p className="text-[11px] text-rose-200/90 leading-relaxed">
                      Mã món trùng: <code>{snapshotB.duplicateItemIds.join(', ')}</code>.
                    </p>
                  </div>
                )}

                {/* Missing Item Alert B (if any) */}
                {snapshotB?.hasUnavailableOrMissing && (
                  <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-700/60 text-xs text-amber-200 space-y-1">
                    <div className="flex items-center space-x-1.5 font-semibold text-amber-300">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Phát hiện món không khả dụng trong Catalog</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      Mã món bị thiếu/gỡ: <code>{snapshotB.missingItemIds.join(', ')}</code>.
                      Hệ thống giữ nguyên toàn bộ các món còn lại mà không tự tạo điểm giả hay thay đổi bất chợt.
                    </p>
                  </div>
                )}

                {/* Missing Required Slots B (if any) */}
                {snapshotB?.missingRequiredSlots && snapshotB.missingRequiredSlots.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-700/60 text-xs text-amber-200 space-y-1">
                    <div className="flex items-center space-x-1.5 font-semibold text-amber-300">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Bộ B chưa đầy đủ vị trí bắt buộc</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      Thiếu các slot: {snapshotB.missingRequiredSlots.map((s) => SlotLabels[s]?.vi || s).join(', ')}.
                    </p>
                  </div>
                )}

                {/* Visualizer B (Independent SVG instanceId to prevent def clash) */}
                <div className="w-full">
                  <OutfitVisualizer
                    entitySlug={outfitB.entitySlug}
                    items={snapshotB?.items || {}}
                    instanceId="compare-outfit-b"
                    className="max-h-[380px]"
                  />
                </div>

                {/* Match Score & Rationale B */}
                {evalB && (
                  <div className="bg-stone-900/90 p-4 rounded-2xl border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-400 font-medium">Độ phù hợp bối cảnh:</span>
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-lg font-bold font-mono ${snapshotB?.isComplete && validationB?.isValid ? 'text-rose-400' : 'text-stone-400'}`}>
                          {evalB.score}%
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {snapshotB?.isComplete && validationB?.isValid ? '(chấm theo tiêu chí chung)' : '(cấu trúc chưa hoàn thiện)'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-stone-300">
                      <span className="font-semibold text-stone-200">Hài hòa màu sắc: </span>
                      <span className="italic text-rose-200">{evalB.colorHarmony}</span>
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed italic">
                      "{evalB.rationale}"
                    </p>

                    {/* Cultural Validation Summary */}
                    {validationB && (
                      <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px]">
                        <span className="text-stone-400">Đánh giá cấu trúc:</span>
                        <span
                          className={`font-semibold flex items-center space-x-1 ${
                            validationB.isValid ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {validationB.isValid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Đầy đủ phom dáng cơ bản</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3" />
                              <span>Có lưu ý cấu trúc ({validationB.errors.length + validationB.warnings.length})</span>
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Slot-by-Slot Item Breakdown B */}
                <div className="space-y-2 pt-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Chi tiết từng vị trí ({snapshotB?.resolvedCount || 0} món)
                  </h5>

                  <div className="space-y-2">
                    {allSlots.map((slot) => {
                      const item = snapshotB?.items[slot];
                      const slotLabel = SlotLabels[slot]?.vi || slot;

                      return (
                        <div
                          key={slot}
                          className="bg-stone-900/60 border border-stone-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-[11px] font-semibold text-stone-300">
                                {slotLabel}
                              </span>
                              {item?.isModern && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/40 text-purple-300 border border-purple-700/50">
                                  Remix
                                </span>
                              )}
                            </div>

                            {item ? (
                              <div className="text-xs font-medium text-stone-100 flex items-center space-x-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-stone-600 shrink-0"
                                  style={{ backgroundColor: item.hexColor }}
                                />
                                <span>{item.name}</span>
                              </div>
                            ) : (
                              <div className="text-xs text-stone-500 italic">
                                Không trang bị
                              </div>
                            )}
                          </div>

                          {/* Shopee search link for item */}
                          {item && (
                            <div className="shrink-0 self-start sm:self-auto">
                              <ShopeeSearchButton itemName={item.name} compact />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Comparative Notes & Disclaimer */}
          <div className="mt-6 p-4 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-2 text-xs text-stone-400">
            <div className="flex items-center space-x-2 text-stone-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Ghi chú minh bạch đối chiếu (Checkpoint 4):</span>
            </div>
            <p className="leading-relaxed">
              1. <strong>Độ phù hợp bối cảnh</strong>: Được tính toán đồng thời bằng thuật toán Heuristic đồng nhất (40% sự kiện, 30% phong cách, 20% màu sắc) để bảo đảm tính khách quan, không dùng số liệu giả định.
            </p>
            <p className="leading-relaxed">
              2. <strong>Liên kết Shopee</strong>: Nhãn "Tìm mẫu tương tự trên Shopee ↗" là công cụ tìm kiếm tham khảo từ khóa từ tên món đồ trong Catalog. Nền tảng không hứa hẹn có sẵn hàng, dịch vụ cho thuê hoặc chứng thực chất lượng lịch sử của các sản phẩm trên sàn thương mại điện tử bên thứ ba.
            </p>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/90 flex items-center justify-between text-xs text-stone-400">
          <span>
            Đang so sánh: <strong>{outfitA ? outfitA.name : '—'}</strong> vs <strong>{outfitB ? outfitB.name : '—'}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium cursor-pointer transition-colors"
          >
            Đóng bảng so sánh
          </button>
        </div>
      </div>
    </div>
  );
};
