import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Search, Contact } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import DataTable from '../../components/common/DataTable.jsx';
import { Badge, statusTone, SectionCard, Modal, ErrorState, fmtDate } from '../../components/common/ui.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { Stat, Field } from './CRM.jsx';

export default function Customers() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailFor, setDetailFor] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: async () => (await api.get('/customers', { params: { page, limit: 10, search: search || undefined } })).data,
  });

  const form = useForm({ defaultValues: { name: '', email: '', phone: '', address: '', city: '', notes: '' } });

  const save = useMutation({
    mutationFn: (values) => (editing ? api.patch(`/customers/${editing._id}`, values) : api.post('/customers', values)),
    onSuccess: () => {
      toast.success(editing ? 'Customer updated' : 'Customer added');
      setModalOpen(false);
      setEditing(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: '', email: '', phone: '', address: '', city: '', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    form.reset({ name: c.name, email: c.email || '', phone: c.phone, address: c.address || '', city: c.city || '', notes: c.notes || '' });
    setModalOpen(true);
  };

  const columns = [
    { key: 'name', header: 'Customer', render: (c) => (
      <button onClick={() => setDetailFor(c._id)} className="text-left font-semibold text-brand-600 hover:underline">{c.name}</button>
    ) },
    { key: 'phone', header: 'Phone', render: (c) => <span className="text-slate-600">{c.phone}</span> },
    { key: 'email', header: 'Email', render: (c) => <span className="text-slate-600">{c.email || '—'}</span> },
    { key: 'city', header: 'City', render: (c) => <span className="text-slate-600">{c.city || '—'}</span> },
    { key: 'status', header: 'Status', render: (c) => <Badge tone={statusTone[c.status]}>{c.status}</Badge> },
    { key: 'createdAt', header: 'Added', render: (c) => <span className="text-slate-500">{fmtDate(c.createdAt)}</span> },
    { key: 'actions', header: '', className: 'text-right', render: (c) => (
      <button onClick={() => openEdit(c)} className="btn-secondary px-2.5 py-1 text-xs">Edit</button>
    ) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">Customers</h1>
          <p className="mt-1 text-sm text-muted">Every client, their projects and history — deduplicated by phone.</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> Add customer</button>
      </div>

      <Stat icon={Contact} tone="bg-sky-50 text-accent-blue" label="Customers in view" value={data?.meta?.total ?? 0} />

      <div className="relative sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Search customers…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} aria-label="Search customers" />
      </div>

      {isError ? (
        <ErrorState message={errMsg(error)} onRetry={refetch} />
      ) : (
        <SectionCard title="Customer directory">
          <DataTable
            columns={columns}
            rows={data?.data || []}
            loading={isLoading}
            page={data?.meta?.page || 1}
            pages={data?.meta?.pages || 1}
            total={data?.meta?.total || 0}
            onPage={setPage}
            empty={<p className="py-6 text-center text-sm text-muted">No customers yet. Convert a won lead or add one directly.</p>}
          />
        </SectionCard>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit — ${editing.name}` : 'Add customer'}>
        <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Name *" error={form.formState.errors.name?.message}>
            <input className="input" {...form.register('name', { required: 'Name is required' })} />
          </Field>
          <Field label="Phone *" error={form.formState.errors.phone?.message}>
            <input className="input" {...form.register('phone', { required: 'Phone is required' })} />
          </Field>
          <Field label="Email">
            <input className="input" type="email" {...form.register('email')} />
          </Field>
          <Field label="City">
            <input className="input" {...form.register('city')} />
          </Field>
          <Field label="Address">
            <input className="input sm:col-span-2" {...form.register('address')} />
          </Field>
          <Field label="Notes">
            <textarea className="input resize-none sm:col-span-2" rows={3} {...form.register('notes')} />
          </Field>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Save' : 'Add customer'}</button>
          </div>
        </form>
      </Modal>

      <CustomerDetail id={detailFor} onClose={() => setDetailFor(null)} />
    </div>
  );
}

function CustomerDetail({ id, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['customer', id],
    enabled: !!id,
    queryFn: async () => (await api.get(`/customers/${id}`)).data.data,
  });

  if (!id) return null;
  const projects = data?.projects || [];

  return (
    <Modal open onClose={onClose} title={data?.name || 'Customer'} wide>
      {isLoading ? (
        <p className="py-6 text-sm text-muted">Loading…</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 text-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Contact</p>
            <p className="text-slate-700">{data?.phone}</p>
            <p className="text-slate-700">{data?.email || '—'}</p>
            <p className="text-slate-500">{data?.address || '—'}{data?.city ? `, ${data.city}` : ''}</p>
            {data?.notes && <p className="mt-3 whitespace-pre-line rounded-xl bg-page p-3 text-slate-600">{data.notes}</p>}
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Projects</p>
            {projects.length === 0 ? <p className="text-sm text-muted">No projects linked yet.</p> : (
              <ul className="space-y-2">
                {projects.map((p) => (
                  <li key={p._id} className="rounded-xl border border-line px-3.5 py-2.5">
                    <p className="text-sm font-semibold text-navy">{p.name}</p>
                    <p className="text-xs text-muted">{p.status.replace(/_/g, ' ')} · {p.progress ?? 0}% complete</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
