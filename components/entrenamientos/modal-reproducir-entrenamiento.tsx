"use client";

import { useState } from "react";
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
          onClick={() => setIndice((actual) => actual - 1)}
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
          onClick={() => setIndice((actual) => actual + 1)}
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
