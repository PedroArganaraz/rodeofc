"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/modal";

export function ConfirmModal({
  title,
  description,
  confirmLabel = "Eliminar",
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await onConfirm();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error");
      }
    });
  }

  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-neutral-500">{description}</p>

      {error ? (
        <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-neutral-900"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-500/90 disabled:opacity-60"
        >
          {isPending ? "Eliminando..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
