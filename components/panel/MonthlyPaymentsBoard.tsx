"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  CalendarDays,
  FileSpreadsheet,
  MessageCircle,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  deleteBankMovementAction,
  deleteManualPaymentAction,
  upsertManualPaymentAction,
} from "@/app/panel/actions";
import { ManualPaymentModal } from "@/components/panel/ManualPaymentModal";
import { fieldClass } from "@/components/panel/ui";
import { movementMatchesPerson } from "@/lib/person-match";
import { downloadExcel } from "@/lib/excel-export";
import {
  currentPeriodValue,
  formatBankMoney,
  formatExtractDate,
  formatPeriodCode,
  formatPeriodLabel,
} from "@/lib/panel-format";
import { applyTemplate, whatsappUrl, type SiteSettings } from "@/lib/site-settings";
import type { PanelBankMovement, PanelManualPayment, PanelPadronPerson } from "@/lib/panel-data";

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

type MonthRow = {
  key: string;
  person: PanelPadronPerson;
  period: string;
  paid: boolean;
  payment?: PanelManualPayment;
  transfers: PanelBankMovement[];
};

export function MonthlyPaymentsBoard({
  people,
  movements,
  payments,
  settings,
}: {
  people: PanelPadronPerson[];
  movements: PanelBankMovement[];
  payments: PanelManualPayment[];
  settings: SiteSettings;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState(currentPeriodValue());
  const [allPeriods, setAllPeriods] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [draftMonth, setDraftMonth] = useState(period.slice(5, 7));
  const [draftYear, setDraftYear] = useState(period.slice(0, 4));
  const [editing, setEditing] = useState<MonthRow | null>(null);
  const [detail, setDetail] = useState<MonthRow | null>(null);

  const periods = useMemo(() => {
    if (!allPeriods) return [period];
    const values = new Set<string>([period]);
    for (const payment of payments) values.add(payment.period);
    for (const movement of movements) {
      if (movement.amountCents > 0) values.add(movement.occurredAt.slice(0, 7));
    }
    return [...values].sort().reverse();
  }, [allPeriods, movements, payments, period]);

  const rows = useMemo(() => {
    const list: MonthRow[] = [];
    for (const month of periods) {
      for (const person of people) {
        const payment = payments.find((item) => item.padronId === person.id && item.period === month);
        const transfers = movements.filter(
          (item) => item.occurredAt.slice(0, 7) === month && movementMatchesPerson(item, person),
        );
        list.push({
          key: `${person.id}-${month}`,
          person,
          period: month,
          paid: Boolean(payment || transfers.length),
          payment,
          transfers,
        });
      }
    }
    return list.sort((a, b) => {
      if (a.paid !== b.paid) return a.paid ? 1 : -1;
      return `${a.person.lastName} ${a.person.firstName}`.localeCompare(
        `${b.person.lastName} ${b.person.firstName}`,
        "es",
      );
    });
  }, [movements, payments, people, periods]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return rows;
    return rows.filter((row) => {
      const mes = `${formatPeriodCode(row.period)} ${formatPeriodLabel(row.period)} ${row.period}`;
      return `${row.person.firstName} ${row.person.lastName} ${row.person.dni} ${mes}`
        .toLowerCase()
        .includes(value);
    });
  }, [query, rows]);

  const paidCount = filtered.filter((row) => row.paid).length;
  const missingCount = filtered.length - paidCount;
  const years = Array.from({ length: 8 }, (_, index) => String(new Date().getFullYear() - 2 + index));

  function exportExcel() {
    downloadExcel(
      `pagos-del-mes-${allPeriods ? "todos" : period}.xls`,
      "Pagos del Mes",
      ["Nombres", "Apellidos", "DNI", "Mes", "PGO", "Importe"],
      filtered.map((row) => [
        row.person.firstName,
        row.person.lastName,
        row.person.dni || "—",
        formatPeriodCode(row.period),
        row.paid ? "SI" : "NO",
        row.payment
          ? formatBankMoney(row.payment.amountCents, row.payment.currency === "USD" ? "USD" : "ARS")
          : row.transfers[0]
            ? formatBankMoney(row.transfers[0].amountCents, row.transfers[0].currency)
            : "",
      ]),
    );
  }

  async function removePaid(row: MonthRow) {
    if (!row.paid) return;
    if (!window.confirm(`¿Quitar el pago de ${row.person.firstName} ${row.person.lastName}?`)) return;
    if (row.payment) {
      const formData = new FormData();
      formData.set("id", String(row.payment.id));
      await deleteManualPaymentAction(formData);
      return;
    }
    for (const transfer of row.transfers) {
      const formData = new FormData();
      formData.set("id", String(transfer.id));
      await deleteBankMovementAction(formData);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <CalendarDays size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">Pagos del mes</h1>
          <p className="mt-2 text-sm text-primary/80">
            Control mensual de pagos cruzando padrón de clientes y transferencias.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm shadow-primary/5 md:p-8">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-full bg-[#e8f3e3] px-3 py-1 text-[11px] tracking-[0.12em] text-[#2d4739] uppercase">
            Pagos: {paidCount}
          </span>
          <span className="rounded-full bg-[#f8e6e4] px-3 py-1 text-[11px] tracking-[0.12em] text-[#7a3a34] uppercase">
            Faltantes: {missingCount}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#6f8a74]"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre o mes..."
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
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-2 rounded-full border border-[#d7e6d3] px-4 py-2.5 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
          >
            <RefreshCw size={14} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={exportExcel}
            className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] px-4 py-2.5 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
          >
            <FileSpreadsheet size={14} />
            Exportar
          </button>
        </div>

        <p className="mt-4 text-sm text-[#6f8a74]">
          Período: <span className="font-medium text-primary">{formatPeriodLabel(period)}</span>
          {allPeriods ? " · todos los períodos" : ""}
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e3eee0] bg-[#f7faf5] text-[11px] tracking-[0.14em] text-[#6f8a74] uppercase">
                <th className="px-3 py-3 font-medium">Nombres</th>
                <th className="px-3 py-3 font-medium">Apellidos</th>
                <th className="px-3 py-3 font-medium">Mes</th>
                <th className="px-3 py-3 font-medium">PGO</th>
                <th className="px-3 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const wa = row.person.phone
                  ? whatsappUrl(
                      row.person.phone,
                      applyTemplate(settings.messagePaymentMonth, {
                        nombres: row.person.firstName,
                        apellidos: row.person.lastName,
                        mes: formatPeriodLabel(row.period),
                      }),
                    )
                  : "";
                return (
                  <tr key={row.key} className="border-b border-[#f0f5ee]">
                    <td className={`px-3 py-3 font-medium ${row.paid ? "text-primary" : "text-[#7a3a34]"}`}>
                      {row.person.firstName || "—"}
                    </td>
                    <td className={`px-3 py-3 ${row.paid ? "text-primary" : "text-[#7a3a34]"}`}>
                      {row.person.lastName || "—"}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{formatPeriodCode(row.period)}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex min-w-10 justify-center rounded-md px-2 py-1 text-[10px] tracking-[0.14em] uppercase ${
                          row.paid ? "bg-[#e8f3e3] text-[#2d4739]" : "bg-[#f8e6e4] text-[#7a3a34]"
                        }`}
                      >
                        {row.paid ? "SI" : "NO"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        {wa ? (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full p-2 text-[#4f7a58] hover:bg-[#e8f3e3]"
                            aria-label="WhatsApp"
                            title="WhatsApp"
                          >
                            <MessageCircle size={15} />
                          </a>
                        ) : (
                          <span className="rounded-full p-2 text-[#c5d3c4]">
                            <MessageCircle size={15} />
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditing(row)}
                          className="rounded-full p-2 text-[#6f8a74] hover:bg-[#e8f3e3] hover:text-primary"
                          aria-label="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        {row.paid ? (
                          <button
                            type="button"
                            onClick={() => setDetail(row)}
                            className="rounded-full p-2 text-[#3d6b8a] hover:bg-[#e8f0f5]"
                            aria-label="Ver transferencia"
                            title="Ver transferencia"
                          >
                            <ArrowDownLeft size={15} />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={!row.paid}
                          onClick={() => removePaid(row)}
                          className={`rounded-full p-2 ${
                            row.paid
                              ? "text-[#7a3a34] hover:bg-[#f8e6e4]"
                              : "cursor-not-allowed text-[#c5d3c4]"
                          }`}
                          aria-label="Eliminar pago"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
        <ManualPaymentModal
          person={editing.person}
          payment={editing.payment}
          period={editing.period}
          defaultCurrency={settings.currency}
          onClose={() => setEditing(null)}
          action={upsertManualPaymentAction}
        />
      ) : null}

      {detail ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-primary/35"
            onClick={() => setDetail(null)}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-[#f9f7f2] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-heading text-2xl text-primary uppercase">Transferencia</h2>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="text-[#6f8a74] hover:text-primary"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {detail.person.firstName} {detail.person.lastName} · {formatPeriodLabel(detail.period)}
            </p>
            <div className="mt-5 space-y-3">
              {detail.payment ? (
                <div className="rounded-2xl bg-white px-4 py-3 text-sm">
                  <p className="text-[#6f8a74]">Pago manual</p>
                  <p className="mt-1 text-primary">
                    {formatBankMoney(
                      detail.payment.amountCents,
                      detail.payment.currency === "USD" ? "USD" : "ARS",
                    )}{" "}
                    · {detail.payment.method}
                  </p>
                </div>
              ) : null}
              {detail.transfers.map((transfer) => (
                <div key={transfer.id} className="rounded-2xl bg-white px-4 py-3 text-sm">
                  <p className="text-primary">{transfer.concept}</p>
                  <p className="mt-1 text-[#6f8a74]">
                    {formatExtractDate(transfer.occurredAt)} · {transfer.reference || "Sin referencia"} ·{" "}
                    {formatBankMoney(transfer.amountCents, transfer.currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
