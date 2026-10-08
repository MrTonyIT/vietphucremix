# DANH MỤC ASSETS CẢM HỨNG VÀ BỐI CẢNH (INSPIRATION ASSETS MANIFEST)

## 1. Trạng thái Hiện tại & Xác minh Quyền Truy cập
- **Tình trạng Tích hợp**: `ASSET NEEDED` cho toàn bộ ảnh chụp studio thực tế độ phân giải cao; hiện tại hệ thống sử dụng **Minh họa Phối đồ + Bối cảnh Vector (Vector Scene Compositing)** kết hợp **Thư viện Phác thảo Tham khảo (Draft Reference Gallery)**.
- **Provider Trực tiếp (Live Image Inference)**: `NOT CONFIGURED` / `UNSUPPORTED`. Mặc định chạy `IMAGE_PROVIDER=none` trên máy chủ; không phát sinh chi phí hoặc rò rỉ secret key ra trình duyệt.
- **Quy tắc Minh bạch**: Hệ thống hiển thị rõ nhãn "Minh họa vector — Chưa có ảnh chụp thực tế" và "Không phải ảnh sinh bởi AI". Tuyệt đối không giả mạo đã tạo ảnh photorealistic hay gán nhãn "đã đối chiếu kiểm duyệt" cho các phác thảo chưa có ảnh raster thật.

---

## 2. Danh mục Phác thảo Tham khảo (Draft References)
1. `insp-aodai-school-white`: Phác thảo Áo Dài Trắng Nữ Sinh Sân Trường — Trạng thái: `ASSET_NEEDED` / `DRAFT`.
2. `insp-aodai-street-pink`: Phác thảo Áo Dài Cách Tân Hồng Phấn Dạo Phố — Trạng thái: `ASSET_NEEDED` / `DRAFT`.
3. `insp-tuthan-heritage-brown`: Phác thảo Áo Tứ Thân Kinh Bắc Không Gian Lễ Hội — Trạng thái: `ASSET_NEEDED` / `DRAFT`.
4. `insp-nguthan-studio-emerald`: Phác thảo Áo Ngũ Thân Xanh Cẩm Thạch Studio Editorial — Trạng thái: `ASSET_NEEDED` / `DRAFT`.

---

## 3. Danh mục Bối cảnh Không gian (Scene Backdrops 3:4)
1. `scene-school`: Sân trường & Giảng đường Đông Dương (tường vàng, cửa chớp xanh lá, vòm cây bóng mát).
2. `scene-street`: Phố đi bộ Hà Nội & Bờ hồ (hàng liễu, Tháp Rùa xa xa, vỉa hè dạo bước).
3. `scene-studio`: Studio nghệ thuật đương đại (phông vòm cyclorama màu be ấm, ánh sáng softbox).
4. `scene-heritage`: Cung đình & Di tích lịch sử (sân đá phiến, cột gỗ lim sơn son, mái ngói cổ kính).
- **Trạng thái**: Vector SVG kiến trúc đa tầng hiển thị trong suốt cùng nhân vật; ảnh chụp raster độ nét cao đánh dấu `ASSET NEEDED`.

---

## 4. Nguyên tắc Kiểm Soát & Bảo Vệ Người Dùng
1. **Minh bạch Nguồn gốc**: Gắn nhãn bắt buộc `"Minh họa phối cảnh vector — Chi tiết phục trang hiển thị theo các món thực tế trong danh mục. Không phải ảnh chụp thực tế hay ảnh sinh bởi AI."`
2. **Không Tự Đổi Bộ Phối**: Trình tạo minh họa chỉ dùng prompt chuyển hóa từ danh mục vật phẩm chuẩn (catalog IDs đã validate); kết quả tạo sinh không bao giờ can thiệp ngược lại làm biến đổi ID trang phục đang chọn.
3. **Phòng Chống Stale Request**: Nếu người dùng tráo món trang phục hoặc đổi bối cảnh trong lúc chờ phản hồi, kết quả cũ được lưu vào lịch sử, không ghi đè lên bộ mới.
4. **Bảo Tồn Tài Nguyên**: Bộ nhớ đệm in-memory (LRU cache 50 mục) phân biệt theo fingerprint (item IDs + scene + style + provider).
