import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { api } from '../../services/api.js';

const TYPE_TONE = {
  lead_assigned: 'text-brand-500 bg-brand-50',
  estimate_sent: 'text-warning bg-amber-50',
  po_approved: 'text-success bg-emerald-50',
  invoice_created: 'text-accent-blue bg-sky-50',
  system: 'text-slate-500 bg-slate-100',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications?limit=15')).data,
    refetchInterval: 60_000,
  });

  const markRead = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const items = data?.data || [];
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-navy"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        aria-expanded={open}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-line bg-white p-2 shadow-lift" role="menu" aria-label="Notifications">
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-sm font-bold text-navy">Notifications</p>
            {unread > 0 && (
              <button onClick={() => markAllRead.mutate()} className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">No notifications yet. Business events will appear here.</p>
          ) : (
            <ul className="max-h-96 space-y-1 overflow-y-auto scrollbar-thin">
              {items.map((n) => (
                <li key={n._id}>
                  <button
                    onClick={() => !n.read && markRead.mutate(n._id)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 ${!n.read ? 'bg-brand-50/50' : ''}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-slate-200' : 'bg-brand-500'}`} />
                      <span>
                        <span className="block text-sm font-medium text-navy">{n.title}</span>
                        {n.body && <span className="mt-0.5 block text-xs leading-relaxed text-muted">{n.body}</span>}
                        <span className="mt-1 block text-[10px] text-slate-400">
                          {new Date(n.date || n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
