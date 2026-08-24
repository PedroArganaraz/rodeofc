"use client";

import { Modal } from "@/components/modal";
import { ReproductorEjercicio } from "@/components/cancha/reproductor-ejercicio";
import type { Forma, Marcador } from "@/components/cancha/cancha-tactica";

type Paso = {
  id: string;
  nombre: string | null;
  marcadores: Marcador[];
  formas: Forma[];
};

export function ModalReproducir({
  titulo,
  pasos,
  onClose,
}: {
  titulo: string;
  pasos: Paso[];
  onClose: () => void;
}) {
  return (
    <Modal title={titulo} onClose={onClose} maxWidthClassName="max-w-3xl">
      <ReproductorEjercicio pasos={pasos} />
    </Modal>
  );
}
