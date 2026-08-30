"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { deleteActivationAction, toggleActivationAction } from "@/app/panel/actions";
import { ActivacionModal } from "@/components/panel/ActivacionModal";
import { images } from "@/lib/images";
import type { PanelActivation } from "@/lib/panel-data";
import { youtubeThumbnailUrl, youtubeWatchUrl } from "@/lib/youtube";

function formatDay(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function ActivacionesBoard({
  activations,
  canManage = true,
  allowedIds = null,
  blockedMessage = "",
}: {
  activations: PanelActivation[];
  canManage?: boolean;
  allowedIds?: number[] | null;
  blockedMessage?: string;
}) {
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState<"create" | PanelActivation | null>(null);
  const [blocked, setBlocked] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return activations;
    return activations.filter((item) => {
      const date = formatDay(item.occurredAt);
      return (
        item.title.toLowerCase().includes(needle) ||
        date.includes(needle) ||
        item.occurredAt.includes(needle)
      );
    });
  }, [activations, query]);

  function isUnlocked(item: PanelActivation) {
    if (canManage) return item.enabled;
    return Boolean(allowedIds?.includes(item.id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
            <Sparkles size={26} />
          </div>
          <div>
            <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">Activaciones</h1>
            <p className="mt-2 text-sm text-primary/80">Biblioteca de activaciones y grabaciones</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[240px] flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#6f8a74]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título o fecha..."
            className="w-full rounded-full border border-[#d7e6d3] bg-white px-11 py-3 text-sm text-foreground outline-none focus:border-[#4f7a58]"
          />
        </label>
        {canManage ? (
          <button
            type="button"
            onClick={() => setDrawer("create")}
            className="inline-flex items-center gap-2 rounded-full bg-[#4f7a58] px-5 py-3 text-[11px] tracking-[0.14em] text-white uppercase hover:bg-[#2d4739]"
          >
            <Plus size={16} />
            Agregar activación
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-[#d7e6d3] bg-white px-6 py-16 text-center text-sm text-[#6f8a74] shadow-sm shadow-primary/5">
          {activations.length === 0 ? (
            <>
              <p>Todavía no hay activaciones en la biblioteca.</p>
              {canManage ? (
                <p className="mt-1">
                  Usá <strong className="font-medium text-primary">Agregar activación</strong> para
                  cargar la primera.
                </p>
              ) : null}
            </>
          ) : (
            <p>No hay activaciones que coincidan con la búsqueda.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const thumb = youtubeThumbnailUrl(item.youtubeUrl);
            const watch = youtubeWatchUrl(item.youtubeUrl);
            const unlocked = isUnlocked(item);
            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-3xl border border-[#d7e6d3] bg-white shadow-sm shadow-primary/5"
              >
                <div className="relative aspect-video bg-[#eef3ea]">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      className={`h-full w-full object-cover ${unlocked ? "" : "opacity-50"}`}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#4f7a58]">
                      <Sparkles size={32} />
                    </div>
                  )}
                  {!unlocked ? (
                    <span className="absolute top-3 right-3 rounded-full bg-primary/80 px-3 py-1 text-[10px] tracking-[0.16em] text-white uppercase">
                      Oculto
                    </span>
                  ) : null}
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] tracking-[0.14em] text-primary uppercase shadow-sm">
                    <span className="inline-block h-2 w-2 rounded-sm bg-[#e11d48]" />
                    YouTube
                  </span>
                  <img
                    src={images.portrait}
                    alt=""
                    className="absolute right-3 -bottom-5 h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                </div>
                <div className="px-5 pt-8 pb-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-heading text-xl leading-snug text-primary uppercase">
                      {item.title}
                    </h2>
                    {unlocked ? (
                      <a
                        href={watch}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f3e3] text-[#4f7a58] hover:bg-[#d7e6d3]"
                        aria-label="Abrir en YouTube"
                      >
                        <ExternalLink size={15} />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setBlocked(true)}
                        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f8e6e4] text-[#7a3a34]"
                        aria-label="Video no habilitado"
                      >
                        <ExternalLink size={15} />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-[#6f8a74]">{formatDay(item.occurredAt)}</p>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-[#eef3ea] pt-4">
                    {canManage ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setDrawer(item)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#d7e6d3] px-3 py-1.5 text-[10px] tracking-[0.14em] text-primary uppercase hover:bg-[#e8f3e3]"
                        >
                          <Pencil size={12} />
                          Editar
                        </button>
                        <form action={toggleActivationAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <button
                            type="submit"
                            className={
                              item.enabled
                                ? "inline-flex items-center gap-1.5 rounded-full border border-[#4f7a58] bg-[#e8f3e3] px-3 py-1.5 text-[10px] tracking-[0.14em] text-[#2d4739] uppercase"
                                : "inline-flex items-center gap-1.5 rounded-full border border-[#e2b8b4] bg-[#f8e6e4] px-3 py-1.5 text-[10px] tracking-[0.14em] text-[#7a3a34] uppercase"
                            }
                          >
                            {item.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
                            {item.enabled ? "Habilitado" : "Deshabilitado"}
                          </button>
                        </form>
                        <form
                          action={async (formData) => {
                            if (!window.confirm(`¿Eliminar la activación ${item.title}?`)) return;
                            await deleteActivationAction(formData);
                          }}
                        >
                          <input type="hidden" name="id" value={item.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#e2b8b4] bg-[#f8e6e4] px-3 py-1.5 text-[10px] tracking-[0.14em] text-[#7a3a34] uppercase hover:bg-[#f3d4d0]"
                          >
                            <Trash2 size={12} />
                            Eliminar
                          </button>
                        </form>
                      </>
                    ) : (
                      <span
                        className={
                          unlocked
                            ? "inline-flex items-center gap-1.5 rounded-full border border-[#4f7a58] bg-[#e8f3e3] px-3 py-1.5 text-[10px] tracking-[0.14em] text-[#2d4739] uppercase"
                            : "inline-flex items-center gap-1.5 rounded-full border border-[#e2b8b4] bg-[#f8e6e4] px-3 py-1.5 text-[10px] tracking-[0.14em] text-[#7a3a34] uppercase"
                        }
                      >
                        {unlocked ? <Eye size={12} /> : <EyeOff size={12} />}
                        {unlocked ? "Habilitado" : "Deshabilitado"}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {drawer && canManage ? (
        <ActivacionModal
          activation={drawer === "create" ? null : drawer}
          onClose={() => setDrawer(null)}
        />
      ) : null}

      {blocked ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-primary/35"
            onClick={() => setBlocked(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-[#f9f7f2] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-heading text-2xl text-primary uppercase">Video no habilitado</h2>
              <button
                type="button"
                onClick={() => setBlocked(false)}
                className="text-[#6f8a74] hover:text-primary"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-4 text-sm text-primary">
              {blockedMessage || "Este video todavía no está habilitado para tu usuario."}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setBlocked(false)}
                className="rounded-full bg-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.16em] text-white uppercase"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
