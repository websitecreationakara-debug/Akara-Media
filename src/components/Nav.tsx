"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/quotes", label: "Quotes", icon: "📝" },
  { href: "/invoices", label: "Invoices", icon: "🧾" },
  { href: "/clients", label: "Clients", icon: "👥" },
  { href: "/services", label: "Services & Prices", icon: "🏷️" },
  { href: "/reports", label: "Reports", icon: "📈" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
] as const;

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {links.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span aria-hidden>{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
