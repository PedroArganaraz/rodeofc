import { createClient } from "@/utils/supabase/server";
import { ordenarPorPosicion } from "@/lib/orden-jugadoras";
import { FormacionView } from "./formacion-view";
import { asegurarFormacionInicial } from "./actions";

export const dynamic = "force-dynamic";

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

  let slotsIniciales: { jugadoraId: string; x: number; y: number }[] = [];

  if (formacionId) {
    const { data: filas } = await supabase
      .from("formaciones-jugadoras")
      .select("*")
      .eq("formacion_id", formacionId);

    slotsIniciales = (filas ?? [])
      .filter(
        (fila) =>
          fila.titular && fila.posicion_x !== null && fila.posicion_y !== null,
      )
      .map((fila) => ({
        jugadoraId: fila.jugadora_id,
        x: fila.posicion_x as number,
        y: fila.posicion_y as number,
      }));
  }

  return (
    <FormacionView
      formacionId={formacionId}
      slotsIniciales={slotsIniciales}
      jugadoras={ordenarPorPosicion(jugadoras ?? [])}
    />
  );
}
