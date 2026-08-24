import { notFound } from "next/navigation";
import { Placeholder } from "@/components/placeholder";
import { CATEGORIAS, type CategoriaEjercicio } from "../categorias";

export default async function EjerciciosCategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;

  const encontrada = CATEGORIAS.find(
    (c) => c.slug === (categoria as CategoriaEjercicio),
  );

  if (!encontrada) notFound();

  return <Placeholder title={encontrada.label} />;
}
