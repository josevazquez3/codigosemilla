import { neon } from "@neondatabase/serverless";
import type { AuditSessionRow } from "@/lib/audit-types";
import { createUser, findUserByEmail, listUsers } from "@/lib/panel-data";

export type { AuditModuleVisit, AuditSessionRow, AuditVideoOpen } from "@/lib/audit-types";
export { sessionTotals } from "@/lib/audit-types";

type MemoryVisit = {
  id: number;
  sessionId: number;
  moduleKey: string;
  label: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
};

type MemoryVideo = {
  id: number;
  sessionId: number;
  title: string;
  source: string;
  openedAt: string;
};

type MemorySession = {
  id: number;
  userId: number;
  startedAt: string;
  endedAt: string | null;
};

type AuditMemory = {
  sessions: MemorySession[];
  visits: MemoryVisit[];
  videos: MemoryVideo[];
  ids: Record<string, number>;
  seeded: boolean;
};

const g = globalThis as typeof globalThis & { __gvAudit?: AuditMemory };

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

function memory() {
  if (!g.__gvAudit) {
    g.__gvAudit = { sessions: [], visits: [], videos: [], ids: {}, seeded: false };
  }
  return g.__gvAudit;
}

function nextId(store: AuditMemory, key: string) {
  store.ids[key] = (store.ids[key] ?? 0) + 1;
  return store.ids[key];
}

function iso(date = new Date()) {
  return date.toISOString();
}

function secondsBetween(start: string, end = iso()) {
  return Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000));
}

