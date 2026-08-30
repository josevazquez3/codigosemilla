import { NextResponse } from "next/server";
import { ensureAuditReady, startAuditSession } from "@/lib/audit-sessions";
import { authenticateUser } from "@/lib/panel-data";
import { encodeSession, SESSION_COOKIE } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    password?: string;
  };

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Completá email y contraseña para ingresar." },
      { status: 400 },
    );
  }

  const result = await authenticateUser({ email, password, name });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  await ensureAuditReady();
  const auditSessionId = await startAuditSession(result.user.id);
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: encodeSession({
      id: result.user.id,
      auditSessionId,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    }),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
