import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  endAuditSession,
  recordModuleVisit,
  recordVideoOpen,
  startAuditSession,
} from "@/lib/audit-sessions";
import { findUserByEmail } from "@/lib/panel-data";
import { moduleFromPath } from "@/lib/panel-modules";
import { decodeSession, encodeSession, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

function sessionFromCookies(request: NextRequest, storeValue?: string) {
  return (
    decodeSession(request.cookies.get(SESSION_COOKIE)?.value) ??
    decodeSession(storeValue)
  );
}

export async function POST(request: NextRequest) {
  const session = sessionFromCookies(
    request,
    (await cookies()).get(SESSION_COOKIE)?.value,
  );
  if (!session) {
    return new NextResponse(null, { status: 204 });
  }

  const found = session.id
    ? { id: session.id, email: session.email, name: session.name }
    : await findUserByEmail(session.email);
  const userId = found?.id;
  if (!userId) {
    return new NextResponse(null, { status: 204 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    kind?: "visit" | "heartbeat" | "end" | "video";
    path?: string;
    title?: string;
    source?: string;
  };

  let auditSessionId = session.auditSessionId;
  if (body.kind === "end") {
    if (auditSessionId) await endAuditSession(auditSessionId);
    return NextResponse.json({ ok: true });
  }

  try {
    if (!auditSessionId) {
      auditSessionId = await startAuditSession(userId);
    }

    if (body.kind === "video" && body.title) {
      await recordVideoOpen(auditSessionId, body.title, body.source ?? "");
    } else {
      const path = body.path || "/panel";
      const module = moduleFromPath(path);
      await recordModuleVisit(auditSessionId, module.key, module.label);
    }
  } catch (error) {
    console.error("[audit/ping]", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const response = NextResponse.json({ ok: true, auditSessionId });
  if (auditSessionId !== session.auditSessionId) {
    response.cookies.set({
      name: SESSION_COOKIE,
      value: encodeSession({
        ...session,
        id: userId,
        auditSessionId,
      }),
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}
