import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Search, FolderKanban } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import DataTable from '../../components/common/DataTable.jsx';
import { Badge, statusTone, SectionCard, Modal, ErrorState, inr, fmtDate } from '../../components/common/ui.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { Field } from './CRM.jsx';

export default function ProjectsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['projects', page, search, statusFilter],
    queryFn: async () => (await api.get('/projects', { params: { page, limit: 10, search: search || undefined, status: statusFilter || undefined } })).data,
  });

  const { data: customers } = useQuery({
    queryKey: ['customers-active'],
    queryFn: async () => (await api.get('/customers?limit=100')).data.data,
  });

  const form = useForm({
    defaultValues: { name: '', type: 'interior', customer: '', city: '', siteAddress: '', status: 'planning', startDate: '', targetDate: '', allocated: 0, description: '' },
  });

  const create = useMutation({
    mutationFn: (values) => api.post('/projects', values),
    onSuccess: () => {
      toast.success('Project created');
      setModalOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const columns = [
    { key: 'name', header: 'Project', render: (p) => (
      <div>
        <button onClick={() => navigate(`/app/projects/${p._id}`)} className="text-left font-semibold text-brand-600 hover:underline">{p.name}</button>
        <p className="text-xs text-muted">{p.code} · {p.city || '—'}</p>
      </div>
    ) },
    { key: 'customer', header: 'Customer', render: (p) => <span className="text-slate-600">{p.customer?.name || '—'}</span> },
    { key: 'status', header: 'Status', render: (p) => <Badge tone={statusTone[p.status]}>{p.status.replace(/_/g, ' ')}</Badge> },
    { key: 'progress', header: 'Progress', render: (p) => (
      <div className="w-28">
        <div className="h-2 rounded-full bg-slate-100">
          <div
            className={`h-2 rounded-full ${p.budget?.allocated && p.budget?.spent > p.budget.allocated ? 'bg-danger' : 'bg-gradient-to-r from-brand-500 to-accent-cyan'}`}
            style={{ width: `${p.progress || 0}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] font-semibold text-slate-500">{p.progress || 0}%</p>
      </div>
    ) },
    { key: 'budget', header: 'Budget used', render: (p) => {
      const allocated = p.budget?.allocated || 0;
      const spent = p.budget?.spent || 0;
      const pct = allocated ? Math.round((spent / allocated) * 100) : 0;
      return (
        <div className="w-28">
          <p className="text-xs font-semibold text-navy">{inr(spent)} <span className="font-normal text-muted">/ {inr(allocated)}</span></p>
          <div className="mt-1 h-1.5 rounded-full bg-slate-100">
            <div className={`h-1.5 rounded-full ${pct > 100 ? 'bg-danger' : pct > 80 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <p className={`mt-0.5 text-[10px] font-semibold ${pct > 100 ? 'text-danger' : 'text-muted'}`}>{pct}%</p>
        </div>
      );
    } },
    { key: 'targetDate', header: 'Target', render: (p) => <span className="text-slate-600">{fmtDate(p.targetDate)}</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">Projects</h1>
          <p className="mt-1 text-sm text-muted">Execution, budgets and progress across the portfolio.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> New project</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search projects…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} aria-label="Search projects" />
        </div>
        <select className="input w-auto" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} aria-label="Filter by status">
          <option value="">All statuses</option>
          {['planning', 'design', 'in_progress', 'on_hold', 'completed', 'cancelled'].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {isError ? (
        <ErrorState message={errMsg(error)} onRetry={refetch} />
      ) : (
        <SectionCard title="Portfolio">
          <DataTable
            columns={columns}
            rows={data?.data || []}
            loading={isLoading}
            page={data?.meta?.page || 1}
            pages={data?.meta?.pages || 1}
            total={data?.meta?.total || 0}
            onPage={setPage}
            empty={<p className="py-6 text-center text-sm text-muted">No projects yet — create one or convert a won lead.</p>}
          />
        </SectionCard>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New project" wide>
        <form onSubmit={form.handleSubmit((v) => create.mutate({ ...v, budget: { allocated: Number(v.allocated) || 0 } }))} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Project name *"><input className="input sm:col-span-2" {...form.register('name', { required: 'Name is required' })} /></Field>
          <Field label="Type">
            <select className="input" {...form.register('type')}>
              {['interior', 'construction', 'renovation', 'other'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Customer">
            <select className="input" {...form.register('customer')}>
              <option value="">— Select —</option>
              {(customers || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="City"><input className="input" {...form.register('city')} /></Field>
          <Field label="Status">
            <select className="input" {...form.register('status')}>
              {['planning', 'design', 'in_progress', 'on_hold'].map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </Field>
          <Field label="Start date"><input className="input" type="date" {...form.register('startDate')} /></Field>
          <Field label="Target completion"><input className="input" type="date" {...form.register('targetDate')} /></Field>
          <Field label="Budget (₹)"><input className="input" type="number" min="0" {...form.register('allocated', { valueAsNumber: true })} /></Field>
          <Field label="Site address"><input className="input" {...form.register('siteAddress')} /></Field>
          <Field label="Notes"><textarea className="input resize-none sm:col-span-2" rows={3} {...form.register('description')} /></Field>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={create.isPending} className="btn-primary">Create project</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
