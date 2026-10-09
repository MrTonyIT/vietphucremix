import { EntitySlug } from '../types/fashion';

export interface DynastyEra {
  id: string;
  name: string;
  period: string;
  century: string;
  rulerHighlight: string;
  philosophy: string;
  costumeFeatures: string[];
  regulations: string[];
  motifs: string[];
  colors: string[];
  targetSlug: EntitySlug;
  suggestedOutfitName: string;
  description: string;
  quote: string;
  icon: string;
  themeGradient: string;
}

export const DYNASTY_ERAS: DynastyEra[] = [
  {
    id: 'ly-tran',
    name: 'Thời Lý – Trần',
    period: '1009 – 1400',
    century: 'Thế kỷ XI – XIV',
    rulerHighlight: 'Lý Thái Tổ, Trần Nhân Tông, Trần Hưng Đạo',
    philosophy: 'Hào khí Đông A kiêu hùng, hòa quyện sâu sắc cùng tinh thần Phật giáo Thiền tông từ bi và phóng khoáng.',
    costumeFeatures: [
      'Áo Giao Lĩnh (cổ vạt chéo) thụng rộng tay tự do, khoáng đạt',
      'Đai lụa buông dài ngang thắt lưng',
      'Búi tóc sau gáy hoặc chít khăn the, thường dân đi chân đất hoặc guốc gỗ mộc',
      'Chất liệu tơ tằm thô, lụa đũi dệt tay nhuộm màu thảo mộc tự nhiên',
    ],
    regulations: [
      'Vua quan giản dị, gần gũi với bách tính muôn dân',
      'Màu vàng thư chỉ dành cho hoàng đế, quân sĩ thích xăm hình rồng trên đùi',
    ],
    motifs: ['Hoa cúc dây uốn lượn hình sin', 'Hoa sen cánh nở men ngọc', 'Lá đề chạm rồng mác nhọn'],
    colors: ['Trắng ngà', 'Lam chàm', 'Nâu gụ sa thạch', 'Xanh men ngọc'],
    targetSlug: 'tu-than',
    suggestedOutfitName: 'Áo Giao Lĩnh & Tứ Thân Cổ Mộc',
    description: 'Thời kỳ định hình nền văn minh Đại Việt độc lập tự chủ. Phục sức toát lên sự mộc mạc, thuần khiết mà kiên cường bất khuất.',
    quote: 'Xã tắc hai phen chồn ngựa đá / Non sông nghìn thuở vững âu vàng.',
    icon: '🏯',
    themeGradient: 'from-amber-950/60 via-stone-900 to-stone-950',
  },
  {
    id: 'le-so',
    name: 'Thời Lê Sơ',
    period: '1428 – 1527',
    century: 'Thế kỷ XV – XVI',
    rulerHighlight: 'Lê Thái Tổ (Lê Lợi), Lê Thánh Tông',
    philosophy: 'Đỉnh cao Nho giáo thịnh trị, đề cao Lễ - Nghĩa - Trí - Tín và trật tự điển chế cung đình nghiêm cẩn.',
    costumeFeatures: [
      'Áo Viên Lĩnh (cổ tròn cài khuy lệch) trang nghiêm',
      'Mũ Phác Đầu tai cánh chuồn bệ vệ cho quan lại',
      'Bổ tử (tấm thêu vuông trước ngực): Quan văn thêu chim muông, quan võ thêu kỳ lân sư tử',
      'Áo Giao Lĩnh vạt chéo vẫn thịnh hành trong dân gian và sĩ tử',
    ],
    regulations: [
      'Bộ Lễ ban hành điển chế mũ áo chi tiết từng phẩm cấp (nhất phẩm đến cửu phẩm)',
      'Dân chúng không được tự ý dùng vải thêu rồng phượng và tơ lụa màu vàng',
    ],
    motifs: ['Rồng năm móng uy nghi', 'Bạch hạc ngậm cành hoa', 'Mây ngũ sắc cuộn sóng thủy ba'],
    colors: ['Đỏ thắm chu sa', 'Xanh lam đậm', 'Vàng hổ phách', 'Tím hoàng gia'],
    targetSlug: 'ngu-than',
    suggestedOutfitName: 'Cổ Phục Hoàng Triều Lê Sơ',
    description: 'Thời đại của Hồng Đức thịnh thế. Phục trang đạt đến độ hoàn mỹ về quy chuẩn lễ nhạc và phẩm vị danh giá.',
    quote: 'Như nước Đại Việt ta từ trước / Vốn xưng nền văn hiến đã lâu.',
    icon: '⚔️',
    themeGradient: 'from-red-950/60 via-stone-900 to-stone-950',
  },
  {
    id: 'le-trung-hung',
    name: 'Thời Lê Trung Hưng',
    period: '1533 – 1789',
    century: 'Thế kỷ XVI – XVIII',
    rulerHighlight: 'Vua Lê – Chúa Trịnh (Đàng Ngoài), Chúa Nguyễn (Đàng Trong)',
    philosophy: 'Giao thoa văn hóa Đàng Ngoài và Đàng Trong, sự phát triển rực rỡ của kinh tế thương cảng Kẻ Chợ - Phố Hiến - Hội An.',
    costumeFeatures: [
      'Áo Đối Khâm (hai vạt song song mở ngực) tay thụng lộng lẫy cho mệnh phụ',
      'Áo tứ thân và tiền thân áo năm thân hình thành rõ nét trong đời sống',
      'Yếm lụa hoa sen mặc trong kết hợp thắt lưng lụa đa sắc',
      'Vải gấm đoạn thêu chỉ kim tuyến vàng bạc nhập cảng từ tơ lụa quốc tế',
    ],
    regulations: [
      'Chúa Nguyễn Phúc Khoát năm 1744 ra sắc lệnh cải cách y phục Đàng Trong, đặt nền móng cho áo năm thân cài khuy',
    ],
    motifs: ['Rồng ổ mây vần', 'Phượng hoàng hàm thư', 'Bát bửu cổ phong'],
    colors: ['Xanh ngọc bích', 'Hồng cánh sen', 'Đỏ điều', 'Vàng tơ tằm'],
    targetSlug: 'tu-than',
    suggestedOutfitName: 'Áo Đối Khâm & Tứ Thân Kinh Bắc',
    description: 'Sự phong phú kỳ diệu của mỹ thuật cổ. Vẻ đẹp bay bổng quý phái kết hợp hài hòa giữa cung đình và lễ hội dân gian.',
    quote: 'Thứ nhất Kinh Kỳ, thứ nhì Phố Hiến.',
    icon: '🏮',
    themeGradient: 'from-purple-950/60 via-stone-900 to-stone-950',
  },
  {
    id: 'trieu-nguyen',
    name: 'Triều Nguyễn',
    period: '1802 – 1945',
    century: 'Thế kỷ XIX – XX',
    rulerHighlight: 'Gia Long, Minh Mạng, Thiệu Trị, Tự Đức, Bảo Đại',
    philosophy: 'Thống nhất toàn vẹn lãnh thổ từ Ải Nam Quan đến Mũi Cà Mau. Quốc gia Đại Nam chuẩn hóa Quốc Phục thống nhất.',
    costumeFeatures: [
      'Áo Ngũ Thân Lập Lĩnh tay chẽn: Quốc phục chính thức cho mọi tầng lớp (nam lẫn nữ)',
      'Áo Nhật Bình: Thường phục cao quý của Hoàng hậu, Công chúa và mệnh phụ triều đình',
      'Cổ áo lập lĩnh thẳng thớm (tượng trưng cho sự chính trực), 5 nút cài ngũ thường',
      'Khăn lươn (khăn đóng) vấn đầu gọn gàng đĩnh đạc',
    ],
    regulations: [
      'Vua Minh Mạng năm 1827 - 1837 ban chiếu chỉ toàn dân đổi sang mặc quần đáy và áo ngũ thân',
      'Ngũ thân gồm 5 thân vải: 4 thân tượng trưng tứ thân phụ mẫu, 1 thân con bên trong che chở người mặc',
    ],
    motifs: ['Cổ viền ngũ sắc dải cầu vồng (Nhật Bình)', 'Hoa văn chữ Thọ kết kim ngân', 'Mây lượn ngũ sắc'],
    colors: ['Hoàng yến', 'Xanh lam chàm', 'Đỏ chu sa', 'Tím hoa cà xứ Huế'],
    targetSlug: 'ngu-than',
    suggestedOutfitName: 'Áo Ngũ Thân Lập Lĩnh Cố Đô',
    description: 'Đỉnh cao mẫu mực của cổ phục Việt Nam. Tinh hoa nghệ thuật dệt may cung đình Huế lưu truyền nguyên vẹn giá trị di sản.',
    quote: 'Giữ nếp cương thường qua năm tà áo / Đĩnh đạc phong cương một dải sơn hà.',
    icon: '👑',
    themeGradient: 'from-amber-900/60 via-stone-900 to-stone-950',
  },
  {
    id: 'tan-thoi-hien-dai',
    name: 'Tân Thời & Đương Đại',
    period: '1930 – Nay',
    century: 'Thế kỷ XX – XXI',
    rulerHighlight: 'Họa sĩ Le Mur (Nguyễn Cát Tường), Lê Phổ, Thế hệ Gen Z Remix',
    philosophy: 'Tôn vinh vẻ đẹp hình thể thiếu nữ Việt Nam hiện đại, giao thoa di sản ngàn năm cùng nhịp sống thanh xuân hội nhập.',
    costumeFeatures: [
      'Áo Dài hai tà thướt tha ôm sát đường cong eo thon quyến rũ',
      'Cổ áo cao thanh mảnh kết hợp quần lụa trắng hoặc lụa đen',
      'Áo Dài trắng học sinh - sinh viên biểu tượng của tuổi hoa niên thanh thuần',
      'Trào lưu Remix: Phối áo dài cùng phụ kiện hiện đại, sneaker, quạt the, túi cói',
    ],
    regulations: [
      'Không giới hạn khuôn mẫu: Tự do sáng tạo trên nền tảng tôn trọng cấu trúc tà áo truyền thống',
    ],
    motifs: ['Hoa sen cách điệu', 'Họa tiết gốm hoa lam đương đại', 'Vải trơn thanh lịch thuần khiết'],
    colors: ['Trắng tinh khôi', 'Hồng pastel', 'Xanh ngọc nhạt', 'Vàng be ngà'],
    targetSlug: 'ao-dai',
    suggestedOutfitName: 'Áo Dài Học Đường & Remix Trẻ Trung',
    description: 'Biểu tượng văn hóa đại diện cho tâm hồn người Việt khắp năm châu bốn biển, luôn trường tồn và rạng rỡ theo năm tháng.',
    quote: 'Áo bay trắng cả khung trời kỷ niệm / Cho lòng ai xao xuyến mỗi mùa thi.',
    icon: '🌸',
    themeGradient: 'from-rose-950/60 via-stone-900 to-stone-950',
  },
];
