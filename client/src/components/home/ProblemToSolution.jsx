import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const pairs = [
  { problem: 'Lost and cold leads', solution: 'AI CRM', solutionTo: '/app/crm', desc: 'Every enquiry captured, scored and followed up on time.' },
  { problem: 'Manual Excel BOQs', solution: 'Smart Estimation', solutionTo: '/app/estimations', desc: 'Line-item BOQs with GST math done on the server.' },
  { problem: 'Delayed projects', solution: 'Live Tracking', solutionTo: '/app/projects', desc: 'Tasks, milestones and progress that update themselves.' },
  { problem: 'Poor client communication', solution: 'Customer Portal', solutionTo: '/#portal', desc: 'Clients see progress, milestones and approvals anytime.' },
  { problem: 'Vendor confusion', solution: 'Procurement Workspace', solutionTo: '/app/procurement', desc: 'PR → quote → comparison → PO in one auditable flow.' },
  { problem: 'Budget leakage', solution: 'Cost Analytics', solutionTo: '/app/analytics', desc: 'Budget vs actual on every project, in real time.' },
  { problem: 'Manual reporting', solution: 'AI Copilot', solutionTo: '/#copilot', desc: 'Ask questions in plain language, get grounded answers.' },
  { problem: 'Duplicate data entry', solution: 'One Connected Database', solutionTo: '/#workflow', desc: 'Enter once — it flows everywhere automatically.' },
];

export default function ProblemToSolution() {
  return (
    <section className="bg-slate-50/80 py-20">
      <div className="section">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Buildora replaces the chaos
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {pairs.map((p) => (
            <article key={p.problem} className="card flex flex-col gap-3 p-6 transition hover:border-brand-100 hover:shadow-lift">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                  {p.problem}
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-brand-400" aria-hidden="true" />
                <span className="text-right text-xs font-bold uppercase tracking-wider text-emerald-600">
                  {p.solution}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted">{p.desc}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-brand-400" />
          Solution names link directly into the working product modules.
        </p>
      </div>
    </section>
  );
}
