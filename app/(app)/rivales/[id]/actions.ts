"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { TablesInsert } from "@/types/database.types";

export async function guardarResultado(
  partidoId: string,
  golesFavor: number | null,
  golesContra: number | null,
  notas: string | null,
) {
  const supabase = await createClient();

  const { error: notasError } = await supabase
    .from("partidos")
    .update({ notas })
    .eq("id", partidoId);
  if (notasError) throw new Error(notasError.message);

  if (golesFavor !== null && golesContra !== null) {
    const { data: existente, error: buscarError } = await supabase
      .from("resultados-partidos")
      .select("id")
      .eq("partido_id", partidoId)
      .limit(1);
    if (buscarError) throw new Error(buscarError.message);

    if (existente?.[0]) {
      const { error } = await supabase
        .from("resultados-partidos")
        .update({ goles_favor: golesFavor, goles_contra: golesContra })
        .eq("id", existente[0].id);
      if (error) throw new Error(error.message);
    } else {
      const payload: TablesInsert<"resultados-partidos"> = {
        partido_id: partidoId,
        goles_favor: golesFavor,
        goles_contra: golesContra,
      };
      const { error } = await supabase
        .from("resultados-partidos")
        .insert(payload);
      if (error) throw new Error(error.message);
    }

    const { error: estadoError } = await supabase
      .from("partidos")
      .update({ estado: "jugado" })
      .eq("id", partidoId);
    if (estadoError) throw new Error(estadoError.message);
  }

  revalidatePath("/rivales/[id]", "page");
}
