import React, { useState, useMemo } from 'react';
import {
  X,
  MapPin,
  Clock,
  Coins,
  ShieldAlert,
  Camera,
  ExternalLink,
  Sparkles,
  Compass,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EntitySlug, EntityDisplayData } from '../types/fashion';
import {
  HERITAGE_SPOTS,
  HeritageSpot,
  RegionType,
} from '../data/heritageSpotsData';

interface HeritageSpotRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSlug: EntitySlug;
}

export const HeritageSpotRadarModal: React.FC<HeritageSpotRadarModalProps> = ({
  isOpen,
  onClose,
  activeSlug,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<RegionType>('ALL');
  const [filterOnlyMatching, setFilterOnlyMatching] = useState<boolean>(true);
  const [selectedSpotId, setSelectedSpotId] = useState<string>(HERITAGE_SPOTS[0].id);

  // Filter spots
  const filteredSpots = useMemo(() => {
    return HERITAGE_SPOTS.filter((spot) => {
      // Region filter
      if (selectedRegion !== 'ALL' && spot.region !== selectedRegion) {
        return false;
      }
      // Matching outfit filter
      if (filterOnlyMatching && !spot.suitableEntities.includes(activeSlug)) {
        return false;
      }
      return true;
    });
  }, [selectedRegion, filterOnlyMatching, activeSlug]);

  // Selected spot
  const activeSpot = useMemo(() => {
    return (
      HERITAGE_SPOTS.find((s) => s.id === selectedSpotId) ||
      filteredSpots[0] ||
      HERITAGE_SPOTS[0]
    );
  }, [selectedSpotId, filteredSpots]);

  if (!isOpen) return null;

  const currentOutfitName = EntityDisplayData[activeSlug]?.name || 'Cổ Phục';

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
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1b140f] via-[#120d09] to-[#0a0705] border-2 border-[#d4af37]/40 shadow-2xl p-5 sm:p-7 text-white space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#cba369]/25 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600/30 to-emerald-950/60 border border-emerald-400/40 flex items-center justify-center text-emerald-300 text-xl shadow-inner">
                🗺️
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-wide">
                  Radar Tọa Độ Check-in Cổ Phục & Bản Đồ Bối Cảnh
                </h2>
                <p className="text-xs sm:text-sm text-[#d5c3aa]">
                  Danh bạ di tích 3 miền • Giờ vàng ánh sáng • Giá vé & Quy định trang phục chuẩn mực
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

          {/* Smart Recommendation Banner for Current Outfit */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-[#261a12] to-amber-950/60 border border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-stone-300">Đang phối: </span>
                <strong className="text-amber-200 font-serif text-sm">{currentOutfitName}</strong>
                <span className="text-stone-400 ml-1">
                  (Hệ thống tự động lọc các tọa độ di tích hòa hợp nhất với trang phục này)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFilterOnlyMatching(!filterOnlyMatching)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 shrink-0 ${
                filterOnlyMatching
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow'
                  : 'bg-stone-900/60 border-stone-700 text-stone-300 hover:border-amber-400'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{filterOnlyMatching ? 'Đang lọc theo đồ mặc' : 'Xem toàn bộ di tích'}</span>
            </button>
          </div>

          {/* Region Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#cba369]/20 pb-3">
            {[
              { id: 'ALL' as RegionType, label: 'Toàn Quốc (3 Miền)' },
              { id: 'BAC' as RegionType, label: 'Miền Bắc (Hà Nội, Đường Lâm)' },
              { id: 'TRUNG' as RegionType, label: 'Miền Trung (Huế, Hội An)' },
              { id: 'NAM' as RegionType, label: 'Miền Nam (Sài Gòn, Chợ Lớn)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRegion(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedRegion === tab.id
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 shadow-md font-bold'
                    : 'bg-[#221711] text-stone-300 hover:bg-[#2c1e16] border border-stone-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Layout: Left Spot Cards + Right Spot Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Left list (5 cols) */}
            <div className="md:col-span-5 space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredSpots.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#1d140e] border border-stone-800 text-center text-xs text-stone-400">
                  Không tìm thấy địa điểm phù hợp tiêu chí lọc. Thử tắt chế độ "Đang lọc theo đồ mặc" để xem tất cả.
                </div>
              ) : (
                filteredSpots.map((spot) => {
                  const isSelected = spot.id === activeSpot.id;
                  const isMatch = spot.suitableEntities.includes(activeSlug);

                  return (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => setSelectedSpotId(spot.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-950/70 to-[#271911] border-amber-400 shadow-md scale-[1.01]'
                          : 'bg-[#18110c] border-[#cba369]/25 hover:border-amber-400/50 hover:bg-[#201510]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-xs sm:text-sm font-bold font-serif text-white truncate">
                              {spot.name}
                            </h4>
                          </div>
                          <div className="text-[11px] text-stone-400 flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{spot.province}</span>
                            <span>•</span>
                            <span className="text-amber-300/90">{spot.regionName}</span>
                          </div>
                        </div>

                        {isMatch && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 shrink-0">
                            Khớp đồ
                          </span>
                        )}
                      </div>

                      <div className="mt-2 text-[11px] text-stone-300 line-clamp-1 italic">
                        {spot.vibeDescription}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Right Detailed Showcase (7 cols) */}
            <div className="md:col-span-7 rounded-3xl bg-[#1a120e] border border-[#d4af37]/40 p-5 space-y-4 shadow-xl">
              <div className="flex items-start justify-between gap-2 border-b border-[#cba369]/20 pb-3">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-[10px] font-bold text-amber-300 uppercase mb-1">
                    <Compass className="w-3 h-3" />
                    <span>{activeSpot.badge}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                    {activeSpot.name}
                  </h3>
                  <div className="text-xs text-stone-300 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{activeSpot.address}</span>
                  </div>
                </div>

                <a
                  href={activeSpot.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 shadow"
                >
                  <span>Chỉ Đường</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Outfit match note */}
              <div className="p-3 rounded-2xl bg-[#231812] border border-amber-500/30 text-xs flex items-center space-x-2">
                <span className="text-base">👘</span>
                <div>
                  <span className="text-stone-300">Cổ phục lý tưởng: </span>
                  <strong className="text-amber-300">{activeSpot.entityLabel}</strong>
                </div>
              </div>

              {/* Golden Hour & Ticket Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#140e0a] border border-[#cba369]/20 space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Giờ Vàng Ánh Sáng (Golden Hour)</span>
                  </div>
                  <p className="text-stone-200 text-[11px] leading-relaxed">
                    {activeSpot.goldenHour}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#140e0a] border border-[#cba369]/20 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Giá Vé & Giờ Mở Cửa</span>
                  </div>
                  <p className="text-stone-200 text-[11px] leading-relaxed">
                    {activeSpot.ticketPrice}
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Giờ mở cửa: {activeSpot.openHours}
                  </p>
                </div>
              </div>

              {/* Best angles */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Góc Chụp Thần Sầu Gợi Ý:</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {activeSpot.bestPhotoAngles.map((angle, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 rounded-xl bg-[#221711] border border-stone-800 text-xs text-stone-200 flex items-center space-x-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{angle}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Etiquette & Dress codes */}
              <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-1.5">
                <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Quy Định & Văn Hóa Chụp Ảnh Cần Nhớ:</span>
                </div>
                <ul className="text-[11px] text-stone-300 space-y-1 list-disc list-inside">
                  {activeSpot.etiquetteRules.map((rule, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#cba369]/20 text-xs text-stone-400">
            <span>* Thông tin giá vé và quy định được cập nhật theo ban quản lý di tích.</span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#2a1d15] hover:bg-[#38261b] border border-[#cba369]/30 text-white font-semibold transition-colors"
            >
              Đóng Radar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
