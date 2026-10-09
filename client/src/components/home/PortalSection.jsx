import React from 'react';
import { CheckCircle2, CircleDashed, FileSignature, Wallet, FolderOpen, LifeBuoy, Bell } from 'lucide-react';

const features = [
  { icon: CheckCircle2, label: 'Project progress' },
  { icon: CircleDashed, label: 'Milestones' },
  { icon: FileSignature, label: 'Design approvals' },
  { icon: Wallet, label: 'Payment schedule' },
  { icon: FolderOpen, label: 'Document access' },
  { icon: LifeBuoy, label: 'Service requests' },
  { icon: Bell, label: 'Notifications' },
];

export default function PortalSection() {
  return (
    <section id="portal" className="bg-white py-20">
      <div className="section">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Give clients a window <span className="gradient-text">they’ll love</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">
          A branded customer portal with live progress, approvals and payments — built into the
          platform, not a PDF in a WhatsApp thread.
        </p>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          {/* Phone mockup */}
          <div className="mx-auto w-full max-w-[300px]">
            <div className="rounded-[36px] border border-line bg-navy p-2.5 shadow-lift">
              <div className="rounded-[28px] bg-page">
                <div className="flex items-center justify-between rounded-t-[28px] bg-white px-4 py-3">
                  <div className="h-2 w-20 rounded bg-slate-200" />
                  <Bell className="h-4 w-4 text-slate-400" />
                </div>
                <div className="space-y-3 p-4">
                  <div className="rounded-xl bg-white p-3 ring-1 ring-line">
                    <p className="text-xs font-semibold text-navy">Whitefield 3BHK</p>
                    <p className="mt-0.5 text-[10px] text-muted">Overall progress</p>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div className="h-2 w-[68%] rounded-full bg-gradient-to-r from-brand-500 to-accent-cyan" />
                    </div>
                    <p className="mt-1.5 text-right text-[10px] font-bold text-brand-600">68%</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 ring-1 ring-line">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Milestones</p>
                    {['Design approved', 'Carpentry underway', 'Handover — Nov 15'].map((m, i) => (
                      <div key={m} className="mt-2 flex items-center gap-2">
                        {i < 2 ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <CircleDashed className="h-3.5 w-3.5 text-slate-300" />
                        )}
                        <span className="text-[11px] text-slate-600">{m}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-white p-3 ring-1 ring-line">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Next payment</p>
                    <p className="mt-1 text-sm font-bold text-navy">₹4,32,000</p>
                    <p className="text-[10px] text-muted">40% carpentry milestone · due Oct 5</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature list */}
          <div>
            <h3 className="text-2xl font-bold text-navy">Everything the client needs — nothing they shouldn’t see</h3>
            <p className="mt-3 text-slate-600">
              The portal is role-scoped: customers only ever see their own projects, milestones, and documents.
              Approve designs, view payment schedules, raise service requests — all in one place.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-3">
              {features.map((f) => (
                <li key={f.label} className="flex items-center gap-2.5 rounded-xl border border-line bg-page px-4 py-3 text-sm font-medium text-navy">
                  <f.icon className="h-4.5 w-4.5 h-[18px] w-[18px] text-brand-500" />
                  {f.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
