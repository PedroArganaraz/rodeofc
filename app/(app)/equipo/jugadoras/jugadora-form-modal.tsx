"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/modal";
import { createJugadora, updateJugadora } from "./actions";
import type { Tables } from "@/types/database.types";

const POSICIONES = ["Arquera", "Defensora", "Mediocampista", "Delantera"];

export function JugadoraFormModal({
  jugadora,
  onClose,
  onSaved,
}: {
  jugadora?: Tables<"jugadoras">;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(jugadora?.nombre ?? "");
  const [apellido, setApellido] = useState(jugadora?.apellido ?? "");
  const [dorsal, setDorsal] = useState(jugadora?.dorsal?.toString() ?? "");
  const [posicion, setPosicion] = useState(jugadora?.posicion ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const input = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dorsal: dorsal.trim() === "" ? null : Number(dorsal),
      posicion: posicion === "" ? null : posicion,
    };

    startTransition(async () => {
      try {
        if (jugadora) {
          await updateJugadora(jugadora.id, input);
        } else {
          await createJugadora(input);
        }
        onSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error");
      }
    });
  }

  return (
    <Modal
      title={jugadora ? "Editar jugadora" : "Nueva jugadora"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label
              htmlFor="nombre"
              className="text-sm font-medium text-neutral-500"
            >
              Nombre
            </label>
            <input
              id="nombre"
              required
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-900"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="apellido"
              className="text-sm font-medium text-neutral-500"
            >
              Apellido
            </label>
            <input
              id="apellido"
              required
              value={apellido}
              onChange={(event) => setApellido(event.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-900"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="dorsal"
            className="text-sm font-medium text-neutral-500"
          >
            Dorsal
          </label>
          <input
            id="dorsal"
            type="number"
            min={0}
            value={dorsal}
            onChange={(event) => setDorsal(event.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-900"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="posicion"
            className="text-sm font-medium text-neutral-500"
          >
            Posición
          </label>
          <select
            id="posicion"
            value={posicion ?? ""}
            onChange={(event) => setPosicion(event.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-900"
          >
            <option value="">Sin posición</option>
            {POSICIONES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-neutral-900"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark disabled:opacity-60"
          >
            {isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
