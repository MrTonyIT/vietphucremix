import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import {
  Sparkles,
  BookOpen,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Info,
  Filter,
  Bookmark,
  RotateCcw,
  Palette,
  Calendar,
  Sparkle,
  Check,
  Lock,
  Unlock,
  MessageSquare,
  Scale,
  X,
  Camera,
  Users,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { OutfitVisualizer } from './components/OutfitVisualizer';
import { InspirationResultData } from './components/InspirationSceneVisualizer';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { CandidateOutfit } from './components/RecommendationsModal';
import { ChatAssistant } from './components/ChatAssistant';
import { ShopeeSearchButton } from './components/ShopeeSearchButton';
import { UIBackground } from './components/UIBackground';
import { UserAuthHeader } from './components/UserAuthHeader';
import { useAuth } from './firebase/AuthContext';
import {
  CatalogItem,
  CultureContext,
  EntityDisplayData,
  EntitySlug,
  EventType,
  OutfitAction,
  OutfitRecipe,
  SlotLabels,
  SlotType,
  STYLE_OPTIONS,
  GenderType,
  AgeGroupType,
  GENDER_OPTIONS,
  AGE_GROUP_OPTIONS,
} from './types/fashion';
import {
  getSavedLookbooks,
  LookbookEntry,
  resolveLookbookItems,
  saveLookbookEntry,
  deleteLookbookEntry,
  LOOKBOOK_STORAGE_KEY,
} from './utils/lookbookStorage';
import { getOutfitFingerprint, validateOutfit } from './utils/outfitValidator';
import {
  playSilkChime,
  playSaveSound,
  playLockSound,
  isSoundEnabled,
  setSoundEnabled,
} from './utils/soundEffects';
import { CULTURE_CONTEXTS } from './data/catalog';

// Code-split modals and optional features for faster initial bundle load
const SlotSwapModal = React.lazy(() =>
  import('./components/SlotSwapModal').then((m) => ({ default: m.SlotSwapModal }))
);
const LookbookModal = React.lazy(() =>
  import('./components/LookbookModal').then((m) => ({ default: m.LookbookModal }))
);
const CompareModal = React.lazy(() =>
  import('./components/CompareModal').then((m) => ({ default: m.CompareModal }))
);
const RecommendationsModal = React.lazy(() =>
  import('./components/RecommendationsModal').then((m) => ({ default: m.RecommendationsModal }))
);
const CatalogModal = React.lazy(() =>
  import('./components/CatalogModal').then((m) => ({ default: m.CatalogModal }))
);
const InspirationSceneVisualizer = React.lazy(() =>
  import('./components/InspirationSceneVisualizer').then((m) => ({ default: m.InspirationSceneVisualizer }))
);

export default function App() {
  // Main State
  const [selectedSlug, setSelectedSlug] = useState<EntitySlug>('ao-dai');
  const [recipes, setRecipes] = useState<OutfitRecipe[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [currentItems, setCurrentItems] = useState<Partial<Record<SlotType, CatalogItem>>>({});
  const [lockedSlots, setLockedSlots] = useState<SlotType[]>([]);
  const [culture, setCulture] = useState<CultureContext | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Request generation ref to cancel stale async responses
  const requestSeqRef = useRef<number>(0);

  // Criteria Filters for Builder
  const [selectedEvent, setSelectedEvent] = useState<EventType>('KY_YEU');
  const [preferredColor, setPreferredColor] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<GenderType>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroupType>('thanh_nien');

  // Firebase Authentication & Cloud Sync
  const { user, cloudLookbooks, saveLookbookToCloud, deleteLookbookFromCloud } = useAuth();

  // Cloud Lookbook synchronization
  useEffect(() => {
    if (user && cloudLookbooks.length > 0) {
      const local = getSavedLookbooks();
      const map = new Map<string, LookbookEntry>();
      local.forEach((e) => map.set(e.id, e));
      cloudLookbooks.forEach((e) => map.set(e.id, e));
      const merged = Array.from(map.values());
      localStorage.setItem(LOOKBOOK_STORAGE_KEY, JSON.stringify(merged));
      setLookbookEntries(merged);
    }
  }, [user, cloudLookbooks]);

  // Modals & Drawers
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);
  const [swapModalSlot, setSwapModalSlot] = useState<SlotType | null>(null);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [showLookbookModal, setShowLookbookModal] = useState<boolean>(false);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [lookbookEntries, setLookbookEntries] = useState<LookbookEntry[]>([]);
  const [showRecModal, setShowRecModal] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<CandidateOutfit[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [visualizerMode, setVisualizerMode] = useState<'mockup' | 'inspiration'>('mockup');
  const [selectedSceneId, setSelectedSceneId] = useState<string>('scene-studio');
  const [inspirationResult, setInspirationResult] = useState<InspirationResultData | null>(null);
  const [generationHistory, setGenerationHistory] = useState<InspirationResultData[]>([]);

  // Toast Feedback State with Robust Timer Management
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synthetic Web Audio state
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());
  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      playSilkChime();
      showToast('Đã bật hiệu ứng âm thanh ngũ cung', 'info');
    } else {
      showToast('Đã tắt hiệu ứng âm thanh', 'info');
    }
  };

  const showToast = useCallback(
    (text: string, type: 'success' | 'error' | 'info' = 'success', durationMs?: number) => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
      setToastMessage({ text, type });
      const duration = durationMs ?? (type === 'error' ? 5500 : 3500);
      toastTimerRef.current = setTimeout(() => {
        setToastMessage(null);
        toastTimerRef.current = null;
      }, duration);
    },
    []
  );

  // Current Outfit Fingerprint & IDs
  const currentItemIds = Object.values(currentItems)
    .filter((item): item is CatalogItem => !!item)
    .map((item) => item.id);
  const currentFingerprint = getOutfitFingerprint(currentItemIds);

  const lockedItemIds = currentItemIds.filter((id) => {
    const item = catalogItems.find((c) => c.id === id);
    return item && lockedSlots.includes(item.slot);
  });

  // Initial Data Load
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setApiError(null);
      try {
        const [outfitsRes, catalogRes] = await Promise.all([
          fetch('/api/outfits/default'),
          fetch('/api/catalog'),
        ]);

        if (!outfitsRes.ok || !catalogRes.ok) {
          throw new Error('Không thể kết nối đến máy chủ API Việt Phục Remix');
        }

        const outfitsData = await outfitsRes.json();
        const catalogData = await catalogRes.json();

        if (outfitsData.success && outfitsData.recipes) {
          setRecipes(outfitsData.recipes);
          const currentRecipe =
            outfitsData.recipes.find((r: any) => r.entitySlug === selectedSlug) ||
            outfitsData.recipes[0];

          if (currentRecipe) {
            setCurrentItems(currentRecipe.items);
            setCulture(currentRecipe.culture);
          }
        }

        if (catalogData.success && catalogData.items) {
          setCatalogItems(catalogData.items);
        }

        // Load lookbooks
        setLookbookEntries(getSavedLookbooks());
      } catch (err: any) {
        console.error('Fetch error:', err);
        setApiError(err.message || 'Lỗi kết nối API');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /**
   * Commit chung authoritative cho mọi nguồn apply outfit (Chọn nhóm, Reset, Swap, Recommendation, Lookbook, Chat Action).
   */
  const applyOutfitCommit = (
    incomingItems: Partial<Record<SlotType, CatalogItem>>,
    options: {
      targetEntitySlug?: EntitySlug;
      sourceDesc: string;
      skipLockPreservation?: boolean;
      suppressSuccessToast?: boolean;
    }
  ): { success: boolean; error?: string } => {
    try {
      // 1. Conflict check for locked items belonging to a different entity
      if (!options.skipLockPreservation && lockedSlots.length > 0) {
        const targetEntity = options.targetEntitySlug || incomingItems.main?.entitySlug;
        const conflictingLockedItems = lockedSlots
          .map((s) => currentItems[s])
          .filter(
            (item): item is CatalogItem =>
              !!item &&
              item.entitySlug !== 'all' &&
              !!targetEntity &&
              targetEntity !== 'all' &&
              item.entitySlug !== targetEntity
          );

        if (conflictingLockedItems.length > 0) {
          const names = conflictingLockedItems.map((i) => `"${i.name}"`).join(', ');
          const err = `Xung đột khóa vị trí: Món ${names} đang được khóa cố định thuộc nhóm khác. Vui lòng mở khóa trước khi đổi sang ${
            EntityDisplayData[targetEntity as EntitySlug]?.name || targetEntity
          }.`;
          showToast(err, 'error');
          return { success: false, error: err };
        }
      }

      // 2. Build candidate merged map while preserving locked slots
      const mergedItems: Partial<Record<SlotType, CatalogItem>> = { ...incomingItems };
      if (!options.skipLockPreservation && lockedSlots.length > 0) {
        for (const slot of lockedSlots) {
          if (currentItems[slot]) {
            mergedItems[slot] = currentItems[slot];
          }
        }
      }

      // 3. Determine active entity from main item
      const mainItem = mergedItems.main;
      if (!mainItem) {
        const err = 'Trang phục thiếu áo chính định hình phom dáng, không thể hoàn tất.';
        showToast(err, 'error');
        return { success: false, error: err };
      }

      const activeEntity: EntitySlug =
        options.targetEntitySlug ||
        (mainItem.entitySlug !== 'all' ? (mainItem.entitySlug as EntitySlug) : selectedSlug);

      // 4. Validate raw item IDs
      const rawItemIds = Object.values(mergedItems)
        .filter((item): item is CatalogItem => !!item)
        .map((i) => i.id);

      const validation = validateOutfit(rawItemIds, activeEntity);
      if (!validation.isValid) {
        const err = `Bộ đồ không đạt chuẩn cấu trúc: ${validation.errors.join('; ')}`;
        showToast(err, 'error');
        return { success: false, error: err };
      }

      // 5. Update state atomically
      setCurrentItems(mergedItems);
      setSelectedSlug(activeEntity);

      // Culture context
      const foundCulture = CULTURE_CONTEXTS[activeEntity] || null;
      setCulture(foundCulture);

      playSilkChime();

      if (!options.suppressSuccessToast) {
        showToast(`Đã áp dụng ${options.sourceDesc} thành công!`, 'success');
      }

      return { success: true };
    } catch (e: any) {
      console.error('applyOutfitCommit error:', e);
      const err = e.message || 'Lỗi áp dụng trang phục';
      showToast(err, 'error');
      return { success: false, error: err };
    }
  };

  // Switch Entity Group
  const handleSelectGroup = (slug: EntitySlug) => {
    requestSeqRef.current += 1;
    const targetRecipe = recipes.find((r) => r.entitySlug === slug);
    if (!targetRecipe) return;

    const itemsMap: Partial<Record<SlotType, CatalogItem>> = {};
    for (const [slot, itemId] of Object.entries(targetRecipe.defaultItemIds)) {
      const item = catalogItems.find((c) => c.id === itemId);
      if (item) itemsMap[slot as SlotType] = item;
    }

    applyOutfitCommit(itemsMap, {
      targetEntitySlug: slug,
      sourceDesc: `nhóm ${EntityDisplayData[slug].name}`,
      skipLockPreservation: false,
    });
  };

  // Reset to default recipe
  const handleResetOutfit = () => {
    requestSeqRef.current += 1;
    const targetRecipe = recipes.find((r) => r.entitySlug === selectedSlug);
    if (!targetRecipe) return;

    const itemsMap: Partial<Record<SlotType, CatalogItem>> = {};
    for (const [slot, itemId] of Object.entries(targetRecipe.defaultItemIds)) {
      const item = catalogItems.find((c) => c.id === itemId);
      if (item) itemsMap[slot as SlotType] = item;
    }

    applyOutfitCommit(itemsMap, {
      targetEntitySlug: selectedSlug,
      sourceDesc: `bộ gốc ${EntityDisplayData[selectedSlug].name}`,
      skipLockPreservation: true,
    });
  };

  // Apply predefined recipe from Preset Bar
  const handleApplyRecipe = (recipe: OutfitRecipe) => {
    const itemsMap: Partial<Record<SlotType, CatalogItem>> = {};
    for (const [slot, itemId] of Object.entries(recipe.defaultItemIds)) {
      const item = catalogItems.find((c) => c.id === itemId);
      if (item) itemsMap[slot as SlotType] = item;
    }
    setSelectedSlug(recipe.entitySlug);
    applyOutfitCommit(itemsMap, {
      targetEntitySlug: recipe.entitySlug,
      sourceDesc: `bộ phối "${recipe.recipeName}"`,
      skipLockPreservation: true,
    });
  };

  // Single-slot Swap
  const handleSwapItem = async (newItem: CatalogItem) => {
    if (!swapModalSlot) return;
    const slotToSwap = swapModalSlot;
    const seq = ++requestSeqRef.current;
    setIsSwapping(true);

    try {
      if (lockedSlots.includes(slotToSwap)) {
        showToast(`Vị trí ${SlotLabels[slotToSwap].vi} đang bị khóa, hãy mở khóa trước khi đổi`, 'error');
        return;
      }

      const res = await fetch('/api/swap-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentItemIds,
          newItemId: newItem.id,
          targetSlot: slotToSwap,
          lockedItemIds,
        }),
      });

      const data = await res.json();

      if (seq !== requestSeqRef.current) {
        return; // stale request
      }

      if (!res.ok || !data.success) {
        showToast(data.error || 'Không thể đổi món đồ này', 'error');
        return;
      }

      const updatedMap: Partial<Record<SlotType, CatalogItem>> = {
        ...currentItems,
        [slotToSwap]: newItem,
      };

      const result = applyOutfitCommit(updatedMap, {
        sourceDesc: `món "${newItem.name}"`,
        skipLockPreservation: false,
      });

      if (result.success) {
        setSwapModalSlot(null);
      }
    } catch (err: any) {
      if (seq === requestSeqRef.current) {
        showToast(err.message || 'Lỗi khi gọi API đổi món', 'error');
      }
    } finally {
      if (seq === requestSeqRef.current) {
        setIsSwapping(false);
      }
    }
  };

  // Toggle Slot Lock
  const toggleLockSlot = (slot: SlotType, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setLockedSlots((prev) => {
      const isLocked = prev.includes(slot);
      playLockSound(!isLocked);
      const next = isLocked ? prev.filter((s) => s !== slot) : [...prev, slot];
      const slotName = SlotLabels[slot]?.vi || slot;
      showToast(
        isLocked
          ? `Đã mở khóa vị trí ${slotName}`
          : `Đã khóa cố định vị trí ${slotName} (AI sẽ giữ nguyên món này)`,
        'info'
      );
      return next;
    });
  };

  // Fetch Heuristic Recommendations
  const handleFetchRecommendations = async () => {
    const seq = ++requestSeqRef.current;
    setIsLoadingRecs(true);

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentItemIds,
          event: selectedEvent,
          preferredEntitySlug: selectedSlug,
          preferredColor,
          style: selectedStyle,
          lockedItemIds,
          gender: selectedGender,
          ageGroup: selectedAgeGroup,
        }),
      });

      const data = await res.json();

      if (seq !== requestSeqRef.current) {
        return; // stale request
      }

      if (!res.ok || !data.success) {
        showToast(data.error || 'Không thể tải danh sách gợi ý', 'error');
        return;
      }

      setCandidates(data.candidates || []);
      setShowRecModal(true);
    } catch (err: any) {
      if (seq === requestSeqRef.current) {
        showToast(err.message || 'Lỗi kết nối khi lấy gợi ý', 'error');
      }
    } finally {
      if (seq === requestSeqRef.current) {
        setIsLoadingRecs(false);
      }
    }
  };

  // Apply Candidate from Recommendations
  const handleApplyCandidate = (candidate: CandidateOutfit) => {
    const result = applyOutfitCommit(candidate.items, {
      targetEntitySlug: candidate.entitySlug,
      sourceDesc: `bộ phối gợi ý "${candidate.recipeName}"`,
      skipLockPreservation: false,
    });

    if (result.success) {
      setShowRecModal(false);
    }
  };

  // Save to Lookbook
  const handleSaveToLookbook = (
    customName?: string,
    sceneContext?: { sceneId: string; sceneName: string }
  ) => {
    const itemsList = Object.values(currentItems).filter(
      (item): item is CatalogItem => !!item
    );
    if (itemsList.length === 0) {
      showToast('Bộ đồ hiện tại chưa có món nào để lưu', 'error');
      return;
    }

    const effectiveScene =
      sceneContext ||
      (visualizerMode === 'inspiration' && inspirationResult
        ? {
            sceneId: inspirationResult.sceneId,
            sceneName: inspirationResult.sceneName,
          }
        : undefined);

    const defaultName = effectiveScene
      ? `${EntityDisplayData[selectedSlug].name} Remix - Bối Cảnh`
      : `${EntityDisplayData[selectedSlug].name} Remix (${itemsList.length} món)`;

    const saved = saveLookbookEntry({
      name: customName || defaultName,
      entitySlug: selectedSlug,
      itemIds: itemsList.map((i) => i.id),
      colorHarmony: `${currentItems.main?.colorName || 'Đa sắc'} phối cùng ${
        currentItems.lower?.colorName || 'hài hòa'
      }`,
      ...effectiveScene,
      version: 2,
    });

    if (saved.success && saved.entry) {
      playSaveSound();
      if (user) {
        saveLookbookToCloud(saved.entry);
      }
      setLookbookEntries(getSavedLookbooks());
      showToast(
        user
          ? 'Đã lưu bộ đồ vào Lookbook & Đồng bộ Cloud Firestore!'
          : effectiveScene
          ? 'Đã lưu bộ đồ kèm thông tin bối cảnh vào Lookbook!'
          : 'Đã lưu bộ đồ vào Lookbook thành công!',
        'success'
      );
    } else {
      showToast('Bộ nhớ trình duyệt đã đầy hoặc không thể lưu Lookbook', 'error');
    }
  };

  // Apply Lookbook Entry
  const handleApplyLookbook = (entry: LookbookEntry) => {
    const resolution = resolveLookbookItems(entry.itemIds, entry.entitySlug);

    if (resolution.missingRequiredSlots.length > 0) {
      const missingLabels = resolution.missingRequiredSlots
        .map((s) => SlotLabels[s]?.vi || s)
        .join(', ');
      showToast(
        `Không thể mặc bộ này: Thiếu món bắt buộc trong catalog (${missingLabels}).`,
        'error',
        6000
      );
      return;
    }

    const result = applyOutfitCommit(resolution.items, {
      targetEntitySlug: entry.entitySlug,
      sourceDesc: `bộ Lookbook "${entry.name}"`,
      skipLockPreservation: false,
      suppressSuccessToast: resolution.missingOptionalSlots.length > 0,
    });

    if (result.success) {
      if (resolution.missingOptionalSlots.length > 0) {
        const optLabels = resolution.missingOptionalSlots
          .map((s) => SlotLabels[s]?.vi || s)
          .join(', ');
        showToast(
          `Đã khôi phục các món hợp lệ. Lưu ý: Thiếu món tùy chọn (${optLabels}).`,
          'info',
          6000
        );
      }
      setShowLookbookModal(false);
      setShowCompareModal(false);
    }
  };

  // Delete Lookbook Entry
  const handleDeleteLookbook = (id: string) => {
    const success = deleteLookbookEntry(id);
    if (success) {
      if (user) {
        deleteLookbookFromCloud(id);
      }
      setLookbookEntries(getSavedLookbooks());
      showToast('Đã xóa bộ phối khỏi Lookbook', 'info');
    } else {
      showToast('Không thể xóa bộ phối', 'error');
    }
  };

  // Chat Action Execution
  const handleApplyAction = async (action: OutfitAction): Promise<boolean> => {
    if (action.type === 'SWAP_ITEM' && action.targetSlot && action.newItemId) {
      const newItem = catalogItems.find((c) => c.id === action.newItemId);
      if (!newItem) {
        showToast('Mã món đồ đề xuất không tồn tại trong catalog', 'error');
        return false;
      }
      if (lockedSlots.includes(action.targetSlot)) {
        showToast(
          `Vị trí ${SlotLabels[action.targetSlot].vi} đang bị khóa, hãy mở khóa trước`,
          'error'
        );
        return false;
      }

      const updatedMap = {
        ...currentItems,
        [action.targetSlot]: newItem,
      };

      const res = applyOutfitCommit(updatedMap, {
        sourceDesc: `món "${newItem.name}" từ gợi ý AI`,
        skipLockPreservation: false,
      });
      return res.success;
    } else if (action.type === 'APPLY_OUTFIT' && action.candidateItemIds) {
      const itemsMap: Partial<Record<SlotType, CatalogItem>> = {};
      action.candidateItemIds.forEach((id: string) => {
        const it = catalogItems.find((c) => c.id === id);
        if (it) itemsMap[it.slot] = it;
      });

      const res = applyOutfitCommit(itemsMap, {
        targetEntitySlug: selectedSlug,
        sourceDesc: 'bộ phối đề xuất từ Trợ lý AI',
        skipLockPreservation: false,
      });
      return res.success;
    }
    return false;
  };

  const allSlots: SlotType[] = ['main', 'lower', 'inner', 'headwear', 'footwear', 'accessory'];

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen text-stone-100 flex flex-col font-sans selection:bg-[#cba369]/30 selection:text-[#f5d99f] overflow-x-hidden relative bg-transparent">
        {/* Official Artwork Background (PC Landscape & Mobile Portrait) */}
        <UIBackground />

        {/* Toast Notification Floating Banner */}
        {toastMessage && (
          <div
            role="status"
            aria-live={toastMessage.type === 'error' ? 'assertive' : 'polite'}
            className="fixed bottom-6 right-4 sm:bottom-auto sm:top-6 sm:right-6 z-[80] animate-in slide-in-from-bottom sm:slide-in-from-top-3 fade-in duration-200 max-w-sm sm:max-w-md"
          >
            <div
              className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-medium ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200 shadow-emerald-950/50'
                  : toastMessage.type === 'error'
                  ? 'bg-rose-950/95 border-rose-500/50 text-rose-200 shadow-rose-950/50'
                  : 'bg-[#18120d]/95 border-[#cba369]/40 text-[#f5d99f] shadow-black/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                {toastMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : toastMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-[#d4af37] shrink-0" />
                )}
                <span>{toastMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                aria-label="Đóng thông báo"
                className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Top Header - Synchronized with Heritage Artwork */}
        <header className="border-b border-[#cba369]/30 bg-[#140e0a]/85 backdrop-blur-xl sticky top-0 z-40 shadow-xl shadow-black/50">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
            {/* Brand Logo & Title */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#9b3424] via-[#b84034] to-[#cba369] flex items-center justify-center shadow-lg shadow-black/40 ring-1 ring-[#cba369]/40 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#fdf8f0]" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-serif leading-tight">
                  Việt Phục Remix
                </h1>
                <p className="text-[11px] sm:text-xs text-[#e5ceb5] hidden sm:block">
                  Mặc chất Gen Z — Hiểu đúng Việt phục
                </p>
              </div>
            </div>

            {/* Header Actions - Zero Overflow with responsive compact labels */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-end">
              {/* Sound Toggle Button */}
              <button
                type="button"
                onClick={handleToggleSound}
                className="min-h-[42px] sm:min-h-[44px] px-2 sm:px-2.5 rounded-xl bg-[#241a13]/85 hover:bg-[#322319] border border-[#cba369]/35 text-xs font-semibold text-[#f5d99f] transition-colors flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
                title={soundOn ? 'Âm thanh ngũ cung đang bật (nhấp để tắt)' : 'Âm thanh đang tắt (nhấp để bật)'}
                aria-label={soundOn ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
              >
                {soundOn ? (
                  <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <VolumeX className="w-4 h-4 text-stone-500 shrink-0" />
                )}
                <span className="hidden lg:inline text-[11px] text-stone-300">
                  {soundOn ? 'Âm thanh' : 'Tắt âm'}
                </span>
              </button>

              {/* Google Auth / Profile Sync */}
              <UserAuthHeader />

              {/* Compare Button */}
              <button
                type="button"
                onClick={() => setShowCompareModal(true)}
                className="min-h-[42px] sm:min-h-[44px] px-2.5 sm:px-3 rounded-xl bg-[#241a13]/85 hover:bg-[#322319] border border-[#cba369]/35 text-xs font-semibold text-[#f5d99f] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                title="So sánh đối chiếu 2 bộ phối trong Lookbook"
                aria-label={`So sánh Lookbook (${lookbookEntries.length} bộ)`}
              >
                <Scale className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span className="hidden min-[380px]:inline">So Sánh</span>
                <span className="text-[11px] font-mono">({lookbookEntries.length})</span>
              </button>

              {/* Chat Assistant Toggle Button in Header */}
              <button
                type="button"
                onClick={() => setIsChatOpen((prev) => !prev)}
                className="min-h-[42px] sm:min-h-[44px] px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-[#9b3424]/40 via-[#b84034]/40 to-[#cba369]/30 hover:from-[#b84034]/60 hover:to-[#cba369]/50 border border-[#cba369]/45 text-xs font-semibold text-[#fdf8f0] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                aria-label="Mở Trợ lý AI"
              >
                <MessageSquare className="w-4 h-4 text-[#f5d99f] shrink-0" />
                <span className="hidden min-[380px]:inline">Trợ lý</span>
                <span>AI</span>
              </button>

              {/* Lookbook Button */}
              <button
                type="button"
                onClick={() => setShowLookbookModal(true)}
                className="min-h-[42px] sm:min-h-[44px] px-2.5 sm:px-3 rounded-xl bg-[#241a13]/85 hover:bg-[#322319] border border-[#cba369]/35 text-xs font-semibold text-[#f5d99f] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                aria-label={`Mở Lookbook (${lookbookEntries.length} bộ)`}
              >
                <Bookmark className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span className="hidden min-[380px]:inline">Lookbook</span>
                <span className="text-[11px] font-mono">({lookbookEntries.length})</span>
              </button>

              {/* Catalog Button */}
              <button
                type="button"
                onClick={() => setShowCatalogModal(true)}
                className="min-h-[42px] sm:min-h-[44px] px-2.5 sm:px-3 rounded-xl bg-[#241a13]/85 hover:bg-[#322319] border border-[#cba369]/30 text-xs font-medium text-[#e5ceb5] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                aria-label="Mở Thư Viện Catalog"
              >
                <Layers className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span className="hidden min-[380px]:inline">Catalog</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Unified Dashboard with bottom padding for mobile drawer clearance */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 space-y-6 pb-28 sm:pb-20">
          {/* Error notification */}
          {apiError && (
            <div className="rounded-2xl bg-rose-950/40 border border-rose-800/60 p-4 flex items-start space-x-3 text-rose-200">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold">Lưu ý kết nối:</span> {apiError}.
              </div>
            </div>
          )}

          {/* Builder Filter Bar */}
          <section className="bg-[#16110d]/75 backdrop-blur-md border border-[#cba369]/30 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#cba369]/20 pb-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[#d4af37]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white font-serif">
                  Bộ Điều Khiển Phối Đồ
                </h2>
              </div>
              <div className="text-xs text-[#d5c3aa] flex items-center space-x-2">
                <span>Khóa vị trí để cố định món đồ khi AI tư vấn</span>
                {lockedSlots.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#cba369]/20 text-[#f5d99f] text-[10px] font-mono border border-[#cba369]/40">
                    Đang khóa {lockedSlots.length} vị trí
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
              {/* 1. Event Selector */}
              <div className="space-y-1.5">
                <label
                  htmlFor="builder-event-select"
                  className="text-xs text-[#e5ceb5] font-medium flex items-center space-x-1 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Bối cảnh:</span>
                </label>
                <select
                  id="builder-event-select"
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value as EventType)}
                  className="w-full min-h-[44px] bg-[#100b08]/90 border border-[#cba369]/30 rounded-xl px-2.5 py-2 text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] cursor-pointer"
                >
                  <option value="KY_YEU">🎓 Chụp Kỷ Yếu</option>
                  <option value="LE_HOI_TRUONG">🏮 Lễ Hội Trường</option>
                  <option value="CHUP_ANH_NGHE_THUAT">📸 Ảnh Nghệ Thuật</option>
                  <option value="DAO_PHO">☕ Dạo Phố</option>
                </select>
              </div>

              {/* 2. Entity Group Selector */}
              <div className="space-y-1.5">
                <span className="text-xs text-[#e5ceb5] font-medium block">Nhóm áo chính:</span>
                <div className="grid grid-cols-3 gap-1 bg-[#100b08]/90 p-1 rounded-xl border border-[#cba369]/30" role="tablist">
                  {(['ao-dai', 'ngu-than', 'tu-than'] as EntitySlug[]).map((slug) => (
                    <button
                      key={slug}
                      type="button"
                      role="tab"
                      aria-selected={selectedSlug === slug}
                      onClick={() => handleSelectGroup(slug)}
                      className={`min-h-[42px] py-1 px-1 rounded-lg text-xs font-medium transition-all text-center cursor-pointer flex items-center justify-center ${
                        selectedSlug === slug
                          ? 'bg-[#cba369]/30 text-[#f5d99f] font-semibold border border-[#d4af37]/45'
                          : 'text-[#d5c3aa] hover:text-white'
                      }`}
                    >
                      {slug === 'ao-dai' ? 'Áo Dài' : slug === 'ngu-than' ? 'Ngũ Thân' : 'Tứ Thân'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Gender Selector */}
              <div className="space-y-1.5">
                <label
                  htmlFor="builder-gender-select"
                  className="text-xs text-[#e5ceb5] font-medium flex items-center space-x-1 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Giới tính:</span>
                </label>
                <select
                  id="builder-gender-select"
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value as GenderType)}
                  className="w-full min-h-[44px] bg-[#100b08]/90 border border-[#cba369]/30 rounded-xl px-2.5 py-2 text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] cursor-pointer"
                >
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.vi}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Age Group Selector */}
              <div className="space-y-1.5">
                <label
                  htmlFor="builder-age-select"
                  className="text-xs text-[#e5ceb5] font-medium flex items-center space-x-1 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Độ tuổi:</span>
                </label>
                <select
                  id="builder-age-select"
                  value={selectedAgeGroup}
                  onChange={(e) => setSelectedAgeGroup(e.target.value as AgeGroupType)}
                  className="w-full min-h-[44px] bg-[#100b08]/90 border border-[#cba369]/30 rounded-xl px-2.5 py-2 text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] cursor-pointer"
                >
                  {AGE_GROUP_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.vi}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Style Preference Selector */}
              <div className="space-y-1.5">
                <label
                  htmlFor="builder-style-select"
                  className="text-xs text-[#e5ceb5] font-medium flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Phong cách:</span>
                </label>
                <select
                  id="builder-style-select"
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full min-h-[44px] bg-[#100b08]/90 border border-[#cba369]/30 rounded-xl px-2.5 py-2 text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] cursor-pointer"
                >
                  {STYLE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id === 'all' ? '' : opt.id}>
                      {opt.vi}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. Preferred Color Palette */}
              <div className="space-y-1.5">
                <label
                  htmlFor="builder-color-select"
                  className="text-xs text-[#e5ceb5] font-medium flex items-center space-x-1 cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Tông màu:</span>
                </label>
                <select
                  id="builder-color-select"
                  value={preferredColor}
                  onChange={(e) => setPreferredColor(e.target.value)}
                  className="w-full min-h-[44px] bg-[#100b08]/90 border border-[#cba369]/30 rounded-xl px-2.5 py-2 text-xs text-[#f5efe6] focus:outline-none focus:border-[#d4af37] cursor-pointer"
                >
                  <option value="">Tất cả bảng màu</option>
                  <option value="trang">Trắng Ngọc Trai / Kem</option>
                  <option value="xanh">Xanh Cẩm Thạch / Lam</option>
                  <option value="hong">Hồng Phấn Pastel</option>
                  <option value="vang">Vàng Tơ Tằm / Hổ Phách</option>
                  <option value="nau">Nâu Trầm Củ Nâu</option>
                  <option value="do">Đỏ Mận / Đỏ Thắm</option>
                </select>
              </div>

              {/* 7. Action: Gợi ý bộ phối */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <button
                  type="button"
                  onClick={handleFetchRecommendations}
                  disabled={isLoadingRecs}
                  className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-gradient-to-r from-[#9b3424] via-[#b84034] to-[#c89b3c] hover:from-[#b84034] hover:to-[#d4af37] text-white text-xs font-bold shadow-lg shadow-black/40 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#f5d99f]" />
                  <span>{isLoadingRecs ? 'Đang lọc...' : 'Gợi Ý Bộ Phối'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Preset Recipes Showcase Bar (16 Curated Complete Outfits with 1-Click Try-on & Shopee Links) */}
          <section className="bg-[#16110d]/75 backdrop-blur-md border border-[#cba369]/30 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cba369]/20 pb-2.5">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-serif">
                  Khám Phá Nhanh Bộ Phối Tiêu Biểu ({recipes.length} Bộ Mẫu Sẵn)
                </h3>
              </div>
              <span className="text-xs text-[#d5c3aa]">
                Thử đồ 1 chạm • Tự động gắn đủ các vị trí • Mua sắm Shopee tham khảo
              </span>
            </div>

            {/* Horizontal Scrollable Carousel */}
            <div className="flex items-stretch space-x-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-stone-800">
              {recipes.map((rec) => {
                const mainItemId = rec.defaultItemIds.main;
                const mainItem = catalogItems.find((c) => c.id === mainItemId);
                const display = EntityDisplayData[rec.entitySlug];

                return (
                  <div
                    key={rec.id}
                    className="min-w-[260px] sm:min-w-[280px] max-w-[300px] bg-[#100b08]/85 border border-[#cba369]/25 hover:border-[#d4af37]/60 rounded-2xl p-3.5 flex flex-col justify-between transition-all shrink-0 hover:shadow-lg hover:shadow-black/40 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 text-[11px] mb-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-[#cba369]/20 text-[#f5d99f] font-medium border border-[#cba369]/35">
                          {display?.name || rec.entitySlug}
                        </span>
                        <span className="text-[#d4af37] font-bold font-mono">
                          {rec.matchScore}% điểm
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white group-hover:text-[#f5d99f] transition-colors line-clamp-1">
                        {rec.recipeName}
                      </h4>

                      <p className="text-[11px] text-[#dfd3c3] line-clamp-2 mt-1 leading-relaxed">
                        {rec.description}
                      </p>

                      <div className="mt-2 text-[10px] text-[#cba369] italic truncate">
                        {rec.colorHarmony}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#cba369]/20 mt-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleApplyRecipe(rec)}
                          className="flex-1 min-h-[38px] px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#9b3424] to-[#c89b3c] hover:from-[#b84034] hover:to-[#d4af37] text-white text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-sm active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Mặc thử ngay</span>
                        </button>
                      </div>

                      {mainItem && (
                        <div className="flex justify-end">
                          <ShopeeSearchButton itemName={mainItem.name} compact variant="badge" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Workspace: Visualizer + Slots Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Visualizer & Actions (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Mode Switcher: 2D Mockup vs Inspiration Scene */}
              <div className="flex items-center p-1 rounded-2xl bg-[#16110d]/75 backdrop-blur-md border border-[#cba369]/30 shadow-md">
                <button
                  type="button"
                  onClick={() => setVisualizerMode('mockup')}
                  className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    visualizerMode === 'mockup'
                      ? 'bg-[#cba369]/30 text-[#f5d99f] border border-[#d4af37]/50 shadow-sm'
                      : 'text-[#d5c3aa] hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Bản Phối 2D (Chi Tiết)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVisualizerMode('inspiration')}
                  className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    visualizerMode === 'inspiration'
                      ? 'bg-gradient-to-r from-[#9b3424]/40 to-[#c89b3c]/40 text-[#f5d99f] border border-[#d4af37]/50 shadow-sm'
                      : 'text-[#d5c3aa] hover:text-white'
                  }`}
                  title="Phòng Trực Quan & Studio Tạo Prompt Nghệ Thuật (AI Prompt & Visualizer Studio)"
                >
                  <Camera className="w-4 h-4 text-[#d4af37]" />
                  <span>Studio Bối Cảnh & Prompt AI</span>
                </button>
              </div>

              {visualizerMode === 'mockup' ? (
                <>
                  <div className="bg-[#100b08]/70 backdrop-blur-md rounded-3xl p-2 border border-[#cba369]/30 shadow-2xl">
                    <OutfitVisualizer
                      entitySlug={selectedSlug}
                      items={currentItems}
                      gender={selectedGender}
                      ageGroup={selectedAgeGroup}
                    />
                  </div>

                  {/* Action Bar Under Visualizer */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveToLookbook()}
                      className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-[#cba369]/25 hover:bg-[#d4af37] hover:text-[#100b08] text-[#f5d99f] text-xs font-bold border border-[#cba369]/45 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-black/30"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Lưu bộ đồ</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetOutfit}
                      className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-[#1b140f]/90 hover:bg-[#281d16] text-[#e5ceb5] text-xs font-medium border border-[#cba369]/25 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-[#d5c3aa]" />
                      <span>Khôi phục bộ gốc</span>
                    </button>
                  </div>
                </>
              ) : (
                <Suspense fallback={<div className="h-[460px] flex items-center justify-center text-xs text-stone-400">Đang tải không gian bối cảnh...</div>}>
                  <InspirationSceneVisualizer
                    entitySlug={selectedSlug}
                    items={currentItems}
                    selectedSceneId={selectedSceneId}
                    setSelectedSceneId={setSelectedSceneId}
                    inspirationResult={inspirationResult}
                    setInspirationResult={setInspirationResult}
                    generationHistory={generationHistory}
                    setGenerationHistory={setGenerationHistory}
                    onSaveToLookbookWithScene={({ sceneId, sceneName }) => {
                      handleSaveToLookbook(undefined, { sceneId, sceneName });
                    }}
                    showToast={showToast}
                  />
                </Suspense>
              )}
            </div>

            {/* Right Column: Interactive Slot Controls & Culture Card (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
                  <Sparkle className="w-4 h-4 text-amber-400" />
                  <span>Chi Tiết Từng Vị Trí Trang Phục (6 Slots)</span>
                </h3>
                <span className="text-xs text-stone-300">
                  {Object.values(currentItems).filter(Boolean).length}/6 món đã trang bị
                </span>
              </div>

              {/* Slot Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {allSlots.map((slot) => {
                  const item = currentItems[slot];
                  const slotMeta = SlotLabels[slot];
                  const activeRecipe = recipes.find((r) => r.entitySlug === selectedSlug);
                  const isRequired = activeRecipe?.requiredSlots.includes(slot);
                  const isLocked = lockedSlots.includes(slot);

                  return (
                    <div
                      key={slot}
                      className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                        isLocked
                          ? 'bg-[#281a12]/85 border-[#d4af37]/60 shadow-xl ring-1 ring-[#d4af37]/40'
                          : item
                          ? 'bg-[#16110d]/75 backdrop-blur-md border-[#cba369]/25 hover:border-[#cba369]/50 shadow-lg'
                          : 'bg-[#100b08]/50 border-[#cba369]/15 border-dashed opacity-80'
                      }`}
                    >
                      {/* Top Row: Slot label + Lock button */}
                      <div className="flex items-center justify-between border-b border-[#cba369]/20 pb-2.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-[#f5efe6]">
                            {slotMeta.vi}
                          </span>
                          {isRequired ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#9b3424]/30 text-[#fca5a5] border border-[#b84034]/40 font-medium">
                              Bắt buộc
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#d5c3aa]">Tùy chọn</span>
                          )}
                        </div>

                        {/* Independent Lock Control */}
                        <button
                          type="button"
                          onClick={(e) => toggleLockSlot(slot, e)}
                          aria-label={isLocked ? `Mở khóa vị trí ${slotMeta.vi}` : `Khóa vị trí ${slotMeta.vi}`}
                          aria-pressed={isLocked}
                          className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            isLocked
                              ? 'bg-[#cba369]/30 text-[#f5d99f] border border-[#d4af37]/50 shadow-sm'
                              : 'bg-[#221811]/80 hover:bg-[#302218] text-[#d5c3aa] hover:text-white'
                          }`}
                          title={isLocked ? 'Nhấn để mở khóa vị trí này' : 'Nhấn để khóa cố định vị trí này'}
                        >
                          {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Content Row */}
                      {item ? (
                        <div className="mt-2.5 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-white line-clamp-1">
                                {item.name}
                              </h4>
                              <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-[#cba369]/40 shadow-sm"
                                  style={{ backgroundColor: item.hexColor }}
                                  title={item.colorName}
                                />
                                <span className="text-[10px] text-[#d5c3aa] font-mono">
                                  {item.sku}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-[#dfd3c3] line-clamp-2 leading-relaxed mt-1">
                              {item.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#cba369]/20 flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center space-x-1.5">
                              {item.isModern && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 font-semibold border border-purple-700/50">
                                  Remix
                                </span>
                              )}
                              <span className="text-[11px] text-[#d5c3aa]">
                                {item.colorName}
                              </span>
                            </div>

                            {/* Independent Swap Action Button */}
                            <button
                              type="button"
                              onClick={() => setSwapModalSlot(slot)}
                              aria-label={`Đổi món vị trí ${slotMeta.vi}`}
                              className="min-h-[42px] px-3 py-1.5 rounded-xl bg-[#cba369]/20 hover:bg-[#cba369]/35 border border-[#cba369]/35 text-xs font-semibold text-[#f5d99f] transition-colors flex items-center space-x-1 cursor-pointer"
                            >
                              <span>Đổi món</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="pt-1.5 flex justify-end">
                            <ShopeeSearchButton itemName={item.name} compact variant="badge" />
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 py-4 flex-1 flex flex-col justify-between items-start space-y-3">
                          <span className="text-xs text-[#d5c3aa] italic">Chưa trang bị</span>
                          <button
                            type="button"
                            onClick={() => setSwapModalSlot(slot)}
                            aria-label={`Thêm món cho vị trí ${slotMeta.vi}`}
                            className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#221811] hover:bg-[#b84034] hover:text-white text-[#f5d99f] text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <span>+ Thêm món</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Sourced Culture Context Card */}
              <AnimatePresence mode="wait">
                {culture && (
                  <motion.div
                    key={culture.entitySlug}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="rounded-3xl bg-[#16110d]/90 backdrop-blur-xl border border-[#cba369]/30 p-6 space-y-4 shadow-2xl"
                  >
                    <div className="flex items-center justify-between border-b border-[#cba369]/25 pb-3">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-[#d4af37]" />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white font-serif">
                          Ngữ Cảnh Văn Hóa & Đối Chiếu
                        </h4>
                      </div>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border flex items-center space-x-1 ${
                          culture.reviewStatus === 'REVIEWED'
                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-600/50'
                            : 'bg-amber-950/50 text-amber-300 border-amber-600/50'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        {culture.reviewStatus === 'REVIEWED' ? 'Đã Đối Chiếu Tài Liệu' : 'Cần Rà Soát Thêm'}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm">
                      {/* Sourced Fact */}
                      <div className="bg-[#0f0b08]/80 p-3.5 rounded-2xl border border-[#cba369]/25">
                        <div className="flex items-center space-x-2 text-[#d4af37] font-semibold text-xs mb-1">
                          <span className="px-1.5 py-0.5 rounded bg-[#cba369]/25 text-[#f5d99f] text-[10px] font-mono">
                            SOURCED_FACT
                          </span>
                          <span>Tri Thức Cổ Phục Có Nguồn</span>
                        </div>
                        <p className="text-[#f5efe6] text-xs sm:text-sm leading-relaxed">
                          {culture.sourcedFact}
                        </p>
                        <div className="mt-2 text-[11px] text-[#d5c3aa] flex items-center space-x-1">
                          <span>Nguồn:</span>
                          <span className="text-[#f5d99f] italic">{culture.referenceSource}</span>
                        </div>
                      </div>

                      {/* Styling Note */}
                      <div className="bg-[#0f0b08]/80 p-3.5 rounded-2xl border border-[#cba369]/25">
                        <div className="flex items-center space-x-2 text-purple-400 font-semibold text-xs mb-1">
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono">
                            STYLING_NOTE
                          </span>
                          <span>Gợi Ý Styling Hiện Đại (Remix)</span>
                        </div>
                        <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                          {culture.stylingNote}
                        </p>
                      </div>

                      {/* Caution */}
                      <div className="bg-amber-950/20 p-3.5 rounded-2xl border border-amber-800/30">
                        <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs mb-1">
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                            CAUTION
                          </span>
                          <span>Lưu Ý Bối Cảnh Học Đường</span>
                        </div>
                        <p className="text-amber-200/90 text-xs sm:text-sm leading-relaxed">
                          {culture.caution}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Floating Chat Assistant Drawer */}
        <ChatAssistant
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen((prev) => !prev)}
          currentItemIds={currentItemIds}
          entitySlug={selectedSlug}
          event={selectedEvent}
          stylePreferences={selectedStyle ? [selectedStyle] : []}
          preferredColor={preferredColor}
          lockedItemIds={lockedItemIds}
          currentFingerprint={currentFingerprint}
          gender={selectedGender}
          ageGroup={selectedAgeGroup}
          onApplyAction={handleApplyAction}
        />

        {/* Modals with Code-Splitting Suspense */}
        <Suspense fallback={null}>
          {swapModalSlot && (
            <SlotSwapModal
              isOpen={!!swapModalSlot}
              onClose={() => setSwapModalSlot(null)}
              slot={swapModalSlot}
              entitySlug={selectedSlug}
              currentItem={currentItems[swapModalSlot]}
              catalogItems={catalogItems}
              onSelectNewItem={handleSwapItem}
              isSwapping={isSwapping}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {showLookbookModal && (
            <LookbookModal
              isOpen={showLookbookModal}
              onClose={() => setShowLookbookModal(false)}
              entries={lookbookEntries}
              onApplyOutfit={handleApplyLookbook}
              onDeleteEntry={handleDeleteLookbook}
              onOpenCompare={() => setShowCompareModal(true)}
              onRefreshEntries={() => setLookbookEntries(getSavedLookbooks())}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {showCompareModal && (
            <CompareModal
              isOpen={showCompareModal}
              onClose={() => setShowCompareModal(false)}
              lookbookEntries={lookbookEntries}
              onRefreshEntries={() => setLookbookEntries(getSavedLookbooks())}
              onApplyOutfit={handleApplyLookbook}
              recipes={recipes}
              defaultContext={{
                event: selectedEvent,
                style: selectedStyle,
                preferredColor,
              }}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {showRecModal && (
            <RecommendationsModal
              isOpen={showRecModal}
              onClose={() => setShowRecModal(false)}
              candidates={candidates}
              onApplyCandidate={handleApplyCandidate}
              criteria={{
                event: selectedEvent,
                style: selectedStyle,
                preferredColor,
              }}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {showCatalogModal && (
            <CatalogModal
              isOpen={showCatalogModal}
              onClose={() => setShowCatalogModal(false)}
              catalogItems={catalogItems}
            />
          )}
        </Suspense>

        {/* Footer */}
        <footer className="border-t border-[#cba369]/30 bg-[#100b08]/90 backdrop-blur-md py-6 mt-12 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#d5c3aa]">
            <div>
              <span className="text-white font-semibold">Việt Phục Remix</span> — Nền tảng thời trang học sinh, sinh viên.
            </div>
            <div className="flex items-center space-x-4">
              <span>Model: <code className="text-[#f5d99f] font-mono">models/gemini-3.8-flash</code></span>
              <span>•</span>
              <span>Schema v1.0</span>
              <span>•</span>
              <span className="text-[#d4af37] font-medium">Bảo Tồn & Sáng Tạo Di Sản</span>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
