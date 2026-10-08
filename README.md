# Việt Phục Remix

> Nền tảng phối đồ Việt phục đương đại kết hợp Trợ lý Trí tuệ Nhân tạo Gemini Server-Authoritative

---

## 1. HỒ SƠ GIẢI PHÁP (7 TIÊU CHÍ BẮT BUỘC)

### 1. Tên giải pháp
**Việt Phục Remix** — Nền tảng thử đồ trực quan 2D và tư vấn phong cách cổ phục Việt Nam kết hợp thời trang đương đại.

### 2. Nhu cầu thực tế
Học sinh, sinh viên và giới trẻ hiện đại mong muốn diện trang phục truyền thống Việt Nam (Áo Dài, Áo Ngũ Thân tay chẽn, Áo Tứ Thân Kinh Bắc) trong các sự kiện kỷ yếu học đường, lễ hội văn hóa trường học, dạo phố hoặc chụp ảnh nghệ thuật. Tuy nhiên, họ thường gặp các rào cản:
- Băn khoăn về cấu trúc căn bản của từng loại áo (ví dụ: áo Tứ Thân bắt buộc phải có áo Yếm bên trong, áo Ngũ Thân cần cài đủ 5 khuy sang mạn sườn phải).
- Thiếu kiến thức để kết hợp phụ kiện hoặc phối màu sao cho vừa trẻ trung, phá cách (Remix) vừa giữ được sự thanh nhã, tôn nghiêm.
- Ngại tìm kiếm rời rạc trên mạng do thông tin lịch sử chưa được đối chiếu hoặc bị nhiễu loạn giữa phim ảnh nước ngoài và cổ phục Việt.

### 3. Tóm tắt giải pháp
Ứng dụng tương tác trực quan thời gian thực hỗ trợ:
- Thử đồ 2D dạng lớp SVG với chuyển cảnh êm ái bằng Framer Motion cho từng vị trí trang phục (Áo chính, Quần/Váy, Áo yếm, Nón/Khăn, Giày/Guốc, Phụ kiện).
- Lõi kiểm định Server Authority xác thực 100% tính tương thích của từng món đồ, ngăn chặn việc thiếu món bắt buộc hoặc xung đột khóa chéo giữa các nhóm áo.
- Thuật toán Heuristic Recommendation gợi ý đa dạng các phương án phối màu và phong cách theo 4 bối cảnh sự kiện thực tế.
- Trợ lý AI Gemini (chạy độc quyền phía Server) hiểu tiếng Việt tự nhiên, giải thích ý nghĩa di sản và đề xuất đổi món qua công cụ Authoritative Tools.
- Tính năng Lookbook cá nhân và So Sánh (Compare) 2 bộ trang phục cạnh nhau dưới cùng một hệ quy chiếu khách quan.

### 4. Tác động kỳ vọng
- Giúp người trẻ tiếp cận và trân trọng di sản văn hóa may mặc dân tộc một cách gần gũi, sinh động và chính xác.
- Tạo nguồn cảm hứng sáng tạo cho phong cách thời trang đương đại (Remix với sneaker, túi cói, bảng màu pastel) trên nền tảng hiểu biết và tôn trọng cốt lõi truyền thống.
- Đóng vai trò như một cẩm nang số tin cậy cho học sinh, sinh viên trước mùa chụp kỷ yếu và ngày hội thanh niên.

### 5. Kiến trúc kỹ thuật
- **Frontend**: React 19 SPA, Vite 8, Tailwind CSS, Framer Motion (quản lý hiệu ứng chuyển động SVG theo từng slot), Lucide Icons, thiết kế Responsive thân thiện với màn hình di động (hỗ trợ màn hình 360px - 414px và safe-area).
- **Backend**: Node.js Express tích hợp Vite middleware trong môi trường phát triển, API RESTful chuẩn hóa (`/api/catalog`, `/api/swap-item`, `/api/recommend`, `/api/compare`, `/api/chat`, `/api/culture`).
- **Xác thực & Toàn vẹn dữ liệu**:
  - Zod schema runtime validation tại mọi ranh giới API request và tool arguments.
  - Request Generation Sequencing (`requestSeqRef`) và Fingerprint hashing ngăn ngừa hoàn toàn lỗi tráo đổi bất đồng bộ do độ trễ mạng.
  - LocalStorage quản lý Lookbook có cơ chế chống tràn dung lượng (QuotaExceededError) và kiểm định snapshot độc lập không tự ý gán món đồ giả định.
- **Dependency Graph**: Đã giải quyết triệt để xung đột peer dependency giữa `esbuild ^0.28.2` và `vite ^8.3.0`, cài đặt sạch không cần `--legacy-peer-deps`.

