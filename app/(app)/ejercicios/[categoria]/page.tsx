import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: miembros } = await supabase
    .from("miembros-equipo")
    .select("equipo_id")
    .eq("user_id", user!.id)
    .limit(1);

  const equipoId = miembros?.[0]?.equipo_id;

  const { data: ejercicios } = equipoId
    ? await supabase
        .from("ejercicios")
        .select('id, titulo, "pasos-ejercicio"(count)')
        .eq("equipo_id", equipoId)
        .eq("categoria", encontrada.slug)
        .order("created_at", { ascending: false })
    : { data: null };

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

      {!ejercicios || ejercicios.length === 0 ? (
        <p className="p-6 text-center text-sm text-neutral-500">
          Todavía no hay ejercicios de {encontrada.label.toLowerCase()}.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-5">
          {ejercicios.map((ejercicio) => {
            const cantidadPasos = ejercicio["pasos-ejercicio"]?.[0]?.count ?? 0;

            return (
              <Link
                key={ejercicio.id}
                href={`/ejercicios/${encontrada.slug}/${ejercicio.id}`}
                className="rounded-xl border border-stone-300 bg-white p-4 shadow-sm transition-colors hover:border-blue-500"
              >
                <p className="font-medium text-neutral-900">
                  {ejercicio.titulo}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {cantidadPasos} {cantidadPasos === 1 ? "paso" : "pasos"}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
