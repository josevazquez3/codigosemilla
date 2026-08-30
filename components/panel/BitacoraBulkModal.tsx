"use client";

import { useEffect, useState } from "react";
import { Layers, Link2, X } from "lucide-react";
import { createBitacoraBulkAction, fetchBitacoraTitlesAction } from "@/app/panel/actions";
import { fieldClass } from "@/components/panel/ui";
import { parseBitacoraUrls } from "@/lib/drive-title";

type PendingItem = { url: string; title: string };

export function BitacoraBulkModal({ onClose }: { onClose: () => void }) {
  const [raw, setRaw] = useState("");
  const [items, setItems] = useState<PendingItem[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  async function addUrls() {
    const urls = parseBitacoraUrls(raw);
    if (!urls.length) {
      setError("Pegá al menos una URL.");
      return;
    }
    setAdding(true);
    setError("");
    const result = await fetchBitacoraTitlesAction(urls);
    setAdding(false);
    const seen = new Set(items.map((item) => item.url.toLowerCase()));
    const next = [...items];
    for (const item of result.items) {
      if (seen.has(item.url.toLowerCase()) || next.length >= 50) continue;
      seen.add(item.url.toLowerCase());
      next.push(item);
    }
    setItems(next);
    setRaw("");
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-primary/35" onClick={onClose} />
      <form
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#f9f7f2] shadow-2xl"
        action={async () => {
          if (!items.length) {
            setError("Agregá al menos una URL.");
            return;
          }
          setPending(true);
          setError("");
          const formData = new FormData();
          formData.set("items", JSON.stringify(items));
          const result = await createBitacoraBulkAction(formData);
          setPending(false);
          if (result?.error) {
            setError(result.error);
            return;
          }
          onClose();
        }}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h2 className="font-heading text-3xl text-primary uppercase">Carga masiva — Bitácora</h2>
            <p className="mt-2 text-sm text-[#6f8a74]">
              Pegá varias URLs de Drive u otros enlaces. Los títulos de Drive se completan solos; la
              fecha de carga se registra al guardar.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-[#6f8a74] hover:text-primary" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-4 px-6 py-5">
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">
              Pegar URLs (Drive u otros enlaces)
            </span>
            <textarea
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              rows={6}
              placeholder={"https://drive.google.com/file/d/...\nhttps://drive.google.com/file/d/..."}
              className={`${fieldClass} min-h-[140px] resize-none`}
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={addUrls}
              disabled={adding}
              className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] px-4 py-2 text-xs tracking-[0.16em] text-primary uppercase disabled:opacity-70"
            >
              <Link2 size={14} />
              {adding ? "Agregando..." : "Agregar URLs"}
            </button>
            <p className="text-xs text-[#6f8a74]">Hasta 50 registros — duplicados se omiten</p>
          </div>
          {items.length ? (
            <ul className="max-h-48 space-y-2 overflow-y-auto rounded-2xl border border-[#d7e6d3] bg-white p-3">
              {items.map((item) => (
                <li key={item.url} className="text-sm text-primary">
                  <span className="block font-medium">{item.title || "Sin título"}</span>
                  <span className="block truncate text-xs text-[#6f8a74]">{item.url}</span>
                </li>
              ))}
            </ul>
          ) : null}
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
            disabled={pending || !items.length}
            className="inline-flex items-center gap-2 rounded-full bg-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.16em] text-white uppercase hover:bg-[#2d4739] disabled:opacity-70"
          >
            <Layers size={14} />
            {pending ? "Guardando..." : `Guardar todos (${items.length})`}
          </button>
        </div>
      </form>
    </div>
  );
}
