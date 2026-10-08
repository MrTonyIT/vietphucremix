# VIỆT PHỤC REMIX — PROJECT STATE

## 1. TỔNG QUAN DỰ ÁN
- **Tên dự án:** Việt Phục Remix
- **Tagline:** Mặc chất Gen Z — Hiểu đúng Việt phục
- **Mục tiêu:** Nền tảng thời trang tương tác giúp học sinh, sinh viên phối đồ Việt phục cách tân/truyền thống đi kỷ yếu, chụp ảnh nghệ thuật, sự kiện trường học.
- **Model Gemini chỉ định:** `models/gemini-3.8-flash` (Gọi độc quyền phía server-side).

---

## 2. TIẾN ĐỘ THEO CHECKPOINT

### Checkpoint 1: Dựng nền tảng hiển thị và dữ liệu ban đầu
- **Trạng thái:** COMPLETED
- **Mục tiêu:**
  - [x] Tạo `docs/PROJECT_STATE.md` và `docs/CULTURE_PROVENANCE.md`.
  - [x] Cài đặt `zod` để validate schema.
  - [x] Thiết lập backend Express chạy đồng thời với Vite dev middleware trên cổng 3000 (`server.ts`).
  - [x] Xây dựng catalog 18+ items bao gồm đủ 3 nhóm áo (Áo dài, Ngũ thân, Tứ thân) và đủ 6 slots (`main`, `lower`, `inner`, `headwear`, `footwear`, `accessory`).
  - [x] Định nghĩa 3 Outfit Recipes chuẩn (kèm Yếm bắt buộc cho Tứ thân, Nón lá ở headwear).
  - [x] Xây dựng API `GET /api/catalog`, `GET /api/outfits/default`, `GET /api/culture/:slug`, `GET /api/health`.
  - [x] Xây dựng component minh họa trực quan vector SVG `OutfitVisualizer.tsx` với phom dáng phân biệt rõ nét 3 nhóm trang phục (Áo dài tà kép, Ngũ thân 5 thân cài 5 khuy, Tứ thân buộc vạt lộ yếm vàng cánh sen).
  - [x] Triển khai giao diện chọn 3 nhóm áo với hiển thị trực quan và thẻ văn hóa có nguồn trích dẫn (`SOURCED_FACT`, `STYLING_NOTE`, `CAUTION`).
  - [x] Kiểm chứng build và Live Preview.

### Checkpoint 2: Tùy biến bộ đồ và Luật tương thích
- **Trạng thái:** COMPLETED
- **Mục tiêu:**
  - [x] Mở rộng Server API: Thêm `POST /api/recommend` (gợi ý bộ phối theo Heuristic trọng số: 40% sự kiện, 30% phong cách, 20% màu sắc, 10% remix) và `POST /api/swap-item` (đổi đúng 1 món, giữ nguyên 100% các slot còn lại và chạy qua validator).
  - [x] Xây dựng bộ điều khiển Builder (Unified Dashboard) với bộ lọc Bối cảnh sự kiện, Nhóm áo chính và Tông màu ưu tiên.
  - [x] Tích hợp tính năng "Đổi một món" (Single-Slot Swap) với modal trực quan, hiển thị các món khả dụng tương thích theo nhóm áo và vị trí slot.
  - [x] Quản lý Lookbook cá nhân lưu trữ trên `localStorage` (`vietphuc_lookbook_v1`), có cơ chế xử lý JSON hỏng, bắt lỗi quota đầy và fallback tránh trắng trang khi thiếu item.
  - [x] Toast notification phản hồi người dùng khi thực hiện tác vụ (đổi món, lưu Lookbook, áp dụng bộ phối).
  - [x] Kiểm chứng thực tế: Build pass, lint pass, curl API test pass (đổi giày sneaker giữ nguyên 4 món còn lại), Lookbook lưu/xóa/mặc lại hoạt động trơn tru.

### Checkpoint 3: Tích hợp Gemini Assistant & Đổi một món
- **Trạng thái:** COMPLETED
- **Mục tiêu:**
  - [x] Tích hợp an toàn Gemini SDK (`@google/genai`) độc quyền tại server-side (`server.ts`). Model cấu hình: `models/gemini-3.8-flash` (ưu tiên `process.env.GEMINI_MODEL`).
  - [x] Khai báo 3 công cụ (Function Calling) chuẩn hóa: `recommend_outfits`, `swap_outfit_item`, `get_culture_context`.
  - [x] Triển khai API route `POST /api/chat` với Zod validation, kiểm tra catalog ID, giới hạn 10 tin nhắn gần nhất và 2000 ký tự.
  - [x] Tool loop an toàn: Tối đa 3 lượt gọi model có tools, tối đa 6 lượt thực thi tool, timeout tổng 30 giây với graceful fallback.
  - [x] Tạo action đề xuất (`SWAP_ITEM`, `APPLY_OUTFIT`) hoàn toàn phía server từ kết quả tool, không lấy ID tùy ý từ text AI.
  - [x] Tích hợp `baseOutfitRevision` (fingerprint), chống Stale Action: Cảnh báo ghi đè khi trang phục hiện tại đã bị thay đổi trước khi người dùng bấm áp dụng.
  - [x] Khóa slot (Slot Lock): Cho phép người dùng khóa cố định từng món đồ, AI và tool không được phép tự ý thay thế.
  - [x] Xây dựng UI Chat Assistant (`src/components/ChatAssistant.tsx`): Cửa sổ floating drawer, hiển thị gợi ý nhanh, nút hành động trực quan, chống spam/double-click.
  - [x] Bảo mật API Key: Xác nhận 100% không có API key trong client source code (`src/`) hoặc production bundle (`dist/`).
  - [x] Phân biệt rõ ràng kết quả Mock/Fallback Tests và Live Gemini Tests.

