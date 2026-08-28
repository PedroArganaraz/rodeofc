"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
} from "lucide-react";
import { ConfirmModal } from "@/components/confirm-modal";
import { CATEGORIAS } from "@/app/(app)/ejercicios/categorias";
import {
  crearEntrenamiento,
  actualizarEntrenamiento,
  eliminarEntrenamiento,
} from "@/app/(app)/entrenamientos/actions";

type EjercicioDisponible = {
  id: string;
  titulo: string;
  categoria: string;
};

function labelCategoria(slug: string) {
  return CATEGORIAS.find((c) => c.slug === slug)?.label ?? slug;
}

export function EditorEntrenamientoView({
  entrenamientoId,
  tituloInicial,
  ejerciciosDisponibles,
  ejerciciosSeleccionadosIniciales,
}: {
  entrenamientoId?: string;
  tituloInicial?: string;
  ejerciciosDisponibles: EjercicioDisponible[];
  ejerciciosSeleccionadosIniciales?: { ejercicio_id: string; orden: number }[];
}) {
  const router = useRouter();
  const modoEdicion = Boolean(entrenamientoId);

  const [titulo, setTitulo] = useState(tituloInicial ?? "");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [seleccionados, setSeleccionados] = useState<string[]>(
    [...(ejerciciosSeleccionadosIniciales ?? [])]
      .sort((a, b) => a.orden - b.orden)
      .map((item) => item.ejercicio_id),
  );
  const [error, setError] = useState<string | null>(null);
  const [mostrarConfirmEliminar, setMostrarConfirmEliminar] = useState(false);
  const [isPending, startTransition] = useTransition();

  const puedeGuardar = titulo.trim() !== "" && seleccionados.length > 0;

  const disponiblesFiltrados = ejerciciosDisponibles.filter(
    (ejercicio) =>
      categoriaFiltro === "todas" || ejercicio.categoria === categoriaFiltro,
  );

  function handleAgregar(id: string) {
    setSeleccionados((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function handleQuitar(id: string) {
    setSeleccionados((prev) => prev.filter((item) => item !== id));
  }

  function handleMover(indice: number, direccion: -1 | 1) {
    setSeleccionados((prev) => {
      const destino = indice + direccion;
      if (destino < 0 || destino >= prev.length) return prev;
      const copia = [...prev];
      [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
      return copia;
    });
  }

  function handleGuardar() {
    setError(null);
    startTransition(async () => {
      try {
        const ejerciciosPayload = seleccionados.map((ejercicio_id) => ({
          ejercicio_id,
        }));

        if (modoEdicion && entrenamientoId) {
          await actualizarEntrenamiento(
            entrenamientoId,
            titulo.trim(),
            ejerciciosPayload,
          );
        } else {
          await crearEntrenamiento(titulo.trim(), ejerciciosPayload);
        }
        router.push("/entrenamientos");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error");
      }
    });
  }

  async function handleEliminar() {
    if (!entrenamientoId) return;
    await eliminarEntrenamiento(entrenamientoId);
    router.push("/entrenamientos");
  }

  return (
    <div className="w-full flex-1 p-6">
      <Link
        href="/entrenamientos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Entrenamientos
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          required
          placeholder="Título del entrenamiento"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          className="min-w-0 rounded-xl border border-stone-300 bg-white px-3 py-2 text-lg font-semibold text-neutral-900 sm:flex-1"
        />
        <div className="flex gap-2 sm:shrink-0">
          {modoEdicion ? (
            <button
              type="button"
              onClick={() => setMostrarConfirmEliminar(true)}
              className="flex-1 rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 sm:flex-none"
            >
              Eliminar
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleGuardar}
            disabled={!puedeGuardar || isPending}
            className="flex-1 rounded-xl bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark disabled:opacity-40 sm:flex-none"
          >
            {isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-sm font-medium text-neutral-500">
              Ejercicios disponibles
            </h2>
            <select
              value={categoriaFiltro}
              onChange={(event) => setCategoriaFiltro(event.target.value)}
              className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-sm text-neutral-900"
            >
              <option value="todas">Todas</option>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria.slug} value={categoria.slug}>
                  {categoria.label}
                </option>
              ))}
            </select>
          </div>

          {disponiblesFiltrados.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">
              No hay ejercicios en esta categoría.
            </p>
          ) : (
            <ul className="space-y-2">
              {disponiblesFiltrados.map((ejercicio) => {
                const yaAgregado = seleccionados.includes(ejercicio.id);
                return (
                  <li
                    key={ejercicio.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-stone-300 bg-white px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-neutral-900">
                        {ejercicio.titulo}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {labelCategoria(ejercicio.categoria)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAgregar(ejercicio.id)}
                      disabled={yaAgregado}
                      className="flex shrink-0 items-center gap-1 rounded-xl border border-stone-300 px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-stone-100 disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium text-neutral-500">
            Ejercicios seleccionados ({seleccionados.length})
          </h2>

          {seleccionados.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">
              Todavía no agregaste ningún ejercicio.
            </p>
          ) : (
            <ul className="space-y-2">
              {seleccionados.map((id, indice) => {
                const ejercicio = ejerciciosDisponibles.find(
                  (item) => item.id === id,
                );
                if (!ejercicio) return null;

                return (
                  <li
                    key={id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-stone-300 bg-white px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-300 font-mono text-sm font-medium text-neutral-900">
                        {indice + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-neutral-900">
                          {ejercicio.titulo}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {labelCategoria(ejercicio.categoria)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => handleMover(indice, -1)}
                        disabled={indice === 0}
                        aria-label={`Mover ${ejercicio.titulo} arriba`}
                        className="rounded-full p-2 text-neutral-500 hover:bg-stone-300 hover:text-neutral-900 disabled:opacity-40"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMover(indice, 1)}
                        disabled={indice === seleccionados.length - 1}
                        aria-label={`Mover ${ejercicio.titulo} abajo`}
                        className="rounded-full p-2 text-neutral-500 hover:bg-stone-300 hover:text-neutral-900 disabled:opacity-40"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuitar(id)}
                        aria-label={`Quitar ${ejercicio.titulo}`}
                        className="rounded-full p-2 text-neutral-500 hover:bg-red-500/10 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {mostrarConfirmEliminar ? (
        <ConfirmModal
          title="Eliminar"
          description={`¿Eliminar ${titulo || "este entrenamiento"}? Esta acción no se puede deshacer.`}
          onConfirm={handleEliminar}
          onClose={() => setMostrarConfirmEliminar(false)}
        />
      ) : null}
    </div>
  );
}
