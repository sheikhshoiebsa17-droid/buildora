import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users2, Contact, Palette, Ruler, FolderKanban, Truck,
  Boxes, Building, Wallet, FolderOpen, BarChart3, Bot, Settings, Search,
  Bell, LogOut, X, Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Logo from '../common/Logo.jsx';
import NotificationBell from '../common/NotificationBell.jsx';
import GlobalSearch from '../common/GlobalSearch.jsx';

const nav = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/crm', label: 'CRM & Sales', icon: Users2 },
  { to: '/app/customers', label: 'Customers', icon: Contact },
  { to: '/app/designs', label: 'Design Studio', icon: Palette },
  { to: '/app/estimations', label: 'BOQ & Estimation', icon: Ruler },
  { to: '/app/projects', label: 'Projects', icon: FolderKanban },
  { to: '/app/procurement', label: 'Procurement', icon: Truck },
  { to: '/app/inventory', label: 'Inventory', icon: Boxes },
  { to: '/app/vendors', label: 'Vendors', icon: Building },
  { to: '/app/finance', label: 'Finance', icon: Wallet },
  { to: '/app/documents', label: 'Documents', icon: FolderOpen },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/copilot', label: 'AI Copilot', icon: Bot },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

const roleLabels = {
  super_admin: 'Super Admin', admin: 'Admin', sales_manager: 'Sales Manager',
  project_manager: 'Project Manager', designer: 'Designer',
  procurement_manager: 'Procurement', finance_manager: 'Finance',
  site_engineer: 'Site Engineer', customer: 'Customer', vendor: 'Vendor',
};

export default function AppShell() {
  const { user, logout, inDemoOrg } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-page">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-white lg:flex">
        <Link to="/" className="flex items-center gap-2 px-5 py-5" aria-label="Back to website">
          <Logo className="h-8 w-8" />
          <span className="text-lg font-extrabold text-navy">Build<span className="gradient-text">ora</span></span>
        </Link>
        <nav aria-label="Application" className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4 scrollbar-thin">
          {nav.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 ring-1 ring-brand-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-navy'
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        {inDemoOrg && (
          <div className="mx-3 mb-4 rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200">
            Demo workspace — sample data in use.
          </div>
        )}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation drawer">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-lift">
            <div className="flex items-center justify-between px-4 py-4">
              <Link to="/" className="flex items-center gap-2">
                <Logo className="h-8 w-8" />
                <span className="text-lg font-extrabold text-navy">Buildora</span>
              </Link>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close navigation" className="rounded-lg p-2 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
              {nav.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button className="rounded-lg p-2 text-navy lg:hidden" onClick={() => setDrawerOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>

            <GlobalSearch />

            <div className="ml-auto flex items-center gap-1.5">
              <NotificationBell />

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan text-xs font-bold text-white">
                    {(user?.name || 'U').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-sm font-semibold leading-tight text-navy">{user?.name}</span>
                    <span className="block text-[11px] leading-tight text-muted">{roleLabels[user?.role] || user?.role}</span>
                  </span>
                </button>
                {profileOpen && (
                  <div role="menu" className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-line bg-white p-2 shadow-lift">
                    <div className="rounded-xl px-3 py-2.5">
                      <p className="text-sm font-semibold text-navy">{user?.name}</p>
                      <p className="truncate text-xs text-muted">{user?.email}</p>
                    </div>
                    <NavLink
                      to="/app/settings"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </NavLink>
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-danger hover:bg-danger/5"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
