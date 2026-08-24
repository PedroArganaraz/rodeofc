"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { EditorTactico } from "@/components/cancha/editor-tactico";
import { ConfirmModal } from "@/components/confirm-modal";
import { ModalReproducir } from "@/components/ejercicios/modal-reproducir";
import type { Marcador } from "@/components/cancha/cancha-tactica";
import {
  crearEjercicio,
  actualizarEjercicio,
  eliminarEjercicio,
} from "@/app/(app)/ejercicios/actions";

type Paso = {
  id: string;
  nombre: string | null;
  marcadores: Marcador[];
};

function crearId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function EditorEjercicioView({
  categoriaSlug,
  categoriaLabel,
  ejercicioId,
  tituloInicial,
  pasosIniciales,
}: {
  categoriaSlug: string;
  categoriaLabel: string;
  ejercicioId?: string;
  tituloInicial?: string;
  pasosIniciales?: Paso[];
}) {
  const router = useRouter();
  const modoEdicion = Boolean(ejercicioId);

  const [titulo, setTitulo] = useState(tituloInicial ?? "");
  const [marcadores, setMarcadores] = useState<Marcador[]>(
    pasosIniciales?.[0]?.marcadores ?? [],
  );
  const [pasos, setPasos] = useState<Paso[]>(pasosIniciales ?? []);
  const [pasoCargadoId, setPasoCargadoId] = useState<string | null>(
    pasosIniciales?.[0]?.id ?? null,
  );
  const [referencia, setReferencia] = useState<Marcador[]>(
    pasosIniciales?.[0]?.marcadores ?? [],
  );
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [valorEdicion, setValorEdicion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mostrarConfirmEliminar, setMostrarConfirmEliminar] = useState(false);
  const [mostrarReproducir, setMostrarReproducir] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const filaRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const dragElRef = useRef<HTMLButtonElement | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);

  const puedeGuardar = titulo.trim() !== "" && pasos.length > 0;

  function handleAgregarPaso() {
    setPasos((prev) => [...prev, { id: crearId(), nombre: null, marcadores }]);
    setReferencia(marcadores);
  }

  function handleCargarPaso(paso: Paso) {
    setMarcadores(paso.marcadores);
    setPasoCargadoId(paso.id);
    setReferencia(paso.marcadores);
  }

  function handleEmpezarEdicion(paso: Paso) {
    setEditandoId(paso.id);
    setValorEdicion(paso.nombre ?? "");
  }

  function handleConfirmarEdicion(id: string) {
    const nombre = valorEdicion.trim() === "" ? null : valorEdicion.trim();
    setPasos((prev) =>
      prev.map((paso) => (paso.id === id ? { ...paso, nombre } : paso)),
    );
    setEditandoId(null);
  }

  function handleEliminarPaso(id: string) {
    setPasos((prev) => prev.filter((paso) => paso.id !== id));
    if (id === pasoCargadoId) setPasoCargadoId(null);
    if (id === editandoId) setEditandoId(null);
  }

  function handleMoverPaso(indice: number, direccion: -1 | 1) {
    setPasos((prev) => {
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
      setPasos((prev) => {
        const indiceActual = prev.findIndex((paso) => paso.id === dragId);
        if (indiceActual === -1) return prev;

        let indiceDestino = indiceActual;
        for (let i = 0; i < prev.length; i++) {
          const el = filaRefs.current[prev[i].id];
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
        const pasosPayload = pasos.map((paso) => ({
          nombre: paso.nombre,
          marcadores: paso.marcadores,
        }));

        if (modoEdicion && ejercicioId) {
          await actualizarEjercicio(ejercicioId, titulo.trim(), pasosPayload);
        } else {
          await crearEjercicio(titulo.trim(), categoriaSlug, pasosPayload);
        }
        router.push(`/ejercicios/${categoriaSlug}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error");
      }
    });
  }

  async function handleEliminar() {
    if (!ejercicioId) return;
    await eliminarEjercicio(ejercicioId);
    router.push(`/ejercicios/${categoriaSlug}`);
  }

  return (
    <div className="w-full flex-1 p-6">
      <Link
        href={`/ejercicios/${categoriaSlug}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a {categoriaLabel.toLowerCase()}
      </Link>

      <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          required
          placeholder="Título del ejercicio"
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
              Eliminar ejercicio
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleGuardar}
            disabled={!puedeGuardar || isPending}
            className="flex-1 rounded-xl bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark disabled:opacity-40 sm:flex-none"
          >
            {isPending
              ? "Guardando..."
              : modoEdicion
                ? "Guardar"
                : "Guardar"}
          </button>
        </div>
      </div>
      <p className="mb-2 text-sm font-medium text-neutral-500">
        Categoría: {categoriaLabel}
      </p>
      {error ? (
        <p className="mb-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      ) : null}

      <EditorTactico
        marcadores={marcadores}
        onChange={setMarcadores}
        mostrarTrayectorias
        marcadoresReferencia={referencia}
        accionesExtra={
          <button
            type="button"
            onClick={handleAgregarPaso}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark"
          >
            <Plus className="h-4 w-4" />
            Nuevo paso
          </button>
        }
        accionesFinales={
          pasos.length >= 2 ? (
            <button
              type="button"
              onClick={() => setMostrarReproducir(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-stone-100"
            >
              <Eye className="h-4 w-4" />
              Ver
            </button>
          ) : null
        }
      />

      {pasos.length > 0 ? (
        <div className="mx-auto mt-6 w-full max-w-3xl">
          <h2 className="mb-3 text-sm font-medium text-neutral-500">
            Pasos ({pasos.length})
          </h2>
          <ul className="space-y-2">
            {pasos.map((paso, indice) => {
              const cargado = paso.id === pasoCargadoId;
              const editando = paso.id === editandoId;

              return (
                <li
                  key={paso.id}
                  ref={(el) => {
                    filaRefs.current[paso.id] = el;
                  }}
                  className={`rounded-xl border bg-white px-4 py-3 ${
                    cargado ? "border-brand-navy" : "border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onPointerDown={(event) => handlePointerDownGrip(event, paso.id)}
                      aria-label={`Reordenar paso ${indice + 1}`}
                      className="touch-none hidden shrink-0 rounded-full p-2 text-neutral-400 hover:bg-stone-300 hover:text-neutral-900 lg:flex"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                    {editando ? (
                      <div className="flex flex-1 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-300 font-mono text-sm font-medium text-neutral-900">
                          {indice + 1}
                        </span>
                        <input
                          type="text"
                          autoFocus
                          value={valorEdicion}
                          onChange={(event) => setValorEdicion(event.target.value)}
                          onBlur={() => handleConfirmarEdicion(paso.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              handleConfirmarEdicion(paso.id);
                            }
                            if (event.key === "Escape") {
                              setEditandoId(null);
                            }
                          }}
                          className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm text-neutral-900"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCargarPaso(paso)}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-300 font-mono text-sm font-medium text-neutral-900">
                          {indice + 1}
                        </span>
                        <span className="text-sm text-neutral-900">
                          {paso.nombre || `Paso ${indice + 1}`}
                        </span>
                      </button>
                    )}
                    <div className="flex shrink-0 gap-1">
                      <div className="flex gap-1 lg:hidden">
                        <button
                          type="button"
                          onClick={() => handleMoverPaso(indice, -1)}
                          disabled={indice === 0}
                          aria-label={`Mover paso ${indice + 1} arriba`}
                          className="rounded-full p-2 text-neutral-500 hover:bg-stone-300 hover:text-neutral-900 disabled:opacity-40"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoverPaso(indice, 1)}
                          disabled={indice === pasos.length - 1}
                          aria-label={`Mover paso ${indice + 1} abajo`}
                          className="rounded-full p-2 text-neutral-500 hover:bg-stone-300 hover:text-neutral-900 disabled:opacity-40"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEmpezarEdicion(paso)}
                        aria-label={`Editar nombre del paso ${indice + 1}`}
                        className="rounded-full p-2 text-neutral-500 hover:bg-stone-300 hover:text-neutral-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminarPaso(paso.id)}
                        aria-label={`Eliminar paso ${indice + 1}`}
                        className="rounded-full p-2 text-neutral-500 hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {mostrarConfirmEliminar ? (
        <ConfirmModal
          title="Eliminar ejercicio"
          description={`¿Eliminar ${titulo || "este ejercicio"}? Esta acción no se puede deshacer.`}
          onConfirm={handleEliminar}
          onClose={() => setMostrarConfirmEliminar(false)}
        />
      ) : null}

      {mostrarReproducir ? (
        <ModalReproducir
          titulo={titulo || "Ejercicio"}
          pasos={pasos}
          onClose={() => setMostrarReproducir(false)}
        />
      ) : null}
    </div>
  );
}
