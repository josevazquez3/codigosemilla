import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const MAX_BYTES = Math.round(1.5 * 1024 * 1024);

export async function savePanelImage(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  const isJpg = type === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg");
  if (!isJpg) return { error: "La foto tiene que ser JPG." };
  if (file.size > MAX_BYTES) return { error: "Cada foto puede pesar hasta 1,5 MB." };

  const bytes = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${name.replace(/[^a-z0-9.]+/g, "-")}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`encuentros/${fileName}`, bytes, {
      access: "public",
      contentType: "image/jpeg",
    });
    return { url: blob.url };
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), bytes);
  return { url: `/uploads/${fileName}` };
}

const RECEIPT_MAX_BYTES = 5 * 1024 * 1024;

export async function savePaymentReceipt(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  const isJpg = type === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg");
  const isPdf = type === "application/pdf" || name.endsWith(".pdf");
  if (!isJpg && !isPdf) return { error: "El comprobante tiene que ser PDF o JPG." };
  if (file.size > RECEIPT_MAX_BYTES) return { error: "El archivo puede pesar hasta 5 MB." };

  const bytes = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${name.replace(/[^a-z0-9.]+/g, "-")}`;
  const contentType = isPdf ? "application/pdf" : "image/jpeg";

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`comprobantes/${fileName}`, bytes, {
      access: "public",
      contentType,
    });
    return { url: blob.url, bytes, kind: isPdf ? "pdf" : "jpg" as const };
  }

  const dir = path.join(process.cwd(), "public", "uploads", "comprobantes");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), bytes);
  return { url: `/uploads/comprobantes/${fileName}`, bytes, kind: isPdf ? "pdf" : "jpg" as const };
}
