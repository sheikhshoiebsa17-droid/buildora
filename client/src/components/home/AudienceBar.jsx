import React from 'react';
import { Palette, Building2, Landmark, HardHat, DraftingCompass } from 'lucide-react';

const audiences = [
  { icon: Palette, label: 'Interior Studios' },
  { icon: Building2, label: 'Builders' },
  { icon: Landmark, label: 'Developers' },
  { icon: HardHat, label: 'Contractors' },
  { icon: DraftingCompass, label: 'Architects' },
];

export default function AudienceBar() {
  return (
    <section id="industries" className="border-y border-line bg-page">
      <div className="section py-10">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted">
          Built for the full spectrum of the built environment
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {audiences.map((a) => (
            <div key={a.label} className="flex items-center gap-2.5 text-slate-500 transition hover:text-navy">
              <a.icon className="h-5 w-5 text-brand-500/70" />
              <span className="text-sm font-semibold">{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
