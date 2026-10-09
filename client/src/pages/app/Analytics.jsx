import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Target, PieChart as PieIcon } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import { SectionCard, ErrorState, SkeletonCard, inr } from '../../components/common/ui.jsx';
import { Stat } from './CRM.jsx';

const PIE_COLORS = ['#6545f5', '#4385f5', '#19b7d5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => (await api.get('/analytics/overview')).data.data,
  });

  if (isError) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">Performance Analytics</h1>
          <p className="mt-1 text-sm text-muted">Real-time revenue, budget utilization, and operational KPIs.</p>
        </div>
        <ErrorState message={errMsg(error)} onRetry={refetch} />
      </div>
    );
  }

  const overview = data || {};
  const revenueTrend = overview.revenueTrend || [];
  const budgetVsActual = overview.budgetVsActual || [];
  const projectStatus = overview.projectStatus || [];
  const leadFunnel = overview.leadFunnel || [];

  const totalRevenue = revenueTrend.reduce((acc, r) => acc + (r.revenue || 0), 0);
  const totalInvoiced = revenueTrend.reduce((acc, r) => acc + (r.invoiced || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy">Performance Analytics</h1>
        <p className="mt-1 text-sm text-muted">Operational intelligence across revenue trajectories, project budgets, and lead conversion.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Stat
          icon={TrendingUp}
          tone="bg-brand-50 text-brand-600"
          label="Total Realized Revenue"
          value={inr(totalRevenue)}
        />
        <Stat
          icon={DollarSign}
          tone="bg-sky-50 text-sky-600"
          label="Gross Invoiced Volume"
          value={inr(totalInvoiced)}
        />
        <Stat
          icon={Target}
          tone="bg-emerald-50 text-emerald-600"
          label="Active Projects Monitored"
          value={budgetVsActual.length}
        />
        <Stat
          icon={BarChart3}
          tone="bg-violet-50 text-violet-600"
          label="Leads in Pipeline"
          value={leadFunnel.reduce((acc, l) => acc + (l.count || 0), 0)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SkeletonCard lines={6} />
          <SkeletonCard lines={6} />
        </div>
      ) : (
        <>
          {/* Revenue & Billing Trajectory */}
          <SectionCard
            title="Monthly Cash Collections vs Invoicing"
            subtitle="Comparing tax invoices generated against actual cash receipts"
          >
            <div className="p-5">
              <div className="h-72 w-full">
                {revenueTrend.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted">
                    No billing transactions recorded in this period yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6545f5" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6545f5" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#19b7d5" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#19b7d5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5eaf2" vertical={false} />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => [inr(value), '']} />
                      <Legend />
                      <Area type="monotone" dataKey="invoiced" name="Invoiced" stroke="#19b7d5" fillOpacity={1} fill="url(#colorInv)" strokeWidth={2} />
                      <Area type="monotone" dataKey="revenue" name="Collected" stroke="#6545f5" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </SectionCard>

          {/* Budget vs Actual Expenditure */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard
              title="Project Budget vs Actual Spent"
              subtitle="Material and labour expenditures against allocated ceilings"
            >
              <div className="p-5">
                <div className="h-64 w-full">
                  {budgetVsActual.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted">
                      No project budgets defined yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgetVsActual} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5eaf2" vertical={false} />
                        <XAxis dataKey="project" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value) => [inr(value), '']} />
                        <Legend />
                        <Bar dataKey="allocated" name="Allocated Budget" fill="#4385f5" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="spent" name="Spent to Date" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Lead Funnel Breakdown */}
            <SectionCard
              title="Lead Pipeline Status Distribution"
              subtitle="Inbound prospect movement across qualification stages"
            >
              <div className="p-5">
                <div className="h-64 w-full">
                  {leadFunnel.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted">
                      No lead records available.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leadFunnel}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {leadFunnel.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
