import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { RESERVATION_TYPES } from "@/lib/parks";
import { fmtDayMonth, fmtDayShort } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const filter = sp.tipo;

  const reservations = await prisma.reservation.findMany({
    where: filter ? { type: filter } : {},
    orderBy: [{ date: "asc" }, { time: "asc" }],
    include: { day: true },
  });

  // group by month-year
  const groups = new Map<string, typeof reservations>();
  for (const r of reservations) {
    const key = `${r.date.getUTCFullYear()}-${r.date.getUTCMonth()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  return (
    <main className="space-y-4 animate-fadeIn">
      <div className="flex items-end justify-between flex-wrap gap-3 pt-2">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink-900">Reservas</h1>
          <p className="text-sm text-ink-600 mt-1">{reservations.length} reserva{reservations.length === 1 ? "" : "s"} cadastrada{reservations.length === 1 ? "" : "s"}</p>
        </div>
        <Link href="/reservas/nova" className="bg-ep-600 hover:bg-ep-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + nova reserva
        </Link>
      </div>

      {/* type filter chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <FilterChip label="Todas" href="/reservas" active={!filter} />
        {Object.entries(RESERVATION_TYPES).map(([k, v]) => (
          <FilterChip key={k} label={`${v.icon} ${v.label}`} href={`/reservas?tipo=${k}`} active={filter === k} />
        ))}
      </div>

      {reservations.length === 0 && (
        <div className="bg-white border border-ink-100 rounded-2xl p-10 text-center">
          <p className="text-ink-600">Nenhuma reserva cadastrada ainda.</p>
          <Link href="/reservas/nova" className="inline-block mt-3 text-ep-600 hover:text-ep-900">+ adicionar a primeira</Link>
        </div>
      )}

      {Array.from(groups.entries()).map(([key, items]) => {
        const [year, month] = key.split("-").map(Number);
        const monthName = new Date(Date.UTC(year, month, 1)).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
        return (
          <section key={key}>
            <h2 className="text-xs font-medium uppercase tracking-wider text-ink-600 mb-2 ml-1">{monthName}</h2>
            <div className="space-y-1.5">
              {items.map((r) => {
                const t = RESERVATION_TYPES[r.type as keyof typeof RESERVATION_TYPES] ?? { icon: "📌", label: r.type };
                return (
                  <Link
                    key={r.id}
                    href={`/reservas/${r.id}`}
                    className="block bg-white border border-ink-100 hover:border-ep-200 rounded-xl px-4 py-3 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{t.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-ink-900 truncate">{r.name}</p>
                        <p className="text-xs text-ink-600 mt-0.5">
                          {fmtDayShort(r.date)}
                          {r.time && <> · ⏰ {r.time}</>}
                          {r.location && <> · 📍 {r.location}</>}
                          {r.partySize && <> · {r.partySize} pessoas</>}
                        </p>
                      </div>
                      {r.confirmation && (
                        <code className="text-xs bg-ink-50 px-2 py-1 rounded font-mono text-ink-800 border border-ink-100 hidden sm:inline-block">
                          {r.confirmation}
                        </code>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}

function FilterChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition ${
        active ? "bg-ep-600 text-white" : "bg-white border border-ink-200 text-ink-800 hover:border-ep-200"
      }`}
    >
      {label}
    </Link>
  );
}