async function ensureAuditSchema() {
  const sql = getSql();
  if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_sessions (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES panel_users(id) ON DELETE CASCADE,
      started_at TIMESTAMPTZ DEFAULT NOW(),
      ended_at TIMESTAMPTZ
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_module_visits (
      id SERIAL PRIMARY KEY,
      session_id INT NOT NULL REFERENCES panel_sessions(id) ON DELETE CASCADE,
      module_key TEXT NOT NULL,
      label TEXT NOT NULL,
      started_at TIMESTAMPTZ DEFAULT NOW(),
      ended_at TIMESTAMPTZ,
      duration_seconds INT DEFAULT 0
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_video_opens (
      id SERIAL PRIMARY KEY,
      session_id INT NOT NULL REFERENCES panel_sessions(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      source TEXT DEFAULT '',
      opened_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

async function closeOpenSessionsForUser(userId: number, endedAt = iso()) {
  const sql = getSql();
  if (!sql) {
    for (const session of memory().sessions.filter((item) => item.userId === userId && !item.endedAt)) {
      await endAuditSession(session.id, endedAt);
    }
    return;
  }
  await ensureAuditSchema();
  const rows = await sql`
    SELECT id FROM panel_sessions WHERE user_id = ${userId} AND ended_at IS NULL
  `;
  for (const row of rows) {
    await endAuditSession(Number(row.id), endedAt);
  }
}

async function seedIfEmpty() {
  const existing = await listAuditSessions();
  if (existing.some((session) => session.userEmail === "caterina.molinatti@correo.com")) return;

  const caterina =
    (await findUserByEmail("caterina.molinatti@correo.com")) ??
    (await createUser({
      email: "caterina.molinatti@correo.com",
      name: "Caterina Molinatti",
      password: "semilla",
      role: "Usuario Membresía",
      status: "active",
    }));
  const ana = await findUserByEmail("ana@correo.com");
  const jose = await findUserByEmail("jose@test.com");

  const now = Date.now();
  const sessionA = await insertSession(
    caterina.id,
    new Date(now - 28 * 60 * 1000).toISOString(),
    null,
  );
  await recordClosedVisit(sessionA, "Adjuntar pago", "/panel/tesoreria", now - 27 * 60 * 1000, 3);
  await recordClosedVisit(sessionA, "Gestión Usuarios", "/panel/gestion-usuarios", now - 26 * 60 * 1000, 12);
  await recordClosedVisit(sessionA, "Tesorería", "/panel/tesoreria/pagos-mes", now - 25 * 60 * 1000, 14);
  await recordVideoOpen(
    sessionA,
    "4TO ENCUENTRO 23 DE AGOSTO",
    "Encuentros",
    new Date(now - 24 * 60 * 1000).toISOString(),
  );

  if (ana) {
    const sessionB = await insertSession(
      ana.id,
      new Date(now - 90 * 60 * 1000).toISOString(),
      new Date(now - 80 * 60 * 1000).toISOString(),
    );
    await recordClosedVisit(sessionB, "Inicio", "/panel", now - 89 * 60 * 1000, 40);
    await recordClosedVisit(sessionB, "Próximos encuentros", "/panel/inscripcion-encuentros", now - 85 * 60 * 1000, 120);
  }

  if (jose) {
    const sessionC = await insertSession(
      jose.id,
      new Date(now - 22 * 60 * 1000).toISOString(),
      new Date(now - 2 * 60 * 1000).toISOString(),
    );
    await recordClosedVisit(sessionC, "Inicio", "/panel", now - 21 * 60 * 1000, 80);
    await recordClosedVisit(sessionC, "Gestión Usuarios", "/panel/gestion-usuarios", now - 19 * 60 * 1000, 486);
    await recordClosedVisit(sessionC, "Auditoría", "/panel/auditoria", now - 10 * 60 * 1000, 600);
  }
}

async function insertSession(userId: number, startedAt: string, endedAt: string | null) {
  const sql = getSql();
  if (!sql) {
    const id = nextId(memory(), "sessions");
    memory().sessions.unshift({ id, userId, startedAt, endedAt });
    return id;
  }
  await ensureAuditSchema();
  const rows = await sql`
    INSERT INTO panel_sessions (user_id, started_at, ended_at)
    VALUES (${userId}, ${startedAt}, ${endedAt})
    RETURNING id
  `;
  return Number(rows[0]?.id);
}

async function recordClosedVisit(
  sessionId: number,
  label: string,
  moduleKey: string,
  startedMs: number,
  durationSeconds: number,
) {
  const startedAt = new Date(startedMs).toISOString();
  const endedAt = new Date(startedMs + durationSeconds * 1000).toISOString();
  const sql = getSql();
  if (!sql) {
    const store = memory();
    store.visits.push({
      id: nextId(store, "visits"),
      sessionId,
      moduleKey,
      label,
      startedAt,
      endedAt,
      durationSeconds,
    });
    return;
  }
  await ensureAuditSchema();
  await sql`
    INSERT INTO panel_module_visits (session_id, module_key, label, started_at, ended_at, duration_seconds)
    VALUES (${sessionId}, ${moduleKey}, ${label}, ${startedAt}, ${endedAt}, ${durationSeconds})
  `;
}

export async function startAuditSession(userId: number, startedAt = iso()) {
  await closeOpenSessionsForUser(userId, startedAt);
  const sql = getSql();
  if (!sql) {
    const store = memory();
    const id = nextId(store, "sessions");
    store.sessions.unshift({ id, userId, startedAt, endedAt: null });
    return id;
  }
  await ensureAuditSchema();
  const rows = await sql`
    INSERT INTO panel_sessions (user_id, started_at)
    VALUES (${userId}, ${startedAt})
    RETURNING id
  `;
  return Number(rows[0]?.id);
}

export async function endAuditSession(sessionId: number, endedAt = iso()) {
  await closeOpenVisit(sessionId, endedAt);
  const sql = getSql();
  if (!sql) {
    const session = memory().sessions.find((item) => item.id === sessionId);
    if (session && !session.endedAt) session.endedAt = endedAt;
    return;
  }
  await ensureAuditSchema();
  await sql`
    UPDATE panel_sessions
    SET ended_at = ${endedAt}
    WHERE id = ${sessionId} AND ended_at IS NULL
  `;
}

async function closeOpenVisit(sessionId: number, endedAt = iso()) {
  const sql = getSql();
  if (!sql) {
    const open = memory().visits.find((item) => item.sessionId === sessionId && !item.endedAt);
    if (open) {
      open.endedAt = endedAt;
      open.durationSeconds = secondsBetween(open.startedAt, endedAt);
    }
    return;
  }
  await ensureAuditSchema();
  const rows = await sql`
    SELECT id, started_at FROM panel_module_visits
    WHERE session_id = ${sessionId} AND ended_at IS NULL
    ORDER BY started_at DESC
    LIMIT 1
  `;
  const open = rows[0];
  if (!open) return;
  const duration = secondsBetween(String(open.started_at), endedAt);
  await sql`
    UPDATE panel_module_visits
    SET ended_at = ${endedAt}, duration_seconds = ${duration}
    WHERE id = ${Number(open.id)}
  `;
}

export async function recordModuleVisit(sessionId: number, moduleKey: string, label: string) {
  const sql = getSql();
  if (!sql) {
    const store = memory();
    const open = store.visits.find((item) => item.sessionId === sessionId && !item.endedAt);
    if (open?.moduleKey === moduleKey) {
      open.durationSeconds = secondsBetween(open.startedAt);
      return;
    }
    if (open) {
      open.endedAt = iso();
      open.durationSeconds = secondsBetween(open.startedAt);
    }
    store.visits.push({
      id: nextId(store, "visits"),
      sessionId,
      moduleKey,
      label,
      startedAt: iso(),
      endedAt: null,
      durationSeconds: 0,
    });
    return;
  }

  await ensureAuditSchema();
  const openRows = await sql`
    SELECT id, module_key, started_at FROM panel_module_visits
    WHERE session_id = ${sessionId} AND ended_at IS NULL
    ORDER BY started_at DESC
    LIMIT 1
  `;
  const open = openRows[0];
  if (open && String(open.module_key) === moduleKey) {
    const duration = secondsBetween(String(open.started_at));
    await sql`UPDATE panel_module_visits SET duration_seconds = ${duration} WHERE id = ${Number(open.id)}`;
    return;
  }
  if (open) {
    const duration = secondsBetween(String(open.started_at));
    await sql`
      UPDATE panel_module_visits
      SET ended_at = NOW(), duration_seconds = ${duration}
      WHERE id = ${Number(open.id)}
    `;
  }
  await sql`
    INSERT INTO panel_module_visits (session_id, module_key, label)
    VALUES (${sessionId}, ${moduleKey}, ${label})
  `;
}

export async function recordVideoOpen(
  sessionId: number,
  title: string,
  source = "",
  openedAt = iso(),
) {
  const sql = getSql();
  if (!sql) {
    memory().videos.push({
      id: nextId(memory(), "videos"),
      sessionId,
      title,
      source,
      openedAt,
    });
    return;
  }
  await ensureAuditSchema();
  await sql`
    INSERT INTO panel_video_opens (session_id, title, source, opened_at)
    VALUES (${sessionId}, ${title}, ${source}, ${openedAt})
  `;
}

export async function listAuditSessions(): Promise<AuditSessionRow[]> {
  const users = await listUsers();
  const userMap = new Map(users.map((user) => [user.id, user]));
  const sql = getSql();

  if (!sql) {
    const store = memory();
    return store.sessions
      .map((session) => {
        const user = userMap.get(session.userId);
        const modules = store.visits
          .filter((item) => item.sessionId === session.id)
          .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
          .map((item) => ({
            id: item.id,
            label: item.label,
            startedAt: item.startedAt,
            durationSeconds: item.endedAt
              ? item.durationSeconds
              : secondsBetween(item.startedAt),
          }));
        const videos = store.videos
          .filter((item) => item.sessionId === session.id)
          .sort((a, b) => a.openedAt.localeCompare(b.openedAt))
          .map((item) => ({
            id: item.id,
            title: item.title,
            source: item.source,
            openedAt: item.openedAt,
          }));
        return {
          id: session.id,
          userId: session.userId,
          userName: user?.name ?? "Integrante",
          userEmail: user?.email ?? "",
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          modules,
          videos,
        };
      })
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  await ensureAuditSchema();
  const sessions = await sql`
    SELECT s.*, u.name AS user_name, u.email AS user_email
    FROM panel_sessions s
    JOIN panel_users u ON u.id = s.user_id
    ORDER BY s.started_at DESC
  `;
  const visits = await sql`
    SELECT * FROM panel_module_visits ORDER BY started_at ASC
  `;
  const videos = await sql`
    SELECT * FROM panel_video_opens ORDER BY opened_at ASC
  `;

  return sessions.map((session) => {
    const sessionId = Number(session.id);
    return {
      id: sessionId,
      userId: Number(session.user_id),
      userName: String(session.user_name),
      userEmail: String(session.user_email),
      startedAt: new Date(String(session.started_at)).toISOString(),
      endedAt: session.ended_at ? new Date(String(session.ended_at)).toISOString() : null,
      modules: visits
        .filter((item) => Number(item.session_id) === sessionId)
        .map((item) => ({
          id: Number(item.id),
          label: String(item.label),
          startedAt: new Date(String(item.started_at)).toISOString(),
          durationSeconds: item.ended_at
            ? Number(item.duration_seconds ?? 0)
            : secondsBetween(String(item.started_at)),
        })),
      videos: videos
        .filter((item) => Number(item.session_id) === sessionId)
        .map((item) => ({
          id: Number(item.id),
          title: String(item.title),
          source: String(item.source ?? ""),
          openedAt: new Date(String(item.opened_at)).toISOString(),
        })),
    };
  });
}

export async function ensureAuditReady() {
  await ensureAuditSchema();
  const sql = getSql();
  if (!sql) {
    if (!memory().seeded) {
      memory().seeded = true;
      await seedIfEmpty();
    }
    return;
  }
  await seedIfEmpty();
}
