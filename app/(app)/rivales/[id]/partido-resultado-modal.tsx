"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/modal";
import { guardarResultado } from "./actions";
import type { Tables } from "@/types/database.types";

function formatearFecha(fecha: string) {
  const [year, month, day] = fecha.split("-");
  return `${day}/${month}/${year}`;
}

export function PartidoResultadoModal({
  partido,
  resultado,
  rivalNombre,
  onClose,
  onSaved,
}: {
  partido: Tables<"partidos">;
  resultado?: Tables<"resultados-partidos">;
  rivalNombre: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [golesFavor, setGolesFavor] = useState(
    resultado?.goles_favor?.toString() ?? "",
  );
  const [golesContra, setGolesContra] = useState(
    resultado?.goles_contra?.toString() ?? "",
  );
  const [notas, setNotas] = useState(partido.notas ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sedeTexto = partido.sede
    ? `${partido.sede} - Cancha ${partido.numero_cancha ?? "a definir"}`
    : "Cancha a definir";
  const horaTexto = partido.hora ? partido.hora.slice(0, 5) : "A definir";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const gf = golesFavor.trim() === "" ? null : Number(golesFavor);
    const gc = golesContra.trim() === "" ? null : Number(golesContra);

    startTransition(async () => {
      try {
        await guardarResultado(
          partido.id,
          gf,
          gc,
          notas.trim() === "" ? null : notas.trim(),
        );
        onSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error");
      }
    });
  }

  return (
    <Modal
      title="Detalle del partido"
      onClose={onClose}
      maxWidthClassName="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        ) : null}

        <div className="space-y-1 text-sm text-neutral-500">
          <p>
            <span className="font-medium text-neutral-900">Fecha:</span>{" "}
            {formatearFecha(partido.fecha)} ·{" "}
            <span className={partido.hora ? "font-mono" : ""}>
              {horaTexto}
            </span>
          </p>
          <p>
            <span className="font-medium text-neutral-900">Sede:</span>{" "}
            {sedeTexto}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label
              htmlFor="golesFavor"
              className="text-sm font-medium text-neutral-500"
            >
              Goles Rodeo FC
            </label>
            <input
              id="golesFavor"
              type="number"
              min={0}
              value={golesFavor}
              onChange={(event) => setGolesFavor(event.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-mono text-neutral-900"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="golesContra"
              className="text-sm font-medium text-neutral-500"
            >
              Goles {rivalNombre}
            </label>
            <input
              id="golesContra"
              type="number"
              min={0}
              value={golesContra}
              onChange={(event) => setGolesContra(event.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-mono text-neutral-900"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="notas"
            className="text-sm font-medium text-neutral-500"
          >
            Notas
          </label>
          <textarea
            id="notas"
            rows={9}
            value={notas}
            onChange={(event) => setNotas(event.target.value)}
            className="w-full resize-none rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-900"
          />
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
