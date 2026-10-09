import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarCheck, CheckCircle2 } from 'lucide-react';
import { api, errMsg } from '../services/api.js';
import { useToast } from '../components/common/Toast.jsx';
import Spinner from '../components/common/Spinner.jsx';

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid work email'),
  company: z.string().min(2, 'Company name is required'),
  phone: z.string().regex(/^[+()\-\s\d]{7,20}$/, 'Enter a valid phone number'),
  businessType: z.string().optional(),
  companySize: z.string().optional(),
  preferredDate: z.string().optional(),
  message: z.string().max(2000, 'Message is too long').optional(),
});

const businessTypes = ['Interior Design Studio', 'Builder / Developer', 'Contractor', 'Architect', 'PMC', 'Other'];
const sizes = ['1–10', '11–50', '51–200', '200+'];

export default function DemoPage() {
  const toast = useToast();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      await api.post('/demo-requests', values);
      setDone(true);
      reset();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <section className="section py-16">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-600 ring-1 ring-brand-100">
            <CalendarCheck className="h-3.5 w-3.5" /> Book a demo
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-navy">
            See Buildora on <span className="gradient-text">your projects</span>
          </h1>
          <p className="mt-3 text-lg text-muted">
            30 minutes, tailored to how your business runs. No credit card, no obligation.
          </p>
        </div>

        {done ? (
          <div className="card mt-10 p-10 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
            <h2 className="mt-4 text-2xl font-bold text-navy">Request received!</h2>
            <p className="mt-2 text-muted">
              Our team will contact you within one business day to schedule your walkthrough.
            </p>
            <button onClick={() => setDone(false)} className="btn-secondary mt-6">
              Submit another request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="card mt-10 grid gap-5 p-6 sm:grid-cols-2 sm:p-8" noValidate>
            <div>
              <label htmlFor="fullName" className="label">Full name *</label>
              <input id="fullName" className="input" {...register('fullName')} />
              {errors.fullName && <p className="mt-1 text-xs text-danger" role="alert">{errors.fullName.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="label">Work email *</label>
              <input id="email" type="email" className="input" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-danger" role="alert">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="company" className="label">Company name *</label>
              <input id="company" className="input" {...register('company')} />
              {errors.company && <p className="mt-1 text-xs text-danger" role="alert">{errors.company.message}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="label">Phone number *</label>
              <input id="phone" type="tel" className="input" placeholder="+91 98XXX XXXXX" {...register('phone')} />
              {errors.phone && <p className="mt-1 text-xs text-danger" role="alert">{errors.phone.message}</p>}
            </div>
            <div>
              <label htmlFor="businessType" className="label">Business type</label>
              <select id="businessType" className="input" {...register('businessType')}>
                {businessTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="companySize" className="label">Company size</label>
              <select id="companySize" className="input" {...register('companySize')}>
                {sizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="preferredDate" className="label">Preferred date</label>
              <input id="preferredDate" type="date" className="input sm:max-w-xs" {...register('preferredDate')} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="message" className="label">What would you like to see?</label>
              <textarea id="message" rows={4} className="input resize-none" placeholder="e.g. We run 12 interior projects a month and need BOQ + site tracking…" {...register('message')} />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3 text-base sm:w-auto sm:px-10">
                {isSubmitting ? <Spinner className="h-4 w-4" /> : 'Request my demo'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
