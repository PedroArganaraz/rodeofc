"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { CanchaTactica, type Forma, type Marcador } from "@/components/cancha/cancha-tactica";
import { ModalReproducirEntrenamiento } from "@/components/entrenamientos/modal-reproducir-entrenamiento";
import { obtenerEjerciciosConPasos } from "./actions";

const INTERVALO_MS = 1500;

type Paso = {
  id: string;
  nombre: string | null;
  marcadores: Marcador[];
  formas: Forma[];
};

type EjercicioConPasos = {
  id: string;
  titulo: string;
  pasos: Paso[];
};

type Entrenamiento = {
  id: string;
  titulo: string;
  cantidadEjercicios: number;
  miniaturas: Marcador[][];
};

function TarjetaEntrenamiento({
  entrenamiento,
  onReproducir,
  cargando,
}: {
  entrenamiento: Entrenamiento;
  onReproducir: (entrenamiento: Entrenamiento) => void;
  cargando: boolean;
}) {
  const [indice, setIndice] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function handleMouseEnter() {
    if (entrenamiento.miniaturas.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setIndice((prev) => (prev + 1) % entrenamiento.miniaturas.length);
    }, INTERVALO_MS);
  }

  function handleMouseLeave() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIndice(0);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onReproducir(entrenamiento)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onReproducir(entrenamiento);
        }
      }}
      className="cursor-pointer rounded-xl border border-stone-300 bg-white p-4 shadow-sm transition-colors hover:border-blue-500"
    >
      <div className="mb-3 max-w-40 mx-auto">
        <CanchaTactica
          marcadores={entrenamiento.miniaturas[indice] ?? []}
          orientacion="horizontal"
          variante="mini"
        />
      </div>

      <p className="mb-3 font-medium text-neutral-900">{entrenamiento.titulo}</p>

      <div className="flex items-end justify-between gap-2">
        <p className="text-sm text-neutral-500">
          {entrenamiento.cantidadEjercicios}{" "}
          {entrenamiento.cantidadEjercicios === 1 ? "ejercicio" : "ejercicios"}
        </p>
        <Link
          href={`/entrenamientos/${entrenamiento.id}`}
          onClick={(event) => event.stopPropagation()}
          aria-disabled={cargando}
          className="flex shrink-0 items-center gap-1 rounded-xl border border-stone-300 px-2 py-1 text-sm font-medium text-neutral-900 hover:bg-stone-100"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </Link>
      </div>
    </div>
  );
}

export function EntrenamientosGrid({
  entrenamientos,
}: {
  entrenamientos: Entrenamiento[];
}) {
  const [reproduciendo, setReproduciendo] = useState<EjercicioConPasos[] | null>(
    null,
  );
  const [cargandoId, setCargandoId] = useState<string | null>(null);

  async function handleReproducir(entrenamiento: Entrenamiento) {
    if (cargandoId) return;
    setCargandoId(entrenamiento.id);
    try {
      const ejercicios = await obtenerEjerciciosConPasos(entrenamiento.id);
      setReproduciendo(ejercicios);
    } finally {
      setCargandoId(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-5">
      {entrenamientos.map((entrenamiento) => (
        <TarjetaEntrenamiento
          key={entrenamiento.id}
          entrenamiento={entrenamiento}
          onReproducir={handleReproducir}
          cargando={cargandoId === entrenamiento.id}
        />
      ))}

      {reproduciendo && reproduciendo.length > 0 ? (
        <ModalReproducirEntrenamiento
          ejercicios={reproduciendo}
          indiceInicial={0}
          onClose={() => setReproduciendo(null)}
        />
      ) : null}
    </div>
  );
}
