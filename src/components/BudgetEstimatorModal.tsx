import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  MapPin,
  X,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  TrendingDown,
  Info,
  Check,
  Building2,
  Phone,
  Tag,
} from 'lucide-react';
import { CatalogItem, SlotLabels, SlotType } from '../types/fashion';
import { getShopeeSearchUrl } from '../utils/shopeeLink';
import { useModalA11y } from '../utils/useModalA11y';

export interface BudgetEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItems: Partial<Record<SlotType, CatalogItem>>;
}

interface RentalStore {
  name: string;
  city: 'hanoi' | 'hcm' | 'hue' | 'danang';
  cityName: string;
  address: string;
  priceRange: string;
  highlights: string[];
  contactNote: string;
}

export const BudgetEstimatorModal: React.FC<BudgetEstimatorModalProps> = ({
  isOpen,
  onClose,
  currentItems,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  const [selectedCity, setSelectedCity] = useState<'all' | 'hanoi' | 'hcm' | 'hue' | 'danang'>('all');

  useModalA11y({
    isOpen,
    onClose,
    modalRef,
    initialFocusRef: primaryBtnRef,
  });

  // Bảng giá tham chiếu thị trường Việt phục sinh viên 2026 (Đơn vị: VNĐ)
  const slotPricingMap: Record<SlotType, { rent: [number, number]; buy: [number, number] }> = {
    main: { rent: [120000, 180000], buy: [650000, 1500000] },
    lower: { rent: [30000, 50000], buy: [150000, 350000] },
    inner: { rent: [25000, 40000], buy: [100000, 250000] },
    headwear: { rent: [20000, 40000], buy: [90000, 220000] },
    footwear: { rent: [25000, 40000], buy: [120000, 350000] },
    accessory: { rent: [15000, 30000], buy: [60000, 180000] },
  };

  // Tính toán tổng ngân sách dự kiến của bộ đồ đang chọn
  const equippedSlots = (Object.keys(currentItems) as SlotType[]).filter(
    (slot) => Boolean(currentItems[slot])
  );

  let totalRentMin = 0;
  let totalRentMax = 0;
  let totalBuyMin = 0;
  let totalBuyMax = 0;

  equippedSlots.forEach((slot) => {
    const pricing = slotPricingMap[slot];
    totalRentMin += pricing.rent[0];
    totalRentMax += pricing.rent[1];
    totalBuyMin += pricing.buy[0];
    totalBuyMax += pricing.buy[1];
  });

  // Danh bạ cửa tiệm & studio cho thuê cổ phục uy tín
  const stores: RentalStore[] = [
    {
      name: 'Vạn Thiên Y — Cổ Phục Việt',
      city: 'hanoi',
      cityName: 'Hà Nội',
      address: 'Số 18 Hàng Bông, Quận Hoàn Kiếm, Hà Nội',
      priceRange: '120.000đ – 220.000đ / ngày',
      highlights: ['Chuyên Áo Dài tà kép, Ngũ Thân', 'Có gói chụp kỷ yếu trọn gói cho lớp'],
      contactNote: 'Inbox Fanpage hoặc đặt trước 2 ngày',
    },
    {
      name: 'Hoa Niên — Năm Tháng Tươi Đẹp',
      city: 'hanoi',
      cityName: 'Hà Nội',
      address: 'Khu tập thể Đại học Sư Phạm, Cầu Giấy, Hà Nội',
      priceRange: '100.000đ – 180.000đ / ngày',
      highlights: ['Ưu đãi giảm 20% thẻ sinh viên', 'Đầy đủ phụ kiện nón quai thao & thẻ bài'],
      contactNote: 'Hỗ trợ thử đồ trực tiếp miễn phí',
    },
    {
      name: 'Y Vân Hiến Cổ Trang',
      city: 'hanoi',
      cityName: 'Hà Nội',
      address: 'Ngõ 29 Láng Hạ, Ba Đình, Hà Nội',
      priceRange: '180.000đ – 350.000đ / ngày',
      highlights: ['Dòng gấm lụa cao cấp hoàng cung', 'Chuẩn phom dáng khảo cứu bảo tàng'],
      contactNote: 'Phù hợp ảnh kỷ yếu concept sang trọng',
    },
    {
      name: 'Đại Việt Cổ Phong Studio',
      city: 'hcm',
      cityName: 'TP. Hồ Chí Minh',
      address: '24 Đường số 5, Cư xá Đô Thành, Quận 3, TP.HCM',
      priceRange: '130.000đ – 240.000đ / ngày',
      highlights: ['Nhiều mẫu Áo Dài cách tân remix', 'Cho thuê kèm giày bốt & loafer hiện đại'],
      contactNote: 'Giảm 15% khi thuê nhóm từ 4 người',
    },
    {
      name: 'Thiên Nam Lịch Đại Hậu Y',
      city: 'hcm',
      cityName: 'TP. Hồ Chí Minh',
      address: '158/7 Nguyễn Công Trứ, Quận 1, TP.HCM',
      priceRange: '140.000đ – 260.000đ / ngày',
      highlights: ['Đa dạng ngũ thân tay chẽn & tay thụng', 'Có thợ trang điểm làm tóc cổ trang'],
      contactNote: 'Mở cửa từ 9h – 21h hàng ngày',
    },
    {
      name: 'Cố Đô Cổ Phục Huế',
      city: 'hue',
      cityName: 'Thừa Thiên Huế',
      address: '42 Lê Lợi, Phường Phú Hội, TP. Huế',
      priceRange: '80.000đ – 160.000đ / ngày',
      highlights: ['Địa bàn chụp ảnh Đại Nội lý tưởng', 'Mẫu mã chuẩn phong vị cung đình Huế'],
      contactNote: 'Bao gồm nón bài thơ & guốc mộc',
    },
    {
      name: 'Đông Sơn Cổ Trang Huế',
      city: 'hue',
      cityName: 'Thừa Thiên Huế',
      address: '12 Nguyễn Trãi, Phường Thuận Hòa, TP. Huế',
      priceRange: '90.000đ – 170.000đ / ngày',
      highlights: ['Gói thuê theo giờ cho học sinh', 'Chất lụa mát mẻ chụp ngoài trời'],
      contactNote: 'Có dịch vụ chụp ảnh trọn gói tại lăng tẩm',
    },
    {
      name: 'Yên Lam Studio Đà Nẵng',
      city: 'danang',
      cityName: 'Đà Nẵng',
      address: '88 Bạch Đằng, Quận Hải Châu, TP. Đà Nẵng',
      priceRange: '110.000đ – 200.000đ / ngày',
      highlights: ['Chụp ảnh kỷ yếu cầu Rồng & Hội An', 'Cung cấp áo tứ thân kèm yếm sen'],
      contactNote: 'Hỗ trợ giao trả đồ tận nơi Hội An',
    },
  ];

  const filteredStores = stores.filter(
    (store) => selectedCity === 'all' || store.city === selectedCity
  );

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
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
          aria-labelledby="budget-title"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-[#1a120c]/98 border border-[#cba369]/50 rounded-3xl shadow-2xl shadow-black/80 p-5 sm:p-7 text-stone-100 z-10 my-auto overflow-hidden ring-1 ring-amber-500/20 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#cba369]/25 pb-4 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#9b3424] to-[#cba369] flex items-center justify-center shadow-lg ring-1 ring-amber-400/40 shrink-0">
                <Coins className="w-5 h-5 text-[#fdf8f0]" />
              </div>
              <div>
                <h2
                  id="budget-title"
                  className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide leading-tight flex items-center space-x-2"
                >
                  <span>Dự Toán Ngân Sách & Địa Điểm Thuê Cổ Phục</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Gen Z Tiết Kiệm
                  </span>
                </h2>
                <p className="text-xs text-[#e5ceb5] mt-0.5">
                  Bảng tính ước lượng chi phí thuê/mua bộ đồ đang phối và địa chỉ tiệm thuê uy tín
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-900/60 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition-colors cursor-pointer shrink-0"
              aria-label="Đóng bảng dự toán"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="mt-4 flex-1 overflow-y-auto space-y-5 pr-1">
            {/* Summary Budget Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Rental Estimation Card */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 to-stone-900/80 border border-emerald-500/40 p-4 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs uppercase font-bold text-emerald-300 tracking-wider">
                      Ngân Sách Thuê Theo Ngày
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    Tiết kiệm ~85%
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline space-x-2">
                  <span className="text-2xl sm:text-3xl font-bold font-serif text-white">
                    {formatVND(totalRentMin)} – {formatVND(totalRentMax)}
                  </span>
                  <span className="text-xs text-stone-400">/ bộ</span>
                </div>

                <p className="text-xs text-stone-300 mt-1">
                  Đã tính {equippedSlots.length} món trong bộ phối hiện tại. Thuê nhóm $\ge 5$ người thường được chiết khấu thêm 15-20%.
                </p>
              </div>

              {/* Buying / Tailoring Estimation Card */}
              <div className="rounded-2xl bg-stone-900/70 border border-[#cba369]/35 p-4 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-xs uppercase font-bold text-[#f5d99f] tracking-wider">
                      Ngân Sách May / Mua Mới
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    Sở hữu vĩnh viễn
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline space-x-2">
                  <span className="text-2xl sm:text-3xl font-bold font-serif text-white">
                    {formatVND(totalBuyMin)} – {formatVND(totalBuyMax)}
                  </span>
                  <span className="text-xs text-stone-400">/ bộ</span>
                </div>

                <p className="text-xs text-stone-300 mt-1">
                  Chất liệu lụa tơ tằm dệt hoặc may đo chuẩn phom dáng ngũ thân/áo dài cá nhân.
                </p>
              </div>
            </div>

            {/* Breakdown by Equipped Items */}
            <div className="rounded-2xl bg-stone-900/50 border border-[#cba369]/25 p-4 space-y-3">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5 font-serif">
                <Tag className="w-3.5 h-3.5" />
                <span>Bóc Tách Chi Phí Từng Món Trong Bộ Đồ ({equippedSlots.length} món)</span>
              </h3>

              <div className="divide-y divide-stone-800">
                {equippedSlots.map((slot) => {
                  const item = currentItems[slot]!;
                  const price = slotPricingMap[slot];
                  return (
                    <div
                      key={slot}
                      className="py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center space-x-2.5 min-w-[200px]">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                          {SlotLabels[slot].vi}
                        </span>
                        <span className="font-medium text-white truncate max-w-[220px]">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className="text-stone-400 text-[11px]">Thuê: </span>
                          <span className="text-emerald-400 font-mono font-medium">
                            {formatVND(price.rent[0])} - {formatVND(price.rent[1])}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-stone-400 text-[11px]">Mua: </span>
                          <span className="text-amber-300 font-mono font-medium">
                            {formatVND(price.buy[0])} - {formatVND(price.buy[1])}
                          </span>
                        </div>

                        {/* Search on Shopee button */}
                        <a
                          href={getShopeeSearchUrl(item.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-orange-950/60 hover:bg-orange-900/80 border border-orange-500/40 text-[11px] text-orange-300 hover:text-white transition-colors cursor-pointer flex items-center space-x-1 shrink-0 no-underline"
                          title="Tìm mẫu tương tự trên Shopee"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Shopee ↗</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trusted Rental Stores Directory */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#cba369]/25 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white font-serif">
                    Danh Bạ Tiệm & Studio Cho Thuê Cổ Phục Uy Tín
                  </h3>
                </div>

                {/* City Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'hanoi', label: 'Hà Nội' },
                    { id: 'hcm', label: 'TP.HCM' },
                    { id: 'hue', label: 'Huế' },
                    { id: 'danang', label: 'Đà Nẵng' },
                  ].map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => setSelectedCity(city.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        selectedCity === city.id
                          ? 'bg-[#cba369] text-[#1c120c] font-bold shadow-sm'
                          : 'bg-stone-900/60 text-stone-300 hover:text-white border border-stone-800'
                      }`}
                    >
                      {city.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stores Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredStores.map((store, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-stone-900/60 border border-[#cba369]/25 hover:border-amber-400/50 p-3.5 space-y-2 transition-all shadow hover:shadow-black/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white font-serif">
                        {store.name}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30 shrink-0">
                        {store.cityName}
                      </span>
                    </div>

                    <div className="flex items-start space-x-1.5 text-xs text-stone-300">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{store.address}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono">
                      <Tag className="w-3.5 h-3.5 shrink-0" />
                      <span>{store.priceRange}</span>
                    </div>

                    {/* Highlights */}
                    <div className="pt-1 flex flex-wrap gap-1">
                      {store.highlights.map((hl, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300"
                        >
                          ✓ {hl}
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] text-stone-400 italic pt-1 border-t border-stone-800">
                      💡 {store.contactNote}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-[#cba369]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-400 shrink-0">
            <span className="flex items-center space-x-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Giá thực tế có thể thay đổi nhẹ tùy theo số lượng thuê kỷ yếu và mùa cao điểm</span>
            </span>

            <button
              ref={primaryBtnRef}
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-medium text-stone-200 cursor-pointer self-end"
            >
              Đóng lại
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
