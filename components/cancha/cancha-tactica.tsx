"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ColorMarcador,
  ElementoCancha,
  Forma,
  Marcador,
  TipoForma,
  TipoMarcador,
} from "./elementos";

export type {
  ColorMarcador,
  ElementoCancha,
  Forma,
  Marcador,
  TipoForma,
  TipoMarcador,
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
  const strokeWidth = 0.25;

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

type Arrastre =
  | { tipo: "marcador"; id: string }
  | { tipo: "forma-cuerpo"; id: string; origen: { x: number; y: number }; original: Forma }
  | { tipo: "forma-extremo"; id: string; extremo: 1 | 2; original: Forma }
  | {
      tipo: "dibujo";
      herramienta: TipoForma;
      color: ColorMarcador;
      origen: { x: number; y: number };
    };

export function CanchaTactica({
  marcadores,
  formas = [],
  orientacion,
  editable = false,
  onMoverMarcador,
  onMoverForma,
  onClickMarcador,
  seleccionadoId,
  variante = "completa",
  mostrarTrayectorias = false,
  marcadoresReferencia = [],
  modoDibujo = null,
  onCrearForma,
  onSalirModoDibujo,
}: {
  marcadores: Marcador[];
  formas?: Forma[];
  orientacion: Orientacion;
  editable?: boolean;
  onMoverMarcador?: (id: string, x: number, y: number) => void;
  onMoverForma?: (id: string, x1: number, y1: number, x2: number, y2: number) => void;
  onClickMarcador?: (id: string) => void;
  seleccionadoId?: string;
  variante?: "completa" | "mini";
  mostrarTrayectorias?: boolean;
  marcadoresReferencia?: Marcador[];
  modoDibujo?: { tipo: TipoForma; color: ColorMarcador } | null;
  onCrearForma?: (forma: Omit<Forma, "id">) => void;
  onSalirModoDibujo?: () => void;
}) {
  const esMini = variante === "mini";
  const svgRef = useRef<SVGSVGElement>(null);
  const [arrastre, setArrastre] = useState<Arrastre | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const estadoDragRef = useRef({ arrastre, dragPos });
  useEffect(() => {
    estadoDragRef.current = { arrastre, dragPos };
  }, [arrastre, dragPos]);

  const dragId = arrastre?.tipo === "marcador" ? arrastre.id : null;

  const width = orientacion === "vertical" ? 60 : 100;
  const height = orientacion === "vertical" ? 100 : 60;
  const radioJugador = orientacion === "horizontal" ? 2.1 : RADIO_MARCADOR;

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

  function radioToqueDe(marcador: Marcador) {
    const tipo = marcador.tipo ?? "jugador";
    const radioAnillo =
      tipo === "jugador" ? radioJugador + 1.2 : tipo === "pelota" ? 1.8 : 2;
    return radioAnillo + 1;
  }

  function marcadorMasCercano(clientX: number, clientY: number) {
    const punto = getPuntoDisplay(clientX, clientY);
    if (!punto) return null;

    const px = (punto.x / 100) * width;
    const py = (punto.y / 100) * height;

    let mejorId: string | null = null;
    let mejorDistancia = Infinity;

    for (const marcador of marcadores) {
      const disp = aDisplay(marcador.x, marcador.y, orientacion);
      const cx = (disp.x / 100) * width;
      const cy = (disp.y / 100) * height;
      const distancia = Math.hypot(px - cx, py - cy);
      if (distancia <= radioToqueDe(marcador) && distancia < mejorDistancia) {
        mejorDistancia = distancia;
        mejorId = marcador.id;
      }
    }

    return mejorId;
  }

  function handlePointerDown(
    event: React.PointerEvent<SVGGElement>,
    id: string,
  ) {
    if (!editable || modoDibujo) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const idElegido = marcadorMasCercano(event.clientX, event.clientY) ?? id;
    setArrastre({ tipo: "marcador", id: idElegido });
  }

  function handlePointerDownFormaCuerpo(
    event: React.PointerEvent<SVGElement>,
    forma: Forma,
  ) {
    if (!editable || modoDibujo) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const punto = getPuntoDisplay(event.clientX, event.clientY);
    if (!punto) return;
    setArrastre({ tipo: "forma-cuerpo", id: forma.id, origen: punto, original: forma });
  }

  function handlePointerDownExtremo(
    event: React.PointerEvent<SVGCircleElement>,
    forma: Forma,
    extremo: 1 | 2,
  ) {
    if (!editable || modoDibujo) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setArrastre({ tipo: "forma-extremo", id: forma.id, extremo, original: forma });
  }

  function handlePointerDownSvg(event: React.PointerEvent<SVGSVGElement>) {
    if (!editable || !modoDibujo) return;
    const punto = getPuntoDisplay(event.clientX, event.clientY);
    if (!punto) return;
    svgRef.current?.setPointerCapture(event.pointerId);
    setArrastre({
      tipo: "dibujo",
      herramienta: modoDibujo.tipo,
      color: modoDibujo.color,
      origen: punto,
    });
  }

  useEffect(() => {
    if (!arrastre) return;
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
      if (actual.arrastre && actual.dragPos) {
        const a = actual.arrastre;
        const canon = aCanonico(actual.dragPos.x, actual.dragPos.y, orientacion);

        if (a.tipo === "marcador") {
          onMoverMarcador?.(a.id, canon.x, canon.y);
        } else if (a.tipo === "forma-cuerpo") {
          const origenCanon = aCanonico(a.origen.x, a.origen.y, orientacion);
          const dx = canon.x - origenCanon.x;
          const dy = canon.y - origenCanon.y;
          onMoverForma?.(
            a.id,
            a.original.x1 + dx,
            a.original.y1 + dy,
            a.original.x2 + dx,
            a.original.y2 + dy,
          );
        } else if (a.tipo === "forma-extremo") {
          if (a.extremo === 1) {
            onMoverForma?.(a.id, canon.x, canon.y, a.original.x2, a.original.y2);
          } else {
            onMoverForma?.(a.id, a.original.x1, a.original.y1, canon.x, canon.y);
          }
        } else if (a.tipo === "dibujo") {
          const origenCanon = aCanonico(a.origen.x, a.origen.y, orientacion);
          onCrearForma?.({
            tipo: a.herramienta,
            color: a.color,
            x1: origenCanon.x,
            y1: origenCanon.y,
            x2: canon.x,
            y2: canon.y,
          });
          onSalirModoDibujo?.();
        }
      }
      setArrastre(null);
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
  }, [arrastre, getPuntoDisplay, onMoverMarcador, onMoverForma, onCrearForma, onSalirModoDibujo, orientacion]);

  function puntosFormaDisplay(forma: Forma) {
    if (arrastre?.tipo === "forma-cuerpo" && arrastre.id === forma.id && dragPos) {
      const d1 = aDisplay(arrastre.original.x1, arrastre.original.y1, orientacion);
      const d2 = aDisplay(arrastre.original.x2, arrastre.original.y2, orientacion);
      const dx = dragPos.x - arrastre.origen.x;
      const dy = dragPos.y - arrastre.origen.y;
      return {
        p1: { x: d1.x + dx, y: d1.y + dy },
        p2: { x: d2.x + dx, y: d2.y + dy },
      };
    }
    if (arrastre?.tipo === "forma-extremo" && arrastre.id === forma.id && dragPos) {
      const otro =
        arrastre.extremo === 1
          ? aDisplay(arrastre.original.x2, arrastre.original.y2, orientacion)
          : aDisplay(arrastre.original.x1, arrastre.original.y1, orientacion);
      return arrastre.extremo === 1
        ? { p1: dragPos, p2: otro }
        : { p1: otro, p2: dragPos };
    }
    return {
      p1: aDisplay(forma.x1, forma.y1, orientacion),
      p2: aDisplay(forma.x2, forma.y2, orientacion),
    };
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      onPointerDown={handlePointerDownSvg}
      className={`w-full select-none rounded-xl bg-field-green ${
        orientacion === "vertical" ? "aspect-[60/100]" : "aspect-[100/60]"
      } ${modoDibujo ? "touch-none cursor-crosshair" : ""}`}
    >
      <LineasCancha width={width} height={height} orientacion={orientacion} />

      {mostrarTrayectorias ? (
        <g>
          {marcadores.map((marcador) => {
            const referencia = marcadoresReferencia.find(
              (m) => m.id === marcador.id,
            );
            if (!referencia) return null;

            const enArrastre = dragId === marcador.id && dragPos;
            const disp = enArrastre
              ? dragPos
              : aDisplay(marcador.x, marcador.y, orientacion);
            const dispReferencia = aDisplay(
              referencia.x,
              referencia.y,
              orientacion,
            );

            if (
              Math.abs(disp.x - dispReferencia.x) < 0.05 &&
              Math.abs(disp.y - dispReferencia.y) < 0.05
            ) {
              return null;
            }

            return (
              <line
                key={marcador.id}
                x1={(dispReferencia.x / 100) * width}
                y1={(dispReferencia.y / 100) * height}
                x2={(disp.x / 100) * width}
                y2={(disp.y / 100) * height}
                className="stroke-stone-300"
                strokeWidth={0.3}
                strokeDasharray="1.2 1"
              />
            );
          })}
        </g>
      ) : null}

      {formas.map((forma) => {
        const { p1, p2 } = puntosFormaDisplay(forma);
        const x1 = (p1.x / 100) * width;
        const y1 = (p1.y / 100) * height;
        const x2 = (p2.x / 100) * width;
        const y2 = (p2.y / 100) * height;
        const seleccionada = seleccionadoId === forma.id;
        const colorStroke = forma.color === "propio" ? "stroke-blue-500" : "stroke-red-500";
        const colorFill = forma.color === "propio" ? "fill-blue-500/30" : "fill-red-500/30";
        const colorSolido = forma.color === "propio" ? "fill-blue-500" : "fill-red-500";

        const cuerpoProps = {
          onPointerDown: (event: React.PointerEvent<SVGElement>) =>
            handlePointerDownFormaCuerpo(event, forma),
          onClick: (event: React.MouseEvent) => {
            event.stopPropagation();
            onClickMarcador?.(forma.id);
          },
          style: editable ? { cursor: "grab" } : undefined,
        };

        return (
          <g key={forma.id}>
            {forma.tipo === "flecha" ? (
              (() => {
                const angulo = Math.atan2(y2 - y1, x2 - x1);
                const largo = 1.7;
                const ancho = 0.85;
                const bx = x2 - largo * Math.cos(angulo);
                const by = y2 - largo * Math.sin(angulo);
                const p1x = bx - ancho * Math.sin(angulo);
                const p1y = by + ancho * Math.cos(angulo);
                const p2x = bx + ancho * Math.sin(angulo);
                const p2y = by - ancho * Math.cos(angulo);
                return (
                  <>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={bx}
                      y2={by}
                      className={colorStroke}
                      strokeWidth={0.35}
                      {...cuerpoProps}
                    />
                    <polygon
                      points={`${x2},${y2} ${p1x},${p1y} ${p2x},${p2y}`}
                      className={colorSolido}
                      {...cuerpoProps}
                    />
                  </>
                );
              })()
            ) : forma.tipo === "rectangulo" ? (
              <rect
                x={Math.min(x1, x2)}
                y={Math.min(y1, y2)}
                width={Math.abs(x2 - x1)}
                height={Math.abs(y2 - y1)}
                className={`${colorFill} ${colorStroke}`}
                strokeWidth={0.3}
                {...cuerpoProps}
              />
            ) : (
              <ellipse
                cx={(x1 + x2) / 2}
                cy={(y1 + y2) / 2}
                rx={Math.abs(x2 - x1) / 2}
                ry={Math.abs(y2 - y1) / 2}
                className={`${colorFill} ${colorStroke}`}
                strokeWidth={0.3}
                {...cuerpoProps}
              />
            )}

            {editable && seleccionada ? (
              <>
                <circle
                  cx={x1}
                  cy={y1}
                  r={1.6}
                  className="touch-none fill-white stroke-neutral-900"
                  strokeWidth={0.3}
                  style={{ pointerEvents: "all" }}
                  onPointerDown={(event) => handlePointerDownExtremo(event, forma, 1)}
                />
                <circle
                  cx={x2}
                  cy={y2}
                  r={1.6}
                  className="touch-none fill-white stroke-neutral-900"
                  strokeWidth={0.3}
                  style={{ pointerEvents: "all" }}
                  onPointerDown={(event) => handlePointerDownExtremo(event, forma, 2)}
                />
              </>
            ) : null}
          </g>
        );
      })}

      {arrastre?.tipo === "dibujo" && dragPos
        ? (() => {
            const p1 = arrastre.origen;
            const p2 = dragPos;
            const x1 = (p1.x / 100) * width;
            const y1 = (p1.y / 100) * height;
            const x2 = (p2.x / 100) * width;
            const y2 = (p2.y / 100) * height;
            const colorStroke =
              arrastre.color === "propio" ? "stroke-blue-500" : "stroke-red-500";
            const colorFill =
              arrastre.color === "propio" ? "fill-blue-500/30" : "fill-red-500/30";

            if (arrastre.herramienta === "flecha") {
              return (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className={colorStroke}
                  strokeWidth={0.35}
                  strokeDasharray="1.5 1"
                />
              );
            }
            if (arrastre.herramienta === "rectangulo") {
              return (
                <rect
                  x={Math.min(x1, x2)}
                  y={Math.min(y1, y2)}
                  width={Math.abs(x2 - x1)}
                  height={Math.abs(y2 - y1)}
                  className={`${colorFill} ${colorStroke}`}
                  strokeWidth={0.3}
                  strokeDasharray="1.5 1"
                />
              );
            }
            return (
              <ellipse
                cx={(x1 + x2) / 2}
                cy={(y1 + y2) / 2}
                rx={Math.abs(x2 - x1) / 2}
                ry={Math.abs(y2 - y1) / 2}
                className={`${colorFill} ${colorStroke}`}
                strokeWidth={0.3}
                strokeDasharray="1.5 1"
              />
            );
          })()
        : null}

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
        const radioToque = radioToqueDe(marcador);

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
                {esMini ? null : (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={radioJugador}
                    className="fill-white font-mono"
                  >
                    {marcador.numero}
                  </text>
                )}
              </>
            )}

            {!esMini && tipo === "jugador" && marcador.etiqueta ? (
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
