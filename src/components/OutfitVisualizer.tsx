import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CatalogItem, EntitySlug, SlotType, GenderType, AgeGroupType } from '../types/fashion';

export interface CharacterOutfitCanvasProps {
  entitySlug: EntitySlug;
  items: Partial<Record<SlotType, CatalogItem>>;
  instanceId?: string;
  className?: string;
  gender?: GenderType;
  ageGroup?: AgeGroupType;
}

/**
 * Renderer trong suốt của Nhân vật & Trang phục Việt Phục.
 * ĐỘC LẬP & KHÔNG LỒNG CHROME:
 * - Không chứa thẻ nền đen, không chứa header tag hay footer bảng màu.
 * - Cho phép lồng ghép tự nhiên lên phông nền bối cảnh kiến trúc mà không bị đóng hộp.
 * - Giữ nguyên đầy đủ hệ thống def IDs độc lập, bộ bóng đổ, chuyển động AnimatePresence và các slot.
 * - Hỗ trợ thay đổi vóc dáng Mannequin linh hoạt theo Giới tính (Nam/Nữ) và Độ tuổi (Trẻ em/Thanh niên/...).
 */
export const CharacterOutfitCanvas: React.FC<CharacterOutfitCanvasProps> = ({
  entitySlug,
  items,
  instanceId = 'canvas-default',
  className = '',
  gender = 'all',
  ageGroup = 'thanh_nien',
}) => {
  const isMale = gender === 'nam';
  const isChild = ageGroup === 'tre_em';

  const mainItem = items.main;
  const lowerItem = items.lower;
  const innerItem = items.inner;
  const headItem = items.headwear;
  const footItem = items.footwear;
  const accItem = items.accessory;

  // Derive effective entity from actual main coat item if available
  const effectiveEntitySlug: EntitySlug =
    mainItem && mainItem.entitySlug !== 'all'
      ? (mainItem.entitySlug as EntitySlug)
      : entitySlug;

  // Colors based on ACTUAL present items
  const mainColor = mainItem?.hexColor || '#888888';
  const lowerColor = lowerItem?.hexColor || '#888888';
  const innerColor = innerItem?.hexColor || '#888888';
  const headColor = headItem?.hexColor || '#888888';
  const footColor = footItem?.hexColor || '#888888';
  const accColor = accItem?.hexColor || '#888888';

  // SVG Unique Def IDs to avoid clashes in side-by-side Compare View or Scene View
  const mainGradId = `${instanceId}-mainGradient`;
  const foldShadowId = `${instanceId}-foldShadow`;
  const shadowFilterId = `${instanceId}-shadowFilter`;

  return (
    <svg
      viewBox="0 0 360 480"
      className={`w-full h-full max-h-[440px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients with UNIQUE INSTANCE ID */}
        <linearGradient id={mainGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={mainColor} stopOpacity="1" />
          <stop offset="100%" stopColor={mainColor} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={foldShadowId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
        </linearGradient>
        <filter id={shadowFilterId} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* === BASE MANNEQUIN FOUNDATION (always visible as anatomical base) === */}
      <g id={`${instanceId}-mannequin`} opacity="0.85">
        {/* Neck */}
        <path d={isMale ? "M164 115 L164 142 H196 L196 115 Z" : "M168 115 L168 140 H192 L192 115 Z"} fill="#E6CCB2" />
        {/* Head Silhouette */}
        <ellipse cx="180" cy={isChild ? "94" : "90"} rx={isChild ? "28" : "26"} ry={isChild ? "28" : "32"} fill="#E6CCB2" />
        {/* Hair Bun / Topknot */}
        {isMale ? (
          <g>
            <ellipse cx="180" cy="55" rx="11" ry="13" fill="#1C1D24" />
            <line x1="162" y1="55" x2="198" y2="55" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="162" cy="55" r="2" fill="#FFEAA7" />
            <path d="M166 70 Q180 60 194 70" stroke="#1C1D24" strokeWidth="3" fill="none" />
          </g>
        ) : (
          <ellipse cx="180" cy="62" rx="14" ry="12" fill="#2B2D42" />
        )}
        {/* Torso Foundation if main coat is missing */}
        {!mainItem && (
          <g opacity="0.4">
            <path
              d={isMale ? "M136 145 L166 135 H194 L224 145 L214 235 H146 Z" : "M145 145 L170 135 H190 L215 145 L204 235 H156 Z"}
              fill="#D4B996"
              stroke="#A88B68"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text x="180" y="190" textAnchor="middle" fill="#A88B68" fontSize="11" fontFamily="sans-serif">
              [Chưa có áo chính]
            </text>
          </g>
        )}
        {/* Missing Yem indicator for Tu Than */}
        {effectiveEntitySlug === 'tu-than' && !innerItem && (
          <g opacity="0.6">
            <path
              d="M168 140 Q180 152 192 140 L204 195 Q180 212 156 195 Z"
              fill="none"
              stroke="#E63946"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
            <text x="180" y="175" textAnchor="middle" fill="#E63946" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
              [Thiếu Yếm]
            </text>
          </g>
        )}
        {/* Legs foundation if lower garment is missing */}
        {!lowerItem && (
          <g opacity="0.4">
            <path d="M160 235 L150 435 H168 L175 270 Z" fill="#D4B996" stroke="#A88B68" strokeDasharray="3 3" />
            <path d="M200 235 L210 435 H192 L185 270 Z" fill="#D4B996" stroke="#A88B68" strokeDasharray="3 3" />
            <text x="180" y="340" textAnchor="middle" fill="#A88B68" fontSize="11" fontFamily="sans-serif">
              [Chưa có mặc dưới]
            </text>
          </g>
        )}
      </g>

      {/* === HEADWEAR LAYER (ONLY WHEN HEADITEM IS ACTUALLY PRESENT) === */}
      <AnimatePresence mode="wait">
        {headItem && (
          <motion.g
            key={headItem.id}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            id={`${instanceId}-headwear-layer`}
          >
            {(headItem.renderVariant === 'headwear-non-la' || headItem.id.includes('non-la')) && (
              // Nón Lá
              <g filter={`url(#${shadowFilterId})`}>
                <polygon points="180,35 110,95 250,95" fill={headColor} stroke="#B7B7A4" strokeWidth="1.5" />
                <line x1="125" y1="82" x2="235" y2="82" stroke="#A5A58D" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="140" y1="68" x2="220" y2="68" stroke="#A5A58D" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="158" y1="52" x2="202" y2="52" stroke="#A5A58D" strokeWidth="0.8" />
                {/* Quai nón lụa tím */}
                <path d="M130 95 C145 125 180 135 180 135 C180 135 215 125 230 95" stroke="#9B5DE5" strokeWidth="2.5" fill="none" />
              </g>
            )}

            {(headItem.renderVariant === 'headwear-khan-van' || headItem.id.includes('khan-van')) && (
              // Khăn Vấn
              <g filter={`url(#${shadowFilterId})`}>
                <ellipse cx="180" cy="74" rx="34" ry="16" fill={headColor} stroke="#0D1B2A" strokeWidth="1.5" />
                <ellipse cx="180" cy="70" rx="30" ry="12" fill="#0D1B2A" opacity="0.3" />
                <path d="M152 74 Q180 82 208 74" stroke="#E0E1DD" strokeWidth="1" fill="none" opacity="0.6" />
                <path d="M154 70 Q180 77 206 70" stroke="#E0E1DD" strokeWidth="1" fill="none" opacity="0.6" />
              </g>
            )}

            {headItem.id.includes('khandong-nhung-den') && (
              // Khăn Đóng Nhung Đen Nho Sĩ
              <g filter={`url(#${shadowFilterId})`}>
                <ellipse cx="180" cy="73" rx="33" ry="15" fill="#121212" stroke="#2A2A2A" strokeWidth="1.5" />
                <ellipse cx="180" cy="69" rx="28" ry="11" fill="#050505" opacity="0.9" />
                <path d="M152 73 Q180 80 208 73" stroke="#3D3D3D" strokeWidth="1.2" fill="none" />
                <circle cx="180" cy="60" r="1.5" fill="#D4AF37" />
              </g>
            )}

            {headItem.id.includes('man-theu-hac') && (
              // Mấn Đội Đầu Thêu Hạc Kim Tuyến
              <g filter={`url(#${shadowFilterId})`}>
                <ellipse cx="180" cy="70" rx="35" ry="17" fill={headColor} stroke="#FFD700" strokeWidth="1.5" />
                <ellipse cx="180" cy="66" rx="28" ry="12" fill="#5E0010" opacity="0.8" />
                <path d="M150 71 Q180 80 210 71" stroke="#FFD700" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
                <path d="M172 68 Q180 62 188 68" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
              </g>
            )}

            {headItem.id.includes('khan-ran') && (
              // Khăn Rằn Nam Bộ
              <g filter={`url(#${shadowFilterId})`}>
                <ellipse cx="180" cy="74" rx="33" ry="15" fill="#2B2D42" stroke="#E5E5E5" strokeWidth="1" />
                <path d="M152 74 Q180 82 208 74" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
                <path d="M165 82 C162 105 160 135 158 175" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="3 2" fill="none" />
                <path d="M195 82 C198 105 200 135 202 175" stroke="#2B2D42" strokeWidth="4" strokeDasharray="3 2" fill="none" />
              </g>
            )}

            {(headItem.renderVariant === 'headwear-khan-lua-van-may' || headItem.id.includes('khan-lua')) && (
              // Khăn Lụa Vấn Hoa Văn Vân Mây (dải lụa mềm mại vắt nhẹ qua vai/cổ)
              <g filter={`url(#${shadowFilterId})`}>
                <ellipse cx="180" cy="74" rx="34" ry="15" fill={headColor} stroke="#B8860B" strokeWidth="1.2" />
                <path d="M150 74 Q180 84 210 74" stroke="#FFF8DC" strokeWidth="1.2" fill="none" opacity="0.8" />
                <path d="M154 70 Q180 78 206 70" stroke="#FFE4B5" strokeWidth="1" strokeDasharray="3 2" fill="none" opacity="0.9" />
                {/* Dải lụa mềm mại vắt nhẹ qua vai và cổ */}
                <path
                  d="M196 82 C204 100 214 125 210 160 C208 175 202 195 204 220"
                  stroke={headColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.92"
                />
                <path
                  d="M196 82 C204 100 214 125 210 160 C208 175 202 195 204 220"
                  stroke="#FFF8DC"
                  strokeWidth="1.2"
                  strokeDasharray="4 2"
                  fill="none"
                  opacity="0.75"
                />
              </g>
            )}

            {(headItem.renderVariant === 'headwear-quai-thao' || headItem.id.includes('quai-thao')) && (
              // Nón Quai Thao
              <g filter={`url(#${shadowFilterId})`}>
                <ellipse cx="180" cy="65" rx="72" ry="16" fill={headColor} stroke="#A3704C" strokeWidth="2" />
                <ellipse cx="180" cy="62" rx="32" ry="7" fill="#7F4F24" opacity="0.4" />
                <path d="M125 72 C115 110 120 180 125 230" stroke="#E63946" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M235 72 C245 110 240 180 235 230" stroke="#E63946" strokeWidth="3" fill="none" strokeLinecap="round" />
              </g>
            )}
          </motion.g>
        )}
      </AnimatePresence>

      {/* === LOWER LAYER (ONLY WHEN LOWERITEM IS ACTUALLY PRESENT) === */}
      <AnimatePresence mode="wait">
        {lowerItem && (
          <motion.g
            key={lowerItem.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            id={`${instanceId}-lower-layer`}
          >
            {lowerItem.renderVariant === 'skirt-kinhbac-black' || lowerItem.id.includes('vay') ? (
              // Váy Đầm Xòe Kinh Bắc
              <g filter={`url(#${shadowFilterId})`}>
                <path
                  d="M150 240 C145 280 110 380 95 430 H265 C250 380 215 280 210 240 Z"
                  fill={lowerColor}
                  stroke="#111111"
                  strokeWidth="1.5"
                />
                <path d="M180 245 L180 430" stroke="#000000" strokeWidth="1.5" opacity="0.3" />
                <path d="M150 255 L135 430" stroke="#000000" strokeWidth="1" opacity="0.25" />
                <path d="M210 255 L225 430" stroke="#000000" strokeWidth="1" opacity="0.25" />
              </g>
            ) : (
              // Quần Lụa Ống Rộng
              <g filter={`url(#${shadowFilterId})`}>
                <path d="M155 240 L135 435 H174 L178 280 Z" fill={lowerColor} stroke="#D3D3D3" strokeWidth="1" />
                <path d="M205 240 L225 435 H186 L182 280 Z" fill={lowerColor} stroke="#D3D3D3" strokeWidth="1" />
                <line x1="145" y1="300" x2="152" y2="420" stroke="#FFFFFF" strokeWidth="1" opacity="0.4" />
                <line x1="215" y1="300" x2="208" y2="420" stroke="#FFFFFF" strokeWidth="1" opacity="0.4" />
              </g>
            )}
          </motion.g>
        )}
      </AnimatePresence>

      {/* === INNER LAYER: YẾM (ONLY WHEN INNERITEM IS PRESENT) === */}
      <AnimatePresence mode="wait">
        {innerItem && (
          <motion.g
            key={innerItem.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            id={`${instanceId}-inner-layer-yem`}
          >
            <path
              d="M170 135 Q180 148 190 135 L208 195 Q180 215 152 195 Z"
              fill={innerColor}
              stroke="#660708"
              strokeWidth="1"
            />
            <path d="M170 135 Q180 140 190 135" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
            {/* Dải thắt lưng bao lụa */}
            <rect x="145" y="228" width="70" height="14" rx="3" fill="#E63946" stroke="#9B2226" strokeWidth="1" />
            <path d="M176 242 L172 290 H188 L184 242 Z" fill="#FFB703" opacity="0.9" />
          </motion.g>
        )}
      </AnimatePresence>

      {/* === MAIN LAYER: ÁO CHÍNH (ONLY WHEN MAINITEM IS PRESENT) === */}
      <AnimatePresence mode="wait">
        {mainItem && (
          <motion.g
            key={`${effectiveEntitySlug}-${mainItem.id}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
            id={`${instanceId}-main-coat-layer`}
            filter={`url(#${shadowFilterId})`}
          >
            {/* 1. ÁO DÀI */}
            {effectiveEntitySlug === 'ao-dai' && (
              <g>
                {/* Thân trên */}
                <path
                  d={
                    isMale
                      ? "M132 148 L168 135 H192 L228 148 L218 226 H142 Z"
                      : "M142 152 L170 135 H190 L218 152 L206 220 Q180 230 154 220 Z"
                  }
                  fill={`url(#${mainGradId})`}
                  stroke="#555555"
                  strokeWidth="0.8"
                />
                {/* Tay áo dài */}
                {mainItem.renderVariant === 'aodai-modern' ? (
                  // Tay bồng nhẹ kiểu cách tân Remix
                  <>
                    <path d={isMale ? "M132 148 Q115 178 104 240 L116 245 Q130 190 148 185 Z" : "M142 152 Q120 180 108 240 L120 245 Q135 190 154 185 Z"} fill={mainColor} stroke="#666" strokeWidth="0.8" />
                    <path d={isMale ? "M228 148 Q245 178 256 240 L244 245 Q230 190 212 185 Z" : "M218 152 Q240 180 252 240 L240 245 Q225 190 206 185 Z"} fill={mainColor} stroke="#666" strokeWidth="0.8" />
                  </>
                ) : (
                  // Tay áo truyền thống
                  <>
                    <path d={isMale ? "M132 148 L98 240 L112 245 L148 185 Z" : "M142 152 L105 240 L118 245 L154 185 Z"} fill={mainColor} stroke="#666" strokeWidth="0.8" />
                    <path d={isMale ? "M228 148 L262 240 L248 245 L212 185 Z" : "M218 152 L255 240 L242 245 L206 185 Z"} fill={mainColor} stroke="#666" strokeWidth="0.8" />
                  </>
                )}
                {/* Cổ áo */}
                <path d="M170 125 H190 V138 H170 Z" fill={mainColor} stroke="#777" strokeWidth="1" />
                {/* Tà áo trước */}
                <path
                  d={
                    isMale
                      ? `M142 226 L140 ${isChild ? 355 : 410} Q180 ${isChild ? 362 : 418} 220 ${isChild ? 355 : 410} L218 226 Z`
                      : `M154 222 Q180 228 206 222 L215 ${isChild ? 355 : 410} Q180 ${isChild ? 362 : 418} 145 ${isChild ? 355 : 410} Z`
                  }
                  fill={`url(#${mainGradId})`}
                  stroke="#888"
                  strokeWidth="1"
                />
                {/* Họa tiết hoa nhí pastel nếu là bản cách tân hoa nhí */}
                {(mainItem.renderVariant === 'aodai-modern-floral' || mainItem.id.includes('hoa-nhi')) && (
                  <g opacity="0.65">
                    <circle cx="170" cy="250" r="2" fill="#F43F5E" />
                    <circle cx="173" cy="248" r="1.5" fill="#FEF08A" />
                    <circle cx="190" cy="275" r="2.2" fill="#F43F5E" />
                    <circle cx="193" cy="273" r="1.5" fill="#FEF08A" />
                    <circle cx="165" cy="310" r="2" fill="#F43F5E" />
                    <circle cx="180" cy="340" r="2.5" fill="#F43F5E" />
                    <circle cx="183" cy="338" r="1.8" fill="#FEF08A" />
                    <circle cx="198" cy="375" r="2.2" fill="#F43F5E" />
                    <circle cx="160" cy="385" r="2" fill="#F43F5E" />
                  </g>
                )}
                {/* Tà áo sau */}
                <path d={`M145 ${isChild ? 355 : 410} L138 ${isChild ? 363 : 418} Q180 ${isChild ? 370 : 426} 222 ${isChild ? 363 : 418} L215 ${isChild ? 355 : 410} Z`} fill={mainColor} opacity="0.6" />
                {/* Xẻ tà */}
                <circle cx={isMale ? 142 : 154} cy={isMale ? 226 : 222} r="2.5" fill="#D4A373" />
                <circle cx={isMale ? 218 : 206} cy={isMale ? 226 : 222} r="2.5" fill="#D4A373" />
              </g>
            )}

            {/* 2. ÁO NGŨ THÂN & HOÀNG TRIỀU */}
            {effectiveEntitySlug === 'ngu-than' && (
              <g>
                {/* 2.1 Nhật Bình: Cổ đối khâm chữ Nhật & dải ngũ sắc */}
                {(mainItem.id.includes('nhatbinh') || mainItem.renderVariant.includes('nhatbinh')) ? (
                  <>
                    {/* Thân áo Nhật Bình thụng rộng */}
                    <path
                      d={`M132 148 L168 136 H192 L228 148 L232 ${isChild ? 310 : 360} Q180 ${isChild ? 318 : 368} 128 ${isChild ? 310 : 360} Z`}
                      fill={`url(#${mainGradId})`}
                      stroke="#4A000E"
                      strokeWidth="1.2"
                    />
                    {/* Tay thụng rộng cung đình */}
                    <path d="M132 148 L65 285 L108 290 L142 195 Z" fill={mainColor} stroke="#4A000E" strokeWidth="1" />
                    <path d="M228 148 L295 285 L252 290 L218 195 Z" fill={mainColor} stroke="#4A000E" strokeWidth="1" />
                    {/* Viền tay ngũ sắc */}
                    <path d="M65 285 L108 290" stroke="#FFD700" strokeWidth="2.5" />
                    <path d="M252 290 L295 285" stroke="#FFD700" strokeWidth="2.5" />
                    {/* Dải cổ đối khâm hình chữ Nhật ngũ sắc (vàng, xanh, đỏ, trắng) */}
                    <rect x="171" y="136" width="18" height="135" fill="#FFEAA7" stroke="#D63031" strokeWidth="1" />
                    <line x1="174" y1="136" x2="174" y2="271" stroke="#0984E3" strokeWidth="1.2" />
                    <line x1="180" y1="136" x2="180" y2="271" stroke="#D63031" strokeWidth="1.2" />
                    <line x1="186" y1="136" x2="186" y2="271" stroke="#00B894" strokeWidth="1.2" />
                    <circle cx="180" cy="275" r="3" fill="#D4AF37" />
                  </>
                ) : (mainItem.id.includes('aotac') || mainItem.renderVariant.includes('aotac')) ? (
                  /* 2.2 Áo Tấc: Tay thụng dài uy nghi */
                  <>
                    <path d="M168 122 H192 V138 H168 Z" fill={mainColor} stroke="#1B4332" strokeWidth="1.5" />
                    <line x1="168" y1="130" x2="192" y2="130" stroke="#FFD166" strokeWidth="1" />
                    <path
                      d={`M128 146 L166 136 H194 L232 146 L234 ${isChild ? 310 : 365} Q180 ${isChild ? 318 : 375} 126 ${isChild ? 310 : 365} Z`}
                      fill={`url(#${mainGradId})`}
                      stroke="#081C15"
                      strokeWidth="1.2"
                    />
                    {/* Ống tay thụng rộng dài qua đầu gối */}
                    <path d="M128 146 L68 290 L112 295 L142 195 Z" fill={mainColor} stroke="#081C15" strokeWidth="1" />
                    <path d="M232 146 L292 290 L248 295 L218 195 Z" fill={mainColor} stroke="#081C15" strokeWidth="1" />
                    <path d={`M192 138 C195 155 210 170 216 195 L218 ${isChild ? 310 : 365}`} stroke="#FFD700" strokeWidth="1.5" fill="none" />
                    <circle cx="180" cy="130" r="2.5" fill="#FFD700" stroke="#9A7B0C" strokeWidth="1" />
                    <circle cx="196" cy="150" r="2.5" fill="#FFD700" stroke="#9A7B0C" strokeWidth="1" />
                    <circle cx="206" cy="172" r="2.5" fill="#FFD700" stroke="#9A7B0C" strokeWidth="1" />
                    <circle cx="214" cy="195" r="2.5" fill="#FFD700" stroke="#9A7B0C" strokeWidth="1" />
                    <circle cx="216" cy="225" r="2.5" fill="#FFD700" stroke="#9A7B0C" strokeWidth="1" />
                  </>
                ) : (
                  /* 2.3 Áo Ngũ Thân Tay Chẽn Tiêu Chuẩn */
                  <>
                    <path d="M168 122 H192 V138 H168 Z" fill={mainColor} stroke="#1B4332" strokeWidth="1.5" />
                    <line x1="168" y1="130" x2="192" y2="130" stroke="#FFD166" strokeWidth="1" />
                    <path
                      d={
                        isMale
                          ? `M128 146 L166 136 H194 L232 146 L234 ${isChild ? 310 : 355} Q180 ${isChild ? 318 : 365} 126 ${isChild ? 310 : 355} L128 146 Z`
                          : `M136 150 L168 136 H192 L224 150 L228 ${isChild ? 310 : 355} Q180 ${isChild ? 318 : 365} 132 ${isChild ? 310 : 355} L136 150 Z`
                      }
                      fill={`url(#${mainGradId})`}
                      stroke="#081C15"
                      strokeWidth="1.2"
                    />
                    <path d={isMale ? "M128 146 L92 250 L108 254 L142 195 Z" : "M136 150 L98 250 L112 254 L146 195 Z"} fill={mainColor} stroke="#1B4332" strokeWidth="1" />
                    <path d={isMale ? "M232 146 L268 250 L252 254 L218 195 Z" : "M224 150 L262 250 L248 254 L214 195 Z"} fill={mainColor} stroke="#1B4332" strokeWidth="1" />
                    <path d={`M192 138 C195 155 210 170 216 195 L218 ${isChild ? 310 : 355}`} stroke="#FFD700" strokeWidth="1.5" fill="none" />
                    <circle cx="180" cy="130" r="2.5" fill="#FFD700" stroke="#9A7B0C" strokeWidth="1" />
                    <circle cx="196" cy="150" r="2.5" fill="#FFD700" stroke="#9A7B0C" strokeWidth="1" />
                    <circle cx="206" cy="172" r="2.5" fill="#FFD700" stroke="#9A7B0C" strokeWidth="1" />
                    <circle cx="214" cy="195" r="2.5" fill="#FFD700" stroke="#9A7B0C" strokeWidth="1" />
                    <circle cx="216" cy="225" r="2.5" fill="#FFD700" stroke="#9A7B0C" strokeWidth="1" />
                  </>
                )}
              </g>
            )}

            {/* 3. ÁO TỨ THÂN KINH BẮC & ÁO BÀ BA */}
            {effectiveEntitySlug === 'tu-than' && (
              <g>
                {mainItem.id.includes('baba') ? (
                  // Áo Bà Ba Nam Bộ tà ngắn xẻ hông duyên dáng
                  <>
                    <path
                      d="M136 148 L170 138 H190 L224 148 L220 275 Q180 282 140 275 Z"
                      fill={`url(#${mainGradId})`}
                      stroke="#4A2E1B"
                      strokeWidth="1"
                    />
                    <path d="M136 148 L105 240 L118 245 L146 190 Z" fill={mainColor} stroke="#4A2E1B" strokeWidth="0.8" />
                    <path d="M224 148 L255 240 L242 245 L214 190 Z" fill={mainColor} stroke="#4A2E1B" strokeWidth="0.8" />
                    {/* Hàng khuy áo bà ba thẳng giữa ngực */}
                    <line x1="180" y1="138" x2="180" y2="278" stroke="#3D2619" strokeWidth="1.2" />
                    <circle cx="180" cy="155" r="2" fill="#E6CCB2" />
                    <circle cx="180" cy="180" r="2" fill="#E6CCB2" />
                    <circle cx="180" cy="205" r="2" fill="#E6CCB2" />
                    <circle cx="180" cy="230" r="2" fill="#E6CCB2" />
                    <circle cx="180" cy="255" r="2" fill="#E6CCB2" />
                    {/* Xẻ tà hai bên hông */}
                    <line x1="140" y1="260" x2="140" y2="275" stroke="#3D2619" strokeWidth="1.5" />
                    <line x1="220" y1="260" x2="220" y2="275" stroke="#3D2619" strokeWidth="1.5" />
                  </>
                ) : (
                  // Áo Tứ Thân Kinh Bắc 4 vạt buộc chéo
                  <>
                    <path d="M135 155 L164 140 L168 185 L144 240 Z" fill={mainColor} stroke="#3D2619" strokeWidth="1.2" />
                    <path d="M225 155 L196 140 L192 185 L216 240 Z" fill={mainColor} stroke="#3D2619" strokeWidth="1.2" />
                    <path d="M135 155 L96 235 L110 240 L144 195 Z" fill={mainColor} stroke="#3D2619" strokeWidth="1" />
                    <path d="M225 155 L264 235 L250 240 L216 195 Z" fill={mainColor} stroke="#3D2619" strokeWidth="1" />
                    <path
                      d="M168 185 L158 245 L172 320 L182 255 Z"
                      fill={`url(#${mainGradId})`}
                      stroke="#3D2619"
                      strokeWidth="1"
                    />
                    <path
                      d="M192 185 L202 245 L188 320 L178 255 Z"
                      fill={`url(#${mainGradId})`}
                      stroke="#3D2619"
                      strokeWidth="1"
                    />
                    <path d="M144 240 L136 360 Q180 370 224 360 L216 240 Z" fill={mainColor} opacity="0.75" />
                  </>
                )}
              </g>
            )}
          </motion.g>
        )}
      </AnimatePresence>

      {/* === ACCESSORY LAYER (ONLY WHEN ACCITEM IS PRESENT) === */}
      <AnimatePresence mode="wait">
        {accItem && (
          <motion.g
            key={accItem.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            id={`${instanceId}-accessory-layer`}
          >
            {(accItem.renderVariant === 'accessory-silver-choker' || accItem.id.includes('kieng-bac')) && (
              // Kiềng Bạc
              <path
                d="M166 142 C166 156 194 156 194 142"
                stroke={accColor}
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
                filter={`url(#${shadowFilterId})`}
              />
            )}

            {(accItem.renderVariant === 'accessory-fan' || accItem.id.includes('quat')) && (
              // Quạt Xếp Trầm Hương
              <g transform="translate(245, 235) rotate(-25)" filter={`url(#${shadowFilterId})`}>
                <path d="M0 0 L-25 -40 A45 45 0 0 1 25 -40 Z" fill={accColor} stroke="#5E412F" strokeWidth="1" />
                <line x1="0" y1="0" x2="-20" y2="-38" stroke="#DDB892" strokeWidth="0.8" />
                <line x1="0" y1="0" x2="0" y2="-43" stroke="#DDB892" strokeWidth="0.8" />
                <line x1="0" y1="0" x2="20" y2="-38" stroke="#DDB892" strokeWidth="0.8" />
                <circle cx="0" cy="0" r="3" fill="#BC6C25" />
                <path d="M0 0 L-2 15 H2 Z" fill="#E63946" />
              </g>
            )}

            {(accItem.renderVariant === 'accessory-rattan-bag' || accItem.id.includes('tui-coi')) && (
              // Túi Cói Mini
              <g transform="translate(90, 240)" filter={`url(#${shadowFilterId})`}>
                <path d="M5 0 C5 -15 25 -15 25 0" stroke="#7F4F24" strokeWidth="1.5" fill="none" />
                <rect x="0" y="0" width="30" height="26" rx="4" fill={accColor} stroke="#A68A68" strokeWidth="1" />
                <line x1="4" y1="7" x2="26" y2="7" stroke="#A68A68" strokeWidth="0.8" strokeDasharray="2 2" />
                <line x1="4" y1="14" x2="26" y2="14" stroke="#A68A68" strokeWidth="0.8" strokeDasharray="2 2" />
              </g>
            )}

            {(accItem.renderVariant === 'accessory-jade-pendant' || accItem.id.includes('ngoc-boi')) && (
              // Vòng Ngọc Bội Đeo Hông Mạn Sườn (viên ngọc tròn viền tua rua vàng óng buông mạn sườn)
              <g transform="translate(208, 222)" filter={`url(#${shadowFilterId})`}>
                <path d="M0 0 L4 18" stroke="#D4AF37" strokeWidth="1.5" />
                <circle cx="5" cy="24" r="8.5" fill={accColor} stroke="#D4AF37" strokeWidth="1.5" />
                <circle cx="5" cy="24" r="5" fill="none" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" strokeDasharray="2 1.5" />
                <circle cx="5" cy="24" r="2" fill="#D4AF37" />
                <path d="M2 32 L-1 52 H11 L8 32 Z" fill="#D4AF37" opacity="0.9" />
                <line x1="2" y1="33" x2="0" y2="52" stroke="#FFF8DC" strokeWidth="0.8" />
                <line x1="5" y1="33" x2="5" y2="53" stroke="#FFF8DC" strokeWidth="0.8" />
                <line x1="8" y1="33" x2="10" y2="52" stroke="#FFF8DC" strokeWidth="0.8" />
              </g>
            )}

            {(accItem.renderVariant === 'accessory-embroidered-pouch' || accItem.id.includes('tui-gam')) && (
              // Túi Gấm Thêu Tay Cung Đình
              <g transform="translate(90, 238)" filter={`url(#${shadowFilterId})`}>
                <path d="M5 0 C5 -16 25 -16 25 0" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
                <path d="M2 4 Q15 -2 28 4 L26 28 Q15 32 4 28 Z" fill={accColor} stroke="#D4AF37" strokeWidth="1.2" />
                <circle cx="15" cy="15" r="4.5" fill="none" stroke="#FFD700" strokeWidth="1" />
                <path d="M15 28 L15 38" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}

            {(accItem.id.includes('quat-lua-tron') || accItem.renderVariant === 'accessory-round-fan') && (
              // Quạt Lụa Tròn Đề Thơ Vẽ Hoa Sen
              <g transform="translate(245, 230)" filter={`url(#${shadowFilterId})`}>
                <line x1="0" y1="0" x2="0" y2="45" stroke="#7F4F24" strokeWidth="2" strokeLinecap="round" />
                <circle cx="0" cy="0" r="22" fill={accColor} stroke="#D4AF37" strokeWidth="1.2" />
                <circle cx="0" cy="0" r="21" fill="none" stroke="#BC6C25" strokeWidth="0.6" strokeDasharray="2 2" />
                {/* Đóa sen hồng & cành lá vẽ tay */}
                <path d="M-6 4 C-8 -4 0 -10 0 -10 C0 -10 8 -4 6 4 Z" fill="#F43F5E" opacity="0.8" />
                <circle cx="0" cy="-2" r="2" fill="#FEF08A" />
                <path d="M0 45 L-2 58 H2 Z" fill="#E63946" />
              </g>
            )}

            {accItem.id.includes('tram-cai-toc') && (
              // Trâm Cài Tóc Bạc Cổ Điển Khảm Xà Cừ (cài vào búi tóc)
              <g transform="translate(180, 56)" filter={`url(#${shadowFilterId})`}>
                <line x1="-16" y1="-2" x2="20" y2="4" stroke="#E0E1DD" strokeWidth="2" strokeLinecap="round" />
                <circle cx="-16" cy="-2" r="3.5" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="1" />
                <circle cx="-16" cy="-2" r="1.5" fill="#FFEAA7" />
              </g>
            )}

            {accItem.id.includes('the-bai-go') && (
              // Thẻ Bài Gỗ Mun Khắc Chữ Phúc Đeo Thắt Lưng
              <g transform="translate(210, 230)" filter={`url(#${shadowFilterId})`}>
                <line x1="0" y1="0" x2="0" y2="8" stroke="#D4AF37" strokeWidth="1.2" />
                <rect x="-6" y="8" width="12" height="24" rx="2" fill="#2B2D42" stroke="#D4AF37" strokeWidth="1" />
                <line x1="-3" y1="16" x2="3" y2="16" stroke="#FFD700" strokeWidth="1" />
                <line x1="0" y1="13" x2="0" y2="25" stroke="#FFD700" strokeWidth="1" />
                <line x1="0" y1="32" x2="0" y2="42" stroke="#E63946" strokeWidth="2" />
              </g>
            )}
          </motion.g>
        )}
      </AnimatePresence>

      {/* === FOOTWEAR LAYER (ONLY WHEN FOOTITEM IS PRESENT) === */}
      <AnimatePresence mode="wait">
        {footItem && (
          <motion.g
            key={footItem.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            id={`${instanceId}-footwear-layer`}
            filter={`url(#${shadowFilterId})`}
          >
            {(footItem.renderVariant === 'footwear-wooden-clog' || footItem.id.includes('guoc-moc-quai-nhung')) && (
              // Guốc Mộc Quai Nhung
              <g>
                <path d="M142 438 H166 L164 448 H144 Z" fill={footColor} />
                <path d="M144 438 C144 434 162 434 162 438" stroke="#1A1A1A" strokeWidth="3" fill="none" />
                <path d="M194 438 H218 L216 448 H196 Z" fill={footColor} />
                <path d="M196 438 C196 434 214 434 214 438" stroke="#1A1A1A" strokeWidth="3" fill="none" />
              </g>
            )}

            {(footItem.renderVariant === 'footwear-clog-leather' || footItem.id.includes('guoc-moc-quai-da')) && (
              // Guốc Mộc Quai Da Bò Nâu Gụ
              <g>
                <path d="M142 438 H166 L164 448 H144 Z" fill="#6B4226" stroke="#4A2E1B" strokeWidth="0.8" />
                <path d="M144 438 C144 433 162 433 162 438" stroke={footColor} strokeWidth="3" fill="none" />
                <circle cx="145" cy="438" r="1.2" fill="#D4AF37" />
                <circle cx="161" cy="438" r="1.2" fill="#D4AF37" />
                <path d="M194 438 H218 L216 448 H196 Z" fill="#6B4226" stroke="#4A2E1B" strokeWidth="0.8" />
                <path d="M196 438 C196 433 214 433 214 438" stroke={footColor} strokeWidth="3" fill="none" />
                <circle cx="197" cy="438" r="1.2" fill="#D4AF37" />
                <circle cx="213" cy="438" r="1.2" fill="#D4AF37" />
              </g>
            )}

            {(footItem.renderVariant === 'footwear-loafer-black' || footItem.id.includes('loafer')) && (
              // Giày Loafer Đen Hiện Đại Với Đế Giày Dày & Viền Chỉ May Nổi Bật
              <g>
                {/* Giày trái */}
                <path d="M138 439 Q154 436 169 439 L168 449 H138 Z" fill={footColor} stroke="#333333" strokeWidth="0.8" />
                <rect x="137" y="445" width="32" height="4" rx="1.5" fill="#111111" stroke="#444444" strokeWidth="0.5" />
                <path d="M140 442 Q154 439 167 442" stroke="#E5E5E5" strokeWidth="0.9" strokeDasharray="2 1.2" fill="none" />
                <line x1="148" y1="440" x2="158" y2="440" stroke="#D4AF37" strokeWidth="1.2" />

                {/* Giày phải */}
                <path d="M191 439 Q206 436 222 439 L221 449 H191 Z" fill={footColor} stroke="#333333" strokeWidth="0.8" />
                <rect x="190" y="445" width="32" height="4" rx="1.5" fill="#111111" stroke="#444444" strokeWidth="0.5" />
                <path d="M193 442 Q206 439 220 442" stroke="#E5E5E5" strokeWidth="0.9" strokeDasharray="2 1.2" fill="none" />
                <line x1="202" y1="440" x2="212" y2="440" stroke="#D4AF37" strokeWidth="1.2" />
              </g>
            )}

            {(footItem.renderVariant === 'footwear-embroidered-slipper' || footItem.id.includes('hai-theu')) && (
              // Hài Thêu
              <g>
                <path d="M140 440 Q155 437 168 440 L166 446 H142 Z" fill={footColor} />
                <path d="M140 440 Q136 434 138 432" stroke="#FFD700" strokeWidth="1.5" fill="none" />
                <path d="M192 440 Q205 437 220 440 L218 446 H194 Z" fill={footColor} />
                <path d="M220 440 Q224 434 222 432" stroke="#FFD700" strokeWidth="1.5" fill="none" />
              </g>
            )}

            {(footItem.renderVariant === 'footwear-sneaker-retro' || footItem.id.includes('sneaker')) && (
              // Sneaker Trắng Remix
              <g>
                <rect x="140" y="440" width="28" height="9" rx="3" fill={footColor} stroke="#CCCCCC" strokeWidth="1" />
                <path d="M140 447 H168" stroke="#E63946" strokeWidth="1.2" />
                <rect x="192" y="440" width="28" height="9" rx="3" fill={footColor} stroke="#CCCCCC" strokeWidth="1" />
                <path d="M192 447 H220" stroke="#E63946" strokeWidth="1.2" />
              </g>
            )}

            {(footItem.id.includes('guoc-son-mai') || footItem.renderVariant === 'footwear-lacquer-clog') && (
              // Guốc Sơn Mài Đỏ Son Khảm Xà Cừ
              <g>
                <path d="M142 438 H166 L164 448 H144 Z" fill="#800F2F" stroke="#590D22" strokeWidth="1" />
                <path d="M144 438 C144 433 162 433 162 438" stroke="#FFD700" strokeWidth="2.5" fill="none" />
                {/* Đốm khảm xà cừ óng ánh */}
                <circle cx="148" cy="443" r="1.2" fill="#FFFFFF" opacity="0.9" />
                <circle cx="158" cy="444" r="1.2" fill="#E0AAFF" opacity="0.9" />
                <path d="M194 438 H218 L216 448 H196 Z" fill="#800F2F" stroke="#590D22" strokeWidth="1" />
                <path d="M196 438 C196 433 214 433 214 438" stroke="#FFD700" strokeWidth="2.5" fill="none" />
                <circle cx="200" cy="443" r="1.2" fill="#FFFFFF" opacity="0.9" />
                <circle cx="210" cy="444" r="1.2" fill="#E0AAFF" opacity="0.9" />
              </g>
            )}

            {(footItem.id.includes('hai-gam') || footItem.renderVariant === 'footwear-gam-green') && (
              // Hài Gấm Cung Đình Mũi Cong Xanh Cẩm Thạch
              <g>
                <path d="M138 440 Q155 436 170 440 L168 447 H140 Z" fill={footColor} stroke="#081C15" strokeWidth="0.8" />
                <path d="M138 440 Q133 430 137 428" stroke="#FFD700" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <circle cx="137" cy="428" r="1.5" fill="#FFD700" />
                <path d="M190 440 Q205 436 222 440 L220 447 H192 Z" fill={footColor} stroke="#081C15" strokeWidth="0.8" />
                <path d="M222 440 Q227 430 223 428" stroke="#FFD700" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <circle cx="223" cy="428" r="1.5" fill="#FFD700" />
              </g>
            )}

            {(footItem.id.includes('dep-trau') || footItem.renderVariant === 'footwear-cork-sandal') && (
              // Dép Quai Da Đế Trấu Mộc Mạc
              <g>
                <rect x="140" y="442" width="26" height="6" rx="2" fill="#A68A68" stroke="#7F4F24" strokeWidth="0.8" />
                <path d="M142 442 Q153 436 164 442" stroke="#582F0E" strokeWidth="2.5" fill="none" />
                <rect x="194" y="442" width="26" height="6" rx="2" fill="#A68A68" stroke="#7F4F24" strokeWidth="0.8" />
                <path d="M196 442 Q207 436 218 442" stroke="#582F0E" strokeWidth="2.5" fill="none" />
              </g>
            )}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
};

export interface OutfitVisualizerProps {
  entitySlug: EntitySlug;
  items: Partial<Record<SlotType, CatalogItem>>;
  className?: string;
  instanceId?: string;
  gender?: GenderType;
  ageGroup?: AgeGroupType;
}

export const OutfitVisualizer: React.FC<OutfitVisualizerProps> = ({
  entitySlug,
  items,
  className = '',
  instanceId = 'viz-default',
  gender = 'all',
  ageGroup = 'thanh_nien',
}) => {
  const mainItem = items.main;
  const lowerItem = items.lower;
  const innerItem = items.inner;
  const headItem = items.headwear;
  const footItem = items.footwear;

  const effectiveEntitySlug: EntitySlug =
    mainItem && mainItem.entitySlug !== 'all'
      ? (mainItem.entitySlug as EntitySlug)
      : entitySlug;

  const mainColor = mainItem?.hexColor || '#888888';
  const lowerColor = lowerItem?.hexColor || '#888888';
  const innerColor = innerItem?.hexColor || '#888888';
  const headColor = headItem?.hexColor || '#888888';
  const footColor = footItem?.hexColor || '#888888';

  // Missing items identification
  const missingSlots: { slot: SlotType; label: string }[] = [];
  if (!mainItem) missingSlots.push({ slot: 'main', label: 'Áo chính' });
  if (!lowerItem) missingSlots.push({ slot: 'lower', label: 'Mặc dưới' });
  if (effectiveEntitySlug === 'tu-than' && !innerItem) missingSlots.push({ slot: 'inner', label: 'Áo yếm' });
  if (!footItem) missingSlots.push({ slot: 'footwear', label: 'Giày/Hài' });

  return (
    <div
      className={`relative w-full aspect-[4/5] max-h-[580px] rounded-3xl bg-gradient-to-b from-stone-900/90 via-stone-950 to-stone-950 border border-stone-800 shadow-2xl p-4 sm:p-6 flex flex-col items-center justify-between overflow-hidden ${className}`}
    >
      {/* Background Ambience & Cultural watermark */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl bg-amber-500/20" />
        <svg className="w-full h-full stroke-amber-500/10" viewBox="0 0 400 500" fill="none">
          <circle cx="200" cy="250" r="160" strokeDasharray="4 8" strokeWidth="1.5" />
          <circle cx="200" cy="250" r="130" strokeWidth="0.8" />
          <path d="M40 250 H360 M200 90 V410" strokeDasharray="2 6" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Header Tag */}
      <div className="z-10 w-full flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
            Phom Dáng Trực Quan
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={effectiveEntitySlug}
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="text-[11px] text-stone-400 font-mono bg-stone-900/80 px-2.5 py-1 rounded-full border border-stone-700/60"
          >
            {effectiveEntitySlug === 'ao-dai' && 'Áo Dài Tà Kép'}
            {effectiveEntitySlug === 'ngu-than' && 'Ngũ Thân 5 Thân Lập Lĩnh'}
            {effectiveEntitySlug === 'tu-than' && 'Tứ Thân Vạt Buộc'}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Missing Items Alert Overlay if essential slots are unequipped */}
      <AnimatePresence>
        {missingSlots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2 }}
            className="z-10 w-full mt-1 px-2 py-1 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-between text-[11px] text-amber-300 overflow-hidden"
          >
            <span className="font-semibold">Chưa đủ món:</span>
            <span className="text-stone-300">
              {missingSlots.map((m) => `[${m.label}]`).join(' ')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Canvas Inside Frame */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center my-2">
        <CharacterOutfitCanvas
          entitySlug={effectiveEntitySlug}
          items={items}
          instanceId={instanceId}
          gender={gender}
          ageGroup={ageGroup}
        />
      </div>

      {/* Footer Active Palette Indicator */}
      <div className="z-10 w-full bg-stone-900/90 border border-stone-800 rounded-2xl p-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-stone-400">Bảng màu:</span>
          <div className="flex items-center space-x-1.5">
            {mainItem ? (
              <span
                className="w-4 h-4 rounded-full border border-stone-600 shadow-sm"
                style={{ backgroundColor: mainColor }}
                title={`Áo chính: ${mainItem.name}`}
              />
            ) : (
              <span className="w-4 h-4 rounded-full border border-dashed border-stone-600" title="Chưa có áo chính" />
            )}
            {lowerItem ? (
              <span
                className="w-4 h-4 rounded-full border border-stone-600 shadow-sm"
                style={{ backgroundColor: lowerColor }}
                title={`Mặc dưới: ${lowerItem.name}`}
              />
            ) : (
              <span className="w-4 h-4 rounded-full border border-dashed border-stone-600" title="Chưa có mặc dưới" />
            )}
            {innerItem && (
              <span
                className="w-4 h-4 rounded-full border border-stone-600 shadow-sm"
                style={{ backgroundColor: innerColor }}
                title={`Yếm: ${innerItem.name}`}
              />
            )}
            {headItem && (
              <span
                className="w-4 h-4 rounded-full border border-stone-600 shadow-sm"
                style={{ backgroundColor: headColor }}
                title={`Mũ nón: ${headItem.name}`}
              />
            )}
            {footItem && (
              <span
                className="w-4 h-4 rounded-full border border-stone-600 shadow-sm"
                style={{ backgroundColor: footColor }}
                title={`Giày hài: ${footItem.name}`}
              />
            )}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={mainItem ? mainItem.id : 'no-main'}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.2 }}
            className="text-[11px] text-amber-400 font-medium truncate max-w-[140px]"
          >
            {mainItem ? mainItem.colorName : 'Chưa có áo chính'}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
