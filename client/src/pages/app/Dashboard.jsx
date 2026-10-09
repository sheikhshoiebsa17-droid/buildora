import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Wallet, FolderKanban, Users2, AlertTriangle, TrendingUp, ArrowRight, CheckSquare, Package, Bot,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { api, errMsg } from '../../services/api.js';
import { ErrorState, SkeletonCard, inr } from '../../components/common/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const STATUS_COLORS = {
  planning: '#94A3B8',
  design: '#8B5CF6',
  in_progress: '#4385F5',
  on_hold: '#F59E0B',
  completed: '#10B981',
  cancelled: '#EF4444',
};

export default function Dashboard() {
  const { user, inDemoOrg } = useAuth();
  const [range, setRange] = useState('30');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => (await api.get('/dashboard/overview')).data.data,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (isError) {
    return <ErrorState message={errMsg(error)} onRetry={refetch} />;
  }

  const kpis = data?.metricsKpis || [];
  const kpiIcons = { revenue: Wallet, invoice: AlertTriangle, project: FolderKanban, lead: Users2 };

  const trend = data?.revenueTrend?.length
    ? data.revenueTrend
    : []; // backend wires this from invoices in stage 9 hardening

  const statusData = (data?.projectStatusBreakdown || []).map((s) => ({
    name: s.status,
    value: s.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">
            Good to see you, {(user?.name || '').split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-muted">
            Here’s what’s moving across {inDemoOrg ? 'the demo workspace' : 'your business'}.
            {inDemoOrg && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Sample data</span>}
          </p>
        </div>
        <select value={range} onChange={(e) => setRange(e.target.value)} className="input w-auto sm:w-44" aria-label="Date range">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last quarter</option>
        </select>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = kpiIcons[k.icon] || Wallet;
          return (
            <article key={k.label} className="card p-5">
              <div className="flex items-start justify-between">
                <span className={`icon-tile ${k.status === 'positive' ? 'bg-emerald-50 text-success' : k.status === 'warning' ? 'bg-amber-50 text-warning' : 'bg-brand-50 text-brand-500'}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <TrendingUp className="h-4 w-4 text-slate-300" />
              </div>
              <p className="mt-4 text-2xl font-extrabold tracking-tight text-navy">
                {k.format === 'currency' ? inr(k.value) : k.value.toLocaleString('en-IN')}
              </p>
              <p className="mt-0.5 text-sm text-muted">{k.label}</p>
            </article>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-bold text-navy">Revenue vs budget</h2>
          {trend.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center gap-2 text-sm text-muted">
              <Bot className="h-6 w-6 text-slate-300" />
              Revenue trend appears once invoices are recorded in this period.
            </div>
          ) : (
            <div className="mt-4 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6545F5" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#6545F5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF2" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#64748B" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#64748B" tickFormatter={(v) => `${Math.round(v / 100000) || 0}L`} />
                  <Tooltip formatter={(v) => inr(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E5EAF2' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#6545F5" strokeWidth={2.5} fill="url(#rev)" name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-bold text-navy">Projects by status</h2>
          {statusData.length === 0 ? (
            <div className="flex h-60 items-center justify-center text-sm text-muted">No projects yet.</div>
          ) : (
            <div className="mt-4 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4}>
                    {statusData.map((s) => (
                      <Cell key={s.name} fill={STATUS_COLORS[s.name.replace(/ /g, '_')] || '#94A3B8'} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600">{v.replace(/_/g, ' ')}</span>} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5EAF2' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      {/*(action rows) */}
      <div className="grid gap-4 md:grid-cols-3">
        <ActionRow icon={CheckSquare} tone="bg-amber-50 text-warning" label="Pending approvals" value={data?.pendingApprovals ?? 0} to="/app/procurement" cta="Review POs" />
        <ActionRow icon={Package} tone="bg-rose-50 text-danger" label="Low-stock items" value={data?.lowStockCount ?? 0} to="/app/inventory" cta="Manage stock" />
        <ActionRow icon={Wallet} tone="bg-sky-50 text-accent-blue" label="Vendor bills pending" value={data?.pendingVendorBills ?? 0} to="/app/finance" cta="Open finance" />
      </div>
    </div>
  );
}

function ActionRow({ icon: Icon, tone, label, value, to, cta }) {
  return (
    <Link to={to} className="card flex items-center gap-4 p-5 transition hover:border-brand-100 hover:shadow-lift">
      <span className={`icon-tile ${tone}`}><Icon className="h-5 w-5" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-extrabold text-navy">{value}</p>
        <p className="truncate text-sm text-muted">{label}</p>
      </div>
      <span className="flex items-center gap-1 text-xs font-semibold text-brand-600">
        {cta} <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
