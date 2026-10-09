import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users2, Contact, Palette, Ruler, FolderKanban, HardHat, Truck, Boxes, Building,
  Wallet, ShieldCheck, CalendarClock, LifeBuoy, FolderOpen, BarChart3, BellRing,
  LockKeyhole, Smartphone, Bot,
} from 'lucide-react';

const modules = [
  { icon: Users2, name: 'CRM & Sales', desc: 'Leads, pipeline & conversion', to: '/app/crm', color: 'bg-violet-50 text-violet-600' },
  { icon: Contact, name: 'Customer Management', desc: '360° client records', to: '/app/customers', color: 'bg-sky-50 text-sky-600' },
  { icon: Palette, name: 'Design Studio', desc: 'Versions & client approvals', to: '/app/designs', color: 'bg-fuchsia-50 text-fuchsia-600' },
  { icon: Ruler, name: 'BOQ & Estimation', desc: 'Line items, GST, versions', to: '/app/estimations', color: 'bg-brand-50 text-brand-500' },
  { icon: FolderKanban, name: 'Project Management', desc: 'Tasks, milestones, progress', to: '/app/projects', color: 'bg-emerald-50 text-emerald-600' },
  { icon: HardHat, name: 'Site Execution', desc: 'Daily reports & photos', to: '/app/projects', color: 'bg-amber-50 text-amber-600' },
  { icon: Truck, name: 'Procurement', desc: 'PR → PO → goods receipt', to: '/app/procurement', color: 'bg-orange-50 text-orange-600' },
  { icon: Boxes, name: 'Inventory & Warehouse', desc: 'Stock, alerts & movements', to: '/app/inventory', color: 'bg-teal-50 text-teal-600' },
  { icon: Building, name: 'Vendor Management', desc: 'Directory & ratings', to: '/app/vendors', color: 'bg-cyan-50 text-cyan-600' },
  { icon: Wallet, name: 'Finance & Accounting', desc: 'Invoices & receivables', to: '/app/finance', color: 'bg-indigo-50 text-indigo-600' },
  { icon: ShieldCheck, name: 'Product Warranty', desc: 'Handover warranties', to: '/app/customers', color: 'bg-green-50 text-green-600' },
  { icon: CalendarClock, name: 'AMC Management', desc: 'Maintenance contracts', to: '/app/customers', color: 'bg-lime-50 text-lime-600' },
  { icon: LifeBuoy, name: 'Service & Support', desc: 'Tickets & SLAs', to: '/app/customers', color: 'bg-rose-50 text-rose-600' },
  { icon: FolderOpen, name: 'Document Management', desc: 'Files, versions, access', to: '/app/documents', color: 'bg-blue-50 text-blue-600' },
  { icon: BarChart3, name: 'Analytics & BI', desc: 'Revenue & cost charts', to: '/app/analytics', color: 'bg-purple-50 text-purple-600' },
  { icon: BellRing, name: 'Automation & Alerts', desc: 'In-app notification rules', to: '/app/settings', color: 'bg-yellow-50 text-yellow-600' },
  { icon: LockKeyhole, name: 'Security & Access', desc: 'Roles & permissions', to: '/app/settings', color: 'bg-slate-100 text-slate-600' },
  { icon: Smartphone, name: 'Mobile / Field App', desc: 'Responsive field access', to: '/#portal', color: 'bg-stone-100 text-stone-600' },
  { icon: Bot, name: 'AI Copilot', desc: 'Ask your business anything', to: '/#copilot', color: 'bg-gradient-to-br from-brand-50 to-cyan-50 text-brand-500' },
];

export default function ModulesSection() {
  return (
    <section className="bg-white py-20" id="modules">
      <div className="section">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          One platform. <span className="gradient-text">Every module connected.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">
          These aren’t separate tools — they share the same customers, projects and money.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {modules.map((m) => (
            <Link
              key={m.name}
              to={m.to.startsWith('/#') ? m.to : m.to}
              onClick={(e) => {
                if (m.to.startsWith('/#')) {
                  e.preventDefault();
                  const id = m.to.slice(2);
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="card group p-5 transition hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-lift"
            >
              <span className={`icon-tile ${m.color}`}>
                <m.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3.5 text-sm font-bold text-navy">{m.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{m.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
