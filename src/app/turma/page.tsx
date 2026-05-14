import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { parkClasses } from "@/components/ParkBadge";
import { fmtDayMonth } from "@/lib/dates";

export const dynamic = "force-dynamic";

type Person = {
  id: string;
  username: string;
  name: string;
  color: string;
  kind: string;
  birthday: Date | null;
  needsTravelAuth: boolean;
  _count: { interests: number };
};

export default async function TurmaPage() {
  const me = await requireUser();
  const [people, trip] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ kind: "asc" }, { name: "asc" }],
      select: {
        id: true,
        username: true,
        name: true,
        color: true,
        kind: true,
        birthday: true,
        needsTravelAuth: true,
        _count: { select: { interests: true } },
      },
    }),
    prisma.trip.findUnique({ where: { id: 1 } }),
  ]);

  const adults = people.filter((p) => p.kind === "adult");
  const children = people.filter((p) => p.kind === "child");

  return (
    <main className="space-y-6 animate-fadeIn">
      <div className="flex items-end justify-between gap-3 pt-2 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink-900">Turma</h1>
          <p className="text-sm text-ink-600 mt-1">
            {people.length} viajantes · {adults.length} adultos + {children.length} crianças
          </p>
        </div>
        <Link href={`/turma/${me.username}`} className="text-sm text-ep-600 hover:text-ep-900">
          minhas escolhas →
        </Link>
      </div>

      <Section title="Adultos" subtitle={`${adults.length} pessoas`}>
        <div className="grid sm:grid-cols-2 gap-3">
          {adults.map((p) => (
            <PersonCard key={p.id} person={p} tripStart={trip?.startDate ?? null} />
          ))}
        </div>
      </Section>

      <Section
        title="Crianças"
        subtitle={`${children.length} pessoas · ${children.filter((c) => c.needsTravelAuth).length} com autorização pendente`}
      >
        <div className="grid sm:grid-cols-2 gap-3">
          {children.map((p) => (
            <PersonCard key={p.id} person={p} tripStart={trip?.startDate ?? null} />
          ))}
        </div>
      </Section>
    </main>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-lg text-ink-900">{title}</h2>
        <span className="text-xs text-ink-600">{subtitle}</span>
      </div>
      {children}
    </section>
  );
}

function PersonCard({ person, tripStart }: { person: Person; tripStart: Date | null }) {
  const c = parkClasses(person.color);
  const initial = person.name.trim().charAt(0).toUpperCase();
  const ageOnTrip = ageAt(person.birthday, tripStart);
  const isChild = person.kind === "child";
  const interestsCount = person._count.interests;

  return (
    <Link
      href={`/turma/${person.username}`}
      className="bg-white border border-ink-100 rounded-2xl p-4 flex items-start gap-3 hover:border-ep-200 hover:bg-ep-50/30 transition"
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-display text-xl font-medium ${c.strong}`}
        aria-hidden
      >
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-900">{person.name}</p>
        <p className="text-xs text-ink-600 mt-0.5">
          {isChild ? "criança" : "adulto"}
          {person.birthday ? ` · ${fmtDayMonth(person.birthday)}/${person.birthday.getUTCFullYear()}` : ""}
          {ageOnTrip !== null ? ` · ${ageOnTrip} anos na viagem` : ""}
        </p>
        <p className="text-xs text-ink-600 mt-1">
          {interestsCount === 0 ? "sem interesses cadastrados" : `${interestsCount} interesse${interestsCount === 1 ? "" : "s"}`}
        </p>
        {isChild && person.needsTravelAuth && (
          <p className="text-[11px] uppercase tracking-wider bg-mk-50 text-mk-900 px-2 py-1 rounded mt-2 inline-block">
            ⚠ precisa autorização de viagem
          </p>
        )}
      </div>
    </Link>
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
