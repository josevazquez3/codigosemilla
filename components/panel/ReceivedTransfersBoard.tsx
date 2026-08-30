"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  FileDown,
  FileSpreadsheet,
  Hash,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  deleteBankMovementAction,
  updateBankConceptAction,
  updateBankMovementAction,
} from "@/app/panel/actions";
import { BankMovementModal } from "@/components/panel/BankMovementModal";
import { fieldClass } from "@/components/panel/ui";
import { bankExtractToCsv, computeExtract } from "@/lib/bank-extract";
import { currentPeriodValue, formatBankMoney, formatExtractDate, formatPeriodLabel } from "@/lib/panel-format";
import type { BankExtractMeta, PanelBankMovement } from "@/lib/panel-data";

const MONTHS = [
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

export function ReceivedTransfersBoard({
  movements,
  meta,
}: {
  movements: PanelBankMovement[];
  meta: BankExtractMeta;
}) {
  const router = useRouter();
  const exportRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState(currentPeriodValue());
  const [allPeriods, setAllPeriods] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [draftMonth, setDraftMonth] = useState(period.slice(5, 7));
  const [draftYear, setDraftYear] = useState(period.slice(0, 4));
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [exportOpen, setExportOpen] = useState(false);
  const [editing, setEditing] = useState<PanelBankMovement | null>(null);
  const [editingConcept, setEditingConcept] = useState<PanelBankMovement | null>(null);

  const extract = useMemo(() => computeExtract(movements, meta), [movements, meta]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return extract.rows.filter((row) => {
      if (row.amountCents <= 0) return false;
      if (!allPeriods && row.occurredAt.slice(0, 7) !== period) return false;
      if (!value) return true;
      return `${row.reference} ${row.concept}`.toLowerCase().includes(value);
    });
  }, [allPeriods, extract.rows, period, query]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, row) => {
        if (row.currency === "USD") acc.usd += row.amountCents;
        else acc.ars += row.amountCents;
        return acc;
      },
      { ars: 0, usd: 0 },
    );
  }, [filtered]);

  const allVisibleSelected = filtered.length > 0 && filtered.every((item) => selected[item.id]);
  const exportRows = filtered.filter((item) => selected[item.id]);
  const data = exportRows.length > 0 ? exportRows : filtered;
  const years = Array.from({ length: 8 }, (_, index) => String(new Date().getFullYear() - 2 + index));

  function downloadExcel() {
    const blob = new Blob([bankExtractToCsv(data)], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transferencias-recibidas.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    setExportOpen(false);
  }

  function exportPdf() {
    const rows = data
      .map(
        (row) =>
          `<tr>
            <td>${formatExtractDate(row.occurredAt)}</td>
            <td>${row.reference || "—"}</td>
            <td>${row.concept || "—"}</td>
            <td>${formatBankMoney(row.amountCents, row.currency)}</td>
            <td>${formatBankMoney(row.balanceCents, row.currency)}</td>
          </tr>`,
      )
      .join("");
    const html = `<!doctype html><html><head><title>Transferencias recibidas</title>
      <style>
        body { font-family: Georgia, serif; color: #2d4739; padding: 24px; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        p { color: #6f8a74; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border-bottom: 1px solid #d7e6d3; padding: 8px; text-align: left; font-size: 12px; font-family: sans-serif; }
        th { text-transform: uppercase; color: #6f8a74; }
      </style></head><body>
      <h1>Transferencias recibidas</h1>
      <p>${allPeriods ? "Todos los períodos" : `Período: ${formatPeriodLabel(period)}`}</p>
      <table>
        <thead><tr><th>Fecha</th><th>Referencia</th><th>Concepto</th><th>Importe</th><th>Saldo</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      </body></html>`;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    setExportOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link
          href="/panel/tesoreria"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d7e6d3] text-primary"
          aria-label="Volver al extracto"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">
            Transferencias recibidas
          </h1>
          <p className="mt-2 text-sm text-primary/80">
            Transferencias recibidas con importe positivo del extracto bancario
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm shadow-primary/5 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <label className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#6f8a74]"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por concepto o referencia..."
                className="w-full rounded-full border border-[#d7e6d3] bg-white py-2.5 pr-4 pl-11 text-sm outline-none focus:border-[#4f7a58]"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setDraftMonth(period.slice(5, 7));
                setDraftYear(period.slice(0, 4));
                setMonthOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#d7e6d3] px-4 py-2.5 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
            >
              <CalendarDays size={14} />
              Calendario
            </button>
            <label className="inline-flex items-center gap-2 text-sm text-primary">
              <input
                type="checkbox"
                checked={allPeriods}
                onChange={(event) => setAllPeriods(event.target.checked)}
                className="h-4 w-4 accent-[#4f7a58]"
              />
              Buscar todos los meses y años
            </label>
            <div className="text-sm font-semibold text-primary xl:ml-auto xl:text-right">
              <p>TOTAL $: {formatBankMoney(totals.ars, "ARS")}</p>
              <p>TOTAL $USD: {formatBankMoney(totals.usd, "USD")}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#6f8a74]">
              Período: <span className="font-medium text-primary">{formatPeriodLabel(period)}</span>
              {allPeriods ? " · todos los períodos" : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.refresh()}
                className="inline-flex items-center gap-2 rounded-full border border-[#d7e6d3] px-4 py-2.5 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
              >
                <RefreshCw size={14} />
                Actualizar
              </button>
              <div className="relative" ref={exportRef}>
                <button
                  type="button"
                  onClick={() => setExportOpen((open) => !open)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] px-4 py-2.5 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
                >
                  <FileDown size={14} />
                  Exportar
                </button>
                {exportOpen ? (
                  <div className="absolute right-0 z-20 mt-2 w-40 rounded-2xl border border-[#d7e6d3] bg-[#f9f7f2] p-2 shadow-lg">
                    <button
                      type="button"
                      onClick={downloadExcel}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-primary hover:bg-[#e8f3e3]"
                    >
                      <FileSpreadsheet size={14} />
                      Excel
                    </button>
                    <button
                      type="button"
                      onClick={exportPdf}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-primary hover:bg-[#e8f3e3]"
                    >
                      <FileDown size={14} />
                      PDF
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground italic">
              No hay transferencias recibidas para este período.
            </p>
          ) : (
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e3eee0] bg-[#d7e6d3] text-[11px] tracking-[0.14em] text-[#2d4739] uppercase">
                  <th className="px-3 py-3 font-medium">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(event) => {
                        const next = event.target.checked;
                        setSelected((current) => {
                          const copy = { ...current };
                          for (const item of filtered) copy[item.id] = next;
                          return copy;
                        });
                      }}
                      className="h-4 w-4 accent-[#4f7a58]"
                      aria-label="Seleccionar visibles"
                    />
                  </th>
                  <th className="px-3 py-3 font-medium">Fecha</th>
                  <th className="px-3 py-3 font-medium">Referencia</th>
                  <th className="px-3 py-3 font-medium">Concepto</th>
                  <th className="px-3 py-3 font-medium">Importe</th>
                  <th className="px-3 py-3 font-medium">Saldo</th>
                  <th className="px-3 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-[#f0f5ee] hover:bg-[#eef3ea] ${
                      selected[row.id] ? "bg-[#e8f3e3]" : index % 2 === 1 ? "bg-[#f7faf5]" : "bg-white"
                    }`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={Boolean(selected[row.id])}
                        onChange={(event) =>
                          setSelected((current) => ({ ...current, [row.id]: event.target.checked }))
                        }
                        className="h-4 w-4 accent-[#4f7a58]"
                      />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-primary">
                      {formatExtractDate(row.occurredAt)}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{row.reference || "—"}</td>
                    <td className="max-w-[280px] truncate px-3 py-3 text-primary" title={row.concept}>
                      {row.concept || "—"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-[#4f7a58]">
                      {formatBankMoney(row.amountCents, row.currency)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-primary">
                      {formatBankMoney(row.balanceCents, row.currency)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(row)}
                          className="rounded-full p-2 text-[#6f8a74] hover:bg-[#e8f3e3] hover:text-primary"
                          aria-label="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingConcept(row)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d7e6d3] text-[#4f7a58] hover:bg-[#c5d9c0]"
                          aria-label="Editar concepto"
                          title="Editar concepto"
                        >
                          <Hash size={15} />
                        </button>
                        <form
                          action={async (formData) => {
                            if (!window.confirm("¿Eliminar esta transferencia?")) return;
                            await deleteBankMovementAction(formData);
                          }}
                        >
                          <input type="hidden" name="id" value={row.id} />
                          <button
                            type="submit"
                            className="rounded-full p-2 text-[#6f8a74] hover:bg-[#e8f3e3] hover:text-primary"
                            aria-label="Eliminar"
                          >
                            <Trash2 size={15} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {monthOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-primary/35"
            onClick={() => setMonthOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-[#f9f7f2] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-heading text-2xl text-primary uppercase">Seleccionar mes</h2>
              <button
                type="button"
                onClick={() => setMonthOpen(false)}
                className="text-[#6f8a74] hover:text-primary"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 grid gap-4">
              <label className="block space-y-2">
                <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Mes</span>
                <select
                  value={draftMonth}
                  onChange={(event) => setDraftMonth(event.target.value)}
                  className={fieldClass}
                >
                  {MONTHS.map((label, index) => (
                    <option key={label} value={String(index + 1).padStart(2, "0")}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Año</span>
                <select
                  value={draftYear}
                  onChange={(event) => setDraftYear(event.target.value)}
                  className={fieldClass}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMonthOpen(false)}
                className="rounded-full border border-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.16em] text-primary uppercase"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setPeriod(`${draftYear}-${draftMonth}`);
                  setAllPeriods(false);
                  setMonthOpen(false);
                }}
                className="rounded-full bg-[#2d4739] px-5 py-2.5 text-xs tracking-[0.16em] text-white uppercase"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editing ? (
        <BankMovementModal
          title="Editar movimiento"
          movement={editing}
          onClose={() => setEditing(null)}
          action={updateBankMovementAction}
        />
      ) : null}

      {editingConcept ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-primary/35"
            onClick={() => setEditingConcept(null)}
          />
          <form
            className="relative w-full max-w-lg rounded-3xl bg-[#f9f7f2] p-6 shadow-2xl"
            action={async (formData) => {
              const result = await updateBankConceptAction(formData);
              if (result?.error) {
                window.alert(result.error);
                return;
              }
              setEditingConcept(null);
            }}
          >
            <input type="hidden" name="id" value={editingConcept.id} />
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-heading text-2xl text-primary uppercase">Editar concepto</h2>
              <button
                type="button"
                onClick={() => setEditingConcept(null)}
                className="text-[#6f8a74] hover:text-primary"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <label className="mt-5 block space-y-2">
              <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Concepto</span>
              <textarea
                name="concept"
                required
                defaultValue={editingConcept.concept}
                rows={4}
                className={`${fieldClass} min-h-[96px] resize-none`}
              />
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingConcept(null)}
                className="rounded-full border border-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.16em] text-primary uppercase"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#2d4739] px-5 py-2.5 text-xs tracking-[0.16em] text-white uppercase"
              >
                Guardar concepto
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