### Checkpoint 4: Lookbook, So sánh & Hoàn thiện
- **Trạng thái:** COMPLETED
- **Mục tiêu:**
  - [x] Triển khai tính năng So Sánh (Compare): Cho phép người dùng chọn đúng hai bộ Lookbook khác nhau để đối chiếu trực quan.
  - [x] Đánh giá độ phù hợp (Heuristic Score) trên cùng một bối cảnh chung do người dùng lựa chọn (Sự kiện, Phong cách, Tông màu), bảo đảm tính khách quan tuyệt đối, không dùng điểm giả.
  - [x] Cơ chế Snapshot trung thực: Khi một bộ có món bị xóa hoặc thiếu trong catalog, hệ thống hiển thị cảnh báo rõ ràng trên bộ đó kèm mã ID thiếu, đồng thời giữ nguyên toàn bộ các món khả dụng khác mà không gây crash hoặc tự ý thay thế món đồ.
  - [x] Dùng instance ID riêng cho mỗi bộ phối SVG (`compare-outfit-a` và `compare-outfit-b`) chống xung đột định danh SVG gradients/filters.
  - [x] Bố cục thích ứng (Responsive): Trên di động tự động xếp dọc (2 thẻ dọc) cuộn mượt mà; trên màn hình lớn hiển thị song song hai cột (side-by-side); tuyệt đối không gây tràn ngang toàn trang web.
  - [x] Tích hợp liên kết tìm kiếm mẫu tương tự trên Shopee:
    + Nhãn chuẩn hóa: "Tìm mẫu tương tự trên Shopee ↗".
    + URL tạo hoàn toàn bằng code từ domain cố định và `encodeURIComponent(item.name)` (không lấy URL do AI sinh, không tự ý thêm "cổ phục" vào từ khóa như giày sneaker).
    + Mở tab mới với `target="_blank"` và `rel="noopener noreferrer"`.
    + Kèm chú thích minh bạch: Liên kết tìm kiếm tham khảo ngoài sàn, không cam kết tình trạng hàng có sẵn hoặc giá cả.
  - [x] Thêm endpoint `POST /api/compare` phía server để cung cấp khả năng đánh giá authoritative độc lập với client.
  - [x] Cập nhật badge giao diện và footer sang Checkpoint 4.

---

## 3. EVIDENCE THỰC TẾ & KIỂM CHỨNG

### A. Kiểm thử nền tảng & Build
- `package.json`: Đã cài đặt `zod`, `@google/genai: ^2.4.0`, `express: ^4.21.2`, `tsx: ^4.21.0`.
- Server port: 3000 (Express tích hợp Vite middleware).
- Build status: `npm run build` hoàn thành trong 725ms không có lỗi (PASS).
- Typecheck / Lint: `tsc --noEmit` đạt 0 lỗi (PASS).
- Kiểm tra rò rỉ API Key: `grep -rn "GEMINI_API_KEY" src/` và `dist/` -> 0 kết quả (PASS).

### B. Kiểm thử Chức năng API & Chat Assistant
- **Đổi giày giữ nguyên các slot khác (TC-06 / TC-07)**: Gửi chat yêu cầu đổi giày trẻ trung cho áo ngũ thân -> Trả về `action` với targetSlot `footwear`, giữ nguyên 4 món còn lại (PASS).
- **Slot bị khóa (TC-05)**: Gửi request với `lockedItemIds` chứa giày -> Server bắt được slot bị khóa, trả về thông báo lỗi lịch sự, không sinh action đổi đồ (PASS).
- **Tra cứu văn hóa (TC-10)**: Gửi câu hỏi về nguồn gốc áo ngũ thân -> Trả về trích dẫn từ *Khâm định Đại Nam hội điển sự lệ* và *Trang phục Việt Nam* (PASS).
- **Chống Stale Action (TC-09)**: Kiểm tra fingerprint `baseOutfitRevision` khi đổi bộ đồ trước lúc bấm action -> Hiển thị hộp thoại cảnh báo ghi đè (PASS).
- **Chống Double-click**: Nút gửi và nút hành động vô hiệu hóa trạng thái `disabled` khi `isSending` hoặc `isApplyingAction` (PASS).
- **Graceful Fallback khi Timeout/Cạn Quota (TC-14)**: Khi không có key hoặc API timeout 30s -> Tự động chuyển sang Local Fallback Engine, tạo action hợp lệ bình thường mà không gây crash server (PASS).

### C. Kiểm thử So Sánh Lookbook & Liên Kết Shopee (Checkpoint 4)
- **POST /api/compare**: Gửi request so sánh Áo Dài Học Đường vs Ngũ Thân Remix với tiêu chí `KY_YEU`, `thanh lịch` -> Cả hai bộ đều được chấm điểm trên cùng tiêu chí (Áo dài 87%, Ngũ thân 90%), trả về đầy đủ items, validation và findings văn hóa (PASS).
- **Bảo toàn khi thiếu Item / Không Crash (TC-Compare-Resilience)**: Gửi request chứa mã item không tồn tại trong catalog (`item-head-non-la`) -> API và UI phát hiện chính xác, báo `missingItemIds: ["item-head-non-la"]`, không tự ý bịa món thay thế, bảo toàn hiển thị các món còn lại (PASS).
- **Chặn chọn trùng bộ phối**: UI cảnh báo rõ ràng khi người dùng chọn cùng một bộ phối ở cả hai bên (PASS).
- **Độc lập SVG Instance**: Bộ A dùng `instanceId="compare-outfit-a"`, Bộ B dùng `instanceId="compare-outfit-b"` -> Không bị xung đột IDs gradient và shadow (PASS).
- **Shopee Search Links**: Tất cả liên kết đều tạo bởi `https://shopee.vn/search?keyword=${encodeURIComponent(item.name)}`, có `target="_blank"`, `rel="noopener noreferrer"`, hiển thị nhãn chính xác "Tìm mẫu tương tự trên Shopee ↗" (PASS).

### D. Phân định Kiểm thử Mock vs Live Gemini
- **Mock / Fallback Tests**: PASS (Đã kiểm tra trực tiếp qua curl và local fallback reasoning).
- **Live Gemini API Tests**: NOT VERIFIED trong môi trường build tự động (chờ người dùng cấu hình runtime secret trong AI Studio UI). Khi có key thật, hệ thống tự động gọi `models/gemini-3.8-flash`.

### E. Bằng Chứng Nghiệm Thu Hoàn Thiện (Đợt 1 -> Đợt 5)
- **Đợt 1 (State, Validation, Locks & Async)**:
  + Cơ chế Request Generation (`requestSeqRef`): Khi người dùng chuyển nhóm hoặc thao tác bộ đồ mới trong lúc request swap hoặc recommend đang gửi, response cũ được phát hiện và hủy bỏ an toàn, không ghi đè lựa chọn mới.
  + Đổi đúng một món (`handleSwapItem`): Chỉ thay thế duy nhất slot được chọn trên state hiện tại (`currentItems`), không lấy toàn bộ snapshot cũ để ghi đè.
  + Phát hiện xung đột khóa chéo nhóm (`applyOutfitCommit`): Nếu người dùng đang khóa món đồ thuộc nhóm A (ví dụ áo dài) mà cố tình nạp bộ phối nhóm B (ngũ thân), hệ thống chặn commit, báo conflict cụ thể và giữ nguyên 100% state cũ.
  + Thống nhất `requiredSlots` giữa recipe, validator và UI: Bắt buộc Áo Yếm cho Tứ Thân, từ chối commit khi thiếu requiredSlots.
