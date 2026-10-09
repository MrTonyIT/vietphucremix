import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Check,
  Monitor,
  Smartphone,
  Layers,
  Image as ImageIcon,
  X,
  Compass,
  RotateCcw,
} from 'lucide-react';
import { HERITAGE_BACKGROUNDS, HeritageBackgroundItem } from '../data/backgroundCollections';
import { playSilkChime, isSoundEnabled } from '../utils/soundEffects';

export const PC_BACKGROUND_URL = '/backgrounds/pc-bg.png';
export const MOBILE_BACKGROUND_URL = '/backgrounds/mobile-bg.png';

/**
 * Tác phẩm nghệ thuật vector sơn mài & gốm ngọc Cổ Phục Việt Nam
 * Đảm bảo 100% hiển thị NGAY LẬP TỨC nếu mạng chập chờn
 */
const HeritageArtworkVector: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  if (isMobile) {
    return (
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 720 1280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="m-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f0a07" />
            <stop offset="40%" stopColor="#1c120c" />
            <stop offset="70%" stopColor="#2a180f" />
            <stop offset="100%" stopColor="#140c08" />
          </linearGradient>
          <radialGradient id="m-moon" cx="50%" cy="18%" r="45%">
            <stop offset="0%" stopColor="#ffeec2" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#d4af37" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#140c08" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="m-river" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a110a" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#3d2212" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#100a06" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        <rect width="720" height="1280" fill="url(#m-sky)" />
        <circle cx="360" cy="220" r="280" fill="url(#m-moon)" />
        <circle cx="360" cy="200" r="42" fill="#fff7e0" fillOpacity="0.25" />
        <circle cx="360" cy="200" r="32" fill="#fffdfa" fillOpacity="0.75" />

        <path
          d="M-50,280 C120,240 220,320 380,270 C520,230 620,290 770,260"
          stroke="#cba369"
          strokeWidth="1.5"
          strokeOpacity="0.3"
          fill="none"
        />

        {/* Mái ngói rêu phong & đèn lồng */}
        <path
          d="M0,480 Q140,450 240,490 L240,550 Q120,530 0,550 Z"
          fill="#1c130d"
          stroke="#b84034"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />
        <path
          d="M480,470 Q600,440 720,480 L720,550 Q600,530 480,540 Z"
          fill="#1c130d"
          stroke="#b84034"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />

        <circle cx="80" cy="510" r="14" fill="#9b3424" fillOpacity="0.8" />
        <circle cx="80" cy="510" r="8" fill="#f59e0b" fillOpacity="0.9" />
        <line x1="80" y1="490" x2="80" y2="524" stroke="#d4af37" strokeWidth="1.5" />

        <circle cx="640" cy="515" r="15" fill="#b84034" fillOpacity="0.8" />
        <circle cx="640" cy="515" r="8" fill="#fbbf24" fillOpacity="0.9" />

        {/* Dòng sông Hoài đêm hoa đăng */}
        <rect y="760" width="720" height="520" fill="url(#m-river)" />
        <ellipse cx="360" cy="880" rx="180" ry="12" fill="#f59e0b" fillOpacity="0.12" />
        <ellipse cx="280" cy="950" rx="140" ry="10" fill="#9b3424" fillOpacity="0.15" />
      </svg>
    );
  }

  // BẢN PC / LAPTOP (16:9 Widescreen)
  return (
    <svg
      className="w-full h-full object-cover"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="pc-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0c0805" />
          <stop offset="35%" stopColor="#1a110a" />
          <stop offset="70%" stopColor="#25160d" />
          <stop offset="100%" stopColor="#0e0906" />
        </linearGradient>
        <radialGradient id="pc-glow-left" cx="22%" cy="42%" r="40%">
          <stop offset="0%" stopColor="#cba369" stopOpacity="0.22" />
          <stop offset="50%" stopColor="#9b3424" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0c0805" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pc-glow-right" cx="78%" cy="45%" r="42%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
          <stop offset="45%" stopColor="#b84034" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0c0805" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#pc-bg)" />
      <circle cx="380" cy="480" r="500" fill="url(#pc-glow-left)" />
      <circle cx="1540" cy="500" r="520" fill="url(#pc-glow-right)" />

      {/* Mái đình & đèn lồng */}
      <path
        d="M-50,220 Q180,180 340,240 L340,320 Q160,270 -50,300 Z"
        fill="#1e140d"
        stroke="#cba369"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />
      <g transform="translate(100, 260)">
        <circle cx="0" cy="40" r="22" fill="#9b3424" fillOpacity="0.85" />
        <circle cx="0" cy="40" r="12" fill="#f59e0b" fillOpacity="0.9" />
        <line x1="0" y1="18" x2="0" y2="62" stroke="#d4af37" strokeWidth="2" />
      </g>
      <g transform="translate(220, 290)">
        <circle cx="0" cy="40" r="26" fill="#b84034" fillOpacity="0.85" />
        <circle cx="0" cy="40" r="14" fill="#fbbf24" fillOpacity="0.9" />
        <line x1="0" y1="14" x2="0" y2="66" stroke="#d4af37" strokeWidth="2" />
      </g>

      {/* Trăng non */}
      <circle cx="1620" cy="200" r="54" fill="#fffdf5" fillOpacity="0.15" />
      <circle cx="1620" cy="200" r="42" fill="#fffbf0" fillOpacity="0.55" />

      {/* Dòng sông phản chiếu ánh hoa đăng */}
      <path
        d="M-100,820 Q480,780 960,840 Q1440,900 2020,810 L2020,1080 L-100,1080 Z"
        fill="#120c08"
        fillOpacity="0.7"
      />
      <ellipse cx="460" cy="910" rx="120" ry="8" fill="#f59e0b" fillOpacity="0.18" />
      <ellipse cx="1480" cy="900" rx="130" ry="8" fill="#fbbf24" fillOpacity="0.18" />
    </svg>
  );
};

