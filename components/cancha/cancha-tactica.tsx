"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ColorMarcador = "propio" | "rival";
export type TipoMarcador = "jugador" | "pelota" | "cono";

export type Marcador = {
  id: string;
  x: number;
  y: number;
  numero: string;
  color: ColorMarcador;
  etiqueta?: string;
  tipo?: TipoMarcador;
};

export type Orientacion = "vertical" | "horizontal";

export function ConoForma() {
  return (
    <>
      <ellipse
        cx="0"
        cy="1.2"
        rx="3"
        ry="0.7"
        className="fill-yellow-400 stroke-neutral-900"
        strokeWidth={0.25}
      />
      <path
        d="M -3,1.2 L -1.7,-0.9 L 1.7,-0.9 L 3,1.2 Z"
        className="fill-yellow-400 stroke-neutral-900"
        strokeWidth={0.25}
        strokeLinejoin="round"
      />
      <ellipse cx="0" cy="-0.9" rx="1.7" ry="0.35" className="fill-yellow-300" />
    </>
  );
}

const PENTAGONO_INTERNO: [number, number][] = [
  [0, -0.9],
  [0.86, -0.28],
  [0.53, 0.73],
  [-0.53, 0.73],
  [-0.86, -0.28],
];

const PENTAGONO_EXTERNO: [number, number][] = [
  [0, -2],
  [1.9, -0.62],
  [1.18, 1.62],
  [-1.18, 1.62],
  [-1.9, -0.62],
];

export function PelotaForma() {
  return (
    <>
      <circle
        r={2.1}
        className="fill-white stroke-neutral-900"
        strokeWidth={0.3}
      />
      {PENTAGONO_INTERNO.map(([x1, y1], i) => {
        const [x2, y2] = PENTAGONO_EXTERNO[i];
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className="stroke-neutral-900"
            strokeWidth={0.22}
          />
        );
      })}
      <polygon
        points={PENTAGONO_INTERNO.map(([x, y]) => `${x},${y}`).join(" ")}
        className="fill-neutral-900"
      />
    </>
  );
}

const RADIO_MARCADOR = 3;
const MARGEN = 2;

function aDisplay(x: number, y: number, orientacion: Orientacion) {
  return orientacion === "vertical" ? { x, y } : { x: 100 - y, y: x };
}

function aCanonico(xDisp: number, yDisp: number, orientacion: Orientacion) {
  return orientacion === "vertical"
    ? { x: xDisp, y: yDisp }
    : { x: yDisp, y: 100 - xDisp };
}

