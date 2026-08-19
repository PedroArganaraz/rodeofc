"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Shield, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/confirm-modal";
import { RivalFormModal } from "./rival-form-modal";
import { deleteRival } from "./actions";
import type { Tables } from "@/types/database.types";

type Rival = Tables<"rivales">;

type ModalState =
  | { type: "create" }
  | { type: "edit"; rival: Rival }
  | { type: "delete"; rival: Rival }
  | null;

export function RivalesList({
  rivales,
  equipoId,
}: {
  rivales: Rival[];
  equipoId: string;
}) {
  const [modal, setModal] = useState<ModalState>(null);
  const router = useRouter();

  function handleSaved() {
    setModal(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteRival(id);
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
          Nuevo Rival
        </button>
      </div>

      {rivales.length === 0 ? (
        <p className="py-12 text-center text-sm text-neutral-500">
          Todavía no hay rivales cargados.
        </p>
      ) : (
        <ul className="space-y-2">
          {rivales.map((rival) => (
            <li
              key={rival.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-stone-300 bg-white px-4 py-3"
            >
              <button
                type="button"
                onClick={() => setModal({ type: "edit", rival })}
                className="flex flex-1 items-center gap-3 text-left"
              >
                {rival.escudo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={rival.escudo_url}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-300 text-neutral-500">
                    <Shield className="h-4 w-4" />
                  </span>
                )}
                <span className="min-w-0 flex-1 font-medium text-neutral-900">
                  {rival.nombre}
                </span>
                <span className="shrink-0 whitespace-nowrap rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-brand-navy">
                  {rival.categoria.trim().split(" ").pop()}
                </span>
              </button>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setModal({ type: "edit", rival })}
                  aria-label={`Editar a ${rival.nombre}`}
                  className="rounded-full p-2 text-neutral-500 hover:bg-stone-300 hover:text-neutral-900"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setModal({ type: "delete", rival })}
                  aria-label={`Eliminar a ${rival.nombre}`}
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
        <RivalFormModal
          equipoId={equipoId}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      ) : null}
      {modal?.type === "edit" ? (
        <RivalFormModal
          equipoId={equipoId}
          rival={modal.rival}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      ) : null}
      {modal?.type === "delete" ? (
        <ConfirmModal
          title="Eliminar rival"
          description={`¿Eliminar a ${modal.rival.nombre}? Esta acción no se puede deshacer.`}
          onConfirm={() => handleDelete(modal.rival.id)}
          onClose={() => setModal(null)}
        />
      ) : null}
    </div>
  );
}
