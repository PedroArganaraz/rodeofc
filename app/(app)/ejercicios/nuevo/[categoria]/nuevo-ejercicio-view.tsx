"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { EditorTactico } from "@/components/cancha/editor-tactico";
import type { Marcador } from "@/components/cancha/cancha-tactica";
import { crearEjercicio } from "./actions";

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

export function NuevoEjercicioView({
  categoriaSlug,
  categoriaLabel,
}: {
  categoriaSlug: string;
  categoriaLabel: string;
}) {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [marcadores, setMarcadores] = useState<Marcador[]>([]);
  const [pasos, setPasos] = useState<Paso[]>([]);
  const [pasoCargadoId, setPasoCargadoId] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [valorEdicion, setValorEdicion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const puedeGuardar = titulo.trim() !== "" && pasos.length > 0;

  function handleGuardar() {
    setError(null);
    startTransition(async () => {
      try {
        await crearEjercicio(
          titulo.trim(),
          categoriaSlug,
          pasos.map((paso) => ({ nombre: paso.nombre, marcadores: paso.marcadores })),
        );
        router.push(`/ejercicios/${categoriaSlug}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error");
      }
    });
  }

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

  return (
    <div className="w-full flex-1 p-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <input
          type="text"
          required
          placeholder="Título del ejercicio"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-lg font-semibold text-neutral-900"
        />
        <button
          type="button"
          onClick={handleGuardar}
          disabled={!puedeGuardar || isPending}
          className="rounded-xl bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark disabled:opacity-40"
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>
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
    </div>
  );
}
