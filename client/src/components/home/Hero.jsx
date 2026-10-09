import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, PlayCircle, ShieldCheck, Rocket, Workflow,
  Wallet, Bot, Radar, Boxes, Users,
} from 'lucide-react';
import DashboardMock from './DashboardMock.jsx';

const trust = [
  { icon: Workflow, label: 'End-to-end lifecycle' },
  { icon: ShieldCheck, label: 'Enterprise-grade security' },
  { icon: Rocket, label: 'Live in weeks' },
];

const badges = [
  { icon: Bot, label: 'AI Copilot', pos: '-left-4 top-8 lg:-left-10', delay: '0s' },
  { icon: Radar, label: 'Live Tracking', pos: '-right-3 top-16 lg:-right-8', delay: '0.6s' },
  { icon: Wallet, label: 'Smart BOQ', pos: '-left-6 top-1/2 lg:-left-12', delay: '1.1s' },
  { icon: Boxes, label: 'Procurement', pos: '-right-4 bottom-24 lg:-right-9', delay: '0.3s' },
  { icon: Users, label: 'Customer Portal', pos: 'left-2 -bottom-5', delay: '0.9s' },
  { icon: Workflow, label: 'Finance', pos: 'right-6 -bottom-4', delay: '1.4s' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: 'linear-gradient(120deg, rgba(101,69,245,0.22), rgba(67,133,245,0.16), rgba(25,183,213,0.14))' }}
      />
      <div className="section relative grid items-center gap-14 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-600">
            <Sparkles className="h-3.5 w-3.5" />
            NEW — AI Copilot understands your entire business
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-navy sm:text-5xl xl:text-[3.6rem]">
            The <span className="gradient-text">AI Operating System</span> for Interior &amp; Construction
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Run your whole company from one intelligent platform — leads, CRM, design, BOQ,
            execution, procurement, finance, and customer experience. No more disconnected tools.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/demo" className="btn-primary px-6 py-3 text-base">
              Book a Demo
            </Link>
            <a href="#workflow" className="btn-secondary px-6 py-3 text-base">
              <PlayCircle className="h-5 w-5 text-brand-500" />
              Watch Product Tour
            </a>
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-7 gap-y-3">
            {trust.map((t) => (
              <li key={t.label} className="flex items-center gap-2 text-sm font-medium text-navy">
                <t.icon className="h-4.5 w-4.5 h-[18px] w-[18px] text-brand-500" />
                {t.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <DashboardMock />
          {badges.map((b) => (
            <div
              key={b.label}
              className={`absolute ${b.pos} hidden items-center gap-2 rounded-xl border border-line bg-white/95 px-3 py-2 shadow-lift backdrop-blur animate-float-slow sm:flex`}
              style={{ animationDelay: b.delay }}
            >
              <span className="icon-tile h-7 w-7 bg-brand-50 text-brand-500">
                <b.icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold text-navy">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
