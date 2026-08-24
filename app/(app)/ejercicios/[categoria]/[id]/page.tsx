import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { CATEGORIAS, type CategoriaEjercicio } from "../../categorias";
import { EditorEjercicioView } from "@/components/ejercicios/editor-ejercicio-view";
import type { Marcador } from "@/components/cancha/cancha-tactica";

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

  const { data: pasos } = await supabase
    .from("pasos-ejercicio")
    .select("id, nombre, posiciones")
    .eq("ejercicio_id", ejercicio.id)
    .order("orden");

  const pasosIniciales = (pasos ?? []).map((paso) => ({
    id: paso.id,
    nombre: paso.nombre,
    marcadores: (paso.posiciones ?? []) as unknown as Marcador[],
  }));

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
