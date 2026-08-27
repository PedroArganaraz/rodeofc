"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/database.types";

export type PartidoInput = {
  rival_id: string;
  fecha: string;
  hora: string | null;
  sede: string | null;
  numero_cancha: number | null;
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

async function getTorneoActivoId(equipoId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("torneos")
    .select("id")
    .eq("equipo_id", equipoId)
    .order("anio", { ascending: false })
    .limit(1);

  return data?.[0]?.id ?? null;
}

export async function createPartido(input: PartidoInput) {
  const supabase = await createClient();
  const equipoId = await getEquipoIdDelUsuario();
  const torneoId = await getTorneoActivoId(equipoId);

  const payload: TablesInsert<"partidos"> = {
    equipo_id: equipoId,
    rival_id: input.rival_id,
    torneo_id: torneoId,
    fecha: input.fecha,
    hora: input.hora,
    sede: input.sede,
    numero_cancha: input.numero_cancha,
    estado: "programado",
  };

  const { error } = await supabase.from("partidos").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/equipo/calendario");
  revalidatePath("/rivales/[id]", "page");
}

export async function updatePartido(id: string, input: PartidoInput) {
  const supabase = await createClient();

  const payload: TablesUpdate<"partidos"> = {
    rival_id: input.rival_id,
    fecha: input.fecha,
    hora: input.hora,
    sede: input.sede,
    numero_cancha: input.numero_cancha,
  };

  const { error } = await supabase.from("partidos").update(payload).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/equipo/calendario");
  revalidatePath("/rivales/[id]", "page");
}

export async function deletePartido(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("partidos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/equipo/calendario");
  revalidatePath("/rivales/[id]", "page");
}
