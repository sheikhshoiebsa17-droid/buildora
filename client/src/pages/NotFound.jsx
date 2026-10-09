import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="section flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="icon-tile mx-auto bg-brand-50 text-brand-500" style={{ width: 72, height: 72 }}>
        <Compass className="h-9 w-9" />
      </span>
      <h1 className="mt-6 text-4xl font-extrabold text-navy">404</h1>
      <p className="mt-2 text-lg text-muted">This page doesn’t exist — but your whole business on one platform does.</p>
      <Link to="/" className="btn-primary mt-7">Back to home</Link>
    </section>
  );
}
