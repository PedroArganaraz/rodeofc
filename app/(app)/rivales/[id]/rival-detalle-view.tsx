"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
import { PartidoResultadoModal } from "./partido-resultado-modal";
import type { Tables } from "@/types/database.types";

function formatearFecha(fecha: string) {
  const [year, month, day] = fecha.split("-");
  return `${day}/${month}/${year}`;
}

export function RivalDetalleView({
  rival,
  partidos,
  resultadosPorPartido,
}: {
  rival: Tables<"rivales">;
  partidos: Tables<"partidos">[];
  resultadosPorPartido: Record<string, Tables<"resultados-partidos">>;
}) {
  const [partidoSeleccionado, setPartidoSeleccionado] = useState<
    Tables<"partidos"> | null
  >(null);
  const router = useRouter();

  function handleSaved() {
    setPartidoSeleccionado(null);
    router.refresh();
  }

  return (
    <div className="w-full flex-1 p-6">
      <Link
        href="/rivales"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a rivales
      </Link>

      <div className="mb-6 flex items-center gap-4">
        {rival.escudo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={rival.escudo_url}
            alt=""
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-stone-300 text-neutral-500">
            <Shield className="h-8 w-8" />
          </span>
        )}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-neutral-900">
            {rival.nombre}
          </h1>
          <span className="whitespace-nowrap rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-brand-navy">
            {rival.categoria.trim().split(" ").pop()}
          </span>
        </div>
      </div>

      {partidos.length === 0 ? (
        <p className="py-12 text-center text-sm text-neutral-500">
          Todavía no hay partidos registrados contra este rival.
        </p>
      ) : (
        <ul className="space-y-2">
          {partidos.map((partido) => {
            const resultado = resultadosPorPartido[partido.id];
            return (
              <li key={partido.id}>
                <button
                  type="button"
                  onClick={() => setPartidoSeleccionado(partido)}
                  className="group flex w-full items-center rounded-xl border border-stone-300 bg-white px-4 py-3 text-left transition-colors hover:border-blue-500 hover:bg-blue-500"
                >
                  {resultado ? (
                    <div className="flex w-full flex-col items-center gap-1">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/logo.png"
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <span className="font-mono text-lg font-semibold text-neutral-900 group-hover:text-white">
                          {resultado.goles_favor}
                        </span>
                        <span className="text-neutral-400 group-hover:text-white/70">
                          -
                        </span>
                        <span className="font-mono text-lg font-semibold text-neutral-900 group-hover:text-white">
                          {resultado.goles_contra}
                        </span>
                        {rival.escudo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={rival.escudo_url}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <Shield className="h-8 w-8 text-neutral-400 group-hover:text-white/70" />
                        )}
                      </div>
                      <span className="text-xs text-neutral-500 group-hover:text-white/70">
                        {formatearFecha(partido.fecha)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm text-neutral-900 group-hover:text-white">
                        {formatearFecha(partido.fecha)}
                        {partido.hora
                          ? ` · ${partido.hora.slice(0, 5)}`
                          : ""}
                      </span>
                      <span className="text-sm font-medium text-neutral-500 group-hover:text-white/70">
                        Programado
                      </span>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {partidoSeleccionado ? (
        <PartidoResultadoModal
          partido={partidoSeleccionado}
          resultado={resultadosPorPartido[partidoSeleccionado.id]}
          rivalNombre={rival.nombre}
          onClose={() => setPartidoSeleccionado(null)}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  );
}
