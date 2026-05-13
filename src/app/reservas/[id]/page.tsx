import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { RESERVATION_TYPES } from "@/lib/parks";
import { updateReservation, deleteReservation } from "@/lib/reservation-actions";
import { fmtDateInput } from "@/lib/dates";
import ReservationForm from "@/components/ReservationForm";

export const dynamic = "force-dynamic";

export default async function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r) notFound();

  const days = await prisma.day.findMany({ orderBy: { date: "asc" }, select: { id: true, date: true, parkCode: true } });
  const t = RESERVATION_TYPES[r.type as keyof typeof RESERVATION_TYPES] ?? { icon: "📌", label: r.type };

  return (
    <main className="space-y-4 animate-fadeIn">
      <Link href="/reservas" className="text-sm text-ink-600 hover:text-ink-900">← reservas</Link>

      <div className="flex items-center gap-3">
        <span className="text-3xl">{t.icon}</span>
        <div>
          <p className="text-xs text-ink-600">{t.label}</p>
          <h1 className="font-display text-2xl md:text-3xl font-medium text-ink-900">{r.name}</h1>
        </div>
      </div>

      {r.confirmation && (
        <div className="bg-ep-50 border border-ep-200 rounded-xl px-4 py-3">
          <p className="text-xs text-ep-600 uppercase tracking-wider">Código de confirmação</p>
          <p className="font-mono text-2xl text-ep-900 mt-1 select-all">{r.confirmation}</p>
        </div>
      )}

      <div className="bg-white border border-ink-100 rounded-2xl p-5">
        <h2 className="font-display text-lg font-medium text-ink-900 mb-3">Editar</h2>
        <ReservationForm
          action={updateReservation.bind(null, r.id)}
          days={days}
          defaults={{
            type: r.type,
            name: r.name,
            date: fmtDateInput(r.date),
            time: r.time ?? "",
            partySize: r.partySize ?? undefined,
            location: r.location ?? "",
            confirmation: r.confirmation ?? "",
            cost: r.cost ?? undefined,
            notes: r.notes ?? "",
            link: r.link ?? "",
            dayId: r.dayId ?? "",
          }}
          submitLabel="salvar alterações"
        />
      </div>

      <form action={deleteReservation.bind(null, r.id)} className="bg-white border border-mk-100 rounded-2xl p-5">
        <p className="text-sm text-ink-800 mb-2">Deletar essa reserva?</p>
        <button className="text-sm text-mk-800 bg-mk-50 hover:bg-mk-100 px-4 py-2 rounded-lg transition">apagar</button>
      </form>
    </main>
  );
}
