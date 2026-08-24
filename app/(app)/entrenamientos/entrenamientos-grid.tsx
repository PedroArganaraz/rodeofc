"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { CanchaTactica, type Marcador } from "@/components/cancha/cancha-tactica";

const INTERVALO_MS = 1500;

type Entrenamiento = {
  id: string;
  titulo: string;
  cantidadEjercicios: number;
  miniaturas: Marcador[][];
};

function TarjetaEntrenamiento({ entrenamiento }: { entrenamiento: Entrenamiento }) {
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
    <Link
      href={`/entrenamientos/${entrenamiento.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="rounded-xl border border-stone-300 bg-white p-4 shadow-sm transition-colors hover:border-blue-500"
    >
      <div className="mb-3 max-w-40 mx-auto">
        <CanchaTactica
          marcadores={entrenamiento.miniaturas[indice] ?? []}
          orientacion="horizontal"
          variante="mini"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-medium text-neutral-900">{entrenamiento.titulo}</p>
          <p className="mt-1 text-sm text-neutral-500">
            {entrenamiento.cantidadEjercicios}{" "}
            {entrenamiento.cantidadEjercicios === 1 ? "ejercicio" : "ejercicios"}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-xl border border-stone-300 px-2 py-1 text-sm font-medium text-neutral-900">
          <Pencil className="h-4 w-4" />
          Editar
        </span>
      </div>
    </Link>
  );
}

export function EntrenamientosGrid({
  entrenamientos,
}: {
  entrenamientos: Entrenamiento[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-5">
      {entrenamientos.map((entrenamiento) => (
        <TarjetaEntrenamiento key={entrenamiento.id} entrenamiento={entrenamiento} />
      ))}
    </div>
  );
}
