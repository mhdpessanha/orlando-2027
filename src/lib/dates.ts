const WEEKDAYS_PT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTHS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTHS_FULL_PT = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export function fmtDayShort(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${WEEKDAYS_PT[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS_PT[date.getUTCMonth()]}`;
}

export function fmtDayMonth(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getUTCDate()} ${MONTHS_PT[date.getUTCMonth()]}`;
}

export function fmtDayLong(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${WEEKDAYS_PT[date.getUTCDay()]}, ${date.getUTCDate()} de ${MONTHS_FULL_PT[date.getUTCMonth()]}`;
}

export function fmtDateInput(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fmtFullDateTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const day = date.getUTCDate();
  const month = MONTHS_PT[date.getUTCMonth()];
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} · ${hour}h${min}`;
}

export function daysUntil(target: Date | string, from: Date = new Date()) {
  const t = typeof target === "string" ? new Date(target) : target;
  const a = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const b = Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
  return Math.round((b - a) / 86400000);
}

export function relativeDays(target: Date | string) {
  const n = daysUntil(target);
  if (n === 0) return "hoje";
  if (n === 1) return "amanhã";
  if (n === -1) return "ontem";
  if (n > 0) return `em ${n} dias`;
  return `há ${Math.abs(n)} dias`;
}

export function parseUTCDate(s: string) {
  // accepts "YYYY-MM-DD" and returns UTC Date at 00:00
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function eachDay(start: Date, end: Date) {
  const days: Date[] = [];
  const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  while (cur <= last) {
    days.push(new Date(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return days;
}
