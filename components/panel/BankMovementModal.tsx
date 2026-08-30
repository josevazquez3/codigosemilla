"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { fieldClass } from "@/components/panel/ui";
import type { PanelBankMovement } from "@/lib/panel-data";

function toLocalInput(value?: string) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function BankMovementModal({
  title,
  movement,
  onClose,
  action,
}: {
  title: string;
  movement: PanelBankMovement | null;
  onClose: () => void;
  action: (formData: FormData) => Promise<{ error?: string; ok?: boolean }>;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

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
        {movement ? <input type="hidden" name="id" value={movement.id} /> : null}
        <div className="flex items-start justify-between gap-4 border-b border-[#d7e6d3] px-6 py-5">
          <div>
            <h2 className="font-heading text-3xl text-primary uppercase">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Datos del movimiento bancario</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#6f8a74] hover:text-primary" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Fecha</span>
            <input
              name="occurredAt"
              type="datetime-local"
              required
              defaultValue={toLocalInput(movement?.occurredAt)}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Referencia</span>
            <input name="reference" defaultValue={movement?.reference} className={fieldClass} />
          </label>
          <label className="block space-y-2 md:col-span-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Concepto</span>
            <input name="concept" defaultValue={movement?.concept} required className={fieldClass} />
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Importe</span>
            <input
              name="amount"
              type="number"
              step="0.01"
              required
              defaultValue={movement ? (movement.amountCents / 100).toFixed(2) : ""}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Moneda</span>
            <select name="currency" defaultValue={movement?.currency ?? "ARS"} className={fieldClass}>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </label>
          {error ? <p className="md:col-span-2 text-sm text-[#7a3a34]">{error}</p> : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-[#d7e6d3] px-6 py-4">
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
            className="rounded-full bg-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.16em] text-white uppercase hover:bg-primary disabled:opacity-70"
          >
            {pending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
