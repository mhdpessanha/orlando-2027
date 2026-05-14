import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { EVENT_CATEGORIES } from "@/lib/parks";
import { parkClasses } from "@/components/ParkBadge";
import { fmtDayShort, relativeDays, daysUntil } from "@/lib/dates";
import { computeDerivedEvents } from "@/lib/derived-events";

export const dynamic = "force-dynamic";

type TimelineItem = {
  id: string;
  title: string;
  date: Date;
  category: string;
  description: string | null;
  link: string | null;
  status: "pending" | "done" | "derived";
  derived: boolean;
};

export default async function EventosTimelinePage() {
  await requireUser();
  const [events, accommodations, flights] = await Promise.all([
    prisma.event.findMany({ orderBy: { date: "asc" } }),
    prisma.accommodation.findMany(),
    prisma.flight.findMany(),
  ]);

  const derived = computeDerivedEvents({ accommodations, flights });

  const items: TimelineItem[] = [
    ...events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      category: e.category,
      description: e.description,
      link: e.link,
      status: (e.status === "done" ? "done" : "pending") as "done" | "pending",
      derived: false,
    })),
    ...derived.map((d) => ({
      id: d.id,
      title: d.title,
      date: d.date,
      category: d.category,
      description: d.description,
      link: d.link,
      status: "derived" as const,
      derived: true,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const groups = new Map<string, TimelineItem[]>();
  for (const it of items) {
    const key = `${it.date.getUTCFullYear()}-${String(it.date.getUTCMonth()).padStart(2, "0")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(it);
  }

  const pendingFuture = items.filter((i) => i.status !== "done" && daysUntil(i.date) >= 0).length;

  return (
    <main className="space-y-5 animate-fadeIn">
      <div className="flex items-end justify-between gap-3 pt-2 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink-900">Linha do tempo</h1>
          <p className="text-sm text-ink-600 mt-1">
            {pendingFuture} marco{pendingFuture === 1 ? "" : "s"} pela frente · marcos com tag <span className="text-[10px] uppercase tracking-wider bg-ink-100 text-ink-600 px-1.5 py-0.5 rounded">auto</span> são derivados das hospedagens e voos
          </p>
        </div>
        <Link href="/eventos" className="text-sm text-ep-600 hover:text-ep-900">
          ver como lista →
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-ink-400 py-8 text-center">Sem marcos cadastrados ainda.</p>
      ) : (
        <div className="space-y-6">
          {Array.from(groups.entries()).map(([key, monthItems]) => {
            const [y, m] = key.split("-").map(Number);
            const monthLabel = new Date(Date.UTC(y, m, 1)).toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            });
            return (
              <section key={key}>
                <h2 className="text-xs uppercase tracking-widest text-ink-600 mb-2 ml-1 font-medium">
                  {monthLabel}
                </h2>
                <div className="relative pl-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-ink-200" aria-hidden />
                  <div className="space-y-2">
                    {monthItems.map((item) => (
                      <TimelineRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

function TimelineRow({ item }: { item: TimelineItem }) {
  const cat =
    EVENT_CATEGORIES[item.category as keyof typeof EVENT_CATEGORIES] ?? {
      label: item.category,
      color: "ink",
    };
  const c = parkClasses(cat.color);
  const days = daysUntil(item.date);
  const isPast = days < 0;
  const isDone = item.status === "done";
  const isOverdue = isPast && item.status === "pending";
  const isDerived = item.derived;

  return (
    <div className="relative">
      <div
        className={`absolute -left-[22px] top-3 w-3 h-3 rounded-full border-2 ${
          isOverdue
            ? "bg-mk-100 border-mk-600"
            : isDone || isPast
            ? "bg-ink-100 border-ink-200"
            : c.strong + " border-transparent"
        }`}
        aria-hidden
      />
      <div
        className={`bg-white border rounded-xl px-4 py-3 ${
          isOverdue
            ? "border-mk-200"
            : isDone || isPast
            ? "border-ink-100 opacity-60"
            : "border-ink-100"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-sm font-medium text-ink-900 ${isDone ? "line-through" : ""}`}>
                {item.title}
              </p>
              {isDerived && (
                <span className="text-[10px] uppercase tracking-wider bg-ink-100 text-ink-600 px-1.5 py-0.5 rounded">
                  auto
                </span>
              )}
              {isOverdue && (
                <span className="text-[10px] uppercase tracking-wider bg-mk-100 text-mk-900 px-1.5 py-0.5 rounded">
                  ⚠ atrasado
                </span>
              )}
            </div>
            <p className="text-xs text-ink-600 mt-0.5">
              {fmtDayShort(item.date)} · {cat.label.toLowerCase()}
            </p>
            {item.description && (
              <p className="text-xs text-ink-800 mt-1.5">{item.description}</p>
            )}
            {item.link && !isPast && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline text-ep-600 hover:text-ep-900 mt-1.5 inline-block"
              >
                abrir link →
              </a>
            )}
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
              isOverdue
                ? "bg-mk-100 text-mk-900"
                : isDone
                ? "bg-ink-100 text-ink-600"
                : isPast
                ? "bg-ink-100 text-ink-600"
                : c.strong
            }`}
          >
            {isDone ? "feito" : relativeDays(item.date)}
          </span>
        </div>
      </div>
    </div>
  );
}
