import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Upload, Check } from 'lucide-react';

export const PC_BACKGROUND_URL = '/backgrounds/pc-bg.png';
export const MOBILE_BACKGROUND_URL = '/backgrounds/mobile-bg.png';

/**
 * Tác phẩm nghệ thuật Việt Phục & Phố Cổ Hội An (Vector SVG chất lượng cao 4K)
 * Đảm bảo 100% hiển thị NGAY LẬP TỨC mà không phụ thuộc vào kết nối mạng,
 * giải quyết triệt để lỗi màn hình đen do sandbox chặn cookie bên thứ ba.
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

        {/* Nền trời sơn mài trầm ấm */}
        <rect width="720" height="1280" fill="url(#m-sky)" />
        {/* Vầng trăng vàng & quầng sáng đêm rằm */}
        <circle cx="360" cy="220" r="280" fill="url(#m-moon)" />
        <circle cx="360" cy="200" r="42" fill="#fff7e0" fillOpacity="0.25" />
        <circle cx="360" cy="200" r="32" fill="#fffdfa" fillOpacity="0.75" />

        {/* Dải vân mây cung đình uốn lượn */}
        <path
          d="M-50,280 C120,240 220,320 380,270 C520,230 620,290 770,260"
          stroke="#cba369"
          strokeWidth="1.5"
          strokeOpacity="0.3"
          fill="none"
        />
        <path
          d="M-30,310 C150,270 260,350 420,300 C560,260 660,320 790,290"
          stroke="#cba369"
          strokeWidth="1"
          strokeOpacity="0.2"
          fill="none"
        />

        {/* Mái ngói rêu phong Hội An & đèn lồng */}
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

        {/* Đèn lồng đỏ treo mái phố */}
        <circle cx="80" cy="510" r="14" fill="#9b3424" fillOpacity="0.8" />
        <circle cx="80" cy="510" r="8" fill="#f59e0b" fillOpacity="0.9" />
        <line x1="80" y1="490" x2="80" y2="524" stroke="#d4af37" strokeWidth="1.5" />

        <circle cx="160" cy="525" r="12" fill="#b84034" fillOpacity="0.8" />
        <circle cx="160" cy="525" r="7" fill="#fbbf24" fillOpacity="0.9" />

        <circle cx="560" cy="505" r="13" fill="#9b3424" fillOpacity="0.8" />
        <circle cx="560" cy="505" r="7" fill="#f59e0b" fillOpacity="0.9" />

        <circle cx="640" cy="515" r="15" fill="#b84034" fillOpacity="0.8" />
        <circle cx="640" cy="515" r="8" fill="#fbbf24" fillOpacity="0.9" />

        {/* Dòng sông Hoài đêm hoa đăng */}
        <rect y="760" width="720" height="520" fill="url(#m-river)" />
        {/* Ánh đèn phản chiếu lăn tăn trên mặt nước */}
        <ellipse cx="360" cy="880" rx="180" ry="12" fill="#f59e0b" fillOpacity="0.12" />
        <ellipse cx="280" cy="950" rx="140" ry="10" fill="#9b3424" fillOpacity="0.15" />
        <ellipse cx="440" cy="1020" rx="160" ry="10" fill="#f59e0b" fillOpacity="0.12" />

        {/* Hoa sen hồng & búp sen hai bên */}
        <g transform="translate(40, 1020) scale(0.9)">
          <path d="M0,80 Q20,30 40,0 Q60,30 80,80 Z" fill="#b84034" fillOpacity="0.4" />
          <path d="M20,80 Q40,40 40,10 Q40,40 60,80 Z" fill="#f472b6" fillOpacity="0.5" />
          <circle cx="40" cy="45" r="8" fill="#fef08a" fillOpacity="0.6" />
        </g>
        <g transform="translate(600, 1040) scale(0.9)">
          <path d="M0,80 Q20,30 40,0 Q60,30 80,80 Z" fill="#b84034" fillOpacity="0.4" />
          <path d="M20,80 Q40,40 40,10 Q40,40 60,80 Z" fill="#f472b6" fillOpacity="0.5" />
          <circle cx="40" cy="45" r="8" fill="#fef08a" fillOpacity="0.6" />
        </g>
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
        <linearGradient id="pc-gold-thread" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#cba369" stopOpacity="0" />
          <stop offset="25%" stopColor="#f5d99f" stopOpacity="0.4" />
          <stop offset="75%" stopColor="#d4af37" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#cba369" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Lớp nền sơn mài hổ phách sẫm */}
      <rect width="1920" height="1080" fill="url(#pc-bg)" />
      {/* Vầng hào quang hai bên nơi bố trí Tứ Thân & Áo Dài */}
      <circle cx="380" cy="480" r="500" fill="url(#pc-glow-left)" />
      <circle cx="1540" cy="500" r="520" fill="url(#pc-glow-right)" />

      {/* ================= CÁNH TRÁI: KHÔNG GIAN TỨ THÂN & PHỐ CỔ HỘI AN ================= */}
      {/* Mái đình cong chạm trổ mây nước */}
      <path
        d="M-50,220 Q180,180 340,240 L340,320 Q160,270 -50,300 Z"
        fill="#1e140d"
        stroke="#cba369"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />
      <path
        d="M20,160 Q160,140 280,190"
        stroke="#d4af37"
        strokeWidth="1.2"
        strokeOpacity="0.35"
        fill="none"
      />

      {/* Dàn đèn lồng phố cổ Hội An rực rỡ */}
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
      <g transform="translate(320, 270)">
        <circle cx="0" cy="35" r="18" fill="#9b3424" fillOpacity="0.8" />
        <circle cx="0" cy="35" r="10" fill="#f59e0b" fillOpacity="0.85" />
      </g>

      {/* Nhân vật Cổ phục Tứ Thân (Silhouette tao nhã mang nón quai thao & yếm đào) */}
      <g transform="translate(260, 480) scale(0.95)">
        {/* Nón quai thao to tròn */}
        <ellipse cx="60" cy="20" rx="46" ry="14" fill="#2d1c12" stroke="#cba369" strokeWidth="1.5" strokeOpacity="0.6" />
        {/* Dải yếm và tà áo tứ thân buông lơi */}
        <path d="M35,32 Q60,45 85,32 L95,160 Q60,175 25,160 Z" fill="#9b3424" fillOpacity="0.55" />
        <path d="M45,45 Q60,55 75,45 L78,130 Q60,140 42,130 Z" fill="#f43f5e" fillOpacity="0.45" />
        {/* Dải lụa thắt lưng bao bay mềm mại */}
        <path d="M25,90 Q-20,120 10,170 Q40,210 20,250" stroke="#f59e0b" strokeWidth="3" strokeOpacity="0.65" fill="none" />
        <path d="M95,90 Q140,130 110,180 Q80,220 100,260" stroke="#cba369" strokeWidth="2.5" strokeOpacity="0.6" fill="none" />
      </g>

      {/* Khóm sen nở ngát hương bờ sông bên trái */}
      <g transform="translate(140, 840)">
        <ellipse cx="80" cy="60" rx="90" ry="24" fill="#1b2e1b" fillOpacity="0.5" stroke="#059669" strokeWidth="1" strokeOpacity="0.4" />
        <path d="M50,40 Q80,-10 110,40 Z" fill="#b84034" fillOpacity="0.5" />
        <path d="M65,40 Q80,5 95,40 Z" fill="#f472b6" fillOpacity="0.6" />
        <circle cx="80" cy="20" r="6" fill="#fef08a" />
      </g>

      {/* ================= CÁNH PHẢI: KHÔNG GIAN ÁO DÀI & HOA SEN CỐ ĐÔ ================= */}
      {/* Vành trăng non & nhành liễu rủ */}
      <circle cx="1620" cy="200" r="54" fill="#fffdf5" fillOpacity="0.15" />
      <circle cx="1620" cy="200" r="42" fill="#fffbf0" fillOpacity="0.55" />
      {/* Cành liễu uốn lượn bên bờ sông */}
      <path
        d="M1780,120 Q1680,240 1720,380 Q1750,490 1700,600"
        stroke="#cba369"
        strokeWidth="1.5"
        strokeOpacity="0.35"
        fill="none"
      />
      <path
        d="M1850,180 Q1750,300 1780,440 Q1800,530 1760,630"
        stroke="#9b3424"
        strokeWidth="1.2"
        strokeOpacity="0.25"
        fill="none"
      />

      {/* Nhân vật Cổ phục Áo Dài thanh tân (Silhouette áo dài truyền thống với nón lá bài thơ) */}
      <g transform="translate(1500, 470) scale(0.95)">
        {/* Nón lá chóp nhọn duyên dáng */}
        <polygon points="60,0 12,38 108,38" fill="#382417" stroke="#cba369" strokeWidth="1.5" strokeOpacity="0.6" />
        {/* Tà áo dài thướt tha */}
        <path d="M40,38 Q60,50 80,38 L100,240 Q60,250 20,240 Z" fill="#1e293b" fillOpacity="0.5" />
        <path d="M42,42 Q60,52 78,42 L95,230 Q60,238 25,230 Z" fill="#fdfbf7" fillOpacity="0.65" />
        {/* Quần lụa buông rủ dài chấm gót */}
        <path d="M35,220 L30,340 L58,340 L55,220 Z" fill="#f8fafc" fillOpacity="0.5" />
        <path d="M65,220 L62,340 L90,340 L85,220 Z" fill="#f8fafc" fillOpacity="0.5" />
      </g>

      {/* Hồ sen hoàng gia nở rộ bên phải */}
      <g transform="translate(1620, 830)">
        <ellipse cx="60" cy="70" rx="100" ry="26" fill="#1b2e1b" fillOpacity="0.5" stroke="#059669" strokeWidth="1" strokeOpacity="0.4" />
        <path d="M30,50 Q60,-5 90,50 Z" fill="#9b3424" fillOpacity="0.5" />
        <path d="M45,50 Q60,10 75,50 Z" fill="#f472b6" fillOpacity="0.65" />
        <circle cx="60" cy="24" r="7" fill="#fef08a" />
      </g>

      {/* Dòng sông Hoài phản chiếu ánh hoa đăng & mây vàng */}
      <path
        d="M-100,820 Q480,780 960,840 Q1440,900 2020,810 L2020,1080 L-100,1080 Z"
        fill="#120c08"
        fillOpacity="0.7"
      />
      {/* Vệt ánh sáng hoa đăng trôi trên sông */}
      <ellipse cx="460" cy="910" rx="120" ry="8" fill="#f59e0b" fillOpacity="0.18" />
      <ellipse cx="780" cy="960" rx="90" ry="6" fill="#9b3424" fillOpacity="0.15" />
      <ellipse cx="1200" cy="940" rx="110" ry="7" fill="#f59e0b" fillOpacity="0.16" />
      <ellipse cx="1480" cy="900" rx="130" ry="8" fill="#fbbf24" fillOpacity="0.18" />

      {/* Chỉ tơ vàng hoàng kim điểm xuyết */}
      <line x1="0" y1="1020" x2="1920" y2="1020" stroke="url(#pc-gold-thread)" strokeWidth="1.5" />
    </svg>
  );
};

