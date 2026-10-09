import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import Logo from '../common/Logo.jsx';

const columns = [
  {
    heading: 'Product',
    links: [
      ['CRM & Sales', '/app/crm'],
      ['BOQ & Estimation', '/app/estimations'],
      ['Procurement', '/app/procurement'],
      ['Finance', '/app/finance'],
      ['AI Copilot', '/#copilot'],
    ],
  },
  {
    heading: 'Solutions',
    links: [
      ['Connected workflow', '/#workflow'],
      ['Customer Portal', '/#portal'],
      ['Analytics & BI', '/app/analytics'],
      ['Design Studio', '/app/designs'],
      ['Inventory', '/app/inventory'],
    ],
  },
  {
    heading: 'Industries',
    links: [
      ['Interior design studios', '/#industries'],
      ['Builders', '/#industries'],
      ['Developers', '/#industries'],
      ['Contractors', '/#industries'],
      ['Architects', '/#industries'],
    ],
  },
  {
    heading: 'Company',
    links: [
      ['Book a demo', '/demo'],
      ['Sign in', '/login'],
      ['Create account', '/register'],
      ['Why Buildora', '/#impact'],
      ['Customer stories', '/#problems'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-slate-300">
      <div className="section grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <div className="flex items-center gap-2">
            <Logo className="h-9 w-9" />
            <span className="text-lg font-extrabold text-white">
              Build<span className="gradient-text">ora</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            The AI Operating System for interior & construction. From first lead to final handover —
            one platform, one source of truth.
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Buildora on LinkedIn"
              className="rounded-lg bg-white/5 p-2 transition hover:bg-white/10"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Buildora on X"
              className="rounded-lg bg-white/5 p-2 transition hover:bg-white/10"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Buildora on Instagram"
              className="rounded-lg bg-white/5 p-2 transition hover:bg-white/10"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        {columns.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <p className="mb-4 text-sm font-semibold text-white">{col.heading}</p>
            <ul className="space-y-2.5">
              {col.links.map(([label, to]) => (
                <li key={label}>
                  {to.startsWith('/app') ? (
                    <Link to={to} className="text-sm text-slate-400 transition hover:text-white">
                      {label}
                    </Link>
                  ) : (
                    <a href={to} className="text-sm text-slate-400 transition hover:text-white">
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="section flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 text-sm text-slate-400 md:flex-row md:gap-6">
            <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@buildora.dev</span>
            <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98XXX XXXXX</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Bengaluru, India</span>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Buildora. <a href="#top" className="hover:text-slate-300">Privacy</a> ·{' '}
            <a href="#top" className="hover:text-slate-300">Terms</a> · Built as an original product — not affiliated with any reference site.
          </p>
        </div>
      </div>
    </footer>
  );
}
