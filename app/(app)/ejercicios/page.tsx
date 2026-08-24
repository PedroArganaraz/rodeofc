import Link from "next/link";
import { CATEGORIAS } from "./categorias";

export default function EjerciciosPage() {
  return (
    <div className="mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 content-center gap-4 p-6 lg:grid-cols-4 lg:gap-6">
      {CATEGORIAS.map(({ slug, label, icon: Icon }) => (
        <Link
          key={slug}
          href={`/ejercicios/${slug}`}
          className="group flex flex-row items-center gap-4 rounded-xl border border-stone-300 bg-stone-100 p-6 text-lg font-semibold text-neutral-900 shadow-sm transition-colors hover:border-blue-500 hover:bg-blue-500 hover:text-white lg:flex-col lg:justify-center lg:gap-4 lg:p-8 lg:text-xl"
        >
          <Icon className="h-8 w-8 shrink-0 text-brand-navy transition-colors group-hover:text-white lg:h-10 lg:w-10" />
          {label}
        </Link>
      ))}
    </div>
  );
}
