"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/database.types";

export type RivalInput = {
  nombre: string;
  categoria: string;
  escudo_url: string | null;
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

export async function createRival(input: RivalInput) {
  const supabase = await createClient();
  const equipoId = await getEquipoIdDelUsuario();

  const payload: TablesInsert<"rivales"> = {
    equipo_id: equipoId,
    nombre: input.nombre,
    categoria: input.categoria,
    escudo_url: input.escudo_url,
  };

  const { error } = await supabase.from("rivales").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/rivales");
}

export async function updateRival(id: string, input: RivalInput) {
  const supabase = await createClient();

  const payload: TablesUpdate<"rivales"> = {
    nombre: input.nombre,
    categoria: input.categoria,
    escudo_url: input.escudo_url,
  };

  const { error } = await supabase.from("rivales").update(payload).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/rivales");
  revalidatePath("/rivales/[id]", "page");
}

export async function deleteRival(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("rivales").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/rivales");
  revalidatePath("/rivales/[id]", "page");
}
