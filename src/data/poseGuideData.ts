export type PoseCategory = 'NAM' | 'NU' | 'CAP_DOI' | 'NHOM';

export interface PoseItem {
  id: string;
  category: PoseCategory;
  title: string;
  subtitle: string;
  culturalMeaning: string;
  postureGuide: {
    headEyes: string;
    handsArms: string;
    bodyTorso: string;
    feetStance: string;
  };
  dos: string[];
  donts: string[];
  recommendedProps: string[];
  visualIcon: string;
}

export const POSE_CATEGORIES = [
  { id: 'NU' as PoseCategory, label: 'Nữ Tú Đoan Trang', icon: '🪭', desc: 'Duyên dáng, e ấp, nâng tà thướt tha' },
  { id: 'NAM' as PoseCategory, label: 'Nam Nhi Khí Khái', icon: '📜', desc: 'Đĩnh đạc, quân tử, phong độ nho gia' },
  { id: 'CAP_DOI' as PoseCategory, label: 'Cặp Đôi Thanh Mai Trúc Mã', icon: '🎎', desc: 'Tương kính như tân, ánh mắt giao thoa' },
  { id: 'NHOM' as PoseCategory, label: 'Nhóm Bạn Kỷ Yếu', icon: '👥', desc: 'Đồng điệu ngũ hành, đội hình tiền hậu' },
];

