"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { CanchaTactica, type Forma, type Marcador } from "./cancha-tactica";

const DURACION_BASE_MS = 1200;

type Paso = {
  id: string;
  nombre: string | null;
  marcadores: Marcador[];
  formas: Forma[];
};

function interpolarMarcadores(
  origen: Paso,
  destino: Paso,
  t: number,
): Marcador[] {
  const mapaOrigen = new Map(origen.marcadores.map((m) => [m.id, m]));

  return destino.marcadores.map((marcador) => {
    const anterior = mapaOrigen.get(marcador.id);
    if (!anterior) return marcador;

    return {
      ...marcador,
      x: anterior.x + (marcador.x - anterior.x) * t,
      y: anterior.y + (marcador.y - anterior.y) * t,
    };
  });
}

function interpolarFormas(origen: Paso, destino: Paso, t: number): Forma[] {
  const mapaOrigen = new Map(origen.formas.map((f) => [f.id, f]));

  return destino.formas.map((forma) => {
    const anterior = mapaOrigen.get(forma.id);
    if (!anterior) return forma;

    return {
      ...forma,
      x1: anterior.x1 + (forma.x1 - anterior.x1) * t,
      y1: anterior.y1 + (forma.y1 - anterior.y1) * t,
      x2: anterior.x2 + (forma.x2 - anterior.x2) * t,
      y2: anterior.y2 + (forma.y2 - anterior.y2) * t,
    };
  });
}

export function ReproductorEjercicio({
  pasos,
  autoplayInicial = true,
}: {
  pasos: Paso[];
  autoplayInicial?: boolean;
}) {
  const [pasoIndex, setPasoIndex] = useState(0);
  const [progreso, setProgreso] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(
    autoplayInicial && pasos.length > 1,
  );

  const hayPasoSiguiente = pasoIndex < pasos.length - 1;

  useEffect(() => {
    if (!reproduciendo || !hayPasoSiguiente) return;

    let animId: number;
    let inicio: number | null = null;
    const duracion = DURACION_BASE_MS;
    const progresoInicial = progreso;

    function tick(timestamp: number) {
      if (inicio === null) inicio = timestamp - progresoInicial * duracion;
      const t = Math.min(1, (timestamp - inicio) / duracion);
      setProgreso(t);

      if (t < 1) {
        animId = requestAnimationFrame(tick);
      } else {
        const siguienteIndice = pasoIndex + 1;
        setPasoIndex(siguienteIndice);
        setProgreso(0);
        if (siguienteIndice >= pasos.length - 1) {
          setReproduciendo(false);
        }
      }
    }

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reproduciendo, pasoIndex, hayPasoSiguiente]);

  function handlePlayPausa() {
    if (!hayPasoSiguiente) return;
    setReproduciendo((valor) => !valor);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code !== "Space") return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "BUTTON") return;
      event.preventDefault();
      handlePlayPausa();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hayPasoSiguiente]);

  function handleReiniciar() {
    setPasoIndex(0);
    setProgreso(0);
    setReproduciendo(pasos.length > 1);
  }

  if (pasos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-neutral-500">
        Este ejercicio todavía no tiene pasos cargados.
      </p>
    );
  }

  const indiceMostrado =
    progreso > 0 && hayPasoSiguiente ? pasoIndex + 1 : pasoIndex;
  const pasoMostrado = pasos[indiceMostrado];

  const marcadoresMostrados =
    progreso > 0 && hayPasoSiguiente
      ? interpolarMarcadores(pasos[pasoIndex], pasos[pasoIndex + 1], progreso)
      : pasoMostrado.marcadores;

  const formasMostradas =
    progreso > 0 && hayPasoSiguiente
      ? interpolarFormas(pasos[pasoIndex], pasos[pasoIndex + 1], progreso)
      : pasoMostrado.formas;

  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-xs lg:hidden">
        <CanchaTactica
          marcadores={marcadoresMostrados}
          formas={formasMostradas}
          orientacion="vertical"
        />
      </div>
      <div className="hidden lg:block">
        <CanchaTactica
          marcadores={marcadoresMostrados}
          formas={formasMostradas}
          orientacion="horizontal"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-neutral-500">
          {pasoMostrado.nombre || `Paso ${indiceMostrado + 1} de ${pasos.length}`}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReiniciar}
            aria-label="Reiniciar"
            className="rounded-full p-2 text-neutral-500 hover:bg-stone-300 hover:text-neutral-900"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handlePlayPausa}
            disabled={!hayPasoSiguiente}
            aria-label={reproduciendo ? "Pausar" : "Reproducir"}
            className="rounded-full bg-brand-navy p-2 text-white hover:bg-brand-navy-dark disabled:opacity-40"
          >
            {reproduciendo ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
