"use client";

import { useCallback, useRef, useState } from "react";

export type ColorMarcador = "propio" | "rival";

export type Marcador = {
  id: string;
  x: number;
  y: number;
  numero: string;
  color: ColorMarcador;
  etiqueta?: string;
};

export type Orientacion = "vertical" | "horizontal";

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
        {/* área grande */}
        <rect x={(width - 40) / 2} y={MARGEN} width={40} height={16} />
        <rect x={(width - 40) / 2} y={height - MARGEN - 16} width={40} height={16} />
        {/* área chica */}
        <rect x={(width - 20) / 2} y={MARGEN} width={20} height={6} />
        <rect x={(width - 20) / 2} y={height - MARGEN - 6} width={20} height={6} />
        {/* punto penal */}
        <circle cx={width / 2} cy={MARGEN + 11} r={0.6} className="fill-white/80" />
        <circle cx={width / 2} cy={height - MARGEN - 11} r={0.6} className="fill-white/80" />
        {/* arcos */}
        <rect x={(width - 8) / 2} y={0} width={8} height={MARGEN} />
        <rect x={(width - 8) / 2} y={height - MARGEN} width={8} height={MARGEN} />
        {/* banderines de córner */}
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
      {/* área grande */}
      <rect x={MARGEN} y={(height - 40) / 2} width={16} height={40} />
      <rect x={width - MARGEN - 16} y={(height - 40) / 2} width={16} height={40} />
      {/* área chica */}
      <rect x={MARGEN} y={(height - 20) / 2} width={6} height={20} />
      <rect x={width - MARGEN - 6} y={(height - 20) / 2} width={6} height={20} />
      {/* punto penal */}
      <circle cx={MARGEN + 11} cy={height / 2} r={0.6} className="fill-white/80" />
      <circle cx={width - MARGEN - 11} cy={height / 2} r={0.6} className="fill-white/80" />
      {/* arcos */}
      <rect x={0} y={(height - 8) / 2} width={MARGEN} height={8} />
      <rect x={width - MARGEN} y={(height - 8) / 2} width={MARGEN} height={8} />
      {/* banderines de córner */}
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

  const width = orientacion === "vertical" ? 60 : 100;
  const height = orientacion === "vertical" ? 100 : 60;

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

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!dragId) return;
    const punto = getPuntoDisplay(event.clientX, event.clientY);
    if (punto) setDragPos(punto);
  }

  function handlePointerUp() {
    if (dragId && dragPos) {
      const canonico = aCanonico(dragPos.x, dragPos.y, orientacion);
      onMoverMarcador?.(dragId, canonico.x, canonico.y);
    }
    setDragId(null);
    setDragPos(null);
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full touch-none select-none rounded-xl bg-field-green ${
        orientacion === "vertical" ? "aspect-[60/100]" : "aspect-[100/60]"
      }`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
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

        return (
          <g
            key={marcador.id}
            transform={`translate(${cx}, ${cy})`}
            onPointerDown={(event) => handlePointerDown(event, marcador.id)}
            onClick={() => onClickMarcador?.(marcador.id)}
            className={editable ? "cursor-grab" : undefined}
          >
            {seleccionadoId === marcador.id ? (
              <circle
                r={RADIO_MARCADOR + 1.2}
                fill="none"
                className="stroke-white"
                strokeWidth={0.8}
              />
            ) : null}
            <circle r={RADIO_MARCADOR} className={colorClase} />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={RADIO_MARCADOR}
              className="fill-white font-mono"
            >
              {marcador.numero}
            </text>
            {marcador.etiqueta ? (
              <text
                y={RADIO_MARCADOR + 3}
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
