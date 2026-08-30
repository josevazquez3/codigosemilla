"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { fieldClass } from "@/components/panel/ui";
import type { PanelZoomMeeting } from "@/lib/panel-data";

export function ZoomMeetingModal({
  title,
  meeting,
  onClose,
  action,
}: {
  title: string;
  meeting: PanelZoomMeeting | null;
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
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-[#f9f7f2] shadow-2xl"
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
        {meeting ? <input type="hidden" name="id" value={meeting.id} /> : null}
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <h2 className="font-heading text-3xl text-primary uppercase">{title}</h2>
          <button type="button" onClick={onClose} className="text-[#6f8a74] hover:text-primary" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-4 px-6 py-5">
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Título</span>
            <input
              name="title"
              required
              defaultValue={meeting?.title}
              placeholder="Ej: Encuentro dominical"
              className={fieldClass}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Enlace de Zoom</span>
            <input
              name="joinUrl"
              required
              defaultValue={meeting?.joinUrl}
              placeholder="https://zoom.us/j/..."
              className={fieldClass}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">ID de reunión</span>
            <input
              name="meetingId"
              defaultValue={meeting?.meetingId}
              placeholder="Opcional"
              className={fieldClass}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Clave de acceso</span>
            <input
              name="passcode"
              defaultValue={meeting?.passcode}
              placeholder="Opcional"
              className={fieldClass}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Datos adicionales</span>
            <textarea
              name="notes"
              defaultValue={meeting?.notes}
              placeholder="Instrucciones u observaciones para ingresar"
              rows={4}
              className={`${fieldClass} min-h-[96px] resize-none`}
            />
          </label>
          {error ? <p className="text-sm text-[#7a3a34]">{error}</p> : null}
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
