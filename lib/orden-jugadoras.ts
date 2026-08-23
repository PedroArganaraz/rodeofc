const ORDEN_POSICION = ["Arquera", "Defensora", "Mediocampista", "Delantera"];

export function ordenarPorPosicion<
  T extends { posicion: string | null; apellido: string },
>(jugadoras: T[]): T[] {
  return [...jugadoras].sort((a, b) => {
    const ia = a.posicion ? ORDEN_POSICION.indexOf(a.posicion) : -1;
    const ib = b.posicion ? ORDEN_POSICION.indexOf(b.posicion) : -1;
    const oa = ia === -1 ? ORDEN_POSICION.length : ia;
    const ob = ib === -1 ? ORDEN_POSICION.length : ib;
    if (oa !== ob) return oa - ob;
    return a.apellido.localeCompare(b.apellido);
  });
}
