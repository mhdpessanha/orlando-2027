import { parkInfo } from "@/lib/parks";

const CLASSES: Record<string, { bg: string; text: string; border: string; strong: string; soft: string }> = {
  mk: { bg: "bg-mk-50",  text: "text-mk-900",  border: "border-mk-200",  strong: "bg-mk-200 text-mk-900",  soft: "bg-mk-50 text-mk-900" },
  ep: { bg: "bg-ep-50",  text: "text-ep-900",  border: "border-ep-200",  strong: "bg-ep-200 text-ep-900",  soft: "bg-ep-50 text-ep-900" },
  hs: { bg: "bg-hs-50",  text: "text-hs-900",  border: "border-hs-200",  strong: "bg-hs-200 text-hs-900",  soft: "bg-hs-50 text-hs-900" },
  ak: { bg: "bg-ak-50",  text: "text-ak-900",  border: "border-ak-200",  strong: "bg-ak-200 text-ak-900",  soft: "bg-ak-50 text-ak-900" },
  us: { bg: "bg-us-50",  text: "text-us-900",  border: "border-us-200",  strong: "bg-us-200 text-us-900",  soft: "bg-us-50 text-us-900" },
  ds: { bg: "bg-ds-50",  text: "text-ds-900",  border: "border-ds-200",  strong: "bg-ds-200 text-ds-900",  soft: "bg-ds-50 text-ds-900" },
  tv: { bg: "bg-tv-50",  text: "text-tv-900",  border: "border-tv-200",  strong: "bg-tv-200 text-tv-900",  soft: "bg-tv-50 text-tv-900" },
  ink:{ bg: "bg-ink-50", text: "text-ink-900", border: "border-ink-200", strong: "bg-ink-200 text-ink-900", soft: "bg-ink-50 text-ink-900" },
  epic:{ bg: "bg-epic-50", text: "text-epic-900", border: "border-epic-200", strong: "bg-epic-200 text-epic-900", soft: "bg-epic-50 text-epic-900" },
};

export function parkClasses(color: string) {
  return CLASSES[color] ?? CLASSES.ink;
}

export default function ParkBadge({ code, size = "md" }: { code?: string | null; size?: "sm" | "md" | "lg" }) {
  const p = parkInfo(code);
  const c = parkClasses(p.color);
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${c.strong} ${sizes[size]}`}>
      <span>{p.icon}</span>
      <span>{p.name}</span>
    </span>
  );
}
