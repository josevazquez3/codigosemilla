"use client";

import { useMemo, useState } from "react";
import { Lock, Search } from "lucide-react";
import { saveActivationPermissionsAction } from "@/app/panel/actions";
import type { PanelActivation, PanelUser } from "@/lib/panel-data";

function formatDay(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function matchesUser(user: PanelUser, query: string) {
  return `${user.name} ${user.email}`.toLowerCase().includes(query);
}

export function PermisosSalaEspecialBoard({
  users = [],
  activations = [],
  granted = {},
}: {
  users?: PanelUser[];
  activations?: PanelActivation[];
  granted?: Record<string, number[]>;
}) {
  const members = users ?? [];
  const videos = activations ?? [];
  const assigned = granted ?? {};
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(members[0]?.id ?? 0);
  const [draft, setDraft] = useState<Record<number, number[]>>(() =>
    Object.fromEntries(members.map((user) => [user.id, assigned[String(user.id)] ?? []])),
  );
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return members;
    return members.filter((user) => matchesUser(user, needle));
  }, [members, query]);

  const selected = filtered.find((user) => user.id === selectedId) ?? filtered[0] ?? null;
  const currentIds = selected ? (draft[selected.id] ?? []) : [];
  const savedIds = selected ? (assigned[String(selected.id)] ?? []) : [];
  const dirty =
    selected !== null &&
    [...currentIds].sort((a, b) => a - b).join(",") !== [...savedIds].sort((a, b) => a - b).join(",");

  function toggle(activationId: number) {
    if (!selected) return;
    setDraft((current) => {
      const next = new Set(current[selected.id] ?? []);
      if (next.has(activationId)) next.delete(activationId);
      else next.add(activationId);
      return { ...current, [selected.id]: [...next] };
    });
    setMessage("");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <Lock size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">
            Permisos Sala Especial
          </h1>
          <p className="mt-2 text-sm text-primary/80">
            Habilitá videos de Activaciones a Usuarios Membresía (checklist por rol).
          </p>
        </div>
      </div>

      <label className="relative block">
        <Search size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#6f8a74]" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedId(0);
          }}
          placeholder="Buscar por nombre o email..."
          className="w-full rounded-full border border-[#d7e6d3] bg-white px-11 py-3 text-sm text-foreground outline-none focus:border-[#4f7a58]"
        />
      </label>
      <p className="text-sm text-[#6f8a74]">
        {videos.length} videos disponibles para asignar · {members.length} Usuarios Membresía
      </p>

      {filtered.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {filtered.slice(0, 12).map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => setSelectedId(user.id)}
              className={
                (selected?.id ?? 0) === user.id
                  ? "rounded-full bg-[#2d4739] px-3 py-1.5 text-[11px] tracking-[0.12em] text-white uppercase"
                  : "rounded-full border border-[#d7e6d3] bg-white px-3 py-1.5 text-[11px] tracking-[0.12em] text-primary uppercase hover:bg-[#e8f3e3]"
              }
            >
              {user.name}
            </button>
          ))}
        </div>
      ) : null}

      {!selected ? (
        <div className="rounded-3xl border border-[#d7e6d3] bg-white px-6 py-16 text-center text-sm text-[#6f8a74] shadow-sm shadow-primary/5">
          {members.length === 0
            ? "Todavía no hay Usuarios Membresía. Creá uno en Gestión Usuarios para asignarle videos."
            : "No hay coincidencias entre los Usuarios Membresía."}
        </div>
      ) : (
        <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm shadow-primary/5 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-3xl text-primary uppercase">{selected.name}</h2>
              <p className="mt-1 text-sm text-[#6f8a74]">
                {selected.role} · {selected.email}
              </p>
            </div>
            <form
              action={async (formData) => {
                setPending(true);
                setMessage("");
                const result = await saveActivationPermissionsAction(formData);
                setPending(false);
                setMessage(result?.error || "Permisos guardados.");
              }}
            >
              <input type="hidden" name="userId" value={selected.id} />
              <input type="hidden" name="activationIds" value={currentIds.join(",")} />
              <button
                type="submit"
                disabled={!dirty || pending}
                className="rounded-full bg-[#4f7a58] px-5 py-2.5 text-[11px] tracking-[0.16em] text-white uppercase hover:bg-[#2d4739] disabled:opacity-60"
              >
                {pending ? "Guardando..." : dirty ? "Guardar cambios" : "Sin cambios"}
              </button>
            </form>
          </div>
          {message ? <p className="mt-3 text-sm text-[#4f7a58]">{message}</p> : null}

          {videos.length === 0 ? (
            <p className="mt-8 text-sm text-[#6f8a74]">
              Todavía no hay videos en Activaciones para asignar.
            </p>
          ) : (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {videos.map((item) => {
                const checked = currentIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#d7e6d3] bg-[#f9f7f2] px-4 py-3 hover:border-[#4f7a58]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(item.id)}
                      className="mt-1 h-4 w-4 accent-[#4f7a58]"
                    />
                    <span>
                      <span className="block font-medium text-primary uppercase">{item.title}</span>
                      <span className="mt-1 block text-[11px] tracking-[0.14em] text-[#6f8a74] uppercase">
                        Activación · {formatDay(item.occurredAt)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
