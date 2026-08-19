"use client";

import { Pencil, Shield, Trash2 } from "lucide-react";
import { Modal } from "@/components/modal";
import type { Tables } from "@/types/database.types";

type Partido = Tables<"partidos">;
type Rival = Tables<"rivales">;

export function PartidoDetalleModal({
  partidos,
  rivalesById,
  onClose,
  onEdit,
  onDelete,
}: {
  partidos: Partido[];
  rivalesById: Map<string, Rival>;
  onClose: () => void;
  onEdit: (partido: Partido) => void;
  onDelete: (partido: Partido) => void;
}) {
  return (
    <Modal title="Partido del día" onClose={onClose}>
      <ul className="space-y-2">
        {partidos.map((partido) => {
          const rival = partido.rival_id
            ? rivalesById.get(partido.rival_id)
            : undefined;

          return (
            <li
              key={partido.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-stone-300 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {rival?.escudo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={rival.escudo_url}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-300 text-neutral-500">
                    <Shield className="h-5 w-5" />
                  </span>
                )}
                <div>
                  <p className="font-medium text-neutral-900">
                    {rival?.nombre ?? "Rival"}
                  </p>
                  <p className="text-sm text-neutral-500">
                    <span className={partido.hora ? "font-mono" : ""}>
                      {partido.hora ? partido.hora.slice(0, 5) : "A definir"}
                    </span>
                    {" · "}
                    {partido.sede
                      ? `${partido.sede} - Cancha ${partido.numero_cancha ?? "a definir"}`
                      : "Cancha a definir"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(partido)}
                  aria-label="Editar partido"
                  className="rounded-full p-2 text-neutral-500 hover:bg-stone-300 hover:text-neutral-900"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(partido)}
                  aria-label="Eliminar partido"
                  className="rounded-full p-2 text-neutral-500 hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