export const POSE_ITEMS: PoseItem[] = [
  // NỮ TÚ ĐOAN TRANG
  {
    id: 'nu-nang-ta-ao',
    category: 'NU',
    title: 'Thủ Thế Nâng Tà (Lượn Sóng Lụa)',
    subtitle: 'Nâng nhẹ một bên tà áo khi sải bước hoặc đứng nghiêng',
    culturalMeaning: 'Biểu hiện cho sự ý tứ, giữ cho tà áo lụa không chạm bụi trần đồng thời phô diễn đường nét rủ mềm mại của chất liệu tơ tằm.',
    postureGuide: {
      headEyes: 'Cằm hơi thu lại, mắt nhìn chếch xuống 30 độ hoặc nhìn xa xăm mơ màng, miệng mỉm cười phong hàm.',
      handsArms: 'Một tay dùng ngón cái và ngón trỏ khẽ kẹp mép tà áo nâng ngang hông, khuỷu tay uốn cong tự nhiên như cánh hoa; tay kia đặt nhẹ trước bụng hoặc cầm quạt.',
      bodyTorso: 'Người đứng nghiêng góc 45 độ so với ống kính để tôn eo thon và độ bay của hai tà kép.',
      feetStance: 'Chân trước hơi kiễng nhẹ, trọng tâm dồn chân sau, hai mũi hài hơi hướng vào nhau tạo nét e lệ.',
    },
    dos: [
      'Chỉ nâng nhẹ góc tà, để tà áo rủ tự nhiên thành hình cánh buồm',
      'Giữ lưng thẳng, vai thả lỏng tự nhiên',
    ],
    donts: [
      'Tránh nắm chặt túm vo tà áo gây nhăn vải lụa',
      'Không giơ tà quá cao qua thắt lưng làm mất vẻ kín đáo đoan trang',
    ],
    recommendedProps: ['Quạt the hoa sen', 'Cành sen trắng', 'Nón quai thao'],
    visualIcon: '🪭',
  },
  {
    id: 'nu-che-quat-e-ap',
    category: 'NU',
    title: 'Bán Diện Che Quạt (E Ấp Nụ Cười Cố Đô)',
    subtitle: 'Dùng nan quạt the che nửa khuôn mặt dưới',
    culturalMeaning: 'Nét duyên ngầm của thiếu nữ Á Đông thời xưa: "Kín đáo mà rạng ngời", đôi mắt biết cười nói thay lời hoa lệ.',
    postureGuide: {
      headEyes: 'Đầu hơi nghiêng nhẹ sang bên có quạt, ánh mắt long lanh nhìn thẳng vào ống kính hoặc liếc duyên.',
      handsArms: 'Hai tay cùng đỡ cán quạt hoặc một tay cầm quạt che ngang cánh mũi trở xuống, ngón tay út khẽ cong thanh thoát.',
      bodyTorso: 'Thân người xoay nhẹ 3/4 góc chụp, ngực hơi thở nhẹ tạo nét thư thái.',
      feetStance: 'Đứng tĩnh, một chân nhích lên nửa bước, tà áo buông chạm mũi hài thêu.',
    },
    dos: [
      'Để lộ đôi mắt sáng và đôi chân mày lá liễu',
      'Quạt hơi chếch góc xiên nhẹ tạo chiều sâu cho khuôn mặt',
    ],
    donts: [
      'Tránh che kín cả khuôn mặt',
      'Không tì quạt quá sát làm lem phấn son',
    ],
    recommendedProps: ['Quạt nan lụa mỏng', 'Khăn vấn tơ tằm', 'Chuỗi ngọc trai'],
    visualIcon: '✨',
  },
  {
    id: 'nu-chap-tay-bai-kien',
    category: 'NU',
    title: 'Chắp Tay Vòng Bái Kiến (Cung Kính Lễ Nghi)',
    subtitle: 'Hai bàn tay lồng vào nhau ngang tầm ngực hoặc bụng',
    culturalMeaning: 'Cốt cách lễ giáo truyền thống "Tiên học lễ, hậu học văn", thể hiện lòng tôn kính đối với bậc tiền nhân và không gian di tích.',
    postureGuide: {
      headEyes: 'Đầu cúi nhẹ cung kính, ánh mắt hướng về phía trước với sự tĩnh tại thanh khiết.',
      handsArms: 'Tay phải bọc ngoài tay trái (hoặc ngược lại), giấu ngón tay vào ống tay áo thụng hoặc đan nhẹ trước thắt lưng.',
      bodyTorso: 'Lưng thẳng tắp, bờ vai buông thõng đoan chính, cổ áo lập lĩnh cài khuy kín đáo.',
      feetStance: 'Hai bàn chân khép song song hoặc hình chữ V nhỏ, đứng vững chãi kiêu sa.',
    },
    dos: [
      'Ống tay áo buông thõng tự nhiên tạo dáng vẻ cổ phong trang trọng',
      'Tập trung vào hơi thở chậm rãi để nét mặt toát lên vẻ an nhiên',
    ],
    donts: [
      'Tránh gù lưng hoặc nhún vai',
      'Không cười đùa cợt nhả khi thực hiện tư thế bái lễ',
    ],
    recommendedProps: ['Chuỗi tràng hạt bồ đề', 'Kiềng bạc cổ', 'Cổ áo ngũ thân cài khuy'],
    visualIcon: '🙏',
  },

  // NAM NHI KHÍ KHÁI
  {
    id: 'nam-dang-chu-dinh',
    category: 'NAM',
    title: 'Thế Đứng Chữ Đinh (Quân Tử Đĩnh Đạc)',
    subtitle: 'Hai chân đứng thế chữ Đinh, hai tay chắp sau lưng',
    culturalMeaning: 'Khí phách hiên ngang của đấng nam nhi, học rộng tài cao, tâm thế vững như bàn thạch trước phong ba.',
    postureGuide: {
      headEyes: 'Đầu ngẩng cao, ánh mắt kiên định nhìn xa xăm như đang trông ngóng sơn hà xã tắc.',
      handsArms: 'Hai tay chắp sau lưng ngang thắt lưng, tay phải nắm nhẹ cổ tay trái, khuỷu tay mở rộng tạo cảm giác bệ vệ.',
      bodyTorso: 'Ngực ưỡn nhẹ, lưng thẳng như cây trúc quân tử, phom áo ngũ thân tay chẽn thẳng nếp.',
      feetStance: 'Bàn chân trước hướng thẳng, bàn chân sau vuông góc thành hình chữ Đinh (丁), khoảng cách hai chân bằng một vai.',
    },
    dos: [
      'Giữ cằm song song với mặt đất, tạo góc nghiêng góc cạnh nam tính',
      'Áo ngũ thân cần được vuốt phẳng phiu trước khi bấm máy',
    ],
    donts: [
      'Tránh đứng trùng gối làm mất thế đĩnh đạc',
      'Không cho tay vào túi quần tây bên trong áo dài',
    ],
    recommendedProps: ['Khăn đóng đen truyền thống', 'Thư tịch / Sách thẻ tre', 'Đồng hồ quả quýt'],
    visualIcon: '📜',
  },
  {
    id: 'nam-nang-cuon-thu',
    category: 'NAM',
    title: 'Học Lễ Cầm Thư (Nho Sinh Đèn Sách)',
    subtitle: 'Một tay cầm cuốn sách cổ hoặc thư họa, tay kia vuốt nhẹ vạt áo',
    culturalMeaning: 'Tôn vinh truyền thống hiếu học ngàn đời của Nho gia Thăng Long, phong thái thư sinh thanh tao tuấn tú.',
    postureGuide: {
      headEyes: 'Hơi cúi nhìn vào trang sách thẻ tre hoặc ngước lên suy ngẫm chân lý văn chương.',
      handsArms: 'Tay nâng cuốn sách ngang ngực góc 45 độ, ngón tay thon thả giữ gáy sách; tay còn lại buông xuôi tà áo.',
      bodyTorso: 'Người đứng tựa nhẹ vào lan can gỗ hoặc cột đình sơn son thếp vàng.',
      feetStance: 'Đứng thoải mái, trọng tâm dồn một bên chân, mũi giày hướng về phía trước.',
    },
    dos: [
      'Tập trung ánh mắt có thần vào trang sách',
      'Có thể ngồi xếp bằng trên sập gụ nếu chụp trong nhà cổ',
    ],
    donts: [
      'Tránh cầm ngược sách hoặc che mất mặt',
    ],
    recommendedProps: ['Cuốn thư cổ', 'Bút lông & Nghiên mực đá', 'Quạt giấy trầm hương'],
    visualIcon: '📖',
  },

  // CẶP ĐÔI THANH MAI TRÚC MÃ
  {
    id: 'doi-tuong-kinh-nhu-tan',
    category: 'CAP_DOI',
    title: 'Tương Kính Như Tân (Chàng Dìu Bước Nàng)',
    subtitle: 'Chàng bước trước nửa bước, đưa tay khẽ đỡ tay nàng',
    culturalMeaning: 'Nét đẹp tình yêu Á Đông truyền thống: Không phô trương táo bạo mà tình tứ sâu lắng, chàng che chở - nàng nhu thuận.',
    postureGuide: {
      headEyes: 'Chàng quay đầu nhìn nàng dịu dàng trìu mến; Nàng ngước nhìn chàng e ấp mỉm cười.',
      handsArms: 'Chàng xòe bàn tay ngửa lên; Nàng đặt hờ các đầu ngón tay lên mu bàn tay chàng như cánh bướm đậu.',
      bodyTorso: 'Hai người bước song hành chậm rãi, tà áo nam chẽn và tà lụa nữ khẽ bay đồng điệu theo chiều gió.',
      feetStance: 'Cùng bước chân đồng nhịp (chân trái cùng tiến), tạo cảm giác đang dạo bước trong hoa viên Cung đình.',
    },
    dos: [
      'Khoảng cách giữa hai người vừa vặn, không quá xa cũng không quá sát',
      'Ánh mắt trao nhau phải thật tự nhiên',
    ],
    donts: [
      'Tránh ôm hôn quá cuồng nhiệt làm mất chất cổ trang trang nhã',
      'Không giẫm lên tà áo dài của bạn nữ',
    ],
    recommendedProps: ['Dù che lụa giấy dầu mộc', 'Đèn lồng hoa đăng', 'Cành đào mùa xuân'],
    visualIcon: '🎎',
  },
  {
    id: 'doi-chung-mot-nan-quat',
    category: 'CAP_DOI',
    title: 'Lương Duyên Tương Hợp (Chung Một Chiếc Quạt The)',
    subtitle: 'Hai người đứng sát vai, cùng nâng một chiếc quạt lụa ngắm hoa',
    culturalMeaning: 'Minh chứng cho sự đồng điệu tâm hồn, gắn kết se duyên trăm năm dưới bóng mái ngói rêu phong.',
    postureGuide: {
      headEyes: 'Cùng hướng ánh nhìn về một phía (vườn hoa, hồ sen hoặc ống kính).',
      handsArms: 'Tay hai người cùng chạm nhẹ vào cán quạt, ngón tay đan khẽ ấm áp.',
      bodyTorso: 'Nàng hơi nghiêng đầu tựa nhẹ vào vai chàng, chàng đứng thẳng làm điểm tựa vững chãi.',
      feetStance: 'Đứng cân đối, mũi hài hướng về phía trước.',
    },
    dos: [
      'Phối màu sắc trang phục tương sinh ngũ hành để khung hình hài hòa',
      'Tận dụng ánh sáng hoàng hôn ngược sáng (rim light) tôn viền áo',
    ],
    donts: [
      'Tránh tư thế cứng nhắc như tượng sáp',
    ],
    recommendedProps: ['Quạt nan vẽ hoa sen', 'Tràng hạt trầm hương đôi'],
    visualIcon: '🌸',
  },

  // NHÓM BẠN KỶ YẾU
  {
    id: 'nhom-doi-hinh-bac-thang',
    category: 'NHOM',
    title: 'Tam Tài Ngũ Phúc (Đội Hình Bậc Thang Bái Đường)',
    subtitle: 'Xếp so le trên các bậc thềm đá Văn Miếu hoặc Hoàng Thành',
    culturalMeaning: 'Đại diện cho sự gắn kết tri kỷ thanh xuân, thứ bậc tôn nghiêm mà vẫn rộn ràng sức sống tuổi trẻ.',
    postureGuide: {
      headEyes: 'Mỗi người một biểu cảm tự nhiên: người nhìn thẳng, người nhìn nghiêng cười duyên, không ai bị che khuất mặt.',
      handsArms: 'Người đứng hàng trên chắp tay sau lưng; người hàng dưới cầm quạt, sách hoặc nâng tà so le.',
      bodyTorso: 'Người hơi chếch 45 độ so le nhau tạo chiều sâu hun hút cho khung hình kỷ yếu.',
      feetStance: 'Mỗi bậc thềm một độ cao khác nhau, giúp tôn vinh trọn vẹn tà áo của tất cả các thành viên.',
    },
    dos: [
      'Sắp xếp bảng màu áo xen kẽ (ví dụ: Áo xanh cạnh áo be ngà, tránh hai màu chọi nhau đứng sát)',
      'Giữ khoảng cách giữa các thành viên đều đặn',
    ],
    donts: [
      'Tránh đứng chen chúc che mất mặt người hàng sau',
      'Không làm các động tác nhí nhố hiện đại thái quá làm hỏng không khí cổ phong',
    ],
    recommendedProps: ['Quạt giấy đồng bộ', 'Cuốn thư tốt nghiệp', 'Bằng khen / Ống đựng chỉ dụ'],
    visualIcon: '👥',
  },
  {
    id: 'nhom-sai-buoc-dong-dieu',
    category: 'NHOM',
    title: 'Thanh Xuân Đồng Hành (Sải Bước Dưới Mái Hoàng Thành)',
    subtitle: 'Dàn hàng ngang cùng bước tới phía ống kính với nụ cười rạng rỡ',
    culturalMeaning: 'Khoảnh khắc thanh xuân rực rỡ nhất của đời học sinh, sinh viên bước vào ngưỡng cửa tương lai với niềm tự hào di sản dân tộc.',
    postureGuide: {
      headEyes: 'Nhìn thẳng về phía trước hoặc nhìn nhau cười đùa tự nhiên, nụ cười tỏa nắng.',
      handsArms: 'Đung đưa tay nhẹ nhàng theo nhịp bước đi, tà áo bay phấp phới trong gió.',
      bodyTorso: 'Thân người nghiêng nhẹ về phía trước, bước chân tự tin thanh thoát.',
      feetStance: 'Bước đi tự nhiên, nhịp nhàng đồng điệu.',
    },
    dos: [
      'Chụp ở tốc độ màn trập cao để bắt trọn khoảnh khắc tà áo lụa bay bổng',
      'Chọn góc máy thấp (low angle) để tôn chiều cao và độ hoành tráng của kiến trúc phía sau',
    ],
    donts: [
      'Tránh bước quá nhanh khiến bức ảnh bị nhòe',
    ],
    recommendedProps: ['Hoa sen cầm tay', 'Nón quai thao dây ngũ sắc', 'Túi cói mộc'],
    visualIcon: '🎓',
  },
];
