import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, Bot, User, Sparkles, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import { SectionCard } from '../../components/common/ui.jsx';

const SUGGESTIONS = [
  'Are any projects currently facing milestone delays?',
  'What is the current outstanding receivable amount from clients?',
  'Which materials in inventory are running low or need reordering?',
  'Summarize recent design approvals across residential fit-outs.',
];

export default function Copilot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your Buildora AI Copilot. Ask me about project timelines, client estimates, pending invoices, inventory levels, or vendor procurement.',
      demo: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [sessionToken, setSessionToken] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (messageText) => {
      const res = await api.post('/copilot/chat', {
        message: messageText,
        sessionToken,
      });
      return res.data;
    },
    onSuccess: (data) => {
      const reply = data.data?.reply || 'Received response.';
      const demo = data.data?.demo;
      if (data.data?.sessionToken) {
        setSessionToken(data.data.sessionToken);
      }
      setMessages((prev) => [...prev, { role: 'assistant', text: reply, demo }]);
    },
    onError: (err) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Error: ${errMsg(err)}`,
          isError: true,
        },
      ]);
    },
  });

  const handleSend = (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || sendMutation.isPending) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    sendMutation.mutate(text);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-navy">
            <Sparkles className="h-6 w-6 text-brand-600" />
            AI Project Copilot
          </h1>
          <p className="mt-1 text-sm text-muted">
            Intelligent assistant grounded with your live project schedules, estimates, and financials.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        {/* Chat message history */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Bot className="h-5 w-5" />
                </div>
              )}
              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                    : m.isError
                    ? 'border border-rose-200 bg-rose-50 text-rose-700 rounded-bl-none'
                    : 'border border-line bg-slate-50/80 text-navy rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.demo && (
                  <div className="mt-2 text-[11px] text-amber-600 font-medium border-t border-amber-200/50 pt-1">
                    Mode: Interactive demo response (Configure AI_API_KEY in server/.env for live LLM)
                  </div>
                )}
              </div>
              {m.role === 'user' && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}

          {sendMutation.isPending && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm text-slate-500 rounded-bl-none">
                <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion prompts */}
        <div className="border-t border-line/60 bg-slate-50/50 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Suggested Queries</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(s)}
                className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Chat input form */}
        <form onSubmit={handleSubmit} className="border-t border-line p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your projects, estimates, or cashflows..."
              className="input py-3"
              disabled={sendMutation.isPending}
            />
            <button
              type="submit"
              disabled={!input.trim() || sendMutation.isPending}
              className="btn-primary shrink-0 px-4 py-3"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
