"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/database.types";
import type { PostgrestError } from "@supabase/supabase-js";

export type JugadoraInput = {
  nombre: string;
  apellido: string;
  dorsal: number | null;
  posicion: string | null;
};

function throwJugadoraError(error: PostgrestError, dorsal: number | null): never {
  if (error.code === "23505") {
    throw new Error(`Ya existe una jugadora con el dorsal ${dorsal}`);
  }
  throw new Error(error.message);
}

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

export async function createJugadora(input: JugadoraInput) {
  const supabase = await createClient();
  const equipoId = await getEquipoIdDelUsuario();

  const payload: TablesInsert<"jugadoras"> = {
    equipo_id: equipoId,
    nombre: input.nombre,
    apellido: input.apellido,
    dorsal: input.dorsal,
    posicion: input.posicion,
  };

  const { error } = await supabase.from("jugadoras").insert(payload);
  if (error) throwJugadoraError(error, input.dorsal);

  revalidatePath("/equipo/jugadoras");
  revalidatePath("/equipo/formacion");
}

export async function updateJugadora(id: string, input: JugadoraInput) {
  const supabase = await createClient();

  const payload: TablesUpdate<"jugadoras"> = {
    nombre: input.nombre,
    apellido: input.apellido,
    dorsal: input.dorsal,
    posicion: input.posicion,
  };

  const { error } = await supabase.from("jugadoras").update(payload).eq("id", id);
  if (error) throwJugadoraError(error, input.dorsal);

  revalidatePath("/equipo/jugadoras");
  revalidatePath("/equipo/formacion");
}

export async function deleteJugadora(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("jugadoras").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/equipo/jugadoras");
  revalidatePath("/equipo/formacion");
}
