import React from 'react';
import { X, Sparkles, Check, ArrowRight, Layers } from 'lucide-react';
import { CatalogItem, EntityDisplayData, EntitySlug, SlotLabels, SlotType } from '../types/fashion';
import { useModalA11y } from '../utils/useModalA11y';
import { ShopeeSearchButton } from './ShopeeSearchButton';

export interface CandidateOutfit {
  id: string;
  recipeId: string;
  recipeName: string;
  entitySlug: EntitySlug;
  items: Record<SlotType, CatalogItem>;
  itemIds: string[];
  matchScore: number;
  colorHarmony: string;
  rationale: string;
  validation: any;
}

interface RecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidateOutfit[];
  onApplyCandidate: (candidate: CandidateOutfit) => void;
  criteria: {
    event?: string;
    style?: string;
    preferredColor?: string;
  };
}

export const RecommendationsModal: React.FC<RecommendationsModalProps> = ({
  isOpen,
  onClose,
  candidates,
  onApplyCandidate,
  criteria,
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  useModalA11y({
    isOpen,
    onClose,
    modalRef,
  });

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rec-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-stone-900 border border-stone-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden focus:outline-none"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 mr-1" />
                <span>Gợi ý phối đồ thông minh</span>
              </span>
            </div>
            <h3 id="rec-modal-title" className="text-base sm:text-lg font-bold text-white font-serif mt-1">
              Gợi Ý Bộ Phối Phù Hợp ({candidates.length} gợi ý)
            </h3>
            <p className="text-xs text-stone-300">
              Đánh giá theo tiêu chí: {criteria.event || 'Mặc định'} • {criteria.preferredColor || 'Màu tự do'} • {criteria.style || 'Phong cách đa dạng'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng bảng gợi ý phối đồ"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center text-sm cursor-pointer transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidates List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {candidates.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-sm">
              Không tìm thấy bộ phối phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            candidates.map((cand, idx) => {
              const display = EntityDisplayData[cand.entitySlug];
              return (
                <div
                  key={cand.id}
                  className="bg-stone-950/70 border border-stone-800 hover:border-stone-700 rounded-2xl p-4 sm:p-5 space-y-3 transition-all"
                >
                  {/* Candidate Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                          Gợi ý #{idx + 1}
                        </span>
                        <h4 className="text-base font-bold text-white font-serif">
                          {cand.recipeName}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                          {display?.name}
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 mt-1">
                        {cand.rationale}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 self-start sm:self-center shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-stone-400">Độ khớp tiêu chí:</div>
                        <div className="text-sm font-bold text-amber-300">
                          {cand.matchScore}%
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onApplyCandidate(cand)}
                        aria-label={`Áp dụng bộ gợi ý ${cand.recipeName}`}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-900/30 transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Áp dụng bộ này</span>
                      </button>
                    </div>
                  </div>

                  {/* Harmony & Items Breakdown */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="text-stone-300">
                      Cảm quan phối màu: <strong className="text-stone-100">{cand.colorHarmony}</strong>
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-400 text-[11px] font-medium">
                        ✓ Đầy đủ cấu trúc
                      </span>
                      {cand.items.main && (
                        <ShopeeSearchButton itemName={cand.items.main.name} compact variant="badge" />
                      )}
                    </div>
                  </div>

                  {/* Mini Slots Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {Object.entries(cand.items).map(([slot, item]) => {
                      if (!item) return null;
                      return (
                        <div
                          key={slot}
                          className="bg-stone-900/80 border border-stone-800 rounded-xl p-2 text-xs flex items-center space-x-2"
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-stone-600 shrink-0"
                            style={{ backgroundColor: item.hexColor }}
                          />
                          <div className="overflow-hidden">
                            <div className="text-[10px] text-stone-400 truncate">
                              {SlotLabels[slot as SlotType]?.vi || slot}
                            </div>
                            <div className="font-medium text-stone-200 truncate">
                              {item.name}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between text-xs text-stone-300">
          <span>Đánh giá tự động theo quy tắc cấu trúc trang phục</span>
          <button
            onClick={onClose}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
