"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/confirm-modal";
import { JugadoraFormModal } from "./jugadora-form-modal";
import { deleteJugadora } from "./actions";
import type { Tables } from "@/types/database.types";

type Jugadora = Tables<"jugadoras">;

type ModalState =
  | { type: "create" }
  | { type: "edit"; jugadora: Jugadora }
  | { type: "delete"; jugadora: Jugadora }
  | null;

export function JugadorasList({ jugadoras }: { jugadoras: Jugadora[] }) {
  const [modal, setModal] = useState<ModalState>(null);
  const router = useRouter();

  function handleSaved() {
    setModal(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteJugadora(id);
    setModal(null);
    router.refresh();
  }

  return (
    <div className="w-full flex-1 p-6">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setModal({ type: "create" })}
          className="flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark"
        >
          <Plus className="h-4 w-4" />
          Nueva jugadora
        </button>
      </div>

      {jugadoras.length === 0 ? (
        <p className="py-12 text-center text-sm text-neutral-500">
          Todavía no hay jugadoras cargadas.
        </p>
      ) : (
        <ul className="space-y-2">
          {jugadoras.map((jugadora) => (
            <li
              key={jugadora.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-stone-300 bg-stone-100 px-4 py-3"
            >
              <button
                type="button"
                onClick={() => setModal({ type: "edit", jugadora })}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy font-mono text-sm font-medium text-white">
                  {jugadora.dorsal ?? "-"}
                </span>
                <span>
                  <span className="block font-medium text-neutral-900">
                    {jugadora.apellido}, {jugadora.nombre}
                  </span>
                  {jugadora.posicion ? (
                    <span className="block text-sm text-neutral-500">
                      {jugadora.posicion}
                    </span>
                  ) : null}
                </span>
              </button>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setModal({ type: "edit", jugadora })}
                  aria-label={`Editar a ${jugadora.nombre} ${jugadora.apellido}`}
                  className="rounded-full p-2 text-neutral-500 hover:bg-stone-300 hover:text-neutral-900"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setModal({ type: "delete", jugadora })}
                  aria-label={`Eliminar a ${jugadora.nombre} ${jugadora.apellido}`}
                  className="rounded-full p-2 text-neutral-500 hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal?.type === "create" ? (
        <JugadoraFormModal onClose={() => setModal(null)} onSaved={handleSaved} />
      ) : null}
      {modal?.type === "edit" ? (
        <JugadoraFormModal
          jugadora={modal.jugadora}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      ) : null}
      {modal?.type === "delete" ? (
        <ConfirmModal
          title="Eliminar jugadora"
          description={`¿Eliminar a ${modal.jugadora.nombre} ${modal.jugadora.apellido}? Esta acción no se puede deshacer.`}
          onConfirm={() => handleDelete(modal.jugadora.id)}
          onClose={() => setModal(null)}
        />
      ) : null}
    </div>
  );
}
