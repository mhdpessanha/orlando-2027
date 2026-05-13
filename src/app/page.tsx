import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { parkInfo } from "@/lib/parks";
import { EVENT_CATEGORIES } from "@/lib/parks";
import { fmtDayShort, fmtDayMonth, daysUntil, relativeDays } from "@/lib/dates";
import CountdownHero from "@/components/CountdownHero";
import StatsGrid from "@/components/StatsGrid";
import SectionHeader from "@/components/SectionHeader";
import { parkClasses } from "@/components/ParkBadge";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await requireUser();
  const trip = await prisma.trip.findUnique({ where: { id: 1 } });
  if (!trip) {
    return (
      <main className="py-20 text-center">
        <p className="text-ink-600">Banco vazio. Rode <code className="bg-ink-100 px-1 rounded">npm run db:seed</code> primeiro.</p>
      </main>
    );
  }

  const now = new Date();
  const [days, reservations, events, accs, users] = await Promise.all([
    prisma.day.findMany({ orderBy: { date: "asc" } }),
    prisma.reservation.count(),
    prisma.event.findMany({
      where: { status: "pending", date: { gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) } },
      orderBy: { date: "asc" },
      take: 5,
    }),
    prisma.accommodation.count(),
    prisma.user.count(),
  ]);

  const tripDays = days.length;
  const parksCount = new Set(
    days.filter((d) => d.parkCode && d.parkCode !== "off" && d.parkCode !== "travel").map((d) => d.parkCode)
  ).size;

  const nextEvent = events[0];
  const previewDays = days.slice(0, 5);

  const tripStartIso = trip.startDate.toISOString();
  const daysToTrip = daysUntil(trip.startDate);

  return (
    <main className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-medium text-ink-900">
            {trip.title}
          </h1>
          <p className="text-sm text-ink-600 mt-1">
            🗓️ {fmtDayMonth(trip.startDate)} a {fmtDayMonth(trip.endDate)} de {trip.endDate.getUTCFullYear()} · {users} viajantes
          </p>
        </div>
      </div>

      <CountdownHero targetIso={tripStartIso} title="até embarcar pra Orlando" />

      <StatsGrid
        stats={[
          { label: "Duração", value: tripDays, sub: "dias" },
          { label: "Viajantes", value: users },
          { label: "Parques", value: parksCount },
          { label: "Reservas", value: reservations },
        ]}
      />

      {nextEvent && (
        <NextEventCard event={nextEvent} />
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-white border border-ink-100 rounded-2xl p-5">
          <SectionHeader title="Próximos eventos" action={{ href: "/eventos", label: "ver todos" }} />
          <div className="space-y-1">
            {events.length === 0 && <p className="text-sm text-ink-400 py-4">Nenhum evento pendente.</p>}
            {events.map((e) => {
              const cat = EVENT_CATEGORIES[e.category as keyof typeof EVENT_CATEGORIES] ?? { label: e.category, color: "ink" };
              const c = parkClasses(cat.color);
              return (
                <div key={e.id} className="flex items-center gap-3 py-2 border-b border-ink-100 last:border-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${c.strong}`}>
                    {iconForCategory(e.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink-900 truncate">{e.title}</p>
                    <p className="text-xs text-ink-600">{fmtDayMonth(e.date)} · {cat.label.toLowerCase()}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.soft}`}>{relativeDays(e.date)}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white border border-ink-100 rounded-2xl p-5">
          <SectionHeader title="Próximos dias do roteiro" action={{ href: "/roteiro", label: "ver roteiro" }} />
          <div className="space-y-1.5">
            {previewDays.map((d) => {
              const p = parkInfo(d.parkCode);
              const cls = parkClasses(p.color);
              return (
                <Link
                  key={d.id}
                  href={`/roteiro/${d.date.toISOString().slice(0, 10)}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg ${cls.soft} hover:opacity-80 transition`}
                >
                  <div className="text-xs font-medium w-12 leading-tight">
                    {fmtDayShort(d.date).split(" ").slice(0, 1).join(" ")}<br />
                    <span className="text-[10px]">{fmtDayMonth(d.date)}</span>
                  </div>
                  <span className="text-xl">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function iconForCategory(c: string) {
  return ({
    payment: "💳",
    document: "📄",
    booking: "🍽️",
    shopping: "🛒",
    deadline: "⏰",
    milestone: "✨",
  } as Record<string, string>)[c] ?? "📌";
}

function NextEventCard({ event }: { event: { id: string; title: string; date: Date; description: string | null; category: string } }) {
  const cat = EVENT_CATEGORIES[event.category as keyof typeof EVENT_CATEGORIES];
  const color = cat?.color ?? "mk";
  const c = parkClasses(color);
  return (
    <Link
      href="/eventos"
      className={`block ${c.soft} border ${c.border} rounded-2xl p-5 hover:scale-[1.005] transition-transform`}
    >
      <p className="text-[11px] tracking-[0.15em] font-medium opacity-70">
        🔔 PRÓXIMO EVENTO · {relativeDays(event.date).toUpperCase()}
      </p>
      <p className="font-display text-xl md:text-2xl font-medium mt-1">{event.title}</p>
      <p className="text-sm opacity-80 mt-1">
        {fmtDayMonth(event.date)}
        {event.description ? ` · ${event.description}` : ""}
      </p>
    </Link>
  );
}
