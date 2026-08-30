"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  CloudDownload,
  ExternalLink,
  Layers,
  Link2,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { deleteBitacoraEntryAction, syncBitacoraDriveAction } from "@/app/panel/actions";
import { BitacoraBulkModal } from "@/components/panel/BitacoraBulkModal";
import { BitacoraEntryModal } from "@/components/panel/BitacoraEntryModal";
import { fieldClass } from "@/components/panel/ui";
import { formatDateTime } from "@/lib/panel-format";
import type { PanelBitacoraEntry } from "@/lib/panel-data";

function localDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function BitacoraBoard({ entries }: { entries: PanelBitacoraEntry[] }) {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [drawer, setDrawer] = useState<"create" | "bulk" | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = useMemo(
    () =>
      entries.filter((entry) => {
        const day = localDay(entry.createdAt);
        if (from && day < from) return false;
        if (to && day > to) return false;
        return true;
      }),
    [entries, from, to],
  );

  async function syncDrive() {
    setSyncing(true);
    setMessage("");
    const result = await syncBitacoraDriveAction();
    setSyncing(false);
    setMessage(
      result.updated
        ? `Se actualizaron ${result.updated} títulos desde Drive.`
        : "No hubo títulos nuevos para actualizar.",
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <BookOpen size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">Bitácora</h1>
          <p className="mt-2 text-sm text-primary/80">Registro de enlaces y documentos de Drive</p>
        </div>
      </div>

      <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm shadow-primary/5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-primary">
            <BookOpen size={18} />
            <h2 className="font-heading text-2xl uppercase">Bitácora</h2>
          </div>
          <p className="text-[11px] tracking-[0.18em] text-[#6f8a74] uppercase">
            {filtered.length} registros
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="relative min-w-[160px] flex-1">
            <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#6f8a74]" />
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className={`${fieldClass} pl-9`}
              aria-label="Desde"
            />
          </label>
          <label className="relative min-w-[160px] flex-1">
            <CalendarDays
              size={14}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#6f8a74]"
            />
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className={`${fieldClass} pl-9`}
              aria-label="Hasta"
            />
          </label>
          <button
            type="button"
            onClick={() => setDrawer("create")}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#4f7a58] px-4 py-3 text-[11px] tracking-[0.14em] text-white uppercase hover:bg-[#2d4739]"
          >
            <Link2 size={14} />
            Nuevo registro
          </button>
          <button
            type="button"
            onClick={() => setDrawer("bulk")}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#4f7a58] px-4 py-3 text-[11px] tracking-[0.14em] text-primary uppercase hover:bg-[#e8f3e3]"
          >
            <Layers size={14} />
            Carga masiva
          </button>
          <button
            type="button"
            onClick={syncDrive}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#4f7a58] px-4 py-3 text-[11px] tracking-[0.14em] text-primary uppercase hover:bg-[#e8f3e3] disabled:opacity-70"
          >
            <CloudDownload size={14} />
            {syncing ? "Sincronizando..." : "Sincronizar Drive"}
          </button>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#4f7a58] px-4 py-3 text-[11px] tracking-[0.14em] text-primary uppercase hover:bg-[#e8f3e3]"
          >
            <RefreshCw size={14} />
            Actualizar
          </button>
        </div>

        {message ? <p className="mt-4 text-sm text-[#4f7a58]">{message}</p> : null}

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#6f8a74]">
            {entries.length === 0 ? (
              <>
                <p>Todavía no hay registros en la bitácora.</p>
                <p className="mt-1">
                  Usá <strong className="font-medium text-primary">Nuevo registro</strong> arriba
                  para agregar el primero.
                </p>
              </>
            ) : (
              <p>No hay registros en el rango de fechas elegido.</p>
            )}
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#d7e6d3] text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">
                  <th className="py-3 pr-4 font-medium">Fecha de carga</th>
                  <th className="py-3 pr-4 font-medium">Título</th>
                  <th className="py-3 pr-4 font-medium">URL</th>
                  <th className="py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id} className="border-b border-[#eef3ea] last:border-0">
                    <td className="py-3 pr-4 whitespace-nowrap text-primary">
                      {formatDateTime(entry.createdAt)}
                    </td>
                    <td className="py-3 pr-4 text-primary">{entry.title || "Sin título"}</td>
                    <td className="max-w-xs truncate py-3 pr-4 text-[#6f8a74]">{entry.url}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full p-2 text-[#4f7a58] hover:bg-[#e8f3e3]"
                          aria-label="Abrir enlace"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <form
                          action={async (formData) => {
                            if (!window.confirm("¿Eliminar este registro de la bitácora?")) return;
                            await deleteBitacoraEntryAction(formData);
                          }}
                        >
                          <input type="hidden" name="id" value={entry.id} />
                          <button
                            type="submit"
                            className="rounded-full p-2 text-[#7a3a34] hover:bg-[#f8e6e4]"
                            aria-label="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {drawer === "create" ? <BitacoraEntryModal onClose={() => setDrawer(null)} /> : null}
      {drawer === "bulk" ? <BitacoraBulkModal onClose={() => setDrawer(null)} /> : null}
    </div>
  );
}
