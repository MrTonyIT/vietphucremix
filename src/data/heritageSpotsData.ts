export type RegionType = 'ALL' | 'BAC' | 'TRUNG' | 'NAM';

export interface HeritageSpot {
  id: string;
  name: string;
  region: 'BAC' | 'TRUNG' | 'NAM';
  regionName: string;
  province: string;
  address: string;
  suitableEntities: ('ao-dai' | 'ngu-than' | 'tu-than')[];
  entityLabel: string;
  goldenHour: string;
  ticketPrice: string;
  openHours: string;
  etiquetteRules: string[];
  bestPhotoAngles: string[];
  vibeDescription: string;
  googleMapsUrl: string;
  badge: string;
  accentColor: string;
}

export const HERITAGE_SPOTS: HeritageSpot[] = [
  // MIỀN BẮC
  {
    id: 'van-mieu-hanoi',
    name: 'Văn Miếu – Quốc Tử Giám',
    region: 'BAC',
    regionName: 'Miền Bắc',
    province: 'Hà Nội',
    address: '58 Quốc Tử Giám, Văn Miếu, Đống Đa, Hà Nội',
    suitableEntities: ['ao-dai', 'ngu-than'],
    entityLabel: 'Áo Ngũ Thân & Áo Dài Học Đường',
    goldenHour: 'Sáng: 07:00 – 09:00 (Nắng sớm rọi Khuê Văn Các); Chiều: 15:30 – 17:00',
    ticketPrice: '70.000đ / người lớn • 35.000đ / HSSV (mang thẻ SV)',
    openHours: '08:00 – 17:00 hàng ngày',
    etiquetteRules: [
      'Trang phục chỉnh tề, kín đáo (không hở vai, ngắn trên gối)',
      'Không ngồi hoặc sờ đầu rùa đá bia tiến sĩ',
      'Bước qua bậu cửa nâng chân, không giẫm lên ngạch cửa gỗ',
    ],
    bestPhotoAngles: [
      'Bóng Khuê Văn Các in trên mặt giếng Thiên Quang',
      'Hàng bia Tiến sĩ cổ kính rợp bóng cây cổ thụ',
      'Đại Thành Môn với mái ngói lưu ly và cửa son',
    ],
    vibeDescription: 'Cái nôi Nho học ngàn năm, nơi lý tưởng nhất để tôn vinh nét nho nhã của Áo Ngũ Thân và tà Áo Dài tri thức.',
    googleMapsUrl: 'https://maps.google.com/?q=Van+Mieu+Quoc+Tu+Giam+Hanoi',
    badge: 'Di Tích Quốc Gia Đặc Biệt',
    accentColor: 'from-amber-900/50 to-stone-900',
  },
  {
    id: 'hoang-thanh-thang-long',
    name: 'Hoàng Thành Thăng Long',
    region: 'BAC',
    regionName: 'Miền Bắc',
    province: 'Hà Nội',
    address: '19C Hoàng Diệu, Quán Thánh, Ba Đình, Hà Nội',
    suitableEntities: ['ngu-than', 'ao-dai', 'tu-than'],
    entityLabel: 'Ngũ Thân Lập Lĩnh & Cổ Phục Hoàng Triều',
    goldenHour: '08:00 – 10:00 sáng & 15:45 – 17:15 ráng chiều Đoan Môn',
    ticketPrice: '30.000đ / vé thông thường • 15.000đ / HSSV',
    openHours: '08:00 – 17:00 (Đóng cửa thứ Hai)',
    etiquetteRules: [
      'Không tự ý trèo lên bờ tường thành di chỉ khảo cổ',
      'Giữ trật tự khu trưng bày di vật khảo cổ hầm ngầm',
      'Trang phục trang nhã, đúng phong thái người Tràng An',
    ],
    bestPhotoAngles: [
      'Bậc thang đá rồng chầu thời Lê Sơ điện Kính Thiên',
      'Cổng Đoan Môn đồ sộ với vòm gạch cổ nung thời Lý - Trần',
      'Hàng cây xà cừ cổ thụ rợp bóng đường lát đá',
    ],
    vibeDescription: 'Dấu ấn cung đình trầm mặc xuyên suốt 13 thế kỷ Thăng Long. Tạo phom áo ngũ thân hay đối khâm đều uy nghi rạng rỡ.',
    googleMapsUrl: 'https://maps.google.com/?q=Hoang+Thanh+Thang+Long+Hanoi',
    badge: 'Di Sản Văn Hóa Thế Giới',
    accentColor: 'from-red-950/50 to-stone-900',
  },
  {
    id: 'lang-co-duong-lam',
    name: 'Làng Cổ Đường Lâm',
    region: 'BAC',
    regionName: 'Miền Bắc',
    province: 'Hà Nội (Sơn Tây)',
    address: 'Đường Lâm, Thị xã Sơn Tây, Hà Nội',
    suitableEntities: ['tu-than', 'ngu-than'],
    entityLabel: 'Áo Tứ Thân Kinh Bắc & Áo Dài Thôn Dã',
    goldenHour: '06:30 – 08:30 (Sương sớm cổng làng) & 16:00 – 17:30',
    ticketPrice: '20.000đ / người (Vé vào cổng làng Mông Phụ)',
    openHours: 'Mở cửa tự do các ngõ xóm',
    etiquetteRules: [
      'Xin phép chủ nhà trước khi chụp ảnh trong sân đình, nhà cổ đá ong',
      'Không xả rác tại ngõ xóm lát gạch nghiêng truyền thống',
      'Không tự ý mở chum tương cổ của các cụ bô lão',
    ],
    bestPhotoAngles: [
      'Cổng làng Mông Phụ cạnh gốc đa cổ thụ 300 năm',
      'Những ngõ nhỏ quanh co xây bằng gạch đá ong nâu sẫm',
      'Sân phơi chum tương nếp vàng óng ánh nắng thu',
    ],
    vibeDescription: 'Cái nôi đất hai vua. Áo Tứ Thân nón quai thao hay áo tơi quạt mo xuất hiện ở đây đẹp tựa bức tranh dân gian Đông Hồ.',
    googleMapsUrl: 'https://maps.google.com/?q=Lang+Co+Duong+Lam+Son+Tay',
    badge: 'Làng Cổ Đá Ong Độc Bản',
    accentColor: 'from-orange-950/50 to-stone-900',
  },

  // MIỀN TRUNG
  {
    id: 'dai-noi-hue',
    name: 'Đại Nội Huế & Tử Cấm Thành',
    region: 'TRUNG',
    regionName: 'Miền Trung',
    province: 'Thừa Thiên Huế',
    address: 'Phú Hậu, TP. Huế, Thừa Thiên Huế',
    suitableEntities: ['ngu-than', 'ao-dai'],
    entityLabel: 'Áo Nhật Bình & Ngũ Thân Triều Nguyễn',
    goldenHour: '06:30 – 08:30 (Sáng tinh mơ ít người) & 16:00 – 17:45 hoàng hôn',
    ticketPrice: '200.000đ / người lớn • 40.000đ / HSSV (xuất trình thẻ)',
    openHours: '07:00 – 17:30 hàng ngày',
    etiquetteRules: [
      'Tuyệt đối cấm mặc áo sát nách, quần ngắn trên đùi vào các cung điện thờ cúng',
      'Không tự ý chạm tay vào ngai vàng, cột sơn thếp vàng trong điện Thái Hòa',
      'Tháo mũ nón khi bước vào các gian tẩm điện tôn nghiêm',
    ],
    bestPhotoAngles: [
      'Cổng Ngọ Môn lầu Ngũ Phụng hùng vĩ',
      'Trường lang sơn son thếp vàng dài hun hút lộng lẫy',
      'Cầu Trung Đạo bắc qua hồ Thái Dịch ngập hoa sen',
      'Hiển Lâm Các & Cửu Đỉnh đúc đồng sừng sững',
    ],
    vibeDescription: 'Thánh địa cổ phục số 1 Việt Nam. Không nơi đâu mặc áo Nhật Bình và Ngũ Thân tay chẽn hợp và quý phái như ở Cố Đô.',
    googleMapsUrl: 'https://maps.google.com/?q=Dai+Noi+Hue',
    badge: 'Quần Thể Di Tích Cố Đô',
    accentColor: 'from-amber-800/60 to-stone-950',
  },
  {
    id: 'lang-tu-duc-hue',
    name: 'Lăng Vua Tự Đức (Khiêm Lăng)',
    region: 'TRUNG',
    regionName: 'Miền Trung',
    province: 'Thừa Thiên Huế',
    address: 'Thủy Xuân, TP. Huế, Thừa Thiên Huế',
    suitableEntities: ['ngu-than', 'ao-dai'],
    entityLabel: 'Áo Ngũ Thân Trầm Mặc & Nhật Bình',
    goldenHour: '14:30 – 16:30 (Nắng nghiêng bóng râm rừng thông reo)',
    ticketPrice: '150.000đ / người lớn • 30.000đ / HSSV',
    openHours: '07:00 – 17:30',
    etiquetteRules: [
      'Giữ sự tĩnh mịch, trang trọng, không nói cười ồn ào nơi lăng tẩm',
      'Không leo trèo lên thềm Xung Khiêm Tạ hoặc Dũ Khiêm Tạ',
      'Giữ gìn cảnh quan hồ Lưu Khiêm và rừng thông',
    ],
    bestPhotoAngles: [
      'Nhà tạ Xung Khiêm Tạ soi bóng hồ sen Lưu Khiêm thơ mộng',
      'Bậc đá rêu phong dẫn lên Bi Đình chứa tấm bia Khiêm Cung Ký',
      'Đường thông reo rì rào dẫn vào tẩm điện',
    ],
    vibeDescription: 'Bức tranh thủy mặc đượm chất thi ca trữ tình. Tông màu trầm mặc rêu phong cực kỳ tôn vinh các gam màu xanh lam chàm, be ngà.',
    googleMapsUrl: 'https://maps.google.com/?q=Lang+Tu+Duc+Hue',
    badge: 'Kiến Trúc Thi Ca Cổ Phong',
    accentColor: 'from-emerald-950/60 to-stone-950',
  },
  {
    id: 'pho-co-hoi-an',
    name: 'Phố Cổ Hội An',
    region: 'TRUNG',
    regionName: 'Miền Trung',
    province: 'Quảng Nam',
    address: 'Minh An, TP. Hội An, Quảng Nam',
    suitableEntities: ['ao-dai', 'ngu-than', 'tu-than'],
    entityLabel: 'Áo Dài Tân Thời, Áo Dài Học Đường, Ngũ Thân',
    goldenHour: '06:00 – 07:30 (Phố vắng trong lành) & 17:30 – 19:30 khi lên đèn lồng',
    ticketPrice: '80.000đ / vé tham quan các điểm di tích phố cổ',
    openHours: 'Phố đi bộ cả ngày và đêm',
    etiquetteRules: [
      'Tôn trọng sinh hoạt của người dân bản địa ven ngõ nhỏ',
      'Trang phục lịch sự khi viếng thăm Chùa Cầu, Hội quán Phúc Kiến',
      'Không tự ý kéo cành hoa giấy vàng của các nhà cổ',
    ],
    bestPhotoAngles: [
      'Bức tường vàng rực rỡ bên giàn hoa giấy tím đường Trần Phú',
      'Bến thuyền sông Hoài lung linh hoa đăng khi hoàng hôn buông',
      'Trước hiên nhà cổ Tấn Ký với đèn lồng lụa đa sắc',
    ],
    vibeDescription: 'Giao lộ thịnh vượng thương cảng quốc tế. Rất phù hợp cho cả Áo Dài trắng học trò lẫn các bộ phối Remix cách tân rực rỡ.',
    googleMapsUrl: 'https://maps.google.com/?q=Pho+Co+Hoi+An',
    badge: 'Di Sản Đèn Lồng Sông Hoài',
    accentColor: 'from-yellow-950/60 to-stone-950',
  },

  // MIỀN NAM
  {
    id: 'lang-ong-ba-chieu',
    name: 'Lăng Tả Quân Lê Văn Duyệt (Lăng Ông Bà Chiểu)',
    region: 'NAM',
    regionName: 'Miền Nam',
    province: 'TP. Hồ Chí Minh',
    address: 'Số 1 Vũ Tùng, Phường 1, Bình Thạnh, TP.HCM',
    suitableEntities: ['ngu-than', 'ao-dai'],
    entityLabel: 'Áo Ngũ Thân Đàng Trong & Áo Dài Truyền Thống',
    goldenHour: '07:30 – 09:30 sáng & 15:30 – 17:00',
    ticketPrice: 'Miễn phí vào cổng (Có thể công đức tùy tâm)',
    openHours: '07:00 – 17:00 hàng ngày',
    etiquetteRules: [
      'Cấm mặc trang phục hở hang, phản cảm vào khu vực chánh điện',
      'Giữ thái độ cung kính trước mộ phần Tả quân và chánh điện',
      'Không chụp ảnh với tạo dáng quá lố lăng nơi linh thiêng',
    ],
    bestPhotoAngles: [
      'Cổng Tam Quan với hoa văn gốm Cây Mai tuyệt tác',
      'Mái ngói âm dương rêu phong cổ kính bậc nhất Sài Gòn',
      'Hàng cột gỗ son đỏ tại gian Tiền điện uy nghiêm',
    ],
    vibeDescription: 'Viên ngọc cổ kính trăm năm giữa lòng Sài Gòn hoa lệ, mang đậm kiến trúc cung đình triều Nguyễn thời khai phá phương Nam.',
    googleMapsUrl: 'https://maps.google.com/?q=Lang+Ong+Ba+Chieu+Binh+Thanh',
    badge: 'Di Tích Lịch Sử Phương Nam',
    accentColor: 'from-rose-950/50 to-stone-950',
  },
  {
    id: 'chua-ba-thien-hau',
    name: 'Chùa Bà Thiên Hậu (Tuệ Thành Hội Quán)',
    region: 'NAM',
    regionName: 'Miền Nam',
    province: 'TP. Hồ Chí Minh (Chợ Lớn)',
    address: '710 Nguyễn Trãi, Phường 11, Quận 5, TP.HCM',
    suitableEntities: ['ao-dai', 'ngu-than'],
    entityLabel: 'Áo Dài Cổ Điển & Cổ Phục Giao Thoa Á Đông',
    goldenHour: '08:00 – 10:00 sáng (Nắng rọi qua giếng trời nghi ngút khói nhang)',
    ticketPrice: 'Miễn phí tham quan',
    openHours: '06:30 – 16:30 hàng ngày',
    etiquetteRules: [
      'Ăn mặc kín đáo, lịch sự; giữ trật tự nơi thờ tự',
      'Hạn chế chụp ảnh trực diện người đang thành tâm cầu nguyện',
      'Không đứng chắn lối đi của người dâng hương',
    ],
    bestPhotoAngles: [
      'Giếng trời Thiên Tỉnh với những vòng nhang cuộn khói huyền ảo',
      'Phù điêu gốm Thạch Loan tinh xảo trên bờ nóc điện',
      'Cửa gỗ cổ son thếp vàng son bóng thời gian',
    ],
    vibeDescription: 'Bầu không khí hoài niệm đậm chất điện ảnh Hồng Kông những năm 1980 - 1990 hòa quyện cùng cốt cách Á Đông trầm mặc.',
    googleMapsUrl: 'https://maps.google.com/?q=Chua+Ba+Thien+Hau+Nguyen+Trai+Quan+5',
    badge: 'Hội Quán Chợ Lớn Cổ Kính',
    accentColor: 'from-amber-950/50 to-stone-950',
  },
];