function LineasCancha({
  width,
  height,
  orientacion,
}: {
  width: number;
  height: number;
  orientacion: Orientacion;
}) {
  const stroke = "stroke-white/80";
  const strokeWidth = 0.5;

  if (orientacion === "vertical") {
    return (
      <g className={stroke} fill="none" strokeWidth={strokeWidth}>
        <rect x={MARGEN} y={MARGEN} width={width - MARGEN * 2} height={height - MARGEN * 2} />
        <line x1={MARGEN} y1={height / 2} x2={width - MARGEN} y2={height / 2} />
        <circle cx={width / 2} cy={height / 2} r={9} />
        <circle cx={width / 2} cy={height / 2} r={0.6} className="fill-white/80" />
        <rect x={(width - 40) / 2} y={MARGEN} width={40} height={16} />
        <rect x={(width - 40) / 2} y={height - MARGEN - 16} width={40} height={16} />
        <rect x={(width - 20) / 2} y={MARGEN} width={20} height={6} />
        <rect x={(width - 20) / 2} y={height - MARGEN - 6} width={20} height={6} />
        <circle cx={width / 2} cy={MARGEN + 11} r={0.6} className="fill-white/80" />
        <circle cx={width / 2} cy={height - MARGEN - 11} r={0.6} className="fill-white/80" />
        <rect x={(width - 8) / 2} y={0} width={8} height={MARGEN} />
        <rect x={(width - 8) / 2} y={height - MARGEN} width={8} height={MARGEN} />
        <path d={`M ${MARGEN} ${MARGEN + 3} A 3 3 0 0 1 ${MARGEN + 3} ${MARGEN}`} />
        <path d={`M ${width - MARGEN - 3} ${MARGEN} A 3 3 0 0 1 ${width - MARGEN} ${MARGEN + 3}`} />
        <path d={`M ${width - MARGEN} ${height - MARGEN - 3} A 3 3 0 0 1 ${width - MARGEN - 3} ${height - MARGEN}`} />
        <path d={`M ${MARGEN + 3} ${height - MARGEN} A 3 3 0 0 1 ${MARGEN} ${height - MARGEN - 3}`} />
      </g>
    );
  }

  return (
    <g className={stroke} fill="none" strokeWidth={strokeWidth}>
      <rect x={MARGEN} y={MARGEN} width={width - MARGEN * 2} height={height - MARGEN * 2} />
      <line x1={width / 2} y1={MARGEN} x2={width / 2} y2={height - MARGEN} />
      <circle cx={width / 2} cy={height / 2} r={9} />
      <circle cx={width / 2} cy={height / 2} r={0.6} className="fill-white/80" />
      <rect x={MARGEN} y={(height - 40) / 2} width={16} height={40} />
      <rect x={width - MARGEN - 16} y={(height - 40) / 2} width={16} height={40} />
      <rect x={MARGEN} y={(height - 20) / 2} width={6} height={20} />
      <rect x={width - MARGEN - 6} y={(height - 20) / 2} width={6} height={20} />
      <circle cx={MARGEN + 11} cy={height / 2} r={0.6} className="fill-white/80" />
      <circle cx={width - MARGEN - 11} cy={height / 2} r={0.6} className="fill-white/80" />
      <rect x={0} y={(height - 8) / 2} width={MARGEN} height={8} />
      <rect x={width - MARGEN} y={(height - 8) / 2} width={MARGEN} height={8} />
      <path d={`M ${MARGEN + 3} ${MARGEN} A 3 3 0 0 1 ${MARGEN} ${MARGEN + 3}`} />
      <path d={`M ${width - MARGEN} ${MARGEN + 3} A 3 3 0 0 1 ${width - MARGEN - 3} ${MARGEN}`} />
      <path d={`M ${width - MARGEN - 3} ${height - MARGEN} A 3 3 0 0 1 ${width - MARGEN} ${height - MARGEN - 3}`} />
      <path d={`M ${MARGEN} ${height - MARGEN - 3} A 3 3 0 0 1 ${MARGEN + 3} ${height - MARGEN}`} />
    </g>
  );
}

