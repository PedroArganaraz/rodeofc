import { createClient } from "@/utils/supabase/server";
import { EditorEntrenamientoView } from "@/components/entrenamientos/editor-entrenamiento-view";

export default async function NuevoEntrenamientoPage() {
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

  const { data: ejercicios } = equipoId
    ? await supabase
        .from("ejercicios")
        .select("id, titulo, categoria")
        .eq("equipo_id", equipoId)
        .order("titulo")
    : { data: null };

  return <EditorEntrenamientoView ejerciciosDisponibles={ejercicios ?? []} />;
}
