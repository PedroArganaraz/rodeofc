"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CanchaTactica, type Marcador } from "@/components/cancha/cancha-tactica";
import { ordenarPorPosicion } from "@/lib/orden-jugadoras";
import { guardarFormacion } from "./actions";
import type { Tables } from "@/types/database.types";

type Slot = {
  jugadoraId: string;
  x: number;
  y: number;
};

type Seleccion = { tipo: "titular" | "suplente"; id: string };

export function FormacionView({
  formacionId,
  slotsIniciales,
  jugadoras,
}: {
  formacionId: string | null;
  slotsIniciales: Slot[];
  jugadoras: Tables<"jugadoras">[];
}) {
  const [slots, setSlots] = useState<Slot[]>(slotsIniciales);
  const [mostrarNombres, setMostrarNombres] = useState(true);
  const [seleccion, setSeleccion] = useState<Seleccion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, startTransition] = useTransition();
  const router = useRouter();

  const jugadorasPorId = useMemo(
    () => new Map(jugadoras.map((jugadora) => [jugadora.id, jugadora])),
    [jugadoras],
  );

  const marcadores: Marcador[] = slots.map((slot) => {
    const jugadora = jugadorasPorId.get(slot.jugadoraId);
    return {
      id: slot.jugadoraId,
      x: slot.x,
      y: slot.y,
      numero: jugadora?.dorsal?.toString() ?? "-",
      color: "propio",
      etiqueta: mostrarNombres ? jugadora?.apellido : undefined,
    };
  });

  const suplentes = ordenarPorPosicion(
    jugadoras.filter(
      (jugadora) => !slots.some((slot) => slot.jugadoraId === jugadora.id),
    ),
  );

  const huboCambios = JSON.stringify(slots) !== JSON.stringify(slotsIniciales);

  function handleMoverMarcador(id: string, x: number, y: number) {
    setSlots((prev) =>
      prev.map((slot) => (slot.jugadoraId === id ? { ...slot, x, y } : slot)),
    );
  }

  function handleClickMarcador(id: string) {
    if (!seleccion) {
      setSeleccion({ tipo: "titular", id });
      return;
    }

    if (seleccion.tipo === "titular") {
      if (seleccion.id === id) {
        setSeleccion(null);
        return;
      }
      setSlots((prev) => {
        const copia = prev.map((slot) => ({ ...slot }));
        const a = copia.find((slot) => slot.jugadoraId === seleccion.id);
        const b = copia.find((slot) => slot.jugadoraId === id);
        if (a && b) {
          const x = a.x;
          const y = a.y;
          a.x = b.x;
          a.y = b.y;
          b.x = x;
          b.y = y;
        }
        return copia;
      });
      setSeleccion(null);
      return;
    }

    const suplenteId = seleccion.id;
    setSlots((prev) =>
      prev.map((slot) =>
        slot.jugadoraId === id ? { ...slot, jugadoraId: suplenteId } : slot,
      ),
    );
    setSeleccion(null);
  }

  function handleClickSuplente(id: string) {
    if (!seleccion) {
      setSeleccion({ tipo: "suplente", id });
      return;
    }

    if (seleccion.tipo === "suplente") {
      setSeleccion(seleccion.id === id ? null : { tipo: "suplente", id });
      return;
    }

    const titularId = seleccion.id;
    setSlots((prev) =>
      prev.map((slot) =>
        slot.jugadoraId === titularId ? { ...slot, jugadoraId: id } : slot,
      ),
    );
    setSeleccion(null);
  }

  function handleGuardar() {
    if (!formacionId) return;
    setError(null);
    startTransition(async () => {
      try {
        await guardarFormacion(formacionId, slots);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error");
      }
    });
  }

  return (
    <div
      onClick={() => setSeleccion(null)}
      className="w-full flex-1 p-6"
    >
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleGuardar();
          }}
          disabled={!huboCambios || guardando || !formacionId}
          className="rounded-xl bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark disabled:opacity-40"
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      ) : null}

      {marcadores.length === 0 ? (
        <p className="mb-4 text-sm text-neutral-500">
          Todavía no hay jugadoras cargadas para armar la formación.
        </p>
      ) : null}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-center">
        <div className="w-full lg:max-w-3xl">
          <div className="mb-3 flex justify-end">
            <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-500">
              <input
                type="checkbox"
                checked={mostrarNombres}
                onChange={(event) => setMostrarNombres(event.target.checked)}
                className="rounded border-stone-300"
              />
              Mostrar nombres
            </label>
          </div>

          <div className="mx-auto max-w-xs lg:hidden">
            <CanchaTactica
              marcadores={marcadores}
              orientacion="vertical"
              editable
              onMoverMarcador={handleMoverMarcador}
              onClickMarcador={handleClickMarcador}
              seleccionadoId={
                seleccion?.tipo === "titular" ? seleccion.id : undefined
              }
            />
          </div>
          <div className="hidden lg:block">
            <CanchaTactica
              marcadores={marcadores}
              orientacion="horizontal"
              editable
              onMoverMarcador={handleMoverMarcador}
              onClickMarcador={handleClickMarcador}
              seleccionadoId={
                seleccion?.tipo === "titular" ? seleccion.id : undefined
              }
            />
          </div>
        </div>

        <div className="lg:w-56 lg:shrink-0">
          <h2 className="mb-3 text-sm font-medium text-neutral-500">
            Suplentes
          </h2>
          <div className="rounded-xl border border-stone-300 bg-white p-4">
            {suplentes.length === 0 ? (
              <p className="text-sm text-neutral-500">No hay suplentes.</p>
            ) : (
              <div className="flex flex-wrap justify-center gap-4 lg:flex-col lg:items-start lg:gap-2">
                {suplentes.map((jugadora) => {
                  const seleccionado =
                    seleccion?.tipo === "suplente" && seleccion.id === jugadora.id;
                  return (
                    <button
                      key={jugadora.id}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleClickSuplente(jugadora.id);
                      }}
                      className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl p-1 hover:bg-stone-100 lg:flex-row lg:gap-2 ${
                        seleccionado ? "ring-2 ring-brand-navy" : ""
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 font-mono text-sm font-medium text-white">
                        {jugadora.dorsal ?? "-"}
                      </span>
                      {mostrarNombres ? (
                        <span className="text-xs font-medium text-neutral-900">
                          {jugadora.apellido}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
