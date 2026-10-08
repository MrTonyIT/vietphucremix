/**
 * Utility tạo liên kết tìm kiếm mẫu tương tự trên sàn TMĐT Shopee.
 * 
 * QUY TẮC NGHIỆM THU CHECKPOINT 4:
 * 1. Nhãn cố định: "Tìm mẫu tương tự trên Shopee ↗".
 * 2. URL chỉ dựng bằng code từ domain cố định và tên item trong catalog:
 *    https://shopee.vn/search?keyword=${encodeURIComponent(item.name)}
 * 3. Tuyệt đối không lấy URL do AI tự sinh hoặc thêm "cổ phục" vào từ khóa (như giày sneaker giữ nguyên).
 * 4. Luôn mở tab mới an toàn với target="_blank" và rel="noopener noreferrer".
 * 5. Là tính năng phụ tham khảo; không khẳng định sản phẩm có sẵn hay đã xác minh lịch sử.
 */

export function getShopeeSearchUrl(itemName: string): string {
  if (!itemName) return 'https://shopee.vn';
  const query = encodeURIComponent(itemName.trim());
  return `https://shopee.vn/search?keyword=${query}`;
}
