import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { createReservation } from "@/lib/reservation-actions";
import ReservationForm from "@/components/ReservationForm";

export const dynamic = "force-dynamic";

export default async function NovaReservaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; dayId?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const days = await prisma.day.findMany({ orderBy: { date: "asc" }, select: { id: true, date: true, parkCode: true } });

  return (
    <main className="space-y-4 animate-fadeIn">
      <Link href="/reservas" className="text-sm text-ink-600 hover:text-ink-900">← reservas</Link>
      <h1 className="font-display text-3xl font-medium text-ink-900">Nova reserva</h1>

      <div className="bg-white border border-ink-100 rounded-2xl p-5">
        <ReservationForm
          action={createReservation}
          days={days}
          defaults={{ date: sp.date, dayId: sp.dayId }}
          submitLabel="criar reserva"
        />
      </div>
    </main>
  );
}
