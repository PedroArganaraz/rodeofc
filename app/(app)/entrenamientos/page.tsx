import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { EntrenamientosGrid } from "./entrenamientos-grid";
import { esForma, type ElementoCancha, type Marcador } from "@/components/cancha/cancha-tactica";

export default async function EntrenamientosPage() {
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

  const { data: entrenamientos } = equipoId
    ? await supabase
        .from("entrenamientos")
        .select('id, titulo, "entrenamientos-ejercicios"(count)')
        .eq("equipo_id", equipoId)
        .order("created_at", { ascending: false })
    : { data: null };

  const entrenamientoIds = (entrenamientos ?? []).map((e) => e.id);

  const { data: entrenamientosEjercicios } = entrenamientoIds.length
    ? await supabase
        .from("entrenamientos-ejercicios")
        .select("entrenamiento_id, ejercicio_id, orden")
        .in("entrenamiento_id", entrenamientoIds)
        .order("orden")
    : { data: null };

  const ejerciciosPorEntrenamiento = new Map<string, string[]>();
  for (const fila of entrenamientosEjercicios ?? []) {
    const lista = ejerciciosPorEntrenamiento.get(fila.entrenamiento_id) ?? [];
    lista.push(fila.ejercicio_id);
    ejerciciosPorEntrenamiento.set(fila.entrenamiento_id, lista);
  }

  const ejercicioIds = [
    ...new Set((entrenamientosEjercicios ?? []).map((fila) => fila.ejercicio_id)),
  ];

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
      <div className="flex justify-end p-6 pb-0">
        <Link
          href="/entrenamientos/nuevo"
          className="flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark"
        >
          <Plus className="h-4 w-4" />
          Nuevo entrenamiento
        </Link>
      </div>

      {!entrenamientos || entrenamientos.length === 0 ? (
        <p className="p-6 text-center text-sm text-neutral-500">
          Todavía no hay entrenamientos cargados.
        </p>
      ) : (
        <EntrenamientosGrid
          entrenamientos={entrenamientos.map((entrenamiento) => ({
            id: entrenamiento.id,
            titulo: entrenamiento.titulo,
            cantidadEjercicios:
              entrenamiento["entrenamientos-ejercicios"]?.[0]?.count ?? 0,
            miniaturas: (ejerciciosPorEntrenamiento.get(entrenamiento.id) ?? []).map(
              (ejercicioId) =>
                (
                  (posicionesPorEjercicio.get(ejercicioId) ??
                    []) as unknown as ElementoCancha[]
                ).filter((elemento) => !esForma(elemento)) as Marcador[],
            ),
          }))}
        />
      )}
    </div>
  );
}
