"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  GripVertical,
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
  const [dragId, setDragId] = useState<string | null>(null);
  const filaRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const dragElRef = useRef<HTMLButtonElement | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);

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

  function handlePointerDownGrip(
    event: React.PointerEvent<HTMLButtonElement>,
    id: string,
  ) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragElRef.current = event.currentTarget;
    dragPointerIdRef.current = event.pointerId;
    setDragId(id);
  }

  useEffect(() => {
    if (!dragId) return;
    const el = dragElRef.current;
    if (!el) return;

    let finalizado = false;

    function mover(clientY: number) {
      setSeleccionados((prev) => {
        const indiceActual = prev.indexOf(dragId!);
        if (indiceActual === -1) return prev;

        let indiceDestino = indiceActual;
        for (let i = 0; i < prev.length; i++) {
          const el = filaRefs.current[prev[i]];
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (clientY >= rect.top && clientY <= rect.bottom) {
            indiceDestino = i;
            break;
          }
        }

        if (indiceDestino === indiceActual) return prev;
        const copia = [...prev];
        const [item] = copia.splice(indiceActual, 1);
        copia.splice(indiceDestino, 0, item);
        return copia;
      });
    }

    function finalizar() {
      if (finalizado) return;
      finalizado = true;
      const pointerId = dragPointerIdRef.current;
      if (pointerId !== null && el!.hasPointerCapture(pointerId)) {
        el!.releasePointerCapture(pointerId);
      }
      setDragId(null);
    }

    function onPointerMoveNativo(event: PointerEvent) {
      event.preventDefault();
      mover(event.clientY);
    }

    function onPointerUpNativo(event: PointerEvent) {
      event.preventDefault();
      finalizar();
    }

    function onTouchMoveNativo(event: TouchEvent) {
      event.preventDefault();
      const touch = event.touches[0];
      if (touch) mover(touch.clientY);
    }

    function onTouchEndNativo(event: TouchEvent) {
      event.preventDefault();
      finalizar();
    }

    el.addEventListener("pointermove", onPointerMoveNativo, { passive: false });
    el.addEventListener("pointerup", onPointerUpNativo, { passive: false });
    el.addEventListener("pointercancel", onPointerUpNativo, { passive: false });
    el.addEventListener("touchmove", onTouchMoveNativo, { passive: false });
    el.addEventListener("touchend", onTouchEndNativo, { passive: false });
    el.addEventListener("touchcancel", onTouchEndNativo, { passive: false });

    return () => {
      el.removeEventListener("pointermove", onPointerMoveNativo);
      el.removeEventListener("pointerup", onPointerUpNativo);
      el.removeEventListener("pointercancel", onPointerUpNativo);
      el.removeEventListener("touchmove", onTouchMoveNativo);
      el.removeEventListener("touchend", onTouchEndNativo);
      el.removeEventListener("touchcancel", onTouchEndNativo);
    };
  }, [dragId]);

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
                    ref={(el) => {
                      filaRefs.current[id] = el;
                    }}
                    className={`flex items-center justify-between gap-4 rounded-xl border bg-white px-4 py-3 ${
                      dragId === id
                        ? "border-brand-navy shadow-md"
                        : "border-stone-300"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <button
                        type="button"
                        onPointerDown={(event) => handlePointerDownGrip(event, id)}
                        aria-label={`Reordenar ${ejercicio.titulo}`}
                        className="touch-none hidden rounded-full p-2 text-neutral-400 hover:bg-stone-300 hover:text-neutral-900 lg:flex"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
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
                      <div className="flex gap-1 lg:hidden">
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
                      </div>
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