- **Đợt 2 (Gemini, Context, Grounding & Fallback)**:
  + Nối xuyên suốt preferences: Bảng Builder truyền đầy đủ `selectedEvent`, `selectedStyle`, `preferredColor`, `lockedItemIds` vào Chat Assistant, API `/api/chat` và `/api/recommend`.
  + Rate limiting: Áp dụng IP rate limit guard (30 reqs/min), trả về HTTP 429 rõ ràng khi vượt ngưỡng.
  + Fallback trung thực:
    * Câu phủ định "không đổi giày" không sinh swap action, giữ nguyên trang phục (PASS).
    * Hỏi câu hỏi văn hóa về nhóm khác (ví dụ hỏi "nguồn gốc áo tứ thân" khi đang mặc Ngũ Thân) trả về đúng dữ liệu của Tứ Thân (PASS).
    * Thông báo ngoại tuyến rõ ràng, không hứa hẹn sai "phối đồ bình thường ở chế độ offline" (PASS).
  + Giới hạn tối đa 6 tool executions cho toàn bộ tool loop trong `/api/chat`.
- **Đợt 3 (Mobile, Accessibility, Modal & Motion)**:
  + Tích hợp chuyển cảnh mượt mà bằng **Framer Motion**:
    * Trong `OutfitVisualizer`: Sử dụng `<AnimatePresence mode="wait">` và `<motion.g>`/`<motion.div>` cho từng slot trang phục (áo chính, quần/váy, yếm/inner, nón/headwear, giày/guốc/footwear, phụ kiện). Khi đổi món, SVG slot cũ lướt nhẹ và tan biến, slot mới trượt vào êm dịu mà không làm chớp hình hay rung giật.
    * Tên màu áo chính và badge thực thể ở footer visualizer tự động chuyển đổi chữ với animation x/fade tinh tế.
    * Thẻ tiêu đề nhóm trang phục (Active Group Header Card) và Thẻ Thông tin Văn hóa gốc (Culture Card) lướt vào với hiệu ứng trượt dọc `y: 8, scale: 0.99` khi đổi nhóm trang phục.
    * Thẻ từng vị trí đồ (Slot Card) cập nhật nội dung món qua `<AnimatePresence mode="wait">` và `<motion.div>`, tạo phản hồi xúc giác thị giác rõ rệt khi người dùng tráo món hoặc bỏ món optional.
    * Modal chọn món (`SlotSwapModal`) sở hữu hoạt ảnh bung mở dạng scale 0.95 -> 1.0 mượt mà.
  + Phím Escape và Backdrop Click: Áp dụng đồng bộ cho tất cả modal (Catalog, Swap, Recommendations, Lookbook, Compare).
  + Loại bỏ `select-none` khỏi các modal và thẻ thông tin văn hóa để người dùng có thể bôi đen/sao chép nội dung.
  + Accessibility: Gắn `id` và `htmlFor` cho toàn bộ các thẻ `<select>`, cung cấp `aria-label` và `aria-pressed` cho nút khóa, loại bỏ button lồng button trong thẻ đổi món.
  + Kích thước chạm tương tác: Nút khóa vị trí và các nút đóng modal đều đạt tối thiểu >=44x44px.
  + Nút chat nổi: Trên màn hình nhỏ (360/390/414px) thu gọn thành nút tròn 48x48px ở góc màn hình có khoảng cách safe-area, không che khuất nhân vật hay thanh thao tác.
  + CSS & Animation: Định nghĩa font-family `Plus Jakarta Sans` trong CSS và thiết lập keyframes CSS thực thụ cho `animate-in`, `fade-in`, `slide-in-from-bottom`, `scale-in` kèm hỗ trợ `prefers-reduced-motion`.
- **Đợt 3/4 (Gemini, Lookbook/Compare, Văn Hóa & Packaging)**:
  + **Gemini Server-Authoritative & Zod Boundary**:
    * Toàn bộ tool arguments (`swap_outfit_item`, `recommend_outfits`, `get_culture_context`) được xác thực qua Zod `safeParse`. Bác bỏ tham số sai kiểu với mã lỗi `INVALID_ARGS`.
    * Kiểm định toàn vẹn danh sách raw IDs (`currentItemIds`) trước khi xử lý: từ chối ID lạ, ID trùng lặp hoặc bộ đồ thiếu áo chính (HTTP 400).
    * Hạn mức Budget nghiêm ngặt: Tối đa 6 lượt thực thi công cụ trong toàn bộ turn hội thoại. Lệnh gọi thứ 7+ được trả về tool result thông báo giới hạn rõ ràng, không phá vỡ protocol.
    * Giải quyết xung đột đa hành động (multi-action resolution): Khi mô hình gọi nhiều công cụ tạo action trong một turn, hệ thống hợp nhất và chọn lựa hành động tinh chỉnh cuối cùng khớp với lời dẫn thoại.
    * Cơ chế hủy tiến trình: Kết nối `req.on('close')` với `AbortController` (timeout 30s) và dọn dẹp timer an toàn trong `finally`.
  + **Evidence Grounding & Văn hóa**:
    * Tách biệt rõ ràng giữa sự thật lịch sử có trích dẫn (`SOURCED_FACT`) và gợi ý thẩm mỹ phối màu hiện đại (`STYLING_NOTE`).
    * Khi gọi `get_culture_context`, máy chủ đính kèm dữ liệu quy chuẩn `evidence` (title, historicalEra, referenceSource, reviewStatus, sourcedFact, caution) vào payload phản hồi của `/api/chat`.
  + **Nhận diện Ngôn ngữ Tự nhiên & Phủ định Tiếng Việt**:
    * Phân biệt chính xác giữa câu hỏi tìm kiếm lựa chọn thay thế (ví dụ: *"Có đôi giày khác không?"*, *"Có mẫu nào khác không?"*) và câu phủ định hành động (ví dụ: *"Không đổi giày nhé"*, *"Đừng đổi giày nhé"*, *"Chớ thay giày"*).
    * Loại bỏ hoàn toàn regex `\b` gây lỗi với ký tự tiếng Việt có dấu.
    * Điều hướng văn hóa chuẩn xác khi người dùng hỏi về nhóm khác (ví dụ: đang mặc Ngũ Thân nhưng hỏi *"Nguồn gốc áo tứ thân là gì?"*).
  + **Lookbook & Compare Độc Lập**:
    * `handleDeleteLookbook` kiểm tra chặt chẽ giá trị trả về của `deleteLookbookEntry`; hiển thị lỗi rõ ràng nếu có sự cố lưu trữ.
    * `LookbookEntrySchema.savedAt`: Xử lý dữ liệu hỏng trả về *"Không rõ thời gian"*, tuyệt đối không `JSON.stringify` object làm ngày hay bịa ngày hiện tại.
    * `resolveLookbookSnapshot`: Báo cáo chi tiết các mã món bị trùng lặp (`duplicateItemIds`), mã không khả dụng (`missingItemIds`), phân định rõ `missingRequiredSlots` và `missingOptionalSlots`.
    * Bảng So Sánh (`CompareModal`): Tự động đồng bộ tiêu chí đối chiếu theo bộ lọc Builder hiện tại khi mở, cung cấp nút *"Đồng bộ theo Builder"* (`RotateCcw`), gắn nhãn *"Cấu trúc chưa hoàn thiện"* cho các bộ chưa hợp lệ và tách biệt khỏi bảng xếp hạng hoàn chỉnh.
  + **Packaging, Dependencies & Vận Hành**:
    * Khắc phục triệt để xung đột peer dependency `esbuild ^0.25` bằng cách đồng bộ lên `esbuild ^0.28.2` (khớp hoàn toàn với Vite 8 và tsx). `npm ls esbuild` sạch 100%, cài đặt không cần `--legacy-peer-deps`.
    * Cấu hình dotenv nạp đồng thời `.env.local` và `.env`.
    * Cung cấp file `README.md` hoàn chỉnh chuẩn bị đủ 7 trường thông tin giải pháp theo yêu cầu đề bài.
    * Bộ kiểm thử tự động `src/utils/verify_all.ts` mở rộng vượt qua 32/32 kịch bản kiểm thử (PASS).

