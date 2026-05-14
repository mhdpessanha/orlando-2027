"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "./prisma";
import { requireUser } from "./auth";

const InterestSchema = z.object({
  userId: z.string().min(1),
  kind: z.enum(["attraction", "dining"]),
  name: z.string().min(1, "Nome obrigatório"),
  parkCode: z.string().min(1, "Parque obrigatório"),
  priority: z.coerce.number().int().min(1).max(3).default(2),
  notes: z.string().optional(),
});

function formatZodError(err: z.ZodError): string {
  return err.issues.map((i) => `${i.path.join(".") || "campo"}: ${i.message}`).join("; ");
}

export async function addInterest(formData: FormData): Promise<void> {
  const author = await requireUser();
  const raw = Object.fromEntries(formData.entries());
  const parsed = InterestSchema.safeParse(raw);
  if (!parsed.success) throw new Error(`Dados inválidos — ${formatZodError(parsed.error)}`);

  const d = parsed.data;
  await prisma.interest.create({
    data: {
      userId: d.userId,
      kind: d.kind,
      name: d.name.trim(),
      parkCode: d.parkCode,
      priority: d.priority,
      notes: d.notes?.trim() || null,
      createdById: author.id,
    },
  });

  const owner = await prisma.user.findUnique({ where: { id: d.userId }, select: { username: true } });
  if (owner) revalidatePath(`/turma/${owner.username}`);
  revalidatePath("/turma");
  revalidatePath("/roteiro");
}

export async function deleteInterest(id: string): Promise<void> {
  await requireUser();
  const interest = await prisma.interest.findUnique({
    where: { id },
    include: { user: { select: { username: true } } },
  });
  if (!interest) return;
  await prisma.interest.delete({ where: { id } });
  revalidatePath(`/turma/${interest.user.username}`);
  revalidatePath("/turma");
  revalidatePath("/roteiro");
}
