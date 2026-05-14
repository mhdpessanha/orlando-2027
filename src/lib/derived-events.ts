import type { Accommodation, Flight } from "@prisma/client";

export type DerivedEvent = {
  id: string;
  title: string;
  date: Date;
  category: "payment" | "document" | "booking" | "shopping" | "deadline" | "milestone";
  description: string | null;
  link: string | null;
  derived: true;
};

function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + days);
  return r;
}

export function computeDerivedEvents(opts: {
  accommodations: Accommodation[];
  flights: Flight[];
}): DerivedEvent[] {
  const events: DerivedEvent[] = [];

  // Janela de ADR abre 60 dias antes do primeiro check-in Disney (DVC ou hotel oficial).
  // Uma vez aberta, vale pra toda a estadia — então só o primeiro check-in importa.
  const disneyStays = opts.accommodations
    .filter((a) => a.type === "dvc" || a.type === "hotel")
    .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime());

  if (disneyStays.length > 0) {
    const first = disneyStays[0];
    events.push({
      id: `adr-window-${first.id}`,
      title: "Janela de ADR abre",
      date: addDays(first.checkIn, -60),
      category: "booking",
      description: `60 dias antes do check-in em ${first.shortName}. Pode reservar restaurantes Disney pra qualquer dia da viagem.`,
      link: "https://disneyworld.disney.go.com/dining/",
      derived: true,
    });
  }

  // Modificação de reserva DVC: 30 dias antes do check-in trava sem penalidade.
  for (const a of opts.accommodations) {
    if (a.type !== "dvc") continue;
    events.push({
      id: `dvc-mod-${a.id}`,
      title: `Modificação DVC trava — ${a.shortName}`,
      date: addDays(a.checkIn, -30),
      category: "deadline",
      description: "Depois desse marco, modificações em reserva DVC viram holding points (perde flexibilidade).",
      link: null,
      derived: true,
    });
  }

  // Check-in online: 24h antes da partida de cada voo (só o primeiro trecho de cada direção).
  for (const f of opts.flights) {
    if (f.segment !== 1) continue;
    const directionLabel = f.direction === "outbound" ? "ida" : "volta";
    const airlineLower = f.airline.toLowerCase();
    const link = airlineLower.includes("delta")
      ? "https://www.delta.com/check-in/find"
      : airlineLower.includes("latam")
      ? "https://www.latamairlines.com/br/pt/checkin"
      : null;
    events.push({
      id: `checkin-${f.id}`,
      title: `Check-in online abre (${directionLabel})`,
      date: addDays(f.departure, -1),
      category: "deadline",
      description: `${f.airline} ${f.flightNumber} · ${f.fromAirport} → ${f.toAirport}`,
      link,
      derived: true,
    });
  }

  return events;
}