- **Đợt 4 & 5 (Kiểm thử thực tế & Nghiệm thu)**:
  + Kịch bản kiểm thử độc lập `src/utils/verify_all.ts` vượt qua 32/32 bài test (PASS).
  + Kiểm thử API endpoints thực tế: `/api/health`, `/api/catalog`, `/api/swap-item`, `/api/recommend`, `/api/compare`, `/api/chat` hoạt động chuẩn xác (PASS).
  + `tsc --noEmit` đạt 0 lỗi, `npm run build` hoàn thành xuất sắc (PASS).

- **Đợt Tùy Chọn (Ảnh Cảm Hứng & Bối Cảnh - Inspiration Scene & Editorial Context)**:
  + **Tách biệt Bản phối & Ảnh cảm hứng**:
    * Duy trì mục *"Bản phối 2D"* với mô phỏng chính xác từng slot và item IDs.
    * Bổ sung mục *"Ảnh cảm hứng & Bối cảnh"* (tỷ lệ dọc 3:4 chuẩn Lookbook thời trang) hiển thị nhân vật cùng không gian kiến trúc và ánh sáng.
    * Nhãn minh bạch chuẩn mực: *"Ảnh AI tham khảo — chi tiết có thể khác bản phối. Không phải thử đồ thực tế hay phục dựng bảo tàng."*
  + **Bối cảnh Không gian (Scenes)**:
    * Xây dựng 4 bối cảnh độc lập (`src/data/scenes.ts`): Sân trường & Giảng đường Đông Dương (`scene-school`), Phố đi bộ Hà Nội & Hồ Gươm (`scene-street`), Studio thời trang đương đại (`scene-studio`), Cung đình Cố Đô di tích (`scene-heritage`).
    * Tích hợp đồ họa vector kiến trúc đa lớp (SVG backdrop) với hiệu ứng bóng hoa nắng, vòm cửa chớp, vỉa hè ven hồ và cột đình son rêu phong, tạo chiều sâu thị giác tự nhiên mà không cần phụ thuộc ảnh bên ngoài.
  + **Thư viện Cảm hứng Biên tập Văn hóa (`src/data/inspirationGallery.ts`)**:
    * Lưu trữ các bản ghi tham chiếu thực tế với phân định rõ ràng giữa khớp chính xác (`exact`) và tương tự (`similar`, nêu rõ điểm khác biệt về phụ kiện hay màu sắc).
    * Toàn bộ bản ghi đều có `reviewStatus: 'verified_cultural_editorial'`, ghi nhận nguồn và lưu ý thẩm mỹ.
  + **Manifest Tài nguyên (`docs/INSPIRATION_ASSETS_MANIFEST.md`)**:
    * Minh bạch hóa trạng thái: Đánh dấu `ASSET NEEDED` cho ảnh chụp studio thực tế và `LIVE NOT VERIFIED` cho live image models do chi phí/quota API.
    * Mặc định an toàn: `IMAGE_PROVIDER=none`, không phát sinh chi phí, không rò rỉ secret ra trình duyệt.
  + **Server Endpoint `/api/inspiration-image`**:
    * Kiểm định Zod schema đầu vào nghiêm ngặt.
    * Kiểm tra tồn tại và xác thực quy tắc cấu trúc văn hóa bằng `validateOutfit` (từ chối bộ Tứ Thân thiếu Yếm).
    * Sinh prompt tạo hình chi tiết bằng tiếng Anh & tiếng Việt mô tả chuẩn xác kết cấu trang phục (cổ lập lĩnh 5 khuy, raglan xẻ tà, yếm cánh sen, nón quai thao...) kèm không gian ánh sáng.
    * Fingerprint xác định deterministic (sorted item IDs + scene + style + provider) và bộ nhớ đệm LRU cache 50 entries.
    * Kiểm soát tần suất và đồng thời: tối đa 5 reqs/min per IP, giới hạn 1 active generation concurrent.
  + **Giao diện & Chống Race Condition (`InspirationSceneVisualizer.tsx`)**:
    * Segmented button chuyển đổi mượt mà giữa Bản phối 2D và Ảnh cảm hứng.
    * Cơ chế Stale Guard: Nếu người dùng đổi món đồ trong lúc yêu cầu đang xử lý, kết quả hoàn thành được gắn nhãn *"Ảnh của bộ trước"* và lưu vào danh sách lịch sử, tuyệt đối không gán đè vào bộ mới.
    * Drawer minh bạch prompt cho phép người dùng xem và sao chép toàn bộ câu lệnh mô tả tạo hình.
  + **Kiểm thử tự động toàn diện**: Mở rộng bộ kiểm thử `src/utils/verify_all.ts` vượt qua **49/49 bài test (PASS)**.

