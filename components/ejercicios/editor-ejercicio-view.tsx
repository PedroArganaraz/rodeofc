"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Pencil, Plus, Trash2 } from "lucide-react";
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
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [valorEdicion, setValorEdicion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mostrarConfirmEliminar, setMostrarConfirmEliminar] = useState(false);
  const [mostrarReproducir, setMostrarReproducir] = useState(false);
  const [isPending, startTransition] = useTransition();

  const puedeGuardar = titulo.trim() !== "" && pasos.length > 0;

  function handleAgregarPaso() {
    setPasos((prev) => [...prev, { id: crearId(), nombre: null, marcadores }]);
  }

  function handleCargarPaso(paso: Paso) {
    setMarcadores(paso.marcadores);
    setPasoCargadoId(paso.id);
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
                  className={`rounded-xl border bg-white px-4 py-3 ${
                    cargado ? "border-brand-navy" : "border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
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
