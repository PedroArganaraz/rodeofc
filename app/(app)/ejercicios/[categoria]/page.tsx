import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { CATEGORIAS, type CategoriaEjercicio } from "../categorias";
import { EjerciciosGrid } from "./ejercicios-grid";
import { esForma, type ElementoCancha, type Marcador } from "@/components/cancha/elementos";

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

  const ejercicioIds = (ejercicios ?? []).map((ejercicio) => ejercicio.id);

  const { data: primerosPasos } = ejercicioIds.length
    ? await supabase
        .from("pasos-ejercicio")
        .select("ejercicio_id, posiciones")
        .in("ejercicio_id", ejercicioIds)
        .eq("orden", 1)
    : { data: null };

  const posicionesPorEjercicio = new Map(
    (primerosPasos ?? []).map((paso) => [paso.ejercicio_id, paso.posiciones]),
  );

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex items-center justify-between p-6 pb-0">
        <Link
          href="/ejercicios"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a ejercicios
        </Link>
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
        <EjerciciosGrid
          categoriaSlug={encontrada.slug}
          ejercicios={ejercicios.map((ejercicio) => ({
            id: ejercicio.id,
            titulo: ejercicio.titulo,
            cantidadPasos: ejercicio["pasos-ejercicio"]?.[0]?.count ?? 0,
            marcadores: (
              (posicionesPorEjercicio.get(ejercicio.id) ??
                []) as unknown as ElementoCancha[]
            ).filter((elemento) => !esForma(elemento)) as Marcador[],
          }))}
        />
      )}
    </div>
  );
}
