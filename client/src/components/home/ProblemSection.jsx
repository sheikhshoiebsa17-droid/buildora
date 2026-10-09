import React from 'react';
import {
  MessageSquareOff, Smartphone, FileSpreadsheet, TrendingDown, Hourglass, Truck,
  EyeOff, ClipboardList, Unplug, AlertTriangle, Timer, Users,
} from 'lucide-react';

const problems = [
  { icon: MessageSquareOff, title: 'Leads scattered everywhere', desc: 'Enquiries sit in notebooks, inboxes and random DMs — the hottest ones quietly go cold.' },
  { icon: Smartphone, title: 'Business runs on WhatsApp', desc: 'Approvals, drawings and quality decisions buried in chat threads no one can find again.' },
  { icon: FileSpreadsheet, title: 'BOQs trapped in Excel', desc: 'Line items live in ten different files with broken formulas and outdated rates.' },
  { icon: TrendingDown, title: 'Budgets overrun silently', desc: 'You discover the leak only at the end — when nothing can be recovered.' },
  { icon: Hourglass, title: 'Approvals crawl for days', desc: 'A paint sample or PO waits three days for a signature the site needed yesterday.' },
  { icon: Truck, title: 'Vendor chaos', desc: 'Quotes arrive by WhatsApp photos; comparisons happen from memory.' },
  { icon: EyeOff, title: 'Customers left in the dark', desc: 'Clients keep calling sites for updates you could have shown them automatically.' },
  { icon: ClipboardList, title: 'Reports built by hand', desc: 'Your best people spend Sundays stitching slides from screenshots.' },
  { icon: Unplug, title: 'Disconnected software', desc: 'One tool for leads, another for accounts — none of them talk to each other.' },
];

const stats = [
  { icon: TrendingDown, value: '20%+', label: 'average budget overrun on unmanaged projects', note: 'Sample figure — replace with your own verified data.' },
  { icon: Timer, value: '11 hrs/week', label: 'lost per manager to manual reporting', note: 'Sample figure — replace with your own verified data.' },
  { icon: Users, value: '49%', label: 'of new leads never receive a follow-up', note: 'Sample figure — replace with your own verified data.' },
];

export default function ProblemSection() {
  return (
    <section id="problems" className="bg-slate-50/80 py-20">
      <div className="section">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Construction doesn’t have a people problem.{' '}
          <span className="gradient-text">It has an information problem.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">
          Your teams are talented. But their work is scattered across chat threads, spreadsheets,
          and disconnected apps — so nothing talks to anything, and leaders fly blind.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((p, i) => (
            <article
              key={p.title}
              className="card group p-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-lift"
            >
              <span className="icon-tile bg-brand-50 text-brand-500 transition group-hover:bg-brand-500 group-hover:text-white">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-navy">
                {(i + 1).toString().padStart(2, '0')}. {p.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl bg-navy p-8 text-white sm:p-10">
          <div className="grid gap-8 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.value} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <s.icon className="h-6 w-6 text-accent-cyan" />
                <p className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{s.value}</p>
                <p className="mt-1.5 text-sm text-slate-300">{s.label}</p>
                <p className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-500">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                  {s.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
