"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  CanchaTactica,
  ConoForma,
  PelotaForma,
  type ColorMarcador,
  type Marcador,
} from "./cancha-tactica";

const NUMEROS = ["1", "2", "6", "7", "9", "10", "11"];

function crearId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function posicionPorDefecto(indice: number) {
  const columnas = 4;
  const paso = 10;
  const col = indice % columnas;
  const fila = Math.floor(indice / columnas) % columnas;
  return { x: 30 + col * paso, y: 40 + fila * paso };
}

export function EditorTactico({
  marcadores,
  onChange,
}: {
  marcadores: Marcador[];
  onChange: (marcadores: Marcador[]) => void;
}) {
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);

  const numerosPropiosEnCancha = new Set(
    marcadores
      .filter((m) => (m.tipo ?? "jugador") === "jugador" && m.color === "propio")
      .map((m) => m.numero),
  );
  const numerosRivalesEnCancha = new Set(
    marcadores
      .filter((m) => (m.tipo ?? "jugador") === "jugador" && m.color === "rival")
      .map((m) => m.numero),
  );

  function agregarJugador(numero: string, color: ColorMarcador) {
    const pos = posicionPorDefecto(marcadores.length);
    onChange([
      ...marcadores,
      { id: crearId(), x: pos.x, y: pos.y, numero, color, tipo: "jugador" },
    ]);
  }

  function agregarCono() {
    const pos = posicionPorDefecto(marcadores.length);
    onChange([
      ...marcadores,
      { id: crearId(), x: pos.x, y: pos.y, numero: "", color: "propio", tipo: "cono" },
    ]);
  }

  function agregarPelota() {
    const pos = posicionPorDefecto(marcadores.length);
    onChange([
      ...marcadores,
      { id: crearId(), x: pos.x, y: pos.y, numero: "", color: "propio", tipo: "pelota" },
    ]);
  }

  function handleMoverMarcador(id: string, x: number, y: number) {
    onChange(
      marcadores.map((marcador) =>
        marcador.id === id ? { ...marcador, x, y } : marcador,
      ),
    );
  }

  function handleClickMarcador(id: string) {
    setSeleccionadoId((actual) => (actual === id ? null : id));
  }

  function handleEliminarSeleccionado() {
    if (!seleccionadoId) return;
    onChange(marcadores.filter((marcador) => marcador.id !== seleccionadoId));
    setSeleccionadoId(null);
  }

  function handleLimpiarCancha() {
    onChange([]);
    setSeleccionadoId(null);
  }

  return (
    <div
      onClick={() => setSeleccionadoId(null)}
      className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-center"
    >
      <div className="w-full lg:max-w-3xl">
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

      <div className="space-y-4 lg:w-56 lg:shrink-0">
        <button
          type="button"
          disabled={marcadores.length === 0}
          onClick={handleLimpiarCancha}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-stone-100 disabled:opacity-40"
        >
          Limpiar cancha
        </button>

        {seleccionadoId ? (
          <button
            type="button"
            onClick={handleEliminarSeleccionado}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar elemento seleccionado
          </button>
        ) : null}

        <div className="rounded-xl border border-stone-300 bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-500">
            Jugadores propios
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {NUMEROS.map((numero) => (
              <button
                key={numero}
                type="button"
                disabled={numerosPropiosEnCancha.has(numero)}
                onClick={() => agregarJugador(numero, "propio")}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 font-mono text-sm font-medium text-white disabled:opacity-30"
              >
                {numero}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-stone-300 bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-500">
            Jugadores rivales
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {NUMEROS.map((numero) => (
              <button
                key={numero}
                type="button"
                disabled={numerosRivalesEnCancha.has(numero)}
                onClick={() => agregarJugador(numero, "rival")}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 font-mono text-sm font-medium text-white disabled:opacity-30"
              >
                {numero}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-stone-300 bg-white p-4">
          <button
            type="button"
            onClick={agregarCono}
            aria-label="Agregar cono"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full hover:bg-stone-100"
          >
            <svg viewBox="-5 -5 10 10" className="h-10 w-10">
              <ConoForma />
            </svg>
          </button>
          <button
            type="button"
            onClick={agregarPelota}
            aria-label="Agregar pelota"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full hover:bg-stone-100"
          >
            <svg viewBox="-5 -5 10 10" className="h-10 w-10">
              <PelotaForma />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
