import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fmtDayLong, daysUntil } from "@/lib/dates";

export const dynamic = "force-dynamic";

const TYPE_INFO: Record<string, { icon: string; label: string; color: string }> = {
  dvc:    { icon: "✨", label: "DVC",     color: "ep" },
  hotel:  { icon: "🏨", label: "Hotel",   color: "tv" },
  rental: { icon: "🏠", label: "Aluguel", color: "ak" },
};

export default async function HospedagensPage() {
  await requireUser();
  const accs = await prisma.accommodation.findMany({ orderBy: { checkIn: "asc" } });

  return (
    <main className="space-y-4 animate-fadeIn">
      <div className="pt-2">
        <h1 className="font-display text-3xl font-medium text-ink-900">Hospedagens</h1>
        <p className="text-sm text-ink-600 mt-1">{accs.length} hospedagens durante a viagem</p>
      </div>

      <div className="space-y-3">
        {accs.map((a) => {
          const t = TYPE_INFO[a.type] ?? TYPE_INFO.hotel;
          const nights = Math.round((a.checkOut.getTime() - a.checkIn.getTime()) / 86_400_000);
          return (
            <article key={a.id} className="bg-white border border-ink-100 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{t.icon}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-${t.color}-100 text-${t.color}-900`}>{t.label}</span>
                  </div>
                  <h2 className="font-display text-xl font-medium text-ink-900">{a.name}</h2>
                </div>
                {a.confirmation && (
                  <code className="text-xs bg-ink-50 px-2 py-1 rounded font-mono text-ink-800 border border-ink-100">{a.confirmation}</code>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-ink-50 rounded-lg p-3">
                  <p className="text-xs text-ink-600 uppercase tracking-wider">Check-in</p>
                  <p className="font-medium text-ink-900 mt-0.5">{fmtDayLong(a.checkIn)}</p>
                </div>
                <div className="bg-ink-50 rounded-lg p-3">
                  <p className="text-xs text-ink-600 uppercase tracking-wider">Check-out</p>
                  <p className="font-medium text-ink-900 mt-0.5">{fmtDayLong(a.checkOut)}</p>
                </div>
              </div>

              <p className="text-xs text-ink-600 mt-3">
                {nights} noite{nights > 1 ? "s" : ""}
                {a.address && <> · 📍 {a.address}</>}
              </p>

              {a.notes && <p className="text-sm text-ink-800 mt-3 whitespace-pre-wrap">{a.notes}</p>}
            </article>
          );
        })}
      </div>
    </main>
  );
}
