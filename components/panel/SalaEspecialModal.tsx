"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  createSpecialRoomAction,
  fetchYouTubeTitleAction,
  updateSpecialRoomAction,
} from "@/app/panel/actions";
import { fieldClass } from "@/components/panel/ui";
import type { PanelSpecialRoom } from "@/lib/panel-data";

export function SalaEspecialModal({
  room,
  onClose,
}: {
  room: PanelSpecialRoom | null;
  onClose: () => void;
}) {
  const [url, setUrl] = useState(room?.youtubeUrl ?? "");
  const [title, setTitle] = useState(room?.title ?? "");
  const [occurredAt, setOccurredAt] = useState(room?.occurredAt ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const lastLookup = useRef(room?.youtubeUrl ?? "");

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
      const result = await fetchYouTubeTitleAction(trimmed);
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
          const action = room ? updateSpecialRoomAction : createSpecialRoomAction;
          const result = await action(formData);
          setPending(false);
          if (result?.error) {
            setError(result.error);
            return;
          }
          onClose();
        }}
      >
        {room ? <input type="hidden" name="id" value={room.id} /> : null}
        <input type="hidden" name="enabled" value={room ? String(room.enabled) : "true"} />
        <div className="px-6 pt-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-heading text-3xl text-primary uppercase">
              {room ? "Editar sala de membresía" : "Agregar sala de membresía"}
            </h2>
            <button type="button" onClick={onClose} className="text-[#6f8a74] hover:text-primary" aria-label="Cerrar">
              <X size={18} />
            </button>
          </div>
          <p className="mt-2 text-sm text-[#6f8a74]">Pegá una URL de YouTube y completá los datos.</p>
        </div>
        <div className="grid gap-4 px-6 py-5">
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">URL (YouTube)</span>
            <input
              name="youtubeUrl"
              required
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className={fieldClass}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Título</span>
            <input
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={lookingUp ? "Buscando el título en YouTube..." : "Ej: Encuentro Luna Llena — Junio"}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Fecha</span>
            <input
              name="occurredAt"
              type="date"
              required
              value={occurredAt}
              onChange={(event) => setOccurredAt(event.target.value)}
              className={fieldClass}
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
            className="rounded-full bg-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.16em] text-white uppercase hover:bg-[#2d4739] disabled:opacity-70"
          >
            {pending ? "Guardando..." : "Guardar sala"}
          </button>
        </div>
      </form>
    </div>
  );
}
