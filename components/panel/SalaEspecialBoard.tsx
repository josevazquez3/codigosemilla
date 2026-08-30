"use client";

import { useMemo, useState } from "react";
import {
  Crown,
  Eye,
  EyeOff,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { deleteSpecialRoomAction, toggleSpecialRoomAction } from "@/app/panel/actions";
import { SalaEspecialModal } from "@/components/panel/SalaEspecialModal";
import type { PanelSpecialRoom } from "@/lib/panel-data";
import { youtubeThumbnailUrl, youtubeWatchUrl } from "@/lib/youtube";

function formatDay(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function SalaEspecialBoard({
  rooms,
  canManage = true,
}: {
  rooms: PanelSpecialRoom[];
  canManage?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState<"create" | PanelSpecialRoom | null>(null);

  const visible = canManage ? rooms : rooms.filter((item) => item.enabled);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return visible;
    return visible.filter((item) => {
      const date = formatDay(item.occurredAt);
      return (
        item.title.toLowerCase().includes(needle) ||
        date.includes(needle) ||
        item.occurredAt.includes(needle)
      );
    });
  }, [visible, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <Crown size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">Sala Especial</h1>
          <p className="mt-2 text-sm text-primary/80">Biblioteca de sala especial y grabaciones.</p>
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
            Agregar sala
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-[#d7e6d3] bg-white px-6 py-16 text-center text-sm text-[#6f8a74] shadow-sm shadow-primary/5">
          {visible.length === 0 ? (
            <>
              <p>Todavía no hay salas en la biblioteca.</p>
              {canManage ? (
                <p className="mt-1">
                  Usá <strong className="font-medium text-primary">Agregar sala</strong> para
                  cargar la primera.
                </p>
              ) : null}
            </>
          ) : (
            <p>No hay salas que coincidan con la búsqueda.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const thumb = youtubeThumbnailUrl(item.youtubeUrl);
            const watch = youtubeWatchUrl(item.youtubeUrl);
            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-3xl border border-[#d7e6d3] bg-white shadow-sm shadow-primary/5"
              >
                <div className="relative aspect-video bg-[#eef3ea]">
                  {thumb ? (
                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#4f7a58]">
                      <Crown size={32} />
                    </div>
                  )}
                  {!item.enabled ? (
                    <span className="absolute top-3 right-3 rounded-full bg-primary/80 px-3 py-1 text-[10px] tracking-[0.16em] text-white uppercase">
                      Oculto
                    </span>
                  ) : null}
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] tracking-[0.14em] text-primary uppercase shadow-sm">
                    <span className="inline-block h-2 w-2 rounded-sm bg-[#e11d48]" />
                    YouTube
                  </span>
                  <div className="absolute right-3 -bottom-5 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#2d4739] text-[#e8f3e3] shadow-sm">
                    <Crown size={18} />
                  </div>
                </div>
                <div className="px-5 pt-8 pb-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-heading text-xl leading-snug text-primary uppercase">
                      {item.title}
                    </h2>
                    <a
                      href={watch}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f3e3] text-[#4f7a58] hover:bg-[#d7e6d3]"
                      aria-label="Abrir en YouTube"
                    >
                      <ExternalLink size={15} />
                    </a>
                  </div>
                  <p className="mt-2 text-sm text-[#6f8a74]">{formatDay(item.occurredAt)}</p>
                  {canManage ? (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-[#eef3ea] pt-4">
                    <button
                      type="button"
                      onClick={() => setDrawer(item)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#d7e6d3] px-3 py-1.5 text-[10px] tracking-[0.14em] text-primary uppercase hover:bg-[#e8f3e3]"
                    >
                      <Pencil size={12} />
                      Editar
                    </button>
                    <form action={async (formData) => { await toggleSpecialRoomAction(formData); }}>
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
                        if (!window.confirm(`¿Eliminar la sala ${item.title}?`)) return;
                        await deleteSpecialRoomAction(formData);
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
                  </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {drawer && canManage ? (
        <SalaEspecialModal room={drawer === "create" ? null : drawer} onClose={() => setDrawer(null)} />
      ) : null}
    </div>
  );
}