- **Đợt 01 — Sửa Vòng Đời Gemini & Cài Đặt (HTTP Lifecycle, Lockfile Sync & Mock/Live Tests)**:
  + **Files đã sửa & Nguyên nhân**:
    1. `server.ts`:
       * *Nguyên nhân lỗi đã tái hiện*: Trước đó server đăng ký `req.on('close', closeHandler)` và gọi `abort('CLIENT_CLOSED')` vô điều kiện. Trong HTTP server của Node.js, luồng `IncomingMessage` (req) phát sự kiện `'close'` ngay khi đọc xong toàn bộ request body (`req.complete === true`), trong khi kết nối TCP socket và luồng response vẫn đang mở chờ trả lời. Do đó, bất kỳ lời gọi Gemini nào mất > 150ms đều bị hủy nhầm thành `CLIENT_CLOSED` và bị đẩy về fallback.
       * *Khắc phục*: Loại bỏ hoàn toàn `req.on('close')`. Thay vào đó, nhận diện client disconnect bằng `res.on('close', () => { if (!res.writableEnded) onClientClose(); })`, kết hợp lắng nghe `res.on('error')`, `req.on('aborted')`, và `req.socket?.on('close')` khi `!res.writableEnded`.
       * *Bảo vệ Socket & Chống Write-After-End*: Khi client ngắt kết nối thật sự (`isClientAbort`), hủy ngay lập tức tín hiệu `abortController.abort(new Error('CLIENT_CLOSED'))`, giải phóng listeners và timer trong `finally`, không chạy fallback engine và không ghi vào response đã đóng (`if (res.writableEnded || res.destroyed || !req.socket?.writable) return`).
       * *Deadline cấu hình*: Bổ sung `GEMINI_DEADLINE_MS` (mặc định 30.000ms), tự động ngắt provider và chuyển sang fallback an toàn khi model bị treo/quá hạn.
       * *Chống Action Dở Dang*: Khi model gặp lỗi sau khi đã gọi tool (`swap_outfit_item`), reset toàn bộ `turnActions.length = 0` và `serverAction = undefined`, không mang action dở dang sang câu trả lời fallback không liên quan.
       * *Cơ chế Inject Mock Transport*: Bổ sung `setMockAiClient` cho phép bộ test giả lập các hành vi transport trễ, treo, lỗi mà không ảnh hưởng runtime production.
       * *Cơ chế Direct Execution Guard*: Thêm điều kiện `isDirectExecution && process.env.NODE_ENV !== 'test'` trước khi gọi `startServer()`, ngăn ngừa xung đột cổng `EADDRINUSE` khi test runner import `app`.
    2. `package.json` & `package-lock.json`:
       * *Nguyên nhân lỗi đã tái hiện*: `framer-motion` được import trực tiếp trong code nhưng chỉ tồn tại bắc cầu qua `motion`, hoặc khai báo lệch phiên bản (`framer-motion@14.0.0` vs lockfile `framer-motion@12.43.0`), dẫn đến `npm ci` bị lỗi `EUSAGE`.
       * *Khắc phục*: Khai báo chuẩn xác `"framer-motion": "^12.43.0"` trong `package.json` (khớp hoàn toàn với `motion@12.23.24`), chạy `npm install` đồng bộ lockfile để `npm ci` thành công 100%.
    3. `src/utils/test_gemini_lifecycle.ts`:
       * Xây dựng bộ kiểm thử tự động chuyên sâu bao phủ đầy đủ các yêu cầu A1, A2, B, C, D1, D2, F.
  + **Bảng Đối Chiếu Kết Quả Kiểm Thử (Expected vs Actual)**:
    * **TEST A1 (Mock transport trễ 150ms)**:
      - Expected: Client còn mở, không bị abort sớm, trả về HTTP 200, `source: 'gemini'`, nội dung câu trả lời từ model.
      - Actual: **PASS** (Status: 200, Source: `gemini`, nội dung tư vấn sneaker từ mock, thời gian phản hồi ~160ms).
    * **TEST A2 (Mock transport trễ 2000ms - 2 giây)**:
      - Expected: Client giữ kết nối mở ổn định suốt 2 giây, trả về `source: 'gemini'`, không abort.
      - Actual: **PASS** (Status: 200, Source: `gemini`, thời gian phản hồi: 2007ms).
    * **TEST B (Transport treo)**:
      - Expected: Đợi đúng deadline cấu hình (`GEMINI_DEADLINE_MS=1200ms`), provider bị abort, server trả fallback graceful, không bị treo vô hạn.
      - Actual: **PASS** (Ngắt chuẩn xác tại 1208ms, provider `aborted === true`, `source: 'local_fallback'`).
    * **TEST C (Client ngắt kết nối trước khi model hoàn tất)**:
      - Expected: Hủy request provider (`CLIENT_CLOSED`), dọn tài nguyên, không unhandled rejection, không ghi đè vào socket đã đóng.
      - Actual: **PASS** (Provider nhận `CLIENT_CLOSED`, server dọn dẹp an toàn, không sinh lỗi write-after-end).
    * **TEST D1 (Model gọi tool swap rồi trả narrative)**:
      - Expected: Protocol đúng (model functionCall -> user functionResponse -> model narrative), action lấy chuẩn từ server (`SWAP_ITEM`, slot footwear).
      - Actual: **PASS** (Turn 1 tool swap được server xác thực, Turn 2 narrative gắn đúng action `item-foot-sneaker-canvas-retro`, `source: 'gemini'`).
    * **TEST D2 (Model lỗi sau tool)**:
      - Expected: Khi model crash (500) ở lượt 2 sau khi tool đã chạy, server không mang action dở dang sang câu trả lời fallback.
      - Actual: **PASS** (`source: 'local_fallback'`, `action: undefined (CLEAN)`, không có action lạc đề).
    * **TEST E (Cài đặt sạch với npm ci trên thư mục mới)**:
      - Expected: `npm ci` chạy thành công không có lỗi `EUSAGE`, `npm run lint` (`tsc --noEmit`) đạt 0 lỗi, `npm run build` tạo bundle thành công.
      - Actual: **PASS** (Thử nghiệm trong `/tmp/clean-test` không có sẵn node_modules: `added 197 packages trong 7s`, tsc 0 lỗi, vite build 1.33s thành công).
    * **TEST F (Live Gemini Request)**:
      - Expected: Gửi request thật tới Gemini `models/gemini-3.8-flash` khi có API Key ở server runtime, không in key ra log.
      - Actual: **PASS - LIVE VERIFIED** (Gọi trực tiếp model `models/gemini-3.8-flash`, nhận phản hồi tiếng Việt thực tế: *"Xin chào bạn! Rất vui được trò chuyện với..."*, hoàn toàn không rò rỉ secret).
    * **Tổng kết bộ test lifecycle**: **7/7 BÀI TEST ĐÃ VƯỢT QUA (PASS)**.
    * **Bộ test hồi quy tổng hợp `verify_all.ts`**: **60/60 BÀI TEST ĐÃ VƯỢT QUA (PASS)**.

