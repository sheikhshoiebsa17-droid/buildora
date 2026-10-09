import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Search, Wallet, CheckCircle, Clock, AlertOctagon, DollarSign, Trash2, CreditCard } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import DataTable from '../../components/common/DataTable.jsx';
import { Badge, statusTone, SectionCard, Modal, ErrorState, EmptyState, SkeletonTable, inr, fmtDate } from '../../components/common/ui.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { Stat, Field } from './CRM.jsx';

export default function Finance() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null); // invoice object

  const { data: summaryData } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: async () => (await api.get('/finance/summary')).data.data,
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['invoices', page, search, statusFilter],
    queryFn: async () =>
      (
        await api.get('/invoices', {
          params: { page, limit: 10, search: search || undefined, status: statusFilter || undefined },
        })
      ).data,
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers-mini'],
    queryFn: async () => (await api.get('/customers?limit=100')).data.data,
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects-mini'],
    queryFn: async () => (await api.get('/projects?limit=100')).data.data,
  });

  const customers = customersData || [];
  const projects = projectsData || [];
  const invoices = data?.data || [];
  const total = data?.total || invoices.length;
  const summary = summaryData || {};

  // Form for creating invoice
  const form = useForm({
    defaultValues: {
      customer: '',
      project: '',
      milestone: '',
      dueDate: '',
      items: [{ description: 'Mobilization advance', quantity: 1, rate: 0, gstPercent: 18 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const createInvoice = useMutation({
    mutationFn: (values) => api.post('/invoices', values),
    onSuccess: () => {
      toast.success('Invoice generated');
      setCreateOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  // Form for recording payment
  const paymentForm = useForm({
    defaultValues: {
      amount: 0,
      mode: 'bank_transfer',
      reference: '',
      paidOn: new Date().toISOString().split('T')[0],
    },
  });

  const recordPayment = useMutation({
    mutationFn: ({ id, values }) => api.post(`/invoices/${id}/payments`, values),
    onSuccess: () => {
      toast.success('Payment recorded');
      setPaymentModal(null);
      paymentForm.reset();
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const columns = [
    {
      key: 'number',
      header: 'Invoice #',
      render: (inv) => <span className="font-semibold text-brand-600">{inv.number}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (inv) => (
        <div>
          <span className="font-medium text-navy">{inv.customer?.name || '—'}</span>
          {inv.project?.name && <div className="text-xs text-muted">{inv.project.name}</div>}
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total Amount',
      render: (inv) => <span className="font-semibold text-navy">{inr(inv.total)}</span>,
    },
    {
      key: 'paid',
      header: 'Paid / Balance',
      render: (inv) => (
        <div className="text-xs">
          <span className="font-medium text-emerald-600">{inr(inv.amountPaid || 0)}</span>
          <span className="text-slate-400"> / {inr(Math.max(0, (inv.total || 0) - (inv.amountPaid || 0)))}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (inv) => <Badge tone={statusTone[inv.status]}>{inv.status}</Badge>,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (inv) => <span className="text-xs text-slate-500">{fmtDate(inv.dueDate)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (inv) =>
        inv.status !== 'paid' && inv.status !== 'cancelled' ? (
          <button
            onClick={() => {
              setPaymentModal(inv);
              paymentForm.reset({
                amount: Math.max(0, (inv.total || 0) - (inv.amountPaid || 0)),
                mode: 'bank_transfer',
                reference: '',
                paidOn: new Date().toISOString().split('T')[0],
              });
            }}
            className="btn-secondary px-2.5 py-1 text-xs"
          >
            <CreditCard className="h-3 w-3" /> Record Payment
          </button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">Finance & Invoicing</h1>
          <p className="mt-1 text-sm text-muted">Manage customer billing milestones, tax invoices and payment collections.</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> New invoice
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Stat
          icon={Wallet}
          tone="bg-brand-50 text-brand-600"
          label="Total Invoiced"
          value={inr(summary.totalInvoiced || 0)}
        />
        <Stat
          icon={CheckCircle}
          tone="bg-emerald-50 text-emerald-600"
          label="Collections Received"
          value={inr(summary.totalCollected || 0)}
        />
        <Stat
          icon={Clock}
          tone="bg-amber-50 text-amber-600"
          label="Pending Receivables"
          value={inr(summary.totalPending || 0)}
        />
        <Stat
          icon={AlertOctagon}
          tone="bg-rose-50 text-rose-600"
          label="Overdue Invoices"
          value={inr(summary.totalOverdue || 0)}
        />
      </div>

      <SectionCard
        title="Client Invoices"
        subtitle="Tax invoices issued across interior design and turnkey construction projects"
        action={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input py-1.5 text-xs w-36"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search invoice #..."
                className="input py-1.5 pl-9 text-xs sm:w-56"
              />
            </div>
          </div>
        }
      >
        {isError ? (
          <div className="p-6"><ErrorState message={errMsg(error)} onRetry={refetch} /></div>
        ) : isLoading ? (
          <SkeletonTable />
        ) : invoices.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No invoices found"
              description="Create an invoice tied to project milestones to begin collecting payments."
              action={<button onClick={() => setCreateOpen(true)} className="btn-primary">Generate Invoice</button>}
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={invoices}
            page={page}
            total={total}
            pageSize={10}
            onPageChange={setPage}
          />
        )}
      </SectionCard>

      {/* Create Invoice Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Tax Invoice" wide>
        <form onSubmit={form.handleSubmit((d) => createInvoice.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Customer *" error={form.formState.errors.customer?.message}>
              <select {...form.register('customer', { required: 'Customer is required' })} className="input">
                <option value="">Select Customer...</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Linked Project">
              <select {...form.register('project')} className="input">
                <option value="">Select Project (Optional)...</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Milestone / Description">
              <input {...form.register('milestone')} className="input" placeholder="e.g. Stage 1: Design Finalization" />
            </Field>
            <Field label="Payment Due Date">
              <input type="date" {...form.register('dueDate')} className="input" />
            </Field>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Billable Items</label>
              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, rate: 0, gstPercent: 18 })}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                + Add item
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((f, i) => (
                <div key={f.id} className="flex items-center gap-2">
                  <input
                    {...form.register(`items.${i}.description`, { required: true })}
                    placeholder="Item description"
                    className="input flex-1"
                  />
                  <input
                    type="number"
                    step="0.01"
                    {...form.register(`items.${i}.quantity`, { valueAsNumber: true })}
                    placeholder="Qty"
                    className="input w-20"
                  />
                  <input
                    type="number"
                    step="0.01"
                    {...form.register(`items.${i}.rate`, { valueAsNumber: true })}
                    placeholder="Rate (INR)"
                    className="input w-28"
                  />
                  <input
                    type="number"
                    {...form.register(`items.${i}.gstPercent`, { valueAsNumber: true })}
                    placeholder="GST %"
                    className="input w-20"
                  />
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(i)} className="p-1 text-slate-400 hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createInvoice.isPending} className="btn-primary">
              {createInvoice.isPending ? 'Generating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal open={!!paymentModal} onClose={() => setPaymentModal(null)} title={`Record Payment: ${paymentModal?.number}`}>
        <form
          onSubmit={paymentForm.handleSubmit((d) =>
            recordPayment.mutate({ id: paymentModal._id, values: d })
          )}
          className="space-y-4"
        >
          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            Invoice Total: <span className="font-bold text-navy">{inr(paymentModal?.total)}</span> | Balance Due: <span className="font-bold text-rose-600">{inr(Math.max(0, (paymentModal?.total || 0) - (paymentModal?.amountPaid || 0)))}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Amount Paid (INR)">
              <input
                type="number"
                step="0.01"
                min="0.01"
                {...paymentForm.register('amount', { valueAsNumber: true, required: true })}
                className="input"
              />
            </Field>
            <Field label="Payment Mode">
              <select {...paymentForm.register('mode')} className="input">
                <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="card">Debit/Credit Card</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Transaction / UTR Reference">
              <input {...paymentForm.register('reference')} className="input" placeholder="e.g. UTR12345678" />
            </Field>
            <Field label="Date Received">
              <input type="date" {...paymentForm.register('paidOn')} className="input" />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setPaymentModal(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={recordPayment.isPending} className="btn-primary">
              {recordPayment.isPending ? 'Recording...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
