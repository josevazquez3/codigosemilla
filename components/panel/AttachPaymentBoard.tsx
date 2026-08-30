"use client";

import { useRef, useState } from "react";
import { Banknote, FileUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { saveReceiptAction, scanReceiptAction } from "@/app/panel/actions";
import { fieldClass } from "@/components/panel/ui";
import { ocrImageFile } from "@/lib/ocr-image";
import { parseReceiptText } from "@/lib/receipt-ocr";
import { formatBankMoney, formatBirthDate } from "@/lib/panel-format";
import type { PanelPaymentReceipt } from "@/lib/panel-data";

type Scan = {
  fileName: string;
  fileUrl: string;
  kind: "pdf" | "jpg";
  amount: string;
  paidAt: string;
  rawText: string;
};

export function AttachPaymentBoard({ receipts }: { receipts: PanelPaymentReceipt[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [scan, setScan] = useState<Scan | null>(null);
  const [pending, setPending] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const name = file.name.toLowerCase();
    const isJpg = file.type === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg");
    const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");
    if (!isJpg && !isPdf) {
      setError("El comprobante tiene que ser PDF o JPG.");
      return;
    }
    setError("");
    setStatus("Leyendo el comprobante...");
    setScan(null);
    const formData = new FormData();
    formData.set("file", file);
    const uploaded = await scanReceiptAction(formData);
    if (uploaded.error || !uploaded.fileUrl) {
      setStatus("");
      setError(uploaded.error || "No se pudo subir el comprobante.");
      return;
    }
    let text = uploaded.rawText ?? "";
    if (isJpg) {
      setStatus("Leyendo monto y fecha de la imagen...");
      try {
        text = (await ocrImageFile(file)) || text;
      } catch {
        setError("Se guardó el archivo, pero no se pudo leer la imagen. Completá monto y fecha a mano.");
      }
    }
    const parsed = parseReceiptText(text);
    setScan({
      fileName: uploaded.fileName || file.name,
      fileUrl: uploaded.fileUrl,
      kind: uploaded.kind === "pdf" ? "pdf" : "jpg",
      amount: parsed.amountCents ? (parsed.amountCents / 100).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) : "",
      paidAt: parsed.paidAt || uploaded.paidAt || "",
      rawText: parsed.rawText,
    });
    setStatus(parsed.amountCents || parsed.paidAt ? "Datos leídos. Revisá y guardá." : "No se detectó monto o fecha. Completalos y guardá.");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <Banknote size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">Adjuntar pago</h1>
          <p className="mt-2 text-sm text-primary/80">
            Subí tu comprobante de transferencia en PDF o JPG.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm shadow-primary/5 md:p-8">
        <h2 className="font-heading text-xl text-primary uppercase">Adjuntar pago</h2>
        <p className="mt-2 text-sm text-[#6f8a74]">
          Subí tu comprobante en PDF o JPG. El sistema leerá monto y fecha automáticamente (OCR en
          imágenes).
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            void handleFile(event.dataTransfer.files?.[0]);
          }}
          className={`mt-8 flex min-h-[220px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragOver ? "border-[#4f7a58] bg-[#e8f3e3]" : "border-[#4f7a58]/50 bg-[#f9f7f2]"
          }`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
            <FileUp size={26} />
          </span>
          <span className="mt-5 font-heading text-2xl text-primary uppercase">
            Clic adjuntar comprobante o arrastrar el comprobante
          </span>
          <span className="mt-2 text-sm text-[#6f8a74]">Archivos PDF y JPG</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            void handleFile(file);
          }}
        />

        {status ? <p className="mt-4 text-sm text-[#4f7a58]">{status}</p> : null}
        {error ? <p className="mt-4 text-sm text-[#7a3a34]">{error}</p> : null}

        {scan ? (
          <form
            className="mt-8 grid gap-4 border-t border-[#e3eee0] pt-6 md:grid-cols-2"
            action={async (formData) => {
              setPending(true);
              const result = await saveReceiptAction(formData);
              setPending(false);
              if (result?.error) {
                setError(result.error);
                return;
              }
              setScan(null);
              setStatus("Comprobante guardado.");
              router.refresh();
            }}
          >
            <input type="hidden" name="fileUrl" value={scan.fileUrl} />
            <input type="hidden" name="fileName" value={scan.fileName} />
            <input type="hidden" name="kind" value={scan.kind} />
            <input type="hidden" name="rawText" value={scan.rawText} />
            <label className="block space-y-2">
              <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Monto $</span>
              <input
                name="amount"
                defaultValue={scan.amount}
                placeholder="Ej: 25.000,00"
                className={fieldClass}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Fecha</span>
              <input name="paidAt" type="date" defaultValue={scan.paidAt} className={fieldClass} />
            </label>
            <p className="md:col-span-2 text-xs text-[#6f8a74]">Archivo: {scan.fileName}</p>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-[#2d4739] px-5 py-2.5 text-xs tracking-[0.16em] text-white uppercase disabled:opacity-70"
              >
                {pending ? "Guardando..." : "Guardar comprobante"}
              </button>
            </div>
          </form>
        ) : null}
      </section>

      {receipts.length > 0 ? (
        <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm shadow-primary/5 md:p-8">
          <h2 className="font-heading text-xl text-primary uppercase">Comprobantes</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e3eee0] bg-[#f7faf5] text-[11px] tracking-[0.14em] text-[#6f8a74] uppercase">
                  <th className="px-3 py-3 font-medium">Archivo</th>
                  <th className="px-3 py-3 font-medium">Monto</th>
                  <th className="px-3 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((item) => (
                  <tr key={item.id} className="border-b border-[#f0f5ee]">
                    <td className="px-3 py-3">
                      <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-[#4f7a58] hover:underline">
                        {item.fileName || "Comprobante"}
                      </a>
                    </td>
                    <td className="px-3 py-3 text-primary">
                      {item.amountCents != null ? formatBankMoney(item.amountCents, "ARS") : "—"}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {item.paidAt ? formatBirthDate(item.paidAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
