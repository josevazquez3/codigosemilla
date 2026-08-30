"use client";

import { useMemo, useRef, useState } from "react";
import {
  FileDown,
  FileSpreadsheet,
  FileUp,
  Hash,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  createBankMovementAction,
  deleteBankMovementAction,
  importBankExtractAction,
  saveBankExtractMetaAction,
  updateBankMovementAction,
} from "@/app/panel/actions";
import { BankMovementModal } from "@/components/panel/BankMovementModal";
import { fieldClass } from "@/components/panel/ui";
import { bankExtractToCsv, computeExtract, parseBankExtractCsv } from "@/lib/bank-extract";
import { formatBankMoney, formatBirthDate } from "@/lib/panel-format";
import type { BankExtractMeta, PanelBankMovement } from "@/lib/panel-data";

export function BankExtractBoard({
  movements,
  meta,
}: {
  movements: PanelBankMovement[];
  meta: BankExtractMeta;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [drawer, setDrawer] = useState<"create" | PanelBankMovement | null>(null);
  const [editingBalance, setEditingBalance] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const extract = useMemo(() => computeExtract(movements, meta), [movements, meta]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return extract.rows.filter((row) => {
      const day = row.occurredAt.slice(0, 10);
      if (from && day < from) return false;
      if (to && day > to) return false;
      if (!value) return true;
      return `${row.reference} ${row.concept}`.toLowerCase().includes(value);
    });
  }, [extract.rows, from, query, to]);

  const allVisibleSelected = filtered.length > 0 && filtered.every((item) => selected[item.id]);

  function exportRows() {
    const rows = filtered.filter((item) => selected[item.id]);
    const data = rows.length > 0 ? rows : filtered;
    const blob = new Blob([bankExtractToCsv(data)], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "extracto-banco.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function copyReference(row: PanelBankMovement) {
    const value = row.reference || row.concept;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      window.prompt("Copiá la referencia", value);
    }
    setCopiedId(row.id);
    window.setTimeout(() => setCopiedId((current) => (current === row.id ? null : current)), 1500);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <FileSpreadsheet size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">Extracto banco</h1>
          <p className="mt-2 text-sm text-primary/80">Gestión e importación de movimientos bancarios</p>
        </div>
      </div>

      <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm shadow-primary/5 md:p-8">
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
              placeholder="Buscar..."
              className="w-full rounded-full border border-[#d7e6d3] bg-white py-3 pr-4 pl-11 text-sm outline-none focus:border-[#4f7a58]"
            />
          </label>
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="rounded-full border border-[#d7e6d3] px-4 py-3 text-sm outline-none focus:border-[#4f7a58]"
            aria-label="Desde"
          />
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="rounded-full border border-[#d7e6d3] px-4 py-3 text-sm outline-none focus:border-[#4f7a58]"
            aria-label="Hasta"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportRows}
              className="inline-flex items-center gap-2 rounded-full border border-[#2d4739] px-4 py-2.5 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
            >
              <FileDown size={14} />
              Exportar Excel
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full bg-[#4f7a58] px-4 py-2.5 text-[11px] tracking-[0.14em] text-white uppercase hover:bg-primary"
            >
              <FileUp size={14} />
              Importar
            </button>
            <button
              type="button"
              onClick={() => setDrawer("create")}
              className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] px-4 py-2.5 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
            >
              <Plus size={14} />
              Cargar
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv,.txt"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              const text = await file.text();
              const rows = parseBankExtractCsv(text);
              if (rows.length === 0) {
                window.alert("No se encontraron movimientos. Usá un CSV exportado desde Excel.");
                return;
              }
              const formData = new FormData();
              formData.set("csv", JSON.stringify(rows));
              const result = await importBankExtractAction(formData);
              if (result?.error) window.alert(result.error);
              else window.alert(`Se importaron ${result?.created ?? rows.length} movimientos.`);
            }}
          />
        </div>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <button
            type="button"
            onClick={() => setEditingBalance(true)}
            className="group text-left"
          >
            <p className="text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">Saldo inicial</p>
            <p className="mt-1 flex items-center gap-2 font-heading text-xl text-primary">
              {formatBankMoney(meta.initialBalanceCents, "ARS")}
              <span className="text-sm font-sans text-[#6f8a74]">
                al {formatBirthDate(meta.initialBalanceDate)}
              </span>
              <Pencil size={14} className="text-[#6f8a74] group-hover:text-primary" />
            </p>
          </button>
          <div className="flex flex-wrap gap-8">
            <div className="text-right">
              <p className="text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">Saldo total $</p>
              <p className="mt-1 font-heading text-3xl text-primary">
                {formatBankMoney(extract.totalArs, "ARS")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">Saldo total $USD</p>
              <p className="mt-1 font-heading text-3xl text-primary">
                {formatBankMoney(extract.totalUsd, "USD")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="font-heading text-xl text-primary uppercase">Movimientos</h2>
          <p className="text-xs tracking-[0.16em] text-[#6f8a74] uppercase">
            {filtered.length} registros
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground italic">
              No hay movimientos para mostrar. Importá un extracto o cargá uno nuevo.
            </p>
          ) : (
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e3eee0] bg-[#f7faf5] text-[11px] tracking-[0.14em] text-[#6f8a74] uppercase">
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
                    title={row.concept}
                    className={`border-b border-[#f0f5ee] hover:bg-[#eef3ea] ${
                      selected[row.id]
                        ? "bg-[#eaf3fb]"
                        : row.currency === "USD"
                          ? "bg-[#f8efe4]"
                          : row.amountCents < 0
                            ? "bg-[#f7faf5]"
                            : index % 2 === 1
                              ? "bg-[#f3f8f1]"
                              : "bg-white"
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
                      {new Date(row.occurredAt).toLocaleString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{row.reference || "—"}</td>
                    <td className="max-w-[280px] truncate px-3 py-3 text-primary">{row.concept || "—"}</td>
                    <td
                      className={`px-3 py-3 whitespace-nowrap ${
                        row.amountCents < 0 ? "text-[#7a3a34]" : "text-[#4f7a58]"
                      }`}
                    >
                      {formatBankMoney(row.amountCents, row.currency)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-primary">
                      {formatBankMoney(row.balanceCents, row.currency)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDrawer(row)}
                          className="rounded-full p-2 text-[#6f8a74] hover:bg-[#e8f3e3] hover:text-primary"
                          aria-label="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => copyReference(row)}
                          className="rounded-full p-2 text-[#6f8a74] hover:bg-[#e8f3e3] hover:text-primary"
                          aria-label="Copiar referencia"
                          title={copiedId === row.id ? "Copiada" : "Copiar referencia"}
                        >
                          <Hash size={15} />
                        </button>
                        <form
                          action={async (formData) => {
                            if (!window.confirm("¿Eliminar este movimiento?")) return;
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

      {drawer ? (
        <BankMovementModal
          title={drawer === "create" ? "Cargar movimiento" : "Editar movimiento"}
          movement={drawer === "create" ? null : drawer}
          onClose={() => setDrawer(null)}
          action={drawer === "create" ? createBankMovementAction : updateBankMovementAction}
        />
      ) : null}

      {editingBalance ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-primary/35"
            onClick={() => setEditingBalance(false)}
          />
          <form
            className="relative w-full max-w-lg rounded-3xl bg-[#f9f7f2] p-6 shadow-2xl"
            action={async (formData) => {
              await saveBankExtractMetaAction(formData);
              setEditingBalance(false);
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-heading text-2xl text-primary uppercase">Saldo inicial</h2>
              <button
                type="button"
                onClick={() => setEditingBalance(false)}
                className="text-[#6f8a74] hover:text-primary"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 grid gap-4">
              <label className="block space-y-2">
                <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Saldo inicial $</span>
                <input
                  name="initialBalance"
                  type="number"
                  step="0.01"
                  defaultValue={(meta.initialBalanceCents / 100).toFixed(2)}
                  className={fieldClass}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Saldo inicial $USD</span>
                <input
                  name="initialBalanceUsd"
                  type="number"
                  step="0.01"
                  defaultValue={(meta.initialBalanceUsdCents / 100).toFixed(2)}
                  className={fieldClass}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Fecha</span>
                <input
                  name="initialBalanceDate"
                  type="date"
                  defaultValue={meta.initialBalanceDate}
                  className={fieldClass}
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingBalance(false)}
                className="rounded-full border border-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.16em] text-primary uppercase"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.16em] text-white uppercase"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
