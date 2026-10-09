export interface HeritageBackgroundItem {
  id: string;
  name: string;
  tagline: string;
  location: string;
  eraOrStyle: string;
  pcUrl: string; // 16:9 aspect ratio
  mobileUrl: string; // 9:16 aspect ratio
  thumbnailUrl: string;
  dominantColor: string;
  accentBadge: string;
  description: string;
}

export const HERITAGE_BACKGROUNDS: HeritageBackgroundItem[] = [
  {
    id: 'hue-citadel',
    name: 'Hoàng Cung Cố Đô Huế',
    tagline: 'Ngọ Môn & Điện Thái Hòa hoàng hôn vàng óng',
    location: 'Cố Đô Huế',
    eraOrStyle: 'Triều Nguyễn — Cung Đình Trang Nghiêm',
    pcUrl: '/backgrounds/hue-citadel-pc.svg',
    mobileUrl: '/backgrounds/hue-citadel-mobile.svg',
    thumbnailUrl: '/backgrounds/hue-citadel-pc.svg',
    dominantColor: '#d4af37',
    accentBadge: 'Cung Đình',
    description: 'Ngọ Môn lầu Ngũ Phụng uy nghiêm, hàng cột gỗ lim son thếp vàng, ngói hoàng lưu ly rực rỡ và mặt nước hồ Thái Dịch êm đềm.',
  },
  {
    id: 'hoian-lantern',
    name: 'Phố Cổ Hội An Đêm Hoa Đăng',
    tagline: 'Mái ngói rêu phong & ngàn ánh đèn lồng sông Hoài',
    location: 'Hội An, Quảng Nam',
    eraOrStyle: 'Thương Cảng Cổ — Lãng Mạn & Lung Linh',
    pcUrl: '/backgrounds/hoian-lantern-pc.svg',
    mobileUrl: '/backgrounds/hoian-lantern-mobile.svg',
    thumbnailUrl: '/backgrounds/hoian-lantern-pc.svg',
    dominantColor: '#f97316',
    accentBadge: 'Phố Hội',
    description: 'Những con ngõ nhỏ tường vàng rêu phong giăng mắc đèn lồng ngũ sắc, hoa đăng lung linh soi bóng dòng sông Hoài đêm rằm.',
  },
  {
    id: 'hanoi-lake',
    name: 'Hồ Gươm & Cầu Thê Húc Hà Nội',
    tagline: 'Cầu Thê Húc son đỏ, Tháp Rùa sương sớm & liễu rủ',
    location: 'Hà Nội',
    eraOrStyle: 'Đông Kinh Cổ Kính — Thanh Tao & Trí Thức',
    pcUrl: '/backgrounds/hanoi-lake-pc.svg',
    mobileUrl: '/backgrounds/hanoi-lake-mobile.svg',
    thumbnailUrl: '/backgrounds/hanoi-lake-pc.svg',
    dominantColor: '#ef4444',
    accentBadge: 'Thăng Long',
    description: 'Tháp Rùa rêu phong giữa làn nước biếc, Cầu Thê Húc cong cong màu tôm son dẫn vào Đền Ngọc Sơn dưới rặng liễu thướt tha.',
  },
  {
    id: 'kinh-bac',
    name: 'Mái Đình Làng Cổ Kinh Bắc',
    tagline: 'Mái đao cong vút, cây đa bến nước & nón quai thao',
    location: 'Bắc Ninh / Kinh Bắc',
    eraOrStyle: 'Dân Gian Quan Họ — Mộc Mạc & Thân Thương',
    pcUrl: '/backgrounds/kinh-bac-pc.svg',
    mobileUrl: '/backgrounds/kinh-bac-mobile.svg',
    thumbnailUrl: '/backgrounds/kinh-bac-pc.svg',
    dominantColor: '#ca8a04',
    accentBadge: 'Kinh Bắc',
    description: 'Mái đình làng đầu đao cong vút trầm mặc, cây đa cổ thụ rợp bóng bến sông Cầu, nón quai thao dải yếm đào Quan họ duyên dáng.',
  },
  {
    id: 'royal-custom',
    name: 'Nhiếp Ảnh Cổ Phục Thực Tế (Ảnh Gốc)',
    tagline: 'Bộ ảnh chất lượng cao 4K gốc được tải nạp sẵn',
    location: 'Studio / Ngoại cảnh',
    eraOrStyle: 'Phối Cảnh Chân Thực 4K',
    pcUrl: '/backgrounds/pc-bg.png',
    mobileUrl: '/backgrounds/mobile-bg.png',
    thumbnailUrl: '/backgrounds/pc-bg.png',
    dominantColor: '#cba369',
    accentBadge: 'Ảnh Thực Tế',
    description: 'Tác phẩm hình nền thực tế độ phân giải cao được tối ưu hóa cho cả màn hình máy tính 16:9 và điện thoại thông minh 9:16.',
  },
];
