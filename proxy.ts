import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { canAccessPath } from "@/lib/panel-nav";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";

export function proxy(request: NextRequest) {
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const ingresar = new URL("/ingresar", request.url);
    ingresar.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(ingresar);
  }
  if (!canAccessPath(session.role, request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/panel", "/panel/:path*"],
};
