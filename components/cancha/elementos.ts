export type ColorMarcador = "propio" | "rival";
export type TipoMarcador = "jugador" | "pelota" | "cono";
export type TipoForma = "flecha" | "rectangulo" | "circulo";

export type Marcador = {
  id: string;
  x: number;
  y: number;
  numero: string;
  color: ColorMarcador;
  etiqueta?: string;
  tipo?: TipoMarcador;
};

export type Forma = {
  id: string;
  tipo: TipoForma;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: ColorMarcador;
};

export type ElementoCancha = Marcador | Forma;

export function esForma(item: ElementoCancha): item is Forma {
  return "x1" in item;
}
