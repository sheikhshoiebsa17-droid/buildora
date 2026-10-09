import React from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X, ArrowRight } from 'lucide-react';
import Logo from '../common/Logo.jsx';
import Footer from './Footer.jsx';

const platformLinks = [
  { to: '/app/crm', label: 'CRM & Sales', desc: 'Capture leads, run pipeline' },
  { to: '/app/designs', label: 'Design Studio', desc: 'Concepts & approvals' },
  { to: '/app/estimations', label: 'BOQ & Estimation', desc: 'Line-item BOQs with GST' },
  { to: '/app/projects', label: 'Projects', desc: 'Execution & progress' },
  { to: '/app/procurement', label: 'Procurement', desc: 'PR → PO → Receipt' },
  { to: '/app/inventory', label: 'Inventory', desc: 'Stock & low-stock alerts' },
  { to: '/app/finance', label: 'Finance', desc: 'Invoices & receivables' },
  { to: '/app/analytics', label: 'Analytics & BI', desc: 'Revenue & cost charts' },
];

const navItems = [
  { label: 'Platform', dropdown: platformLinks },
  { label: 'Solutions', href: '/#workflow' },
  { label: 'AI Copilot', href: '/#copilot' },
  { label: 'Industries', href: '/#industries' },
  { label: 'Why Buildora', href: '/#impact' },
];

function NavDropdown({ item, closeAll }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      >
        {item.label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute left-1/2 top-full z-50 w-[430px] -translate-x-1/2 pt-2"
          role="menu"
        >
          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-white p-3 shadow-lift">
            {item.dropdown.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                role="menuitem"
                onClick={() => { setOpen(false); closeAll?.(); }}
                className="rounded-xl p-3 transition hover:bg-brand-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
              >
                <p className="text-sm font-semibold text-navy">{l.label}</p>
                <p className="text-xs text-muted">{l.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMobileOpen(false), [location]);

  const isHashLink = (item) => !!item.href?.includes('#');

  const handleHashClick = (e, href) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const id = href.slice(2);
      if (location.pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.assign(`/${href.slice(1)}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-50 border-b border-line/80 bg-white/90 backdrop-blur">
        <div className="section flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="Buildora home">
            <Logo className="h-8 w-8" />
            <span className="text-lg font-extrabold tracking-tight text-navy">
              Build<span className="gradient-text">ora</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {navItems.map((item) =>
              item.dropdown ? (
                <NavDropdown key={item.label} item={item} />
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleHashClick(e, item.href)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
                >
                  {item.label}
                </a>
              )
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <NavLink
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-navy hover:text-brand-600"
            >
              Sign in
            </NavLink>
            <Link to="/demo" className="btn-primary">
              Book a demo
            </Link>
          </div>

          <button
            className="rounded-lg p-2 text-navy lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-line bg-white px-4 pb-6 pt-2 lg:hidden">
            {navItems.map((item) =>
              item.dropdown ? (
                <div key={item.label} className="py-2">
                  <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">{item.label}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {item.dropdown.map((l) => (
                      <Link key={l.label} to={l.to} className="rounded-lg p-2 text-sm hover:bg-brand-50/60">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleHashClick(e, item.href)}
                  className="block rounded-lg px-2 py-2 text-sm font-medium text-navy hover:bg-slate-50"
                >
                  {item.label}
                </a>
              )
            )}
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/login" className="btn-secondary w-full justify-center">Sign in</Link>
              <Link to="/demo" className="btn-primary w-full justify-center">Book a demo <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        )}
      </header>

      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
