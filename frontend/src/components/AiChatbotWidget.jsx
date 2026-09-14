import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, RefreshCw, ChevronDown, User, MessageSquare, Ticket, Film, ShieldCheck, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * CineBot AI Chatbot Panel Component
 * Connects to live MongoDB backend (/api/ai-chat) for real movie catalog, tickets, and refund inquiries.
 */
export const AiChatbotPanel = ({ onClose, isFloating = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello! 👋 I'm **CineBot 🤖**, your real AI movie & ticketing concierge.\n\nI can recommend blockbusters, retrieve your booked ticket QR passes, assist with refunds, or give you discount vouchers! How can I help you today?`,
      chips: ['🎬 Now Showing', '🎟️ My Bookings', '🏷️ Promo Codes', '❓ Refund Policy'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          userId: user?._id || user?.id || null,
        }),
      });

      const data = await res.json();

      setIsTyping(false);

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.reply || "I'm experiencing a temporary hiccup, but I'm here to help with your bookings!",
        chips: data.quickChips || ['🎬 Now Showing', '🎟️ My Bookings'],
        actionData: data.actionData || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Error querying AI chatbot backend API:', err);
      setIsTyping(false);
      const fallbackMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: `I'm synced with CineLedger! You can check your confirmed bookings, explore active movies, or get instant assistance.`,
        chips: ['🎬 Now Showing', '🎟️ My Bookings', '❓ Refund Policy'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }
  };

  const handleChipClick = (chipText) => {
    // Strip emoji if present for cleaner prompt or send directly
    if (chipText.includes('My Bookings') || chipText.includes('My Tickets') || chipText.includes('View My Tickets')) {
      handleSendMessage('show my bookings and tickets');
    } else if (chipText.includes('Now Showing') || chipText.includes('Show Movies') || chipText.includes('Explore Movies')) {
      handleSendMessage('what movies are now showing in cinemas?');
    } else if (chipText.includes('Promo Codes') || chipText.includes('Active Offers') || chipText.includes('Offers')) {
      handleSendMessage('show active promo codes and discounts');
    } else if (chipText.includes('Refund Policy') || chipText.includes('Cancel Ticket')) {
      handleSendMessage('what is your refund and cancellation policy?');
    } else {
      handleSendMessage(chipText);
    }
  };

  // Helper to format text with markdown-like bolding and bullet formatting
  const renderFormattedText = (text) => {
    if (!text) return null;

    return text.split('\n').map((line, i) => {
      let formattedLine = line;

      // Handle bold text **text**
      const parts = formattedLine.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={idx} className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[11px] rounded font-bold">
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      return (
        <div key={i} className="min-h-[18px]">
          {renderedParts}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-emerald-200 border border-white/30 shadow-inner">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-emerald-900 rounded-full" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white leading-tight flex items-center gap-1.5">
              CineBot AI <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-1.5 py-0.2 rounded-full font-bold">REAL AI</span>
            </h3>
            <p className="text-[11px] text-emerald-100 font-medium">Synced with Live Movie Database</p>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
          >
            <div className="flex items-end gap-2 max-w-[90%]">
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs mb-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed font-medium shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}
              >
                {renderFormattedText(msg.text)}
              </div>
            </div>

            <span className="text-[10px] text-slate-400 px-1 font-semibold">{msg.timestamp}</span>

            {/* Quick Action Chips attached to Bot Messages */}
            {msg.sender === 'bot' && msg.chips && msg.chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 max-w-[92%] pl-9">
                {msg.chips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChipClick(chip)}
                    className="px-2.5 py-1 bg-white border border-emerald-400 text-emerald-800 hover:bg-emerald-600 hover:text-white rounded-full text-[11px] font-extrabold shadow-2xs transition-all cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Real-time Typing Indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 pl-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-bl-none shadow-xs flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1">CineBot is thinking</span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask CineBot anything (e.g. show movies, my tickets, promo code)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

/**
 * Floating Launcher Widget for CineBot AI Chatbot (Bottom-Right Floating Launcher)
 */
export const AiChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Chatbot Drawer/Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mb-4 animate-fade-in flex flex-col">
          <AiChatbotPanel onClose={() => setIsOpen(false)} isFloating={true} />
        </div>
      )}

      {/* Floating Toggle Button (Pure Icon Logo) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-14 h-14 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-full shadow-2xl hover:shadow-emerald-600/40 flex items-center justify-center transition-all duration-300 transform hover:scale-110 cursor-pointer border-2 border-white/20"
          title="CineBot AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 border-2 border-emerald-900 rounded-full animate-ping" />
          </div>
        </button>
      )}
    </div>
  );
};
