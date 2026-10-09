import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Search, FolderOpen, FileText, Download, UploadCloud, Tag } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import DataTable from '../../components/common/DataTable.jsx';
import { Badge, SectionCard, Modal, ErrorState, EmptyState, SkeletonTable, fmtDate } from '../../components/common/ui.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { Stat, Field } from './CRM.jsx';

const CATEGORIES = [
  { value: 'legal', label: 'Legal & Agreements' },
  { value: 'design', label: 'Design Sheets & 3D' },
  { value: 'contract', label: 'Work Contracts' },
  { value: 'invoice', label: 'Invoices & Bills' },
  { value: 'site_photo', label: 'Site Inspection Photos' },
  { value: 'other', label: 'Other Documents' },
];

export default function Documents() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['documents', page, search, categoryFilter],
    queryFn: async () =>
      (
        await api.get('/documents', {
          params: { page, limit: 12, search: search || undefined, category: categoryFilter || undefined },
        })
      ).data,
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects-mini'],
    queryFn: async () => (await api.get('/projects?limit=100')).data.data,
  });

  const projects = projectsData || [];
  const docs = data?.data || [];
  const total = data?.total || docs.length;

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'design',
      project: '',
      tags: '',
    },
  });

  const uploadDoc = useMutation({
    mutationFn: async (values) => {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description || '');
      formData.append('category', values.category || 'other');
      if (values.project) formData.append('project', values.project);
      if (values.tags) formData.append('tags', values.tags);
      if (fileToUpload) formData.append('file', fileToUpload);

      return (await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })).data;
    },
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      setCreateOpen(false);
      setFileToUpload(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const columns = [
    {
      key: 'title',
      header: 'Document Title',
      render: (d) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <span className="font-semibold text-navy">{d.title}</span>
            {d.description && <div className="text-xs text-muted line-clamp-1">{d.description}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (d) => (
        <Badge tone="slate">
          {CATEGORIES.find((c) => c.value === d.category)?.label || d.category}
        </Badge>
      ),
    },
    {
      key: 'project',
      header: 'Project',
      render: (d) => <span className="text-slate-600">{d.project?.name || 'General Org'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Uploaded On',
      render: (d) => <span className="text-xs text-slate-500">{fmtDate(d.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (d) => (
        <a
          href={`/api/documents/${d._id}/download`}
          download
          className="btn-secondary px-2.5 py-1 text-xs inline-flex items-center gap-1"
        >
          <Download className="h-3 w-3" /> Download
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">Document Management</h1>
          <p className="mt-1 text-sm text-muted">Centralized repository for blueprints, contracts, site photos and regulatory permits.</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <UploadCloud className="h-4 w-4" /> Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat icon={FolderOpen} tone="bg-brand-50 text-brand-600" label="Total Files" value={total} />
        <Stat icon={Tag} tone="bg-emerald-50 text-emerald-600" label="Drawings & 3D" value={docs.filter((d) => d.category === 'design').length} />
        <Stat icon={FileText} tone="bg-amber-50 text-amber-600" label="Contracts & Legal" value={docs.filter((d) => d.category === 'legal' || d.category === 'contract').length} />
      </div>

      <SectionCard
        title="File Library"
        subtitle="Versioned assets and client-shared documentation"
        action={
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="input py-1.5 text-xs w-44"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search documents..."
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
        ) : docs.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No documents uploaded yet"
              description="Upload architectural drawings, handover contracts or vendor agreements."
              action={<button onClick={() => setCreateOpen(true)} className="btn-primary">Upload Document</button>}
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={docs}
            page={page}
            total={total}
            pageSize={12}
            onPageChange={setPage}
          />
        )}
      </SectionCard>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Upload Document">
        <form onSubmit={form.handleSubmit((d) => uploadDoc.mutate(d))} className="space-y-4">
          <Field label="Document Title *" error={form.formState.errors.title?.message}>
            <input {...form.register('title', { required: 'Title is required' })} className="input" placeholder="e.g. Master Bedroom 3D Render v2" />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Category">
              <select {...form.register('category')} className="input">
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Linked Project">
              <select {...form.register('project')} className="input">
                <option value="">General Company Archive</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Description / Version Notes">
            <input {...form.register('description')} className="input" placeholder="e.g. Approved layout with Italian marble floor" />
          </Field>
          <Field label="Tags (comma separated)">
            <input {...form.register('tags')} className="input" placeholder="e.g. 3d, interior, master_bed" />
          </Field>
          <Field label="Select File">
            <input
              type="file"
              onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
              className="input py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-brand-600 hover:file:bg-brand-100"
            />
          </Field>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={uploadDoc.isPending} className="btn-primary">
              {uploadDoc.isPending ? 'Uploading...' : 'Save & Upload'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
