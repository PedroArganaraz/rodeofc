import { redirect } from "next/navigation";
import { CATEGORIAS, type CategoriaEjercicio } from "../../categorias";
import { EditorEjercicioView } from "@/components/ejercicios/editor-ejercicio-view";

export default async function NuevoEjercicioPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;

  const encontrada = CATEGORIAS.find(
    (c) => c.slug === (categoria as CategoriaEjercicio),
  );

  if (!encontrada) redirect("/ejercicios");

  return (
    <EditorEjercicioView
      categoriaSlug={encontrada.slug}
      categoriaLabel={encontrada.label}
    />
  );
}
