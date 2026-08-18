import Link from "next/link";
import { CalendarDays, Dumbbell, Shield, Users } from "lucide-react";

const sections = [
  { href: "/equipo", label: "Equipo", icon: Users },
  { href: "/ejercicios", label: "Ejercicios", icon: Dumbbell },
  { href: "/entrenamientos", label: "Entrenamientos", icon: CalendarDays },
  { href: "/rivales", label: "Rivales", icon: Shield },
];

export default function Home() {
  return (
    <div className="mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 content-center gap-4 p-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-6">
      {sections.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="group flex flex-row items-center gap-4 rounded-xl border border-stone-300 bg-stone-100 p-6 text-lg font-semibold text-neutral-900 shadow-sm transition-colors hover:border-blue-500 hover:bg-blue-500 hover:text-white sm:justify-center sm:gap-6 sm:p-8 sm:text-xl"
        >
          <Icon className="h-8 w-8 shrink-0 text-brand-navy transition-colors group-hover:text-white sm:h-10 sm:w-10" />
          {label}
        </Link>
      ))}
    </div>
  );
}
