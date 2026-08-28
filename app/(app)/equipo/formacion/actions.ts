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

export async function guardarFormacion(
  formacionId: string,
  slots: { jugadoraId: string; x: number; y: number }[],
) {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("formaciones-jugadoras")
    .delete()
    .eq("formacion_id", formacionId)
    .eq("titular", true);
  if (deleteError) throw new Error(deleteError.message);

  const filas: TablesInsert<"formaciones-jugadoras">[] = slots.map((slot) => ({
    formacion_id: formacionId,
    jugadora_id: slot.jugadoraId,
    posicion_x: slot.x,
    posicion_y: slot.y,
    titular: true,
  }));

  const { error: insertError } = await supabase
    .from("formaciones-jugadoras")
    .insert(filas);
  if (insertError) throw new Error(insertError.message);

  const posicionesGuardadas = slots
    .map((slot) => `${slot.x},${slot.y}`)
    .sort();
  const posicionesOriginales = POSICIONES_INICIALES.map(
    (posicion) => `${posicion.x},${posicion.y}`,
  ).sort();
  const coincideConElOriginal =
    posicionesGuardadas.length === posicionesOriginales.length &&
    posicionesGuardadas.every((valor, i) => valor === posicionesOriginales[i]);

  const { error: esquemaError } = await supabase
    .from("formaciones")
    .update({
      esquema: coincideConElOriginal ? ESQUEMA_INICIAL : "personalizado",
    })
    .eq("id", formacionId);
  if (esquemaError) throw new Error(esquemaError.message);

  revalidatePath("/equipo/formacion");
}
