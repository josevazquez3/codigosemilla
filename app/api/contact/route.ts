import { NextRequest, NextResponse } from "next/server";
import { saveContactMessage } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const message = String(body?.message ?? "").trim();
  const interest = String(body?.interest ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Completá nombre, email y mensaje." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  try {
    const result = await saveContactMessage({ name, email, interest, message });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[contact]", error);
    return NextResponse.json(
      { error: "No se pudo guardar el mensaje." },
      { status: 500 },
    );
  }
}
