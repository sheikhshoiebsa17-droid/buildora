import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Palette, GitBranch, ThumbsUp } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import { Badge, statusTone, SectionCard, Modal, EmptyState, ErrorState, SkeletonTable } from '../../components/common/ui.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { Field } from './CRM.jsx';

export default function Designs() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [detailId, setDetailId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['designs'],
    queryFn: async () => (await api.get('/designs?limit=50')).data,
  });

  const { data: projects } = useQuery({
    queryKey: ['projects-mini'],
    queryFn: async () => (await api.get('/projects?limit=100')).data.data,
  });

  const form = useForm({ defaultValues: { projectId: '', title: '', room: '', scope: '' } });

  const create = useMutation({
    mutationFn: (values) => api.post('/designs', values),
    onSuccess: () => {
      toast.success('Design created');
      setCreateOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['designs'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const designs = data?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">Design Studio</h1>
          <p className="mt-1 text-sm text-muted">Concept boards, versions and client approvals — from idea to sign-off.</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> New design</button>
      </div>

      {isError ? (
        <ErrorState message={errMsg(error)} onRetry={refetch} />
      ) : isLoading ? (
        <SkeletonTable />
      ) : designs.length === 0 ? (
        <EmptyState
          title="No designs yet"
          description="Create a design board per room or concept. Versions track every client iteration."
          action={<button onClick={() => setCreateOpen(true)} className="btn-primary">Create design</button>}
        />
      ) : (
        <SectionCard title="Boards">
          <ul className="divide-y divide-line/60">
            {designs.map((d) => (
              <li key={d._id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <span className="icon-tile bg-fuchsia-50 text-fuchsia-500"><Palette className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <button onClick={() => setDetailId(d._id)} className="block text-left text-sm font-semibold text-brand-600 hover:underline">{d.title}</button>
                  <p className="text-xs text-muted">{d.room || 'General'} · {d.projectId?.name} · {d.versions?.length || 0} versions</p>
                </div>
                <Badge tone={statusTone[d.status] || 'slate'}>{d.status.replace(/_/g, ' ')}</Badge>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New design board">
        <form onSubmit={form.handleSubmit((v) => create.mutate(v))} className="grid gap-4" noValidate>
          <Field label="Project *" error={form.formState.errors.projectId?.message}>
            <select className="input" {...form.register('projectId', { required: 'Pick a project' })}>
              <option value="">— Select project —</option>
              {(projects || []).map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Title *"><input className="input" {...form.register('title', { required: true })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Room"><input className="input" placeholder="Living room" {...form.register('room')} /></Field>
          </div>
          <Field label="Scope / concept"><textarea className="input resize-none" rows={3} {...form.register('scope')} /></Field>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={create.isPending} className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>

      <DesignDetail id={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}

function DesignDetail({ id, onClose }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [versionLabel, setVersionLabel] = useState('');
  const [respondNote, setRespondNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['design', id],
    enabled: !!id,
    queryFn: async () => (await api.get(`/designs/${id}`)).data.data,
  });

  const addVersion = useMutation({
    mutationFn: (sendForApproval) => api.post(`/designs/${id}/versions`, { label: versionLabel || undefined, sendForApproval }),
    onSuccess: (_d, send) => {
      toast.success(send ? 'Sent for client approval' : 'Version saved');
      setVersionLabel('');
      queryClient.invalidateQueries({ queryKey: ['design', id] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const respond = useMutation({
    mutationFn: (decision) => api.post(`/designs/${id}/respond`, { decision, note: respondNote }),
    onSuccess: (_d, decision) => {
      toast.success(decision === 'approved' ? 'Client approval recorded' : 'Response recorded');
      setRespondNote('');
      queryClient.invalidateQueries({ queryKey: ['design', id] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  if (!id) return null;
  if (isLoading || !data) return <Modal open onClose={onClose} title="Design"><p className="text-sm text-muted">Loading…</p></Modal>;

  const latest = data.versions?.[data.versions.length - 1];

  return (
    <Modal open onClose={onClose} title={data.title} wide>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-3">
          <Badge tone={statusTone[data.status] || 'slate'}>{data.status.replace(/_/g, ' ')}</Badge>
          <span className="text-xs text-muted">{data.room || 'General'} · {data.scope || 'No scope set'}</span>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400"><GitBranch className="h-3.5 w-3.5" /> Versions</p>
          <ol className="mt-2 space-y-2">
            {data.versions.map((v, i) => (
              <li key={i} className={`flex flex-wrap items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-sm ${i === data.versions.length - 1 ? 'bg-brand-50/60 ring-1 ring-brand-100' : 'bg-page'}`}>
                <span className="font-medium text-navy">v{v.version} — {v.label}</span>
                <span className="text-xs text-muted">
                  {v.sentForApproval ? (v.approvedByClient ? '✓ client approved' : 'awaiting client') : 'internal draft'}
                  {v.respondedAt ? ` · ${new Date(v.respondedAt).toLocaleDateString('en-IN')}` : ''}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap gap-2">
          <input className="input flex-1" placeholder={`New version label (e.g. Revision ${data.versions.length + 1})`} value={versionLabel} onChange={(e) => setVersionLabel(e.target.value)} aria-label="New version label" />
          <button onClick={() => addVersion.mutate(false)} className="btn-secondary whitespace-nowrap">Save version</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <input className="input flex-1" placeholder="Response note (optional)" value={respondNote} onChange={(e) => setRespondNote(e.target.value)} aria-label="Response note" />
          {respondNote && <button onClick={() => respond.mutate('changes_requested')} className="btn-secondary whitespace-nowrap">Request changes</button>}
          {latest?.sentForApproval && !latest?.approvedByClient && (
            <button onClick={() => respond.mutate('approved')} className="btn-primary whitespace-nowrap"><ThumbsUp className="h-4 w-4" /> Approve</button>
          )}
        </div>
      </div>
    </Modal>
  );
}
