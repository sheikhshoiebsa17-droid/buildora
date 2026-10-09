import React from 'react';
import { TrendingUp, Brain, CheckCircle2, Wallet } from 'lucide-react';
import {
  BarChart, Bar, XAxis, ResponsiveContainer, Cell,
} from 'recharts';

const budgetData = [
  { name: 'Jun', value: 42 },
  { name: 'Jul', value: 58 },
  { name: 'Aug', value: 51 },
  { name: 'Sep', value: 74 },
  { name: 'Oct', value: 88 },
  { name: 'Nov', value: 96 },
];

const BAR_COLORS = ['#19B7D5'];

export default function DashboardMock() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      {/* Laptop base */}
      <div className="rounded-[22px] border border-line bg-navy p-2 shadow-lift">
        <div className="overflow-hidden rounded-[16px] bg-[#F7F9FC]">
          {/* App chrome */}
          <div className="flex items-center gap-1.5 border-b border-line bg-white px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
            <div className="ml-3 h-5 flex-1 rounded-md bg-page" />
          </div>

          <div className="flex">
            {/* Mini sidebar */}
            <div className="hidden w-[132px] flex-col gap-1 border-r border-line bg-white p-3 sm:flex">
              <div className="mb-2 flex items-center gap-1.5">
                <div className="h-5 w-5 rounded-md bg-gradient-to-br from-brand-500 to-accent-cyan" />
                <div className="h-2 w-14 rounded bg-slate-200" />
              </div>
              {[36, 28, 44, 30, 38].map((w, i) => (
                <div
                  key={i}
                  className={`h-5 rounded-md ${i === 0 ? 'bg-brand-50 ring-1 ring-brand-100' : ''}`}
                  style={{ width: '100%' }}
                >
                  <div className="m-1.5 h-2 rounded bg-slate-200" style={{ width: `${w + 20}%` }} />
                </div>
              ))}
            </div>

            {/* Main panel */}
            <div className="flex-1 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-2.5 w-24 rounded bg-slate-300" />
                  <div className="mt-1.5 h-2 w-32 rounded bg-slate-200" />
                </div>
                <div className="flex gap-1.5">
                  <div className="h-6 w-16 rounded-md bg-brand-500/90" />
                  <div className="h-6 w-6 rounded-md bg-page" />
                </div>
              </div>

              {/* KPI row */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Kpi label="Revenue" value="₹48.2L" delta="+12.4%" />
                <Kpi label="Active projects" value="14" delta="3 new" />
                <Kpi label="Open leads" value="27" delta="+5" />
              </div>

              {/* Charts row */}
              <div className="mt-2.5 grid grid-cols-5 gap-2">
                <div className="col-span-3 rounded-lg border border-line bg-white p-2.5">
                  <p className="mb-1 text-[9px] font-semibold text-slate-400">REVENUE VS BUDGET</p>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgetData} barSize={10}>
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 8, fill: '#94A3B8' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {budgetData.map((_, i) => (
                            <Cell key={i} fill={BAR_COLORS[0]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="col-span-2 rounded-lg border border-line bg-white p-2.5">
                  <p className="mb-1.5 text-[9px] font-semibold text-slate-400">PROJECT PROGRESS</p>
                  {[
                    ['3BHK Whitefield', 68, 'bg-brand-500'],
                    ['Villa Kochi', 34, 'bg-accent-cyan'],
                    ['Powai Office', 91, 'bg-success'],
                  ].map(([label, pct, color]) => (
                    <div key={label} className="mb-2 last:mb-0">
                      <div className="flex justify-between text-[8.5px] text-muted">
                        <span>{label}</span>
                        <span className="font-semibold">{pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI insight strip */}
              <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-navy p-2.5 text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-brand-500 to-accent-cyan">
                  <Brain className="h-3.5 w-3.5" />
                </span>
                <p className="text-[9.5px] leading-snug text-slate-200">
                  <span className="font-semibold text-white">AI insight:</span> PRJ-0003 is trending 6% over budget —
                  review paint POs before Friday.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Laptop base lip */}
      <div className="mx-auto h-2.5 w-[74%] rounded-b-xl bg-slate-200" />

      {/* Overdue AR chip */}
      <div className="absolute -right-2 top-3 flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 shadow-card sm:-right-6">
        <Wallet className="h-3.5 w-3.5 text-danger" />
        <span className="text-[10px] font-semibold text-navy">₹8.2L overdue AR</span>
      </div>
      <div className="absolute right-4 -bottom-1 flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 shadow-card sm:right-10">
        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
        <span className="text-[10px] font-semibold text-navy">5 approvals pending</span>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta }) {
  return (
    <div className="rounded-lg border border-line bg-white p-2">
      <p className="text-[8.5px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-navy">{value}</p>
      <p className="flex items-center gap-0.5 text-[8.5px] font-semibold text-success">
        <TrendingUp className="h-2.5 w-2.5" />
        {delta}
      </p>
    </div>
  );
}
