"use server";

import { createClient } from "@/utils/supabase/server";
import type { TablesInsert } from "@/types/database.types";
import {
  esForma,
  type ElementoCancha,
  type Forma,
  type Marcador,
} from "@/components/cancha/elementos";

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

export async function obtenerEjerciciosConPasos(entrenamientoId: string) {
  const supabase = await createClient();

  const { data: filas, error: filasError } = await supabase
    .from("entrenamientos-ejercicios")
    .select("ejercicio_id, orden")
    .eq("entrenamiento_id", entrenamientoId)
    .order("orden");

  if (filasError) throw new Error(filasError.message);

  const ejercicioIds = (filas ?? []).map((fila) => fila.ejercicio_id);
  if (ejercicioIds.length === 0) return [];

  const { data: ejercicios, error: ejerciciosError } = await supabase
    .from("ejercicios")
    .select("id, titulo")
    .in("id", ejercicioIds);

  if (ejerciciosError) throw new Error(ejerciciosError.message);

  const { data: pasos, error: pasosError } = await supabase
    .from("pasos-ejercicio")
    .select("id, nombre, posiciones, ejercicio_id")
    .in("ejercicio_id", ejercicioIds)
    .order("orden");

  if (pasosError) throw new Error(pasosError.message);

  const tituloPorEjercicio = new Map(
    (ejercicios ?? []).map((ejercicio) => [ejercicio.id, ejercicio.titulo]),
  );

  const pasosPorEjercicio = new Map<
    string,
    { id: string; nombre: string | null; marcadores: Marcador[]; formas: Forma[] }[]
  >();

  for (const paso of pasos ?? []) {
    const elementos = (paso.posiciones ?? []) as unknown as ElementoCancha[];
    const lista = pasosPorEjercicio.get(paso.ejercicio_id) ?? [];
    lista.push({
      id: paso.id,
      nombre: paso.nombre,
      marcadores: elementos.filter((elemento) => !esForma(elemento)) as Marcador[],
      formas: elementos.filter(esForma),
    });
    pasosPorEjercicio.set(paso.ejercicio_id, lista);
  }

  return ejercicioIds.map((ejercicioId) => ({
    id: ejercicioId,
    titulo: tituloPorEjercicio.get(ejercicioId) ?? "",
    pasos: pasosPorEjercicio.get(ejercicioId) ?? [],
  }));
}
