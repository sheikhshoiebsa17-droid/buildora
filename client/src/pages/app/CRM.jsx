import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Search, Users2, TrendingUp, Target, Flame, StickyNote, Repeat } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import DataTable from '../../components/common/DataTable.jsx';
import { Badge, statusTone, SectionCard, Modal, ErrorState, inr, fmtDate } from '../../components/common/ui.jsx';
import { useToast } from '../../components/common/Toast.jsx';

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const PRIORITIES = ['low', 'medium', 'high'];

export default function CRM() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [notesFor, setNotesFor] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['leads', page, search, statusFilter],
    queryFn: async () =>
      (
        await api.get('/leads', {
          params: { page, limit: 10, search: search || undefined, status: statusFilter || undefined },
        })
      ).data,
  });

  const form = useForm({
    defaultValues: {
      name: '', email: '', phone: '', source: '', interest: '', city: '',
      estimateValue: 0, priority: 'medium', followUpDate: '',
    },
  });

  const save = useMutation({
    mutationFn: (values) => (editing ? api.patch(`/leads/${editing._id}`, values) : api.post('/leads', values)),
    onSuccess: () => {
      toast.success(editing ? 'Lead updated' : 'Lead created');
      setModalOpen(false);
      setEditing(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/leads/${id}`, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const convert = useMutation({
    mutationFn: (id) => api.post(`/leads/${id}/convert`),
    onSuccess: () => {
      toast.success('Lead converted to customer + project');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: '', email: '', phone: '', source: '', interest: '', city: '', estimateValue: 0, priority: 'medium', followUpDate: '' });
    setModalOpen(true);
  };

  const openEdit = (lead) => {
    setEditing(lead);
    form.reset({
      name: lead.name, email: lead.email || '', phone: lead.phone || '', source: lead.source || '',
      interest: lead.interest || '', city: lead.city || '', estimateValue: lead.estimateValue || 0,
      priority: lead.priority || 'medium',
      followUpDate: lead.followUpDate ? new Date(lead.followUpDate).toISOString().slice(0, 10) : '',
    });
    setModalOpen(true);
  };

  const leads = data?.data || [];
  const meta = data?.meta || {};
  const won = leads.filter((l) => l.status === 'won').length;
  const pipelineValue = leads.reduce((s, l) => (['won', 'lost'].includes(l.status) ? s : s + (l.estimateValue || 0)), 0);
  const hot = leads.filter((l) => l.priority === 'high' && !['won', 'lost'].includes(l.status)).length;

  const columns = [
    { key: 'name', header: 'Lead', render: (l) => (
      <div>
        <p className="font-semibold text-navy">{l.name}</p>
        <p className="text-xs text-muted">{l.email || l.phone || '—'}</p>
      </div>
    ) },
    { key: 'interest', header: 'Interest', render: (l) => <span className="text-slate-600">{l.interest || '—'}</span> },
    { key: 'estimateValue', header: 'Value', render: (l) => <span className="font-semibold text-navy">{inr(l.estimateValue)}</span> },
    { key: 'priority', header: 'Priority', render: (l) => (
      <Badge tone={l.priority === 'high' ? 'red' : l.priority === 'medium' ? 'amber' : 'slate'}>{l.priority}</Badge>
    ) },
    { key: 'status', header: 'Status', render: (l) => (
      <select
        value={l.status}
        onChange={(e) => changeStatus.mutate({ id: l._id, status: e.target.value })}
        className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-medium text-navy focus:border-brand-300 focus:outline-none"
        aria-label={`Status for ${l.name}`}
      >
        {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
    ) },
    { key: 'followUpDate', header: 'Follow-up', render: (l) => <span className="text-slate-600">{fmtDate(l.followUpDate)}</span> },
    { key: 'actions', header: '', className: 'text-right', render: (l) => (
      <div className="flex justify-end gap-1.5">
        <button onClick={() => setNotesFor(l)} className="btn-ghost p-1.5" title="Notes & activity" aria-label={`Notes for ${l.name}`}>
          <StickyNote className="h-4 w-4" />
        </button>
        {l.status !== 'won' && (
          <button onClick={() => convert.mutate(l._id)} className="btn-ghost p-1.5" title="Convert to customer" aria-label={`Convert ${l.name}`}>
            <Repeat className="h-4 w-4" />
          </button>
        )}
        <button onClick={() => openEdit(l)} className="btn-secondary px-2.5 py-1 text-xs">Edit</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">CRM &amp; Sales</h1>
          <p className="mt-1 text-sm text-muted">Capture, qualify and convert — every enquiry in one pipeline.</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> New lead</button>
      </div>

      {/* Pipeline stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users2} tone="bg-brand-50 text-brand-500" label="Leads in view" value={meta.total ?? leads.length} />
        <Stat icon={Target} tone="bg-emerald-50 text-success" label="Won this view" value={won} />
        <Stat icon={TrendingUp} tone="bg-sky-50 text-accent-blue" label="Open pipeline value" value={inr(pipelineValue)} />
        <Stat icon={Flame} tone="bg-rose-50 text-danger" label="High priority open" value={hot} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search leads…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Search leads"
          />
        </div>
        <select className="input w-auto" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {isError ? (
        <ErrorState message={errMsg(error)} onRetry={refetch} />
      ) : (
        <SectionCard title="Lead pipeline" subtitle="Click a status to update it inline">
          <DataTable
            columns={columns}
            rows={leads}
            loading={isLoading}
            page={meta.page || 1}
            pages={meta.pages || 1}
            total={meta.total || 0}
            onPage={setPage}
            empty={<p className="text-center text-sm text-muted py-6">No leads yet. Capture your first enquiry to get started.</p>}
          />
        </SectionCard>
      )}

      {/* Create / edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit lead — ${editing.name}` : 'New lead'}>
        <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Name *" error={form.formState.errors.name?.message}>
            <input className="input" {...form.register('name', { required: 'Name is required' })} />
          </Field>
          <Field label="Email">
            <input className="input" type="email" {...form.register('email')} />
          </Field>
          <Field label="Phone">
            <input className="input" {...form.register('phone')} />
          </Field>
          <Field label="Source">
            <input className="input" placeholder="Website / referral / walk-in" {...form.register('source')} />
          </Field>
          <Field label="Interest">
            <input className="input" placeholder="3BHK interior…" {...form.register('interest')} />
          </Field>
          <Field label="City">
            <input className="input" {...form.register('city')} />
          </Field>
          <Field label="Estimate value (₹)">
            <input className="input" type="number" min="0" {...form.register('estimateValue', { valueAsNumber: true })} />
          </Field>
          <Field label="Priority">
            <select className="input" {...form.register('priority')}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Follow-up date">
            <input className="input" type="date" {...form.register('followUpDate')} />
          </Field>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={save.isPending} className="btn-primary">
              {editing ? 'Save changes' : 'Create lead'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Notes drawer */}
      <NotesModal lead={notesFor} onClose={() => setNotesFor(null)} />
    </div>
  );
}

function NotesModal({ lead, onClose }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [note, setNote] = useState('');

  const { data } = useQuery({
    queryKey: ['lead', lead?._id],
    enabled: !!lead,
    queryFn: async () => (await api.get(`/leads/${lead._id}`)).data.data,
  });

  const add = useMutation({
    mutationFn: () => api.post(`/leads/${lead._id}/notes`, { body: note }),
    onSuccess: () => {
      setNote('');
      toast.success('Note added');
      queryClient.invalidateQueries({ queryKey: ['lead', lead._id] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  if (!lead) return null;
  const notes = data?.notes || [];
  const activity = data?.activity || [];

  return (
    <Modal open onClose={onClose} title={`Notes — ${lead.name}`} wide>
      <div className="flex gap-2">
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" aria-label="New note" />
        <button onClick={() => note.trim() && add.mutate()} className="btn-primary shrink-0" disabled={add.isPending}>Add</button>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Notes</p>
          {notes.length === 0 && <p className="text-sm text-muted">No notes yet.</p>}
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n._id} className="rounded-xl bg-page px-3.5 py-2.5 text-sm text-slate-700">{n.body}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Activity history</p>
          {activity.length === 0 && <p className="text-sm text-muted">No activity recorded.</p>}
          <ul className="space-y-2">
            {activity.slice().reverse().map((a, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                <span>
                  <span className="text-navy">{a.detail || a.type}</span>
                  <span className="block text-[10px] text-slate-400">{new Date(a.at).toLocaleString('en-IN')}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}

export function Stat({ icon: Icon, tone, label, value }) {
  return (
    <article className="card flex items-center gap-4 p-5">
      <span className={`icon-tile ${tone}`}><Icon className="h-5 w-5" /></span>
      <div className="min-w-0">
        <p className="truncate text-xl font-extrabold text-navy">{value}</p>
        <p className="truncate text-xs text-muted">{label}</p>
      </div>
    </article>
  );
}

export function Field({ label, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-danger" role="alert">{error}</p>}
    </div>
  );
}
