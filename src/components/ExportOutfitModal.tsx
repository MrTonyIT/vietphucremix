import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileText,
  Share2,
  Copy,
  Check,
  Sparkles,
  X,
  Palette,
  ShieldCheck,
  Tag,
  Calendar,
  Layers,
  Crown,
  Printer,
  Eye,
  Loader2,
} from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { CatalogItem, EntitySlug, GenderType, AgeGroupType, SlotLabels, SlotType } from '../types/fashion';
import { CharacterOutfitCanvas } from './OutfitVisualizer';
import { useModalA11y } from '../utils/useModalA11y';
import { playSilkChime, isSoundEnabled } from '../utils/soundEffects';

export interface ExportOutfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  entitySlug: EntitySlug;
  gender: GenderType;
  ageGroup: AgeGroupType;
  items: Partial<Record<SlotType, CatalogItem>>;
  outfitName?: string;
  recipeName?: string;
}

type CardStyleTheme = 'lacquer' | 'parchment' | 'indigo';

export const ExportOutfitModal: React.FC<ExportOutfitModalProps> = ({
  isOpen,
  onClose,
  entitySlug,
  gender,
  ageGroup,
  items,
  outfitName,
  recipeName,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  const cardElementRef = useRef<HTMLDivElement>(null);

  // Tùy biến trên thẻ danh thiếp
  const [cardTheme, setCardTheme] = useState<CardStyleTheme>('lacquer');
  const [stylistName, setStylistName] = useState<string>('Việt Phục Remix');
  const [customTitle, setCustomTitle] = useState<string>(
    recipeName || outfitName || 'Tuyệt Phẩm Cổ Phục Việt Nam'
  );
  const [includePricing, setIncludePricing] = useState<boolean>(true);
  const [includePalette, setIncludePalette] = useState<boolean>(true);

  // Trạng thái xuất file
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isCopying, setIsCopying] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useModalA11y({
    isOpen,
    onClose,
    modalRef,
    initialFocusRef: primaryBtnRef,
  });

  const presentItemsCount = Object.values(items).filter(Boolean).length;

  // Lấy danh sách màu chủ đạo
  const paletteSwatches = Object.entries(items)
    .filter(([_, item]) => Boolean(item?.hexColor))
    .map(([slot, item]) => ({
      slot: slot as SlotType,
      label: SlotLabels[slot as SlotType].vi,
      name: item!.name,
      hex: item!.hexColor!,
    }));

  // Nhãn danh xưng cổ phục
  const entityLabels: Record<EntitySlug, string> = {
    'ao-dai': 'Áo Dài Truyền Thống & Remix',
    'ngu-than': 'Ngũ Thân Lập Lĩnh Hoàng Triều',
    'tu-than': 'Tứ Thân Kinh Bắc Giao Duyên',
  };

  const genderLabels: Record<GenderType, string> = {
    all: 'Phi giới tính',
    nam: 'Nam phong',
    nu: 'Nữ tú',
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. XUẤT ẢNH PNG (CARD DANH THIẾP THỜI TRANG 4K)
  const handleExportPng = async () => {
    if (!cardElementRef.current) return;
    setIsExportingPng(true);

    try {
      if (isSoundEnabled()) playSilkChime();

      // Rasterize với độ nét cao pixelRatio: 2.5
      const dataUrl = await toPng(cardElementRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: cardTheme === 'parchment' ? '#fbf8ef' : '#140e0a',
        filter: (node) => {
          // Bỏ qua các nút thao tác không cần render vào ảnh
          return !(node as HTMLElement)?.classList?.contains('no-export');
        },
      });

      const fileName = `viet-phuc-${customTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();

      showToast('Đã tải hình ảnh Card Danh Thiếp thời trang về máy thành công!');
    } catch (error: any) {
      console.error('Lỗi xuất PNG:', error);
      showToast('Không thể xuất ảnh: ' + (error?.message || 'Vui lòng thử lại'));
    } finally {
      setIsExportingPng(false);
    }
  };

  // 2. SAO CHÉP ẢNH VÀO CLIPBOARD (ĐỂ DÁN VÀO ZALO / MESSENGER / FACEBOOK)
  const handleCopyToClipboard = async () => {
    if (!cardElementRef.current) return;
    setIsCopying(true);

    try {
      if (isSoundEnabled()) playSilkChime();

      const blob = await toBlob(cardElementRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: cardTheme === 'parchment' ? '#fbf8ef' : '#140e0a',
      });

      if (!blob) throw new Error('Không tạo được dữ liệu ảnh');

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        showToast('Đã chép hình ảnh vào Clipboard! Bạn có thể dán (Ctrl+V) vào Zalo/Messenger ngay.');
      } else {
        // Fallback: Tải ảnh về
        handleExportPng();
      }
    } catch (error: any) {
      console.error('Lỗi chép ảnh:', error);
      // Fallback
      handleExportPng();
    } finally {
      setIsCopying(false);
    }
  };

  // 3. XUẤT TÀI LIỆU PDF (LƯU TRỮ NGOẠI TUYẾN / BẢN IN A4)
  const handleExportPdf = async () => {
    if (!cardElementRef.current) return;
    setIsExportingPdf(true);

    try {
      if (isSoundEnabled()) playSilkChime();

      // Lấy ảnh thẻ danh thiếp
      const cardPngUrl = await toPng(cardElementRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: cardTheme === 'parchment' ? '#fbf8ef' : '#140e0a',
      });

      // Khởi tạo tài liệu PDF A4 dọc (210 x 297 mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Nền tài liệu PDF
      if (cardTheme === 'parchment') {
        pdf.setFillColor(251, 248, 239);
      } else {
        pdf.setFillColor(20, 14, 10);
      }
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // Khung viền thếp vàng trang trọng
      pdf.setDrawColor(203, 163, 105);
      pdf.setLineWidth(1.2);
      pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);
      pdf.setLineWidth(0.4);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Header PDF
      pdf.setTextColor(203, 163, 105);
      pdf.setFontSize(10);
      pdf.text('VIỆT PHỤC REMIX — BẢN PHỐI CỔ PHỤC DI SẢN NGOẠI TUYẾN', pageWidth / 2, 18, {
        align: 'center',
      });

      // Nhúng hình ảnh Card danh thiếp vào trung tâm trang
      const cardWidth = 110;
      const cardHeight = 175;
      const cardX = (pageWidth - cardWidth) / 2;
      const cardY = 24;

      pdf.addImage(cardPngUrl, 'PNG', cardX, cardY, cardWidth, cardHeight);

      // Thông tin chi tiết bên dưới
      const infoY = cardY + cardHeight + 8;

      pdf.setFontSize(14);
      pdf.setTextColor(245, 217, 159);
      pdf.text(customTitle, pageWidth / 2, infoY, { align: 'center' });

      pdf.setFontSize(9);
      pdf.setTextColor(213, 195, 170);
      pdf.text(
        `Phân loại: ${entityLabels[entitySlug] || 'Việt Phục'} | Đối tượng: ${genderLabels[gender]} | Người phối: ${stylistName}`,
        pageWidth / 2,
        infoY + 6,
        { align: 'center' }
      );

      // Bảng kê từng món đồ
      pdf.setFontSize(8);
      pdf.setTextColor(200, 200, 200);
      const itemsList = Object.entries(items)
        .filter(([_, item]) => Boolean(item))
        .map(([slot, item]) => `${SlotLabels[slot as SlotType].vi}: ${item!.name}`)
        .join('  •  ');

      pdf.text(itemsList, pageWidth / 2, infoY + 12, {
        align: 'center',
        maxWidth: pageWidth - 30,
      });

      // Footer bản quyền và dấu mộc
      pdf.setFontSize(7);
      pdf.setTextColor(160, 145, 130);
      pdf.text(
        `Xuất bản ngày: ${new Date().toLocaleDateString('vi-VN')} • Nền tảng Việt Phục Remix (vietphucremix.vn)`,
        pageWidth / 2,
        pageHeight - 14,
        { align: 'center' }
      );

      const fileName = `ho-so-co-phuc-${customTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
      pdf.save(fileName);

      showToast('Đã xuất file PDF ngoại tuyến thành công!');
    } catch (error: any) {
      console.error('Lỗi xuất PDF:', error);
      showToast('Không thể xuất PDF: ' + (error?.message || 'Vui lòng thử lại'));
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 4. CHIA SẺ TRỰC TIẾP QUA NỀN TẢNG (WEB SHARE API)
  const handleShare = async () => {
    if (!cardElementRef.current) return;

    try {
      if (isSoundEnabled()) playSilkChime();

      const blob = await toBlob(cardElementRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: cardTheme === 'parchment' ? '#fbf8ef' : '#140e0a',
      });

      if (!blob) throw new Error('Không tạo được file ảnh');

      const file = new File([blob], 'viet-phuc-card.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: customTitle,
          text: `Chiêm ngưỡng bản phối ${customTitle} trên Việt Phục Remix!`,
          files: [file],
        });
        showToast('Đã mở hộp thoại chia sẻ!');
      } else {
        handleCopyToClipboard();
      }
    } catch (error: any) {
      console.warn('Hủy chia sẻ:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#16110d] border border-[#cba369]/40 text-[#f5efe6] shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Modal */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#cba369]/20 bg-[#1f1610]/90">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#332014] border border-[#cba369]/40 flex items-center justify-center text-[#d4af37] shadow-inner">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 id="export-modal-title" className="font-serif font-bold text-lg text-[#f5d99f] flex items-center space-x-2">
                  <span>Xuất Thẻ Danh Thiếp Thời Trang & PDF</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    HD 4K
                  </span>
                </h3>
                <p className="text-xs text-[#d5c3aa]">
                  Tải ảnh danh thiếp sắc nét để đăng mạng xã hội hoặc lưu trữ ngoại tuyến file PDF
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#2a1a11] hover:bg-[#3d2719] border border-[#cba369]/30 flex items-center justify-center text-[#d5c3aa] hover:text-white transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toast thông báo nhanh */}
          {toastMessage && (
            <div className="bg-amber-500/20 border-b border-amber-500/30 text-amber-200 px-6 py-2 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Body: Chia 2 cột (Trái: Preview Thẻ Card thời trang | Phải: Bảng điều khiển tùy biến & Xuất file) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* CỘT TRÁI: LIVE CARD PREVIEW (Phần sẽ được rasterize thành ảnh / PDF) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="text-xs text-[#d5c3aa] mb-2 flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Bản xem trước Danh thiếp Thời trang (Card Preview):</span>
              </div>

              {/* KHUNG THẺ DANH THIẾP THỜI TRANG ĐƯỢC CHỤP HÌNH */}
              <div
                ref={cardElementRef}
                className={`relative w-full max-w-[380px] rounded-3xl p-5 shadow-2xl transition-all duration-300 select-none overflow-hidden ${
                  cardTheme === 'parchment'
                    ? 'bg-[#fbf8ef] text-[#2c1d11] border-2 border-[#b48a4c]'
                    : cardTheme === 'indigo'
                    ? 'bg-[#0b1326] text-[#e0e7ff] border-2 border-[#6366f1]'
                    : 'bg-[#150e09] text-[#f5efe6] border-2 border-[#cba369]'
                }`}
                style={{
                  boxShadow:
                    cardTheme === 'parchment'
                      ? '0 20px 40px -15px rgba(180, 138, 76, 0.3)'
                      : '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(203, 163, 105, 0.15)',
                }}
              >
                {/* Họa tiết góc mạ vàng hoàng triều */}
                <div
                  className={`absolute top-2.5 left-2.5 text-xs font-serif opacity-75 ${
                    cardTheme === 'parchment' ? 'text-[#855e2d]' : 'text-[#f5d99f]'
                  }`}
                >
                  ❖
                </div>
                <div
                  className={`absolute top-2.5 right-2.5 text-xs font-serif opacity-75 ${
                    cardTheme === 'parchment' ? 'text-[#855e2d]' : 'text-[#f5d99f]'
                  }`}
                >
                  ❖
                </div>
                <div
                  className={`absolute bottom-2.5 left-2.5 text-xs font-serif opacity-75 ${
                    cardTheme === 'parchment' ? 'text-[#855e2d]' : 'text-[#f5d99f]'
                  }`}
                >
                  ❖
                </div>
                <div
                  className={`absolute bottom-2.5 right-2.5 text-xs font-serif opacity-75 ${
                    cardTheme === 'parchment' ? 'text-[#855e2d]' : 'text-[#f5d99f]'
                  }`}
                >
                  ❖
                </div>

                {/* Khung viền chỉ đôi truyền thống */}
                <div
                  className={`absolute inset-2 rounded-2xl border pointer-events-none ${
                    cardTheme === 'parchment' ? 'border-[#b48a4c]/30' : 'border-[#cba369]/25'
                  }`}
                />

                {/* 1. Header Thẻ */}
                <div className="relative z-10 text-center mb-3">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Việt Phục Remix • Heritage Card</span>
                  </div>
                  <h4
                    className={`font-serif font-black text-base sm:text-lg tracking-tight ${
                      cardTheme === 'parchment' ? 'text-[#3d2412]' : 'text-[#f5d99f]'
                    }`}
                  >
                    {customTitle}
                  </h4>
                  <p
                    className={`text-[10px] italic ${
                      cardTheme === 'parchment' ? 'text-[#6e5039]' : 'text-[#d5c3aa]'
                    }`}
                  >
                    {entityLabels[entitySlug] || 'Việt Phục Cổ Truyền'} • {genderLabels[gender]}
                  </p>
                </div>

                {/* 2. Visual Canvas Nhân vật Cổ phục ở trung tâm */}
                <div className="relative z-10 w-full h-[270px] flex items-center justify-center my-1 rounded-2xl overflow-hidden bg-gradient-to-b from-black/20 via-transparent to-black/30 border border-[#cba369]/20">
                  {/* Quầng sáng Hào quang sau lưng mannequin */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        cardTheme === 'parchment'
                          ? 'radial-gradient(circle at 50% 45%, rgba(212, 175, 55, 0.25) 0%, transparent 65%)'
                          : cardTheme === 'indigo'
                          ? 'radial-gradient(circle at 50% 45%, rgba(99, 102, 241, 0.3) 0%, transparent 65%)'
                          : 'radial-gradient(circle at 50% 45%, rgba(245, 158, 11, 0.25) 0%, transparent 65%)',
                    }}
                  />

                  {/* Character Outfit Canvas */}
                  <div className="relative z-10 w-full h-full flex items-center justify-center p-1">
                    <CharacterOutfitCanvas
                      entitySlug={entitySlug}
                      items={items}
                      instanceId="card-export-visual"
                      gender={gender}
                      ageGroup={ageGroup}
                      className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
                    />
                  </div>

                  {/* Con Dấu Triện Son Hoàng Gia góc dưới phải Canvas */}
                  <div className="absolute bottom-2 right-2 w-11 h-11 rounded-lg border-2 border-red-700 bg-red-800/85 text-amber-200 flex flex-col items-center justify-center text-[7px] font-serif font-black leading-tight shadow-md rotate-[-8deg] pointer-events-none select-none">
                    <span>ĐẠI NAM</span>
                    <span>DI SẢN</span>
                  </div>
                </div>

                {/* 3. Bảng Phối Màu Ngũ Hành (Color Swatches) */}
                {includePalette && paletteSwatches.length > 0 && (
                  <div className="relative z-10 my-2.5 px-2 py-1.5 rounded-xl bg-black/15 border border-[#cba369]/20 flex items-center justify-between">
                    <span
                      className={`text-[9px] font-semibold uppercase tracking-wider ${
                        cardTheme === 'parchment' ? 'text-[#5a3e29]' : 'text-[#cba369]'
                      }`}
                    >
                      Bảng Sắc Tố:
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {paletteSwatches.map((p, i) => (
                        <div
                          key={i}
                          className="group relative w-4 h-4 rounded-full border border-white/40 shadow-sm"
                          style={{ backgroundColor: p.hex }}
                          title={`${p.label}: ${p.name}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Danh sách các món cấu thành bộ phối */}
                <div className="relative z-10 space-y-1 my-2">
                  <div className="grid grid-cols-2 gap-1 text-[9px]">
                    {Object.entries(items)
                      .filter(([_, item]) => Boolean(item))
                      .slice(0, 6)
                      .map(([slot, item]) => (
                        <div
                          key={slot}
                          className={`p-1.5 rounded-lg border flex items-center justify-between overflow-hidden ${
                            cardTheme === 'parchment'
                              ? 'bg-amber-900/5 border-[#b48a4c]/20 text-[#3d2412]'
                              : 'bg-[#1e140d]/80 border-[#cba369]/20 text-[#e5ceb5]'
                          }`}
                        >
                          <span className="font-semibold text-[8px] text-amber-500 uppercase flex-shrink-0">
                            {SlotLabels[slot as SlotType].vi.slice(0, 7)}:
                          </span>
                          <span className="truncate ml-1 font-medium">{item!.name}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 5. Footer Thẻ & Mã Seri */}
                <div
                  className={`relative z-10 mt-3 pt-2 border-t flex items-center justify-between text-[8px] ${
                    cardTheme === 'parchment'
                      ? 'border-[#b48a4c]/20 text-[#6e5039]'
                      : 'border-[#cba369]/20 text-[#d5c3aa]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-amber-500">{stylistName}</span>
                    <span className="opacity-75">{new Date().toLocaleDateString('vi-VN')}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold tracking-wider opacity-90">
                      #VPR-{entitySlug.toUpperCase().slice(0, 4)}-{presentItemsCount}M
                    </span>
                    <p className="text-[7px] opacity-75">vietphucremix.vn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: TÙY BIẾN THẺ & CÁC NÚT HÀNH ĐỘNG XUẤT FILE */}
            <div className="lg:col-span-5 space-y-5">
              {/* Box 1: Chọn phong cách Thẻ Danh Thiếp */}
              <div className="p-4 rounded-2xl bg-[#1f1711] border border-[#cba369]/30 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#f5d99f]">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>Chủ Đề Danh Thiếp (Card Theme)</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCardTheme('lacquer')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      cardTheme === 'lacquer'
                        ? 'bg-[#332014] border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
                        : 'bg-[#18110b] border-[#cba369]/25 text-[#d5c3aa] hover:bg-[#251810]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#150e09] border border-[#cba369] mb-1.5" />
                    <div className="text-xs font-bold">Sơn Mài</div>
                    <div className="text-[9px] text-[#a89680]">Hổ phách quý tộc</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCardTheme('parchment')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      cardTheme === 'parchment'
                        ? 'bg-amber-100 border-amber-600 text-amber-950 ring-1 ring-amber-600/50'
                        : 'bg-[#18110b] border-[#cba369]/25 text-[#d5c3aa] hover:bg-[#251810]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#fbf8ef] border border-amber-600 mb-1.5" />
                    <div className="text-xs font-bold">Giấy Dó</div>
                    <div className="text-[9px] text-[#a89680]">Thanh nhã hoàng gia</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCardTheme('indigo')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      cardTheme === 'indigo'
                        ? 'bg-[#172554] border-indigo-400 text-indigo-200 ring-1 ring-indigo-400/50'
                        : 'bg-[#18110b] border-[#cba369]/25 text-[#d5c3aa] hover:bg-[#251810]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#0b1326] border border-indigo-400 mb-1.5" />
                    <div className="text-xs font-bold">Lam Dạ</div>
                    <div className="text-[9px] text-[#a89680]">Đêm trăng phố Hội</div>
                  </button>
                </div>
              </div>

              {/* Box 2: Tùy biến văn bản trên thẻ */}
              <div className="p-4 rounded-2xl bg-[#1f1711] border border-[#cba369]/30 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#f5d99f]">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span>Nội Dung Thẻ Danh Thiếp</span>
                </div>

                <div>
                  <label className="block text-[11px] text-[#d5c3aa] mb-1">Tên bộ phối:</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    maxLength={40}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#120b07] border border-[#cba369]/40 text-xs text-[#f5efe6] focus:border-amber-400 focus:outline-none"
                    placeholder="Nhập tên bộ phối..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#d5c3aa] mb-1">Người phối đồ (Stylist / Lớp):</label>
                  <input
                    type="text"
                    value={stylistName}
                    onChange={(e) => setStylistName(e.target.value)}
                    maxLength={30}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#120b07] border border-[#cba369]/40 text-xs text-[#f5efe6] focus:border-amber-400 focus:outline-none"
                    placeholder="Ví dụ: Kỷ yếu 12A1 / Luân Đỗ..."
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 text-[#d5c3aa] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePalette}
                      onChange={(e) => setIncludePalette(e.target.checked)}
                      className="rounded accent-amber-500 cursor-pointer"
                    />
                    <span>Hiện dải màu ngũ hành</span>
                  </label>
                </div>
              </div>

              {/* Box 3: Các nút hành động chính */}
              <div className="space-y-2.5 pt-1">
                {/* 1. Tải ảnh PNG */}
                <button
                  type="button"
                  ref={primaryBtnRef}
                  onClick={handleExportPng}
                  disabled={isExportingPng}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#b48a4c] hover:brightness-110 text-stone-950 font-bold text-sm shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isExportingPng ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-stone-900" />
                      <span>Đang kết xuất ảnh 4K...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-stone-900" />
                      <span>Tải Ảnh PNG (Đăng Story / Mạng Xã Hội)</span>
                    </>
                  )}
                </button>

                {/* 2. Tải File PDF ngoại tuyến */}
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="w-full py-2.5 px-4 rounded-2xl bg-[#2a1c13] hover:bg-[#3d2719] border border-[#cba369]/50 hover:border-amber-400 text-[#f5d99f] font-semibold text-xs shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isExportingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Đang đóng gói tài liệu PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>Tải File PDF Khổ A4 (Lưu Trữ Ngoại Tuyến)</span>
                    </>
                  )}
                </button>

                {/* 3. Nút sao chép và chia sẻ */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    disabled={isCopying}
                    className="py-2.5 px-3 rounded-2xl bg-[#221710] hover:bg-[#2e1d14] border border-[#cba369]/35 text-[#d5c3aa] hover:text-[#f5efe6] font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    title="Sao chép ảnh vào Clipboard để dán trực tiếp vào Zalo hoặc Messenger"
                  >
                    {isCopying ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>Chép Ảnh (Ctrl+V)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="py-2.5 px-3 rounded-2xl bg-[#221710] hover:bg-[#2e1d14] border border-[#cba369]/35 text-[#d5c3aa] hover:text-[#f5efe6] font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    title="Chia sẻ lên thiết bị hoặc ứng dụng"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Chia Sẻ Nhanh</span>
                  </button>
                </div>
              </div>

              {/* Ghi chú giá trị */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-[#e5ceb5] flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p>
                  Ảnh xuất ra có tỷ lệ vàng với độ phân giải siêu nét, kèm đầy đủ thông số ngũ hành và dấu triện hoàng gia, sẵn sàng để gửi tiệm thuê may hoặc chia sẻ lên Story Instagram / TikTok.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