### 6. Cách ứng dụng Gemini
- Tích hợp qua SDK chính thức `@google/genai` với model `models/gemini-3.8-flash`.
- **Toàn quyền xử lý Server-side**: Khóa bí mật API Key lưu trữ tại biến môi trường server runtime, tuyệt đối không gửi về phía client hay nhúng vào bundle trình duyệt.
- **Dual-layer Function Calling**:
  - Gemini đóng vai trò phân tích ngữ cảnh hội thoại tiếng Việt, hiểu ý định người dùng (kể cả câu hỏi tìm lựa chọn thay thế hoặc câu hỏi văn hóa).
  - Khi cần thao tác đổi đồ hoặc lấy dữ liệu lịch sử, Gemini gọi các công cụ kiểm soát của máy chủ (`swap_outfit_item`, `recommend_outfits`, `get_culture_context`).
  - Toàn bộ quyền quyết định ID sản phẩm, tính hợp lệ của bộ đồ và trạng thái khóa thuộc về Server Authority.
- **Kiểm soát vòng lặp & Ngưỡng an toàn**: Giới hạn tối đa 6 lượt thực thi công cụ cho một yêu cầu (Budget limit <=6 executions), thiết lập timeout 30 giây kèm AbortController, tự động kích hoạt Local Fallback Engine khi mất kết nối.

### 7. Thiết kế Prompting & Grounding
- **Evidence-Based Grounding**: Hệ thống cung cấp System Instruction có cấu trúc nghiêm ngặt chứa ngữ cảnh Server-authoritative (Nhóm trang phục hiện tại, Sự kiện, Phong cách, Tông màu, Trạng thái các vị trí bị khóa cố định).
- **Phân định rạch ròi 3 tầng thông tin**:
  - `SOURCED_FACT`: Dữ liệu lịch sử đã được đối chiếu từ tài liệu khảo cứu (*Ngàn năm áo mũ*, *Khâm định Đại Nam hội điển sự lệ*, *Trang phục Việt Nam*).
  - `STYLING_NOTE`: Gợi ý phối đồ mang tính thẩm mỹ đương đại.
  - `CAUTION`: Cảnh báo về bối cảnh văn hóa trang nghiêm để tránh gây phản cảm.
- **Ràng buộc đạo đức & Trung thực**: Nghiêm cấm mô hình AI tự bịa đặt mã SKU, liên kết ngoài hoặc tự ý công nhận một bộ đồ cách tân là "chuẩn xác lịch sử tuyệt đối".

---

## 2. HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH

### Yêu cầu môi trường
- Node.js >= 18.0.0
- npm >= 9.0.0

### Thiết lập biến môi trường
Tạo file `.env.local` hoặc `.env` tại thư mục gốc:
```env
# API Key của Google Gemini (chỉ đọc tại server runtime)
GEMINI_API_KEY="your-gemini-api-key"

# Tên mô hình được chỉ định (mặc định models/gemini-3.8-flash)
GEMINI_MODEL="models/gemini-3.8-flash"

# Cổng khởi chạy ứng dụng (mặc định 3000)
PORT=3000
```

### Lệnh chạy môi trường phát triển (Development)
```bash
npm install
npm run dev
```
Hệ thống sẽ khởi động Express server tích hợp Vite middlewares tại `http://localhost:3000`.

### Lệnh kiểm tra kiểu & Kiểm thử logic (Verification & Lint)
```bash
# Kiểm tra TypeScript type safety
npm run lint

# Chạy toàn bộ 21 kịch bản kiểm thử độc lập
npx tsx src/utils/verify_all.ts
```

### Lệnh đóng gói & Chạy môi trường sản xuất (Production Full-Stack)
```bash
# Đóng gói giao diện client vào thư mục dist/
npm run build

# Khởi chạy Express server phục vụ API và Static bundle
npm start
```
*Lưu ý: Không dùng `vite preview` làm môi trường sản xuất vì `vite preview` chỉ phục vụ static files và thiếu các API endpoints của backend Express.*

---

## 3. BẢO MẬT & VẬN HÀNH AN TOÀN
1. **Rate Limiting**: Bộ điều phối IP trong bộ nhớ giới hạn tối đa 30 yêu cầu chat mỗi phút cho mỗi IP, tự động dọn dẹp bộ nhớ mỗi 5 phút.
2. **Kích thước Payload**: Express Body-parser giới hạn tải trọng JSON ở mức tối đa 256KB nhằm ngăn chặn tấn công từ chối dịch vụ (DoS).
3. **Bảo vệ Khóa bí mật**: Không bao giờ ghi log nội dung API Key ra console hay đưa vào HTTP response.
4. **Liên kết Shopee**: Nút tìm kiếm phụ kiện Shopee sử dụng URL encode an toàn, ghi rõ tính chất liên kết tham khảo ngoài sàn, không bảo đảm giá hoặc tình trạng hàng có sẵn.
