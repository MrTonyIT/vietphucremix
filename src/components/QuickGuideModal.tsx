import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Lock,
  Camera,
  X,
  Compass,
  ArrowRight,
  CheckCircle2,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useModalA11y } from '../utils/useModalA11y';
import { playSilkChime, isSoundEnabled } from '../utils/soundEffects';

export interface QuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ONBOARDING_STORAGE_KEY = 'vietphuc_onboarded_v1';

export const QuickGuideModal: React.FC<QuickGuideModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(0);

  useModalA11y({
    isOpen,
    onClose,
    modalRef,
    initialFocusRef: primaryBtnRef,
  });

  const handleFinish = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      } catch {}
    }
    if (isSoundEnabled()) {
      playSilkChime();
    }
    onClose();
  };

  const steps = [
    {
      id: 'step-recommend',
      icon: Sparkles,
      tag: 'Tính Năng 1',
      title: 'Gợi Ý Bộ Phối Thông Minh',
      desc: 'Chọn bối cảnh sự kiện (Kỷ yếu, Lễ hội, Dạo phố), độ tuổi & giới tính trên thanh điều khiển. Bấm nút "Gợi ý phối đồ" hoặc mở Trợ lý AI để nhận ngay các bộ phối chuẩn mực văn hóa (vạt áo, quy tắc ngũ thân, tứ thân, áo dài) phối cùng phụ kiện đương đại.',
      tip: 'Mẹo: Nhấn nút "Trợ lý AI" ở góc màn hình để trò chuyện và xin lời khuyên tạo dáng, phối màu chi tiết.',
      color: 'from-amber-500/20 to-orange-500/10',
      badgeColor: 'border-amber-500/40 text-amber-300',
    },
    {
      id: 'step-lock',
      icon: Lock,
      tag: 'Tính Năng 2',
      title: 'Khóa Vị Trí (Slot Lock)',
      desc: 'Khi bạn đã ưng ý một món đồ cụ thể (ví dụ: chiếc Áo Ngũ Thân đỏ chu sa hoặc đôi Giày Sneaker retro), hãy nhấn biểu tượng Ổ Khóa trên thẻ món đồ đó. Khi khóa, AI và tính năng đổi đồ sẽ giữ nguyên 100% món này mà không bao giờ thay thế.',
      tip: 'Mẹo: Bạn có thể khóa cùng lúc nhiều món đồ khác nhau để xây dựng bản phối theo đúng ý thích.',
      color: 'from-emerald-500/20 to-teal-500/10',
      badgeColor: 'border-emerald-500/40 text-emerald-300',
    },
    {
      id: 'step-studio',
      icon: Camera,
      tag: 'Tính Năng 3',
      title: 'Studio Bối Cảnh & Prompt AI',
      desc: 'Nhấn chuyển sang tab "Bối cảnh" để ngắm nhìn nhân vật hòa mình vào 4 không gian kiến trúc: Sân trường Đông Dương, Phố cổ Hà Nội, Cung đình Cố Đô, Studio nghệ thuật. Hệ thống tự động biên soạn câu lệnh (Prompt AI) chi tiết chuẩn xác.',
      tip: 'Mẹo: Bấm nút "Sao chép Prompt AI" để mang sang Midjourney hoặc Gemini tạo ảnh chân dung nghệ thuật độ nét cao.',
      color: 'from-purple-500/20 to-pink-500/10',
      badgeColor: 'border-purple-500/40 text-purple-300',
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleFinish}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
          aria-hidden="true"
        />

        {/* Modal Dialog */}
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-guide-title"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-[#1a120c]/98 border border-[#cba369]/50 rounded-3xl shadow-2xl shadow-black/80 p-5 sm:p-7 text-stone-100 z-10 my-auto overflow-hidden ring-1 ring-amber-500/20"
        >
          {/* Subtle Decorative Background Aura */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-amber-700/15 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#cba369]/25 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#9b3424] to-[#cba369] flex items-center justify-center shadow-lg ring-1 ring-amber-400/40 shrink-0">
                <Compass className="w-5 h-5 text-[#fdf8f0]" />
              </div>
              <div>
                <h2
                  id="quick-guide-title"
                  className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide leading-tight"
                >
                  Hướng Dẫn Nhanh Việt Phục Remix
                </h2>
                <p className="text-xs text-[#e5ceb5] mt-0.5">
                  3 tính năng cốt lõi giúp bạn phối đồ chuẩn xác và sáng tạo
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="p-2 rounded-xl bg-stone-900/60 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition-colors cursor-pointer shrink-0"
              aria-label="Đóng hướng dẫn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feature Cards Grid (Tabs / Stepper) */}
          <div className="mt-5 space-y-3 sm:space-y-3.5">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = activeStep === idx;
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`group rounded-2xl border transition-all p-3.5 sm:p-4 cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-r ' + step.color + ' border-[#cba369] shadow-lg shadow-black/40 ring-1 ring-[#cba369]/30'
                      : 'bg-stone-900/50 hover:bg-stone-900/80 border-[#cba369]/20 hover:border-[#cba369]/40'
                  }`}
                >
                  <div className="flex items-start space-x-3 sm:space-x-3.5">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? 'bg-[#2a1a11] border-[#cba369] text-amber-300 shadow-md scale-105'
                          : 'bg-stone-950/70 border-stone-800 text-stone-400 group-hover:text-amber-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${step.badgeColor} bg-black/30`}
                          >
                            {step.tag}
                          </span>
                          <h3
                            className={`text-sm sm:text-base font-bold font-serif transition-colors ${
                              isSelected ? 'text-white' : 'text-[#f5d99f] group-hover:text-white'
                            }`}
                          >
                            {step.title}
                          </h3>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                        {step.desc}
                      </p>

                      {isSelected && (
                        <div className="mt-2.5 pt-2 border-t border-[#cba369]/20 text-[11px] text-amber-200/90 font-medium flex items-center space-x-1.5">
                          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{step.tip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div className="mt-6 pt-4 border-t border-[#cba369]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            {/* Don't show again checkbox */}
            <label className="flex items-center space-x-2 text-xs text-stone-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-amber-600/50 bg-stone-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer accent-amber-500"
              />
              <span>Không tự động hiển thị lại khi vào trang web</span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              <button
                ref={primaryBtnRef}
                type="button"
                onClick={handleFinish}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9b3424] via-[#b84034] to-[#cba369] hover:from-[#b84034] hover:to-[#dfb77c] border border-amber-400/50 text-xs sm:text-sm font-bold text-white shadow-lg shadow-black/50 transition-all flex items-center justify-center space-x-2 cursor-pointer gold-glow-pulse"
              >
                <span>Bắt đầu trải nghiệm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