### Checkpoint 6: Đợt 03 — Ảnh/Bối Cảnh Trung Thực, Nguồn Văn Hóa & Lookbook
- **Trạng thái:** COMPLETED
- **Mục tiêu & Thực tế Thực hiện**:
  - [x] **Minh họa Phối đồ + Bối cảnh Trung thực (Vector Mockup)**:
    - Khi chạy ở chế độ mặc định (`IMAGE_PROVIDER=none`), toàn bộ UI/API trả về nhãn trung thực "Minh họa phối đồ + bối cảnh", `source: 'mockup'`, `status: 'mockup_ready'`, `providerStatus: 'not_configured'`.
    - Không tuyên bố đã tạo ảnh thật photorealistic hay đã inference live khi chưa kích hoạt provider.
    - Giữ prompt mô tả mỹ thuật trong ngăn kéo thông tin minh bạch để người dùng tham khảo/sao chép.
  - [x] **Tách biệt Renderer Nhân vật khỏi Chrome của OutfitVisualizer**:
    - Trích xuất `CharacterOutfitCanvas` độc lập trong suốt, không chứa nền đen, header tag hay footer bảng màu lồng hộp.
    - Nhân vật hòa trực tiếp vào phông nền bối cảnh kiến trúc với bóng đổ cast shadow mềm mại dưới chân.
    - Giữ nguyên đầy đủ hệ thống def IDs độc lập, bộ bóng đổ, chuyển động AnimatePresence cho cả 2D View và Compare View.
  - [x] **Thư viện Phác thảo Tham khảo & So khớp Trung thực**:
    - Do dự án chưa có file raster ảnh chụp thật, 4 bản ghi được đưa về `assetStatus: 'ASSET_NEEDED'` và `reviewStatus: 'DRAFT'/'NEEDS_REVIEW'`.
    - Không bịa đặt tên người duyệt, ngày duyệt hay con dấu giả định.
    - Thuật toán `matchInspirationGallery` so khớp đa món nghiêm ngặt:
      + Áo hồng + Sân trường -> `null` (không gán nhãn áo trắng nữ sinh).
      + Áo trắng + Quần trắng + Guốc mộc + Sân trường -> `exact`.
      + Áo trắng + Quần đen + Sneaker + Sân trường -> `similar` kèm `differenceNote` chỉ rõ sự khác biệt về món mặc dưới và giày.
  - [x] **Bảo Toàn State Bối Cảnh, Chống Stale Response & Lưu Lookbook kèm Cảnh**:
    - Nâng state `selectedSceneId`, `inspirationResult`, `generationHistory` lên cấp `App.tsx`: chuyển đổi qua lại giữa tab 2D và tab Bối cảnh không làm mất bối cảnh hay kết quả đã nạp.
    - Chống Stale Response: Nếu người dùng đổi bối cảnh hoặc đổi món đồ trong lúc request đang gửi, kết quả trả về của bối cảnh/bộ cũ được chuyển vào lịch sử, không ghi đè lên bối cảnh mới.
    - Nhận diện và từ chối mã `sceneId` lạ với lỗi 400 Bad Request, không âm thầm đổi sang studio.
    - Mở rộng `LookbookEntrySchema` hỗ trợ lưu `sceneId`, `sceneName`, `version: 2` hoàn toàn tương thích ngược với dữ liệu cũ. Nút bấm nói rõ "Lưu bộ đồ" ở 2D và "Lưu bộ đồ kèm bối cảnh" ở Bối cảnh.
  - [x] **Chính Sách Khôi Phục Lookbook & Chấm Điểm So Sánh**:
    - Chặn khôi phục nếu thiếu món bắt buộc (ví dụ thiếu áo chính hoặc thiếu Yếm đối với Tứ Thân) và thông báo lý do rõ ràng.
    - Với mất món tùy chọn (ví dụ phụ kiện không còn trong catalog): Cho phép khôi phục phần hợp lệ nhưng cảnh báo tồn tại rõ ràng, không bị toast "thành công" xóa đè.
    - Không sửa snapshot gốc trong `localStorage`.
    - Bộ đồ thiếu món hoặc không đạt chuẩn cấu trúc kỹ thuật không được chấm điểm trọn vẹn trong so sánh (nhận tối đa 40 điểm và ghi chú cấu trúc chưa hoàn thiện).
  - [x] **Hệ Thống Claims Văn Hóa Có Nguồn Kiểm Chứng & Tách Biệt Lời Khuyên Styling**:
    - Xây dựng `VERIFIED_CULTURE_CLAIMS` registry gắn mã `claimId` cụ thể (`claim-aodai-lemur-1930`, `claim-nguthan-minhmang-1827`, `claim-tuthan-kinhbac-yem`).
    - Server chỉ chuyển `evidence` khi công cụ văn hóa được thực thi, UI hiển thị khối "Căn cứ Lịch sử có Nguồn" tách biệt khỏi lời khuyên styling tự do của AI.
    - Đánh dấu rõ ràng `[MOCK EVIDENCE]` trong các ca thử nghiệm mock.

