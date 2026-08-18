"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/equipo/calendario", label: "Calendario" },
  { href: "/equipo/formacion", label: "Formación" },
  { href: "/equipo/jugadoras", label: "Jugadoras" },
];

export function EquipoTabs() {
  const pathname = usePathname();

  return (
    <nav className="grid w-full grid-cols-3 gap-2 p-4 sm:gap-4 sm:p-6">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-xl border px-2 py-2 text-center text-sm font-semibold shadow-sm transition-colors sm:px-6 sm:py-3 sm:text-lg ${
              active
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-stone-300 bg-stone-100 text-neutral-900 hover:border-blue-500 hover:bg-blue-500 hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
