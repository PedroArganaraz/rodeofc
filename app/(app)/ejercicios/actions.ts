"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { Json, TablesInsert } from "@/types/database.types";
import { esForma, type ElementoCancha, type Forma, type Marcador } from "@/components/cancha/elementos";

export type PasoInput = {
  nombre: string | null;
  marcadores: Marcador[];
  formas: Forma[];
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

function armarPasosPayload(ejercicioId: string, pasos: PasoInput[]) {
  const payload: TablesInsert<"pasos-ejercicio">[] = pasos.map(
    (paso, indice) => ({
      ejercicio_id: ejercicioId,
      orden: indice + 1,
      nombre: paso.nombre,
      posiciones: [...paso.marcadores, ...paso.formas] as unknown as Json,
    }),
  );

  return payload;
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

  const { error: pasosError } = await supabase
    .from("pasos-ejercicio")
    .insert(armarPasosPayload(ejercicio.id, pasos));

  if (pasosError) throw new Error(pasosError.message);

  revalidatePath(`/ejercicios/${categoria}`);

  return ejercicio.id;
}

export async function actualizarEjercicio(
  ejercicioId: string,
  titulo: string,
  pasos: PasoInput[],
) {
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("ejercicios")
    .update({ titulo })
    .eq("id", ejercicioId);

  if (updateError) throw new Error(updateError.message);

  const { error: deleteError } = await supabase
    .from("pasos-ejercicio")
    .delete()
    .eq("ejercicio_id", ejercicioId);

  if (deleteError) throw new Error(deleteError.message);

  const { error: pasosError } = await supabase
    .from("pasos-ejercicio")
    .insert(armarPasosPayload(ejercicioId, pasos));

  if (pasosError) throw new Error(pasosError.message);

  revalidatePath("/ejercicios/[categoria]", "page");
  revalidatePath("/ejercicios/[categoria]/[id]", "page");
}

export async function eliminarEjercicio(ejercicioId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("ejercicios")
    .delete()
    .eq("id", ejercicioId);

  if (error) throw new Error(error.message);

  revalidatePath("/ejercicios/[categoria]", "page");
  revalidatePath("/ejercicios/[categoria]/[id]", "page");
}

export async function obtenerPasosEjercicio(ejercicioId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pasos-ejercicio")
    .select("id, nombre, posiciones")
    .eq("ejercicio_id", ejercicioId)
    .order("orden");

  if (error) throw new Error(error.message);

  return (data ?? []).map((paso) => {
    const elementos = (paso.posiciones ?? []) as unknown as ElementoCancha[];
    return {
      id: paso.id,
      nombre: paso.nombre,
      marcadores: elementos.filter((el) => !esForma(el)) as Marcador[],
      formas: elementos.filter(esForma),
    };
  });
}
