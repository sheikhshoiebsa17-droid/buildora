import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Search, Truck, CheckCircle2, Clock, AlertCircle, Trash2, ArrowUpRight } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import DataTable from '../../components/common/DataTable.jsx';
import { Badge, statusTone, SectionCard, Modal, ErrorState, EmptyState, SkeletonTable, inr, fmtDate } from '../../components/common/ui.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { Stat, Field } from './CRM.jsx';

export default function Procurement() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'prs'
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [prModalOpen, setPrModalOpen] = useState(false);

  // Queries
  const { data: posData, isLoading: posLoading, isError: posError, error: poErr, refetch: refetchPos } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => (await api.get('/purchase-orders?limit=50')).data,
  });

  const { data: prsData, isLoading: prsLoading, isError: prsError, error: prErr, refetch: refetchPrs } = useQuery({
    queryKey: ['purchase-requests'],
    queryFn: async () => (await api.get('/purchase-requests?limit=50')).data,
  });

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors-mini'],
    queryFn: async () => (await api.get('/vendors?limit=100')).data.data,
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects-mini'],
    queryFn: async () => (await api.get('/projects?limit=100')).data.data,
  });

  const vendors = vendorsData || [];
  const projects = projectsData || [];
  const pos = posData?.data || [];
  const prs = prsData?.data || [];

  // Form for PO
  const poForm = useForm({
    defaultValues: {
      vendor: '',
      project: '',
      expectedDate: '',
      notes: '',
      items: [{ description: '', quantity: 1, unit: 'pcs', rate: 0 }],
    },
  });

  const { fields: poFields, append: appendPoItem, remove: removePoItem } = useFieldArray({
    control: poForm.control,
    name: 'items',
  });

  const createPo = useMutation({
    mutationFn: (values) => api.post('/purchase-orders', values),
    onSuccess: () => {
      toast.success('Purchase order created');
      setPoModalOpen(false);
      poForm.reset();
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  // Form for PR
  const prForm = useForm({
    defaultValues: {
      project: '',
      requiredBy: '',
      notes: '',
      items: [{ description: '', quantity: 1, unit: 'pcs', rate: 0 }],
    },
  });

  const { fields: prFields, append: appendPrItem, remove: removePrItem } = useFieldArray({
    control: prForm.control,
    name: 'items',
  });

  const createPr = useMutation({
    mutationFn: (values) => api.post('/purchase-requests', values),
    onSuccess: () => {
      toast.success('Purchase request submitted');
      setPrModalOpen(false);
      prForm.reset();
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  // Action mutations
  const approvePo = useMutation({
    mutationFn: (id) => api.post(`/purchase-orders/${id}/approve`),
    onSuccess: () => {
      toast.success('PO approved');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const poColumns = [
    {
      key: 'poNumber',
      header: 'PO Number',
      render: (p) => <span className="font-semibold text-brand-600">{p.poNumber}</span>,
    },
    {
      key: 'vendor',
      header: 'Vendor',
      render: (p) => <span className="font-medium text-navy">{p.vendor?.name || '—'}</span>,
    },
    {
      key: 'project',
      header: 'Project',
      render: (p) => <span className="text-slate-600">{p.project?.name || 'General Stock'}</span>,
    },
    {
      key: 'total',
      header: 'Amount',
      render: (p) => <span className="font-semibold text-navy">{inr(p.totalAmount || 0)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <Badge tone={statusTone[p.status]}>{p.status}</Badge>,
    },
    {
      key: 'expectedDate',
      header: 'Expected Delivery',
      render: (p) => <span className="text-xs text-slate-500">{fmtDate(p.expectedDate)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (p) =>
        p.status === 'draft' || p.status === 'pending_approval' ? (
          <button
            onClick={() => approvePo.mutate(p._id)}
            disabled={approvePo.isPending}
            className="btn-secondary px-3 py-1 text-xs"
          >
            Approve
          </button>
        ) : null,
    },
  ];

  const prColumns = [
    {
      key: 'prNumber',
      header: 'PR Number',
      render: (p) => <span className="font-semibold text-brand-600">{p.prNumber}</span>,
    },
    {
      key: 'project',
      header: 'Project',
      render: (p) => <span className="text-slate-600">{p.project?.name || 'General Requirement'}</span>,
    },
    {
      key: 'itemsCount',
      header: 'Items Count',
      render: (p) => <span className="text-navy">{p.items?.length || 0} items</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <Badge tone={statusTone[p.status]}>{p.status}</Badge>,
    },
    {
      key: 'requiredBy',
      header: 'Required By',
      render: (p) => <span className="text-xs text-slate-500">{fmtDate(p.requiredBy)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">Procurement & Orders</h1>
          <p className="mt-1 text-sm text-muted">Manage site purchase requests, vendor purchase orders, and delivery timelines.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPrModalOpen(true)} className="btn-secondary">
            <Plus className="h-4 w-4" /> New Requisition
          </button>
          <button onClick={() => setPoModalOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Create PO
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat icon={Truck} tone="bg-brand-50 text-brand-600" label="Total Purchase Orders" value={pos.length} />
        <Stat icon={Clock} tone="bg-amber-50 text-amber-600" label="Pending Approvals" value={pos.filter((p) => p.status === 'pending_approval' || p.status === 'draft').length} />
        <Stat icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" label="Active Requisitions" value={prs.length} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line gap-4">
        <button
          onClick={() => setActiveTab('pos')}
          className={`pb-2.5 text-sm font-bold transition border-b-2 ${
            activeTab === 'pos' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          Purchase Orders ({pos.length})
        </button>
        <button
          onClick={() => setActiveTab('prs')}
          className={`pb-2.5 text-sm font-bold transition border-b-2 ${
            activeTab === 'prs' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          Purchase Requests ({prs.length})
        </button>
      </div>

      {activeTab === 'pos' ? (
        <SectionCard title="Purchase Orders" subtitle="Approved and ongoing orders sent to material vendors">
          {posLoading ? (
            <SkeletonTable />
          ) : posError ? (
            <div className="p-6"><ErrorState message={errMsg(poErr)} onRetry={refetchPos} /></div>
          ) : pos.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No purchase orders"
                description="Create a purchase order to initiate procurement with your approved vendors."
                action={<button onClick={() => setPoModalOpen(true)} className="btn-primary">Create Purchase Order</button>}
              />
            </div>
          ) : (
            <DataTable columns={poColumns} data={pos} page={1} total={pos.length} pageSize={50} />
          )}
        </SectionCard>
      ) : (
        <SectionCard title="Purchase Requisitions (PR)" subtitle="Material demands raised from site engineers or project managers">
          {prsLoading ? (
            <SkeletonTable />
          ) : prsError ? (
            <div className="p-6"><ErrorState message={errMsg(prErr)} onRetry={refetchPrs} /></div>
          ) : prs.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No purchase requisitions"
                description="Site staff can raise purchase requests for materials needed on-site."
                action={<button onClick={() => setPrModalOpen(true)} className="btn-primary">Raise Purchase Request</button>}
              />
            </div>
          ) : (
            <DataTable columns={prColumns} data={prs} page={1} total={prs.length} pageSize={50} />
          )}
        </SectionCard>
      )}

      {/* PO Modal */}
      <Modal open={poModalOpen} onClose={() => setPoModalOpen(false)} title="Create Purchase Order" wide>
        <form onSubmit={poForm.handleSubmit((d) => createPo.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Vendor *" error={poForm.formState.errors.vendor?.message}>
              <select {...poForm.register('vendor', { required: 'Please select a vendor' })} className="input">
                <option value="">Select Vendor...</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>{v.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Project (Optional)">
              <select {...poForm.register('project')} className="input">
                <option value="">General Stock / Organization</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Expected Delivery Date">
              <input type="date" {...poForm.register('expectedDate')} className="input" />
            </Field>
            <Field label="Notes / Delivery Instructions">
              <input {...poForm.register('notes')} className="input" placeholder="e.g. Deliver to Site A by 11 AM" />
            </Field>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Items</label>
              <button
                type="button"
                onClick={() => appendPoItem({ description: '', quantity: 1, unit: 'pcs', rate: 0 })}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                + Add item
              </button>
            </div>
            <div className="space-y-2">
              {poFields.map((f, i) => (
                <div key={f.id} className="flex items-center gap-2">
                  <input
                    {...poForm.register(`items.${i}.description`, { required: true })}
                    placeholder="Item description (e.g. Marine Plywood 18mm)"
                    className="input flex-1"
                  />
                  <input
                    type="number"
                    step="0.01"
                    {...poForm.register(`items.${i}.quantity`, { valueAsNumber: true })}
                    placeholder="Qty"
                    className="input w-20"
                  />
                  <input
                    {...poForm.register(`items.${i}.unit`)}
                    placeholder="Unit"
                    className="input w-16"
                  />
                  <input
                    type="number"
                    step="0.01"
                    {...poForm.register(`items.${i}.rate`, { valueAsNumber: true })}
                    placeholder="Rate"
                    className="input w-24"
                  />
                  {poFields.length > 1 && (
                    <button type="button" onClick={() => removePoItem(i)} className="p-1 text-slate-400 hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setPoModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createPo.isPending} className="btn-primary">
              {createPo.isPending ? 'Generating PO...' : 'Create Purchase Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* PR Modal */}
      <Modal open={prModalOpen} onClose={() => setPrModalOpen(false)} title="New Purchase Requisition (PR)">
        <form onSubmit={prForm.handleSubmit((d) => createPr.mutate(d))} className="space-y-4">
          <Field label="Project">
            <select {...prForm.register('project')} className="input">
              <option value="">General Stock</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Required By Date">
            <input type="date" {...prForm.register('requiredBy')} className="input" />
          </Field>
          <Field label="Requisition Notes">
            <input {...prForm.register('notes')} className="input" placeholder="Urgent for modular kitchen assembly" />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Materials Needed</label>
              <button
                type="button"
                onClick={() => appendPrItem({ description: '', quantity: 1, unit: 'pcs', rate: 0 })}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                + Add item
              </button>
            </div>
            <div className="space-y-2">
              {prFields.map((f, i) => (
                <div key={f.id} className="flex items-center gap-2">
                  <input
                    {...prForm.register(`items.${i}.description`, { required: true })}
                    placeholder="Material description"
                    className="input flex-1"
                  />
                  <input
                    type="number"
                    step="0.01"
                    {...prForm.register(`items.${i}.quantity`, { valueAsNumber: true })}
                    placeholder="Qty"
                    className="input w-20"
                  />
                  <input
                    {...prForm.register(`items.${i}.unit`)}
                    placeholder="Unit"
                    className="input w-20"
                  />
                  {prFields.length > 1 && (
                    <button type="button" onClick={() => removePrItem(i)} className="p-1 text-slate-400 hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setPrModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createPr.isPending} className="btn-primary">
              {createPr.isPending ? 'Submitting...' : 'Submit Requisition'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
