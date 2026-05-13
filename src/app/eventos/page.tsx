import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { EVENT_CATEGORIES } from "@/lib/parks";
import { parkClasses } from "@/components/ParkBadge";
import { fmtDayShort, relativeDays, daysUntil } from "@/lib/dates";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function toggleEventDone(formData: FormData) {
  "use server";
  await requireUser();
  const id = String(formData.get("id"));
  const e = await prisma.event.findUnique({ where: { id } });
  if (!e) return;
  await prisma.event.update({
    where: { id },
    data: { status: e.status === "done" ? "pending" : "done" },
  });
  revalidatePath("/eventos");
  revalidatePath("/");
}

export default async function EventosPage() {
  await requireUser();
  const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
  const pending = events.filter((e) => e.status === "pending");
  const done = events.filter((e) => e.status === "done");

  return (
    <main className="space-y-5 animate-fadeIn">
      <div className="pt-2">
        <h1 className="font-display text-3xl font-medium text-ink-900">Eventos e prazos</h1>
        <p className="text-sm text-ink-600 mt-1">Marcos importantes da preparação</p>
      </div>

      <section className="bg-white border border-ink-100 rounded-2xl p-5">
        <h2 className="font-display text-lg font-medium text-ink-900 mb-3">Pendentes ({pending.length})</h2>
        <EventList events={pending} action={toggleEventDone} />
      </section>

      {done.length > 0 && (
        <section className="bg-white border border-ink-100 rounded-2xl p-5">
          <h2 className="font-display text-lg font-medium text-ink-900 mb-3">Concluídos ({done.length})</h2>
          <EventList events={done} action={toggleEventDone} />
        </section>
      )}
    </main>
  );
}

function EventList({ events, action }: { events: { id: string; title: string; date: Date; description: string | null; category: string; status: string; link: string | null }[]; action: (formData: FormData) => void }) {
  if (events.length === 0) return <p className="text-sm text-ink-400 py-2">— vazio —</p>;
  return (
    <div className="space-y-1.5">
      {events.map((e) => {
        const cat = EVENT_CATEGORIES[e.category as keyof typeof EVENT_CATEGORIES] ?? { label: e.category, color: "ink" };
        const c = parkClasses(cat.color);
        const isDone = e.status === "done";
        return (
          <div key={e.id} className={`flex items-start gap-3 px-3 py-2.5 rounded-lg ${isDone ? "opacity-50 bg-ink-50" : c.soft}`}>
            <form action={action} className="pt-0.5">
              <input type="hidden" name="id" value={e.id} />
              <button className="w-4 h-4 rounded border border-ink-600 flex items-center justify-center hover:border-ep-600 transition" aria-label="Alternar feito">
                {isDone && <span className="text-[10px]">✓</span>}
              </button>
            </form>
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm ${isDone ? "line-through" : ""}`}>{e.title}</p>
              <p className="text-xs opacity-80 mt-0.5">
                {fmtDayShort(e.date)} · {cat.label.toLowerCase()}
                {e.description && <> · {e.description}</>}
              </p>
              {e.link && !isDone && (
                <a href={e.link} target="_blank" className="text-xs underline opacity-80 hover:opacity-100">abrir link →</a>
              )}
            </div>
            {!isDone && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${c.strong}`}>{relativeDays(e.date)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
