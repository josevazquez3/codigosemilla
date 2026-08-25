import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const FILES = [
  "portrait.jpeg",
  "inspo-1.jpeg",
  "inspo-2.jpeg",
  "logo-white.png",
] as const;

export async function POST(request: NextRequest) {
  const secret = process.env.SEED_SECRET;
  const provided =
    request.headers.get("x-seed-secret") ??
    request.nextUrl.searchParams.get("secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN no está configurada" },
      { status: 500 },
    );
  }

  const uploaded: Record<string, string> = {};

  for (const fileName of FILES) {
    const filePath = path.join(process.cwd(), "public", "images", fileName);
    const file = await readFile(filePath);
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    uploaded[fileName] = blob.url;
  }

  const sample = Object.values(uploaded)[0];
  const base = sample ? sample.slice(0, sample.lastIndexOf("/")) : "";

  return NextResponse.json({
    uploaded,
    nextPublicBlobBaseUrl: base,
  });
}
