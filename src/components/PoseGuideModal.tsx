import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  Hand,
  PersonStanding,
  Footprints,
  Compass,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  POSE_CATEGORIES,
  POSE_ITEMS,
  PoseCategory,
  PoseItem,
} from '../data/poseGuideData';

interface PoseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PoseGuideModal: React.FC<PoseGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<PoseCategory>('NU');
  const [selectedPoseId, setSelectedPoseId] = useState<string>('nu-nang-ta-ao');

  const filteredPoses = useMemo(() => {
    return POSE_ITEMS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const activePose = useMemo(() => {
    return (
      filteredPoses.find((p) => p.id === selectedPoseId) ||
      filteredPoses[0] ||
      POSE_ITEMS[0]
    );
  }, [selectedPoseId, filteredPoses]);

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
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1c1510] via-[#120d09] to-[#090604] border-2 border-[#d4af37]/40 shadow-2xl p-5 sm:p-7 text-white space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#cba369]/25 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600/30 to-purple-950/60 border border-purple-400/40 flex items-center justify-center text-purple-300 text-xl shadow-inner">
                🪭
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-wide">
                  Cẩm Nang Tạo Dáng & Phong Thái Cổ Trang
                </h2>
                <p className="text-xs sm:text-sm text-[#d5c3aa]">
                  Bí kíp tạo hình chuẩn mực văn hóa • Nam nhi khí khái • Nữ tú đoan trang • Nhóm bạn kỷ yếu
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

          {/* Category Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {POSE_CATEGORIES.map((cat) => {
              const isCurrent = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    const firstPose = POSE_ITEMS.find((p) => p.category === cat.id);
                    if (firstPose) setSelectedPoseId(firstPose.id);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-br from-amber-600/30 to-amber-950/70 border-amber-400 shadow-md scale-[1.02]'
                      : 'bg-[#18110c] border-[#cba369]/20 hover:border-amber-400/40 hover:bg-[#201610]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs sm:text-sm font-bold font-serif text-white truncate">
                      {cat.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1 line-clamp-1">
                    {cat.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Body: Left Pose list + Right Pose Detail */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Left list of poses in category */}
            <div className="md:col-span-5 space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredPoses.map((pose) => {
                const isSelected = pose.id === activePose.id;
                return (
                  <button
                    key={pose.id}
                    type="button"
                    onClick={() => setSelectedPoseId(pose.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-950/80 to-[#271911] border-amber-400 shadow-lg scale-[1.01]'
                        : 'bg-[#18110c] border-[#cba369]/20 hover:border-amber-400/50 hover:bg-[#201510]'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5">
                      <span className="text-lg shrink-0 mt-0.5">{pose.visualIcon}</span>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold font-serif text-white truncate">
                          {pose.title}
                        </h4>
                        <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                          {pose.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right detailed guide */}
            <div className="md:col-span-7 rounded-3xl bg-[#19120d] border border-[#d4af37]/40 p-5 space-y-4 shadow-xl">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-[10px] font-bold text-amber-300 uppercase mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Ý Nghĩa Văn Hóa Cốt Cách</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                  {activePose.title}
                </h3>
                <p className="text-xs text-stone-300 italic mt-1 leading-relaxed border-l-2 border-amber-500/50 pl-2.5">
                  &ldquo;{activePose.culturalMeaning}&rdquo;
                </p>
              </div>

              {/* Step-by-step Posture Guide Matrix */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Hướng Dẫn Từng Vị Trí Cơ Thể:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Head & Eyes */}
                  <div className="p-2.5 rounded-xl bg-[#130d09] border border-stone-800 space-y-1">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Đầu & Ánh Mắt</span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      {activePose.postureGuide.headEyes}
                    </p>
                  </div>

                  {/* Hands & Arms */}
                  <div className="p-2.5 rounded-xl bg-[#130d09] border border-stone-800 space-y-1">
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                      <Hand className="w-3.5 h-3.5" />
                      <span>Tay & Cầm Phụ Kiện</span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      {activePose.postureGuide.handsArms}
                    </p>
                  </div>

                  {/* Body & Torso */}
                  <div className="p-2.5 rounded-xl bg-[#130d09] border border-stone-800 space-y-1">
                    <div className="flex items-center space-x-1.5 text-purple-400 font-semibold">
                      <PersonStanding className="w-3.5 h-3.5" />
                      <span>Thân & Tà Áo</span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      {activePose.postureGuide.bodyTorso}
                    </p>
                  </div>

                  {/* Feet & Stance */}
                  <div className="p-2.5 rounded-xl bg-[#130d09] border border-stone-800 space-y-1">
                    <div className="flex items-center space-x-1.5 text-blue-400 font-semibold">
                      <Footprints className="w-3.5 h-3.5" />
                      <span>Chân & Mũi Hài</span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      {activePose.postureGuide.feetStance}
                    </p>
                  </div>
                </div>
              </div>

              {/* Do's and Don'ts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Dos */}
                <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-emerald-300 uppercase tracking-wide text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Nên Làm (Tôn Dáng)</span>
                  </div>
                  <ul className="text-[11px] text-stone-300 space-y-1 list-disc list-inside">
                    {activePose.dos.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Donts */}
                <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-rose-300 uppercase tracking-wide text-[11px]">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Tránh Phạm (Mất Nét Cổ)</span>
                  </div>
                  <ul className="text-[11px] text-stone-300 space-y-1 list-disc list-inside">
                    {activePose.donts.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended props */}
              <div className="pt-2 border-t border-[#cba369]/20 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400">
                <div className="flex items-center space-x-2">
                  <span className="text-amber-300 font-semibold">Phụ kiện ăn ý:</span>
                  <span className="text-stone-200">
                    {activePose.recommendedProps.join(' • ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#cba369]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow cursor-pointer"
            >
              Đã Nắm Rõ Cốt Cách
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
