import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { EditorEntrenamientoView } from "@/components/entrenamientos/editor-entrenamiento-view";

export const dynamic = "force-dynamic";

export default async function EntrenamientoDetallePage({
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
  if (!equipoId) notFound();

  const { data: entrenamiento } = await supabase
    .from("entrenamientos")
    .select("id, titulo")
    .eq("id", id)
    .eq("equipo_id", equipoId)
    .single();

  if (!entrenamiento) notFound();

  const { data: ejercicios } = await supabase
    .from("ejercicios")
    .select("id, titulo, categoria")
    .eq("equipo_id", equipoId)
    .order("titulo");

  const { data: entrenamientosEjercicios } = await supabase
    .from("entrenamientos-ejercicios")
    .select("ejercicio_id, orden")
    .eq("entrenamiento_id", entrenamiento.id)
    .order("orden");

  return (
    <EditorEntrenamientoView
      entrenamientoId={entrenamiento.id}
      tituloInicial={entrenamiento.titulo}
      ejerciciosDisponibles={ejercicios ?? []}
      ejerciciosSeleccionadosIniciales={entrenamientosEjercicios ?? []}
    />
  );
}
