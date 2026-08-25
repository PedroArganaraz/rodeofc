import { ArrowLeftRight, Footprints, Hand, Route, Target } from "lucide-react";

export type CategoriaEjercicio =
  | "pases"
  | "tecnica"
  | "definicion"
  | "jugada"
  | "arqueras";

export const CATEGORIAS: {
  slug: CategoriaEjercicio;
  label: string;
  icon: typeof ArrowLeftRight;
}[] = [
  { slug: "pases", label: "Pases", icon: ArrowLeftRight },
  { slug: "tecnica", label: "Técnica", icon: Footprints },
  { slug: "definicion", label: "Definición", icon: Target },
  { slug: "jugada", label: "Jugada", icon: Route },
  { slug: "arqueras", label: "Arqueras", icon: Hand },
];
