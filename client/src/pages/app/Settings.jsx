import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Settings as SettingsIcon, User, Lock, Building, ShieldCheck } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { SectionCard, ErrorState, SkeletonCard } from '../../components/common/ui.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { Field } from './CRM.jsx';

export default function Settings() {
  const { user } = useAuth();
  const toast = useToast();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/profile')).data.data,
  });

  const profileForm = useForm({
    values: {
      name: data?.name || user?.name || '',
      phone: data?.phone || '',
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      current: '',
      next: '',
      confirm: '',
    },
  });

  const updateProfile = useMutation({
    mutationFn: (values) => api.patch('/profile', values),
    onSuccess: () => {
      toast.success('Profile details updated');
      refetch();
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const changePassword = useMutation({
    mutationFn: (values) => api.post('/profile/password', { current: values.current, next: values.next }),
    onSuccess: () => {
      toast.success('Password changed successfully');
      passwordForm.reset();
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy">Account & Workspace Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your personal profile, credentials and organization preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <SectionCard title="Personal Profile" subtitle="Your display name and direct contact info">
          {isLoading ? (
            <div className="p-5"><SkeletonCard lines={4} /></div>
          ) : isError ? (
            <div className="p-5"><ErrorState message={errMsg(error)} onRetry={refetch} /></div>
          ) : (
            <form onSubmit={profileForm.handleSubmit((d) => updateProfile.mutate(d))} className="space-y-4 p-5">
              <Field label="Full Name">
                <input {...profileForm.register('name', { required: true })} className="input" />
              </Field>
              <Field label="Email Address">
                <input value={user?.email || ''} disabled className="input bg-slate-50 text-slate-500 cursor-not-allowed" />
                <p className="mt-1 text-xs text-muted">Email is managed by organization admin.</p>
              </Field>
              <Field label="Phone Number">
                <input {...profileForm.register('phone')} className="input" placeholder="+91 98765 43210" />
              </Field>
              <div className="pt-2">
                <button type="submit" disabled={updateProfile.isPending} className="btn-primary">
                  {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}
        </SectionCard>

        {/* Password Security Card */}
        <SectionCard title="Change Password" subtitle="Ensure your account is protected with a secure password">
          <form
            onSubmit={passwordForm.handleSubmit((d) => {
              if (d.next !== d.confirm) {
                toast.error('New passwords do not match');
                return;
              }
              changePassword.mutate(d);
            })}
            className="space-y-4 p-5"
          >
            <Field label="Current Password">
              <input type="password" {...passwordForm.register('current', { required: true })} className="input" />
            </Field>
            <Field label="New Password">
              <input
                type="password"
                {...passwordForm.register('next', {
                  required: true,
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                })}
                className="input"
              />
            </Field>
            <Field label="Confirm New Password">
              <input type="password" {...passwordForm.register('confirm', { required: true })} className="input" />
            </Field>
            <div className="pt-2">
              <button type="submit" disabled={changePassword.isPending} className="btn-primary">
                {changePassword.isPending ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* Organization Information */}
        <SectionCard title="Organization Overview" subtitle="Studio workspace details and permissions">
          <div className="space-y-4 p-5 text-sm">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-slate-500">Organization Name</span>
              <span className="font-semibold text-navy">{user?.organization?.name || 'Buildora Studio'}</span>
            </div>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-slate-500">Assigned Role</span>
              <span className="font-semibold uppercase tracking-wider text-brand-600 font-mono text-xs">
                {user?.role || 'Staff'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-slate-500">Default Currency</span>
              <span className="font-semibold text-navy">{user?.organization?.currency || 'INR (₹)'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Active Modules</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                Full Suite Enabled
              </span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
