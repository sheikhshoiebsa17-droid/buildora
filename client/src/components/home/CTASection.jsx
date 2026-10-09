import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, UserCheck, CheckCircle2, Database } from 'lucide-react';

const trust = [
  { icon: UserCheck, label: 'Guided onboarding' },
  { icon: Database, label: 'Secure data handling' },
  { icon: CheckCircle2, label: 'Implementation support' },
];

export default function CTASection() {
  return (
    <section className="bg-page py-20">
      <div className="section">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-8 py-16 text-center sm:px-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{ background: 'radial-gradient(700px 320px at 15% 0%, rgba(101,69,245,0.4), transparent), radial-gradient(600px 300px at 85% 100%, rgba(25,183,213,0.3), transparent)' }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to modernize your construction business?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
              See how Buildora can connect your entire project lifecycle — a 30-minute,
              tailored walkthrough mapped to your real projects.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/demo" className="btn-primary px-7 py-3 text-base">
                Schedule a demo <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="mailto:hello@buildora.dev?subject=Talk%20to%20a%20Buildora%20product%20expert"
                className="btn border border-white/20 bg-white/5 px-7 py-3 text-base text-white hover:bg-white/10"
              >
                Talk to a Product Expert
              </a>
            </div>
            <ul className="mt-9 flex flex-wrap justify-center gap-x-8 gap-y-3">
              {trust.map((t) => (
                <li key={t.label} className="flex items-center gap-2 text-sm text-slate-300">
                  <t.icon className="h-4 w-4 text-accent-cyan" />
                  {t.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
