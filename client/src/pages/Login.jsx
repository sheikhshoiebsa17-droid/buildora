import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import { errMsg } from '../services/api.js';
import Spinner from '../components/common/Spinner.jsx';
import Logo from '../components/common/Logo.jsx';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const {
    register, handleSubmit, setValue, formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const fillCreds = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  const onSubmit = async (values) => {
    try {
      await login(values.email, values.password);
      const dest = location.state?.from?.pathname || '/app';
      toast.success('Welcome back!');
      navigate(dest, { replace: true });
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <section className="section flex min-h-[80vh] items-center justify-center py-14">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <Logo className="h-10 w-10" />
            <span className="text-2xl font-extrabold text-navy">Build<span className="gradient-text">ora</span></span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-navy">Sign in to your workspace</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-7" noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" autoComplete="email" className="input" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-danger" role="alert">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" type="password" autoComplete="current-password" className="input" {...register('password')} />
              {errors.password && <p className="mt-1 text-xs text-danger" role="alert">{errors.password.message}</p>}
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary mt-6 w-full justify-center py-3">
            {isSubmitting ? <Spinner className="h-4 w-4" /> : <><LogIn className="h-4 w-4" /> Sign in</>}
          </button>
          <p className="mt-5 text-center text-sm text-muted">
            New to Buildora? <Link to="/register" className="font-semibold text-brand-600 hover:underline">Create an account</Link>
          </p>
        </form>

        <div className="mt-5 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 text-center text-sm shadow-sm">
          <p className="font-bold text-navy">Quick Demo Login</p>
          <p className="mt-0.5 text-xs text-slate-500">Click any role below to pre-fill test credentials:</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <button
              type="button"
              onClick={() => fillCreds('demo@buildora.dev', 'BuildoraDemo2026')}
              className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-brand-200 hover:bg-brand-50"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => fillCreds('pm@buildora.dev', 'BuildoraDemo2026#P')}
              className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
            >
              📋 Project Mgr
            </button>
            <button
              type="button"
              onClick={() => fillCreds('sales@buildora.dev', 'BuildoraDemo2026#S')}
              className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
            >
              💼 Sales Mgr
            </button>
            <button
              type="button"
              onClick={() => fillCreds('designer@buildora.dev', 'BuildoraDemo2026#D')}
              className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
            >
              🎨 Designer
            </button>
            <button
              type="button"
              onClick={() => fillCreds('finance@buildora.dev', 'BuildoraDemo2026#F')}
              className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
            >
              💰 Finance
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
