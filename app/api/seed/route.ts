import { NextRequest, NextResponse } from "next/server";
import { seedContent } from "@/lib/db";

export async function POST(request: NextRequest) {
  const secret = process.env.SEED_SECRET;
  const provided =
    request.headers.get("x-seed-secret") ??
    request.nextUrl.searchParams.get("secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await seedContent();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al sembrar" },
      { status: 500 },
    );
  }
}
