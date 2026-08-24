"use server";

import { createClient } from "@/utils/supabase/server";
import type { Json, TablesInsert } from "@/types/database.types";
import type { Marcador } from "@/components/cancha/cancha-tactica";

export type PasoInput = {
  nombre: string | null;
  marcadores: Marcador[];
};

async function getEquipoIdDelUsuario() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticado");

  const { data: miembros, error } = await supabase
    .from("miembros-equipo")
    .select("equipo_id")
    .eq("user_id", user.id)
    .limit(1);

  if (error) throw new Error(error.message);
  if (!miembros?.[0]) throw new Error("No pertenecés a ningún equipo");

  return miembros[0].equipo_id;
}

export async function crearEjercicio(
  titulo: string,
  categoria: string,
  pasos: PasoInput[],
) {
  const supabase = await createClient();
  const equipoId = await getEquipoIdDelUsuario();

  const ejercicioPayload: TablesInsert<"ejercicios"> = {
    equipo_id: equipoId,
    titulo,
    categoria,
  };

  const { data: ejercicio, error: ejercicioError } = await supabase
    .from("ejercicios")
    .insert(ejercicioPayload)
    .select("id")
    .single();

  if (ejercicioError) throw new Error(ejercicioError.message);

  const pasosPayload: TablesInsert<"pasos-ejercicio">[] = pasos.map(
    (paso, indice) => ({
      ejercicio_id: ejercicio.id,
      orden: indice + 1,
      nombre: paso.nombre,
      posiciones: paso.marcadores as unknown as Json,
    }),
  );

  const { error: pasosError } = await supabase
    .from("pasos-ejercicio")
    .insert(pasosPayload);

  if (pasosError) throw new Error(pasosError.message);

  return ejercicio.id;
}