export const UIBackground: React.FC = () => {
  // Lấy ảnh từ localStorage nếu người dùng đã nạp
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

  // Xử lý nạp ảnh khi kéo thả file vào cửa sổ
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      if (!e.dataTransfer?.files || e.dataTransfer.files.length === 0) return;

      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        // Xác định kích thước ảnh để tự động gán vào PC hay Mobile
        const img = new Image();
        img.onload = () => {
          const isLandscape = img.width >= img.height;
          if (isLandscape) {
            setCustomPcBg(dataUrl);
            try {
              localStorage.setItem('vietphuc_bg_pc', dataUrl);
            } catch {}
            setUploadToast('Đã nạp hình nền PC / Màn hình rộng từ file ảnh của bạn!');
          } else {
            setCustomMobileBg(dataUrl);
            try {
              localStorage.setItem('vietphuc_bg_mobile', dataUrl);
            } catch {}
            setUploadToast('Đã nạp hình nền Điện thoại / Mobile từ file ảnh của bạn!');
          }
          setTimeout(() => setUploadToast(null), 4000);
        };
        img.src = dataUrl;
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
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const isLandscape = img.width >= img.height;
        if (isLandscape) {
          setCustomPcBg(dataUrl);
          try {
            localStorage.setItem('vietphuc_bg_pc', dataUrl);
          } catch {}
          setUploadToast('Đã cài đặt hình nền PC từ file ảnh của bạn!');
        } else {
          setCustomMobileBg(dataUrl);
          try {
            localStorage.setItem('vietphuc_bg_mobile', dataUrl);
          } catch {}
          setUploadToast('Đã cài đặt hình nền Mobile từ file ảnh của bạn!');
        }
        setTimeout(() => setUploadToast(null), 4000);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Ẩn file input phục vụ nút nạp nhanh nếu cần */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleManualUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Thông báo nạp ảnh thành công */}
      {uploadToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-auto">
          <div className="bg-[#1c120c]/95 border border-[#cba369] text-[#f5d99f] px-4 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-semibold">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{uploadToast}</span>
          </div>
        </div>
      )}

      {/* Bố cục Background cố định toàn màn hình */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#140e0a]"
        aria-hidden="true"
      >
        {/* ========================================================
            1. BẢN PC / LAPTOP (Viewport >= 768px)
           ======================================================== */}
        <div className="hidden md:block absolute inset-0">
          <img
            src={customPcBg || PC_BACKGROUND_URL}
            alt="Hình nền PC Việt Phục Remix"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              // Fallback to vector artwork if image fails to render
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 -z-10">
            <HeritageArtworkVector isMobile={false} />
          </div>
          {/* Lớp phủ bảo vệ tương phản dịu nhẹ */}
          <div className="absolute inset-0 bg-[#120d09]/15 backdrop-blur-[0.5px]" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 35%, transparent 30%, rgba(20,14,10,0.2) 70%, rgba(16,11,8,0.65) 100%)',
            }}
          />
        </div>

        {/* ========================================================
            2. BẢN MOBILE / ĐIỆN THOẠI (Viewport < 768px)
           ======================================================== */}
        <div className="block md:hidden absolute inset-0">
          <img
            src={customMobileBg || MOBILE_BACKGROUND_URL}
            alt="Hình nền Mobile Việt Phục Remix"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 -z-10">
            <HeritageArtworkVector isMobile={true} />
          </div>
          {/* Lớp phủ màn hình dọc dịu nhẹ */}
          <div className="absolute inset-0 bg-[#140e0a]/18 backdrop-blur-[0.5px]" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(16,11,8,0.55) 0%, rgba(20,14,10,0.1) 35%, rgba(20,14,10,0.15) 65%, rgba(16,11,8,0.7) 100%)',
            }}
          />
        </div>
      </div>

      {/* Nút bấm tinh tế góc dưới cùng để người dùng bấm chọn nạp file ảnh trực tiếp nếu muốn */}
      <div className="fixed bottom-3 left-3 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group px-3 py-1.5 rounded-full bg-[#1c120c]/80 hover:bg-[#2c1d14] border border-[#cba369]/30 hover:border-[#cba369] text-[11px] font-medium text-[#e5ceb5] hover:text-[#f5d99f] backdrop-blur-md shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer opacity-70 hover:opacity-100"
          title="Kéo thả hoặc bấm để nạp trực tiếp file ảnh nền của bạn (tự động nhận diện PC hoặc Mobile)"
        >
          <Upload className="w-3.5 h-3.5 text-[#d4af37] group-hover:scale-110 transition-transform" />
          <span>Nạp ảnh nền của bạn</span>
        </button>
      </div>
    </>
  );
};
