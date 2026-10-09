import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Magnet, Users, Palette, Ruler, CheckSquare, Hammer, Truck, Wallet, KeyRound, Zap,
} from 'lucide-react';

const stages = [
  { icon: Magnet, title: 'Lead', desc: 'Captured & scored', to: '/app/crm' },
  { icon: Users, title: 'CRM', desc: 'Qualified & tracked', to: '/app/crm' },
  { icon: Palette, title: 'Design', desc: 'Concepts approved', to: '/app/designs' },
  { icon: Ruler, title: 'BOQ', desc: 'Auto-built from design', to: '/app/estimations' },
  { icon: CheckSquare, title: 'Approval', desc: 'Client signs off', to: '/app/estimations' },
  { icon: Hammer, title: 'Execution', desc: 'Tasks & site reports', to: '/app/projects' },
  { icon: Truck, title: 'Procurement', desc: 'PR → PO → receipt', to: '/app/procurement' },
  { icon: Wallet, title: 'Finance', desc: 'Invoices & payments', to: '/app/finance' },
  { icon: KeyRound, title: 'Customer Handover', desc: 'Warranty & AMC', to: '/app/customers' },
];

const examples = [
  'Design approved → BOQ items auto-freeze and a revision lock is recorded.',
  'PO approved → goods receipt flow enables stock-in on arrival.',
  'Invoice recorded → finance dashboard and receivables update instantly.',
];

export default function WorkflowSection() {
  const [active, setActive] = useState(null);

  return (
    <section id="workflow" className="bg-white py-20">
      <div className="section">
        <span className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <Zap className="h-3.5 w-3.5" /> One connected system
        </span>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Your whole business, <span className="gradient-text">flowing as one</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">
          Every stage feeds the next automatically. When a design is approved, the BOQ freezes,
          materials are requested, and finance is notified — no re-entry, no lost handoffs.
        </p>

        <div className="mt-12 overflow-x-auto scrollbar-thin">
          <ol className="flex min-w-[900px] items-stretch gap-3 pb-2">
            {stages.map((s, i) => (
              <li key={s.title} className="flex flex-1 items-center">
                <Link
                  to={s.to}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={`group w-full rounded-2xl border p-4 text-center transition ${
                    active === i
                      ? 'border-brand-200 bg-brand-50/70 shadow-glow'
                      : 'border-line bg-white hover:border-brand-100 hover:shadow-card'
                  }`}
                >
                  <span
                    className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl ${
                      active === i ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-500'
                    } transition`}
                  >
                    <s.icon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-bold text-navy">{s.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{s.desc}</p>
                </Link>
                {i < stages.length - 1 && (
                  <span className="mx-1 h-px w-3 shrink-0 bg-gradient-to-r from-brand-300 to-accent-cyan/60 sm:w-6" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 card p-6 sm:p-8">
          <h3 className="flex items-center gap-2 text-lg font-bold text-navy">
            <Zap className="h-5 w-5 text-brand-500" /> Event-driven by design
          </h3>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-3">
            {examples.map((e) => (
              <li key={e} className="rounded-xl bg-page p-4 text-sm leading-relaxed text-slate-600">
                {e}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
