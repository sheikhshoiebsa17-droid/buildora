import React from 'react';
import { Inbox, CloudLightning, X } from 'lucide-react';

/* ---------- Badge with tone (never color-only: includes dot/icon) ---------- */
const TONES = {
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  red: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  blue: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  violet: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  slate: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

export function Badge({ tone = 'slate', children, dot = true }) {
  return (
    <span className={`chip ${TONES[tone] || TONES.slate}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />}
      {children}
    </span>
  );
}

export const statusTone = {
  new: 'blue', contacted: 'slate', qualified: 'violet', proposal: 'amber', won: 'green', lost: 'red',
  draft: 'slate', internal_review: 'amber', sent: 'blue', client_approved: 'green', rejected: 'red', superseded: 'slate',
  planning: 'slate', design: 'violet', in_progress: 'blue', on_hold: 'amber', completed: 'green', cancelled: 'red',
  todo: 'slate', review: 'amber', done: 'green',
  pending_approval: 'amber', approved: 'green', ordered: 'blue', partially_received: 'amber', received: 'green',
  pending: 'amber', partially_paid: 'amber', paid: 'green', overdue: 'red',
  active: 'green', inactive: 'slate',
  changes_requested: 'amber',
};

/* ---------- Empty state ---------- */
export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <span className="icon-tile bg-page text-slate-400" style={{ width: 56, height: 56 }}>
        <Inbox className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-base font-bold text-navy">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- Error state ---------- */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/50 px-6 py-14 text-center">
      <span className="icon-tile bg-rose-100 text-danger" style={{ width: 56, height: 56 }}>
        <CloudLightning className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-base font-bold text-navy">Something went wrong</h3>
      <p className="mt-1.5 max-w-sm text-sm text-danger">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-5">Try again</button>
      )}
    </div>
  );
}

/* ---------- Section card ---------- */
export function SectionCard({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-navy sm:text-base">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="absolute inset-0 bg-navy/45" onClick={onClose} aria-hidden="true" />
      <div className={`relative max-h-[88vh] w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} overflow-y-auto rounded-2xl bg-white p-6 shadow-lift scrollbar-thin`}>
        <div className="mb-5 flex items-start justify-between">
          <h2 className="text-lg font-bold text-navy">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-slate-100" aria-label="Close dialog">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Skeletons ---------- */
export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`card p-5 ${className}`} aria-hidden="true">
      <div className="h-3 w-1/3 rounded bg-slate-200" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 rounded bg-slate-100" style={{ width: `${90 - i * 12}%` }} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="card" aria-hidden="true">
      <div className="border-b border-line px-5 py-4">
        <div className="h-3 w-40 rounded bg-slate-200" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-line/60 px-5 py-3.5 last:border-0">
          <div className="h-3 w-1/4 rounded bg-slate-100" />
          <div className="h-3 w-1/6 rounded bg-slate-100" />
          <div className="ml-auto h-5 w-14 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

/* ---------- Currency / date helpers ---------- */
export const inr = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
