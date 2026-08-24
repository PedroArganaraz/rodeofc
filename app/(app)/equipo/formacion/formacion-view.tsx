"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CanchaTactica, type Marcador } from "@/components/cancha/cancha-tactica";
import {
  intercambiarPosiciones,
  moverJugadora,
  reemplazarJugadora,
} from "./actions";
import type { Tables } from "@/types/database.types";

export function FormacionView({
  formacionId,
  marcadoresIniciales,
  suplentes,
}: {
  formacionId: string | null;
  marcadoresIniciales: Marcador[];
  suplentes: Tables<"jugadoras">[];
}) {
  const [overrides, setOverrides] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [mostrarNombres, setMostrarNombres] = useState(true);
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const marcadores: Marcador[] = marcadoresIniciales.map((marcador) => ({
    ...marcador,
    ...(overrides[marcador.id] ?? {}),
    etiqueta: mostrarNombres ? marcador.etiqueta : undefined,
  }));

  function handleMoverMarcador(id: string, x: number, y: number) {
    if (!formacionId) return;

    setOverrides((prev) => ({ ...prev, [id]: { x, y } }));

    moverJugadora(formacionId, id, x, y).catch((err) => {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
    });
  }

  async function handleClickMarcador(id: string) {
    if (!seleccionadoId) {
      setSeleccionadoId(id);
      return;
    }

    if (seleccionadoId === id) {
      setSeleccionadoId(null);
      return;
    }

    if (!formacionId) {
      setSeleccionadoId(null);
      return;
    }

    const titularAId = seleccionadoId;
    setSeleccionadoId(null);
    setError(null);

    try {
      await intercambiarPosiciones(formacionId, titularAId, id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
    }
  }

  async function handleClickSuplente(suplenteId: string) {
    if (!formacionId || !seleccionadoId) return;

    const titularId = seleccionadoId;
    setSeleccionadoId(null);
    setError(null);

    try {
      await reemplazarJugadora(formacionId, titularId, suplenteId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
    }
  }

  return (
    <div
      onClick={() => setSeleccionadoId(null)}
      className="w-full flex-1 p-6"
    >
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
              seleccionadoId={seleccionadoId ?? undefined}
            />
          </div>
          <div className="hidden lg:block">
            <CanchaTactica
              marcadores={marcadores}
              orientacion="horizontal"
              editable
              onMoverMarcador={handleMoverMarcador}
              onClickMarcador={handleClickMarcador}
              seleccionadoId={seleccionadoId ?? undefined}
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
                {suplentes.map((jugadora) => (
                  <button
                    key={jugadora.id}
                    type="button"
                    disabled={!seleccionadoId}
                    onClick={() => handleClickSuplente(jugadora.id)}
                    className={`flex flex-col items-center gap-1 rounded-xl p-1 lg:flex-row lg:gap-2 ${
                      seleccionadoId
                        ? "cursor-pointer hover:bg-stone-100"
                        : "cursor-default"
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
