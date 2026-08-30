"use client";

import { useEffect, useRef, useState } from "react";
import { Link2, X } from "lucide-react";
import { createBitacoraEntryAction, fetchBitacoraTitleAction } from "@/app/panel/actions";
import { fieldClass } from "@/components/panel/ui";

export function BitacoraEntryModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const lastLookup = useRef("");

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed || lastLookup.current === trimmed) return;
    const timer = window.setTimeout(async () => {
      lastLookup.current = trimmed;
      setLookingUp(true);
      const result = await fetchBitacoraTitleAction(trimmed);
      setLookingUp(false);
      if (result.title) setTitle((current) => current || result.title);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [url]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-primary/35" onClick={onClose} />
      <form
        className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-[#f9f7f2] shadow-2xl"
        action={async (formData) => {
          setPending(true);
          setError("");
          const result = await createBitacoraEntryAction(formData);
          setPending(false);
          if (result?.error) {
            setError(result.error);
            return;
          }
          onClose();
        }}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <h2 className="font-heading text-3xl text-primary uppercase">Nuevo registro</h2>
          <button type="button" onClick={onClose} className="text-[#6f8a74] hover:text-primary" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-4 px-6 py-5">
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">
              URL (Drive u otro enlace)
            </span>
            <input
              name="url"
              required
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://drive.google.com/..."
              className={fieldClass}
            />
            <p className="text-xs text-[#6f8a74]">
              Al pegar un enlace de Google Drive, el título se completa con el nombre del archivo.
            </p>
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Título</span>
            <input
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={lookingUp ? "Buscando el nombre en Drive..." : "Se completa automáticamente desde Drive"}
              className={fieldClass}
            />
          </label>
          <p className="rounded-2xl bg-[#eef3ea] px-4 py-3 text-sm text-[#4f7a58]">
            La fecha de carga se registrará automáticamente al guardar.
          </p>
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
            className="inline-flex items-center gap-2 rounded-full bg-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.16em] text-white uppercase hover:bg-[#2d4739] disabled:opacity-70"
          >
            <Link2 size={14} />
            {pending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
