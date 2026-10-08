import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Camera,
  Layers,
  MapPin,
  Clock,
  Info,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Bookmark,
  RefreshCw,
} from 'lucide-react';
import { CatalogItem, SlotType, EntitySlug } from '../types/fashion';
import { SCENE_DEFINITIONS, SceneDefinition } from '../data/scenes';
import { matchInspirationGallery } from '../data/inspirationGallery';
import { CharacterOutfitCanvas } from './OutfitVisualizer';

export interface InspirationResultData {
  fingerprint: string;
  source: 'mockup' | 'gallery' | 'live';
  status: 'ready' | 'mockup_ready';
  providerStatus?: 'not_configured' | 'unsupported' | 'ready';
  sceneId: string;
  sceneName: string;
  prompt: string;
  disclaimer: string;
  timestamp: string;
  provider: string;
  outfitSummary: {
    entitySlug: string;
    mainColor: string;
    itemCount: number;
    itemNames: string[];
  };
  matchedGallery?: {
    id: string;
    title: string;
    matchType: 'exact' | 'similar';
    differenceNote?: string;
    sourceAttribution: string;
    paletteColors: string[];
    assetStatus?: string;
    reviewStatus?: string;
  };
}

interface InspirationSceneVisualizerProps {
  entitySlug: EntitySlug;
  items: Partial<Record<SlotType, CatalogItem>>;
  selectedSceneId: string;
  setSelectedSceneId: (sceneId: string) => void;
  inspirationResult: InspirationResultData | null;
  setInspirationResult: React.Dispatch<React.SetStateAction<InspirationResultData | null>>;
  generationHistory: InspirationResultData[];
  setGenerationHistory: React.Dispatch<React.SetStateAction<InspirationResultData[]>>;
  onSaveToLookbookWithScene?: (sceneContext: { sceneId: string; sceneName: string }) => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const InspirationSceneVisualizer: React.FC<InspirationSceneVisualizerProps> = ({
  entitySlug,
  items,
  selectedSceneId,
  setSelectedSceneId,
  inspirationResult,
  setInspirationResult,
  generationHistory,
  setGenerationHistory,
  onSaveToLookbookWithScene,
  showToast,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPromptExpanded, setIsPromptExpanded] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Active outfit fingerprint & scene ref to guard against race conditions / stale results
  const currentItemIds = Object.values(items)
    .filter((i): i is CatalogItem => !!i)
    .map((i) => i.id)
    .sort();
  const currentFingerprint = currentItemIds.join(',');

  const activeFingerprintRef = useRef<string>(currentFingerprint);
  const activeSceneRef = useRef<string>(selectedSceneId);

  useEffect(() => {
    activeFingerprintRef.current = currentFingerprint;
  }, [currentFingerprint]);

  useEffect(() => {
    activeSceneRef.current = selectedSceneId;
  }, [selectedSceneId]);

  const activeScene = SCENE_DEFINITIONS.find((s) => s.id === selectedSceneId) || SCENE_DEFINITIONS[2];

  // Derive effective entity from actual main coat item if available
  const mainItem = items.main;
  const effectiveEntitySlug: EntitySlug =
    mainItem && mainItem.entitySlug !== 'all'
      ? (mainItem.entitySlug as EntitySlug)
      : entitySlug;

  // Strict match against Curated Cultural Draft References
  const liveMatch = matchInspirationGallery(currentItemIds, effectiveEntitySlug, selectedSceneId);

  // Check if existing inspirationResult matches current outfit and scene
  const isResultMatchingCurrent =
    inspirationResult &&
    inspirationResult.sceneId === selectedSceneId &&
    inspirationResult.outfitSummary.entitySlug === effectiveEntitySlug &&
    inspirationResult.outfitSummary.itemCount === currentItemIds.length;

  const handleGenerateInspiration = async () => {
    if (currentItemIds.length === 0) {
      showToast('Vui lòng chọn ít nhất áo chính để xem minh họa bối cảnh.', 'error');
      return;
    }

    const requestedFingerprint = activeFingerprintRef.current;
    const requestedSceneId = activeSceneRef.current;
    setIsLoading(true);

    try {
      const response = await fetch('/api/inspiration-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outfitItemIds: currentItemIds,
          sceneId: requestedSceneId,
          characterPresetId: 'preset-female-editorial-01',
          stylePreset: 'editorial',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Không thể tạo minh họa bối cảnh.');
      }

      // Check for Stale Response: if user changed outfit OR changed scene while waiting
      const isStale =
        activeFingerprintRef.current !== requestedFingerprint ||
        activeSceneRef.current !== requestedSceneId;
      const resultData: InspirationResultData = data.data;

      if (isStale) {
        showToast(
          'Đã lưu kết quả của cấu hình trước vào lịch sử (bạn vừa thay đổi món đồ hoặc bối cảnh).',
          'info'
        );
        setGenerationHistory((prev) => [resultData, ...prev.slice(0, 4)]);
      } else {
        setInspirationResult(resultData);
        setGenerationHistory((prev) => [resultData, ...prev.slice(0, 4)]);
        showToast('Đã hoàn tất bản dựng minh họa bối cảnh vector!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tạo minh họa bối cảnh.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    let promptText = inspirationResult?.prompt;
    if (!promptText) {
      const itemNames = Object.values(items).filter(Boolean).map((i) => i!.name).join(', ');
      promptText = `Full-body editorial fashion photography of a young Vietnamese student standing in an elegant pose, wearing authentic Vietnamese heritage garments: ${itemNames}, set against ${activeScene.name} with ${activeScene.lighting}, cinematic lighting, photorealistic, 8k resolution, authentic cultural details --ar 3:4 --v 6.0`;
    }
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
    showToast('Đã sao chép Prompt AI Hoàn Chỉnh (Midjourney / Gemini)!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* 0. Transparency & Mission Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-stone-900/90 via-[#1c120c]/90 to-stone-900/90 border border-amber-500/35 shadow-lg space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Phòng Trực Quan & Studio Tạo Prompt Nghệ Thuật (AI Prompt & Visualizer Studio)</span>
          </h4>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Vector Mockup + AI Prompt
          </span>
        </div>
        <p className="text-[11px] text-stone-300 leading-relaxed">
          Mô phỏng phối đồ trực quan trên nền kiến trúc di sản + Tạo Prompt AI tiêu chuẩn chuyên biệt cho cổ phục
        </p>
      </div>

      {/* 1. Scene Selector Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-stone-300">
          <span className="font-semibold flex items-center space-x-1.5 text-amber-300">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Chọn Bối Cảnh Không Gian (Scene):</span>
          </span>
          <span className="text-[11px] text-stone-400">Tỷ lệ khung 3:4</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SCENE_DEFINITIONS.map((scene) => {
            const isSelected = scene.id === selectedSceneId;
            return (
              <button
                key={scene.id}
                onClick={() => setSelectedSceneId(scene.id)}
                className={`p-2 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/80 shadow-md shadow-amber-950/30'
                    : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 text-stone-300'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold truncate text-white">
                    {scene.name.split('&')[0].trim()}
                  </div>
                  <div className="text-[10px] text-stone-400 line-clamp-1">
                    {scene.vibe}
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Visualizer Frame: Architectural Backdrop Vector + Transparent Silhouette Canvas */}
      <div className="relative rounded-3xl overflow-hidden border border-stone-800 bg-stone-950 shadow-2xl aspect-[3/4] max-h-[540px] flex items-center justify-center">
        {/* Architectural Vector Scene Backdrop Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {activeScene.id === 'scene-school' && (
            <svg className="w-full h-full object-cover" viewBox="0 0 400 533" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="schoolSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bfdbfe" />
                  <stop offset="40%" stopColor="#fef3c7" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="schoolWall" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#eab308" />
                  <stop offset="50%" stopColor="#ca8a04" />
                  <stop offset="100%" stopColor="#a16207" />
                </linearGradient>
                <linearGradient id="schoolFloor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#78350f" />
                  <stop offset="100%" stopColor="#292524" />
                </linearGradient>
              </defs>
              <rect width="400" height="300" fill="url(#schoolSky)" />
              <polygon points="50,0 200,400 280,400 120,0" fill="#fef08a" opacity="0.15" />
              <rect x="0" y="80" width="400" height="280" fill="url(#schoolWall)" opacity="0.85" />
              <path d="M 20 360 L 20 180 Q 80 120 140 180 L 140 360 Z" fill="#713f12" opacity="0.6" />
              <path d="M 170 360 L 170 180 Q 230 120 290 180 L 290 360 Z" fill="#713f12" opacity="0.6" />
              <path d="M 320 360 L 320 180 Q 380 120 440 180 L 440 360 Z" fill="#713f12" opacity="0.6" />
              <rect x="25" y="190" width="50" height="150" fill="#14532d" opacity="0.8" rx="2" />
              <rect x="85" y="190" width="50" height="150" fill="#14532d" opacity="0.8" rx="2" />
              <circle cx="20" cy="40" r="60" fill="#15803d" opacity="0.4" />
              <circle cx="80" cy="20" r="50" fill="#166534" opacity="0.35" />
              <circle cx="360" cy="50" r="70" fill="#15803d" opacity="0.3" />
              <rect x="0" y="360" width="400" height="173" fill="url(#schoolFloor)" />
              <line x1="0" y1="533" x2="80" y2="360" stroke="#a8a29e" strokeWidth="1" opacity="0.2" />
              <line x1="120" y1="533" x2="160" y2="360" stroke="#a8a29e" strokeWidth="1" opacity="0.2" />
              <line x1="280" y1="533" x2="240" y2="360" stroke="#a8a29e" strokeWidth="1" opacity="0.2" />
              <line x1="400" y1="533" x2="320" y2="360" stroke="#a8a29e" strokeWidth="1" opacity="0.2" />
            </svg>
          )}

          {activeScene.id === 'scene-street' && (
            <svg className="w-full h-full object-cover" viewBox="0 0 400 533" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="streetSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#93c5fd" />
                  <stop offset="60%" stopColor="#e0f2fe" />
                  <stop offset="100%" stopColor="#bae6fd" />
                </linearGradient>
                <linearGradient id="lakeWater" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
              </defs>
              <rect width="400" height="260" fill="url(#streetSky)" />
              <rect x="0" y="240" width="400" height="80" fill="url(#lakeWater)" opacity="0.75" />
              <rect x="185" y="210" width="30" height="32" fill="#475569" opacity="0.6" rx="2" />
              <polygon points="175,210 200,195 225,210" fill="#334155" opacity="0.7" />
              <path d="M 0 100 Q 80 80 120 180" stroke="#16a34a" strokeWidth="18" fill="none" opacity="0.45" strokeLinecap="round" />
              <path d="M 380 90 Q 320 80 290 190" stroke="#16a34a" strokeWidth="22" fill="none" opacity="0.4" strokeLinecap="round" />
              <rect x="0" y="320" width="400" height="213" fill="#334155" />
              <line x1="0" y1="420" x2="400" y2="420" stroke="#64748b" strokeWidth="1.5" opacity="0.3" />
              <line x1="0" y1="470" x2="400" y2="470" stroke="#64748b" strokeWidth="1.5" opacity="0.3" />
              <line x1="80" y1="533" x2="140" y2="320" stroke="#64748b" strokeWidth="1" opacity="0.3" />
              <line x1="320" y1="533" x2="260" y2="320" stroke="#64748b" strokeWidth="1" opacity="0.3" />
            </svg>
          )}

          {activeScene.id === 'scene-studio' && (
            <svg className="w-full h-full object-cover" viewBox="0 0 400 533" preserveAspectRatio="xMidYMid slice">
              <defs>
                <radialGradient id="studioSoftbox" cx="50%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#f5ebe0" stopOpacity="0.7" />
                  <stop offset="85%" stopColor="#d6ccc2" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#b7b7a4" stopOpacity="0.4" />
                </radialGradient>
                <linearGradient id="studioFloor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d6ccc2" />
                  <stop offset="100%" stopColor="#6b705c" />
                </linearGradient>
              </defs>
              <rect width="400" height="380" fill="url(#studioSoftbox)" />
              <rect x="0" y="370" width="400" height="163" fill="url(#studioFloor)" />
              <ellipse cx="200" cy="385" rx="180" ry="16" fill="#4a4e69" opacity="0.15" />
            </svg>
          )}

          {activeScene.id === 'scene-heritage' && (
            <svg className="w-full h-full object-cover" viewBox="0 0 400 533" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="heritageSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7f1d1d" />
                  <stop offset="40%" stopColor="#b45309" />
                  <stop offset="80%" stopColor="#fef08a" />
                </linearGradient>
                <linearGradient id="heritageStone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#57534e" />
                  <stop offset="100%" stopColor="#1c1917" />
                </linearGradient>
              </defs>
              <rect width="400" height="260" fill="url(#heritageSky)" />
              <path d="M 0 160 Q 60 140 120 150 Q 200 135 280 150 Q 340 140 400 160 L 400 200 L 0 200 Z" fill="#450a0a" opacity="0.9" />
              <rect x="30" y="190" width="35" height="170" fill="#991b1b" rx="2" />
              <rect x="335" y="190" width="35" height="170" fill="#991b1b" rx="2" />
              <rect x="0" y="350" width="400" height="183" fill="url(#heritageStone)" />
              <line x1="0" y1="410" x2="400" y2="410" stroke="#78716c" strokeWidth="1.5" opacity="0.4" />
              <line x1="0" y1="470" x2="400" y2="470" stroke="#78716c" strokeWidth="1.5" opacity="0.4" />
              <line x1="60" y1="533" x2="110" y2="350" stroke="#78716c" strokeWidth="1" opacity="0.3" />
              <line x1="200" y1="533" x2="200" y2="350" stroke="#78716c" strokeWidth="1" opacity="0.3" />
              <line x1="340" y1="533" x2="290" y2="350" stroke="#78716c" strokeWidth="1" opacity="0.3" />
            </svg>
          )}
        </div>

        {/* Character Silhouette Composited in Scene (Transparent, No Black Card, No Duplicate Palette) */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-end pb-3">
          {/* Subtle Cast Shadow Under Character */}
          <div className="w-44 h-4 bg-stone-950/45 rounded-full blur-md -mb-3 z-0" />

          {/* Scaled Transparent Canvas */}
          <div className="w-[85%] h-[92%] flex items-center justify-center z-10 pointer-events-auto">
            <CharacterOutfitCanvas
              entitySlug={effectiveEntitySlug}
              items={items}
              instanceId={`scene-${selectedSceneId}`}
            />
          </div>
        </div>

        {/* Top Badges: Disclaimer & Scene Tag */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-stone-950/70 backdrop-blur-md border border-amber-500/30 text-[10px] text-amber-300 font-semibold flex items-center space-x-1.5 shadow-lg">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{activeScene.name}</span>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-stone-950/75 backdrop-blur-md border border-stone-800 text-[10px] text-stone-300 font-medium">
            Minh họa vector — Chưa có ảnh chụp thực tế
          </div>
        </div>

        {/* Bottom Floating Lighting Note */}
        <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
          <div className="p-2 rounded-2xl bg-stone-950/75 backdrop-blur-md border border-stone-800/80 text-[11px] text-stone-300 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{activeScene.lighting}</span>
            </div>
            <span className="text-[10px] font-mono text-stone-400 shrink-0 ml-2">
              {activeScene.timeOfDay.split('(')[0].trim()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Action Bar: Generate / Preview Inspiration & Prompt AI */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={handleGenerateInspiration}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-amber-950/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                <span>Đang kết nối bối cảnh...</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4 text-amber-200" />
                <span>Cập nhật Minh Họa Bối Cảnh</span>
              </>
            )}
          </button>

          {onSaveToLookbookWithScene && (
            <button
              onClick={() =>
                onSaveToLookbookWithScene({
                  sceneId: activeScene.id,
                  sceneName: activeScene.name,
                })
              }
              className="w-full py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-bold border border-stone-800 hover:border-amber-500/40 transition-colors flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span>Lưu bộ đồ kèm bối cảnh</span>
            </button>
          )}
        </div>

        {/* Nút bấm Sao chép Prompt AI Hoàn Chỉnh chuyên dụng */}
        <button
          onClick={handleCopyPrompt}
          className="w-full py-2.5 px-4 rounded-2xl bg-[#1c120c]/90 hover:bg-[#2c1d14] text-[#f5d99f] text-xs font-semibold border border-amber-500/40 hover:border-amber-400 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-black/40 min-h-[42px]"
          title="Sao chép Prompt AI Hoàn Chỉnh chuẩn mực để dùng trên Midjourney, Gemini hoặc DALL-E"
        >
          <Copy className="w-4 h-4 text-amber-400" />
          <span>{copiedPrompt ? 'Đã sao chép prompt vào bộ nhớ tạm!' : 'Sao chép Prompt AI Hoàn Chỉnh (Midjourney / Gemini)'}</span>
        </button>
      </div>

      {/* 4. Cultural Editorial Draft Reference Guidance Card */}
      {liveMatch && (
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-200 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Phác thảo tham khảo tương ứng trong kho:</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                liveMatch.matchType === 'exact'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-stone-800 text-stone-300 border-stone-700'
              }`}
            >
              {liveMatch.matchType === 'exact' ? 'Khớp cấu trúc mẫu' : 'Cảm hứng tương tự'}
            </span>
          </div>

          <p className="text-stone-300 text-[11px] leading-relaxed">
            {liveMatch.entry.aestheticPromptSummary}
          </p>

          {liveMatch.differenceNote && (
            <div className="text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-800/40 rounded-xl p-2">
              <span className="font-semibold">Điểm khác biệt so với bản phối:</span> {liveMatch.differenceNote}
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-800">
            <span>Tình trạng tài sản: <span className="font-mono text-amber-300/90">{liveMatch.entry.assetStatus} (Dự thảo)</span></span>
            <span className="text-stone-500">{liveMatch.entry.disclaimer}</span>
          </div>
        </div>
      )}

      {/* 5. Prompt Transparency & Evidence Grounding Drawer */}
      {inspirationResult && (
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsPromptExpanded((prev) => !prev)}
              className="font-semibold text-stone-300 hover:text-white flex items-center space-x-1.5 cursor-pointer text-left"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Prompt đặc tả tạo hình mỹ thuật đã biên soạn</span>
              {isPromptExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              )}
            </button>

            <button
              onClick={handleCopyPrompt}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedPrompt ? 'Đã chép' : 'Sao chép'}</span>
            </button>
          </div>

          <AnimatePresence>
            {isPromptExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pt-2 border-t border-stone-800"
              >
                <div className="p-2.5 rounded-xl bg-stone-950 font-mono text-[11px] text-stone-300 leading-relaxed border border-stone-800/80 max-h-36 overflow-y-auto">
                  {inspirationResult.prompt}
                </div>
                <div className="flex items-center justify-between text-[10px] text-stone-400">
                  <span>
                    Fingerprint: <span className="font-mono text-amber-300">{inspirationResult.fingerprint}</span>
                  </span>
                  <span>
                    Provider: <span className="font-mono text-stone-300">{inspirationResult.provider} (Chưa cấu hình sinh ảnh live)</span>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 6. Stale Request & History Section */}
      {generationHistory.length > 1 && (
        <div className="rounded-2xl border border-stone-800/80 bg-stone-950/40 p-3 space-y-2 text-xs">
          <div className="text-stone-400 font-semibold flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>Lịch sử các bản dựng bối cảnh gần đây:</span>
          </div>

          <div className="space-y-1.5">
            {generationHistory.slice(1, 4).map((entry, index) => (
              <div
                key={entry.fingerprint + index}
                className="p-2 rounded-xl bg-stone-900/40 border border-stone-800 flex items-center justify-between text-[11px]"
              >
                <div className="space-y-0.5 truncate mr-2">
                  <div className="font-medium text-stone-300 truncate">
                    {entry.sceneName} — {entry.outfitSummary.itemNames.join(', ')}
                  </div>
                  <div className="text-[10px] text-stone-500 font-mono">
                    {new Date(entry.timestamp).toLocaleTimeString('vi-VN')} • Mã: {entry.fingerprint}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-400 text-[10px] shrink-0">
                  Bản trước
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
