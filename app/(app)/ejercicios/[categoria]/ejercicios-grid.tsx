"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { ModalReproducir } from "@/components/ejercicios/modal-reproducir";
import { obtenerPasosEjercicio } from "../actions";
import { CanchaTactica, type Marcador } from "@/components/cancha/cancha-tactica";

type Paso = {
  id: string;
  nombre: string | null;
  marcadores: Marcador[];
};

type Ejercicio = {
  id: string;
  titulo: string;
  cantidadPasos: number;
  marcadores: Marcador[];
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
          <div className="mb-3 max-w-40 mx-auto">
            <CanchaTactica
              marcadores={ejercicio.marcadores}
              orientacion="horizontal"
              variante="mini"
            />
          </div>

          <p className="mb-3 font-medium text-neutral-900">{ejercicio.titulo}</p>

          <div className="flex items-end justify-between gap-2">
            <p className="text-sm text-neutral-500">
              {ejercicio.cantidadPasos}{" "}
              {ejercicio.cantidadPasos === 1 ? "paso" : "pasos"}
            </p>
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
