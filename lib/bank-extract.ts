import { formatBankMoney, formatExtractDate } from "@/lib/panel-format";
import { clientNameFromConcept, normalizePersonName } from "@/lib/person-match";
import type {
  BankExtractMeta,
  BankMovementInput,
  PanelBankMovement,
  PanelPadronPerson,
} from "@/lib/panel-data";

export { clientNameFromConcept, movementMatchesPerson } from "@/lib/person-match";

export type BankMovementRow = PanelBankMovement & { balanceCents: number };

export type TransferClientGroup = {
  key: string;
  name: string;
  padronId: number | null;
  transfers: BankMovementRow[];
  totalArs: number;
  totalUsd: number;
};

export function groupTransfersByClient(
  movements: PanelBankMovement[],
  people: PanelPadronPerson[] = [],
): TransferClientGroup[] {
  const incoming = movements
    .filter((item) => item.amountCents > 0)
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.id - b.id);

  const groups = new Map<string, TransferClientGroup>();

  for (const movement of incoming) {
    const extracted = clientNameFromConcept(movement.concept);
    const extractedKey = normalizePersonName(extracted);
    const person = people.find((item) => {
      const full = normalizePersonName(`${item.firstName} ${item.lastName}`);
      const reversed = normalizePersonName(`${item.lastName} ${item.firstName}`);
      return (
        Boolean(full) &&
        (extractedKey.includes(full) ||
          full.includes(extractedKey) ||
          extractedKey.includes(reversed) ||
          reversed.includes(extractedKey))
      );
    });
    const name = person ? `${person.firstName} ${person.lastName}`.trim() : extracted;
    const key = person ? `padron-${person.id}` : extractedKey || `mov-${movement.id}`;
    const current = groups.get(key) ?? {
      key,
      name,
      padronId: person?.id ?? null,
      transfers: [],
      totalArs: 0,
      totalUsd: 0,
    };
    current.transfers.push({ ...movement, balanceCents: 0 });
    if (movement.currency === "USD") current.totalUsd += movement.amountCents;
    else current.totalArs += movement.amountCents;
    groups.set(key, current);
  }

  return [...groups.values()]
    .map((group) => {
      let running = 0;
      const transfers = group.transfers.map((item) => {
        running += item.amountCents;
        return { ...item, balanceCents: running };
      });
      return {
        ...group,
        transfers: [...transfers].reverse(),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

function normalizeHeader(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function parseBankAmount(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const negative = /^\(.*\)$/.test(trimmed) || /^-/.test(trimmed.replace(/\s/g, ""));
  const raw = trimmed
    .replace(/\s/g, "")
    .replace(/[()$]/g, "")
    .replace(/^USD/i, "")
    .replace(/^-/, "");
  let number: number;
  if (raw.includes(",") && raw.includes(".")) {
    number = Number(raw.replace(/\./g, "").replace(",", "."));
  } else if (raw.includes(",")) {
    const [, decimals = ""] = raw.split(",");
    number =
      decimals.length === 3 && !raw.includes(".")
        ? Number(raw.replace(/,/g, ""))
        : Number(raw.replace(",", "."));
  } else {
    number = Number(raw.replace(/,/g, ""));
  }
  if (Number.isNaN(number)) return 0;
  const cents = Math.round(number * 100);
  return negative ? -Math.abs(cents) : cents;
}

export function parseBankDate(value: string) {
  const trimmed = value.trim();
  const withTime = trimmed.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (withTime) {
    const [, day, month, year, hour = "0", minute = "0", second = "0"] = withTime;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    ).toISOString();
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) {
    return new Date(trimmed).toISOString();
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return new Date(`${trimmed.slice(0, 10)}T00:00:00`).toISOString();
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

export function parseBankCurrency(value: string): "ARS" | "USD" {
  return /usd|dolar|dólar/i.test(value) ? "USD" : "ARS";
}

export function computeExtract(movements: PanelBankMovement[], meta: BankExtractMeta) {
  const chrono = [...movements].sort((a, b) => {
    const byDate = a.occurredAt.localeCompare(b.occurredAt);
    return byDate !== 0 ? byDate : a.id - b.id;
  });
  let ars = meta.initialBalanceCents;
  let usd = meta.initialBalanceUsdCents;
  const balances = new Map<number, number>();
  for (const movement of chrono) {
    if (movement.currency === "USD") {
      usd += movement.amountCents;
      balances.set(movement.id, usd);
    } else {
      ars += movement.amountCents;
      balances.set(movement.id, ars);
    }
  }
  const rows: BankMovementRow[] = [...chrono]
    .reverse()
    .map((movement) => ({
      ...movement,
      balanceCents: balances.get(movement.id) ?? 0,
    }));
  return { rows, totalArs: ars, totalUsd: usd };
}

export function parseBankExtractCsv(text: string): BankMovementInput[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const delimiter = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(delimiter).map((cell) => normalizeHeader(cell.replace(/^"|"$/g, "")));
  const index = (aliases: string[]) => headers.findIndex((header) => aliases.includes(header));

  const fecha = index(["fecha", "fechahora", "date", "datetime"]);
  const reference = index(["referencia", "comprobante", "reference", "id"]);
  const concept = index(["concepto", "descripcion", "detalle", "concept"]);
  const amount = index(["importe", "monto", "amount", "haber", "valor"]);
  const currency = index(["moneda", "currency"]);

  return lines
    .slice(1)
    .map((line) => {
      const cells = line.split(delimiter).map((cell) => cell.replace(/^"|"$/g, "").trim());
      return {
        occurredAt: parseBankDate(fecha >= 0 ? cells[fecha] ?? "" : ""),
        reference: reference >= 0 ? cells[reference] ?? "" : "",
        concept: concept >= 0 ? cells[concept] ?? "" : "",
        amountCents: parseBankAmount(amount >= 0 ? cells[amount] ?? "" : ""),
        currency: parseBankCurrency(currency >= 0 ? cells[currency] ?? "" : ""),
      };
    })
    .filter((row) => row.occurredAt && row.amountCents !== 0);
}

export function bankExtractToCsv(rows: BankMovementRow[]) {
  const header = ["Fecha", "Referencia", "Concepto", "Importe", "Saldo", "Moneda"];
  const lines = [
    header.join(";"),
    ...rows.map((row) =>
      [
        formatExtractDate(row.occurredAt),
        row.reference,
        row.concept,
        formatBankMoney(row.amountCents, row.currency),
        formatBankMoney(row.balanceCents, row.currency),
        row.currency,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(";"),
    ),
  ];
  return `\uFEFF${lines.join("\n")}`;
}
