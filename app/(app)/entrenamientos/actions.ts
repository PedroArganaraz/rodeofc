"use server";

import { createClient } from "@/utils/supabase/server";
import type { TablesInsert } from "@/types/database.types";

export type EjercicioEntrenamientoInput = {
  ejercicio_id: string;
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

function armarEjerciciosPayload(
  entrenamientoId: string,
  ejercicios: EjercicioEntrenamientoInput[],
) {
  const payload: TablesInsert<"entrenamientos-ejercicios">[] = ejercicios.map(
    (ejercicio, indice) => ({
      entrenamiento_id: entrenamientoId,
      ejercicio_id: ejercicio.ejercicio_id,
      orden: indice + 1,
    }),
  );

  return payload;
}

export async function crearEntrenamiento(
  titulo: string,
  ejercicios: EjercicioEntrenamientoInput[],
) {
  const supabase = await createClient();
  const equipoId = await getEquipoIdDelUsuario();

  const entrenamientoPayload: TablesInsert<"entrenamientos"> = {
    equipo_id: equipoId,
    titulo,
  };

  const { data: entrenamiento, error: entrenamientoError } = await supabase
    .from("entrenamientos")
    .insert(entrenamientoPayload)
    .select("id")
    .single();

  if (entrenamientoError) throw new Error(entrenamientoError.message);

  const { error: ejerciciosError } = await supabase
    .from("entrenamientos-ejercicios")
    .insert(armarEjerciciosPayload(entrenamiento.id, ejercicios));

  if (ejerciciosError) throw new Error(ejerciciosError.message);

  return entrenamiento.id;
}

export async function actualizarEntrenamiento(
  entrenamientoId: string,
  titulo: string,
  ejercicios: EjercicioEntrenamientoInput[],
) {
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("entrenamientos")
    .update({ titulo })
    .eq("id", entrenamientoId);

  if (updateError) throw new Error(updateError.message);

  const { error: deleteError } = await supabase
    .from("entrenamientos-ejercicios")
    .delete()
    .eq("entrenamiento_id", entrenamientoId);

  if (deleteError) throw new Error(deleteError.message);

  const { error: ejerciciosError } = await supabase
    .from("entrenamientos-ejercicios")
    .insert(armarEjerciciosPayload(entrenamientoId, ejercicios));

  if (ejerciciosError) throw new Error(ejerciciosError.message);
}

export async function eliminarEntrenamiento(entrenamientoId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("entrenamientos")
    .delete()
    .eq("id", entrenamientoId);

  if (error) throw new Error(error.message);
}
