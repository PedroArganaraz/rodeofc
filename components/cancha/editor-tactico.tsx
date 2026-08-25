"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Circle,
  Square,
  Trash2,
} from "lucide-react";
import {
  CanchaTactica,
  ConoForma,
  PelotaForma,
  type ColorMarcador,
  type Forma,
  type Marcador,
  type TipoForma,
} from "./cancha-tactica";

const SECUENCIA_NUMEROS = ["10", "11", "9", "7", "6", "2", "1"];
const SECUENCIA_NUMEROS_ARQUERAS = [...SECUENCIA_NUMEROS].reverse();

function proximoDisponible(
  enCancha: Set<string>,
  categoria?: string,
): string | null {
  const secuencia =
    categoria === "arqueras" ? SECUENCIA_NUMEROS_ARQUERAS : SECUENCIA_NUMEROS;
  return secuencia.find((numero) => !enCancha.has(numero)) ?? null;
}

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

type Historial = { marcadores: Marcador[]; formas: Forma[] };

export function EditorTactico({
  marcadores,
  onChange,
  formas = [],
  onChangeFormas,
  categoria,
  accionesExtra,
  accionesFinales,
  mostrarTrayectorias = false,
  marcadoresReferencia = [],
}: {
  marcadores: Marcador[];
  onChange: (marcadores: Marcador[]) => void;
  formas?: Forma[];
  onChangeFormas?: (formas: Forma[]) => void;
  categoria?: string;
  accionesExtra?: React.ReactNode;
  accionesFinales?: React.ReactNode;
  mostrarTrayectorias?: boolean;
  marcadoresReferencia?: Marcador[];
}) {
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);
  const [historialPasado, setHistorialPasado] = useState<Historial[]>([]);
  const [historialFuturo, setHistorialFuturo] = useState<Historial[]>([]);
  const [modoDibujo, setModoDibujo] = useState<{
    tipo: TipoForma;
    color: ColorMarcador;
  } | null>(null);

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

  const proximoPropio = proximoDisponible(numerosPropiosEnCancha, categoria);
  const proximoRival = proximoDisponible(numerosRivalesEnCancha, categoria);

  function aplicarCambio(cambio: { marcadores?: Marcador[]; formas?: Forma[] }) {
    setHistorialPasado((prev) => [...prev, { marcadores, formas }]);
    setHistorialFuturo([]);
    if (cambio.marcadores) onChange(cambio.marcadores);
    if (cambio.formas) onChangeFormas?.(cambio.formas);
  }

  function deshacer() {
    if (historialPasado.length === 0) return;
    const anterior = historialPasado[historialPasado.length - 1];
    setHistorialPasado((prev) => prev.slice(0, -1));
    setHistorialFuturo((prev) => [...prev, { marcadores, formas }]);
    onChange(anterior.marcadores);
    onChangeFormas?.(anterior.formas);
  }

  function rehacer() {
    if (historialFuturo.length === 0) return;
    const siguiente = historialFuturo[historialFuturo.length - 1];
    setHistorialFuturo((prev) => prev.slice(0, -1));
    setHistorialPasado((prev) => [...prev, { marcadores, formas }]);
    onChange(siguiente.marcadores);
    onChangeFormas?.(siguiente.formas);
  }

  function agregarJugador(numero: string, color: ColorMarcador) {
    const pos = posicionPorDefecto(marcadores.length);
    aplicarCambio({
      marcadores: [
        ...marcadores,
        { id: crearId(), x: pos.x, y: pos.y, numero, color, tipo: "jugador" },
      ],
    });
  }

  function agregarCono() {
    const pos = posicionPorDefecto(marcadores.length);
    aplicarCambio({
      marcadores: [
        ...marcadores,
        { id: crearId(), x: pos.x, y: pos.y, numero: "", color: "propio", tipo: "cono" },
      ],
    });
  }

  function agregarPelota() {
    const pos = posicionPorDefecto(marcadores.length);
    aplicarCambio({
      marcadores: [
        ...marcadores,
        { id: crearId(), x: pos.x, y: pos.y, numero: "", color: "propio", tipo: "pelota" },
      ],
    });
  }

  function handleMoverMarcador(id: string, x: number, y: number) {
    aplicarCambio({
      marcadores: marcadores.map((marcador) =>
        marcador.id === id ? { ...marcador, x, y } : marcador,
      ),
    });
  }

  function handleMoverForma(
    id: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) {
    aplicarCambio({
      formas: formas.map((forma) =>
        forma.id === id ? { ...forma, x1, y1, x2, y2 } : forma,
      ),
    });
  }

  function handleCrearForma(nueva: Omit<Forma, "id">) {
    aplicarCambio({ formas: [...formas, { id: crearId(), ...nueva }] });
    setSeleccionadoId(null);
  }

  function alternarHerramienta(tipo: TipoForma) {
    setModoDibujo((actual) =>
      actual && actual.tipo === tipo ? null : { tipo, color: "propio" },
    );
    setSeleccionadoId(null);
  }

  function handleClickMarcador(id: string) {
    setSeleccionadoId((actual) => (actual === id ? null : id));
  }

  function handleEliminarSeleccionado() {
    if (!seleccionadoId) return;
    if (formas.some((forma) => forma.id === seleccionadoId)) {
      aplicarCambio({ formas: formas.filter((forma) => forma.id !== seleccionadoId) });
    } else {
      aplicarCambio({
        marcadores: marcadores.filter((marcador) => marcador.id !== seleccionadoId),
      });
    }
    setSeleccionadoId(null);
  }

  function handleLimpiarCancha() {
    aplicarCambio({ marcadores: [], formas: [] });
    setSeleccionadoId(null);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const enCampoDeTexto =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (enCampoDeTexto) return;

      const ctrlOCmd = event.ctrlKey || event.metaKey;

      if (ctrlOCmd && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        deshacer();
        return;
      }

      if (ctrlOCmd && event.key.toLowerCase() === "y") {
        event.preventDefault();
        rehacer();
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        handleEliminarSeleccionado();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marcadores, formas, historialPasado, historialFuturo, seleccionadoId]);

  const herramientas: { tipo: TipoForma; icono: typeof ArrowUpRight }[] = [
    { tipo: "flecha", icono: ArrowUpRight },
    { tipo: "rectangulo", icono: Square },
    { tipo: "circulo", icono: Circle },
  ];

  return (
    <div
      onClick={() => setSeleccionadoId(null)}
      className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-center"
    >
      <div className="w-full lg:max-w-3xl">
        <div className="mx-auto max-w-xs lg:hidden">
          <CanchaTactica
            marcadores={marcadores}
            formas={formas}
            orientacion="vertical"
            editable
            onMoverMarcador={handleMoverMarcador}
            onMoverForma={handleMoverForma}
            onClickMarcador={handleClickMarcador}
            seleccionadoId={seleccionadoId ?? undefined}
            mostrarTrayectorias={mostrarTrayectorias}
            marcadoresReferencia={marcadoresReferencia}
            modoDibujo={modoDibujo}
            onCrearForma={handleCrearForma}
            onSalirModoDibujo={() => setModoDibujo(null)}
          />
        </div>
        <div className="hidden lg:block">
          <CanchaTactica
            marcadores={marcadores}
            formas={formas}
            orientacion="horizontal"
            editable
            onMoverMarcador={handleMoverMarcador}
            onMoverForma={handleMoverForma}
            onClickMarcador={handleClickMarcador}
            seleccionadoId={seleccionadoId ?? undefined}
            mostrarTrayectorias={mostrarTrayectorias}
            marcadoresReferencia={marcadoresReferencia}
            modoDibujo={modoDibujo}
            onCrearForma={handleCrearForma}
            onSalirModoDibujo={() => setModoDibujo(null)}
          />
        </div>
      </div>

      <div className="space-y-4 lg:w-56 lg:shrink-0">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={historialPasado.length === 0}
            onClick={deshacer}
            aria-label="Deshacer (Ctrl+Z)"
            title="Deshacer (Ctrl+Z)"
            className="flex flex-1 items-center justify-center rounded-xl border border-stone-300 bg-white py-2 text-neutral-900 hover:bg-stone-100 disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            disabled={historialFuturo.length === 0}
            onClick={rehacer}
            aria-label="Rehacer (Ctrl+Y)"
            title="Rehacer (Ctrl+Y)"
            className="flex flex-1 items-center justify-center rounded-xl border border-stone-300 bg-white py-2 text-neutral-900 hover:bg-stone-100 disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          disabled={marcadores.length === 0 && formas.length === 0}
          onClick={handleLimpiarCancha}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-stone-100 disabled:opacity-40"
        >
          Limpiar cancha
        </button>

        {accionesExtra}

        {seleccionadoId ? (
          <button
            type="button"
            onClick={handleEliminarSeleccionado}
            title="Eliminar (Supr)"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        ) : null}

        <div className="rounded-xl border border-stone-300 bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-500">
            Elementos
          </h3>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={proximoPropio === null}
              onClick={() => proximoPropio && agregarJugador(proximoPropio, "propio")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 font-mono text-sm font-medium text-white disabled:bg-stone-300 disabled:text-neutral-500"
            >
              {proximoPropio ?? "–"}
            </button>
            <button
              type="button"
              disabled={proximoRival === null}
              onClick={() => proximoRival && agregarJugador(proximoRival, "rival")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 font-mono text-sm font-medium text-white disabled:bg-stone-300 disabled:text-neutral-500"
            >
              {proximoRival ?? "–"}
            </button>
            <button
              type="button"
              onClick={agregarCono}
              aria-label="Agregar cono"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-stone-100"
            >
              <svg viewBox="-5 -5 10 10" className="h-9 w-9">
                <ConoForma />
              </svg>
            </button>
            <button
              type="button"
              onClick={agregarPelota}
              aria-label="Agregar pelota"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-stone-100"
            >
              <svg viewBox="-5 -5 10 10" className="h-9 w-9">
                <PelotaForma />
              </svg>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-stone-300 bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-500">Formas</h3>
          <div className="flex items-center justify-center gap-2">
            {herramientas.map(({ tipo, icono: Icono }) => {
              const activo = modoDibujo?.tipo === tipo;
              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => alternarHerramienta(tipo)}
                  aria-label={`Dibujar ${tipo}`}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-blue-500 hover:bg-stone-100 ${
                    activo ? "bg-stone-300" : ""
                  }`}
                >
                  <Icono className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>

        {accionesFinales}
      </div>
    </div>
  );
}
