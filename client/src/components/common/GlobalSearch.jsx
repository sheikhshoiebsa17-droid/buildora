import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, CornerDownLeft } from 'lucide-react';
import { api } from '../../services/api.js';

const DEBOUNCE_MS = 300;

export default function GlobalSearch() {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ['global-search', debounced],
    queryFn: async () => {
      const terms = ['leads', 'customers', 'projects', 'vendors', 'invoices'];
      const results = await Promise.all(
        terms.map((t) =>
          api
            .get(`/${t}?search=${encodeURIComponent(debounced)}&limit=4`)
            .then((r) => ({ type: t, items: r.data.data || [] }))
            .catch(() => ({ type: t, items: [] }))
        )
      );
      return results.filter((r) => r.items.length > 0);
    },
    enabled: debounced.length >= 2,
  });

  const go = (type, item) => {
    setOpen(false);
    setQ('');
    const paths = {
      leads: '/app/crm',
      customers: '/app/customers',
      projects: `/app/projects/${item._id}`,
      vendors: '/app/vendors',
      invoices: '/app/finance',
    };
    navigate(paths[type] || '/app');
  };

  const navigateFirst = () => {
    const first = data?.[0];
    if (first) go(first.type, first.items[0]);
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 rounded-xl border border-line bg-page px-3.5 py-2 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-500/20">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => debounced.length >= 2 && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && data?.length) navigateFirst();
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder="Search leads, projects, invoices…"
          className="w-full bg-transparent text-sm text-navy placeholder:text-slate-400 focus:outline-none"
          aria-label="Global search"
        />
        <kbd className="hidden shrink-0 rounded border border-line bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:block">
          ⌘K
        </kbd>
      </div>

      {open && debounced.length >= 2 && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-2xl border border-line bg-white p-2 shadow-lift" role="listbox">
          {isFetching && <p className="px-3 py-4 text-sm text-muted">Searching…</p>}
          {!isFetching && !data?.length && (
            <p className="px-3 py-4 text-sm text-muted">No matches for “{debounced}”.</p>
          )}
          {data?.map((group) => (
            <div key={group.type} className="mb-1 last:mb-0">
              <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.type}
              </p>
              {group.items.map((item) => (
                <button
                  key={item._id}
                  onClick={() => go(group.type, item)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-50/60"
                  role="option"
                  aria-selected="false"
                >
                  <span className="truncate text-navy">
                    {item.name || item.title || item.number || item.poNumber || '—'}
                  </span>
                  <span className="ml-2 shrink-0 text-[10px] uppercase text-slate-400">{item.status || ''}</span>
                </button>
              ))}
            </div>
          ))}
          {data?.length > 0 && (
            <div className="flex items-center gap-1.5 border-t border-line px-3 pt-2 pb-1 text-[10px] text-slate-400">
              <CornerDownLeft className="h-3 w-3" /> open first result
            </div>
          )}
        </div>
      )}
    </div>
  );
}
