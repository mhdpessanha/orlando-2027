"use client";

import { useEffect, useState } from "react";

function diff(target: Date) {
  const now = new Date();
  let total = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(total / 86_400_000); total -= days * 86_400_000;
  const hours = Math.floor(total / 3_600_000); total -= hours * 3_600_000;
  const mins = Math.floor(total / 60_000); total -= mins * 60_000;
  const secs = Math.floor(total / 1000);
  return { days, hours, mins, secs };
}

export default function CountdownHero({ targetIso, title }: { targetIso: string; title: string }) {
  const target = new Date(targetIso);
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return (
    <section className="sparkle relative bg-ep-50 text-ep-900 rounded-2xl px-6 py-8 md:py-10 text-center overflow-hidden animate-fadeIn">
      <p className="text-xs tracking-[0.2em] text-ep-600 font-medium">FALTAM</p>
      <p className="countdown-num text-7xl md:text-8xl font-display font-medium text-ep-900 leading-none mt-2">
        {t.days}<span className="text-2xl md:text-3xl text-ep-600 font-sans ml-2">dias</span>
      </p>
      <div className="flex items-center justify-center gap-4 mt-3 text-ep-600 text-sm font-mono">
        <span>{String(t.hours).padStart(2, "0")}h</span>
        <span>{String(t.mins).padStart(2, "0")}m</span>
        <span>{String(t.secs).padStart(2, "0")}s</span>
      </div>
      <p className="text-sm text-ep-800 mt-3">{title}</p>
    </section>
  );
}
