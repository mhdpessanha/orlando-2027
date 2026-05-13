"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "./prisma";
import { requireUser } from "./auth";

const DaySchema = z.object({
  parkCode: z.string().optional().or(z.literal("")),
  accommodationId: z.string().optional().or(z.literal("")),
  earlyEntry: z.string().optional(),
  extendedEvening: z.string().optional(),
  parkOpen: z.string().optional(),
  parkClose: z.string().optional(),
  notes: z.string().optional(),
});

export async function updateDay(id: string, formData: FormData): Promise<void> {
  await requireUser();
  const raw = Object.fromEntries(formData.entries());
  const parsed = DaySchema.safeParse(raw);
  if (!parsed.success) {
    console.error("updateDay validation failed:", parsed.error.errors);
    return;
  }

  const d = parsed.data;
  await prisma.day.update({
    where: { id },
    data: {
      parkCode: d.parkCode || null,
      accommodationId: d.accommodationId || null,
      earlyEntry: !!d.earlyEntry,
      extendedEvening: !!d.extendedEvening,
      parkOpen: d.parkOpen || null,
      parkClose: d.parkClose || null,
      notes: d.notes || null,
    },
  });

  const day = await prisma.day.findUnique({ where: { id } });
  if (day) {
    const iso = day.date.toISOString().slice(0, 10);
    revalidatePath(`/roteiro/${iso}`);
  }
  revalidatePath("/roteiro");
  revalidatePath("/");
}

const TipSchema = z.object({
  dayId: z.string().min(1),
  category: z.string().min(1),
  title: z.string().min(1),
  notes: z.string().optional(),
  priority: z.coerce.number().int().min(0).max(3).optional(),
});

export async function createTip(formData: FormData): Promise<void> {
  await requireUser();
  const raw = Object.fromEntries(formData.entries());
  const parsed = TipSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("createTip validation failed:", parsed.error.errors);
    return;
  }

  const t = parsed.data;
  await prisma.tip.create({
    data: {
      dayId: t.dayId,
      category: t.category,
      title: t.title,
      notes: t.notes || null,
      priority: t.priority ?? 0,
    },
  });

  const day = await prisma.day.findUnique({ where: { id: t.dayId } });
  if (day) {
    const iso = day.date.toISOString().slice(0, 10);
    revalidatePath(`/roteiro/${iso}`);
  }
}

export async function toggleTipDone(tipId: string) {
  await requireUser();
  const tip = await prisma.tip.findUnique({ where: { id: tipId } });
  if (!tip) return;
  await prisma.tip.update({ where: { id: tipId }, data: { done: !tip.done } });
  const day = await prisma.day.findUnique({ where: { id: tip.dayId } });
  if (day) {
    const iso = day.date.toISOString().slice(0, 10);
    revalidatePath(`/roteiro/${iso}`);
  }
}

export async function deleteTip(tipId: string) {
  await requireUser();
  const tip = await prisma.tip.findUnique({ where: { id: tipId } });
  if (!tip) return;
  await prisma.tip.delete({ where: { id: tipId } });
  const day = await prisma.day.findUnique({ where: { id: tip.dayId } });
  if (day) {
    const iso = day.date.toISOString().slice(0, 10);
    revalidatePath(`/roteiro/${iso}`);
  }
}
