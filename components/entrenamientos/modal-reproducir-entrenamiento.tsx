"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Modal } from "@/components/modal";
import { ReproductorEjercicio } from "@/components/cancha/reproductor-ejercicio";
import type { Forma, Marcador } from "@/components/cancha/cancha-tactica";

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

export function ModalReproducirEntrenamiento({
  ejercicios,
  indiceInicial,
  onClose,
}: {
  ejercicios: EjercicioConPasos[];
  indiceInicial: number;
  onClose: () => void;
}) {
  const [indice, setIndice] = useState(indiceInicial);
  const ejercicioActual = ejercicios[indice];

  function irAnterior() {
    setIndice((actual) => Math.max(0, actual - 1));
  }

  function irSiguiente() {
    setIndice((actual) => Math.min(ejercicios.length - 1, actual + 1));
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndice((actual) => Math.max(0, actual - 1));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndice((actual) => Math.min(ejercicios.length - 1, actual + 1));
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [ejercicios.length]);

  if (!ejercicioActual) return null;

  return (
    <Modal
      title={ejercicioActual.titulo}
      onClose={onClose}
      maxWidthClassName="max-w-3xl"
    >
      <p className="mb-3 text-sm font-medium text-neutral-500">
        Ejercicio {indice + 1} de {ejercicios.length}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={irAnterior}
          disabled={indice === 0}
          aria-label="Ejercicio anterior"
          className="shrink-0 rounded-full bg-brand-navy p-2 text-white hover:bg-brand-navy-dark disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <ReproductorEjercicio
            key={ejercicioActual.id}
            pasos={ejercicioActual.pasos}
          />
        </div>

        <button
          type="button"
          onClick={irSiguiente}
          disabled={indice === ejercicios.length - 1}
          aria-label="Ejercicio siguiente"
          className="shrink-0 rounded-full bg-brand-navy p-2 text-white hover:bg-brand-navy-dark disabled:opacity-40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </Modal>
  );
}