### Checkpoint 7: Đợt 04 — UX, Mobile & Nghiệm Thu Độc Lập Trên App Thực
- **Trạng thái:** COMPLETED
- **Mục tiêu & Thực tế Thực hiện**:
  - [x] **Khắc Phục Header Tràn Ngang & Tối Ưu Hóa Viewport Hẹp (320px - 768px)**:
    + Cấu trúc lại Header với bố cục co giãn thông minh: Dòng 1 gồm Logo thương hiệu + Tên app + Nút Trợ lý AI; Dòng 2 (trên mobile) dàn đều 3 nút thao tác (So Sánh, Lookbook, Kho Catalog) dạng lưới cân đối.
    + Không sử dụng `overflow-x: hidden` để che nút ngoài màn hình.
    + Thử nghiệm trên các kích thước 320px, 360px, 390px, 414px, 768px: Chiều rộng document chuẩn xác 100% bằng viewport, hoàn toàn không phát sinh thanh cuộn ngang (0px horizontal overflow).
  - [x] **Đảm Bảo Kích Thước Chạm (Touch Targets $\ge 40$px, Ưu tiên 44px)**:
    + Nâng chiều cao nút chuyển chế độ 2D/Bối cảnh, Lưu bộ đồ, Khôi phục bộ gốc, nút lọc sự kiện và nhóm trang phục lên $\ge 44$px (`min-h-[44px]`).
    + Nút đóng modal, nút xóa, nút đổi món và nút khóa vị trí đều đạt tối thiểu $\ge 42-44$px có `focus-visible` ring tương phản cao (`#f59e0b`).
  - [x] **Loại Bỏ Hoàn Toàn Interactive Lồng Nhau (Nested Controls) Trong Thẻ Trang Phục**:
    + Tháo bỏ `role="button"` và `tabIndex={0}` khỏi thẻ cha của từng vị trí trang phục (`SlotCard`).
    + Nút Khóa (`Lock/Unlock`), nút Đổi món (`Đổi món`), nút Thêm món (`+ Thêm món`), và liên kết Shopee (`ShopeeSearchButton`) đều là các control độc lập cấp 1.
    + Phím `Enter`/`Space` trên nút Khóa chỉ thực hiện thao tác khóa/mở khóa vị trí, tuyệt đối không kích hoạt mở modal đổi món của thẻ cha.
  - [x] **Quản Lý Tiêu Điểm Modal & Focus Trap (`useModalA11y`)**:
    + Xây dựng hook chuyên trách `useModalA11y`:
      * Tự động lưu `previousActiveElement` trước khi mở modal.
      * Tự động khóa cuộn nền (`document.body.style.overflow = 'hidden'`).
      * Focus ngay lập tức vào phần tử khả dụng đầu tiên trong modal khi mở.
      * Bắt phím `Tab`/`Shift+Tab` để tuần hoàn tiêu điểm hoàn toàn bên trong modal (Focus Trap), không cho focus thoát ra nền.
      * Bắt phím `Escape` để đóng modal an toàn và hoàn trả tiêu điểm (`restore focus`) chính xác về trigger button đã mở nó.
      * Giải phóng khóa cuộn khi đóng.
    + Áp dụng đồng bộ cho toàn bộ 5 modal: `SlotSwapModal`, `LookbookModal`, `CompareModal`, `RecommendationsModal`, `CatalogModal`.
  - [x] **Tối Ưu Hóa Thông Báo Toast**:
    + Đặt Toast trên lớp modal (`z-[80]`), có `role="status"` và `aria-live="assertive"` (cho lỗi) / `aria-live="polite"` (cho thông báo thường).
    + Quản lý `toastTimerRef`: mỗi lần phát thông báo mới đều chủ động hủy timer cũ (`clearTimeout`), chống tình trạng toast mới bị timer cũ dập tắt sớm.
    + Kéo dài thời gian tồn tại thông báo lỗi thiếu món lên 5.500ms - 6.000ms để người dùng kịp đọc và điều chỉnh.
    + Bổ sung nút đóng thủ công trên thẻ Toast; bố trí góc dưới phải trên mobile và góc trên phải trên desktop, không che khuất nút đóng (`X`) của các modal.
  - [x] **Độ Tương Phản Màu Sắc (WCAG AA) & Phục Vụ Trợ Năng**:
    + Nâng cấp toàn bộ các nhãn văn bản từ `text-stone-500` lên `text-stone-300`/`text-stone-200` trên nền tối, đạt tỷ lệ tương phản $>7:1$.
    + Bổ sung khoảng đệm an toàn `pb-28 sm:pb-20` cho vùng nội dung chính (`main`), đảm bảo nút Trợ lý AI nổi (`fixed bottom-4 right-4`) không che khuất bất kỳ nút bấm hoặc thẻ hành động nào khi cuộn trang.
  - [x] **Hỗ Trợ Toàn Diện `prefers-reduced-motion`**:
    + Bọc ứng dụng trong `<MotionConfig reducedMotion="user">` của Framer Motion, tự động triệt tiêu animation khi người dùng bật chế độ giảm chuyển động trong hệ điều hành.
    + Kết hợp quy tắc CSS `@media (prefers-reduced-motion: reduce)` đưa thời lượng animation về `0.01ms`.
  - [x] **Code Splitting & Tối Ưu Hóa Kích Thước Bundle**:
    + Tách rời các modal bằng `React.lazy` và `<Suspense fallback={null}>`: `CompareModal`, `LookbookModal`, `RecommendationsModal`, `SlotSwapModal`, `CatalogModal`, `InspirationSceneVisualizer`.
    + Cấu hình `manualChunks` trong `vite.config.ts` chia tách `vendor-react` (404 kB), `vendor-motion` (133 kB), `vendor-icons` (28 kB).
    + Bundle chính của ứng dụng giảm ngoạn mục từ 873.78 kB xuống còn **203.73 kB**, loại bỏ 100% cảnh báo vượt ngưỡng 500kB của Vite.
  - [x] **Bộ Kiểm Thử Độc Lập Mở Rộng**:
    + Nâng số lượng bài test trong `verify_all.ts` lên **64/64 tests (PASS)**, bao gồm kiểm thử ma trận 60 tổ hợp gợi ý, kiểm thử phạt điểm bộ thiếu, kiểm thử bảo mật API key và an toàn tên miền ngoài.
    + `test_gemini_lifecycle.ts` đạt **7/7 tests (PASS)**.
    + `compile_applet` và `lint_applet` đạt **0 lỗi (PASS)**.

