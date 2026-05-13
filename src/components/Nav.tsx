"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Início", icon: "✨" },
  { href: "/roteiro", label: "Roteiro", icon: "🗺️" },
  { href: "/reservas", label: "Reservas", icon: "🎟️" },
  { href: "/voos", label: "Voos", icon: "✈️" },
  { href: "/hospedagens", label: "Hospedagens", icon: "🏨" },
  { href: "/eventos", label: "Eventos", icon: "🔔" },
];

export default function Nav({ userName }: { userName: string }) {
  const path = usePathname();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-ink-100">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="font-display text-xl font-medium text-ep-900">
            Orlando <span className="text-mk-600">2027</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-sm text-ink-600">olá, {userName.split(" ")[0]}</span>
            <form action="/api/auth/logout" method="POST">
              <button className="text-xs text-ink-400 hover:text-ink-800 transition">sair</button>
            </form>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto -mb-px scrollbar-none">
          {links.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap border-b-2 transition ${
                  active
                    ? "border-ep-600 text-ep-900 font-medium"
                    : "border-transparent text-ink-600 hover:text-ink-900"
                }`}
              >
                <span className="text-base">{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
