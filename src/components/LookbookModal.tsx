import React, { useState } from 'react';
import { X, Trash2, ArrowRight, Bookmark, Sparkles, AlertCircle, Scale, PlusCircle, Cloud, CloudCheck, Copy, Check, Search } from 'lucide-react';
import { EntityDisplayData, EntitySlug } from '../types/fashion';
import { LookbookEntry, seedSampleLookbooks, resolveLookbookItems } from '../utils/lookbookStorage';
import { useModalA11y } from '../utils/useModalA11y';
import { useAuth } from '../firebase/AuthContext';
import { playSilkChime } from '../utils/soundEffects';
import { ShopeeSearchButton } from './ShopeeSearchButton';

interface LookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LookbookEntry[];
  onApplyOutfit: (entry: LookbookEntry) => void;
  onDeleteEntry: (id: string) => void;
  onOpenCompare?: () => void;
  onRefreshEntries?: () => void;
}

export const LookbookModal: React.FC<LookbookModalProps> = ({
  isOpen,
  onClose,
  entries,
  onApplyOutfit,
  onDeleteEntry,
  onOpenCompare,
  onRefreshEntries,
}) => {
  const { user } = useAuth();
  const modalRef = React.useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useModalA11y({
    isOpen,
    onClose,
    modalRef,
  });

  if (!isOpen) return null;

  const handleCopyRecipe = (entry: LookbookEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    const resolution = resolveLookbookItems(entry.itemIds, entry.entitySlug);
    const itemLines = Object.entries(resolution.items)
      .map(([slot, item]) => `  • ${slot.toUpperCase()}: ${item.name} (${item.colorName})`)
      .join('\n');

    const shareText = `✨ Việt Phục Remix — Bộ Phối: ${entry.name}\n` +
      `🎎 Nhóm trang phục: ${EntityDisplayData[entry.entitySlug]?.name || entry.entitySlug}\n` +
      (entry.sceneName ? `🏛️ Bối cảnh: ${entry.sceneName}\n` : '') +
      (entry.colorHarmony ? `🎨 Hài hòa màu: ${entry.colorHarmony}\n` : '') +
      `📋 Chi tiết các món:\n${itemLines}\n` +
      `Lưu trữ lúc: ${entry.savedAt}\nhttps://ais-dev-7plbltnwa2aq723ue5p7ig-245885149119.asia-southeast1.run.app`;

    navigator.clipboard?.writeText(shareText).then(() => {
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2200);
    }).catch(() => {});
  };

  const filteredEntries = entries.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      (e.sceneName && e.sceneName.toLowerCase().includes(q)) ||
      (EntityDisplayData[e.entitySlug]?.name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lookbook-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden focus:outline-none"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 id="lookbook-modal-title" className="text-base sm:text-lg font-bold text-white font-serif">
                Lookbook Cá Nhân ({entries.length} bộ)
              </h3>
              <p className="text-xs text-stone-300 hidden sm:block">
                Lưu trữ an toàn trên thiết bị & Cloud Firestore. Có thể mặc lại bất cứ lúc nào.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onOpenCompare && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCompare();
                }}
                className="min-h-[42px] sm:min-h-[44px] px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-rose-600/30 hover:from-amber-600/50 hover:to-rose-600/50 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors"
                title="Mở bảng so sánh đối chiếu 2 bộ phối"
                aria-label="Mở so sánh Lookbook"
              >
                <Scale className="w-4 h-4" />
                <span className="hidden sm:inline">So Sánh</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center text-sm cursor-pointer transition-colors"
              aria-label="Đóng Lookbook"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search bar if entries > 1 */}
        {entries.length > 1 && (
          <div className="px-4 py-2.5 bg-stone-950/40 border-b border-stone-800/80 flex items-center space-x-2">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bộ phối theo tên hoặc bối cảnh..."
              className="w-full bg-transparent text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-stone-400 hover:text-white text-xs p-1"
              >
                Xóa
              </button>
            )}
          </div>
        )}

        {/* Content List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-800/80 text-stone-500 mx-auto flex items-center justify-center">
                <Bookmark className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-stone-300">
                  {searchQuery ? 'Không tìm thấy bộ phối phù hợp' : 'Lookbook của bạn đang trống'}
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  {searchQuery
                    ? 'Hãy thử tìm bằng từ khóa khác hoặc xóa bộ lọc.'
                    : 'Hãy tùy biến bộ đồ ưng ý và bấm nút "Lưu bộ đồ" trên bảng điều khiển để lưu lại.'}
                </p>
              </div>
              {!searchQuery && onRefreshEntries && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      seedSampleLookbooks();
                      onRefreshEntries();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Nạp 2 bộ phối mẫu (Áo dài & Ngũ thân)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const displayInfo = EntityDisplayData[entry.entitySlug];
              const resolution = resolveLookbookItems(entry.itemIds, entry.entitySlug);
              const itemsList = Object.values(resolution.items);

              return (
                <div
                  key={entry.id}
                  className="bg-stone-950/60 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all flex flex-col space-y-3 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-sm font-bold text-stone-100 font-serif">
                          {entry.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-amber-300 border border-stone-700">
                          {displayInfo?.name || entry.entitySlug}
                        </span>
                        {entry.sceneName && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/60">
                            {entry.sceneName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] text-stone-400 flex-wrap">
                        <span>Lưu lúc: {entry.savedAt}</span>
                        <span>•</span>
                        <span>{entry.itemIds.length} món</span>
                        {entry.colorHarmony && (
                          <>
                            <span>•</span>
                            <span className="text-amber-300/90 italic">{entry.colorHarmony}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
                      {/* Copy Share Button */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyRecipe(entry, e)}
                        aria-label="Sao chép chi tiết bộ phối"
                        className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700/60 transition-colors flex items-center space-x-1 cursor-pointer"
                        title="Sao chép chi tiết bộ phối để chia sẻ"
                      >
                        {copiedId === entry.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px]">Đã chép!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px] hidden sm:inline">Sao chép</span>
                          </>
                        )}
                      </button>

                      {/* Re-apply Button */}
                      <button
                        onClick={() => {
                          playSilkChime();
                          onApplyOutfit(entry);
                        }}
                        aria-label={`Mặc lại bộ ${entry.name}`}
                        className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600 hover:to-amber-500 hover:text-white text-amber-300 text-xs font-semibold border border-amber-500/40 transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Mặc lại</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="min-w-[40px] min-h-[40px] p-2 rounded-xl bg-stone-800/80 hover:bg-rose-900/40 text-stone-400 hover:text-rose-300 border border-stone-700/60 hover:border-rose-700/60 transition-colors cursor-pointer flex items-center justify-center"
                        title="Xóa bộ này khỏi Lookbook"
                        aria-label={`Xóa bộ ${entry.name} khỏi Lookbook`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Compact items chip row & Shopee search */}
                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center flex-wrap gap-1.5">
                      {itemsList.map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-stone-900 border border-stone-800 text-[10px] text-stone-300"
                        >
                          <span
                            className="w-2 h-2 rounded-full border border-stone-600 shrink-0"
                            style={{ backgroundColor: item.hexColor }}
                          />
                          <span className="truncate max-w-[120px]">{item.name}</span>
                        </span>
                      ))}
                    </div>
                    {itemsList[0] && (
                      <ShopeeSearchButton itemName={itemsList[0].name} compact variant="badge" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/80 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-300">
          <div className="flex items-center space-x-2">
            {user ? (
              <span className="flex items-center space-x-1.5 text-emerald-400">
                <Cloud className="w-3.5 h-3.5" />
                <span>Đã kết nối Firestore Cloud ({user.email})</span>
              </span>
            ) : (
              <span className="text-stone-400">
                Lưu cục bộ: <code className="text-amber-400">vietphuc_lookbook_v1</code> (Đăng nhập Google để đồng bộ Cloud)
              </span>
            )}
          </div>
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