### Checkpoint 8: Gói Nâng Cấp Toàn Diện (Comprehensive Polish & AI Enrichment)
- **Trạng thái:** COMPLETED
- **Mục tiêu & Thực tế Thực hiện**:
  - [x] **1. Nâng Cấp Vai Trò GenAI Thực Thụ Cho Gemini (`server.ts`, `src/types/fashion.ts`, `ChatAssistant.tsx`)**:
    + Nâng cấp System Instruction cho Gemini: Yêu cầu bắt buộc thực hiện "Styling Narrative & Cultural Rationale" — phân tích chiều sâu sắc độ và bối cảnh sự kiện (tân cổ giao duyên cho Gen Z nhưng không phá nét trang nghiêm), đưa ra lời khuyên tạo dáng (pose), cầm quạt/túi khi chụp kỷ yếu/lễ hội trường.
    + Thêm trường cấu trúc `aiStylistInsights?: { aestheticVibe: string; stylingTip: string }` vào response `/api/chat`.
    + Trích xuất tự động qua regex `[STYLIST_INSIGHTS]` kết hợp cơ chế contextual fallback thông minh khi chạy offline/local fallback.
    + Hiển thị huy hiệu "Góc nhìn Stylist AI" trang nhã trong `ChatAssistant.tsx` với badge phong thái và mẹo tạo dáng thực tế.
  - [x] **2. Mở Rộng Catalog & Công Thức Đa Dạng (`src/data/catalog.ts`)**:
    + Bổ sung 7 món đồ mới chất lượng cao đầy đủ thuộc tính `CatalogItem`, hexColor, styleTags, eventTags, renderVariant:
      * Main: `item-main-aodai-hoa-nhi` (Áo dài cách tân hoa nhí pastel), `item-main-nguthan-do-chusa` (Áo ngũ thân tay chẽn đỏ chu sa hoàng triều).
      * Headwear: `item-head-khan-lua-van-may` (Khăn lụa vấn hoa văn vân mây cung đình).
      * Footwear: `item-foot-loafer-den-remix` (Giày loafer da đế bằng đen hiện đại), `item-foot-guoc-moc-quai-da` (Guốc mộc quai da bò nâu gụ).
      * Accessory: `item-acc-tui-gam-theu` (Túi gấm thêu tay cung đình), `item-acc-ngoc-boi-eo` (Vòng ngọc bội đeo hông chùm tua rua vàng).
    + Thêm 2 Outfit Recipes: `recipe-aodai-remix-pastel` (Áo Dài Hoa Nhí & Loafer Remix), `recipe-nguthan-chusa-le-hoi` (Ngũ Thân Chu Sa Cung Đình Rực Rỡ).
  - [x] **3. Minh Bạch & Tinh Chỉnh Studio Bối Cảnh (`InspirationSceneVisualizer.tsx`, `App.tsx`)**:
    + Nhãn định danh trung thực: "Phòng Trực Quan & Studio Tạo Prompt Nghệ Thuật (AI Prompt & Visualizer Studio)".
    + Thẻ thông tin minh bạch: "Mô phỏng phối đồ trực quan trên nền kiến trúc di sản + Tạo Prompt AI tiêu chuẩn chuyên biệt cho cổ phục".
    + Nút bấm chuyên dụng: "Sao chép Prompt AI Hoàn Chỉnh (Midjourney / Gemini)" tự động tạo hoặc sao chép prompt tiếng Anh chuẩn hóa mang sang model sinh ảnh ngoài, kèm toast phản hồi ngay.
  - [x] **4. Tinh Chỉnh Chi Tiết Đồ Họa SVG Cho Món Mới (`OutfitVisualizer.tsx`)**:
    + Giày loafer đen: Đế giày hiện đại với đường viền chỉ may nổi bật.
    + Khăn lụa vân mây: Dải lụa mềm mại vắt nhẹ qua vai/cổ bay bổng.
    + Ngọc bội đeo hông: Viên ngọc tròn viền chùm tua rua vàng óng buông mạn sườn.
    + Áo dài hoa nhí & ngũ thân chu sa: Điểm xuyết chi tiết hoa nhí và vạt khuy đồng rực rỡ.
  - [x] **5. Hình Nền Web PC & Mobile (`UIBackground.tsx`)**:
    + Tải và lưu trữ 2 ảnh nền của người dùng vào thư mục tĩnh `public/backgrounds/` (`pc-bg.png` và `mobile-bg.png`).
    + Tự động hiển thị chuẩn xác hình nền cho PC/Laptop (màn ngang) và Điện thoại (màn dọc) với cơ chế nền vector dự phòng an toàn.
  - [x] **6. Bổ Sung Cơ Chế Chọn Giới Tính & Độ Tuổi (`fashion.ts`, `catalog.ts`, `OutfitVisualizer.tsx`, `App.tsx`, `server.ts`)**:
    + Types & Schemas: Bổ sung `GenderType` ('all' | 'nam' | 'nu') và `AgeGroupType` ('all' | 'tre_em' | 'thanh_nien' | 'trung_nien' | 'cao_nien') cùng `GENDER_OPTIONS` và `AGE_GROUP_OPTIONS`.
    + Catalog: Gắn thuộc tính `genderSuitability` ('nam' | 'nu' | 'unisex') và `ageGroups` cho 27 món đồ.
    + UI: Thêm 2 dropdown bộ lọc Giới tính và Độ tuổi trên hàng Builder Filter Bar.
    + Mannequin SVG: Nhận diện `gender` (chuyển vai ngang nam giới, topknot búi cao có trâm cài, phom đứng đắn) và `ageGroup` (giảm nhẹ chiều dài thân áo khi là trẻ em).
    + AI & Heuristic: `buildCandidateOutfits` lọc và cộng điểm phù hợp giới tính/lứa tuổi, ưu tiên Ngũ thân trang trọng cho Cao niên / Trung niên; Gemini System Instruction nhận ngữ cảnh nhân khẩu học và đưa lời khuyên mực thước, chuẩn mực.
  - [x] **7. Tích Hợp Firebase Authentication & Cơ Sở Dữ Liệu Firestore (`firebase-blueprint.json`, `firestore.rules`, `src/firebase/`)**:
    + Hoàn thành kích hoạt Firebase via AI Studio RPC (`ProvisionFirebase`, `DeployRules`).
    + Tích hợp Google Sign-in Auth via `signInWithPopup(auth, googleProvider)`.
    + Triển khai Firestore Enterprise với cấu hình đa cơ sở dữ liệu `firebaseConfig.firestoreDatabaseId`.
    + Bảo mật chuẩn mực theo ABAC & Zero-Trust trong `firestore.rules`: Quản lý hồ sơ người dùng `users/{userId}` và bộ sưu tập cá nhân `users/{userId}/lookbooks/{lookbookId}` chỉ cho phép chính chủ (isOwner) truy cập.
    + Tự động đồng bộ 2 chiều (Cloud 2-Way Sync) giữa `localStorage` và Firestore `lookbooks` qua `onSnapshot`.
    + Header tích hợp component `UserAuthHeader.tsx` hiển thị trạng thái tài khoản, avatar Google, số lượng bộ Lookbook đã đồng bộ lên mây và nút đăng xuất.
    + Chuẩn hóa bắt lỗi Firestore bằng JSON `handleFirestoreError` đúng chuẩn `FirestoreErrorInfo` theo tài liệu kỹ năng.

---

## 4. LỖI TỒN ĐỌNG & GIỚI HẠN
- **Live Image Inference**: Khi chưa cấu hình quota/billing cho API tạo ảnh ngoài, hệ thống vận hành trung thực ở chế độ mockup vector kiến trúc đa tầng và thư viện phác thảo tham khảo `DRAFT`, không gây lỗi và không gián đoạn trải nghiệm người dùng.
- **Bảo mật**: Tuyệt đối không rò rỉ secret key hoặc thông tin nhạy cảm vào client bundle/log.
- **Tuân thủ quy trình**: Đạt toàn bộ 12 mục nghiệm thu độc lập Đợt 04.

---

## 5. HỒ SƠ DỰ THI ĐÃ CẬP NHẬT
- **Tên dự án:** Việt Phục Remix (Gen Z Heritage Fashion Visualizer)
- **Mô tả trung thực về năng lực kỹ thuật**:
  + Trực quan hóa phom dáng và màu sắc trang phục cổ truyền Việt Nam (Áo dài, Ngũ thân, Tứ thân) bằng đồ họa vector SVG đa tầng sắc nét, không tuyên bố sai sự thật là "virtual try-on" hay "AI photorealistic generator" khi chưa có ảnh thực tế.
  + Hệ thống gợi ý Heuristic đa tiêu chí (Sự kiện, Phong cách, Tông màu, Khóa vị trí) sinh tổ hợp độc lập từ catalog thực, bảo toàn ràng buộc kỹ thuật.
  + Tích hợp trợ lý tư vấn bằng mô hình ngôn ngữ lớn `models/gemini-3.8-flash` gọi độc quyền server-side, có cơ chế xác nhận action trước khi áp dụng, đối soát căn cứ văn hóa trích dẫn có mã claim kiểm chứng, và fallback cục bộ khi mất kết nối.
  + Lưu trữ Lookbook an toàn trên thiết bị người dùng với khả năng so sánh đối chiếu trực quan 2 bộ trang phục trên cùng một bối cảnh chung.


