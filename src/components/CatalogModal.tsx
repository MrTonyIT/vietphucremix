import React, { useState } from 'react';
import { X, Layers } from 'lucide-react';
import { CatalogItem, SlotLabels, SlotType } from '../types/fashion';
import { ShopeeSearchButton } from './ShopeeSearchButton';
import { useModalA11y } from '../utils/useModalA11y';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogItems: CatalogItem[];
}

export const CatalogModal: React.FC<CatalogModalProps> = ({
  isOpen,
  onClose,
  catalogItems,
}) => {
  const [filterSlot, setFilterSlot] = useState<string>('all');
  const modalRef = React.useRef<HTMLDivElement>(null);

  useModalA11y({
    isOpen,
    onClose,
    modalRef,
  });

  if (!isOpen) return null;

  const filteredCatalog = catalogItems.filter((item) => {
    if (filterSlot === 'all') return true;
    return item.slot === filterSlot;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-stone-900 border border-stone-800 rounded-3xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden focus:outline-none"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-stone-800 flex items-center justify-between gap-3 bg-stone-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 id="catalog-modal-title" className="text-base sm:text-lg font-bold text-white font-serif">
                Thư Viện Catalog Minh Họa ({catalogItems.length} món)
              </h3>
              <p className="text-xs text-stone-300">
                Dữ liệu thiết kế gốc dùng cho các bộ phối và thuật toán hoán đổi món đồ.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng thư viện catalog"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center text-sm cursor-pointer transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 sm:px-6 py-3 border-b border-stone-800 bg-stone-950/40 flex items-center space-x-2 overflow-x-auto">
          <span className="text-xs text-stone-300 shrink-0 font-medium">Lọc slot:</span>
          {['all', 'main', 'lower', 'inner', 'headwear', 'footwear', 'accessory'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSlot(s)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 cursor-pointer transition-all ${
                filterSlot === s
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm'
                  : 'bg-stone-800/80 text-stone-300 hover:text-stone-100 hover:bg-stone-700'
              }`}
            >
              {s === 'all' ? 'Tất cả' : SlotLabels[s as SlotType]?.vi || s}
            </button>
          ))}
        </div>

        {/* Catalog Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {filteredCatalog.map((item) => (
            <div
              key={item.id}
              className="bg-stone-950/60 border border-stone-800 rounded-2xl p-4 space-y-2.5 flex flex-col justify-between hover:border-stone-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="font-mono bg-stone-850 px-1.5 py-0.5 rounded border border-stone-800">{item.sku}</span>
                  <span className="text-amber-400 font-medium">{SlotLabels[item.slot]?.vi}</span>
                </div>
                <h5 className="text-sm font-semibold text-stone-100 mt-1.5">
                  {item.name}
                </h5>
                <p className="text-xs text-stone-300 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-stone-600 shadow-sm"
                    style={{ backgroundColor: item.hexColor }}
                    title={item.colorName}
                  />
                  <span className="text-[11px] text-stone-300">{item.colorName}</span>
                </div>
                {item.isModern ? (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 font-semibold border border-purple-700/50">
                    Remix
                  </span>
                ) : (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                    Cổ truyền
                  </span>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <ShopeeSearchButton itemName={item.name} compact variant="badge" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between text-xs text-stone-300">
          <span>Tổng số: {filteredCatalog.length} / {catalogItems.length} món</span>
          <button
            onClick={onClose}
            className="min-h-[42px] px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
