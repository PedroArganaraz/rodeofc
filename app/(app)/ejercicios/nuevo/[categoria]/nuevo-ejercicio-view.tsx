"use client";

import { useState } from "react";
import { EditorTactico } from "@/components/cancha/editor-tactico";
import type { Marcador } from "@/components/cancha/cancha-tactica";

export function NuevoEjercicioView({
  categoriaLabel,
}: {
  categoriaLabel: string;
}) {
  const [marcadores, setMarcadores] = useState<Marcador[]>([]);

  return (
    <div className="w-full flex-1 p-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Nuevo ejercicio
        </h1>
        <p className="text-sm font-medium text-neutral-500">
          Categoría: {categoriaLabel}
        </p>
      </div>

      <EditorTactico marcadores={marcadores} onChange={setMarcadores} />
    </div>
  );
}
