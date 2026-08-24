import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { Placeholder } from "@/components/placeholder";
import { CATEGORIAS, type CategoriaEjercicio } from "../categorias";

export default async function EjerciciosCategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;

  const encontrada = CATEGORIAS.find(
    (c) => c.slug === (categoria as CategoriaEjercicio),
  );

  if (!encontrada) notFound();

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex justify-end p-6 pb-0">
        <Link
          href={`/ejercicios/nuevo/${encontrada.slug}`}
          className="flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark"
        >
          <Plus className="h-4 w-4" />
          Nuevo ejercicio
        </Link>
      </div>
      <Placeholder title={encontrada.label} />
    </div>
  );
}
