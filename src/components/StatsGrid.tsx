export default function StatsGrid({
  stats,
}: {
  stats: { label: string; value: string | number; sub?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {stats.map((s) => (
        <div key={s.label} className="bg-white border border-ink-100 rounded-xl px-4 py-3">
          <p className="text-xs text-ink-600">{s.label}</p>
          <p className="font-display text-2xl font-medium text-ink-900 mt-0.5 leading-tight">
            {s.value}
            {s.sub && <span className="text-xs font-sans text-ink-400 font-normal ml-1">{s.sub}</span>}
          </p>
        </div>
      ))}
    </div>
  );
}
