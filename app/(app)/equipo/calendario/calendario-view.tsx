"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Shield } from "lucide-react";
import { ConfirmModal } from "@/components/confirm-modal";
import { PartidoFormModal } from "./partido-form-modal";
import { PartidoDetalleModal } from "./partido-detalle-modal";
import { deletePartido } from "./actions";
import type { Tables } from "@/types/database.types";

type Partido = Tables<"partidos">;
type Rival = Tables<"rivales">;

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

type ModalState =
  | { type: "create" }
  | { type: "edit"; partido: Partido }
  | { type: "detalle"; partidos: Partido[] }
  | { type: "delete"; partido: Partido }
  | null;

export function CalendarioView({
  partidos,
  rivales,
}: {
  partidos: Partido[];
  rivales: Rival[];
}) {
  const today = new Date();
  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [modal, setModal] = useState<ModalState>(null);
  const router = useRouter();

  const rivalesById = useMemo(
    () => new Map(rivales.map((rival) => [rival.id, rival])),
    [rivales],
  );

  const partidosPorDia = useMemo(() => {
    const map = new Map<string, Partido[]>();
    for (const partido of partidos) {
      const list = map.get(partido.fecha) ?? [];
      list.push(partido);
      map.set(partido.fecha, list);
    }
    return map;
  }, [partidos]);

  const todayKey = toDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const cells = useMemo(() => {
    const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay();
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

    const result: {
      key: string;
      day: number;
      inMonth: boolean;
      isToday: boolean;
      partidos: Partido[];
    }[] = [];

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstWeekday + 1;
      let year = cursor.year;
      let month = cursor.month;
      let day = dayNumber;
      let inMonth = true;

      if (dayNumber < 1) {
        inMonth = false;
        month -= 1;
        if (month < 0) {
          month = 11;
          year -= 1;
        }
        day = new Date(year, month + 1, 0).getDate() + dayNumber;
      } else if (dayNumber > daysInMonth) {
        inMonth = false;
        day = dayNumber - daysInMonth;
        month += 1;
        if (month > 11) {
          month = 0;
          year += 1;
        }
      }

      const key = toDateKey(year, month, day);
      result.push({
        key,
        day,
        inMonth,
        isToday: key === todayKey,
        partidos: inMonth ? (partidosPorDia.get(key) ?? []) : [],
      });
    }

    return result;
  }, [cursor, partidosPorDia, todayKey]);

  function handleSaved() {
    setModal(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deletePartido(id);
    setModal(null);
    router.refresh();
  }

  function goToPrevMonth() {
    setCursor((c) => {
      const month = c.month - 1;
      return month < 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month };
    });
  }

  function goToNextMonth() {
    setCursor((c) => {
      const month = c.month + 1;
      return month > 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month };
    });
  }

  return (
    <div className="w-full flex-1 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrevMonth}
            aria-label="Mes anterior"
            className="rounded-full p-2 text-neutral-500 hover:bg-stone-300 hover:text-neutral-900"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="min-w-[10rem] text-center text-xl font-semibold text-neutral-900">
            {MESES[cursor.month]} {cursor.year}
          </h1>
          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Mes siguiente"
            className="rounded-full p-2 text-neutral-500 hover:bg-stone-300 hover:text-neutral-900"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setModal({ type: "create" })}
          className="flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark"
        >
          <Plus className="h-4 w-4" />
          Nuevo partido
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-stone-300 bg-stone-300">
        {DIAS.map((dia) => (
          <div
            key={dia}
            className="bg-stone-100 py-2 text-center text-sm font-medium text-neutral-500"
          >
            {dia}
          </div>
        ))}

        {cells.map((cell) => {
          const hasPartidos = cell.partidos.length > 0;
          return (
            <button
              type="button"
              key={cell.key}
              disabled={!cell.inMonth || !hasPartidos}
              onClick={() =>
                setModal({ type: "detalle", partidos: cell.partidos })
              }
              className={`relative flex min-h-28 flex-col p-2 text-left ${
                !cell.inMonth
                  ? "bg-stone-100"
                  : cell.isToday
                    ? "border-2 border-brand-navy bg-brand-navy/5"
                    : "bg-white"
              } ${hasPartidos ? "cursor-pointer hover:bg-stone-100" : ""}`}
            >
              <span
                className={`text-sm ${
                  cell.isToday
                    ? "font-semibold text-brand-navy"
                    : cell.inMonth
                      ? "text-neutral-900"
                      : "text-neutral-400"
                }`}
              >
                {cell.day}
              </span>

              {hasPartidos ? (
                <span className="absolute right-2 top-2 hidden flex-col items-end gap-0.5 text-xs text-neutral-500 sm:flex">
                  {cell.partidos.map((partido) => (
                    <span key={partido.id} className={partido.hora ? "font-mono" : ""}>
                      {partido.hora ? `${partido.hora.slice(0, 5)}hs` : "A definir"}
                    </span>
                  ))}
                </span>
              ) : null}

              {hasPartidos ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2">
                  {cell.partidos.map((partido) => {
                    const rival = partido.rival_id
                      ? rivalesById.get(partido.rival_id)
                      : undefined;
                    return (
                      <div key={partido.id} className="flex justify-center">
                        {rival?.escudo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={rival.escudo_url}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <Shield className="h-12 w-12 shrink-0 text-neutral-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {modal?.type === "create" ? (
        <PartidoFormModal
          rivales={rivales}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      ) : null}
      {modal?.type === "edit" ? (
        <PartidoFormModal
          rivales={rivales}
          partido={modal.partido}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      ) : null}
      {modal?.type === "detalle" ? (
        <PartidoDetalleModal
          partidos={modal.partidos}
          rivalesById={rivalesById}
          onClose={() => setModal(null)}
          onEdit={(partido) => setModal({ type: "edit", partido })}
          onDelete={(partido) => setModal({ type: "delete", partido })}
        />
      ) : null}
      {modal?.type === "delete" ? (
        <ConfirmModal
          title="Eliminar partido"
          description={`¿Eliminar el partido vs ${
            modal.partido.rival_id
              ? (rivalesById.get(modal.partido.rival_id)?.nombre ?? "")
              : ""
          }? Esta acción no se puede deshacer.`}
          onConfirm={() => handleDelete(modal.partido.id)}
          onClose={() => setModal(null)}
        />
      ) : null}
    </div>
  );
}
