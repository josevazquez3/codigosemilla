export const SESSION_COOKIE = "gv_session";

export type SessionRole = "Admin" | "Usuario" | "Usuario Membresía";

export type SessionUser = {
  id?: number;
  auditSessionId?: number;
  name: string;
  email: string;
  role: SessionRole;
};

export function parseSessionRole(value: unknown): SessionRole {
  if (value === "Admin") return "Admin";
  if (value === "Usuario Membresía" || value === "Usuario Membresia") return "Usuario Membresía";
  return "Usuario";
}

export function encodeSession(user: SessionUser) {
  return Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
}

function asId(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function decodeSession(value?: string | null): SessionUser | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (!parsed?.email) return null;
    return {
      id: asId(parsed.id),
      auditSessionId: asId(parsed.auditSessionId),
      name: String(parsed.name || parsed.email.split("@")[0]),
      email: String(parsed.email),
      role: parseSessionRole(parsed.role),
    };
  } catch {
    return null;
  }
}

export function readCookieValue(header: string | null | undefined, name: string) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key !== name) continue;
    const raw = rest.join("=");
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

export function sessionFromRequest(request: Request) {
  return decodeSession(readCookieValue(request.headers.get("cookie"), SESSION_COOKIE));
}
