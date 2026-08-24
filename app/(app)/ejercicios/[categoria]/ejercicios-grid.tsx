"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { ModalReproducir } from "@/components/ejercicios/modal-reproducir";
import { obtenerPasosEjercicio } from "../actions";
import type { Marcador } from "@/components/cancha/cancha-tactica";

type Paso = {
  id: string;
  nombre: string | null;
  marcadores: Marcador[];
};

type Ejercicio = {
  id: string;
  titulo: string;
  cantidadPasos: number;
};

export function EjerciciosGrid({
  ejercicios,
  categoriaSlug,
}: {
  ejercicios: Ejercicio[];
  categoriaSlug: string;
}) {
  const [reproduciendo, setReproduciendo] = useState<{
    titulo: string;
    pasos: Paso[];
  } | null>(null);
  const [cargandoId, setCargandoId] = useState<string | null>(null);

  async function handleReproducir(ejercicio: Ejercicio) {
    if (cargandoId) return;
    setCargandoId(ejercicio.id);
    try {
      const pasos = await obtenerPasosEjercicio(ejercicio.id);
      setReproduciendo({ titulo: ejercicio.titulo, pasos });
    } finally {
      setCargandoId(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-5">
      {ejercicios.map((ejercicio) => (
        <div
          key={ejercicio.id}
          role="button"
          tabIndex={0}
          onClick={() => handleReproducir(ejercicio)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleReproducir(ejercicio);
            }
          }}
          className="cursor-pointer rounded-xl border border-stone-300 bg-white p-4 shadow-sm transition-colors hover:border-blue-500"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-medium text-neutral-900">{ejercicio.titulo}</p>
              <p className="mt-1 text-sm text-neutral-500">
                {ejercicio.cantidadPasos}{" "}
                {ejercicio.cantidadPasos === 1 ? "paso" : "pasos"}
              </p>
            </div>
            <Link
              href={`/ejercicios/${categoriaSlug}/${ejercicio.id}`}
              onClick={(event) => event.stopPropagation()}
              className="flex shrink-0 items-center gap-1 rounded-xl border border-stone-300 px-2 py-1 text-sm font-medium text-neutral-900 hover:bg-stone-100"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </div>
        </div>
      ))}

      {reproduciendo ? (
        <ModalReproducir
          titulo={reproduciendo.titulo}
          pasos={reproduciendo.pasos}
          onClose={() => setReproduciendo(null)}
        />
      ) : null}
    </div>
  );
}
