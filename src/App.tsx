import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import {
  Sparkles,
  BookOpen,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
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
  Sun,
  Moon,
  HelpCircle,
  Coins,
  Award,
  Crown,
} from 'lucide-react';
import { OutfitVisualizer, CharacterOutfitCanvas } from './components/OutfitVisualizer';
import { OutfitAuraPanel } from './components/OutfitAuraPanel';
import { InspirationResultData } from './components/InspirationSceneVisualizer';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { CandidateOutfit } from './components/RecommendationsModal';
import { ChatAssistant } from './components/ChatAssistant';
import { ShopeeSearchButton } from './components/ShopeeSearchButton';
import { UIBackground } from './components/UIBackground';
import { UserAuthHeader } from './components/UserAuthHeader';
import { HeritageAudioPlayer } from './components/HeritageAudioPlayer';
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
const QuickGuideModal = React.lazy(() =>
  import('./components/QuickGuideModal').then((m) => ({ default: m.QuickGuideModal }))
);
const GroupCoordinatorModal = React.lazy(() =>
  import('./components/GroupCoordinatorModal').then((m) => ({ default: m.GroupCoordinatorModal }))
);
const BudgetEstimatorModal = React.lazy(() =>
  import('./components/BudgetEstimatorModal').then((m) => ({ default: m.BudgetEstimatorModal }))
);
const HeritageQuizModal = React.lazy(() =>
  import('./components/HeritageQuizModal').then((m) => ({ default: m.HeritageQuizModal }))
);
const ExportOutfitModal = React.lazy(() =>
  import('./components/ExportOutfitModal').then((m) => ({ default: m.ExportOutfitModal }))
);
const FengShuiAnalyzerModal = React.lazy(() =>
  import('./components/FengShuiAnalyzerModal').then((m) => ({ default: m.FengShuiAnalyzerModal }))
);
const HeritageSpotRadarModal = React.lazy(() =>
  import('./components/HeritageSpotRadarModal').then((m) => ({ default: m.HeritageSpotRadarModal }))
);
const PoseGuideModal = React.lazy(() =>
  import('./components/PoseGuideModal').then((m) => ({ default: m.PoseGuideModal }))
);
const DynastyTimelineModal = React.lazy(() =>
  import('./components/DynastyTimelineModal').then((m) => ({ default: m.DynastyTimelineModal }))
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

  // Quick Guide Modal (Show on first visit or user manual trigger)
  const [showQuickGuide, setShowQuickGuide] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('vietphuc_onboarded_v1');
    } catch {
      return false;
    }
  });

  // Modals & Drawers
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);
  const [swapModalSlot, setSwapModalSlot] = useState<SlotType | null>(null);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [showLookbookModal, setShowLookbookModal] = useState<boolean>(false);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [showGroupModal, setShowGroupModal] = useState<boolean>(false);
  const [showBudgetModal, setShowBudgetModal] = useState<boolean>(false);
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showFengShuiModal, setShowFengShuiModal] = useState<boolean>(false);
  const [showSpotRadarModal, setShowSpotRadarModal] = useState<boolean>(false);
  const [showPoseGuideModal, setShowPoseGuideModal] = useState<boolean>(false);
  const [showDynastyModal, setShowDynastyModal] = useState<boolean>(false);
  const [isHeritageMenuOpen, setIsHeritageMenuOpen] = useState<boolean>(false);
  const [mainView, setMainView] = useState<'studio' | 'recipes' | 'heritage'>('studio');
  const [recipeFilterSlug, setRecipeFilterSlug] = useState<EntitySlug | 'all'>('all');

  // Chuyển chế độ hiển thị mượt mà và cuộn lên đầu trang
  const switchView = useCallback((view: 'studio' | 'recipes' | 'heritage') => {
    setMainView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const view = sectionId === 'bo-mau-san' ? 'recipes' : sectionId === 'bach-khoa-di-san' ? 'heritage' : 'studio';
    setMainView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const [lookbookEntries, setLookbookEntries] = useState<LookbookEntry[]>([]);
  const [showRecModal, setShowRecModal] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<CandidateOutfit[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [visualizerMode, setVisualizerMode] = useState<'mockup' | 'inspiration'>('mockup');
  const [selectedSceneId, setSelectedSceneId] = useState<string>('scene-studio');
  const [inspirationResult, setInspirationResult] = useState<InspirationResultData | null>(null);
  const [generationHistory, setGenerationHistory] = useState<InspirationResultData[]>([]);

  // Handler áp dụng bộ đồ từ Phối Đôi/Nhóm hoặc Trắc Nghiệm
  const handleApplyCustomOutfit = (
    newItems: Partial<Record<SlotType, CatalogItem>>,
    entitySlug: EntitySlug,
    gender: GenderType
  ) => {
    setSelectedSlug(entitySlug);
    if (gender !== 'all') {
      setSelectedGender(gender);
    }
    setCurrentItems(newItems);
    setLockedSlots([]);
    scrollToSection('phong-phoi-do');
    showToast(`Đã áp dụng thành công bộ đồ vào bàn làm việc!`, 'success');
  };

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

  // Theme State (Light / Dark Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('vietphuc_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch {}
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    }
    try {
      localStorage.setItem('vietphuc_theme', theme);
    } catch {}
  }, [theme]);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (soundOn) {
      playSilkChime();
    }
    showToast(
      next === 'light'
        ? 'Đã chuyển sang chế độ Sáng — Phù hợp môi trường nhiều ánh sáng'
        : 'Đã chuyển sang chế độ Tối — Dịu mắt, phù hợp môi trường ban đêm',
      'info'
    );
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
          throw new Error('Không thể kết nối đến máy chủ API Việt Y Tân Sắc');
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
    scrollToSection('phong-phoi-do');
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
    scrollToSection('phong-phoi-do');
  };

  // Apply predefined recipe from Preset Bar
  const handleApplyRecipe = (recipe: OutfitRecipe) => {
    const itemsMap: Partial<Record<SlotType, CatalogItem>> = {};
    if (recipe.items && Object.keys(recipe.items).length > 0) {
      Object.assign(itemsMap, recipe.items);
    } else if (recipe.defaultItemIds) {
      for (const [slot, itemId] of Object.entries(recipe.defaultItemIds)) {
        const item = catalogItems.find((c) => c.id === itemId);
        if (item) itemsMap[slot as SlotType] = item;
      }
    }
    setSelectedSlug(recipe.entitySlug);
    applyOutfitCommit(itemsMap, {
      targetEntitySlug: recipe.entitySlug,
      sourceDesc: `bộ phối "${recipe.recipeName}"`,
      skipLockPreservation: true,
    });
    switchView('studio');
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
      <div className={`min-h-screen flex flex-col font-sans selection:bg-[#cba369]/30 selection:text-[#f5d99f] overflow-x-hidden relative bg-transparent transition-colors duration-250 ${theme === 'light' ? 'text-[#21160e]' : 'text-stone-100'}`}>
        {/* Official Artwork Background (PC Landscape & Mobile Portrait) */}
        <UIBackground theme={theme} />

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
                  Việt Y Tân Sắc
                </h1>
                <p className="text-[11px] sm:text-xs text-[#e5ceb5] hidden sm:block">
                  Mặc chất Gen Z — Hiểu đúng Cổ phục
                </p>
              </div>
            </div>

            {/* Center Navigation Tabs: Phòng Phối Đồ | Bộ Mẫu Sẵn | Bách Khoa Di Sản */}
            <nav className="flex items-center p-1 rounded-2xl bg-[#1b130e]/95 border border-[#cba369]/35 shadow-inner order-last md:order-none w-full md:w-auto justify-center">
              <button
                type="button"
                onClick={() => switchView('studio')}
                className={`min-h-[38px] py-1.5 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  mainView === 'studio'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md border border-amber-400/50'
                    : 'text-[#d5c3aa] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>👘</span>
                <span>Phòng Phối Đồ</span>
              </button>

              <button
                type="button"
                onClick={() => switchView('recipes')}
                className={`min-h-[38px] py-1.5 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  mainView === 'recipes'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md border border-amber-400/50'
                    : 'text-[#d5c3aa] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>✨</span>
                <span>Bộ Mẫu Sẵn</span>
                <span className="text-[10px] opacity-75 font-mono">({recipes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => switchView('heritage')}
                className={`min-h-[38px] py-1.5 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  mainView === 'heritage'
                    ? 'bg-gradient-to-r from-purple-800 to-amber-700 text-white shadow-md border border-amber-400/50'
                    : 'text-[#d5c3aa] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>🏛️</span>
                <span>Bách Khoa Di Sản</span>
              </button>
            </nav>

            {/* Header Actions - Balanced, spacious, and uncluttered */}
            <div className="flex items-center gap-1.5 sm:gap-2 justify-end">

              {/* 2. Thư viện Catalog */}
              <button
                type="button"
                onClick={() => setShowCatalogModal(true)}
                className="min-h-[42px] px-3 rounded-xl bg-[#241a13]/85 hover:bg-[#322319] border border-[#cba369]/35 text-xs font-medium text-[#e5ceb5] transition-colors hidden md:flex items-center space-x-1.5 cursor-pointer shadow-sm"
                aria-label="Mở Thư Viện Catalog"
              >
                <Layers className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>Catalog</span>
              </button>

              {/* 3. Lookbook Button */}
              <button
                type="button"
                onClick={() => setShowLookbookModal(true)}
                className="min-h-[42px] px-3 rounded-xl bg-[#241a13]/85 hover:bg-[#322319] border border-[#cba369]/35 text-xs font-semibold text-[#f5d99f] transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
                aria-label={`Mở Lookbook (${lookbookEntries.length} bộ)`}
              >
                <Bookmark className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span className="hidden sm:inline">Lookbook</span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-400/30">
                  {lookbookEntries.length}
                </span>
              </button>

              {/* 4. Highlight Action: Xuất Thẻ & PDF */}
              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="min-h-[42px] px-3 sm:px-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-[#cba369] hover:brightness-110 text-stone-950 font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer shadow-md shadow-amber-900/30"
                title="Xuất bản phối ra thẻ danh thiếp (Ảnh 4K) hoặc file PDF ngoại tuyến"
              >
                <Crown className="w-4 h-4 text-stone-900 shrink-0" />
                <span className="hidden sm:inline">Xuất Thẻ</span>
                <span className="text-[10px] bg-stone-900/20 px-1 py-0.5 rounded text-stone-950 font-mono font-extrabold">
                  PDF
                </span>
              </button>

              {/* 5. Trợ lý AI */}
              <button
                type="button"
                onClick={() => setIsChatOpen((prev) => !prev)}
                className="min-h-[42px] px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-[#9b3424]/50 via-[#b84034]/50 to-[#cba369]/30 hover:from-[#b84034]/70 hover:to-[#cba369]/50 border border-[#cba369]/40 text-xs font-semibold text-white transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
                aria-label="Mở Trợ lý AI"
              >
                <MessageSquare className="w-4 h-4 text-[#f5d99f] shrink-0" />
                <span className="hidden min-[520px]:inline">Trợ Lý AI</span>
              </button>

              {/* 6. Google Auth / Cloud Sync */}
              <UserAuthHeader />

              {/* 7. Settings Control Cluster: [Âm thanh + Theme + Hướng dẫn] gom thành 1 pill thanh lịch */}
              <div className="flex items-center bg-[#20150f]/90 border border-[#cba369]/30 rounded-xl p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className="p-2 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-[#2b1c14] transition-colors"
                  title={soundOn ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
                  aria-label="Âm thanh"
                >
                  {soundOn ? (
                    <Volume2 className="w-4 h-4 text-amber-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-stone-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleToggleTheme}
                  className="p-2 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-[#2b1c14] transition-colors"
                  title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
                  aria-label="Giao diện"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-300" />
                  ) : (
                    <Moon className="w-4 h-4 text-amber-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowQuickGuide(true)}
                  className="p-2 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-[#2b1c14] transition-colors"
                  title="Mở hướng dẫn nhanh"
                  aria-label="Hướng dẫn"
                >
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                </button>
              </div>
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

          {/* PHÂN VÙNG 1: PHÒNG PHỐI ĐỒ (Studio & Hình ảnh đồ đã phối) */}
          {mainView === 'studio' && (
            <div id="phong-phoi-do" className="space-y-6 animate-in fade-in duration-200">
            {/* Builder Customization Bar - Refined, Spacious, Uncluttered */}
            <section className="bg-[#16110d]/85 backdrop-blur-md border border-[#cba369]/30 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cba369]/20 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white font-serif">
                        Bộ Điều Khiển Phối Đồ
                      </h2>
                      <p className="text-xs text-[#d5c3aa]">
                        Tùy biến tiêu chí nhân vật, phom dáng và bảng màu truyền thống
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    {lockedSlots.length > 0 && (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-200 text-xs font-medium border border-amber-400/30 flex items-center space-x-1">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Khóa {lockedSlots.length} vị trí</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowFengShuiModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#261912] hover:bg-[#382419] border border-amber-500/40 text-amber-200 font-semibold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
                      title="Chấm điểm ngũ hành và tương sinh cho bộ đồ hiện tại"
                    >
                      <span>☯️</span>
                      <span className="hidden sm:inline">Chấm Phong Thủy</span>
                      <span className="sm:hidden">Phong Thủy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection('bach-khoa-di-san')}
                      className="px-3 py-1.5 rounded-xl bg-[#1b1420] hover:bg-[#2a1e32] border border-purple-500/40 text-purple-200 font-semibold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
                      title="Mở Bách Khoa Di Sản & Các Tiện Ích"
                    >
                      <span>🏛️</span>
                      <span className="hidden sm:inline">Bách Khoa Di Sản</span>
                    </button>
                  </div>
                </div>

                {/* Tầng 1: Định hình Nhân vật & Phom dáng (3 Cột Rộng Rãi, Cân Đối) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* 1. Nhóm cổ phục chính (Segmented tabs) */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-amber-200/90 font-medium block">
                      Phom dáng trang phục:
                    </span>
                    <div
                      className="grid grid-cols-3 gap-1 bg-[#100b08]/90 p-1 rounded-xl border border-[#cba369]/35 min-h-[44px] items-center"
                      role="tablist"
                    >
                      {(['ao-dai', 'ngu-than', 'tu-than'] as EntitySlug[]).map((slug) => (
                        <button
                          key={slug}
                          type="button"
                          role="tab"
                          aria-selected={selectedSlug === slug}
                          onClick={() => handleSelectGroup(slug)}
                          className={`h-[36px] py-1 px-1.5 rounded-lg text-xs font-medium transition-all text-center cursor-pointer flex items-center justify-center ${
                            selectedSlug === slug
                              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold border border-amber-400/60 shadow-sm'
                              : 'text-[#d5c3aa] hover:text-white hover:bg-[#1a120d]'
                          }`}
                        >
                          {slug === 'ao-dai' ? 'Áo Dài' : slug === 'ngu-than' ? 'Ngũ Thân' : 'Tứ Thân'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Đối tượng mặc */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="builder-gender-select"
                      className="text-xs text-amber-200/90 font-medium flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>Đối tượng mặc:</span>
                    </label>
                    <select
                      id="builder-gender-select"
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value as GenderType)}
                      className="w-full min-h-[44px] bg-[#100b08]/90 border border-[#cba369]/35 hover:border-amber-400 rounded-xl px-3 py-2 text-xs text-[#f5efe6] focus:outline-none focus:border-amber-400 cursor-pointer transition-colors shadow-inner"
                    >
                      {GENDER_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.vi}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Độ tuổi nhân vật */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="builder-age-select"
                      className="text-xs text-amber-200/90 font-medium flex items-center space-x-1.5 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>Độ tuổi nhân vật:</span>
                    </label>
                    <select
                      id="builder-age-select"
                      value={selectedAgeGroup}
                      onChange={(e) => setSelectedAgeGroup(e.target.value as AgeGroupType)}
                      className="w-full min-h-[44px] bg-[#100b08]/90 border border-[#cba369]/35 hover:border-amber-400 rounded-xl px-3 py-2 text-xs text-[#f5efe6] focus:outline-none focus:border-amber-400 cursor-pointer transition-colors shadow-inner"
                    >
                      {AGE_GROUP_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.vi}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tầng 2: Bối cảnh, Hòa sắc & Gợi ý AI (4 Cột Rộng Rãi, Cân Đối) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-3.5 border-t border-[#cba369]/20 items-end">
                  {/* 4. Bối cảnh xuất hiện (Chụp kỷ yếu, Lễ hội, v.v.) */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="builder-event-select"
                      className="text-xs text-amber-200/90 font-medium flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Bối cảnh xuất hiện:</span>
                    </label>
                    <select
                      id="builder-event-select"
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value as EventType)}
                      className="w-full min-h-[44px] bg-[#100b08]/90 border border-[#cba369]/35 hover:border-amber-400 rounded-xl px-3 py-2 text-xs text-[#f5efe6] focus:outline-none focus:border-amber-400 cursor-pointer transition-colors shadow-inner"
                    >
                      <option value="KY_YEU">🎓 Chụp Kỷ Yếu Học Đường</option>
                      <option value="LE_HOI_TRUONG">🏮 Lễ Hội & Sự Kiện Cổ Phong</option>
                      <option value="CHUP_ANH_NGHE_THUAT">📸 Bộ Ảnh Nghệ Thuật Di Sản</option>
                      <option value="DAO_PHO">☕ Dạo Phố & Check-in Cuối Tuần</option>
                    </select>
                  </div>

                  {/* 5. Bảng màu chủ đạo */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="builder-color-select"
                      className="text-xs text-amber-200/90 font-medium flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      <span>Bảng màu chủ đạo:</span>
                    </label>
                    <select
                      id="builder-color-select"
                      value={preferredColor}
                      onChange={(e) => setPreferredColor(e.target.value)}
                      className="w-full min-h-[44px] bg-[#100b08]/90 border border-[#cba369]/35 hover:border-amber-400 rounded-xl px-3 py-2 text-xs text-[#f5efe6] focus:outline-none focus:border-amber-400 cursor-pointer transition-colors shadow-inner"
                    >
                      <option value="">Tất cả bảng màu truyền thống</option>
                      <option value="trang">Trắng Bạch Ngọc / Kem Ngà</option>
                      <option value="xanh">Xanh Cẩm Thạch / Lam Sẫm</option>
                      <option value="hong">Hồng Phấn Pastel (Remix Trẻ)</option>
                      <option value="vang">Vàng Hoàng Yến / Hổ Phách</option>
                      <option value="nau">Nâu Sồng / Sa Thạch Mộc Mạc</option>
                      <option value="do">Đỏ Chu Sa / Đỏ Thắm Mận</option>
                    </select>
                  </div>

                  {/* 6. Định hướng phong cách */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="builder-style-select"
                      className="text-xs text-amber-200/90 font-medium flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Định hướng phong cách:</span>
                    </label>
                    <select
                      id="builder-style-select"
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full min-h-[44px] bg-[#100b08]/90 border border-[#cba369]/35 hover:border-amber-400 rounded-xl px-3 py-2 text-xs text-[#f5efe6] focus:outline-none focus:border-amber-400 cursor-pointer transition-colors shadow-inner"
                    >
                      {STYLE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id === 'all' ? '' : opt.id}>
                          {opt.vi}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 7. Action: Gợi ý AI */}
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={handleFetchRecommendations}
                      disabled={isLoadingRecs}
                      className="w-full min-h-[44px] py-2 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-900/40 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01]"
                    >
                      <Sparkles className="w-4 h-4 text-stone-900" />
                      <span>{isLoadingRecs ? 'Đang phân tích...' : 'Gợi Ý Phối Đồ AI'}</span>
                    </button>
                  </div>
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
                  <div className="space-y-2">
                    {/* Primary Button: Xuất Thẻ Danh Thiếp Thời Trang & PDF */}
                    <button
                      type="button"
                      onClick={() => setShowExportModal(true)}
                      className="w-full min-h-[46px] py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#cba369] hover:brightness-110 text-stone-950 text-xs font-bold shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      title="Xuất bộ phối ra thẻ danh thiếp thời trang (ảnh 4K) hoặc tài liệu PDF ngoại tuyến"
                    >
                      <Crown className="w-4 h-4 text-stone-900" />
                      <span>Xuất Thẻ Danh Thiếp Thời Trang (Ảnh 4K / File PDF)</span>
                    </button>

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

              {/* Bảng Hòa Sắc & Giám Định Khí Chất Cổ Phong (Lấp đầy không gian bên trái cực chất) */}
              <OutfitAuraPanel
                entitySlug={selectedSlug}
                items={currentItems}
                onOpenFengShui={() => setShowFengShuiModal(true)}
                onOpenSpotRadar={() => setShowSpotRadarModal(true)}
                onOpenPoseGuide={() => setShowPoseGuideModal(true)}
              />
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
                        <div className="flex items-center space-x-1.5 text-[#d4af37] font-semibold text-xs mb-1">
                          <span>📜</span>
                          <span>Tri Thức Cổ Phục Chính Thống</span>
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
                        <div className="flex items-center space-x-1.5 text-purple-400 font-semibold text-xs mb-1">
                          <span>✨</span>
                          <span>Gợi Ý Styling Hiện Đại (Remix)</span>
                        </div>
                        <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                          {culture.stylingNote}
                        </p>
                      </div>

                      {/* Caution */}
                      <div className="bg-amber-950/20 p-3.5 rounded-2xl border border-amber-800/30">
                        <div className="flex items-center space-x-1.5 text-amber-400 font-semibold text-xs mb-1">
                          <span>⚠️</span>
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

            {/* Quick Navigation Gateways to other views */}
            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => switchView('recipes')}
                className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#201510] to-[#140e0a] border border-[#cba369]/30 hover:border-amber-400/60 transition-all shadow-xl cursor-pointer group flex items-center justify-between gap-4 text-left"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-amber-300 font-serif font-bold text-sm sm:text-base">
                    <span className="text-xl">✨</span>
                    <span>Khám Phá 16 Bộ Mẫu Sẵn (Xem Hình Phối Đồ)</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Khám phá 16 bản phối mẫu cung đình và đương đại, chiêm ngưỡng hình ảnh đồ đã phối trực quan và mặc thử 1-chạm.
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 group-hover:translate-x-1 transition-transform">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => switchView('heritage')}
                className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#201510] to-[#140e0a] border border-[#cba369]/30 hover:border-amber-400/60 transition-all shadow-xl cursor-pointer group flex items-center justify-between gap-4 text-left"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-amber-300 font-serif font-bold text-sm sm:text-base">
                    <span className="text-xl">🏛️</span>
                    <span>Mở Bách Khoa Di Sản & 8 Tiện Ích</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    8 công cụ văn hóa: Phong thủy ngũ hành, radar check-in di tích, cẩm nang dáng chụp, dự toán chi phí.
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 group-hover:translate-x-1 transition-transform">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            </div>
          </div>
        )}

      {/* PHÂN VÙNG 2: BÁCH KHOA CỔ PHONG & TIỆN ÍCH DI SẢN */}
      {mainView === 'heritage' && (
        <section id="bach-khoa-di-san" className="space-y-6 animate-in fade-in duration-300">
          {/* Top Navigation & Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#16110d]/85 backdrop-blur-md border border-[#cba369]/30 rounded-3xl p-5 sm:p-6 shadow-2xl">
            <div>
              <button
                type="button"
                onClick={() => switchView('studio')}
                className="text-xs text-amber-300 hover:text-white flex items-center space-x-1 mb-2 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Quay Lại Phòng Phối Đồ</span>
              </button>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white font-serif flex items-center space-x-2.5">
                <span className="text-2xl">🏛️</span>
                <span>Bách Khoa Cổ Phong & Tiện Ích Di Sản</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#d5c3aa] mt-1 max-w-2xl leading-relaxed">
                Kho tàng tri thức lịch sử, phong thủy ngũ hành, cẩm nang tạo dáng và tọa độ di tích 3 miền dành cho học sinh, sinh viên và người yêu cổ phục Việt Nam.
              </p>
            </div>

            <button
              type="button"
              onClick={() => switchView('studio')}
              className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <span>👘</span>
              <span>Lên Phòng Phối Đồ</span>
            </button>
          </div>

          {/* 8 Spacious Heritage Cards Grid (Spacious, balanced, calm) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Phong Thủy */}
            <div className="p-5 rounded-3xl bg-gradient-to-b from-[#221711] to-[#18100b] border border-[#cba369]/30 hover:border-amber-400/60 transition-all shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-900/50 border border-amber-500/30 flex items-center justify-center text-xl text-amber-300">
                  ☯️
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    Luận Giải Phong Thủy
                  </h3>
                  <p className="text-xs text-amber-200/80 font-medium">
                    Ngũ hành & Lời chúc vượng khí
                  </p>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Tra cứu Nạp Âm Can-Chi theo năm sinh, chấm điểm độ tương sinh của bảng màu áo chính, hạ y và phụ kiện đang mặc.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFengShuiModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-700/80 to-amber-800/80 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs border border-amber-400/40 transition-all flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Mở Luận Giải Ngũ Hành</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2: Radar Tọa Độ */}
            <div className="p-5 rounded-3xl bg-gradient-to-b from-[#221711] to-[#18100b] border border-[#cba369]/30 hover:border-amber-400/60 transition-all shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center text-xl text-emerald-300">
                  🗺️
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    Radar Tọa Độ Check-in
                  </h3>
                  <p className="text-xs text-emerald-200/80 font-medium">
                    Di tích, giờ vàng & quy định 3 miền
                  </p>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Danh bạ các bối cảnh lịch sử đẹp nhất tại Hà Nội, Huế, Hội An, Sài Gòn... tự động đề xuất nơi hòa hợp với bộ đồ đang mặc.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSpotRadarModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-800/80 to-emerald-900/80 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs border border-emerald-400/40 transition-all flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Mở Radar Tọa Độ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 3: Cẩm Nang Tạo Dáng */}
            <div className="p-5 rounded-3xl bg-gradient-to-b from-[#221711] to-[#18100b] border border-[#cba369]/30 hover:border-amber-400/60 transition-all shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-xl text-purple-300">
                  🪭
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    Cẩm Nang Tạo Dáng
                  </h3>
                  <p className="text-xs text-purple-200/80 font-medium">
                    4 nhóm phong thái chuẩn cốt cách
                  </p>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Bí kíp tư thế thanh nhã: Cách cầm quạt the, nâng tà áo, nghiêng nón quai thao cho Nam nhi, Nữ tú, Cặp đôi và Nhóm kỷ yếu.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPoseGuideModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-800/80 to-purple-900/80 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-xs border border-purple-400/40 transition-all flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Xem Cẩm Nang Dáng</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 4: Dòng Thời Gian Lịch Sử */}
            <div className="p-5 rounded-3xl bg-gradient-to-b from-[#221711] to-[#18100b] border border-[#cba369]/30 hover:border-amber-400/60 transition-all shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-800/50 border border-amber-400/30 flex items-center justify-center text-xl text-amber-300">
                  📜
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    Dòng Thời Gian Lịch Sử
                  </h3>
                  <p className="text-xs text-amber-200/80 font-medium">
                    Trục thời gian triều đại Lý – Nguyễn
                  </p>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Trục thời gian từ thời Lý, Trần, Lê Sơ, Lê Trung Hưng đến triều Nguyễn & Tân Thời. 1-chạm chuyển tủ đồ tương ứng.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDynastyModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-700/80 to-amber-800/80 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs border border-amber-400/40 transition-all flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Khám Phá Trục Triều Đại</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 5: Phối Đôi & Nhóm */}
            <div className="p-5 rounded-3xl bg-gradient-to-b from-[#221711] to-[#18100b] border border-[#cba369]/30 hover:border-amber-400/60 transition-all shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-900/50 border border-blue-500/30 flex items-center justify-center text-xl text-blue-300">
                  👥
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    Phối Đôi & Nhóm Kỷ Yếu
                  </h3>
                  <p className="text-xs text-blue-200/80 font-medium">
                    Hòa sắc kỷ yếu Nam Nữ & Tập thể
                  </p>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Công cụ điều phối bảng màu tone-sur-tone cho cặp đôi và đội hình nhóm chụp ảnh tốt nghiệp thanh lịch, chuẩn mực.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowGroupModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-800/80 to-blue-900/80 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xs border border-blue-400/40 transition-all flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Mở Bàn Phối Đôi/Nhóm</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 6: Dự Toán Chi Phí */}
            <div className="p-5 rounded-3xl bg-gradient-to-b from-[#221711] to-[#18100b] border border-[#cba369]/30 hover:border-amber-400/60 transition-all shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center text-xl text-emerald-300">
                  💰
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    Dự Toán Chi Phí Thực Tế
                  </h3>
                  <p className="text-xs text-emerald-200/80 font-medium">
                    Ước tính giá thuê/mua & tiệm uy tín
                  </p>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Bảng tính chi phí chi tiết theo từng món, vị trí và danh bạ tiệm cổ phục chất lượng cao tại 3 miền Bắc – Trung – Nam.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowBudgetModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-800/80 to-emerald-900/80 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs border border-emerald-400/40 transition-all flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Tính Dự Toán Ngân Sách</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 7: Trắc Nghiệm Cổ Phục */}
            <div className="p-5 rounded-3xl bg-gradient-to-b from-[#221711] to-[#18100b] border border-[#cba369]/30 hover:border-amber-400/60 transition-all shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-xl text-purple-300">
                  🔮
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    Trắc Nghiệm Phong Cách
                  </h3>
                  <p className="text-xs text-purple-200/80 font-medium">
                    Tìm cổ phục định mệnh của bạn
                  </p>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  4 câu hỏi trắc nghiệm tâm hồn để khám phá phom dáng trang phục truyền thống tương thích nhất với khí chất của bạn.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowQuizModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-800/80 to-purple-900/80 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-xs border border-purple-400/40 transition-all flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Làm Trắc Nghiệm Style</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 8: So Sánh Lookbook */}
            <div className="p-5 rounded-3xl bg-gradient-to-b from-[#221711] to-[#18100b] border border-[#cba369]/30 hover:border-amber-400/60 transition-all shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-900/50 border border-amber-500/30 flex items-center justify-center text-xl text-amber-300">
                  ⚖️
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    So Sánh & Đối Chiếu
                  </h3>
                  <p className="text-xs text-amber-200/80 font-medium">
                    Đặt 2 bản phối cạnh nhau
                  </p>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Xem song song 2 bộ đồ, so sánh bảng màu, chi tiết phụ kiện và sự hòa hợp trước khi ra quyết định may hoặc thuê.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCompareModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-700/80 to-amber-800/80 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs border border-amber-400/40 transition-all flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Mở Bàn So Sánh</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PHẦN Ở DƯỚI BÁCH KHOA DI SẢN: CẨM NANG & TRA CỨU NHANH TRỰC QUAN */}
          <div className="space-y-4 pt-4 border-t border-[#cba369]/20">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-white font-serif flex items-center space-x-2">
                <span className="text-xl">📜</span>
                <span>Cẩm Nang Tra Cứu Văn Hóa & Phong Thái Cổ Phong</span>
              </h3>
              <span className="text-xs text-amber-300 font-mono">Di Sản Việt Nam</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Box 1: Ngũ Hành & Can Chi */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#1a120d]/80 border border-[#cba369]/25 space-y-3">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
                  <span>☯️</span>
                  <span>Ngũ Hành Bản Mệnh & Màu Sắc</span>
                </div>
                <div className="space-y-2 text-xs text-stone-300">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="font-semibold text-white">Mệnh Kim:</span>
                    <span className="text-stone-300">Trắng ngọc, Vàng rơm, Nâu đất</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="font-semibold text-white">Mệnh Mộc:</span>
                    <span className="text-stone-300">Xanh rêu, Xanh lục, Đen tuyền</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="font-semibold text-white">Mệnh Thủy:</span>
                    <span className="text-stone-300">Xanh lam, Đen tuyền, Trắng sữa</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="font-semibold text-white">Mệnh Hỏa:</span>
                    <span className="text-stone-300">Đỏ thắm, Tím hoa cà, Hồng điều</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="font-semibold text-white">Mệnh Thổ:</span>
                    <span className="text-stone-300">Vàng hoàng yến, Nâu gỗ, Đỏ cam</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFengShuiModal(true)}
                  className="w-full py-2 px-3 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-400/30 text-amber-200 text-xs font-semibold transition-all text-center cursor-pointer"
                >
                  Chấm Điểm Ngũ Hành Cho Bộ Đang Mặc →
                </button>
              </div>

              {/* Box 2: Tọa Độ Di Tích 3 Miền */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#1a120d]/80 border border-[#cba369]/25 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm">
                  <span>🗺️</span>
                  <span>Tọa Độ Check-in Đẹp Nhất</span>
                </div>
                <div className="space-y-2 text-xs text-stone-300">
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 space-y-0.5">
                    <div className="flex items-center justify-between font-semibold text-white">
                      <span>Hoàng Thành Thăng Long (Hà Nội)</span>
                      <span className="text-[10px] text-emerald-400">07:30 - 09:30</span>
                    </div>
                    <p className="text-[11px] text-stone-400">Phù hợp Áo Tấc, Ngũ Thân tay chẽn, Giao Lĩnh cổ điển</p>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 space-y-0.5">
                    <div className="flex items-center justify-between font-semibold text-white">
                      <span>Đại Nội Huế & Lăng Tự Đức (Huế)</span>
                      <span className="text-[10px] text-emerald-400">15:30 - 17:30</span>
                    </div>
                    <p className="text-[11px] text-stone-400">Phù hợp Nhật Bình hoàng gia, Áo Tấc tím hoa cà quý phái</p>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 space-y-0.5">
                    <div className="flex items-center justify-between font-semibold text-white">
                      <span>Phố Cổ Hội An & Chùa Cầu (Quảng Nam)</span>
                      <span className="text-[10px] text-emerald-400">16:00 - 18:30</span>
                    </div>
                    <p className="text-[11px] text-stone-400">Phù hợp Áo Dài hoa nhí, Áo Dài trắng nón lá bài thơ</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSpotRadarModal(true)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/30 text-emerald-200 text-xs font-semibold transition-all text-center cursor-pointer"
                >
                  Mở Radar Toàn Bộ Tọa Độ 3 Miền →
                </button>
              </div>

              {/* Box 3: Quy Chuẩn Tư Thế & Phong Thái */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#1a120d]/80 border border-[#cba369]/25 space-y-3">
                <div className="flex items-center space-x-2 text-purple-300 font-bold text-sm">
                  <span>🪭</span>
                  <span>4 Cốt Cách Tạo Dáng Chuẩn</span>
                </div>
                <div className="space-y-2 text-xs text-stone-300">
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 space-y-0.5">
                    <span className="font-semibold text-white">1. Thanh Nhã (Nữ tú Áo Dài / Tứ Thân):</span>
                    <p className="text-[11px] text-stone-400">Tay khép nhẹ nâng vạt, đầu nghiêng 15 độ, quạt che e ấp nửa bờ môi.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 space-y-0.5">
                    <span className="font-semibold text-white">2. Đĩnh Đạc (Nam nhi Ngũ Thân / Áo Tấc):</span>
                    <p className="text-[11px] text-stone-400">Lưng thẳng, hai tay chắp trước bụng hoặc tay cầm sách/quạt mộc trầm tư.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 space-y-0.5">
                    <span className="font-semibold text-white">3. Tương Kính (Cặp đôi kỷ yếu):</span>
                    <p className="text-[11px] text-stone-400">Nam che dù giấy dầu, Nữ nâng tà sánh bước, ánh nhìn tương tác tự nhiên.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPoseGuideModal(true)}
                  className="w-full py-2 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/30 text-purple-200 text-xs font-semibold transition-all text-center cursor-pointer"
                >
                  Xem Toàn Bộ Cẩm Nang Tạo Dáng →
                </button>
              </div>
            </div>

            {/* Quick Action Footer inside Heritage */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#140e0a] border border-[#cba369]/30">
              <div className="text-xs text-[#d5c3aa]">
                Sẵn sàng áp dụng kiến thức vào thực tế? Khám phá 16 bộ mẫu phối sẵn hoặc thiết kế ngay trong phòng phối đồ.
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => switchView('recipes')}
                  className="px-4 py-2 rounded-xl bg-[#261912] hover:bg-[#382419] border border-amber-500/40 text-amber-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  ✨ Xem 16 Bộ Mẫu Sẵn
                </button>
                <button
                  type="button"
                  onClick={() => switchView('studio')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  👘 Lên Phòng Phối Đồ
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PHÂN VÙNG 3: BỘ SƯU TẬP PHỐI SẴN */}
      {mainView === 'recipes' && (
        <section id="bo-mau-san" className="space-y-6 animate-in fade-in duration-300">
          {/* Header & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#16110d]/85 backdrop-blur-md border border-[#cba369]/30 rounded-3xl p-5 sm:p-6 shadow-2xl">
            <div>
              <button
                type="button"
                onClick={() => switchView('studio')}
                className="text-xs text-amber-300 hover:text-white flex items-center space-x-1 mb-2 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Quay Lại Phòng Phối Đồ</span>
              </button>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white font-serif flex items-center space-x-2.5">
                <span className="text-2xl">✨</span>
                <span>Bộ Sưu Tập Phối Sẵn ({recipes.length} Bản Phối Mẫu)</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#d5c3aa] mt-1 leading-relaxed">
                Các bản phối hoàn chỉnh được nghiên cứu theo điển chế lịch sử và thẩm mỹ đương đại. Bấm &quot;Mặc Thử Vào Phòng Phối Đồ&quot; để nạp trực tiếp vào người mẫu.
              </p>
            </div>

            {/* Phom Dáng Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-[#100b08] p-1 rounded-2xl border border-[#cba369]/30 shrink-0">
              <button
                type="button"
                onClick={() => setRecipeFilterSlug('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  recipeFilterSlug === 'all'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Tất cả ({recipes.length})
              </button>
              <button
                type="button"
                onClick={() => setRecipeFilterSlug('ao-dai')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  recipeFilterSlug === 'ao-dai'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Áo Dài
              </button>
              <button
                type="button"
                onClick={() => setRecipeFilterSlug('ngu-than')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  recipeFilterSlug === 'ngu-than'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Ngũ Thân
              </button>
              <button
                type="button"
                onClick={() => setRecipeFilterSlug('tu-than')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  recipeFilterSlug === 'tu-than'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Tứ Thân
              </button>
            </div>
          </div>

          {/* Recipes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {recipes
              .filter((rec) => recipeFilterSlug === 'all' || rec.entitySlug === recipeFilterSlug)
              .map((rec) => {
                const mainItemId = rec.defaultItemIds?.main;
                const mainItem = catalogItems.find((c) => c.id === mainItemId);
                const display = EntityDisplayData[rec.entitySlug];

                // Build complete items map for visual outfit preview
                const recipeItemsMap: Partial<Record<SlotType, CatalogItem>> = { ...(rec.items || {}) };
                if (rec.defaultItemIds) {
                  for (const [slot, id] of Object.entries(rec.defaultItemIds)) {
                    if (!recipeItemsMap[slot as SlotType]) {
                      const it = catalogItems.find((c) => c.id === id);
                      if (it) recipeItemsMap[slot as SlotType] = it;
                    }
                  }
                }

                return (
                  <div
                    key={rec.id}
                    className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#20150f] to-[#140e0a] border border-[#cba369]/30 hover:border-amber-400/70 transition-all shadow-xl flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* HÌNH ẢNH ĐỒ ĐÃ PHỐI (Visual Canvas Preview) */}
                      <div className="w-full h-72 sm:h-80 rounded-2xl bg-gradient-to-b from-[#18110b] to-[#0d0805] border border-[#cba369]/25 p-3 flex items-center justify-center relative overflow-hidden group-hover:border-amber-400/50 transition-all shadow-inner">
                        <CharacterOutfitCanvas
                          entitySlug={rec.entitySlug}
                          items={recipeItemsMap}
                          instanceId={`recipe-card-${rec.id}`}
                          gender={selectedGender}
                          ageGroup={selectedAgeGroup}
                          className="h-full w-auto object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.85)]"
                        />
                        {/* Badge phom dáng */}
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-stone-900/90 backdrop-blur-sm border border-[#cba369]/40 text-[11px] text-amber-300 font-serif font-bold shadow-md">
                          {display?.name || rec.entitySlug}
                        </div>
                        {/* Badge điểm hòa sắc */}
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-amber-950/85 backdrop-blur-sm border border-amber-500/40 text-[11px] text-[#f5d99f] font-mono font-bold shadow-md">
                          {rec.matchScore}% hòa sắc
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors font-serif">
                          {rec.recipeName}
                        </h3>
                        <p className="text-xs text-[#dfd3c3] leading-relaxed line-clamp-2">
                          {rec.description}
                        </p>
                        <div className="text-[11px] text-amber-400/90 italic">
                          {rec.colorHarmony}
                        </div>
                      </div>

                      {/* Mini Preview Các Món Đã Phối Kèm Bảng Màu */}
                      {rec.defaultItemIds && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {Object.entries(rec.defaultItemIds).map(([slot, itemId]) => {
                            const itm = catalogItems.find((c) => c.id === itemId) || (rec.items && (rec.items as any)[slot]);
                            if (!itm) return null;
                            return (
                              <div
                                key={slot}
                                className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-[#0f0b08]/80 border border-[#cba369]/20 text-[10px]"
                                title={`${SlotLabels[slot as SlotType]?.vi || slot}: ${itm.name} (${itm.colorName})`}
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0 shadow-sm"
                                  style={{ backgroundColor: itm.hexColor }}
                                />
                                <span className="text-[#dfd3c3] truncate max-w-[95px]">{itm.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#cba369]/20 space-y-2">
                      <button
                        type="button"
                        onClick={() => handleApplyRecipe(rec)}
                        className="w-full min-h-[42px] py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
                      >
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        <span>Mặc Thử Vào Phòng Phối Đồ</span>
                      </button>

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

          {/* Quick Action Footer inside Recipes */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#140e0a] border border-[#cba369]/30">
            <div className="text-xs text-[#d5c3aa]">
              Đã chọn được bộ mẫu ưng ý? Hãy mặc thử vào phòng phối đồ để tùy chỉnh từng món hoặc xuất thẻ danh thiếp.
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => switchView('heritage')}
                className="px-4 py-2 rounded-xl bg-[#261912] hover:bg-[#382419] border border-amber-500/40 text-amber-200 text-xs font-semibold transition-all cursor-pointer"
              >
                🏛️ Mở Bách Khoa Di Sản
              </button>
              <button
                type="button"
                onClick={() => switchView('studio')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                👘 Lên Phòng Phối Đồ
              </button>
            </div>
          </div>
        </section>
      )}
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

        <Suspense fallback={null}>
          {showQuickGuide && (
            <QuickGuideModal
              isOpen={showQuickGuide}
              onClose={() => setShowQuickGuide(false)}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {showGroupModal && (
            <GroupCoordinatorModal
              isOpen={showGroupModal}
              onClose={() => setShowGroupModal(false)}
              onApplyOutfit={handleApplyCustomOutfit}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {showBudgetModal && (
            <BudgetEstimatorModal
              isOpen={showBudgetModal}
              onClose={() => setShowBudgetModal(false)}
              currentItems={currentItems}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {showQuizModal && (
            <HeritageQuizModal
              isOpen={showQuizModal}
              onClose={() => setShowQuizModal(false)}
              onApplyOutfit={handleApplyCustomOutfit}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {showExportModal && (
            <ExportOutfitModal
              isOpen={showExportModal}
              onClose={() => setShowExportModal(false)}
              entitySlug={selectedSlug}
              gender={selectedGender}
              ageGroup={selectedAgeGroup}
              items={currentItems}
              outfitName={recipes.find((r) => r.entitySlug === selectedSlug)?.recipeName}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {showFengShuiModal && (
            <FengShuiAnalyzerModal
              isOpen={showFengShuiModal}
              onClose={() => setShowFengShuiModal(false)}
              currentItems={currentItems}
              activeEntityName={EntityDisplayData[selectedSlug]?.name}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {showSpotRadarModal && (
            <HeritageSpotRadarModal
              isOpen={showSpotRadarModal}
              onClose={() => setShowSpotRadarModal(false)}
              activeSlug={selectedSlug}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {showPoseGuideModal && (
            <PoseGuideModal
              isOpen={showPoseGuideModal}
              onClose={() => setShowPoseGuideModal(false)}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {showDynastyModal && (
            <DynastyTimelineModal
              isOpen={showDynastyModal}
              onClose={() => setShowDynastyModal(false)}
              onSelectDynasty={handleSelectGroup}
              currentSlug={selectedSlug}
            />
          )}
        </Suspense>

        {/* Heritage Ambient Audio Player (Bottom floating sound engine) */}
        <HeritageAudioPlayer />

        {/* Footer */}
        <footer className="border-t border-[#cba369]/30 bg-[#100b08]/90 backdrop-blur-md py-6 mt-12 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#d5c3aa]">
            <div>
              <span className="text-white font-semibold">Việt Y Tân Sắc</span> — Mặc chất Gen Z, Hiểu đúng Cổ phục Việt Nam.
            </div>
            <div className="flex items-center space-x-3 text-stone-400">
              <span>Áo Dài</span>
              <span>•</span>
              <span>Áo Ngũ Thân</span>
              <span>•</span>
              <span>Áo Tứ Thân</span>
              <span>•</span>
              <span className="text-[#d4af37] font-medium">Bảo Tồn & Sáng Tạo Di Sản</span>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
