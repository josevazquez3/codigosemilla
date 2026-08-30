"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X } from "lucide-react";
import { submitJoinApplicationAction } from "@/app/actions/join";

const fieldClass =
  "w-full rounded-xl border border-[#d7cfc0] bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#c4a35a]";

export function JoinApplicationModal({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const modal = (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <button type="button" aria-label="Cerrar" className="fixed inset-0 bg-primary/55 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex min-h-full items-start justify-center px-4 py-8 sm:items-safe-center">
        <div className="relative w-full max-w-lg rounded-3xl bg-[#f7f3ea] shadow-2xl">
        {sent ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[#c4a35a]" />
            <h2 className="font-heading text-3xl text-primary uppercase">Solicitud enviada</h2>
            <p className="mt-3 text-sm text-[#6b5e4e]">
              Recibimos tus datos. El equipo de Conciencia Estelar se va a comunicar con vos.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-[#c4a35a] px-6 py-2.5 text-xs tracking-[0.16em] text-white uppercase"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form
            action={async (formData) => {
              setPending(true);
              setError("");
              const result = await submitJoinApplicationAction(formData);
              setPending(false);
              if (result?.error) {
                setError(result.error);
                return;
              }
              setSent(true);
            }}
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-6">
              <div>
                <h2 className="font-heading text-3xl text-primary uppercase">Quiero unirme</h2>
                <p className="mt-2 text-sm text-[#6b5e4e]">
                  Completá todos los datos para enviar tu solicitud de inscripción.
                </p>
              </div>
              <button type="button" onClick={onClose} className="text-[#6b5e4e] hover:text-primary" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-4 px-6 py-5">
              <label className="flex items-center gap-3 text-sm text-primary">
                <input type="checkbox" name="isSpecialRoom" className="h-4 w-4 accent-[#c4a35a]" />
                Marca la tilde para Sala Especial
              </label>
              <Field label="Nombres" name="firstName" required />
              <Field label="Apellidos" name="lastName" required />
              <label className="block space-y-2">
                <span className="text-[11px] tracking-[0.2em] text-[#8a7a62] uppercase">DNI o pasaporte</span>
                <input
                  name="dni"
                  required
                  inputMode="numeric"
                  placeholder="EJ: 30123456"
                  className={fieldClass}
                />
                <p className="text-xs text-[#8a7a62]">Solo números, sin puntos ni guiones.</p>
              </label>
              <label className="block space-y-2">
                <span className="text-[11px] tracking-[0.2em] text-[#8a7a62] uppercase">Fecha de nacimiento</span>
                <input name="birthDate" type="date" required className={fieldClass} />
              </label>
              <Field label="Correo electrónico" name="email" type="email" required />
              <label className="block space-y-2">
                <span className="text-[11px] tracking-[0.2em] text-[#8a7a62] uppercase">Nº de celular</span>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="EJ: +54 9 221 555-1234"
                  className={fieldClass}
                />
                <p className="text-xs text-[#8a7a62]">
                  Podés incluir código de país con +, ej: +54, +55.
                </p>
              </label>
              <Field label="Lugar de residencia" name="residence" required />
              {error ? <p className="text-sm text-[#7a3a34]">{error}</p> : null}
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#2d4739] px-5 py-2.5 text-xs tracking-[0.16em] text-primary uppercase"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-[#c4a35a] px-5 py-2.5 text-xs tracking-[0.16em] text-white uppercase disabled:opacity-70"
              >
                {pending ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] tracking-[0.2em] text-[#8a7a62] uppercase">{label}</span>
      <input name={name} type={type} required={required} className={fieldClass} />
    </label>
  );
}