export function CanchaTactica({
  marcadores,
  orientacion,
  editable = false,
  onMoverMarcador,
  onClickMarcador,
  seleccionadoId,
}: {
  marcadores: Marcador[];
  orientacion: Orientacion;
  editable?: boolean;
  onMoverMarcador?: (id: string, x: number, y: number) => void;
  onClickMarcador?: (id: string) => void;
  seleccionadoId?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const estadoDragRef = useRef({ dragId, dragPos });
  useEffect(() => {
    estadoDragRef.current = { dragId, dragPos };
  }, [dragId, dragPos]);

  const width = orientacion === "vertical" ? 60 : 100;
  const height = orientacion === "vertical" ? 100 : 60;
  const radioJugador = orientacion === "horizontal" ? 2.4 : RADIO_MARCADOR;

  const getPuntoDisplay = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      const xDisp = ((clientX - rect.left) / rect.width) * 100;
      const yDisp = ((clientY - rect.top) / rect.height) * 100;
      return {
        x: Math.min(100, Math.max(0, xDisp)),
        y: Math.min(100, Math.max(0, yDisp)),
      };
    },
    [],
  );

  function handlePointerDown(
    event: React.PointerEvent<SVGGElement>,
    id: string,
  ) {
    if (!editable) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragId(id);
  }

  useEffect(() => {
    if (!dragId) return;
    const svg = svgRef.current;
    if (!svg) return;

    let finalizado = false;

    function mover(clientX: number, clientY: number) {
      const punto = getPuntoDisplay(clientX, clientY);
      if (punto) setDragPos(punto);
    }

    function finalizar() {
      if (finalizado) return;
      finalizado = true;
      const actual = estadoDragRef.current;
      if (actual.dragId && actual.dragPos) {
        const canonico = aCanonico(actual.dragPos.x, actual.dragPos.y, orientacion);
        onMoverMarcador?.(actual.dragId, canonico.x, canonico.y);
      }
      setDragId(null);
      setDragPos(null);
    }

    function onPointerMoveNativo(event: PointerEvent) {
      event.preventDefault();
      mover(event.clientX, event.clientY);
    }

    function onPointerUpNativo(event: PointerEvent) {
      event.preventDefault();
      finalizar();
    }

    function onTouchMoveNativo(event: TouchEvent) {
      event.preventDefault();
      const touch = event.touches[0];
      if (touch) mover(touch.clientX, touch.clientY);
    }

    function onTouchEndNativo(event: TouchEvent) {
      event.preventDefault();
      finalizar();
    }

    svg.addEventListener("pointermove", onPointerMoveNativo, { passive: false });
    svg.addEventListener("pointerup", onPointerUpNativo, { passive: false });
    svg.addEventListener("pointercancel", onPointerUpNativo, { passive: false });
    svg.addEventListener("pointerleave", onPointerUpNativo, { passive: false });
    svg.addEventListener("touchmove", onTouchMoveNativo, { passive: false });
    svg.addEventListener("touchend", onTouchEndNativo, { passive: false });
    svg.addEventListener("touchcancel", onTouchEndNativo, { passive: false });

    return () => {
      svg.removeEventListener("pointermove", onPointerMoveNativo);
      svg.removeEventListener("pointerup", onPointerUpNativo);
      svg.removeEventListener("pointercancel", onPointerUpNativo);
      svg.removeEventListener("pointerleave", onPointerUpNativo);
      svg.removeEventListener("touchmove", onTouchMoveNativo);
      svg.removeEventListener("touchend", onTouchEndNativo);
      svg.removeEventListener("touchcancel", onTouchEndNativo);
    };
  }, [dragId, getPuntoDisplay, onMoverMarcador, orientacion]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full select-none rounded-xl bg-field-green ${
        orientacion === "vertical" ? "aspect-[60/100]" : "aspect-[100/60]"
      }`}
    >
      <LineasCancha width={width} height={height} orientacion={orientacion} />

      {marcadores.map((marcador) => {
        const enArrastre = dragId === marcador.id && dragPos;
        const disp = enArrastre
          ? dragPos
          : aDisplay(marcador.x, marcador.y, orientacion);
        const cx = (disp.x / 100) * width;
        const cy = (disp.y / 100) * height;
        const colorClase =
          marcador.color === "propio" ? "fill-blue-500" : "fill-red-500";
        const tipo = marcador.tipo ?? "jugador";
        const radioAnillo =
          tipo === "jugador" ? radioJugador + 1.2 : tipo === "pelota" ? 1.8 : 2;
        const radioToque = radioAnillo + 2.5;

        return (
          <g
            key={marcador.id}
            transform={`translate(${cx}, ${cy})`}
            onPointerDown={(event) => handlePointerDown(event, marcador.id)}
            onClick={(event) => {
              event.stopPropagation();
              onClickMarcador?.(marcador.id);
            }}
            className={editable ? "cursor-grab" : undefined}
          >
            {editable ? (
              <circle
                r={radioToque}
                fill="transparent"
                className="touch-none"
                style={{ pointerEvents: "all" }}
              />
            ) : null}

            {seleccionadoId === marcador.id ? (
              <circle
                r={radioAnillo}
                fill="none"
                className="stroke-white"
                strokeWidth={0.4}
              />
            ) : null}

            {tipo === "pelota" ? (
              <g transform="scale(0.55)">
                <PelotaForma />
              </g>
            ) : tipo === "cono" ? (
              <g transform="scale(0.45)">
                <ConoForma />
              </g>
            ) : (
              <>
                <circle r={radioJugador} className={colorClase} />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={radioJugador}
                  className="fill-white font-mono"
                >
                  {marcador.numero}
                </text>
              </>
            )}

            {tipo === "jugador" && marcador.etiqueta ? (
              <text
                y={radioJugador + 3}
                textAnchor="middle"
                fontSize={2.6}
                className="fill-white"
              >
                {marcador.etiqueta}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
