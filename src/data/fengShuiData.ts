export type ElementType = 'KIM' | 'MOC' | 'THUY' | 'HOA' | 'THO';

export interface ElementInfo {
  type: ElementType;
  name: string;
  hanzi: string;
  colorName: string;
  hex: string;
  generates: ElementType; // Tương sinh (sinh ra)
  generatedBy: ElementType; // Được sinh bởi
  overcomes: ElementType; // Tương khắc (khắc chế)
  overcomeBy: ElementType; // Bị khắc bởi
  compatibleColors: string[]; // Màu tương hợp & tương sinh
  tabooColors: string[]; // Màu tương khắc
  description: string;
  luckyStone: string;
}

export const ELEMENT_DETAILS: Record<ElementType, ElementInfo> = {
  KIM: {
    type: 'KIM',
    name: 'Mệnh Kim',
    hanzi: '金',
    colorName: 'Bạch Kim / Hoàng Thổ',
    hex: '#e2e8f0',
    generates: 'THUY',
    generatedBy: 'THO',
    overcomes: 'MOC',
    overcomeBy: 'HOA',
    compatibleColors: ['Trắng bạch ngọc', 'Bạc ánh kim', 'Vàng hổ phách', 'Nâu đất sa thạch'],
    tabooColors: ['Đỏ hồng thắm', 'Tía đậm', 'Cam rực (Hỏa khắc Kim)'],
    description: 'Thanh khiết, sắc sảo, kiên định. Bản mệnh biểu trưng cho sự nghĩa khí, đĩnh đạc và tài hoa.',
    luckyStone: 'Bạch ngọc, Thạch anh vàng, Bạc chạm hoa văn hoa cúc',
  },
  MOC: {
    type: 'MOC',
    name: 'Mệnh Mộc',
    hanzi: '木',
    colorName: 'Thanh Mộc / Lam Thủy',
    hex: '#16a34a',
    generates: 'HOA',
    generatedBy: 'THUY',
    overcomes: 'THO',
    overcomeBy: 'KIM',
    compatibleColors: ['Xanh ngọc lục bảo', 'Xanh lá mạ', 'Xanh lam chàm', 'Đen huyền'],
    tabooColors: ['Trắng tinh khôi', 'Ánh kim bạc rực rỡ (Kim khắc Mộc)'],
    description: 'Sinh sôi nảy nở, nhân từ, thư thái. Bản mệnh biểu trưng cho tri thức uyên bác và sự trường thọ.',
    luckyStone: 'Cẩm thạch sơn thủy, Gỗ trầm hương, Lapis lam ngọc',
  },
  THUY: {
    type: 'THUY',
    name: 'Mệnh Thủy',
    hanzi: '水',
    colorName: 'Huyền Thủy / Bạch Kim',
    hex: '#2563eb',
    generates: 'MOC',
    generatedBy: 'KIM',
    overcomes: 'HOA',
    overcomeBy: 'THO',
    compatibleColors: ['Xanh lam sẫm', 'Xanh biển sâu', 'Đen huyền lụa', 'Bạch ngọc trắng'],
    tabooColors: ['Vàng đất sa thạch', 'Nâu sồng trầm đục (Thổ khắc Thủy)'],
    description: 'Uyển chuyển, mẫn tiệp, thông tuệ. Nước nuôi dưỡng vạn vật, mang năng lượng hòa nhã và thấu suốt.',
    luckyStone: 'Hắc thạch, Thạch anh xanh dương, Bạc chạm vân sóng nước',
  },
  HOA: {
    type: 'HOA',
    name: 'Mệnh Hỏa',
    hanzi: '火',
    colorName: 'Xích Hỏa / Thanh Mộc',
    hex: '#dc2626',
    generates: 'THO',
    generatedBy: 'MOC',
    overcomes: 'KIM',
    overcomeBy: 'THUY',
    compatibleColors: ['Đỏ chu sa', 'Đỏ thắm mận chín', 'Hồng phấn đào hoa', 'Xanh ngọc bích'],
    tabooColors: ['Đen mực huyền', 'Xanh lam thẫm ngút ngàn (Thủy khắc Hỏa)'],
    description: 'Nhiệt huyết, rạng ngời, tiên phong. Lửa soi sáng đêm trường, biểu trưng cho lễ nghi và danh vọng.',
    luckyStone: 'Hồng ngọc (Ruby), Mã não đỏ, San hô huyết ngọc',
  },
  THO: {
    type: 'THO',
    name: 'Mệnh Thổ',
    hanzi: '土',
    colorName: 'Hoàng Thổ / Xích Hỏa',
    hex: '#d97706',
    generates: 'KIM',
    generatedBy: 'HOA',
    overcomes: 'THUY',
    overcomeBy: 'MOC',
    compatibleColors: ['Vàng hoàng yến', 'Nâu hổ phách', 'Sa thạch mộc mạc', 'Đỏ thắm chu sa'],
    tabooColors: ['Xanh lá mạ rực rỡ', 'Xanh ngọc bích thuần (Mộc khắc Thổ)'],
    description: 'Bao dung, vững chãi, trung tín. Đất nâng đỡ muôn loài, mang lại điểm tựa bình yên và phúc đức vẹn tròn.',
    luckyStone: 'Hổ phách mật lạp, Thạch anh vàng, Gốm Bát Tràng tráng men ngọc',
  },
};

// Tra cứu bản mệnh theo năm sinh (1990 - 2012)
export interface BirthYearFate {
  year: number;
  canChi: string;
  element: ElementType;
  fateName: string; // Tên nạp âm (ví dụ: Thành Đầu Thổ, Bạch Lạp Kim...)
}

