import Link from "next/link";
import { CATEGORIAS } from "./categorias";

export default function EjerciciosPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-wrap content-center justify-center gap-4 p-6 lg:gap-6">
      {CATEGORIAS.map(({ slug, label, icon: Icon }) => (
        <Link
          key={slug}
          href={`/ejercicios/${slug}`}
          className="group flex w-full flex-row items-center gap-4 rounded-xl border border-stone-300 bg-stone-100 p-6 text-lg font-semibold text-neutral-900 shadow-sm transition-colors hover:border-blue-500 hover:bg-blue-500 hover:text-white sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-1rem)] lg:flex-col lg:justify-center lg:gap-4 lg:p-8 lg:text-xl"
        >
          <Icon className="h-8 w-8 shrink-0 text-brand-navy transition-colors group-hover:text-white lg:h-10 lg:w-10" />
          {label}
        </Link>
      ))}
    </div>
  );
}
