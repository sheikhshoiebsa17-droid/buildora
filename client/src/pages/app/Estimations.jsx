import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Ruler, FileSignature, History, XCircle, Save } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import { Badge, statusTone, SectionCard, Modal, EmptyState, ErrorState, SkeletonTable, inr, fmtDate } from '../../components/common/ui.jsx';
import { useToast } from '../../components/common/Toast.jsx';

const emptyItem = { description: '', unit: 'nos', quantity: 1, rate: 0, gstPercent: 18 };

export default function Estimations() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [editingId, setEditingId] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['estimates'],
    queryFn: async () => (await api.get('/estimates?limit=50')).data,
  });

  const form = useForm({
    defaultValues: { title: '', items: [emptyItem], notes: '' },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

  // live-computed preview (display only — server recalculates authoritatively)
  const items = form.watch('items');
  const computed = items.reduce(
    (acc, it) => {
      const line = (Number(it.quantity) || 0) * (Number(it.rate) || 0);
      const gst = line * ((Number(it.gstPercent) || 0) / 100);
      return { subtotal: acc.subtotal + line, gst: acc.gst + gst };
    },
    { subtotal: 0, gst: 0 }
  );

  const openCreate = () => {
    setEditingId(null);
    form.reset({ title: '', items: [emptyItem], notes: '' });
    setOpen(true);
  };
  const [open, setOpen] = useState(false);

  const openEdit = async (est) => {
    if (!['draft', 'internal_review', 'rejected'].includes(est.status)) {
      toast.error('Approved/sent estimates are locked — open it to create a new version.');
      setDetailId(est._id);
      return;
    }
    const { data: full } = await api.get(`/estimates/${est._id}`);
    setEditingId(est._id);
    form.reset({ title: full.data.title, items: full.data.items.length ? full.data.items : [emptyItem], notes: full.data.notes || '' });
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: (values) => (editingId ? api.patch(`/estimates/${editingId}`, values) : api.post('/estimates', values)),
    onSuccess: () => {
      toast.success(editingId ? 'Estimate updated — totals recalculated server-side' : 'Estimate created');
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const markSent = useMutation({
    mutationFn: (id) => api.post(`/estimates/${id}/sent`),
    onSuccess: () => { toast.success('Estimate sent to client for approval'); queryClient.invalidateQueries({ queryKey: ['estimates'] }); },
    onError: (e) => toast.error(errMsg(e)),
  });

  const estimates = data?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">BOQ &amp; Estimation</h1>
          <p className="mt-1 text-sm text-muted">Line-item BOQs with GST — totals computed on the server, versions tracked.</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> New estimate</button>
      </div>

      {isError ? (
        <ErrorState message={errMsg(error)} onRetry={refetch} />
      ) : isLoading ? (
        <SkeletonTable />
      ) : estimates.length === 0 ? (
        <EmptyState title="No estimates yet" description="Build your first BOQ with line items, units, rates and GST." action={<button onClick={openCreate} className="btn-primary">Create estimate</button>} />
      ) : (
        <SectionCard title="Estimates" subtitle="Draft → internal review → sent → client approved">
          <ul className="divide-y divide-line/60">
            {estimates.map((est) => (
              <li key={est._id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <button onClick={() => setDetailId(est._id)} className="block text-left text-sm font-semibold text-brand-600 hover:underline">{est.title}</button>
                  <p className="text-xs text-muted">v{est.version} · {est.items?.length || 0} items · {est.project?.name || 'no project'}</p>
                </div>
                <p className="font-bold text-navy">{inr(est.total)}</p>
                <Badge tone={statusTone[est.status]}>{est.status.replace(/_/g, ' ')}</Badge>
                <button onClick={() => openEdit(est)} className="btn-ghost p-2" title="Edit" aria-label={`Edit ${est.title}`}><Save className="h-4 w-4" /></button>
                {est.status === 'internal_review' && (
                  <button onClick={() => markSent.mutate(est._id)} className="btn-secondary px-3 py-1.5 text-xs">
                    <FileSignature className="h-3.5 w-3.5" /> Send to client
                  </button>
                )}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* Editor */}
      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit estimate' : 'New estimate'} wide>
        <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <input className="input" placeholder="Estimate title *" {...form.register('title', { required: true })} />
          {form.formState.errors.title && <p className="text-xs text-danger" role="alert">Title is required</p>}

          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-page text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 w-20">Unit</th>
                  <th className="px-3 py-2 w-24">Qty</th>
                  <th className="px-3 py-2 w-28">Rate ₹</th>
                  <th className="px-3 py-2 w-20">GST %</th>
                  <th className="px-3 py-2 w-10" aria-label="Remove" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {fields.map((f, i) => (
                  <tr key={f.id}>
                    <td className="px-2 py-1.5"><input className="input !px-2 !py-1.5 text-xs" {...form.register(`items.${i}.description`, { required: true })} /></td>
                    <td className="px-2 py-1.5"><input className="input !px-2 !py-1.5 text-xs" {...form.register(`items.${i}.unit`)} /></td>
                    <td className="px-2 py-1.5"><input className="input !px-2 !py-1.5 text-xs" type="number" step="0.01" min="0" {...form.register(`items.${i}.quantity`, { valueAsNumber: true })} /></td>
                    <td className="px-2 py-1.5"><input className="input !px-2 !py-1.5 text-xs" type="number" min="0" {...form.register(`items.${i}.rate`, { valueAsNumber: true })} /></td>
                    <td className="px-2 py-1.5"><input className="input !px-2 !py-1.5 text-xs" type="number" min="0" max="28" {...form.register(`items.${i}.gstPercent`, { valueAsNumber: true })} /></td>
                    <td className="px-2 py-1.5 text-center">
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(i)} className="rounded-lg p-1.5 text-danger hover:bg-rose-50" aria-label="Remove line">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => append(emptyItem)} className="btn-secondary text-xs"><Plus className="h-3.5 w-3.5" /> Add line</button>
            <div className="text-right text-sm">
              <p className="text-muted">Subtotal <span className="ml-2 font-bold text-navy">{inr(computed.subtotal)}</span></p>
              <p className="text-muted">GST <span className="ml-2 font-bold text-navy">{inr(computed.gst)}</span></p>
              <p className="text-muted">Total <span className="ml-2 text-lg font-extrabold text-brand-600">{inr(computed.subtotal + computed.gst)}</span></p>
              <p className="text-[10px] text-slate-400">Server recalculates all totals on save.</p>
            </div>
          </div>

          <textarea className="input resize-none" rows={2} placeholder="Notes (optional)" {...form.register('notes')} />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={save.isPending} className="btn-primary">{editingId ? 'Save estimate' : 'Create estimate'}</button>
          </div>
        </form>
      </Modal>

      <EstimateDetail id={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}

function EstimateDetail({ id, onClose }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ['estimate', id],
    enabled: !!id,
    queryFn: async () => (await api.get(`/estimates/${id}`)).data.data,
  });

  const newVersion = useMutation({
    mutationFn: () => api.post(`/estimates/${id}/versions`, { items: data.items }),
    onSuccess: () => {
      toast.success('New version created (previous one archived)');
      onClose();
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  if (!id) return null;

  return (
    <Modal open onClose={onClose} title={data?.title || 'Estimate'} wide>
      {isLoading || !data ? (
        <p className="py-6 text-sm text-muted">Loading…</p>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <Badge tone={statusTone[data.status] || 'slate'}>{data.status.replace(/_/g, ' ')}</Badge>
            <span className="text-xs text-muted">version {data.version} · valid until {fmtDate(data.validUntil)}</span>
          </div>

          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="text-left">Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>GST</th>
                <th className="text-right">Line total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {data.items.map((it) => (
                <tr key={it._id}>
                  <td className="py-2 text-navy">{it.description}</td>
                  <td className="text-center text-slate-500">{it.quantity} {it.unit}</td>
                  <td className="text-center text-slate-500">{inr(it.rate)}</td>
                  <td className="text-center text-slate-500">{it.gstPercent}%</td>
                  <td className="text-right font-semibold text-navy">{inr(it.quantity * it.rate * (1 + it.gstPercent / 100))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="rounded-xl bg-page p-4 text-right text-sm">
            <p className="text-muted">Subtotal {inr(data.subtotal)} · GST {inr(data.gstTotal)}</p>
            <p className="mt-1 text-lg font-extrabold text-navy">Total {inr(data.total)}</p>
          </div>

          {data.revisions?.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400"><History className="h-3.5 w-3.5" /> Revision history</p>
              <ul className="mt-2 space-y-1.5">
                {data.revisions.map((r, i) => (
                  <li key={i} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <span>v{r.version} — {inr(r.total)}</span>
                    <span>{new Date(r.changedAt).toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {['draft', 'internal_review', 'rejected'].includes(data.status) && (
            <button onClick={() => newVersion.mutate()} disabled={newVersion.isPending} className="btn-secondary">
              <History className="h-4 w-4" /> Save as new version
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}
