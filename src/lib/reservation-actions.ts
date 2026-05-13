"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "./prisma";
import { requireUser } from "./auth";
import { parseUTCDate } from "./dates";

const ReservationSchema = z.object({
  type: z.string().min(1),
  name: z.string().min(1, "Nome obrigatório"),
  date: z.string().min(1),
  time: z.string().optional().or(z.literal("")),
  partySize: z.coerce.number().int().min(1).optional().or(z.literal(NaN)),
  location: z.string().optional(),
  confirmation: z.string().optional(),
  cost: z.coerce.number().optional().or(z.literal(NaN)),
  notes: z.string().optional(),
  link: z.string().optional(),
  dayId: z.string().optional(),
});

export async function createReservation(formData: FormData): Promise<void> {
  const user = await requireUser();

  const raw = Object.fromEntries(formData.entries());
  const parsed = ReservationSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("createReservation validation failed:", parsed.error.errors);
    return;
  }

  const d = parsed.data;
  const date = parseUTCDate(d.date);

  let dayId = d.dayId || undefined;
  if (!dayId) {
    const existingDay = await prisma.day.findUnique({ where: { date } });
    if (existingDay) dayId = existingDay.id;
  }

  await prisma.reservation.create({
    data: {
      type: d.type,
      name: d.name,
      date,
      time: d.time || null,
      partySize: Number.isFinite(d.partySize) ? d.partySize : null,
      location: d.location || null,
      confirmation: d.confirmation || null,
      cost: Number.isFinite(d.cost) ? d.cost : null,
      notes: d.notes || null,
      link: d.link || null,
      dayId,
      createdBy: user.name,
    },
  });

  revalidatePath("/reservas");
  revalidatePath("/roteiro");
  revalidatePath("/");
  redirect("/reservas");
}

export async function updateReservation(id: string, formData: FormData): Promise<void> {
  await requireUser();

  const raw = Object.fromEntries(formData.entries());
  const parsed = ReservationSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("updateReservation validation failed:", parsed.error.errors);
    return;
  }

  const d = parsed.data;
  const date = parseUTCDate(d.date);

  let dayId = d.dayId || null;
  if (!dayId) {
    const existingDay = await prisma.day.findUnique({ where: { date } });
    dayId = existingDay?.id || null;
  }

  await prisma.reservation.update({
    where: { id },
    data: {
      type: d.type,
      name: d.name,
      date,
      time: d.time || null,
      partySize: Number.isFinite(d.partySize) ? d.partySize : null,
      location: d.location || null,
      confirmation: d.confirmation || null,
      cost: Number.isFinite(d.cost) ? d.cost : null,
      notes: d.notes || null,
      link: d.link || null,
      dayId,
    },
  });

  revalidatePath("/reservas");
  revalidatePath(`/reservas/${id}`);
  revalidatePath("/roteiro");
  redirect("/reservas");
}

export async function deleteReservation(id: string) {
  await requireUser();
  await prisma.reservation.delete({ where: { id } });
  revalidatePath("/reservas");
  revalidatePath("/roteiro");
  revalidatePath("/");
  redirect("/reservas");
}
