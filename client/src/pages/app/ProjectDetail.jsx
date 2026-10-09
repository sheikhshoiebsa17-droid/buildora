import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Plus, MapPin, CalendarDays, Wallet, User, Flag } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import { Badge, statusTone, SectionCard, Modal, ErrorState, SkeletonCard, inr, fmtDate } from '../../components/common/ui.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { Field } from './CRM.jsx';

export default function ProjectDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [taskModal, setTaskModal] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => (await api.get(`/projects/${id}`)).data.data,
  });

  const form = useForm({
    defaultValues: { title: '', status: 'todo', priority: 'medium', dueDate: '', progress: 0 },
  });

  const createTask = useMutation({
    mutationFn: (values) => api.post(`/projects/${id}/tasks`, values),
    onSuccess: () => {
      toast.success('Task added');
      setTaskModal(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const updateTask = useMutation({
    mutationFn: ({ taskId, values }) => api.patch(`/projects/${id}/tasks/${taskId}`, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
    onError: (e) => toast.error(errMsg(e)),
  });

  if (isLoading) return <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>;
  if (isError) return <ErrorState message={errMsg(error)} onRetry={refetch} />;

  const allocated = data.budget?.allocated || 0;
  const spent = data.budget?.spent || 0;
  const usedPct = allocated ? Math.round((spent / allocated) * 100) : 0;
  const tasks = data.tasks || [];

  return (
    <div className="space-y-5">
      <Link to="/app/projects" className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted hover:text-navy">
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-navy">{data.name}</h1>
            <Badge tone={statusTone[data.status]}>{data.status.replace(/_/g, ' ')}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted">{data.code} · {data.type}</p>
        </div>
        <button onClick={() => setTaskModal(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add task</button>
      </div>

      {/* Meta + budget */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-5">
          <h2 className="text-sm font-bold text-navy">Project info</h2>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li className="flex items-center gap-2 text-slate-600"><MapPin className="h-4 w-4 text-slate-400" /> {data.siteAddress || data.city || 'No site address'}</li>
            <li className="flex items-center gap-2 text-slate-600"><CalendarDays className="h-4 w-4 text-slate-400" /> {fmtDate(data.startDate)} → {fmtDate(data.targetDate)}</li>
            <li className="flex items-center gap-2 text-slate-600"><User className="h-4 w-4 text-slate-400" /> {data.manager?.name || 'No manager assigned'}</li>
            <li className="flex items-center gap-2 text-slate-600"><User className="h-4 w-4 text-slate-400" /> {data.customer?.name || 'No customer linked'}</li>
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-navy"><Wallet className="h-4 w-4 text-brand-500" /> Budget</h2>
          <p className="mt-3 text-2xl font-extrabold text-navy">{inr(spent)} <span className="text-sm font-semibold text-muted">/ {inr(allocated)}</span></p>
          <div className="mt-3 h-2.5 rounded-full bg-slate-100">
            <div className={`h-2.5 rounded-full ${usedPct > 100 ? 'bg-danger' : usedPct > 80 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${Math.min(100, usedPct)}%` }} />
          </div>
          <p className={`mt-1.5 text-xs font-semibold ${usedPct > 100 ? 'text-danger' : 'text-muted'}`}>
            {usedPct}% used {usedPct > 100 ? '— over budget!' : ''}
          </p>
        </section>

        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-navy"><Flag className="h-4 w-4 text-emerald-500" /> Progress</h2>
          <p className="mt-3 text-2xl font-extrabold text-navy">{data.progress || 0}%</p>
          <div className="mt-3 h-2.5 rounded-full bg-slate-100">
            <div className="h-2.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-cyan" style={{ width: `${data.progress || 0}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-muted">Rolled up from {data.taskStats?.total ?? 0} tasks · {data.taskStats?.done ?? 0} done · {data.taskStats?.overdue ?? 0} overdue</p>
        </section>
      </div>

      {/* Tasks */}
      <SectionCard title="Tasks" subtitle="Update status inline — project progress recalculates server-side">
        {tasks.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">No tasks yet. Break the scope into tasks to track execution.</p>
        ) : (
          <ul className="divide-y divide-line/60">
            {tasks.map((t) => (
              <li key={t._id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy">{t.title}</p>
                  <p className="text-xs text-muted">
                    {t.assignee?.name || 'Unassigned'} · due {fmtDate(t.dueDate)} · {t.progress || 0}%
                  </p>
                </div>
                <Badge tone={t.priority === 'high' ? 'red' : t.priority === 'medium' ? 'amber' : 'slate'}>{t.priority}</Badge>
                <select
                  value={t.status}
                  onChange={(e) => updateTask.mutate({ taskId: t._id, values: { status: e.target.value } })}
                  className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-medium"
                  aria-label={`Status for ${t.title}`}
                >
                  {['todo', 'in_progress', 'review', 'done'].map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
                <input
                  type="number" min="0" max="100"
                  value={t.progress ?? 0}
                  onChange={(e) => updateTask.mutate({ taskId: t._id, values: { progress: Number(e.target.value) } })}
                  onBlur={(e) => updateTask.mutate({ taskId: t._id, values: { progress: Number(e.target.value) } })}
                  className="w-16 rounded-lg border border-line px-2 py-1 text-xs"
                  aria-label={`Progress % for ${t.title}`}
                />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <Modal open={taskModal} onClose={() => setTaskModal(false)} title="Add task">
        <form onSubmit={form.handleSubmit((v) => createTask.mutate(v))} className="grid gap-4" noValidate>
          <Field label="Task title *">
            <input className="input" {...form.register('title', { required: 'Title is required' })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Priority">
              <select className="input" {...form.register('priority')}>
                {['low', 'medium', 'high'].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Due date"><input className="input" type="date" {...form.register('dueDate')} /></Field>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setTaskModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add task</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
