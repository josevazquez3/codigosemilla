"use client";

import { useEffect, useState } from "react";
import { FileDown, X } from "lucide-react";
import { fieldClass } from "@/components/panel/ui";
import { padronToCsv } from "@/lib/padron-csv";
import type { PanelPadronPerson } from "@/lib/panel-data";

export function PadronPersonModal({
  title,
  subtitle = "Datos del Padrón de Usuarios",
  person,
  onClose,
  action,
}: {
  title: string;
  subtitle?: string;
  person: PanelPadronPerson | null;
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

  function exportOne() {
    if (!person) return;
    const blob = new Blob([padronToCsv([person])], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ficha-${person.lastName || person.firstName || "usuario"}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-primary/35" onClick={onClose} />
      <form
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-[#f9f7f2] shadow-2xl"
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
        {person ? <input type="hidden" name="id" value={person.id} /> : null}
        <div className="flex items-start justify-between gap-4 border-b border-[#d7e6d3] px-6 py-5">
          <div>
            <h2 className="font-heading text-3xl text-primary uppercase">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#6f8a74] hover:text-primary" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
          <Field label="Nombres" name="firstName" defaultValue={person?.firstName} required />
          <Field label="Apellidos" name="lastName" defaultValue={person?.lastName} />
          <Field label="DNI o pasaporte" name="dni" defaultValue={person?.dni} />
          <Field label="Fecha de nacimiento" name="birthDate" type="date" defaultValue={person?.birthDate} />
          <Field label="Correo electrónico" name="email" type="email" defaultValue={person?.email} />
          <Field label="Nº de celular" name="phone" defaultValue={person?.phone} />
          <div className="md:col-span-2">
            <Field label="Lugar de residencia" name="residence" defaultValue={person?.residence} />
          </div>
          {error ? <p className="md:col-span-2 text-sm text-[#7a3a34]">{error}</p> : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d7e6d3] px-6 py-4">
          {person ? (
            <button
              type="button"
              onClick={exportOne}
              className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] px-4 py-2.5 text-xs tracking-[0.14em] text-[#2d4739] uppercase"
            >
              <FileDown size={14} />
              Exportar
            </button>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap gap-2">
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
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">{label}</span>
      <input name={name} type={type} required={required} defaultValue={defaultValue} className={fieldClass} />
    </label>
  );
}
