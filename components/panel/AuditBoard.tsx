"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ClipboardList, FileSpreadsheet, Search } from "lucide-react";
import type { AuditSessionRow } from "@/lib/audit-types";
import { sessionTotals } from "@/lib/audit-types";
import { formatDateTime, formatDuration } from "@/lib/panel-format";

export function AuditBoard({ sessions }: { sessions: AuditSessionRow[] }) {
  const [query, setQuery] = useState("");
  const [userFilter, setUserFilter] = useState("todos");
  const [openId, setOpenId] = useState<number | null>(sessions[0]?.id ?? null);

  const users = useMemo(() => {
    const map = new Map<string, string>();
    for (const session of sessions) {
      map.set(session.userEmail, session.userName);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "es"));
  }, [sessions]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return sessions.filter((session) => {
      if (userFilter !== "todos" && session.userEmail !== userFilter) return false;
      if (!value) return true;
      const totals = sessionTotals(session);
      const haystack = [
        session.userName,
        session.userEmail,
        totals.moduleNames.join(" "),
        session.videos.map((item) => item.title).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(value);
    });
  }, [query, sessions, userFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
            <ClipboardList size={26} />
          </div>
          <div>
            <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">Auditoría</h1>
            <p className="mt-2 text-sm text-primary/80">
              Registro de accesos, módulos visitados y videos abiertos por usuario.
            </p>
          </div>
        </div>
        <a
          href="/api/panel/audit/export"
          className="inline-flex items-center gap-2 self-start rounded-full border border-[#4f7a58] bg-white px-4 py-2.5 text-[11px] tracking-[0.16em] text-[#4f7a58] uppercase"
        >
          <FileSpreadsheet size={15} />
          Exportar Excel
        </a>
      </div>

      <label className="relative block">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#6f8a74]"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar usuario, módulo o video..."
          className="w-full rounded-full border border-[#d7e6d3] bg-white py-3 pr-4 pl-11 text-sm outline-none focus:border-[#4f7a58]"
        />
      </label>

      <label className="block max-w-sm space-y-2">
        <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">
          Filtrar por usuario
        </span>
        <select
          value={userFilter}
          onChange={(event) => setUserFilter(event.target.value)}
          className="w-full rounded-full border border-[#d7e6d3] bg-white px-4 py-3 text-sm outline-none focus:border-[#4f7a58]"
        >
          <option value="todos">Todos los usuarios</option>
          {users.map(([email, name]) => (
            <option key={email} value={email}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <div className="overflow-hidden rounded-3xl border border-[#d7e6d3] bg-white shadow-sm shadow-primary/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e3eee0] bg-[#f7faf5] text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">
                <th className="px-5 py-4 font-medium">Usuario</th>
                <th className="px-5 py-4 font-medium">Inicio sesión</th>
                <th className="px-5 py-4 font-medium">Fin sesión</th>
                <th className="px-5 py-4 font-medium">Módulos</th>
                <th className="px-5 py-4 font-medium">Tiempo módulos</th>
                <th className="px-5 py-4 font-medium">Videos</th>
                <th className="px-5 py-4 font-medium">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground italic">
                    No hay registros que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((session, index) => {
                  const totals = sessionTotals(session);
                  const open = openId === session.id;
                  return (
                    <SessionBlock
                      key={session.id}
                      session={session}
                      totals={totals}
                      open={open}
                      striped={index % 2 === 1}
                      onToggle={() => setOpenId(open ? null : session.id)}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SessionBlock({
  session,
  totals,
  open,
  striped,
  onToggle,
}: {
  session: AuditSessionRow;
  totals: ReturnType<typeof sessionTotals>;
  open: boolean;
  striped: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className={`border-b border-[#f0f5ee] ${striped ? "bg-[#f7faf5]" : "bg-white"}`}>
        <td className="px-5 py-4">
          <p className="font-medium text-primary">{session.userName}</p>
          <p className="text-xs text-muted-foreground">{session.userEmail}</p>
        </td>
        <td className="px-5 py-4 text-muted-foreground">{formatDateTime(session.startedAt)}</td>
        <td className="px-5 py-4 text-muted-foreground">
          {session.endedAt ? formatDateTime(session.endedAt) : "En curso"}
        </td>
        <td className="px-5 py-4 text-primary">
          {totals.moduleNames.join(", ") || "—"}
        </td>
        <td className="px-5 py-4 text-[#4f7a58]">{formatDuration(totals.moduleSeconds)}</td>
        <td className="px-5 py-4 text-muted-foreground">
          {totals.videoCount === 1 ? "1 video" : `${totals.videoCount} videos`}
        </td>
        <td className="px-5 py-4">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1 rounded-full border border-[#d7e6d3] px-3 py-1.5 text-[11px] tracking-[0.14em] text-[#4f7a58] uppercase"
          >
            Ver
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </td>
      </tr>
      {open ? (
        <tr className="border-b border-[#e3eee0] bg-[#fbfaf6]">
          <td colSpan={7} className="px-5 py-5">
            <div className="grid gap-6 md:grid-cols-2">
              <section>
                <h3 className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">
                  Módulos visitados
                </h3>
                <div className="mt-3 space-y-2">
                  {session.modules.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Sin módulos en esta sesión.</p>
                  ) : (
                    session.modules.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-2xl border border-[#d7e6d3] bg-white px-4 py-3"
                      >
                        <p className="text-sm font-medium text-primary uppercase">{item.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDateTime(item.startedAt)} · {formatDuration(item.durationSeconds)}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </section>
              <section>
                <h3 className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">
                  Videos abiertos
                </h3>
                <div className="mt-3 space-y-2">
                  {session.videos.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Sin videos en esta sesión.</p>
                  ) : (
                    session.videos.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-2xl border border-[#d7e6d3] bg-white px-4 py-3"
                      >
                        <p className="text-sm font-medium text-primary uppercase">{item.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.source || "Video"} · {formatDateTime(item.openedAt)}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
