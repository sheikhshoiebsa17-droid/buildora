import React, { useState, useRef, useEffect } from 'react';
import {
  Brain, TrendingUp, Boxes, FileText, AlertTriangle, Send, RotateCcw, Bot, User,
} from 'lucide-react';
import { api } from '../../services/api.js';

const features = [
  { icon: TrendingUp, title: 'Predictive insights', desc: 'Forecast delays and overruns from live project data.' },
  { icon: Boxes, title: 'Smart BOQ assistance', desc: 'Rates, quantities and procurement suggestions.' },
  { icon: FileText, title: 'Natural-language reports', desc: '“Show pending payments” — answered in seconds.' },
  { icon: AlertTriangle, title: 'Risk summaries', desc: 'Which projects need attention, and why.' },
];

const suggestions = [
  'Why is Project A delayed?',
  'Generate a BOQ for a 3BHK.',
  'Show pending payments.',
  'Predict project completion.',
];

const demoReplies = {
  'why is project a delayed?':
    'Demo mode: in a live workspace I would analyse project ACTIV-16 from the database. Sample from our reference case: “Sayjal Viras” ran behind because two critical vendors — marble (₹11.62/m sample) and the painting draftman — slipped. With a real AI key configured, this becomes a grounded, data-backed analysis.',
  'generate a boq for a 3bhk.':
    'Demo mode: Smart BOQ would create a line-item estimate from your item library — modular kitchen, wardrobes, flooring, painting, electrical — with GST computed server-side and versioning enabled. Sign in and open BOQ & Estimation to try the working module.',
  'show pending payments.':
    'Demo mode: I would aggregate unpaid invoices and overdue receivables from your live finance data. Sign in → Finance to see the real receivables view.',
  'predict project completion.':
    'Demo mode: completion forecasts combine task progress rates, procurement status and historical velocity. Configure an AI provider key to enable live prediction.',
};

export default function CopilotSection() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I’m the Buildora Copilot demo. Ask me about delays, BOQs or payments — or sign in to use the grounded, data-backed Copilot inside the app.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatRef = useRef(null);
  const scrollDoneRef = useRef(false);

  useEffect(() => {
    if (chatRef.current && !scrollDoneRef.current) {
      chatRef.current.scrollTop = 0;
      scrollDoneRef.current = true;
    }
  }, []);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setError(null);
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setLoading(true);
    try {
      // public landing demo: no auth required; server returns clearly-labeled demo answers
      const { data } = await api.post('/copilot/chat', { message: q });
      setMessages((m) => [...m, { role: 'assistant', text: data.data.reply, demo: true }]);
    } catch (e) {
      const fallback = demoReplies[q.toLowerCase()];
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text:
            fallback ||
            'Demo mode is active (no AI provider configured). Inside the signed-in app the Copilot answers with your real, authorized business data.',
          demo: true,
        },
      ]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([
      { role: 'assistant', text: 'Conversation cleared. Ask about delays, BOQs or payments — or sign in for the full Copilot.' },
    ]);
    setError(null);
  };

  return (
    <section id="copilot" className="bg-slate-50/80 py-20">
      <div className="section grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 ring-1 ring-brand-100">
            <Brain className="h-3.5 w-3.5" /> Meet your AI Copilot
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            Ask your business <span className="gradient-text">anything.</span>
            <br />
            Get answers in seconds.
          </h2>
          <p className="mt-4 max-w-lg text-lg text-muted">
            The Copilot understands every project, payment, PO, and person in your company.
            It’s not a chatbot bolted on — it’s an intelligence layer woven through every module.
          </p>
          <ul className="mt-8 space-y-4">
            {features.map((f) => (
              <li key={f.title} className="flex gap-3.5">
                <span className="icon-tile bg-white text-brand-500 ring-1 ring-line">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-navy">{f.title}</p>
                  <p className="text-sm text-muted">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card overflow-hidden shadow-lift">
          <div className="flex items-center justify-between border-b border-line bg-white px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan text-white">
                <Bot className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="text-sm font-bold text-navy">Buildora Copilot</p>
                <p className="text-xs text-muted">Demo mode · signed-in Copilot uses your live data</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="btn-ghost px-2.5 py-1.5 text-xs"
              aria-label="Reset conversation"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>

          <div ref={chatRef} className="max-h-[380px] min-h-[300px] space-y-4 overflow-y-auto bg-page p-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : ''}`}>
                {m.role === 'assistant' && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
                    <Bot className="h-4 w-4" />
                  </span>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-brand-500 text-white'
                      : 'border border-line bg-white text-slate-700'
                  }`}
                >
                  {m.text}
                  {m.demo && (
                    <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Demo response — not from a live AI model
                    </span>
                  )}
                </div>
                {m.role === 'user' && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue">
                    <User className="h-4 w-4" />
                  </span>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="rounded-2xl border border-line bg-white px-4 py-3">
                  <span className="flex gap-1" aria-label="Copilot is typing">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
            {error && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">{error}</p>
            )}
          </div>

          <div className="border-t border-line bg-white p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-line bg-page px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <input
                className="input flex-1"
                placeholder="Ask anything: payments, projects, BOQ…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Ask the Copilot"
              />
              <button type="submit" className="btn-primary px-4" disabled={loading} aria-label="Send message">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
