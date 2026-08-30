import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { endAuditSession } from "@/lib/audit-sessions";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";

export async function POST() {
  const store = await cookies();
  const user = decodeSession(store.get(SESSION_COOKIE)?.value);
  if (user?.auditSessionId) {
    await endAuditSession(user.auditSessionId);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
