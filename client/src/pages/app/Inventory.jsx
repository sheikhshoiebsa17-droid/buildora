import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Search, Boxes, AlertTriangle, ArrowDownRight, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import DataTable from '../../components/common/DataTable.jsx';
import { Badge, SectionCard, Modal, ErrorState, EmptyState, SkeletonTable, inr } from '../../components/common/ui.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { Stat, Field } from './CRM.jsx';

export default function Inventory() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [movementModal, setMovementModal] = useState(null); // item object

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['inventory', page, search],
    queryFn: async () => (await api.get('/inventory', { params: { page, limit: 15, search: search || undefined } })).data,
  });

  const { data: alertsData } = useQuery({
    queryKey: ['inventory-alerts'],
    queryFn: async () => (await api.get('/inventory/alerts')).data.data,
  });

  const form = useForm({
    defaultValues: {
      sku: '',
      name: '',
      category: '',
      unit: 'pcs',
      quantity: 0,
      reorderLevel: 5,
      unitPrice: 0,
      warehouseLocation: '',
    },
  });

  const movementForm = useForm({
    defaultValues: {
      type: 'in',
      quantity: 1,
      reason: '',
    },
  });

  const createItem = useMutation({
    mutationFn: (values) => api.post('/inventory', values),
    onSuccess: () => {
      toast.success('Inventory item added');
      setCreateOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const recordMovement = useMutation({
    mutationFn: ({ id, values }) => api.post(`/inventory/${id}/movements`, values),
    onSuccess: () => {
      toast.success('Stock updated');
      setMovementModal(null);
      movementForm.reset();
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const items = data?.data || [];
  const total = data?.total || items.length;
  const alerts = alertsData || [];

  const columns = [
    {
      key: 'sku',
      header: 'SKU',
      render: (i) => <span className="font-mono text-xs font-bold text-brand-600">{i.sku}</span>,
    },
    {
      key: 'name',
      header: 'Item Name',
      render: (i) => (
        <div>
          <span className="font-semibold text-navy">{i.name}</span>
          {i.category && <div className="text-xs text-muted">{i.category}</div>}
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'In Stock',
      render: (i) => {
        const isLow = i.quantity <= (i.reorderLevel || 0);
        return (
          <span className={`font-semibold ${isLow ? 'text-rose-600 font-bold' : 'text-navy'}`}>
            {i.quantity} {i.unit || 'pcs'}
          </span>
        );
      },
    },
    {
      key: 'reorderLevel',
      header: 'Reorder Level',
      render: (i) => <span className="text-slate-500">{i.reorderLevel} {i.unit || 'pcs'}</span>,
    },
    {
      key: 'unitPrice',
      header: 'Unit Price',
      render: (i) => <span className="text-slate-700">{inr(i.unitPrice || 0)}</span>,
    },
    {
      key: 'warehouseLocation',
      header: 'Location',
      render: (i) => <span className="text-xs text-slate-500">{i.warehouseLocation || 'Main Hub'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (i) => {
        const isLow = i.quantity <= (i.reorderLevel || 0);
        return isLow ? (
          <Badge tone="red">Low Stock</Badge>
        ) : (
          <Badge tone="green">Adequate</Badge>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (i) => (
        <button
          onClick={() => {
            setMovementModal(i);
            movementForm.reset({ type: 'in', quantity: 1, reason: '' });
          }}
          className="btn-secondary px-2.5 py-1 text-xs"
        >
          <ArrowLeftRight className="h-3 w-3" /> Adjust
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">Inventory & Warehouse</h1>
          <p className="mt-1 text-sm text-muted">Track site stores, raw material batches, reorder thresholds and adjustments.</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Add item
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat icon={Boxes} tone="bg-brand-50 text-brand-600" label="Catalog Items" value={total} />
        <Stat
          icon={AlertTriangle}
          tone={alerts.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}
          label="Low Stock Alerts"
          value={alerts.length}
        />
        <Stat
          icon={Boxes}
          tone="bg-sky-50 text-sky-600"
          label="Valuation"
          value={inr(items.reduce((acc, curr) => acc + (curr.quantity || 0) * (curr.unitPrice || 0), 0))}
        />
      </div>

      {alerts.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-center gap-2 font-bold text-rose-700">
            <AlertTriangle className="h-5 w-5" />
            <span>Attention Needed: {alerts.length} items below minimum threshold</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {alerts.slice(0, 5).map((a) => (
              <span key={a._id} className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 shadow-sm">
                {a.name} ({a.quantity} {a.unit || 'left'})
              </span>
            ))}
          </div>
        </div>
      )}

      <SectionCard
        title="Stock Catalog"
        subtitle="Current inventory availability and warehouse placements"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search SKU or name..."
                className="input py-1.5 pl-9 text-xs sm:w-64"
              />
            </div>
          </div>
        }
      >
        {isError ? (
          <div className="p-6"><ErrorState message={errMsg(error)} onRetry={refetch} /></div>
        ) : isLoading ? (
          <SkeletonTable />
        ) : items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No items in inventory"
              description="Add raw materials, fittings, lighting or finishes to track stock counts."
              action={<button onClick={() => setCreateOpen(true)} className="btn-primary">Add inventory item</button>}
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={items}
            page={page}
            total={total}
            pageSize={15}
            onPageChange={setPage}
          />
        )}
      </SectionCard>

      {/* Add Item Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Inventory Item">
        <form onSubmit={form.handleSubmit((d) => createItem.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="SKU Code *" error={form.formState.errors.sku?.message}>
              <input {...form.register('sku', { required: 'SKU is required' })} className="input uppercase" placeholder="e.g. PLY-BWP-18MM" />
            </Field>
            <Field label="Category">
              <input {...form.register('category')} className="input" placeholder="e.g. Wood & Boards" />
            </Field>
          </div>
          <Field label="Item Name *" error={form.formState.errors.name?.message}>
            <input {...form.register('name', { required: 'Name is required' })} className="input" placeholder="e.g. 18mm BWP Marine Plywood 8x4" />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Opening Qty">
              <input type="number" step="0.01" {...form.register('quantity', { valueAsNumber: true })} className="input" />
            </Field>
            <Field label="Unit of Measure">
              <input {...form.register('unit')} className="input" placeholder="pcs / sqft / m" />
            </Field>
            <Field label="Reorder Level">
              <input type="number" step="0.01" {...form.register('reorderLevel', { valueAsNumber: true })} className="input" />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Unit Cost (INR)">
              <input type="number" step="0.01" {...form.register('unitPrice', { valueAsNumber: true })} className="input" />
            </Field>
            <Field label="Warehouse / Bin Location">
              <input {...form.register('warehouseLocation')} className="input" placeholder="e.g. Bay 4 - Rack 2" />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createItem.isPending} className="btn-primary">
              {createItem.isPending ? 'Saving...' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Movement Modal */}
      <Modal open={!!movementModal} onClose={() => setMovementModal(null)} title={`Stock Adjustment: ${movementModal?.name}`}>
        <form
          onSubmit={movementForm.handleSubmit((d) =>
            recordMovement.mutate({ id: movementModal._id, values: d })
          )}
          className="space-y-4"
        >
          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            Current stock: <span className="font-bold text-navy">{movementModal?.quantity} {movementModal?.unit}</span>
          </div>
          <Field label="Movement Type">
            <select {...movementForm.register('type')} className="input">
              <option value="in">Stock In (Receipt / Restock)</option>
              <option value="out">Stock Out (Issued to Site / Scrap)</option>
            </select>
          </Field>
          <Field label="Quantity">
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...movementForm.register('quantity', { valueAsNumber: true, required: true })}
              className="input"
            />
          </Field>
          <Field label="Reason / Notes">
            <input
              {...movementForm.register('reason')}
              className="input"
              placeholder="e.g. Issued for Project Villa #4"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setMovementModal(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={recordMovement.isPending} className="btn-primary">
              {recordMovement.isPending ? 'Recording...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
