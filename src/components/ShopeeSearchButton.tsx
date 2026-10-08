import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { getShopeeSearchUrl } from '../utils/shopeeLink';

interface ShopeeSearchButtonProps {
  itemName: string;
  className?: string;
  compact?: boolean;
  variant?: 'link' | 'button' | 'badge';
}

/**
 * Component hiển thị nút liên kết tìm kiếm mẫu tương tự trên sàn TMĐT Shopee.
 * Đảm bảo nhãn đúng chuẩn, an toàn rel="noopener noreferrer" và kèm chú thích miễn trừ.
 */
export const ShopeeSearchButton: React.FC<ShopeeSearchButtonProps> = ({
  itemName,
  className = '',
  compact = false,
  variant = 'link',
}) => {
  if (!itemName) return null;
  const searchUrl = getShopeeSearchUrl(itemName);

  if (variant === 'button' || variant === 'badge') {
    return (
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`Tìm mẫu tương tự "${itemName}" trên Shopee (Liên kết tìm kiếm tham khảo ngoài sàn)`}
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-[#ee4d2d]/15 hover:bg-[#ee4d2d]/25 text-[#ff7355] hover:text-[#ff927b] border border-[#ee4d2d]/35 transition-all group cursor-pointer shadow-sm active:scale-95 ${
          compact ? 'text-[11px]' : 'text-xs font-medium'
        } ${className}`}
      >
        <ShoppingBag className="w-3.5 h-3.5 text-[#ee4d2d] group-hover:scale-110 transition-transform shrink-0" />
        <span className="font-medium tracking-tight">Tìm mẫu tương tự trên Shopee ↗</span>
      </a>
    );
  }

  return (
    <a
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={`Tìm mẫu tương tự "${itemName}" trên Shopee (Liên kết tìm kiếm tham khảo ngoài sàn)`}
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center space-x-1.5 font-medium text-amber-400 hover:text-amber-300 hover:underline transition-colors cursor-pointer group active:scale-95 ${
        compact ? 'text-[11px]' : 'text-xs'
      } ${className}`}
    >
      <ShoppingBag className="w-3 h-3 text-amber-400/80 group-hover:scale-110 group-hover:text-amber-300 transition-all shrink-0" />
      <span>Tìm mẫu tương tự trên Shopee ↗</span>
    </a>
  );
};

