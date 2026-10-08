export interface SceneDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  vibe: string;
  timeOfDay: string;
  lighting: string;
  dominantColor: string;
  promptBackgroundDescription: string;
  svgBackdropId: string;
}

export const SCENE_DEFINITIONS: SceneDefinition[] = [
  {
    id: 'scene-school',
    name: 'Sân Trường & Giảng Đường Cổ Kính',
    tagline: 'Kỷ yếu thanh xuân, kiến trúc Đông Dương hoài niệm',
    description: 'Sân trường rợp bóng cây cổ thụ, hàng hiên hành lang sơn vàng nghệ thuật với ô cửa chớp gỗ đặc trưng Đông Dương.',
    vibe: 'Thanh lịch, trong trẻo, hoài niệm học trò',
    timeOfDay: 'Buổi sáng nắng dịu (Morning golden hour)',
    lighting: 'Ánh nắng xiên qua tán lá cây, tạo bóng đổ hoa nắng lãng mạn',
    dominantColor: '#d97706',
    promptBackgroundDescription: 'historic Indochine-style colonial school courtyard in Vietnam, weathered warm yellow stucco walls, deep green wooden shutters, lush tropical greenery with banyan leaves casting dappled sunlight on clean stone pavement, tranquil nostalgic atmosphere, editorial composition',
    svgBackdropId: 'school',
  },
  {
    id: 'scene-street',
    name: 'Phố Đi Bộ Hà Nội & Hồ Gươm',
    tagline: 'Dạo phố cuối tuần, hòa quyện nhịp sống thủ đô',
    description: 'Bờ hồ rợp bóng lộc vừng, xa xa là tháp rùa mờ ảo trong sương sớm, vỉa hè lát đá sạch sẽ thoáng đãng.',
    vibe: 'Năng động, đương đại, hơi thở phố phường',
    timeOfDay: 'Ban ngày tươi sáng (Daylight)',
    lighting: 'Ánh sáng tự nhiên ngoài trời trong trẻo, bầu trời thoáng mát',
    dominantColor: '#059669',
    promptBackgroundDescription: 'scenic pedestrian promenade along Hoan Kiem Lake in Hanoi, ancient willow trees framing misty lake water, elegant French quarter street pavers, soft natural morning daylight, depth of field, vibrant city editorial portrait',
    svgBackdropId: 'street',
  },
  {
    id: 'scene-studio',
    name: 'Studio Thời Trang Đương Đại',
    tagline: 'Tối giản, tập trung ánh sáng tôn vinh chất liệu',
    description: 'Không gian phông vòm cong vô cực màu be ấm, ánh sáng softbox khuếch tán dịu dàng làm nổi bật độ bóng của lụa và tơ tằm.',
    vibe: 'Sang trọng, tối giản, editorial cao cấp',
    timeOfDay: 'Ánh sáng studio nhân tạo chuẩn mực',
    lighting: 'Softbox lớn khuếch tán ánh sáng mềm, bóng mờ mịn màng',
    dominantColor: '#ca8a04',
    promptBackgroundDescription: 'minimalist contemporary high-fashion studio interior, seamless warm beige cyclorama wall, soft diffused softbox lighting casting delicate gradient shadows on clean polished concrete floor, ultra clean luxury editorial fashion shoot aesthetic',
    svgBackdropId: 'studio',
  },
  {
    id: 'scene-heritage',
    name: 'Cung Đình Cố Đô & Di Tích Lịch Sử',
    tagline: 'Trang trọng, tôn vinh chiều sâu văn hóa truyền thống',
    description: 'Khoảng sân lát đá phiến cổ kính, hàng cột gỗ lim sơn son thếp vàng và mái ngói âm dương rêu phong uy nghiêm.',
    vibe: 'Trang nghiêm, hoài cổ, đậm tính di sản',
    timeOfDay: 'Chiều tà mờ ảo (Late afternoon)',
    lighting: 'Ánh sáng hoàng hôn vàng óng chiếu nhẹ lên thềm đá và cột son',
    dominantColor: '#dc2626',
    promptBackgroundDescription: 'ancient Vietnamese royal palace courtyard in Hue Imperial Citadel, grand carved red-lacquered wooden columns, weathered ceramic tile roofs, ancient grey stone courtyard, soft late afternoon atmospheric haze, profound historical heritage mood',
    svgBackdropId: 'heritage',
  },
];
