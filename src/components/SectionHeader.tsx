import Link from "next/link";

export default function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div>
        <h2 className="font-display text-xl font-medium text-ink-900">{title}</h2>
        {subtitle && <p className="text-xs text-ink-600 mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className="text-sm text-ep-600 hover:text-ep-900 transition">
          {action.label} →
        </Link>
      )}
    </div>
  );
}
