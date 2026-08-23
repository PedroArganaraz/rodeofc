import { createClient } from "@/utils/supabase/server";
import { ordenarPorPosicion } from "@/lib/orden-jugadoras";
import { FormacionView } from "./formacion-view";
import { asegurarFormacionInicial } from "./actions";
import type { Marcador } from "@/components/cancha/cancha-tactica";
import type { Tables } from "@/types/database.types";

export default async function FormacionPage() {
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

  if (!equipoId) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-neutral-500">
        No estás asignado a ningún equipo todavía.
      </div>
    );
  }

  const [formacionId, { data: jugadoras }] = await Promise.all([
    asegurarFormacionInicial(equipoId),
    supabase.from("jugadoras").select("*").eq("equipo_id", equipoId),
  ]);

  let marcadores: Marcador[] = [];
  let suplentes: Tables<"jugadoras">[] = ordenarPorPosicion(jugadoras ?? []);

  if (formacionId) {
    const { data: filas } = await supabase
      .from("formaciones-jugadoras")
      .select("*")
      .eq("formacion_id", formacionId);

    const jugadorasById = new Map((jugadoras ?? []).map((j) => [j.id, j]));
    const ocupadas = new Set((filas ?? []).map((fila) => fila.jugadora_id));

    marcadores = (filas ?? [])
      .filter(
        (fila) =>
          fila.titular && fila.posicion_x !== null && fila.posicion_y !== null,
      )
      .map((fila) => {
        const jugadora = jugadorasById.get(fila.jugadora_id);
        return {
          id: fila.jugadora_id,
          x: fila.posicion_x as number,
          y: fila.posicion_y as number,
          numero: jugadora?.dorsal?.toString() ?? "-",
          color: "propio" as const,
          etiqueta: jugadora?.apellido,
        };
      });

    suplentes = ordenarPorPosicion(
      (jugadoras ?? []).filter((j) => !ocupadas.has(j.id)),
    );
  }

  return (
    <FormacionView
      formacionId={formacionId}
      marcadoresIniciales={marcadores}
      suplentes={suplentes}
    />
  );
}
