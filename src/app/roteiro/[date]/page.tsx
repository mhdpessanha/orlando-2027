import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { parkInfo, PARKS, RESERVATION_TYPES, type ParkCode } from "@/lib/parks";
import { parkClasses } from "@/components/ParkBadge";
import { fmtDayLong, fmtDateInput, parseUTCDate } from "@/lib/dates";
import { updateDay, createTip, toggleTipDone, deleteTip } from "@/lib/day-actions";

export const dynamic = "force-dynamic";

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  await requireUser();
  const { date } = await params;

  const day = await prisma.day.findUnique({
    where: { date: parseUTCDate(date) },
    include: {
      accommodation: true,
      reservations: { orderBy: [{ time: "asc" }, { name: "asc" }] },
      tips: { orderBy: [{ done: "asc" }, { priority: "desc" }, { category: "asc" }] },
    },
  });

  if (!day) notFound();

  const accs = await prisma.accommodation.findMany({ orderBy: { checkIn: "asc" } });

  // Interesses da turma cujo parque bate com o desse dia.
  const dayInterests = day.parkCode && day.parkCode !== "off" && day.parkCode !== "travel"
    ? await prisma.interest.findMany({
        where: { parkCode: day.parkCode },
        include: { user: { select: { name: true, color: true } } },
        orderBy: [{ priority: "desc" }, { name: "asc" }],
      })
    : [];

  // Agrupa por (kind + nome lowercase) — mesma atração escrita por gente diferente vira uma linha só.
  const groupedInterests = new Map<string, {
    kind: string;
    name: string;
    maxPriority: number;
    voters: { name: string; color: string; priority: number }[];
  }>();
  for (const it of dayInterests) {
    const key = `${it.kind}::${it.name.trim().toLowerCase()}`;
    const existing = groupedInterests.get(key);
    if (existing) {
      existing.voters.push({ name: it.user.name, color: it.user.color, priority: it.priority });
      existing.maxPriority = Math.max(existing.maxPriority, it.priority);
    } else {
      groupedInterests.set(key, {
        kind: it.kind,
        name: it.name,
        maxPriority: it.priority,
        voters: [{ name: it.user.name, color: it.user.color, priority: it.priority }],
      });
    }
  }
  const interestGroups = Array.from(groupedInterests.values()).sort(
    (a, b) => b.maxPriority - a.maxPriority || b.voters.length - a.voters.length,
  );
  const attractionGroups = interestGroups.filter((g) => g.kind === "attraction");
  const diningGroups = interestGroups.filter((g) => g.kind === "dining");

  // adjacent days for navigation
  const [prev, next] = await Promise.all([
    prisma.day.findFirst({ where: { date: { lt: day.date } }, orderBy: { date: "desc" } }),
    prisma.day.findFirst({ where: { date: { gt: day.date } }, orderBy: { date: "asc" } }),
  ]);

  const p = parkInfo(day.parkCode);
  const cls = parkClasses(p.color);

  return (
    <main className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between text-sm pt-2">
        <Link href="/roteiro" className="text-ink-600 hover:text-ink-900">← Roteiro</Link>
        <div className="flex gap-3">
          {prev && <Link href={`/roteiro/${prev.date.toISOString().slice(0, 10)}`} className="text-ink-600 hover:text-ink-900">← anterior</Link>}
          {next && <Link href={`/roteiro/${next.date.toISOString().slice(0, 10)}`} className="text-ink-600 hover:text-ink-900">próximo →</Link>}
        </div>
      </div>

      {/* hero */}
      <section className={`${cls.soft} border ${cls.border} rounded-2xl px-6 py-6`}>
        <p className="text-xs uppercase tracking-widest opacity-70">{fmtDayLong(day.date)}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-4xl">{p.icon}</span>
          <h1 className="font-display text-3xl md:text-4xl font-medium">{p.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 text-sm">
          {day.parkOpen && <span className={`px-2 py-1 rounded-full ${cls.strong}`}>abre {day.parkOpen}</span>}
          {day.parkClose && <span className={`px-2 py-1 rounded-full ${cls.strong}`}>fecha {day.parkClose}</span>}
          {day.earlyEntry && <span className={`px-2 py-1 rounded-full ${cls.strong}`}>✨ Early Entry</span>}
          {day.extendedEvening && <span className={`px-2 py-1 rounded-full ${cls.strong}`}>🌙 Extended Evening</span>}
          {day.accommodation && <span className={`px-2 py-1 rounded-full ${cls.strong}`}>🏨 {day.accommodation.shortName}</span>}
        </div>
        {day.notes && <p className="mt-4 text-sm whitespace-pre-wrap opacity-90">{day.notes}</p>}
      </section>

      {/* reservations for this day */}
      <section className="bg-white border border-ink-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-medium text-ink-900">Reservas do dia</h2>
          <Link href={`/reservas/nova?date=${fmtDateInput(day.date)}&dayId=${day.id}`} className="text-sm text-ep-600 hover:text-ep-900">
            + nova reserva
          </Link>
        </div>
        {day.reservations.length === 0 ? (
          <p className="text-sm text-ink-400 py-2">Sem reservas pra esse dia ainda.</p>
        ) : (
          <div className="space-y-2">
            {day.reservations.map((r) => {
              const rt = RESERVATION_TYPES[r.type as keyof typeof RESERVATION_TYPES] ?? { label: r.type, icon: "📌" };
              return (
                <Link
                  key={r.id}
                  href={`/reservas/${r.id}`}
                  className="block bg-ink-50 hover:bg-ink-100 transition rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{rt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink-900 truncate">{r.name}</p>
                      <p className="text-xs text-ink-600 mt-0.5">
                        {r.time && <>⏰ {r.time}</>}
                        {r.partySize && <span className="ml-2">· {r.partySize} pessoas</span>}
                        {r.location && <span className="ml-2">· {r.location}</span>}
                      </p>
                    </div>
                    {r.confirmation && (
                      <code className="text-xs bg-white px-2 py-1 rounded font-mono text-ink-600 border border-ink-200">
                        {r.confirmation}
                      </code>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* interests of the group for this park */}
      {dayInterests.length > 0 && (
        <section className="bg-white border border-ink-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-medium text-ink-900">Interesses da turma</h2>
            <span className="text-xs text-ink-600">{dayInterests.length} no total · {interestGroups.length} únicos</span>
          </div>

          {attractionGroups.length > 0 && (
            <InterestGroupList title="🎢 Atrações" groups={attractionGroups} />
          )}
          {diningGroups.length > 0 && (
            <InterestGroupList title="🍴 Restaurantes" groups={diningGroups} />
          )}
        </section>
      )}

      {/* tips / attractions */}
      <section className="bg-white border border-ink-100 rounded-2xl p-5">
        <h2 className="font-display text-xl font-medium text-ink-900 mb-3">Dicas e atrações</h2>

        {day.tips.length === 0 ? (
          <p className="text-sm text-ink-400">Nenhuma dica adicionada ainda.</p>
        ) : (
          <div className="space-y-1.5">
            {day.tips.map((t) => (
              <div key={t.id} className={`flex items-start gap-2 p-2 rounded-lg ${t.done ? "opacity-50" : ""}`}>
                <form action={async () => { "use server"; await toggleTipDone(t.id); }}>
                  <button className="mt-0.5 w-4 h-4 rounded border border-ink-400 flex items-center justify-center hover:border-ep-600 transition" aria-label="Marcar feito">
                    {t.done && <span className="text-xs">✓</span>}
                  </button>
                </form>
                <div className="flex-1">
                  <p className={`text-sm ${t.done ? "line-through" : ""}`}>
                    <span className="text-xs mr-1.5 opacity-60">{iconForTip(t.category)}</span>
                    {t.title}
                  </p>
                  {t.notes && <p className="text-xs text-ink-600 mt-0.5">{t.notes}</p>}
                </div>
                {t.priority > 0 && <span className="text-xs">{"⭐".repeat(Math.min(t.priority, 3))}</span>}
                <form action={async () => { "use server"; await deleteTip(t.id); }}>
                  <button className="text-ink-400 hover:text-mk-600 text-xs">✕</button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={createTip} className="mt-4 pt-4 border-t border-ink-100 space-y-2">
          <input type="hidden" name="dayId" value={day.id} />
          <div className="flex gap-2">
            <select name="category" defaultValue="attraction" className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm">
              <option value="attraction">Atração</option>
              <option value="dining">Comida</option>
              <option value="show">Show</option>
              <option value="tip">Dica</option>
              <option value="todo">Lembrete</option>
            </select>
            <select name="priority" defaultValue="0" className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm">
              <option value="0">Normal</option>
              <option value="1">⭐</option>
              <option value="2">⭐⭐</option>
              <option value="3">⭐⭐⭐</option>
            </select>
          </div>
          <input
            name="title"
            placeholder="Ex: Rise of the Resistance (prioridade alta)"
            required
            className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
          />
          <textarea
            name="notes"
            rows={2}
            placeholder="Observações (opcional)"
            className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
          />
          <button type="submit" className="text-sm bg-ep-600 hover:bg-ep-800 text-white px-3 py-1.5 rounded-lg transition">
            adicionar
          </button>
        </form>
      </section>

      {/* edit day */}
      <section className="bg-white border border-ink-100 rounded-2xl p-5">
        <h2 className="font-display text-xl font-medium text-ink-900 mb-3">Editar dia</h2>
        <form action={updateDay.bind(null, day.id)} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Parque">
              <select name="parkCode" defaultValue={day.parkCode ?? ""} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm">
                <option value="">— nenhum —</option>
                {(Object.keys(PARKS) as ParkCode[]).map((k) => (
                  <option key={k} value={k}>{PARKS[k].icon} {PARKS[k].name}</option>
                ))}
              </select>
            </Field>
            <Field label="Hospedagem">
              <select name="accommodationId" defaultValue={day.accommodationId ?? ""} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm">
                <option value="">— nenhuma —</option>
                {accs.map((a) => (
                  <option key={a.id} value={a.id}>{a.shortName}</option>
                ))}
              </select>
            </Field>
            <Field label="Abre">
              <input name="parkOpen" defaultValue={day.parkOpen ?? ""} placeholder="08:00" className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
            </Field>
            <Field label="Fecha">
              <input name="parkClose" defaultValue={day.parkClose ?? ""} placeholder="22:00" className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
            </Field>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="earlyEntry" defaultChecked={day.earlyEntry} /> Early Entry
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="extendedEvening" defaultChecked={day.extendedEvening} /> Extended Evening
            </label>
          </div>
          <Field label="Notas">
            <textarea name="notes" defaultValue={day.notes ?? ""} rows={3} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" placeholder="Notas livres sobre o dia..." />
          </Field>
          <button type="submit" className="bg-ep-600 hover:bg-ep-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            salvar
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-ink-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function iconForTip(cat: string) {
  return ({ attraction: "🎢", dining: "🍴", show: "🎭", tip: "💡", todo: "📝" } as Record<string, string>)[cat] ?? "📌";
}

function InterestGroupList({
  title,
  groups,
}: {
  title: string;
  groups: { name: string; maxPriority: number; voters: { name: string; color: string; priority: number }[] }[];
}) {
  return (
    <div className="mb-4 last:mb-0">
      <h3 className="text-sm font-medium text-ink-900 mb-2">{title}</h3>
      <ul className="space-y-1.5">
        {groups.map((g) => (
          <li key={g.name} className="flex items-start gap-2 p-2 rounded-lg hover:bg-ink-50 transition">
            <span className="text-xs whitespace-nowrap">{"⭐".repeat(g.maxPriority)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink-900">{g.name}</p>
              <p className="text-xs text-ink-600 mt-0.5">
                {g.voters.length} pessoa{g.voters.length === 1 ? "" : "s"}:{" "}
                {g.voters
                  .sort((a, b) => b.priority - a.priority)
                  .map((v) => `${v.name} ${"★".repeat(v.priority)}`)
                  .join(" · ")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
