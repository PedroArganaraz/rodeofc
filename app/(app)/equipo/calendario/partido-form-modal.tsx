"use client";

import { useMemo, useState, useTransition } from "react";
import { Modal } from "@/components/modal";
import { createPartido, updatePartido } from "./actions";
import type { Tables } from "@/types/database.types";

const CANCHAS_POR_SEDE: Record<string, number> = {
  Aeropuerto: 4,
  Tirolesa: 7,
};

export function PartidoFormModal({
  rivales,
  partido,
  onClose,
  onSaved,
}: {
  rivales: Tables<"rivales">[];
  partido?: Tables<"partidos">;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [rivalId, setRivalId] = useState(
    partido?.rival_id ?? rivales[0]?.id ?? "",
  );
  const [fecha, setFecha] = useState(partido?.fecha ?? "");
  const [horaADefinir, setHoraADefinir] = useState(
    partido ? partido.hora === null : false,
  );
  const [hora, setHora] = useState(partido?.hora ?? "");
  const [sede, setSede] = useState(partido ? (partido.sede ?? "") : "Aeropuerto");
  const [numeroCancha, setNumeroCancha] = useState(
    partido ? (partido.numero_cancha?.toString() ?? "") : "1",
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canchasDisponibles = useMemo(
    () => Array.from({ length: CANCHAS_POR_SEDE[sede] ?? 0 }, (_, i) => i + 1),
    [sede],
  );

  function handleSedeChange(value: string) {
    setSede(value);
    setNumeroCancha(value === "" ? "" : "1");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!rivalId) {
      setError("Elegí un rival");
      return;
    }

    const input = {
      rival_id: rivalId,
      fecha,
      hora: horaADefinir || hora.trim() === "" ? null : hora,
      sede: sede === "" ? null : sede,
      numero_cancha:
        sede === "" || numeroCancha === "" ? null : Number(numeroCancha),
    };

    startTransition(async () => {
      try {
        if (partido) {
          await updatePartido(partido.id, input);
        } else {
          await createPartido(input);
        }
        onSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error");
      }
    });
  }

  return (
    <Modal
      title={partido ? "Editar partido" : "Nuevo partido"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        ) : null}

        <div className="space-y-1">
          <label
            htmlFor="rival"
            className="text-sm font-medium text-neutral-500"
          >
            Rival
          </label>
          <select
            id="rival"
            required
            value={rivalId}
            onChange={(event) => setRivalId(event.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-900"
          >
            {rivales.length === 0 ? (
              <option value="">No hay rivales cargados</option>
            ) : null}
            {rivales.map((rival) => (
              <option key={rival.id} value={rival.id}>
                {rival.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label
              htmlFor="fecha"
              className="text-sm font-medium text-neutral-500"
            >
              Fecha
            </label>
            <input
              id="fecha"
              type="date"
              required
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-900"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="hora"
                className="text-sm font-medium text-neutral-500"
              >
                Hora
              </label>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <input
                  type="checkbox"
                  checked={horaADefinir}
                  onChange={(event) => setHoraADefinir(event.target.checked)}
                  className="rounded border-stone-300"
                />
                A definir
              </label>
            </div>
            {horaADefinir ? (
              <div className="flex h-[38px] items-center rounded-xl border border-stone-300 bg-stone-100 px-3 text-sm text-neutral-500">
                A definir
              </div>
            ) : (
              <input
                id="hora"
                type="time"
                value={hora ?? ""}
                onChange={(event) => setHora(event.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-mono text-neutral-900"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label
              htmlFor="sede"
              className="text-sm font-medium text-neutral-500"
            >
              Sede
            </label>
            <select
              id="sede"
              value={sede}
              onChange={(event) => handleSedeChange(event.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-900"
            >
              <option value="">A definir</option>
              {Object.keys(CANCHAS_POR_SEDE).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {sede !== "" ? (
            <div className="space-y-1">
              <label
                htmlFor="cancha"
                className="text-sm font-medium text-neutral-500"
              >
                Cancha
              </label>
              <select
                id="cancha"
                value={numeroCancha}
                onChange={(event) => setNumeroCancha(event.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-900"
              >
                <option value="">A definir</option>
                {canchasDisponibles.map((n) => (
                  <option key={n} value={n} className="font-mono">
                    {n}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
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
