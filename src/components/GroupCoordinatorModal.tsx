import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  User,
  Heart,
  Sparkles,
  CheckCircle2,
  X,
  Palette,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { CharacterOutfitCanvas } from './OutfitVisualizer';
import { CatalogItem, EntitySlug, GenderType, SlotType } from '../types/fashion';
import { CATALOG_ITEMS } from '../data/catalog';
import { useModalA11y } from '../utils/useModalA11y';
import { playSilkChime, isSoundEnabled } from '../utils/soundEffects';

export interface GroupCoordinatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyOutfit: (items: Partial<Record<SlotType, CatalogItem>>, entitySlug: EntitySlug, gender: GenderType) => void;
}

interface CharacterPreset {
  id: string;
  name: string;
  role: string;
  gender: GenderType;
  entitySlug: EntitySlug;
  items: Partial<Record<SlotType, CatalogItem>>;
}

interface CoordinationTheme {
  id: string;
  title: string;
  tagline: string;
  philosophy: string;
  harmonyScore: number;
  paletteNames: string[];
  characters: CharacterPreset[];
}

export const GroupCoordinatorModal: React.FC<GroupCoordinatorModalProps> = ({
  isOpen,
  onClose,
  onApplyOutfit,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  useModalA11y({
    isOpen,
    onClose,
    modalRef,
    initialFocusRef: primaryBtnRef,
  });

  // Helper tìm item an toàn
  const getItem = (id: string): CatalogItem => {
    return CATALOG_ITEMS.find((it) => it.id === id) || CATALOG_ITEMS[0];
  };

  // 4 Chủ đề phối đôi & nhóm chuẩn mực văn hóa
  const themes: CoordinationTheme[] = [
    {
      id: 'theme-couple-royalty',
      title: 'Thanh Mai Trúc Mã (Hỷ Khí Cung Đình)',
      tagline: 'Phối Đôi Nam Nữ — Cổ Phong Trang Nhã',
      philosophy: 'Hòa sắc Tương Sinh: Chàng diện Ngũ Thân chẽn sắc xanh trầm uy nghi, Nàng tôn sắc Áo Dài trắng ngà thêu hoa sen trang nhã.',
      harmonyScore: 98,
      paletteNames: ['Lam Khói', 'Bạch Ngọc', 'Hoàng Kim', 'Chàm Sẫm'],
      characters: [
        {
          id: 'char-male',
          name: 'Chàng Nho Sĩ',
          role: 'Nam Sinh',
          gender: 'nam',
          entitySlug: 'ngu-than',
          items: {
            main: getItem('item-main-nguthan-xanh-reu'),
            lower: getItem('item-lower-quan-lua-trang'),
            headwear: getItem('item-head-khan-dong-nam-den'),
            footwear: getItem('item-foot-guoc-moc-quai-nhung'),
            accessory: getItem('item-acc-the-bai-go'),
          },
        },
        {
          id: 'char-female',
          name: 'Nàng Tiểu Thư',
          role: 'Nữ Sinh',
          gender: 'nu',
          entitySlug: 'ao-dai',
          items: {
            main: getItem('item-main-aodai-trang'),
            lower: getItem('item-lower-quan-lua-trang'),
            headwear: getItem('item-head-non-la-hue'),
            footwear: getItem('item-foot-hai-theu-hoa-sen'),
            accessory: getItem('item-acc-quat-tram-huong'),
          },
        },
      ],
    },
    {
      id: 'theme-couple-kinhbac',
      title: 'Kinh Bắc Giao Duyên (Quan Họ & Cố Đô)',
      tagline: 'Phối Đôi Lễ Hội — Đậm Tình Dân Gian',
      philosophy: 'Nàng Tứ Thân yếm đào nón quai thao xứ Bắc gặp gỡ Chàng Nho Sĩ áo dài tay thụng đĩnh đạc.',
      harmonyScore: 95,
      paletteNames: ['Hồng Cánh Sen', 'Nâu Sồng', 'Đỏ Chu Sa', 'Hắc Ngọc'],
      characters: [
        {
          id: 'char-male-kb',
          name: 'Chàng Thư Sinh',
          role: 'Nam Sinh',
          gender: 'nam',
          entitySlug: 'ngu-than',
          items: {
            main: getItem('item-main-aodai-nam-luc-bao'),
            lower: getItem('item-lower-quan-lua-trang'),
            headwear: getItem('item-head-khan-dong-nam-den'),
            footwear: getItem('item-foot-loafer-den-remix'),
            accessory: getItem('item-acc-the-bai-go'),
          },
        },
        {
          id: 'char-female-kb',
          name: 'Liền Chị Quan Họ',
          role: 'Nữ Sinh',
          gender: 'nu',
          entitySlug: 'tu-than',
          items: {
            main: getItem('item-main-tuthan-nau-song'),
            lower: getItem('item-lower-vay-linh-den'),
            inner: getItem('item-inner-yem-canh-sen'),
            headwear: getItem('item-head-non-quai-thao'),
            footwear: getItem('item-foot-guoc-moc-quai-nhung'),
            accessory: getItem('item-acc-quat-tram-huong'),
          },
        },
      ],
    },
    {
      id: 'theme-trio-kyyeu',
      title: 'Tam Thanh Kỷ Yếu (Nhóm Bạn 3 Người)',
      tagline: 'Bộ Ba Kỷ Yếu Học Đường — Tone-Sur-Tone Trắng Kem',
      philosophy: 'Đồng điệu sắc trắng lụa ngọc trai thanh xuân: Áo dài nữ sinh, Ngũ thân cách tân hoa nhí và Áo dài nam đồng phục.',
      harmonyScore: 97,
      paletteNames: ['Trắng Ngà', 'Kem Sữa', 'Bạch Tuyết', 'Hạt Dẻ'],
      characters: [
        {
          id: 'char-trio-1',
          name: 'Nữ Sinh 1',
          role: 'Áo Dài Truyền Thống',
          gender: 'nu',
          entitySlug: 'ao-dai',
          items: {
            main: getItem('item-main-aodai-trang'),
            lower: getItem('item-lower-quan-lua-trang'),
            headwear: getItem('item-head-khan-van-hong-dao'),
            footwear: getItem('item-foot-hai-theu-hoa-sen'),
            accessory: getItem('item-acc-quat-tram-huong'),
          },
        },
        {
          id: 'char-trio-2',
          name: 'Nam Sinh',
          role: 'Ngũ Thân Học Đường',
          gender: 'nam',
          entitySlug: 'ngu-than',
          items: {
            main: getItem('item-main-nguthan-xanh-reu'),
            lower: getItem('item-lower-quan-lua-trang'),
            headwear: getItem('item-head-khan-dong-nam-den'),
            footwear: getItem('item-foot-sneaker-canvas-retro'),
            accessory: getItem('item-acc-the-bai-go'),
          },
        },
        {
          id: 'char-trio-3',
          name: 'Nữ Sinh 2',
          role: 'Cách Tân Hoa Nhí',
          gender: 'nu',
          entitySlug: 'ao-dai',
          items: {
            main: getItem('item-main-aodai-hoa-nhi'),
            lower: getItem('item-lower-quan-lua-trang'),
            headwear: getItem('item-head-khan-lua-van-may'),
            footwear: getItem('item-foot-loafer-den-remix'),
            accessory: getItem('item-acc-tui-gam-theu'),
          },
        },
      ],
    },
    {
      id: 'theme-couple-remix',
      title: 'Gen Z Tân Cổ Giao Duyên',
      tagline: 'Phối Đôi Phong Cách Phố Thị Đương Đại',
      philosophy: 'Cặp đôi năng động với sự kết hợp hài hòa giữa chất liệu tơ lụa cổ truyền và phụ kiện giày Loafer/Sneaker trẻ trung.',
      harmonyScore: 93,
      paletteNames: ['Hồng Phấn', 'Xanh Lam', 'Đen Tuyết', 'Vàng Cát'],
      characters: [
        {
          id: 'char-male-remix',
          name: 'Chàng Trai Hiện Đại',
          role: 'Ngũ Thân Loafer',
          gender: 'nam',
          entitySlug: 'ngu-than',
          items: {
            main: getItem('item-main-nguthan-do-chusa'),
            lower: getItem('item-lower-quan-lua-trang'),
            headwear: getItem('item-head-khan-dong-nam-den'),
            footwear: getItem('item-foot-loafer-den-remix'),
            accessory: getItem('item-acc-ngoc-boi-eo'),
          },
        },
        {
          id: 'char-female-remix',
          name: 'Cô Gái Phố Thị',
          role: 'Áo Dài Sneaker',
          gender: 'nu',
          entitySlug: 'ao-dai',
          items: {
            main: getItem('item-main-aodai-hong-dao'),
            lower: getItem('item-lower-quan-lua-trang'),
            headwear: getItem('item-head-khan-lua-van-may'),
            footwear: getItem('item-foot-sneaker-canvas-retro'),
            accessory: getItem('item-acc-tui-gam-theu'),
          },
        },
      ],
    },
  ];

  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number>(0);
  const currentTheme = themes[selectedThemeIndex];

  const handleApplyCharacter = (char: CharacterPreset) => {
    if (isSoundEnabled()) {
      playSilkChime();
    }
    onApplyOutfit(char.items, char.entitySlug, char.gender);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
          aria-hidden="true"
        />

        {/* Modal Dialog */}
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="group-coord-title"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl bg-[#1a120c]/98 border border-[#cba369]/50 rounded-3xl shadow-2xl shadow-black/80 p-5 sm:p-7 text-stone-100 z-10 my-auto overflow-hidden ring-1 ring-amber-500/20 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#cba369]/25 pb-4 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#9b3424] to-[#cba369] flex items-center justify-center shadow-lg ring-1 ring-amber-400/40 shrink-0">
                <Users className="w-5 h-5 text-[#fdf8f0]" />
              </div>
              <div>
                <h2
                  id="group-coord-title"
                  className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide leading-tight flex items-center space-x-2"
                >
                  <span>Phối Đồ Đôi & Nhóm Kỷ Yếu</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    AI Harmony 2026
                  </span>
                </h2>
                <p className="text-xs text-[#e5ceb5] mt-0.5">
                  Tự động điều phối màu sắc và khí chất, tránh xung đột trang phục khi chụp kỷ yếu nhóm
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-900/60 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition-colors cursor-pointer shrink-0"
              aria-label="Đóng bảng phối đôi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Theme Selector Tabs */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 shrink-0 scrollbar-thin">
            {themes.map((thm, idx) => (
              <button
                key={thm.id}
                type="button"
                onClick={() => setSelectedThemeIndex(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border cursor-pointer flex items-center space-x-1.5 ${
                  selectedThemeIndex === idx
                    ? 'bg-gradient-to-r from-[#9b3424]/80 to-[#cba369]/80 text-white border-amber-400 shadow-md font-semibold'
                    : 'bg-stone-900/60 text-stone-300 hover:text-white border-[#cba369]/20 hover:border-[#cba369]/40'
                }`}
              >
                <span>{thm.title}</span>
                <span className="text-[10px] font-mono opacity-80">({thm.characters.length} người)</span>
              </button>
            ))}
          </div>

          {/* Body: Multi-character Canvas & Philosophy Card */}
          <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Philosophy Banner */}
            <div className="rounded-2xl bg-stone-900/70 border border-[#cba369]/30 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-serif">
                    {currentTheme.tagline}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Độ hòa sắc: {currentTheme.harmonyScore}%
                  </span>
                </div>
                <p className="text-xs text-stone-300 italic">
                  "{currentTheme.philosophy}"
                </p>
              </div>

              {/* Color Swatches */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="text-[11px] text-stone-400 mr-1 hidden sm:inline">Bảng sắc:</span>
                {currentTheme.paletteNames.map((name, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-800 text-[#f5d99f] border border-stone-700"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {/* Character Cards Grid */}
            <div
              className={`grid gap-4 ${
                currentTheme.characters.length === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {currentTheme.characters.map((char, index) => (
                <div
                  key={char.id}
                  className="rounded-2xl bg-[#221711]/80 border border-[#cba369]/35 hover:border-amber-400/60 p-3.5 sm:p-4 flex flex-col justify-between transition-all shadow-lg hover:shadow-black/60 relative overflow-hidden group"
                >
                  {/* Top Character Tag */}
                  <div className="flex items-center justify-between border-b border-[#cba369]/20 pb-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-900/60 flex items-center justify-center text-amber-300 text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-serif">{char.name}</h4>
                        <span className="text-[10px] text-stone-400 font-mono">{char.role}</span>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/20">
                      {char.gender === 'nam' ? 'Nam' : 'Nữ'}
                    </span>
                  </div>

                  {/* Character Visual Canvas */}
                  <div className="h-64 sm:h-72 w-full flex items-center justify-center relative my-1 bg-black/20 rounded-xl overflow-hidden">
                    <CharacterOutfitCanvas
                      entitySlug={char.entitySlug}
                      items={char.items}
                      instanceId={`group-char-${char.id}`}
                      gender={char.gender}
                      ageGroup="thanh_nien"
                    />
                  </div>

                  {/* Items List Summary */}
                  <div className="mt-2 text-[11px] text-stone-300 space-y-1 bg-stone-950/40 p-2 rounded-xl border border-stone-800">
                    <div className="truncate">
                      <span className="text-amber-400 font-medium">Áo:</span> {char.items.main?.name}
                    </div>
                    <div className="truncate">
                      <span className="text-amber-400 font-medium">Dưới:</span> {char.items.lower?.name}
                    </div>
                    {char.items.headwear && (
                      <div className="truncate">
                        <span className="text-amber-400 font-medium">Nón:</span> {char.items.headwear?.name}
                      </div>
                    )}
                    {char.items.footwear && (
                      <div className="truncate">
                        <span className="text-amber-400 font-medium">Giày:</span> {char.items.footwear?.name}
                      </div>
                    )}
                  </div>

                  {/* Apply this Outfit Button */}
                  <button
                    type="button"
                    onClick={() => handleApplyCharacter(char)}
                    className="mt-3 w-full min-h-[40px] px-3 py-2 rounded-xl bg-gradient-to-r from-amber-900/70 to-stone-900 hover:from-amber-800 hover:to-stone-800 border border-[#cba369]/40 hover:border-amber-400 text-xs font-semibold text-[#f5d99f] hover:text-white transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow"
                  >
                    <span>Mặc bộ của {char.name} vào bàn phối</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-4 pt-3 border-t border-[#cba369]/25 flex items-center justify-between text-xs text-stone-400 shrink-0">
            <span className="flex items-center space-x-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Gợi ý: Chụp ảnh kỷ yếu đôi nên chọn cùng chất liệu lụa để phản xạ ánh sáng tương đồng</span>
            </span>

            <button
              ref={primaryBtnRef}
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-medium text-stone-200 cursor-pointer"
            >
              Đóng lại
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
