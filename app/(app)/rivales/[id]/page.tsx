import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { RivalDetalleView } from "./rival-detalle-view";
import type { Tables } from "@/types/database.types";

export const dynamic = "force-dynamic";

export default async function RivalDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: miembros } = await supabase
    .from("miembros-equipo")
    .select("equipo_id")
    .eq("user_id", user!.id)
    .limit(1);

  const equipoId = miembros?.[0]?.equipo_id;

  if (!equipoId) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-neutral-500">
        No estás asignado a ningún equipo todavía.
      </div>
    );
  }

  const { data: rival } = await supabase
    .from("rivales")
    .select("*")
    .eq("id", id)
    .eq("equipo_id", equipoId)
    .limit(1);

  if (!rival?.[0]) notFound();

  const { data: partidos } = await supabase
    .from("partidos")
    .select("*")
    .eq("rival_id", id)
    .eq("equipo_id", equipoId)
    .order("fecha", { ascending: false });

  const partidoIds = (partidos ?? []).map((partido) => partido.id);

  const { data: resultados } =
    partidoIds.length > 0
      ? await supabase
          .from("resultados-partidos")
          .select("*")
          .in("partido_id", partidoIds)
      : { data: [] as Tables<"resultados-partidos">[] };

  const resultadosPorPartido: Record<string, Tables<"resultados-partidos">> =
    Object.fromEntries(
      (resultados ?? []).map((resultado) => [resultado.partido_id, resultado]),
    );

  return (
    <RivalDetalleView
      rival={rival[0]}
      partidos={partidos ?? []}
      resultadosPorPartido={resultadosPorPartido}
    />
  );
}
