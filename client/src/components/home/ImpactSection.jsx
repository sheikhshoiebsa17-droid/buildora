import React, { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';

const metrics = [
  { value: 1200, suffix: '+', label: 'Projects managed' },
  { value: 98, suffix: '%', label: 'Client satisfaction' },
  { value: 70, suffix: '%', label: 'Reduction in manual work' },
  { value: 2.4, suffix: '×', label: 'Faster delivery cycles', decimals: 1 },
  { value: 19, suffix: '', label: 'Integrated modules' },
];

function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function CountUp({ value, suffix, decimals = 0, start }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!start) return;
    const duration = 1400;
    const startTime = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, value]);
  return (
    <span>
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

export default function ImpactSection() {
  const [ref, inView] = useInView();

  return (
    <section id="impact" className="relative overflow-hidden bg-navy py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ background: 'radial-gradient(800px 400px at 20% 20%, rgba(101,69,245,0.35), transparent), radial-gradient(700px 350px at 80% 80%, rgba(25,183,213,0.25), transparent)' }}
      />
      <div className="section relative" ref={ref}>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Numbers that move the business
        </h2>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-2xl bg-white/5 p-6 text-center ring-1 ring-white/10 transition hover:bg-white/10">
              <p className="bg-gradient-to-r from-violet-300 via-sky-300 to-cyan-300 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
                <CountUp value={m.value} suffix={m.suffix} decimals={m.decimals} start={inView} />
              </p>
              <p className="mt-2 text-xs font-medium text-slate-300 sm:text-sm">{m.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Info className="h-3.5 w-3.5 text-amber-400" />
          Illustrative demonstration metrics for the Buildora demo environment — not verified customer outcomes.
        </p>
      </div>
    </section>
  );
}
