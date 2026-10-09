import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Award,
  CheckCircle2,
  X,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Compass,
  Palette,
  Heart,
} from 'lucide-react';
import { CatalogItem, EntitySlug, GenderType, SlotType } from '../types/fashion';
import { CATALOG_ITEMS } from '../data/catalog';
import { useModalA11y } from '../utils/useModalA11y';
import { playSilkChime, isSoundEnabled } from '../utils/soundEffects';

export interface HeritageQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyOutfit: (items: Partial<Record<SlotType, CatalogItem>>, entitySlug: EntitySlug, gender: GenderType) => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  subtitle: string;
  options: {
    text: string;
    description: string;
    archetype: 'ngu-than' | 'ao-dai' | 'tu-than' | 'remix';
  }[];
}

interface ArchetypeResult {
  id: 'ngu-than' | 'ao-dai' | 'tu-than' | 'remix';
  entitySlug: EntitySlug;
  title: string;
  badge: string;
  tagline: string;
  personality: string;
  historicalMeaning: string;
  recommendedOutfitName: string;
  items: Partial<Record<SlotType, CatalogItem>>;
  gender: GenderType;
  colorTone: string;
}

export const HeritageQuizModal: React.FC<HeritageQuizModalProps> = ({
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

  const getItem = (id: string): CatalogItem => {
    return CATALOG_ITEMS.find((it) => it.id === id) || CATALOG_ITEMS[0];
  };

  const questions: QuizQuestion[] = [
    {
      id: 1,
      question: 'Khi chụp ảnh kỷ yếu hay đi lễ hội, bạn mong muốn thể hiện phong thái nào nhất?',
      subtitle: 'Khí chất định hình phom dáng trang phục của bạn',
      options: [
        {
          text: 'Chuẩn mực, mực thước & mang phong thái trí thức nho nhã',
          description: 'Thích sự kín đáo, trang trọng và tôn trọng nghi lễ cổ phong',
          archetype: 'ngu-than',
        },
        {
          text: 'Thanh tân, duyên dáng & mang vẻ đẹp thuần khiết học đường',
          description: 'Thích nét thướt tha, mềm mại và tôn vinh vóc dáng tự nhiên',
          archetype: 'ao-dai',
        },
        {
          text: 'Hồn nhiên, mộc mạc & đượm chất tình dân gian Kinh Bắc',
          description: 'Thích sự bay bổng tự do, đa tầng màu sắc và nét văn hóa vùng miền',
          archetype: 'tu-than',
        },
        {
          text: 'Năng động, cá tính & thích phá cách đương đại',
          description: 'Muốn kết hợp nét truyền thống với giày thể thao hay phụ kiện Gen Z',
          archetype: 'remix',
        },
      ],
    },
    {
      id: 2,
      question: 'Chi tiết phục trang nào dưới đây khiến trái tim bạn rung động nhất?',
      subtitle: 'Điểm nhấn tạo nên linh hồn của bộ cổ phục',
      options: [
        {
          text: 'Cổ đứng lập lĩnh cùng hàng 5 khuy cài tượng trưng ngũ thường',
          description: 'Tượng trưng cho Nhân - Lễ - Nghĩa - Trí - Tín của người quân tử',
          archetype: 'ngu-than',
        },
        {
          text: 'Hai tà áo lụa kép bay nhẹ trong gió thu Hà Nội',
          description: 'Nét thướt tha kinh điển của tơ lụa Hà Đông và nón lá bài thơ',
          archetype: 'ao-dai',
        },
        {
          text: 'Chiếc Yếm đào buộc vạt khéo léo cùng nón quai thao to tròn',
          description: 'Đặc trưng văn hóa trẩy hội đền Lim đậm đà tình quê',
          archetype: 'tu-than',
        },
        {
          text: 'Sự tương phản giữa tà áo hoa nhí và đôi giày Loafer da / Sneaker retro',
          description: 'Nốt giao hưởng mới mẻ giữa cổ điển và nhịp sống trẻ phố thị',
          archetype: 'remix',
        },
      ],
    },
    {
      id: 3,
      question: 'Không gian lý tưởng nào bạn muốn lưu giữ khoảnh khắc thanh xuân?',
      subtitle: 'Bối cảnh kiến trúc tôn vinh trang phục của bạn',
      options: [
        {
          text: 'Sân gạch cổ kính, cột gỗ lim sơn son hoặc Đại Nội Cố Đô',
          description: 'Hòa mình vào chiều sâu trầm tích lịch sử cung đình',
          archetype: 'ngu-than',
        },
        {
          text: 'Sân trường rợp bóng xà cừ, tường vàng Đông Dương và cửa sổ xanh',
          description: 'Lưu giữ trọn vẹn kỷ niệm tuổi học trò và tà áo trắng',
          archetype: 'ao-dai',
        },
        {
          text: 'Bến nước, cây đa, cổng làng hoặc hồ sen nở ngát hương',
          description: 'Không gian làng quê Bắc Bộ thanh bình và giàu thi ca',
          archetype: 'tu-than',
        },
        {
          text: 'Phố đi bộ cuối tuần, quán cà phê gác cổ hoặc studio nghệ thuật',
          description: 'Góc nhìn sáng tạo mang phong cách Lookbook thời trang hiện đại',
          archetype: 'remix',
        },
      ],
    },
    {
      id: 4,
      question: 'Bảng màu sắc nào phản ánh đúng nhất năng lượng nội tâm của bạn?',
      subtitle: 'Sắc thái ngũ hành nuôi dưỡng cảm xúc',
      options: [
        {
          text: 'Xanh rêu cổ phong, chàm sẫm hoặc đỏ chu sa hoàng triều',
          description: 'Vẻ đẹp thâm trầm, đĩnh đạc và vương giả',
          archetype: 'ngu-than',
        },
        {
          text: 'Trắng ngọc trai tinh khôi hoặc be sữa dịu mát',
          description: 'Sự thanh khiết, trong trẻo và thanh lịch',
          archetype: 'ao-dai',
        },
        {
          text: 'Hồng cánh sen phối cùng nâu sồng và vàng hoa hòe',
          description: 'Sự rực rỡ, chân phương và đằm thắm dân dã',
          archetype: 'tu-than',
        },
        {
          text: 'Họa tiết hoa nhí pastel phối đen tuyền thời thượng',
          description: 'Sự tươi mới, phá cách và hơi thở xu hướng Gen Z',
          archetype: 'remix',
        },
      ],
    },
  ];

  const archetypeResults: Record<string, ArchetypeResult> = {
    'ngu-than': {
      id: 'ngu-than',
      entitySlug: 'ngu-than',
      title: 'Bậc Kẻ Sĩ / Thục Nữ Mực Thước (Áo Ngũ Thân Lập Lĩnh)',
      badge: 'Cổ Phong Chuẩn Mực',
      tagline: 'Trầm tĩnh, sâu sắc, đề cao phẩm hạnh và tri thức',
      personality:
        'Bạn là người chín chắn, trân trọng các giá trị chuẩn mực truyền thống và yêu chiều sâu văn hóa. Bạn luôn toát lên vẻ đĩnh đạc, mực thước và tạo cảm giác tin cậy cho những người xung quanh.',
      historicalMeaning:
        'Áo Ngũ Thân định hình từ sắc lệnh vua Minh Mạng năm 1827. 5 thân áo biểu trưng cho Tứ thân phụ mẫu và chính bản thân người mặc, 5 khuy cài mang ý nghĩa Ngũ thường (Nhân - Lễ - Nghĩa - Trí - Tín).',
      recommendedOutfitName: 'Ngũ Thân Tay Chẽn Rêu Phong Hoàng Cung',
      gender: 'nam',
      colorTone: 'Xanh Rêu & Bạch Ngọc',
      items: {
        main: getItem('item-main-nguthan-xanh-reu'),
        lower: getItem('item-lower-quan-lua-trang'),
        headwear: getItem('item-head-khan-dong-nam-den'),
        footwear: getItem('item-foot-guoc-moc-quai-nhung'),
        accessory: getItem('item-acc-the-bai-go'),
      },
    },
    'ao-dai': {
      id: 'ao-dai',
      entitySlug: 'ao-dai',
      title: 'Tiểu Thư Thanh Tân / Nữ Sinh Kinh Kỳ (Áo Dài Tà Kép)',
      badge: 'Thanh Lịch Thuần Khiết',
      tagline: 'Trong trẻo, duyên dáng, tràn đầy vẻ đẹp thanh xuân',
      personality:
        'Bạn sở hữu tâm hồn lãng mạn, tinh tế và yêu cái đẹp thuần khiết. Nụ cười dịu dàng và phong thái đoan trang của bạn là biểu tượng sống động nhất của tuổi thanh xuân học đường.',
      historicalMeaning:
        'Áo Dài tà kép phát triển qua nhiều thời kỳ lịch sử, là quốc phục tôn vinh đường nét duyên dáng của người phụ nữ Việt Nam, gắn liền với ký ức trường học và nón bài thơ xứ Huế.',
      recommendedOutfitName: 'Áo Dài Lụa Trắng Hà Đông Kỷ Yếu',
      gender: 'nu',
      colorTone: 'Trắng Ngọc Trai & Trầm Hương',
      items: {
        main: getItem('item-main-aodai-trang'),
        lower: getItem('item-lower-quan-lua-trang'),
        headwear: getItem('item-head-non-la-hue'),
        footwear: getItem('item-foot-hai-theu-hoa-sen'),
        accessory: getItem('item-acc-quat-tram-huong'),
      },
    },
    'tu-than': {
      id: 'tu-than',
      entitySlug: 'tu-than',
      title: 'Liền Chị Dân Gian / Hồn Nhiên Kinh Bắc (Áo Tứ Thân Yếm Đào)',
      badge: 'Dân Gian Đằm Thắm',
      tagline: 'Phóng khoáng, tự do, đượm tình quê và thi ca Quan Họ',
      personality:
        'Bạn yêu sự tự do, gần gũi thiên nhiên và có tính cách hào sảng, chân thật. Bạn mang trong mình ngọn lửa nghệ thuật và tình yêu thương tha thiết với cội nguồn văn hóa xóm làng.',
      historicalMeaning:
        'Áo Tứ Thân là trang phục lao động và trẩy hội cổ truyền của phụ nữ Bắc Bộ. Chiếc Yếm đào và vạt buộc tượng trưng cho tình mẫu tử thiêng liêng và sự tháo vát, đoan chính của người phụ nữ Việt.',
      recommendedOutfitName: 'Tứ Thân Kinh Bắc Yếm Sen Nón Thao',
      gender: 'nu',
      colorTone: 'Nâu Sồng, Yếm Đào & Sen Hồng',
      items: {
        main: getItem('item-main-tuthan-nau-song'),
        lower: getItem('item-lower-vay-linh-den'),
        inner: getItem('item-inner-yem-canh-sen'),
        headwear: getItem('item-head-non-quai-thao'),
        footwear: getItem('item-foot-guoc-moc-quai-nhung'),
        accessory: getItem('item-acc-quat-tram-huong'),
      },
    },
    'remix': {
      id: 'remix',
      entitySlug: 'ao-dai',
      title: 'Gen Z Tân Cổ Giao Duyên (Áo Dài Hoa Nhí Remix)',
      badge: 'Sáng Tạo Đương Đại',
      tagline: 'Năng động, tiên phong, cầu nối di sản với tương lai',
      personality:
        'Bạn là một Gen Z đầy sáng tạo, không ngại thử nghiệm những sự kết hợp mới mẻ. Bạn tôn trọng quá khứ nhưng luôn muốn mang di sản bước vào cuộc sống đương đại bằng ngôn ngữ tươi vui của thế hệ mình.',
      historicalMeaning:
        'Remix là tinh thần "Kế thừa có chọn lọc", giữ vững cốt cách linh hồn của vạt áo cổ truyền nhưng hòa nhịp cùng giày Sneaker, Loafer và phụ kiện tiện dụng của thế kỷ 21.',
      recommendedOutfitName: 'Áo Dài Cách Tân Hoa Nhí & Loafer Remix',
      gender: 'nu',
      colorTone: 'Pastel Hoa Nhí & Da Đen Hiện Đại',
      items: {
        main: getItem('item-main-aodai-hoa-nhi'),
        lower: getItem('item-lower-quan-lua-trang'),
        headwear: getItem('item-head-khan-lua-van-may'),
        footwear: getItem('item-foot-loafer-den-remix'),
        accessory: getItem('item-acc-tui-gam-theu'),
      },
    },
  };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<ArchetypeResult | null>(null);

  const handleSelectOption = (archetype: string) => {
    if (isSoundEnabled()) {
      playSilkChime();
    }
    const newAnswers = [...answers, archetype];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate winner archetype
      const countMap: Record<string, number> = {
        'ngu-than': 0,
        'ao-dai': 0,
        'tu-than': 0,
        'remix': 0,
      };
      newAnswers.forEach((ans) => {
        countMap[ans] = (countMap[ans] || 0) + 1;
      });

      let winner = 'ao-dai';
      let maxCount = -1;
      Object.keys(countMap).forEach((key) => {
        if (countMap[key] > maxCount) {
          maxCount = countMap[key];
          winner = key;
        }
      });

      setResult(archetypeResults[winner]);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);
  };

  const handleApplyResult = () => {
    if (!result) return;
    if (isSoundEnabled()) {
      playSilkChime();
    }
    onApplyOutfit(result.items, result.entitySlug, result.gender);
    onClose();
  };

  if (!isOpen) return null;

  const currentQ = questions[currentQuestionIndex];

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
          aria-labelledby="quiz-title"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-[#1a120c]/98 border border-[#cba369]/50 rounded-3xl shadow-2xl shadow-black/80 p-5 sm:p-7 text-stone-100 z-10 my-auto overflow-hidden ring-1 ring-amber-500/20 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#cba369]/25 pb-4 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#9b3424] to-[#cba369] flex items-center justify-center shadow-lg ring-1 ring-amber-400/40 shrink-0">
                <Sparkles className="w-5 h-5 text-[#fdf8f0]" />
              </div>
              <div>
                <h2
                  id="quiz-title"
                  className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide leading-tight flex items-center space-x-2"
                >
                  <span>Cổ Phục Nào Thuộc Về Bạn?</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Trắc Nghiệm Bản Sắc
                  </span>
                </h2>
                <p className="text-xs text-[#e5ceb5] mt-0.5">
                  4 câu hỏi nhanh giúp khám phá phong cách Việt phục đồng điệu với tâm hồn bạn
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-900/60 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition-colors cursor-pointer shrink-0"
              aria-label="Đóng trắc nghiệm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body: Question Flow or Result Display */}
          <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
            {!result ? (
              // Quiz Questions Mode
              <div className="space-y-4">
                {/* Progress Indicator */}
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="font-mono text-amber-300">
                    Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {questions.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-6 h-1.5 rounded-full transition-all ${
                          idx === currentQuestionIndex
                            ? 'bg-amber-400 w-8'
                            : idx < currentQuestionIndex
                            ? 'bg-emerald-500'
                            : 'bg-stone-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="rounded-2xl bg-stone-900/70 border border-[#cba369]/30 p-4 space-y-1">
                  <h3 className="text-sm sm:text-base font-bold font-serif text-white">
                    {currentQ.question}
                  </h3>
                  <p className="text-xs text-[#d5c3aa] italic">{currentQ.subtitle}</p>
                </div>

                {/* Answer Options */}
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectOption(opt.archetype)}
                      className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-[#221711]/70 hover:bg-[#301f16] border border-[#cba369]/25 hover:border-amber-400/60 transition-all cursor-pointer group flex items-start space-x-3 shadow hover:shadow-black/60"
                    >
                      <div className="w-6 h-6 rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center text-amber-300 text-xs font-mono shrink-0 group-hover:border-amber-400 group-hover:bg-amber-950">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#f5d99f] transition-colors leading-snug">
                          {opt.text}
                        </div>
                        <div className="text-[11px] text-stone-300 mt-1">
                          {opt.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Archetype Result Mode
              <div className="space-y-4">
                {/* Winner Card */}
                <div className="rounded-3xl bg-gradient-to-br from-[#2a1a11] via-[#1c120c] to-[#120b08] border border-amber-400/60 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 border-b border-[#cba369]/25 pb-3">
                    <span className="text-[11px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {result.badge}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">Tông: {result.colorTone}</span>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-base sm:text-xl font-bold font-serif text-white tracking-wide">
                      {result.title}
                    </h3>
                    <p className="text-xs font-medium text-[#f5d99f] italic mt-1">
                      "{result.tagline}"
                    </p>
                  </div>

                  {/* Personality breakdown */}
                  <div className="mt-3.5 space-y-2.5 text-xs text-stone-200">
                    <div className="bg-stone-950/60 p-3 rounded-2xl border border-stone-800">
                      <span className="text-amber-400 font-bold block mb-1">Tính cách & Khí chất của bạn:</span>
                      <p className="leading-relaxed">{result.personality}</p>
                    </div>

                    <div className="bg-stone-950/60 p-3 rounded-2xl border border-stone-800">
                      <span className="text-amber-400 font-bold block mb-1">Ý nghĩa di sản gắn liền:</span>
                      <p className="leading-relaxed">{result.historicalMeaning}</p>
                    </div>
                  </div>

                  {/* Recommended outfit highlight */}
                  <div className="mt-4 pt-3 border-t border-[#cba369]/25 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-stone-400 block">Bộ phối gợi ý cho bạn:</span>
                      <span className="text-xs font-bold text-white font-serif">{result.recommendedOutfitName}</span>
                    </div>

                    <button
                      ref={primaryBtnRef}
                      type="button"
                      onClick={handleApplyResult}
                      className="min-h-[42px] px-5 py-2 rounded-xl bg-gradient-to-r from-[#9b3424] to-[#cba369] hover:from-[#b84034] hover:to-[#dfb77c] border border-amber-400/50 text-xs font-bold text-white shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer gold-glow-pulse"
                    >
                      <span>Mặc bộ này ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Retake quiz button */}
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-stone-400 hover:text-amber-300 flex items-center space-x-1.5 cursor-pointer py-1 px-3 rounded-lg hover:bg-stone-900 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm lại trắc nghiệm</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="mt-4 pt-3 border-t border-[#cba369]/25 flex items-center justify-between text-xs text-stone-400 shrink-0">
            <span className="flex items-center space-x-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Trắc nghiệm kết hợp quy luật ngũ hành & tính biểu trưng của từng nhóm phục trang</span>
            </span>

            <button
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
