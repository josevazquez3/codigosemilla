export type ReceiptScan = {
  amountCents: number | null;
  paidAt: string;
  rawText: string;
};

function normalizeOcr(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/[|]/g, " ")
    .replace(/\s+/g, " ");
}

export function parseReceiptAmount(text: string) {
  const normalized = normalizeOcr(text);
  const labeled = normalized.match(
    /(?:importe|monto|total|haber|acreditad[oa]|transferiste|enviaste)\D{0,20}((?:ARS|USD|\$)?\s*\d{1,3}(?:[.\s]\d{3})*(?:[.,]\d{2})|\d+[.,]\d{2})/i,
  );
  const fallback = [...normalized.matchAll(/\$\s*(\d{1,3}(?:[.\s]\d{3})*(?:[.,]\d{2})|\d+[.,]\d{2})/g)].pop();
  const raw = labeled?.[1] ?? fallback?.[1] ?? fallback?.[0] ?? "";
  if (!raw) return null;
  const clean = raw.replace(/[^\d,.-]/g, "");
  let number: number;
  if (clean.includes(",") && clean.includes(".")) {
    number = Number(clean.replace(/\./g, "").replace(",", "."));
  } else if (clean.includes(",")) {
    number = Number(clean.replace(",", "."));
  } else {
    number = Number(clean);
  }
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.round(number * 100);
}

export function parseReceiptDate(text: string) {
  const match = text.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (!match) return "";
  const [, day, month, yearRaw] = match;
  const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function parseReceiptText(text: string): ReceiptScan {
  return {
    amountCents: parseReceiptAmount(text),
    paidAt: parseReceiptDate(text),
    rawText: text.trim(),
  };
}

export function extractPdfText(bytes: Uint8Array) {
  const raw = new TextDecoder("latin1").decode(bytes);
  const chunks: string[] = [];
  const paren = raw.matchAll(/\((?:\\.|[^\\)])+\)/g);
  for (const match of paren) {
    const value = match[0]
      .slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, " ")
      .replace(/\\[()\\]/g, "")
      .trim();
    if (value.length > 1) chunks.push(value);
  }
  const tj = raw.matchAll(/\[([\s\S]*?)\]\s*TJ/g);
  for (const match of tj) {
    const inner = [...match[1].matchAll(/\((?:\\.|[^\\)])+\)/g)]
      .map((item) => item[0].slice(1, -1))
      .join("");
    if (inner.trim()) chunks.push(inner);
  }
  return chunks.join(" ").replace(/\s+/g, " ").trim();
}
