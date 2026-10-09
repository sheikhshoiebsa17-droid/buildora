import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Search, Building2, Phone, Mail, Star, MapPin, Tag } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import DataTable from '../../components/common/DataTable.jsx';
import { Badge, statusTone, SectionCard, Modal, ErrorState, EmptyState, SkeletonTable, fmtDate } from '../../components/common/ui.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { Stat, Field } from './CRM.jsx';

export default function Vendors() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['vendors', page, search],
    queryFn: async () => (await api.get('/vendors', { params: { page, limit: 10, search: search || undefined } })).data,
  });

  const form = useForm({
    defaultValues: {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
      rating: 5,
      notes: '',
    },
  });

  const save = useMutation({
    mutationFn: (values) => (editing ? api.patch(`/vendors/${editing._id}`, values) : api.post('/vendors', values)),
    onSuccess: () => {
      toast.success(editing ? 'Vendor updated' : 'Vendor added');
      setModalOpen(false);
      setEditing(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
      rating: 5,
      notes: '',
    });
    setModalOpen(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    form.reset({
      name: v.name,
      contactPerson: v.contactPerson || '',
      email: v.email || '',
      phone: v.phone || '',
      address: v.address || '',
      gstin: v.gstin || '',
      rating: v.rating ?? 5,
      notes: v.notes || '',
    });
    setModalOpen(true);
  };

  const vendors = data?.data || [];
  const total = data?.total || vendors.length;
  const activeCount = vendors.filter((v) => v.status !== 'inactive').length;

  const columns = [
    {
      key: 'name',
      header: 'Vendor Name',
      render: (v) => (
        <div>
          <button onClick={() => openEdit(v)} className="text-left font-semibold text-brand-600 hover:underline">
            {v.name}
          </button>
          {v.contactPerson && <div className="text-xs text-muted">Attn: {v.contactPerson}</div>}
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (v) => (
        <div className="space-y-0.5 text-xs text-slate-600">
          {v.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-slate-400" />{v.phone}</div>}
          {v.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-400" />{v.email}</div>}
        </div>
      ),
    },
    {
      key: 'gstin',
      header: 'GSTIN',
      render: (v) => <span className="font-mono text-xs text-slate-600">{v.gstin || '—'}</span>,
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (v) => (
        <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {v.rating ?? 5}/5
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (v) => <Badge tone={statusTone[v.status || 'active']}>{v.status || 'active'}</Badge>,
    },
    {
      key: 'createdAt',
      header: 'Added',
      render: (v) => <span className="text-xs text-slate-500">{fmtDate(v.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (v) => (
        <button onClick={() => openEdit(v)} className="btn-secondary px-3 py-1 text-xs">
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">Vendors & Suppliers</h1>
          <p className="mt-1 text-sm text-muted">Manage supplier directory, trade partners, GST compliance and ratings.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Add vendor
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat icon={Building2} tone="bg-brand-50 text-brand-600" label="Total Vendors" value={total} />
        <Stat icon={Tag} tone="bg-emerald-50 text-emerald-600" label="Active Suppliers" value={activeCount} />
        <Stat icon={Star} tone="bg-amber-50 text-amber-600" label="Top Rated" value={vendors.filter((v) => (v.rating || 5) >= 4).length} />
      </div>

      <SectionCard
        title="Supplier Directory"
        subtitle="Commercial details and compliance records"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search vendor name, GSTIN..."
                className="input py-1.5 pl-9 text-xs sm:w-64"
              />
            </div>
          </div>
        }
      >
        {isError ? (
          <div className="p-6">
            <ErrorState message={errMsg(error)} onRetry={refetch} />
          </div>
        ) : isLoading ? (
          <SkeletonTable />
        ) : vendors.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No vendors found"
              description="Keep track of all sub-contractors, hardware distributors, and material vendors."
              action={<button onClick={openCreate} className="btn-primary">Add your first vendor</button>}
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={vendors}
            page={page}
            total={total}
            pageSize={10}
            onPageChange={setPage}
          />
        )}
      </SectionCard>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Vendor' : 'Add New Vendor'}>
        <form onSubmit={form.handleSubmit((d) => save.mutate(d))} className="space-y-4">
          <Field label="Company / Vendor Name *" error={form.formState.errors.name?.message}>
            <input {...form.register('name', { required: 'Name is required' })} className="input" placeholder="e.g. Paramount Plywoods Pvt Ltd" />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Contact Person">
              <input {...form.register('contactPerson')} className="input" placeholder="e.g. Ramesh Patel" />
            </Field>
            <Field label="Phone Number">
              <input {...form.register('phone')} className="input" placeholder="+91 98765 43210" />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Email">
              <input type="email" {...form.register('email')} className="input" placeholder="sales@paramount.com" />
            </Field>
            <Field label="GSTIN">
              <input {...form.register('gstin')} className="input uppercase" placeholder="27ABCDE1234F1Z5" />
            </Field>
          </div>
          <Field label="Business Address">
            <input {...form.register('address')} className="input" placeholder="Plot 12, Industrial Area, Bangalore" />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Performance Rating (1-5)">
              <input type="number" min="1" max="5" step="1" {...form.register('rating', { valueAsNumber: true })} className="input" />
            </Field>
            <Field label="Internal Notes">
              <input {...form.register('notes')} className="input" placeholder="Credit terms: 30 days" />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={save.isPending} className="btn-primary">
              {save.isPending ? 'Saving...' : editing ? 'Update Vendor' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
