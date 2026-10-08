import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';
import { CatalogItem, EntitySlug, SlotLabels, SlotType } from '../types/fashion';
import { ShopeeSearchButton } from './ShopeeSearchButton';
import { useModalA11y } from '../utils/useModalA11y';

interface SlotSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: SlotType;
  entitySlug: EntitySlug;
  currentItem?: CatalogItem;
  catalogItems: CatalogItem[];
  onSelectNewItem: (item: CatalogItem) => void;
  isSwapping: boolean;
}

export const SlotSwapModal: React.FC<SlotSwapModalProps> = ({
  isOpen,
  onClose,
  slot,
  entitySlug,
  currentItem,
  catalogItems,
  onSelectNewItem,
  isSwapping,
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  useModalA11y({
    isOpen,
    onClose,
    modalRef,
  });

  if (!isOpen) return null;

  // Filter available items for this slot and entity
  const availableItems = catalogItems.filter(
    (item) =>
      item.slot === slot &&
      item.available &&
      (item.entitySlug === entitySlug || item.entitySlug === 'all')
  );

  const slotTitle = SlotLabels[slot]?.vi || slot;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slot-swap-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden focus:outline-none"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Đổi một món (Single-Slot Swap)
              </span>
            </div>
            <h3 id="slot-swap-title" className="text-base sm:text-lg font-bold text-white font-serif mt-1">
              Chọn món mới cho: {slotTitle}
            </h3>
            <p className="text-xs text-stone-400">
              Chỉ thay đổi duy nhất vị trí này; tất cả 5 vị trí còn lại được giữ nguyên 100%.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng bảng đổi món"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center text-sm cursor-pointer transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Item Callout */}
        {currentItem && (
          <div className="px-4 sm:px-5 py-3 bg-stone-950/40 border-b border-stone-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-stone-400">Món đang mặc:</span>
              <span className="font-semibold text-stone-200">{currentItem.name}</span>
            </div>
            <span
              className="w-3.5 h-3.5 rounded-full border border-stone-600 shrink-0"
              style={{ backgroundColor: currentItem.hexColor }}
              title={currentItem.colorName}
            />
          </div>
        )}

        {/* Available Options List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {availableItems.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs italic">
              Hiện chưa có thêm lựa chọn thay thế khả dụng cho vị trí này trong nhóm trang phục hiện tại.
            </div>
          ) : (
            availableItems.map((item) => {
              const isSelected = currentItem?.id === item.id;
              return (
                <article
                  key={item.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/30'
                      : 'bg-stone-950/50 border-stone-800 hover:border-stone-700 hover:bg-stone-800/30'
                  }`}
                >
                  <div className="space-y-1 pr-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded">
                        {item.sku}
                      </span>
                      <h4 className="text-sm font-semibold text-stone-100">
                        {item.name}
                      </h4>
                      {item.isModern && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/40 text-purple-300 font-semibold border border-purple-700/50">
                          Remix
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center space-x-2 pt-1 flex-wrap gap-y-1">
                      <div className="flex items-center space-x-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-stone-600"
                          style={{ backgroundColor: item.hexColor }}
                        />
                        <span className="text-[10px] text-stone-300">{item.colorName}</span>
                      </div>
                      <span className="text-stone-600">•</span>
                      <div className="flex space-x-1">
                        {item.styleTags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[9px] text-stone-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-stone-600">•</span>
                      <ShopeeSearchButton itemName={item.name} compact />
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30 flex items-center space-x-1">
                        <Check className="w-3 h-3 mr-0.5" />
                        <span>Đang mặc</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isSwapping) onSelectNewItem(item);
                        }}
                        disabled={isSwapping}
                        aria-label={`Chọn món ${item.name} cho vị trí ${slotTitle}`}
                        className="min-h-[42px] px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-amber-600 hover:text-white text-stone-200 text-xs font-semibold transition-all border border-stone-700 hover:border-amber-500 cursor-pointer flex items-center space-x-1.5"
                      >
                        {isSwapping ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span>Chọn món này</span>
                        )}
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between text-xs text-stone-400">
          <span>Tìm thấy {availableItems.length} món tương thích</span>
          <button
            onClick={onClose}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};
