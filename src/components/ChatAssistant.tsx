import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  ChatMessage,
  EntitySlug,
  OutfitAction,
  SlotType,
  GenderType,
  AgeGroupType,
} from '../types/fashion';
import { CATALOG_ITEMS } from '../data/catalog';

interface ChatAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  currentItemIds: string[];
  entitySlug: EntitySlug;
  event: string;
  lockedItemIds: string[];
  currentFingerprint: string;
  stylePreferences?: string[];
  preferredColor?: string;
  gender?: GenderType;
  ageGroup?: AgeGroupType;
  onApplyAction: (action: OutfitAction) => Promise<boolean>;
}

const catalogMap = new Map(CATALOG_ITEMS.map((item) => [item.id, item]));

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  isOpen,
  onToggle,
  currentItemIds,
  entitySlug,
  event,
  lockedItemIds,
  currentFingerprint,
  stylePreferences = [],
  preferredColor = '',
  gender = 'all',
  ageGroup = 'thanh_nien',
  onApplyAction,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      text: 'Chào bạn! Mình là Trợ lý Thời trang Việt Y Tân Sắc. Bạn đang phối đồ cho dịp gì? Hãy nhắn cho mình nếu muốn đổi giày trẻ trung hơn, đổi nón hoặc tìm hiểu ý nghĩa cổ phục nhé!',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isApplyingAction, setIsApplyingAction] = useState(false);
  const [staleActionPending, setStaleActionPending] = useState<OutfitAction | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      // Build recent history (only user & assistant text, max 6 items)
      const recentMessages = messages
        .filter((m) => m.id !== 'welcome-msg')
        .slice(-6)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          recentMessages,
          currentItemIds,
          entitySlug,
          event,
          stylePreferences,
          preferredColor,
          lockedItemIds,
          outfitRevision: currentFingerprint,
          gender,
          ageGroup,
        }),
      });

      const data = await res.json();

      // Check HTTP ok and success flag
      if (!res.ok || !data.success) {
        const errorText =
          data?.error ||
          data?.reply ||
          'Không thể xử lý yêu cầu lúc này. Bạn vẫn có thể tiếp tục phối đồ thủ công bằng Builder.';
        const errorMessage: ChatMessage = {
          id: `assistant-err-${Date.now()}`,
          role: 'assistant',
          text: errorText,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          source: 'local_fallback',
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'Đã phân tích yêu cầu tạo hình.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        action: data.action,
        source: data.source,
        evidence: data.evidence,
        aiStylistInsights: data.aiStylistInsights,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: 'Mất kết nối với máy chủ. Bạn vẫn có thể xem lại trang phục hiện tại và các bộ Lookbook đã lưu trên máy!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        source: 'local_fallback',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleActionClick = async (action: OutfitAction) => {
    if (isApplyingAction) return;

    // Check if the target slot is currently locked on client
    if (action.type === 'SWAP_ITEM' && action.targetSlot) {
      const isSlotCurrentlyLocked = lockedItemIds.some((id) => {
        return currentItemIds.includes(id) && catalogMap.get(id)?.slot === action.targetSlot;
      });
      if (isSlotCurrentlyLocked) {
        const warningMsg: ChatMessage = {
          id: `warn-lock-${Date.now()}`,
          role: 'assistant',
          text: `Vị trí [${action.targetSlot}] đang bị bạn khóa cố định trên bảng điều khiển. Vui lòng mở khóa trước nếu muốn áp dụng thay đổi này.`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          source: 'local_fallback',
        };
        setMessages((prev) => [...prev, warningMsg]);
        return;
      }
    }

    // Stale action check
    if (action.baseOutfitRevision && action.baseOutfitRevision !== currentFingerprint) {
      setStaleActionPending(action);
      return;
    }

    setIsApplyingAction(true);
    try {
      await onApplyAction(action);
    } finally {
      setIsApplyingAction(false);
    }
  };

  const confirmStaleAction = async () => {
    if (!staleActionPending) return;
    setIsApplyingAction(true);
    try {
      await onApplyAction(staleActionPending);
      setStaleActionPending(null);
    } finally {
      setIsApplyingAction(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Compact 48x48 on mobile, pill on sm+) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          aria-label="Mở Trợ Lý Phối Đồ AI"
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 sm:bottom-6 sm:right-6 z-40 p-3 sm:px-4 sm:py-3 min-w-[48px] min-h-[48px] rounded-full bg-gradient-to-r from-[#9b3424] via-[#b84034] to-[#cba369] hover:from-[#b84034] hover:to-[#d4af37] text-white font-semibold text-xs sm:text-sm shadow-2xl shadow-black/70 border border-[#d4af37]/40 flex items-center justify-center space-x-2 transition-all hover:scale-105 cursor-pointer"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#f5d99f] animate-pulse" />
          </div>
          <span className="hidden sm:inline">Trợ Lý Gemini</span>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Cửa sổ Trợ lý Thời trang Việt Phục"
          className="fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom,0px))] right-2 sm:bottom-6 sm:right-6 z-50 w-[96vw] max-w-[420px] h-[560px] max-h-[85vh] bg-[#16110d]/95 backdrop-blur-2xl border border-[#cba369]/35 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        >
          {/* Header with 40x40+ touch targets */}
          <div className="p-3.5 sm:p-4 border-b border-[#cba369]/25 bg-[#100b08]/95 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#9b3424] via-[#b84034] to-[#cba369] flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-xs font-bold text-white font-serif">Trợ Lý Việt Y Tân Sắc</h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] text-[#d5c3aa] font-mono">
                  Độc quyền xử lý Server-side
                </div>
              </div>
            </div>

            <button
              onClick={onToggle}
              aria-label="Đóng cửa sổ trợ lý"
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-[#241a13] hover:bg-[#322319] text-[#d5c3aa] hover:text-white flex items-center justify-center text-sm cursor-pointer transition-colors"
              title="Đóng cửa sổ trợ lý (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-stone-950/50 border-b border-stone-800/80 flex items-center space-x-1.5 overflow-x-auto text-[11px] text-stone-400">
            <span className="shrink-0 text-stone-500 font-medium">Gợi ý:</span>
            <button
              onClick={() => handleSendMessage('Đổi cho mình đôi giày nào trẻ trung hơn cho kỷ yếu')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
            >
              👟 Đổi giày trẻ trung
            </button>
            <button
              onClick={() => handleSendMessage('Ý nghĩa 5 khuy trên áo ngũ thân là gì?')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
            >
              📜 Ý nghĩa ngũ thân
            </button>
            <button
              onClick={() => handleSendMessage('Gợi ý nón hoặc phụ kiện đi kèm')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
            >
              👒 Gợi ý nón/phụ kiện
            </button>
          </div>

          {/* Stale Action Warning Banner */}
          {staleActionPending && (
            <div className="p-3 bg-amber-950/80 border-b border-amber-600/50 text-amber-200 text-xs flex flex-col space-y-2">
              <div className="flex items-center space-x-1.5 font-semibold text-amber-300">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Trang phục đã thay đổi so với thời điểm AI gợi ý!</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-200/90">
                Bạn đã chỉnh sửa một số món sau khi nhận tin nhắn này. Bạn có chắc muốn ghi đè bộ đồ hiện tại bằng hành động: "{staleActionPending.label}"?
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={confirmStaleAction}
                  disabled={isApplyingAction}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold text-[11px] cursor-pointer"
                >
                  Vẫn áp dụng
                </button>
                <button
                  onClick={() => setStaleActionPending(null)}
                  className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-[11px] cursor-pointer"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-900/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed space-y-1.5 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-br-none shadow-md'
                      : 'bg-stone-800/90 border border-stone-700/70 text-stone-200 rounded-bl-none shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-75 mb-1">
                    <span className="font-semibold">{msg.role === 'user' ? 'Bạn' : 'Trợ lý Việt Phục'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Engine Source Badge */}
                  {msg.source && msg.role === 'assistant' && (
                    <div className="pt-1 flex items-center justify-end text-[9px] text-stone-400">
                      {msg.source === 'gemini' ? (
                        <span className="flex items-center space-x-1 text-amber-300">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Gemini 3.8 Flash (Gợi ý styling tự do)</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-[#f5d99f]/80">
                          <Sparkles className="w-2.5 h-2.5 text-[#d4af37]" />
                          <span>Stylist AI Cổ Phong (Server-side)</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Verified Cultural Evidence Box (if attached by server via culture tool) */}
                  {msg.evidence && (
                    <div className="mt-2.5 p-3 rounded-xl bg-stone-950/80 border border-amber-500/40 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-300 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">Căn cứ Lịch sử có Nguồn ({msg.evidence.claimId})</span>
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono shrink-0 ${
                            msg.evidence.isMock
                              ? 'bg-purple-900/60 text-purple-200 border border-purple-700/60'
                              : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60'
                          }`}
                        >
                          {msg.evidence.isMock ? '[MOCK EVIDENCE]' : msg.evidence.reviewStatus}
                        </span>
                      </div>
                      <p className="text-stone-300 leading-relaxed italic">
                        "{msg.evidence.sourcedFact}"
                      </p>
                      <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-800">
                        Nguồn: <span className="text-stone-300">{msg.evidence.referenceSource}</span>
                      </div>
                    </div>
                  )}

                  {/* AI Stylist Insights Badge & Rationale */}
                  {msg.aiStylistInsights && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-br from-amber-950/60 via-stone-900/90 to-amber-950/40 border border-amber-500/50 shadow-inner space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-300 flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Góc nhìn Stylist AI</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-200 border border-amber-500/40">
                          {msg.aiStylistInsights.aestheticVibe}
                        </span>
                      </div>
                      <p className="text-stone-300 leading-relaxed text-[10.5px]">
                        <span className="text-amber-200/90 font-medium">Mẹo phối & tạo dáng: </span>
                        {msg.aiStylistInsights.stylingTip}
                      </p>
                    </div>
                  )}

                  {/* Server Authoritative Action Proposal */}
                  {msg.action && (
                    <div className="pt-2 border-t border-stone-700/60 mt-2">
                      <button
                        onClick={() => handleActionClick(msg.action!)}
                        disabled={isApplyingAction}
                        className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isApplyingAction ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>{msg.action.label}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-stone-800 bg-stone-950/80 flex items-center space-x-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Hỏi về đổi món, màu sắc hoặc câu chuyện cổ phục..."
              disabled={isSending}
              maxLength={2000}
              className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 min-h-[40px] text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              aria-label="Gửi tin nhắn"
              className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 text-white disabled:text-stone-500 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              {isSending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
};
