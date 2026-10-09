import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import { errMsg } from '../services/api.js';
import Spinner from '../components/common/Spinner.jsx';
import Logo from '../components/common/Logo.jsx';

const schema = z
  .object({
    name: z.string().min(2, 'Your name is required'),
    companyName: z.string().min(2, 'Company name is required'),
    email: z.string().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[a-zA-Z]/, 'Include a letter')
      .regex(/[0-9]/, 'Include a number'),
    confirm: z.string(),
  })
  .refine((v) => v.confirm === v.password, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        organization: { name: values.companyName },
      });
      toast.success('Workspace created — welcome to Buildora!');
      navigate('/app', { replace: true });
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
          <h1 className="mt-4 text-2xl font-bold text-navy">Create your workspace</h1>
          <p className="mt-1 text-sm text-muted">You’ll be the admin — invite your team after setup.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-7" noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="label">Your name</label>
              <input id="name" className="input" autoComplete="name" {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-danger" role="alert">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="companyName" className="label">Company name</label>
              <input id="companyName" className="input" autoComplete="organization" {...register('companyName')} />
              {errors.companyName && <p className="mt-1 text-xs text-danger" role="alert">{errors.companyName.message}</p>}
            </div>
            <div>
              <label htmlFor="regEmail" className="label">Work email</label>
              <input id="regEmail" type="email" className="input" autoComplete="email" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-danger" role="alert">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="regPassword" className="label">Password</label>
              <input id="regPassword" type="password" className="input" autoComplete="new-password" {...register('password')} />
              {errors.password && <p className="mt-1 text-xs text-danger" role="alert">{errors.password.message}</p>}
            </div>
            <div>
              <label htmlFor="confirm" className="label">Confirm password</label>
              <input id="confirm" type="password" className="input" autoComplete="new-password" {...register('confirm')} />
              {errors.confirm && <p className="mt-1 text-xs text-danger" role="alert">{errors.confirm.message}</p>}
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary mt-6 w-full justify-center py-3">
            {isSubmitting ? <Spinner className="h-4 w-4" /> : <><UserPlus className="h-4 w-4" /> Create workspace</>}
          </button>
          <p className="mt-5 text-center text-sm text-muted">
            Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
