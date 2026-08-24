"use client";

import { useState, useTransition } from "react";
import { Shield } from "lucide-react";
import { Modal } from "@/components/modal";
import { createClient } from "@/utils/supabase/client";
import { createRival, updateRival } from "./actions";
import type { Tables } from "@/types/database.types";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export const CATEGORIAS = [
  "Serie A",
  "Serie B",
  "Serie C",
  "Serie D",
  "Serie E",
  "Serie F",
  "Serie G",
];

export function RivalFormModal({
  equipoId,
  rival,
  onClose,
  onSaved,
}: {
  equipoId: string;
  rival?: Tables<"rivales">;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(rival?.nombre ?? "");
  const [categoria, setCategoria] = useState(rival?.categoria ?? CATEGORIAS[0]);
  const [escudoUrl, setEscudoUrl] = useState(rival?.escudo_url ?? null);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError(null);

    const extension = ACCEPTED_TYPES[file.type];
    if (!extension) {
      setUploadError("Formato no soportado. Usá PNG, JPEG o WEBP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("La imagen no puede superar los 2MB.");
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient();
      const path = `${equipoId}/${rival?.id ?? Date.now()}.${extension}`;

      const { error: storageError } = await supabase.storage
        .from("escudos-rivales")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (storageError) throw storageError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("escudos-rivales").getPublicUrl(path);

      setEscudoUrl(publicUrl);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "No se pudo subir la imagen",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const input = {
      nombre: nombre.trim(),
      categoria,
      escudo_url: escudoUrl,
    };

    startTransition(async () => {
      try {
        if (rival) {
          await updateRival(rival.id, input);
        } else {
          await createRival(input);
        }
        onSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error");
      }
    });
  }

  return (
    <Modal title={rival ? "Editar rival" : "Nuevo rival"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        ) : null}

        <div className="flex items-center gap-4">
          {escudoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={escudoUrl}
              alt=""
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-stone-300 text-neutral-500">
              <Shield className="h-6 w-6" />
            </span>
          )}

          <div className="space-y-1">
            <span className="block text-sm font-medium text-neutral-500">
              Escudo
            </span>
            <label
              htmlFor="escudo"
              className="inline-block cursor-pointer rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:bg-stone-100 hover:shadow"
            >
              {escudoUrl ? "Cambiar escudo" : "Seleccionar archivo"}
              <input
                id="escudo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                disabled={isUploading}
                className="sr-only"
              />
            </label>
            {isUploading ? (
              <p className="text-sm text-neutral-500">Subiendo...</p>
            ) : null}
            {uploadError ? (
              <p className="text-sm text-red-500">{uploadError}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="nombre"
            className="text-sm font-medium text-neutral-500"
          >
            Nombre
          </label>
          <input
            id="nombre"
            required
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-900"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="categoria"
            className="text-sm font-medium text-neutral-500"
          >
            Categoría
          </label>
          <select
            id="categoria"
            required
            value={categoria}
            onChange={(event) => setCategoria(event.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-900"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-neutral-900"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending || isUploading}
            className="rounded-xl bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark disabled:opacity-60"
          >
            {isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
