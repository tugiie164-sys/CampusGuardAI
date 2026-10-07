import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  User,
  Bot,
  MapPin,
  Wifi,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useCampusStore } from '../../store/useCampusStore';
import { Button } from '../../design-system/Button';

const PROMPTS = [
  'Where is ICT Lab 4 located?',
  'Wi-Fi is dropping in Block C Floor 2',
  'How do I set up eduroam?',
  'What are the Library hours?',
  'Who is on duty in ICT operations?',
];

export const MobileAssistantView: React.FC = () => {
  const { triggerHaptic, setMobileActiveTab } = useCampusStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ sender: 'user' | 'bot'; text: string; actionType?: string; actionPayload?: any }>
  >([
    {
      sender: 'bot',
      text: 'Hi there! I am your CampusGuard AI Assistant. How can I help you today with Wi-Fi, computer labs, or facility requests?',
    },
  ]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    triggerHaptic();

    const query = textToSend.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: data.answer || 'Thank you for reaching out.',
            actionType: data.suggestedAction?.type,
            actionPayload: data.suggestedAction?.payload,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: 'I could not connect to the campus assistant service. Please check connection.',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Network timeout. If you are experiencing Wi-Fi issues, you can submit an offline report.',
        },
      ]);
    } finally {
      setIsLoading(false);
      triggerHaptic();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-175px)] max-h-[640px] pb-2">
      {/* Header */}
      <div className="px-1 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Student AI Assistant
            </h2>
            <p className="text-[10px] text-slate-500">Fast answers & smart routing</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          Stat/NLP Prototype
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 px-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div className={`space-y-1.5 max-w-[82%]`}>
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-xs shadow-xs'
                }`}
              >
                {msg.text}
              </div>

              {/* Action shortcut if suggested */}
              {msg.actionType === 'SUBMIT_REPORT' && (
                <button
                  onClick={() => {
                    triggerHaptic();
                    setMobileActiveTab('report');
                  }}
                  className="w-full py-1.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-[11px] font-medium flex items-center justify-between cursor-pointer"
                >
                  <span>Open Report Form</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>Consulting campus knowledge base...</span>
          </div>
        )}
      </div>

      {/* Suggestion Prompts */}
      <div className="shrink-0 py-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="text-[10px] py-1 px-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap transition-colors cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="shrink-0 flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question or report an issue..."
          className="flex-1 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
        />
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          size="sm"
          className="rounded-2xl px-3.5 py-2.5 shadow-xs"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
