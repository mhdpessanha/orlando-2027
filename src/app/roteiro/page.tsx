import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { parkInfo } from "@/lib/parks";
import { parkClasses } from "@/components/ParkBadge";
import { fmtDayShort, fmtDayMonth } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function RoteiroPage() {
  await requireUser();
  const days = await prisma.day.findMany({
    orderBy: { date: "asc" },
    include: {
      accommodation: true,
      reservations: { orderBy: { time: "asc" } },
      tips: true,
    },
  });

  return (
    <main className="space-y-4 animate-fadeIn">
      <div className="pt-2">
        <h1 className="font-display text-3xl font-medium text-ink-900">Roteiro</h1>
        <p className="text-sm text-ink-600 mt-1">12 dias em Orlando · clique num dia pra ver detalhes</p>
      </div>

      <div className="space-y-2">
        {days.map((d) => {
          const p = parkInfo(d.parkCode);
          const cls = parkClasses(p.color);
          const adrs = d.reservations.filter((r) => r.type === "adr").length;
          const iso = d.date.toISOString().slice(0, 10);
          return (
            <Link
              key={d.id}
              href={`/roteiro/${iso}`}
              className={`block ${cls.soft} border ${cls.border} rounded-xl px-4 py-3 hover:opacity-90 transition`}
            >
              <div className="flex items-center gap-3">
                <div className="text-xs font-medium w-14 leading-tight">
                  {fmtDayShort(d.date).split(" ")[0]}<br />
                  <span className="text-[11px]">{fmtDayMonth(d.date)}</span>
                </div>
                <div className="text-2xl">{p.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-base truncate">{p.name}</p>
                  <p className="text-xs opacity-80 truncate">
                    {d.accommodation && <>🏨 {d.accommodation.shortName}</>}
                    {d.earlyEntry && <span className="ml-2">· Early Entry</span>}
                    {d.extendedEvening && <span className="ml-2">· Extended Evening</span>}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs">
                  {adrs > 0 && <span className={`${cls.strong} px-2 py-0.5 rounded-full`}>{adrs} ADR{adrs > 1 ? "s" : ""}</span>}
                  {d.tips.length > 0 && <span className="opacity-60">{d.tips.length} dicas</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
