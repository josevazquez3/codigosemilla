"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { fieldClass } from "@/components/panel/ui";
import type { PanelManualPayment, PanelPadronPerson } from "@/lib/panel-data";

export function ManualPaymentModal({
  person,
  payment,
  period,
  defaultCurrency,
  onClose,
  action,
}: {
  person: PanelPadronPerson;
  payment?: PanelManualPayment;
  period: string;
  defaultCurrency: string;
  onClose: () => void;
  action: (formData: FormData) => Promise<{ error?: string; ok?: boolean }>;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [currency, setCurrency] = useState(
    payment?.currency === "USD" || defaultCurrency === "USD" ? "USD" : "ARS",
  );

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const amountLabel = currency === "USD" ? "Monto $USD" : "Monto $";
  const amountPlaceholder = currency === "USD" ? "Ej: 80,00" : "Ej: 25.000,00";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-primary/35" onClick={onClose} />
      <form
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-[#f9f7f2] shadow-2xl"
        action={async (formData) => {
          setPending(true);
          setError("");
          const result = await action(formData);
          setPending(false);
          if (result?.error) {
            setError(result.error);
            return;
          }
          onClose();
        }}
      >
        <input type="hidden" name="padronId" value={person.id} />
        <input type="hidden" name="period" value={period} />
        <input type="hidden" name="method" value="Manual" />

        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
          <h2 className="font-heading text-3xl text-primary uppercase">Ingresar pago</h2>
          <button type="button" onClick={onClose} className="text-[#6f8a74] hover:text-primary" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Nombres</span>
            <input
              name="firstName"
              required
              readOnly
              defaultValue={person.firstName}
              className={`${fieldClass} bg-[#fbfaf6]`}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Apellidos</span>
            <input
              name="lastName"
              required
              readOnly
              defaultValue={person.lastName}
              className={`${fieldClass} bg-[#fbfaf6]`}
            />
          </label>
          <label className="block space-y-2 md:col-span-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">DNI</span>
            <input name="dni" readOnly defaultValue={person.dni || "—"} className={`${fieldClass} bg-[#fbfaf6]`} />
          </label>
          <label className="block space-y-2 md:col-span-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Fecha de pago</span>
            <input
              name="paidAt"
              type="date"
              required
              defaultValue={payment?.paidAt.slice(0, 10) ?? new Date().toISOString().slice(0, 10)}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Moneda</span>
            <select
              name="currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className={fieldClass}
            >
              <option value="ARS">$ Pesos (ARS)</option>
              <option value="USD">$USD Dólares</option>
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">{amountLabel}</span>
            <input
              name="amount"
              required
              inputMode="decimal"
              placeholder={amountPlaceholder}
              defaultValue={
                payment
                  ? (payment.amountCents / 100).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : ""
              }
              className={fieldClass}
            />
          </label>
          {error ? <p className="md:col-span-2 text-sm text-[#7a3a34]">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.16em] text-primary uppercase"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-[#2d4739] px-5 py-2.5 text-xs tracking-[0.16em] text-white uppercase hover:bg-[#243a2f] disabled:opacity-70"
          >
            {pending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
