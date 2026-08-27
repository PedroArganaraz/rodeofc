import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { CATEGORIAS, type CategoriaEjercicio } from "../../categorias";
import { obtenerPasosEjercicio } from "../../actions";
import { EditorEjercicioView } from "@/components/ejercicios/editor-ejercicio-view";

export const dynamic = "force-dynamic";

export default async function EjercicioDetallePage({
  params,
}: {
  params: Promise<{ categoria: string; id: string }>;
}) {
  const { categoria, id } = await params;

  const encontrada = CATEGORIAS.find(
    (c) => c.slug === (categoria as CategoriaEjercicio),
  );

  if (!encontrada) notFound();

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

  const { data: ejercicio } = await supabase
    .from("ejercicios")
    .select("id, titulo")
    .eq("id", id)
    .eq("equipo_id", equipoId)
    .single();

  if (!ejercicio) notFound();

  const pasosIniciales = await obtenerPasosEjercicio(ejercicio.id);

  return (
    <EditorEjercicioView
      categoriaSlug={encontrada.slug}
      categoriaLabel={encontrada.label}
      ejercicioId={ejercicio.id}
      tituloInicial={ejercicio.titulo}
      pasosIniciales={pasosIniciales}
    />
  );
}
