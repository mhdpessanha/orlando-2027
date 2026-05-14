import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { parkClasses } from "@/components/ParkBadge";
import { PARKS, type ParkCode } from "@/lib/parks";
import { fmtDayMonth } from "@/lib/dates";
import { addInterest, deleteInterest } from "@/lib/interest-actions";

export const dynamic = "force-dynamic";

export default async function PersonProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const me = await requireUser();
  const { username } = await params;

  const [person, trip] = await Promise.all([
    prisma.user.findUnique({
      where: { username },
      include: {
        interests: {
          orderBy: [{ priority: "desc" }, { name: "asc" }],
          include: { createdBy: { select: { name: true, username: true } } },
        },
      },
    }),
    prisma.trip.findUnique({ where: { id: 1 } }),
  ]);

  if (!person) notFound();

  const c = parkClasses(person.color);
  const initial = person.name.trim().charAt(0).toUpperCase();
  const ageOnTrip = ageAt(person.birthday, trip?.startDate ?? null);
  const isChild = person.kind === "child";
  const isMe = me.id === person.id;

  const attractions = person.interests.filter((i) => i.kind === "attraction");
  const dining = person.interests.filter((i) => i.kind === "dining");

  // Lista de parques relevantes pra escolha de interesses (excluindo "off" e "travel")
  const parkOptions = (Object.keys(PARKS) as ParkCode[]).filter((k) => k !== "off" && k !== "travel");

  return (
    <main className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between text-sm pt-2">
        <Link href="/turma" className="text-ink-600 hover:text-ink-900">← Turma</Link>
      </div>

      <header className="flex items-center gap-4">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center font-display text-2xl font-medium ${c.strong}`}
          aria-hidden
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl font-medium text-ink-900">
            {person.name}
            {isMe && <span className="ml-2 text-xs text-ink-600 font-sans">(você)</span>}
          </h1>
          <p className="text-sm text-ink-600 mt-0.5">
            {isChild ? "criança" : "adulto"}
            {person.birthday ? ` · nasc. ${fmtDayMonth(person.birthday)}/${person.birthday.getUTCFullYear()}` : ""}
            {ageOnTrip !== null ? ` · ${ageOnTrip} anos na viagem` : ""}
          </p>
        </div>
      </header>

      {isChild && person.needsTravelAuth && (
        <p className="text-xs bg-mk-50 text-mk-900 px-3 py-2 rounded-lg inline-block">
          ⚠ Precisa de autorização de viagem
        </p>
      )}

      <InterestsSection
        title="Atrações que quero"
        emoji="🎢"
        kind="attraction"
        items={attractions}
        userId={person.id}
        parkOptions={parkOptions}
      />

      <InterestsSection
        title="Restaurantes que quero"
        emoji="🍴"
        kind="dining"
        items={dining}
        userId={person.id}
        parkOptions={parkOptions}
      />
    </main>
  );
}

type InterestItem = {
  id: string;
  kind: string;
  name: string;
  parkCode: string;
  priority: number;
  notes: string | null;
  createdBy: { name: string; username: string } | null;
};

function InterestsSection({
  title,
  emoji,
  kind,
  items,
  userId,
  parkOptions,
}: {
  title: string;
  emoji: string;
  kind: "attraction" | "dining";
  items: InterestItem[];
  userId: string;
  parkOptions: ParkCode[];
}) {
  return (
    <section className="bg-white border border-ink-100 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-ink-900">
          <span className="mr-2">{emoji}</span>
          {title}
        </h2>
        <span className="text-xs text-ink-600">{items.length} item{items.length === 1 ? "" : "s"}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-ink-400 py-2">Nada cadastrado ainda.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it) => {
            const parkName = PARKS[it.parkCode as ParkCode]?.name ?? it.parkCode;
            const parkIcon = PARKS[it.parkCode as ParkCode]?.icon ?? "📍";
            return (
              <li key={it.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-ink-50 transition">
                <span className="text-xs">{"⭐".repeat(it.priority)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink-900">{it.name}</p>
                  <p className="text-xs text-ink-600 mt-0.5">
                    <span className="mr-1">{parkIcon}</span>
                    {parkName}
                    {it.notes && <span className="ml-2">· {it.notes}</span>}
                    {it.createdBy && (
                      <span className="ml-2 text-ink-400">· por {it.createdBy.name}</span>
                    )}
                  </p>
                </div>
                <form action={async () => { "use server"; await deleteInterest(it.id); }}>
                  <button className="text-ink-400 hover:text-mk-600 text-xs" aria-label="Remover">✕</button>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      <form action={addInterest} className="pt-3 border-t border-ink-100 space-y-2">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="kind" value={kind} />
        <input
          name="name"
          placeholder={kind === "attraction" ? "Ex: Rise of the Resistance" : "Ex: Cinderella's Royal Table"}
          required
          className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <select name="parkCode" required className="flex-1 rounded-lg border border-ink-200 px-2 py-1.5 text-sm">
            <option value="">— parque —</option>
            {parkOptions.map((k) => (
              <option key={k} value={k}>{PARKS[k].icon} {PARKS[k].name}</option>
            ))}
          </select>
          <select name="priority" defaultValue="2" className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm">
            <option value="1">⭐ legal</option>
            <option value="2">⭐⭐ quero</option>
            <option value="3">⭐⭐⭐ não posso perder</option>
          </select>
        </div>
        <input
          name="notes"
          placeholder="Observação (opcional)"
          className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
        />
        <button type="submit" className="text-sm bg-ep-600 hover:bg-ep-800 text-white px-3 py-1.5 rounded-lg transition">
          adicionar
        </button>
      </form>
    </section>
  );
}

function ageAt(birthday: Date | null, target: Date | null): number | null {
  if (!birthday || !target) return null;
  let age = target.getUTCFullYear() - birthday.getUTCFullYear();
  const beforeBday =
    target.getUTCMonth() < birthday.getUTCMonth() ||
    (target.getUTCMonth() === birthday.getUTCMonth() && target.getUTCDate() < birthday.getUTCDate());
  if (beforeBday) age--;
  return age;
}
