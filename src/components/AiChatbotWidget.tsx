// @ts-nocheck
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  Calculator,
  Phone,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

interface AiChatbotWidgetProps {
  language: 'en' | 'ml';
  openAiPlannerModal: () => void;
  whatsappNumber?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiChatbotWidget: React.FC<AiChatbotWidgetProps> = ({
  language,
  openAiPlannerModal,
  whatsappNumber = '916238747722',
}) => {
  const isMl = language === 'ml';
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const defaultGreeting: ChatMessage = {
    id: 'msg-welcome',
    sender: 'assistant',
    text: isMl
      ? `നമസ്കാരം! 🙏 ഞാൻ ഫ്രെയിം ലൂ വെഡ്ഡിംഗ്സിന്റെ AI വെഡ്ഡിംഗ് അസിസ്റ്റന്റാണ്.\n\nനിങ്ങളുടെ വിവാഹ ഫോട്ടോഗ്രാഫി പാക്കേജ്, ഡ്രോൺ, കാൻവേര ആൽബം, ബജറ്റ് കണക്കുകൂട്ടൽ എന്നിവയെക്കുറിച്ചുള്ള ഏത് സംശയങ്ങളും എന്നോട് ചോദിക്കാം!`
      : `Hello! 🙏 I am Framlu Weddings' AI Wedding Assistant.\n\nFeel free to ask me anything about Kerala wedding photography packages, drone cinematography, album choices, or customized budgets!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultGreeting]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Suggested quick questions
  const quickQuestions = isMl
    ? [
        '₹1 ലക്ഷം ബജറ്റിൽ എന്ത് ലഭിക്കും?',
        'ഡ്രോൺ ഷൂട്ടിന്റെ ഗുണങ്ങൾ എന്തൊക്കെ?',
        'ഏത് ആൽബമാണ് ഏറ്റവും മികച്ചത്?',
        'കായംകുളം സ്റ്റുഡിയോ ലൊക്കേഷൻ എവിടെ?',
      ]
    : [
        'What package can I get for ₹1 Lakh?',
        'Why should I include a Drone?',
        'Which album paper is best?',
        'Where is your Kayamkulam studio?',
      ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build lightweight chat history
      const history = messages
        .filter((m) => m.id !== 'msg-welcome')
        .slice(-4)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: m.text,
        }));

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          language,
          message: text,
          history,
        }),
      });

      const data = await res.json();
      const replyText =
        data.reply ||
        (isMl
          ? 'ക്ഷമിക്കണം, എനിക്ക് ഇപ്പോൾ ഉത്തരം നൽകാൻ കഴിഞ്ഞില്ല. ദയവായി അല്പം കഴിഞ്ഞ് വീണ്ടും ചോദിക്കൂ അല്ലെങ്കിൽ വാട്ട്‌സ്ആപ്പിൽ ബന്ധപ്പെടൂ.'
          : 'Sorry, I could not process your request right now. Please retry or contact us on WhatsApp.');

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error('Chatbot error:', e);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text: isMl
          ? 'കണക്ഷൻ പ്രശ്നമുണ്ട്. ദയവായി ഞങ്ങളുടെ വാട്ട്‌സ്ആപ്പിലേക്ക് (+91 6238747722) നേരിട്ട് മെസ്സേജ് അയക്കുക.'
          : 'Network error. Please feel free to WhatsApp us directly at +91 6238747722.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([defaultGreeting]);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 z-40 flex items-center gap-2 group">
          {/* Tooltip Tag */}
          <div className="hidden sm:flex items-center gap-1.5 bg-stone-900 text-white text-xs font-bold py-1.5 px-3 rounded-full shadow-lg border border-purple-500/30 group-hover:scale-105 transition">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isMl ? 'ചോദിക്കൂ എഐ-യോട് ✨' : 'Ask Framlu AI ✨'}</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-600 text-white shadow-xl shadow-purple-600/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white/50"
            title="Open Framlu AI Assistant"
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-amber-700 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-sm text-white">Framlu AI Assistant</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p className="text-[10px] text-purple-100 font-medium">
                  {isMl ? 'കേരള വെഡ്ഡിംഗ് സ്മാർട്ട് ഗൈഡ്' : 'Smart Kerala Wedding Guide'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="bg-purple-50/90 border-b border-purple-100 px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-purple-900 shrink-0">
            <button
              onClick={() => {
                setIsOpen(false);
                openAiPlannerModal();
              }}
              className="flex items-center gap-1 text-purple-700 hover:text-purple-950 transition"
            >
              <Calculator className="w-3 h-3 text-purple-600" />
              <span>{isMl ? '⚡ എഐ ബജറ്റ് ടൂൾ' : '⚡ AI Budget Tool'}</span>
            </button>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Framlu Weddings, I need assistance with wedding photography packages')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 transition"
            >
              <ExternalLink className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Message List */}
          <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1 bg-stone-50/60 max-h-96 min-h-[280px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none font-medium'
                      : 'bg-white text-stone-900 border border-stone-200/80 rounded-tl-none whitespace-pre-line font-normal'
                  }`}
                >
                  <div>{m.text}</div>
                  <div
                    className={`text-[9px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-purple-200' : 'text-stone-400'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start items-center text-xs text-stone-500 font-medium">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none px-3 py-2 flex items-center gap-1.5 shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                  <span>{isMl ? 'എഐ മറുപടി തയ്യാറാക്കുന്നു...' : 'AI is typing...'}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Chips */}
          <div className="px-3 py-2 bg-white border-t border-stone-100 flex gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="whitespace-nowrap text-[11px] font-bold bg-stone-100 hover:bg-purple-50 hover:text-purple-700 text-stone-700 px-2.5 py-1 rounded-xl transition shrink-0 border border-stone-200/60 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isMl ? 'എന്തും ചോദിക്കാം (മലയാളം / English)...' : 'Ask anything about packages...'}
              className="flex-1 bg-stone-100 focus:bg-white border border-stone-200 focus:border-purple-600 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-900 outline-hidden transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="w-9 h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition disabled:opacity-40 cursor-pointer shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