export const UIBackground: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  // Bối cảnh đang được chọn từ Bộ Sưu Tập (Mặc định là Hoàng Cung Cố Đô Huế hoặc theo cấu hình người dùng)
  const [selectedBgId, setSelectedBgId] = useState<string>(() => {
    try {
      return localStorage.getItem('vietphuc_active_bg_id') || 'hue-citadel';
    } catch {
      return 'hue-citadel';
    }
  });

  // Chế độ tự động phát hiện kích thước màn hình (PC 16:9 vs Mobile 9:16)
  const [autoDetectScreen, setAutoDetectScreen] = useState<boolean>(true);
  // Manual override nếu người dùng muốn ép chế độ xem (null = auto)
  const [forcedDeviceMode, setForcedDeviceMode] = useState<'pc' | 'mobile' | null>(null);

  // Kích thước màn hình thời gian thực
  const [windowDimensions, setWindowDimensions] = useState<{
    width: number;
    height: number;
    isMobile: boolean;
    aspectRatio: number;
  }>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;
    const isMobile = width < 768 || width < height;
    return {
      width,
      height,
      isMobile,
      aspectRatio: height > 0 ? width / height : 1.77,
    };
  });

  // Modal mở bộ sưu tập hình nền
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);

  // Lấy ảnh người dùng đã nạp riêng nếu có
  const [customPcBg, setCustomPcBg] = useState<string | null>(() => {
    try {
      return localStorage.getItem('vietphuc_bg_pc');
    } catch {
      return null;
    }
  });

  const [customMobileBg, setCustomMobileBg] = useState<string | null>(() => {
    try {
      return localStorage.getItem('vietphuc_bg_mobile');
    } catch {
      return null;
    }
  });

  const [uploadToast, setUploadToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lắng nghe thay đổi kích thước màn hình thời gian thực (Viewport Resize & Orientation Change)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768 || width < height;
      setWindowDimensions({
        width,
        height,
        isMobile,
        aspectRatio: height > 0 ? width / height : 1.77,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Tự động kiểm tra và tải ảnh nền chung từ máy chủ nếu có
  useEffect(() => {
    fetch('/api/backgrounds')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.hasPc && data.pcUrl) {
            setCustomPcBg(data.pcUrl);
          }
          if (data.hasMobile && data.mobileUrl) {
            setCustomMobileBg(data.mobileUrl);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Tìm bối cảnh đang chọn
  const activeBackground =
    HERITAGE_BACKGROUNDS.find((b) => b.id === selectedBgId) || HERITAGE_BACKGROUNDS[0];

  // Quyết định dùng tỷ lệ nào:
  // Nếu người dùng force: dùng forced mode
  // Nếu tự động: dựa trên isMobile của kích thước màn hình
  const isTargetMobile = forcedDeviceMode !== null ? forcedDeviceMode === 'mobile' : windowDimensions.isMobile;

  // Xác định URL ảnh cho PC và Mobile
  const activePcUrl =
    selectedBgId === 'royal-custom' && customPcBg
      ? customPcBg
      : activeBackground.pcUrl;

  const activeMobileUrl =
    selectedBgId === 'royal-custom' && customMobileBg
      ? customMobileBg
      : activeBackground.mobileUrl;

  // URL ảnh thực tế đang được kích hoạt dựa trên kích thước màn hình
  const currentActiveUrl = isTargetMobile ? activeMobileUrl : activePcUrl;

  // Xử lý khi chọn bối cảnh trong bộ sưu tập
  const handleSelectBackground = (item: HeritageBackgroundItem) => {
    setSelectedBgId(item.id);
    try {
      localStorage.setItem('vietphuc_active_bg_id', item.id);
    } catch {}

    if (isSoundEnabled()) {
      playSilkChime();
    }

    setUploadToast(`Đã áp dụng bối cảnh: ${item.name}`);
    setTimeout(() => setUploadToast(null), 3000);
  };

  // Xử lý nạp và lưu vĩnh viễn ảnh nền tùy chỉnh
  const processAndSaveBackground = (dataUrl: string) => {
    const img = new Image();
    img.onload = async () => {
      const isLandscape = img.width >= img.height;
      const type = isLandscape ? 'pc' : 'mobile';

      if (isLandscape) {
        setCustomPcBg(dataUrl);
        try {
          localStorage.setItem('vietphuc_bg_pc', dataUrl);
        } catch {}
      } else {
        setCustomMobileBg(dataUrl);
        try {
          localStorage.setItem('vietphuc_bg_mobile', dataUrl);
        } catch {}
      }

      // Tự động chuyển sang mục Ảnh Tùy Chỉnh
      setSelectedBgId('royal-custom');
      try {
        localStorage.setItem('vietphuc_active_bg_id', 'royal-custom');
      } catch {}

      setUploadToast(`Đang lưu ảnh nền ${type.toUpperCase()} lên máy chủ...`);

      try {
        const res = await fetch('/api/backgrounds/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, dataUrl }),
        });
        const data = await res.json();
        if (data.success) {
          setUploadToast(`Đã lưu vĩnh viễn hình nền ${type.toUpperCase()} cho toàn bộ người dùng!`);
        } else {
          setUploadToast(`Đã lưu trên máy bạn (${data.error || 'Lỗi server'})`);
        }
      } catch {
        setUploadToast(`Đã lưu tạm trên trình duyệt của bạn!`);
      }

      setTimeout(() => setUploadToast(null), 4000);
    };
    img.src = dataUrl;
  };

  // Xử lý kéo thả ảnh nền
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      if (!e.dataTransfer?.files || e.dataTransfer.files.length === 0) return;
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) processAndSaveBackground(dataUrl);
      };
      reader.readAsDataURL(file);
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) processAndSaveBackground(dataUrl);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleManualUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Thông báo thao tác */}
      {uploadToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-auto">
          <div className="bg-[#1c120c]/95 border border-[#cba369] text-[#f5d99f] px-4 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-semibold">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{uploadToast}</span>
          </div>
        </div>
      )}

      {/* ========================================================
          KHUNG BACKGROUND CỐ ĐỊNH TỰ ĐỘNG CHỌN THEO KÍCH THƯỚC MÀN HÌNH
         ======================================================== */}
      <div
        className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-500 ${
          theme === 'light' ? 'bg-[#f7f3ea]' : 'bg-[#140e0a]'
        }`}
        aria-hidden="true"
      >
        {/* Bản hiển thị cho Máy tính / PC (16:9 Widescreen) */}
        <div className={`${isTargetMobile ? 'hidden' : 'block'} absolute inset-0 transition-opacity duration-700`}>
          <img
            key={`pc-${currentActiveUrl}`}
            src={activePcUrl}
            alt={`${activeBackground.name} (Tỷ lệ 16:9 cho PC)`}
            className="w-full h-full object-cover object-center animate-in fade-in duration-500"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 -z-10">
            <HeritageArtworkVector isMobile={false} />
          </div>

          {/* Lớp phủ bảo vệ tương phản */}
          {theme === 'light' ? (
            <>
              <div className="absolute inset-0 bg-[#f7f3ea]/70 backdrop-blur-[0.5px]" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 50% 35%, transparent 25%, rgba(247,243,234,0.65) 65%, rgba(240,233,219,0.92) 100%)',
                }}
              />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-[#120d09]/20 backdrop-blur-[0.5px]" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 50% 35%, transparent 35%, rgba(20,14,10,0.25) 75%, rgba(16,11,8,0.7) 100%)',
                }}
              />
            </>
          )}
        </div>

        {/* Bản hiển thị cho Điện thoại / Mobile (9:16 Vertical) */}
        <div className={`${isTargetMobile ? 'block' : 'hidden'} absolute inset-0 transition-opacity duration-700`}>
          <img
            key={`mobile-${currentActiveUrl}`}
            src={activeMobileUrl}
            alt={`${activeBackground.name} (Tỷ lệ 9:16 cho Mobile)`}
            className="w-full h-full object-cover object-center animate-in fade-in duration-500"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 -z-10">
            <HeritageArtworkVector isMobile={true} />
          </div>

          {/* Lớp phủ màn hình dọc */}
          {theme === 'light' ? (
            <>
              <div className="absolute inset-0 bg-[#f7f3ea]/70 backdrop-blur-[0.5px]" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(247,243,234,0.7) 0%, rgba(247,243,234,0.25) 30%, rgba(247,243,234,0.35) 70%, rgba(240,233,219,0.95) 100%)',
                }}
              />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-[#140e0a]/20 backdrop-blur-[0.5px]" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(16,11,8,0.6) 0%, rgba(20,14,10,0.15) 30%, rgba(20,14,10,0.2) 70%, rgba(16,11,8,0.75) 100%)',
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* ========================================================
          NÚT ĐIỀU KHIỂN BỘ SƯU TẬP BỐI CẢNH (GÓC DƯỚI TRÁI)
         ======================================================== */}
      <div className="fixed bottom-3 left-3 z-30 pointer-events-auto flex items-center space-x-2">
        {/* Nút mở Bảng Bộ Sưu Tập Bối Cảnh Cổ Phục */}
        <button
          type="button"
          onClick={() => setIsGalleryOpen(true)}
          className="group px-3 py-1.5 rounded-full bg-[#1c120c]/90 hover:bg-[#2c1d14] border border-[#cba369]/50 hover:border-amber-400 text-[11px] font-medium text-[#e5ceb5] hover:text-[#f5d99f] backdrop-blur-md shadow-xl transition-all flex items-center space-x-2 cursor-pointer"
          title="Chọn bối cảnh cổ phục (Cố Đô Huế, Phố Cổ Hội An, Hồ Gươm, Kinh Bắc, hoặc Tải ảnh riêng)"
        >
          <Compass className="w-3.5 h-3.5 text-[#d4af37] group-hover:rotate-45 transition-transform" />
          <span className="hidden sm:inline font-semibold">{activeBackground.name}</span>
          <span className="sm:hidden font-semibold">Bối cảnh</span>

          {/* Badge nhận diện tỷ lệ màn hình thực tế */}
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#382417] text-[#f5d99f] border border-[#cba369]/30 flex items-center space-x-1">
            {isTargetMobile ? (
              <>
                <Smartphone className="w-2.5 h-2.5 text-amber-300" />
                <span>9:16</span>
              </>
            ) : (
              <>
                <Monitor className="w-2.5 h-2.5 text-amber-300" />
                <span>16:9</span>
              </>
            )}
          </span>
        </button>

        {/* Nút nạp nhanh ảnh của riêng bạn */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded-full bg-[#1c120c]/80 hover:bg-[#2c1d14] border border-[#cba369]/40 hover:border-amber-400 text-[#e5ceb5] hover:text-[#f5d99f] backdrop-blur-md shadow-md transition-all cursor-pointer"
          title="Tải lên ảnh nền của riêng bạn (Hệ thống tự động nhận diện ngang cho PC, dọc cho Mobile)"
        >
          <Upload className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ========================================================
          MODAL BỘ SƯU TẬP HÌNH NỀN BỐI CẢNH CỔ PHỤC
         ======================================================== */}
      {isGalleryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="heritage-bg-title"
          onClick={() => setIsGalleryOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#16110d]/95 border border-[#cba369]/40 text-[#f5efe6] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#cba369]/20 bg-[#1f1712]/80">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#382417] border border-[#cba369]/40 flex items-center justify-center text-[#d4af37]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="heritage-bg-title" className="font-serif font-bold text-base text-[#f5d99f]">
                    Bộ Sưu Tập Bối Cảnh Cổ Phục Việt Nam
                  </h3>
                  <p className="text-[11px] text-[#d5c3aa]">
                    Tự động thích ứng tỷ lệ 16:9 (PC / Máy tính) và 9:16 (Điện thoại di động)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="w-8 h-8 rounded-full bg-[#2a1b12] hover:bg-[#3d2719] border border-[#cba369]/30 flex items-center justify-center text-[#d5c3aa] hover:text-white transition-colors cursor-pointer"
                title="Đóng bảng bối cảnh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thông tin chế độ thích ứng tự động */}
            <div className="px-5 py-2.5 bg-[#20150e]/90 border-b border-[#cba369]/15 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-[#d5c3aa]">Thiết bị phát hiện:</span>
                <span className="font-semibold text-[#f5d99f] flex items-center space-x-1 bg-[#2a1a11] px-2 py-0.5 rounded-md border border-[#cba369]/30">
                  {windowDimensions.isMobile ? (
                    <>
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Điện thoại ({windowDimensions.width}x{windowDimensions.height}px) • Tỷ lệ 9:16</span>
                    </>
                  ) : (
                    <>
                      <Monitor className="w-3.5 h-3.5 text-amber-400" />
                      <span>Máy tính ({windowDimensions.width}x{windowDimensions.height}px) • Tỷ lệ 16:9</span>
                    </>
                  )}
                </span>
              </div>

              {/* Bộ chọn ép tỷ lệ nếu người dùng muốn thử nghiệm */}
              <div className="flex items-center space-x-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setForcedDeviceMode(null)}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    forcedDeviceMode === null
                      ? 'bg-amber-500/20 text-[#f5d99f] border border-amber-500/40 font-semibold'
                      : 'text-[#d5c3aa] hover:text-white'
                  }`}
                  title="Tự động chọn theo kích thước màn hình"
                >
                  Tự động
                </button>
                <button
                  type="button"
                  onClick={() => setForcedDeviceMode('pc')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    forcedDeviceMode === 'pc'
                      ? 'bg-amber-500/20 text-[#f5d99f] border border-amber-500/40 font-semibold'
                      : 'text-[#d5c3aa] hover:text-white'
                  }`}
                  title="Ép xem tỷ lệ 16:9 của PC"
                >
                  Xem 16:9 (PC)
                </button>
                <button
                  type="button"
                  onClick={() => setForcedDeviceMode('mobile')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    forcedDeviceMode === 'mobile'
                      ? 'bg-amber-500/20 text-[#f5d99f] border border-amber-500/40 font-semibold'
                      : 'text-[#d5c3aa] hover:text-white'
                  }`}
                  title="Ép xem tỷ lệ 9:16 của Điện thoại"
                >
                  Xem 9:16 (Mobile)
                </button>
              </div>
            </div>

            {/* Danh sách bối cảnh trong Bộ Sưu Tập */}
            <div className="p-5 overflow-y-auto space-y-3.5 max-h-[50vh]">
              {HERITAGE_BACKGROUNDS.map((item) => {
                const isSelected = selectedBgId === item.id;
                const previewImg = isTargetMobile ? item.mobileUrl : item.pcUrl;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectBackground(item)}
                    className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-[#291b12] border-amber-400 ring-1 ring-amber-400/50 shadow-lg'
                        : 'bg-[#1a120c]/80 border-[#cba369]/25 hover:border-[#cba369]/60 hover:bg-[#231710]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      {/* Thumbnail Preview */}
                      <div className="relative w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-[#0d0906] border border-[#cba369]/30 flex-shrink-0">
                        <img
                          src={previewImg}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#140e0a]/80 text-[#f5d99f] border border-[#cba369]/30">
                          {isTargetMobile ? '9:16 Dọc' : '16:9 Ngang'}
                        </span>
                      </div>

                      {/* Chi tiết bối cảnh */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-serif font-bold text-sm text-[#f5d99f] group-hover:text-amber-300 transition-colors">
                            {item.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#3d2719] text-[#e5ceb5] border border-[#cba369]/30">
                            {item.accentBadge}
                          </span>
                        </div>
                        <p className="text-xs text-[#d5c3aa] font-medium mb-1 line-clamp-1">
                          {item.tagline}
                        </p>
                        <p className="text-[11px] text-stone-400 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Nút chọn hoặc trạng thái */}
                      <div className="w-full sm:w-auto flex sm:flex-col items-center justify-end flex-shrink-0">
                        {isSelected ? (
                          <span className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-semibold flex items-center justify-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Đang dùng</span>
                          </span>
                        ) : (
                          <span className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-[#2b1c13] group-hover:bg-[#3d271a] text-[#e5ceb5] border border-[#cba369]/30 text-xs font-medium flex items-center justify-center transition-colors">
                            Áp dụng
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Modal với hành động nạp ảnh */}
            <div className="px-5 py-3 border-t border-[#cba369]/20 bg-[#1c130d] flex items-center justify-between text-xs text-[#d5c3aa]">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-[#2e1d13] hover:bg-[#3d2719] border border-[#cba369]/40 text-[#f5d99f] font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nạp ảnh bối cảnh riêng (4K)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#cba369] hover:bg-amber-500 text-stone-950 font-bold transition-colors cursor-pointer"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