export const BIRTH_YEARS_DATA: BirthYearFate[] = [
  { year: 1990, canChi: 'Canh Ngọ', element: 'THO', fateName: 'Lộ Bàng Thổ (Đất ven đường)' },
  { year: 1991, canChi: 'Tân Mùi', element: 'THO', fateName: 'Lộ Bàng Thổ (Đất ven đường)' },
  { year: 1992, canChi: 'Nhâm Thân', element: 'KIM', fateName: 'Kiếm Phong Kim (Vàng mũi kiếm)' },
  { year: 1993, canChi: 'Quý Dậu', element: 'KIM', fateName: 'Kiếm Phong Kim (Vàng mũi kiếm)' },
  { year: 1994, canChi: 'Giáp Tuất', element: 'HOA', fateName: 'Sơn Đầu Hỏa (Lửa trên núi)' },
  { year: 1995, canChi: 'Ất Hợi', element: 'HOA', fateName: 'Sơn Đầu Hỏa (Lửa trên núi)' },
  { year: 1996, canChi: 'Bính Tý', element: 'THUY', fateName: 'Giản Hạ Thủy (Nước dưới khe)' },
  { year: 1997, canChi: 'Đinh Sửu', element: 'THUY', fateName: 'Giản Hạ Thủy (Nước dưới khe)' },
  { year: 1998, canChi: 'Mậu Dần', element: 'THO', fateName: 'Thành Đầu Thổ (Đất trên thành)' },
  { year: 1999, canChi: 'Kỷ Mão', element: 'THO', fateName: 'Thành Đầu Thổ (Đất trên thành)' },
  { year: 2000, canChi: 'Canh Thìn', element: 'KIM', fateName: 'Bạch Lạp Kim (Vàng sáp ong)' },
  { year: 2001, canChi: 'Tân Tỵ', element: 'KIM', fateName: 'Bạch Lạp Kim (Vàng sáp ong)' },
  { year: 2002, canChi: 'Nhâm Ngọ', element: 'MOC', fateName: 'Dương Liễu Mộc (Gỗ cây liễu)' },
  { year: 2003, canChi: 'Quý Mùi', element: 'MOC', fateName: 'Dương Liễu Mộc (Gỗ cây liễu)' },
  { year: 2004, canChi: 'Giáp Thân', element: 'THUY', fateName: 'Tuyền Trung Thủy (Nước trong giếng)' },
  { year: 2005, canChi: 'Ất Dậu', element: 'THUY', fateName: 'Tuyền Trung Thủy (Nước trong giếng)' },
  { year: 2006, canChi: 'Bính Tuất', element: 'THO', fateName: 'Ốc Thượng Thổ (Đất nóc nhà)' },
  { year: 2007, canChi: 'Đinh Hợi', element: 'THO', fateName: 'Ốc Thượng Thổ (Đất nóc nhà)' },
  { year: 2008, canChi: 'Mậu Tý', element: 'HOA', fateName: 'Tích Lịch Hỏa (Lửa sấm sét)' },
  { year: 2009, canChi: 'Kỷ Sửu', element: 'HOA', fateName: 'Tích Lịch Hỏa (Lửa sấm sét)' },
  { year: 2010, canChi: 'Canh Dần', element: 'MOC', fateName: 'Tùng Bách Mộc (Gỗ tùng bách)' },
  { year: 2011, canChi: 'Tân Mão', element: 'MOC', fateName: 'Tùng Bách Mộc (Gỗ tùng bách)' },
  { year: 2012, canChi: 'Nhâm Thìn', element: 'THUY', fateName: 'Trường Lưu Thủy (Nước chảy dài)' },
];

/**
 * Phân tích màu sắc hoặc tag thành Mệnh Ngũ Hành
 */
export function getElementFromColor(colorName?: string, hex?: string, tags?: string[]): ElementType {
  const text = `${colorName || ''} ${tags ? tags.join(' ') : ''}`.toLowerCase();
  
  if (text.includes('đỏ') || text.includes('hồng') || text.includes('cam') || text.includes('tía') || text.includes('hỏa')) {
    return 'HOA';
  }
  if (text.includes('xanh lá') || text.includes('ngọc lục') || text.includes('mạ') || text.includes('lục') || text.includes('mộc') || text.includes('rêu')) {
    return 'MOC';
  }
  if (text.includes('xanh lam') || text.includes('xanh dương') || text.includes('đen') || text.includes('chàm') || text.includes('thủy') || text.includes('huyền')) {
    return 'THUY';
  }
  if (text.includes('trắng') || text.includes('bạch') || text.includes('bạc') || text.includes('kem') || text.includes('kim')) {
    return 'KIM';
  }
  if (text.includes('vàng') || text.includes('nâu') || text.includes('hổ phách') || text.includes('thổ') || text.includes('sa thạch') || text.includes('đất')) {
    return 'THO';
  }

  // Fallback qua mã màu hex nếu có
  if (hex) {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length === 6) {
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      if (r > 200 && g > 200 && b > 200) return 'KIM'; // Trắng
      if (r > 160 && g < 100 && b < 100) return 'HOA'; // Đỏ
      if (g > 140 && g > r && g > b) return 'MOC'; // Xanh lá
      if (b > 140 && b > r) return 'THUY'; // Xanh dương
      if (r > 150 && g > 120 && b < 100) return 'THO'; // Vàng/Nâu
    }
  }

  return 'MOC'; // Mặc định an toàn
}
