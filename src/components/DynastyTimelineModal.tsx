import React, { useState } from 'react';
import {
  X,
  History,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Crown,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Palette,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EntitySlug, EntityDisplayData } from '../types/fashion';
import { DYNASTY_ERAS, DynastyEra } from '../data/dynastyData';

interface DynastyTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDynasty: (slug: EntitySlug) => void;
  currentSlug: EntitySlug;
}

export const DynastyTimelineModal: React.FC<DynastyTimelineModalProps> = ({
  isOpen,
  onClose,
  onSelectDynasty,
  currentSlug,
}) => {
  const [selectedEraIndex, setSelectedEraIndex] = useState<number>(3); // Default Triều Nguyễn (Ngũ Thân)

  const activeEra = DYNASTY_ERAS[selectedEraIndex] || DYNASTY_ERAS[0];

  const handleApplyEra = () => {
    onSelectDynasty(activeEra.targetSlug);
    onClose();
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
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1b140f] via-[#120d09] to-[#0a0705] border-2 border-[#d4af37]/40 shadow-2xl p-5 sm:p-7 text-white space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#cba369]/25 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-600/30 to-amber-950/60 border border-amber-400/40 flex items-center justify-center text-amber-300 text-xl shadow-inner">
                📜
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-wide">
                  Dòng Thời Gian Lịch Sử & Phục Sức Triều Đại
                </h2>
                <p className="text-xs sm:text-sm text-[#d5c3aa]">
                  Hành trình nghìn năm di sản y quan Đại Việt • Điển chế mũ áo qua các thời kỳ hưng thịnh
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

          {/* Interactive Timeline Stepper Bar */}
          <div className="relative py-2 px-1">
            <div className="hidden sm:block absolute top-1/2 left-6 right-6 h-0.5 bg-gradient-to-r from-amber-700/30 via-amber-400/60 to-amber-700/30 -translate-y-1/2 z-0" />

            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-2">
              {DYNASTY_ERAS.map((era, idx) => {
                const isSelected = idx === selectedEraIndex;
                const isCurrentSlugMatching = era.targetSlug === currentSlug;

                return (
                  <button
                    key={era.id}
                    type="button"
                    onClick={() => setSelectedEraIndex(idx)}
                    className={`relative p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-600/40 to-amber-950/80 border-amber-400 shadow-lg scale-105'
                        : 'bg-[#18110c] border-[#cba369]/20 hover:border-amber-400/40 hover:bg-[#221610]'
                    }`}
                  >
                    <div className="text-xl sm:text-2xl mb-1">{era.icon}</div>
                    <div className="text-xs sm:text-sm font-bold font-serif text-white truncate">
                      {era.name}
                    </div>
                    <div className="text-[10px] text-amber-300 font-mono mt-0.5">
                      {era.period}
                    </div>

                    {isCurrentSlugMatching && (
                      <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-stone-950 text-[9px] font-bold shadow">
                        Đang chọn
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Era Detailed Card */}
          <motion.div
            key={activeEra.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl bg-[#19120e] border border-[#d4af37]/40 p-5 sm:p-6 space-y-5 shadow-2xl"
          >
            {/* Banner with quote */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cba369]/20 pb-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-[10px] font-bold text-amber-300 uppercase mb-1">
                  <span>{activeEra.century}</span>
                  <span>•</span>
                  <span>{activeEra.rulerHighlight}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                  {activeEra.name} ({activeEra.period})
                </h3>
                <p className="text-xs text-stone-300 italic mt-1 leading-relaxed max-w-xl">
                  &ldquo;{activeEra.quote}&rdquo;
                </p>
              </div>

              {/* 1-Click apply button */}
              <button
                type="button"
                onClick={handleApplyEra}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shrink-0 shadow-lg cursor-pointer hover:scale-105"
              >
                <span>Chuyển Tủ Đồ & Phối Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Cultural Philosophy */}
            <div className="p-3.5 rounded-2xl bg-[#231812] border border-amber-500/30 text-xs leading-relaxed text-stone-200">
              <span className="font-bold text-amber-300 mr-1">Hồn cốt thời đại:</span>
              {activeEra.philosophy} {activeEra.description}
            </div>

            {/* 2-Column Specs: Features & Regulations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Costume features */}
              <div className="p-4 rounded-2xl bg-[#140e0a] border border-[#cba369]/20 space-y-2">
                <div className="text-amber-300 font-bold uppercase tracking-wider flex items-center space-x-1.5 text-[11px]">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Đặc Trưng Phục Sức & Phom Dáng:</span>
                </div>
                <ul className="text-stone-300 space-y-1.5 list-disc list-inside text-[11px]">
                  {activeEra.costumeFeatures.map((feat, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Regulations & Etiquette */}
              <div className="p-4 rounded-2xl bg-[#140e0a] border border-[#cba369]/20 space-y-2">
                <div className="text-emerald-300 font-bold uppercase tracking-wider flex items-center space-x-1.5 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Điển Chế Mũ Áo & Lễ Nghi:</span>
                </div>
                <ul className="text-stone-300 space-y-1.5 list-disc list-inside text-[11px]">
                  {activeEra.regulations.map((reg, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {reg}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Motifs & Color Palette Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#cba369]/20 text-xs">
              <div className="flex items-center space-x-2">
                <Palette className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-stone-400">Hoa văn tiêu biểu:</span>
                <span className="text-amber-200 font-medium">
                  {activeEra.motifs.join(' • ')}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-stone-400">Bảng màu:</span>
                <span className="text-stone-200 font-medium">
                  {activeEra.colors.join(', ')}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-[#cba369]/20 text-xs">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={selectedEraIndex === 0}
                onClick={() => setSelectedEraIndex((prev) => Math.max(prev - 1, 0))}
                className="px-3 py-1.5 rounded-xl bg-[#221711] hover:bg-[#2c1e16] disabled:opacity-40 text-stone-300 border border-stone-800 transition-colors flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Thời kỳ trước</span>
              </button>

              <button
                type="button"
                disabled={selectedEraIndex === DYNASTY_ERAS.length - 1}
                onClick={() => setSelectedEraIndex((prev) => Math.min(prev + 1, DYNASTY_ERAS.length - 1))}
                className="px-3 py-1.5 rounded-xl bg-[#221711] hover:bg-[#2c1e16] disabled:opacity-40 text-stone-300 border border-stone-800 transition-colors flex items-center space-x-1"
              >
                <span>Thời kỳ sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#271b14] hover:bg-[#35251b] text-stone-300 border border-[#cba369]/30 transition-colors"
            >
              Đóng Dòng Thời Gian
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
