import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ChefHat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../api';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SUGGESTIONS = [
  'Hôm nay nên ăn gì?',
  'Món ăn ít calo nhất?',
  'Gợi ý món từ trứng và cà chua',
  'Ăn gì để tăng cơ?',
];

export function MealAdvisor() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Xin chào! Mình là MealCraft AI 👨‍🍳 Bạn muốn mình gợi ý món ăn gì hôm nay?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading || !token) return;

    const userMessage: Message = { role: 'user', text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    // Build history excluding the first greeting (model-only) and current message
    const history = nextMessages.slice(1, -1).map(m => ({
      role: m.role,
      text: m.text,
    }));

    try {
      const data = await apiFetch<{ reply: string }>('/api/ai/chat', token, {
        method: 'POST',
        body: JSON.stringify({ message: text, history }),
      });
      setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (err: any) {
      const reason = err?.message || '';
      const display = reason.includes('not configured')
        ? 'Chatbot chưa được cấu hình API key. Bạn hỏi admin nhé!'
        : reason.includes('API_KEY') || reason.includes('API key')
        ? 'API key không hợp lệ. Kiểm tra lại GEMINI_API_KEY trong .env'
        : reason.includes('bận') || reason.includes('429')
        ? 'Mình đang bận quá, bạn thử lại sau vài giây nhé!'
        : 'Mình đang gặp sự cố kết nối. Bạn thử lại sau nhé!';
      setMessages(prev => [...prev, { role: 'model', text: display }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed right-4 bottom-24 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95"
        aria-label="Mở tư vấn AI"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed right-4 bottom-44 z-50 w-80 max-h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-green-500 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">MealCraft AI</p>
              <p className="text-green-100 text-xs">Trợ lý ẩm thực</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-green-500 text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 shadow-sm rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — only show on first message */}
          {messages.length === 1 && (
            <div className="px-3 py-2 flex gap-2 overflow-x-auto border-t border-gray-100 bg-white">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-2 border-t border-gray-100 bg-white flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Hỏi gì đó về món ăn..."
              className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200 outline-none focus:border-green-400 transition-colors"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-8 h-8 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
