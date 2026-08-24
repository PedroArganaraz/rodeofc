"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { TablesInsert } from "@/types/database.types";

const ESQUEMA_INICIAL = "equilibrada";

const POSICIONES_INICIALES: { x: number; y: number }[] = [
  { x: 50, y: 90 },
  { x: 30, y: 72 },
  { x: 70, y: 72 },
  { x: 20, y: 50 },
  { x: 50, y: 50 },
  { x: 80, y: 50 },
  { x: 50, y: 25 },
];

async function getFormacionId(equipoId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("formaciones")
    .select("id")
    .eq("equipo_id", equipoId)
    .limit(1);

  return data?.[0]?.id ?? null;
}

export async function asegurarFormacionInicial(equipoId: string) {
  const existente = await getFormacionId(equipoId);
  if (existente) return existente;

  const supabase = await createClient();

  const { data: jugadoras, error: jugadorasError } = await supabase
    .from("jugadoras")
    .select("id")
    .eq("equipo_id", equipoId)
    .order("apellido")
    .limit(7);

  if (jugadorasError) throw new Error(jugadorasError.message);
  if (!jugadoras || jugadoras.length === 0) return null;

  const { data, error } = await supabase
    .from("formaciones")
    .insert({ equipo_id: equipoId, esquema: ESQUEMA_INICIAL })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const formacionId = data.id;

  const filas: TablesInsert<"formaciones-jugadoras">[] = jugadoras.map(
    (jugadora, index) => ({
      formacion_id: formacionId,
      jugadora_id: jugadora.id,
      posicion_x: POSICIONES_INICIALES[index]?.x ?? 50,
      posicion_y: POSICIONES_INICIALES[index]?.y ?? 50,
      titular: true,
    }),
  );

  const { error: insertError } = await supabase
    .from("formaciones-jugadoras")
    .insert(filas);
  if (insertError) throw new Error(insertError.message);

  return formacionId;
}

export async function moverJugadora(
  formacionId: string,
  jugadoraId: string,
  x: number,
  y: number,
) {
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("formaciones-jugadoras")
    .update({ posicion_x: x, posicion_y: y, titular: true })
    .eq("formacion_id", formacionId)
    .eq("jugadora_id", jugadoraId);
  if (updateError) throw new Error(updateError.message);

  const { error: esquemaError } = await supabase
    .from("formaciones")
    .update({ esquema: "personalizado" })
    .eq("id", formacionId);
  if (esquemaError) throw new Error(esquemaError.message);

  revalidatePath("/equipo/formacion");
}

export async function reemplazarJugadora(
  formacionId: string,
  titularId: string,
  suplenteId: string,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("formaciones-jugadoras")
    .update({ jugadora_id: suplenteId })
    .eq("formacion_id", formacionId)
    .eq("jugadora_id", titularId);
  if (error) throw new Error(error.message);

  const { error: esquemaError } = await supabase
    .from("formaciones")
    .update({ esquema: "personalizado" })
    .eq("id", formacionId);
  if (esquemaError) throw new Error(esquemaError.message);

  revalidatePath("/equipo/formacion");
}

export async function intercambiarPosiciones(
  formacionId: string,
  jugadoraIdA: string,
  jugadoraIdB: string,
) {
  const supabase = await createClient();

  const { data: filas, error } = await supabase
    .from("formaciones-jugadoras")
    .select("jugadora_id, posicion_x, posicion_y")
    .eq("formacion_id", formacionId)
    .in("jugadora_id", [jugadoraIdA, jugadoraIdB]);
  if (error) throw new Error(error.message);

  const filaA = filas?.find((fila) => fila.jugadora_id === jugadoraIdA);
  const filaB = filas?.find((fila) => fila.jugadora_id === jugadoraIdB);
  if (!filaA || !filaB) {
    throw new Error("No se encontraron las posiciones a intercambiar");
  }

  const { error: errorA } = await supabase
    .from("formaciones-jugadoras")
    .update({ posicion_x: filaB.posicion_x, posicion_y: filaB.posicion_y })
    .eq("formacion_id", formacionId)
    .eq("jugadora_id", jugadoraIdA);
  if (errorA) throw new Error(errorA.message);

  const { error: errorB } = await supabase
    .from("formaciones-jugadoras")
    .update({ posicion_x: filaA.posicion_x, posicion_y: filaA.posicion_y })
    .eq("formacion_id", formacionId)
    .eq("jugadora_id", jugadoraIdB);
  if (errorB) throw new Error(errorB.message);

  revalidatePath("/equipo/formacion");
}
