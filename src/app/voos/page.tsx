import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fmtFullDateTime } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function VoosPage() {
  await requireUser();
  const flights = await prisma.flight.findMany({ orderBy: [{ direction: "asc" }, { segment: "asc" }] });

  const outbound = flights.filter((f) => f.direction === "outbound");
  const ret = flights.filter((f) => f.direction === "return");

  return (
    <main className="space-y-6 animate-fadeIn">
      <div className="pt-2">
        <h1 className="font-display text-3xl font-medium text-ink-900">Voos</h1>
        <p className="text-sm text-ink-600 mt-1">ida e volta, com conexão em Atlanta</p>
      </div>

      <FlightSection title="✈️ Ida" subtitle="Rio → Atlanta → Orlando" flights={outbound} />
      <FlightSection title="🛬 Volta" subtitle="Orlando → Atlanta → Rio" flights={ret} />
    </main>
  );
}

function FlightSection({ title, subtitle, flights }: { title: string; subtitle: string; flights: { id: string; segment: number; airline: string; flightNumber: string; fromAirport: string; toAirport: string; departure: Date; arrival: Date; confirmation: string | null; seats: string | null; notes: string | null }[] }) {
  if (flights.length === 0) return null;

  return (
    <section>
      <div className="mb-3">
        <h2 className="font-display text-xl font-medium text-ink-900">{title}</h2>
        <p className="text-xs text-ink-600">{subtitle}</p>
      </div>
      <div className="bg-white border border-tv-200 rounded-2xl p-5 space-y-4">
        {flights.map((f, idx) => (
          <div key={f.id} className={idx > 0 ? "pt-4 border-t border-ink-100" : ""}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-tv-600 font-medium tracking-wider uppercase">Trecho {f.segment}</p>
                <p className="font-medium text-ink-900">{f.airline} {f.flightNumber}</p>
              </div>
              {f.confirmation && (
                <code className="text-xs bg-tv-50 px-2 py-1 rounded font-mono text-tv-900">{f.confirmation}</code>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <p className="font-display text-2xl text-ink-900">{f.fromAirport}</p>
                <p className="text-xs text-ink-600 mt-1">{fmtFullDateTime(f.departure)}</p>
              </div>
              <div className="text-center text-ink-400">
                <span className="text-xl">✈️</span>
                <p className="text-[10px] uppercase tracking-wider mt-1">voo direto</p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl text-ink-900">{f.toAirport}</p>
                <p className="text-xs text-ink-600 mt-1">{fmtFullDateTime(f.arrival)}</p>
              </div>
            </div>
            {(f.seats || f.notes) && (
              <div className="mt-3 text-xs text-ink-600 space-y-0.5">
                {f.seats && <p>💺 {f.seats}</p>}
                {f.notes && <p>{f.notes}</p>}
              </div>
            )}
          </div>
        ))}
        <p className="text-[10px] text-ink-400 pt-2 border-t border-ink-100 text-right">* horários em fuso local de cada aeroporto</p>
      </div>
    </section>
  );
}
