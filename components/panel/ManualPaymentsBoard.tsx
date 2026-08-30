"use client";

import { useMemo, useState } from "react";
import { Banknote, CalendarDays, RefreshCw, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { upsertManualPaymentAction } from "@/app/panel/actions";
import { ManualPaymentModal } from "@/components/panel/ManualPaymentModal";
import { fieldClass } from "@/components/panel/ui";
import { currentPeriodValue, formatBirthDate, formatPeriodLabel } from "@/lib/panel-format";
import type { PanelManualPayment, PanelPadronPerson } from "@/lib/panel-data";

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

export function ManualPaymentsBoard({
  people,
  payments,
  currency,
}: {
  people: PanelPadronPerson[];
  payments: PanelManualPayment[];
  currency: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState(currentPeriodValue());
  const [monthOpen, setMonthOpen] = useState(false);
  const [draftMonth, setDraftMonth] = useState(period.slice(5, 7));
  const [draftYear, setDraftYear] = useState(period.slice(0, 4));
  const [editing, setEditing] = useState<PanelPadronPerson | null>(null);

  const paymentByPerson = useMemo(() => {
    const map = new Map<number, PanelManualPayment>();
    for (const payment of payments) {
      if (payment.period === period) map.set(payment.padronId, payment);
    }
    return map;
  }, [payments, period]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    const rows = people.filter((person) => {
      if (!value) return true;
      return `${person.firstName} ${person.lastName} ${person.dni}`.toLowerCase().includes(value);
    });
    return rows.sort((a, b) => {
      const aPaid = paymentByPerson.has(a.id) ? 1 : 0;
      const bPaid = paymentByPerson.has(b.id) ? 1 : 0;
      if (aPaid !== bPaid) return aPaid - bPaid;
      return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "es");
    });
  }, [people, paymentByPerson, query]);

  const unpaid = people.filter((person) => !paymentByPerson.has(person.id)).length;
  const periodLabel = formatPeriodLabel(period);
  const years = Array.from({ length: 8 }, (_, index) => String(new Date().getFullYear() - 2 + index));

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <Banknote size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">
            Ingresar pagos manual
          </h1>
          <p className="mt-2 text-sm text-primary/80">Registro manual de pagos de clientes del padrón.</p>
        </div>
      </div>

      <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm shadow-primary/5 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-primary">
              Período: <span className="font-semibold">{periodLabel}</span>
            </p>
            <p className="mt-1 text-sm text-[#6f8a74]">
              {unpaid} clientes sin pago registrado en {periodLabel}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative min-w-[220px] flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#6f8a74]"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre o DNI"
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
              className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] px-4 py-2.5 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
            >
              <CalendarDays size={14} />
              Calendario
            </button>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] px-4 py-2.5 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
            >
              <RefreshCw size={14} />
              Actualizar
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e3eee0] bg-[#f7faf5] text-[11px] tracking-[0.14em] text-[#6f8a74] uppercase">
                <th className="px-3 py-3 font-medium">Nombres</th>
                <th className="px-3 py-3 font-medium">Apellidos</th>
                <th className="px-3 py-3 font-medium">DNI</th>
                <th className="px-3 py-3 font-medium">Estado</th>
                <th className="px-3 py-3 font-medium">Fecha de pago</th>
                <th className="px-3 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((person, index) => {
                const payment = paymentByPerson.get(person.id);
                return (
                  <tr
                    key={person.id}
                    className={`border-b border-[#f0f5ee] ${index % 2 === 1 ? "bg-[#f7faf5]" : "bg-white"}`}
                  >
                    <td className="px-3 py-3 font-medium text-primary">{person.firstName || "—"}</td>
                    <td className="px-3 py-3 text-primary">{person.lastName || "—"}</td>
                    <td className="px-3 py-3 text-muted-foreground">{person.dni || "—"}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[10px] tracking-[0.14em] uppercase ${
                          payment
                            ? "bg-[#e8f3e3] text-[#2d4739]"
                            : "bg-[#f8e6e4] text-[#7a3a34]"
                        }`}
                      >
                        {payment ? "Pago" : "No pago"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {payment ? formatBirthDate(payment.paidAt.slice(0, 10)) : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => setEditing(person)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4f7a58] text-[#4f7a58] hover:bg-[#e8f3e3]"
                        aria-label={`Registrar pago de ${person.firstName} ${person.lastName}`}
                      >
                        $
                      </button>
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
          person={editing}
          payment={paymentByPerson.get(editing.id)}
          period={period}
          defaultCurrency={currency}
          onClose={() => setEditing(null)}
          action={upsertManualPaymentAction}
        />
      ) : null}
    </div>
  );
}
