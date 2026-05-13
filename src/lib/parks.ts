export type ParkCode =
  | "mk" | "ep" | "hs" | "ak"
  | "us" | "ioa" | "epic"
  | "sw" | "dc"
  | "peppa" | "ksc"
  | "ds" | "off" | "travel";

export const PARKS: Record<ParkCode, { name: string; short: string; color: string; icon: string }> = {
  mk:     { name: "Magic Kingdom",         short: "MK",    color: "mk",   icon: "🏰" },
  ep:     { name: "EPCOT",                 short: "EP",    color: "ep",   icon: "🌐" },
  hs:     { name: "Hollywood Studios",     short: "HS",    color: "hs",   icon: "🎬" },
  ak:     { name: "Animal Kingdom",        short: "AK",    color: "ak",   icon: "🌳" },
  us:     { name: "Universal Studios",     short: "US",    color: "us",   icon: "🎢" },
  ioa:    { name: "Islands of Adventure",  short: "IOA",   color: "us",   icon: "🎢" },
  epic:   { name: "Epic Universe",         short: "EPIC",  color: "epic", icon: "🌌" },
  sw:     { name: "SeaWorld",              short: "SW",    color: "tv",   icon: "🐬" },
  dc:     { name: "Discovery Cove",        short: "DC",    color: "ds",   icon: "🐠" },
  peppa:  { name: "Peppa Pig + Legoland",  short: "PPL",   color: "mk",   icon: "🐷" },
  ksc:    { name: "Kennedy Space Center",  short: "KSC",   color: "tv",   icon: "🚀" },
  ds:     { name: "Disney Springs",        short: "DS",    color: "ds",   icon: "🛍️" },
  off:    { name: "Dia livre",             short: "OFF",   color: "ink",  icon: "☀️" },
  travel: { name: "Viagem",                short: "Travel",color: "tv",   icon: "✈️" },
};

export function parkInfo(code?: string | null) {
  if (!code || !(code in PARKS)) return PARKS.off;
  return PARKS[code as ParkCode];
}

export const RESERVATION_TYPES = {
  adr:       { label: "Restaurante",   icon: "🍽️" },
  ticket:    { label: "Ingresso",      icon: "🎟️" },
  flight:    { label: "Voo",           icon: "✈️" },
  hotel:     { label: "Hospedagem",    icon: "🏨" },
  car:       { label: "Carro",         icon: "🚗" },
  activity:  { label: "Atividade",     icon: "🎯" },
  transport: { label: "Transporte",    icon: "🚐" },
  other:     { label: "Outro",         icon: "📌" },
} as const;

export type ReservationType = keyof typeof RESERVATION_TYPES;

export const EVENT_CATEGORIES = {
  payment:   { label: "Pagamento",   color: "mk" },
  document:  { label: "Documento",   color: "hs" },
  booking:   { label: "Reserva",     color: "ds" },
  shopping:  { label: "Compra",      color: "tv" },
  deadline:  { label: "Prazo",       color: "us" },
  milestone: { label: "Marco",       color: "ep" },
} as const;

export type EventCategory = keyof typeof EVENT_CATEGORIES;
