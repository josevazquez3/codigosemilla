import { createHmac, timingSafeEqual } from "crypto";

const MP_API = "https://api.mercadopago.com";

export type MpFrequencyType = "days" | "months";

export type MpPreapproval = {
  id: string;
  status?: string;
  reason?: string;
  init_point?: string;
  sandbox_init_point?: string;
  payer_id?: number | string;
  next_payment_date?: string;
  date_created?: string;
  last_modified?: string;
  external_reference?: string;
  auto_recurring?: {
    frequency?: number;
    frequency_type?: string;
    transaction_amount?: number;
    currency_id?: string;
    start_date?: string;
    end_date?: string;
  };
};

export type MpAuthorizedPayment = {
  id: number | string;
  preapproval_id?: string;
  debit_date?: string;
  date_created?: string;
  next_retry_date?: string;
  status?: string;
  transaction_amount?: number;
  currency_id?: string;
  payment?: {
    id?: number | string;
    status?: string;
    status_detail?: string;
  };
};

export type MpPayment = {
  id: number | string;
  status?: string;
  status_detail?: string;
  transaction_amount?: number;
  currency_id?: string;
  date_approved?: string;
  metadata?: Record<string, unknown>;
  external_reference?: string;
  point_of_interaction?: { transaction_data?: { subscription_id?: string } };
};

export function isMercadoPagoConfigured() {
  return Boolean(process.env.MP_ACCESS_TOKEN?.trim());
}

export function publicSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

function accessToken() {
  const token = process.env.MP_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("Falta MP_ACCESS_TOKEN en las variables de entorno.");
  return token;
}

async function mpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${MP_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const causes = Array.isArray(payload.cause)
      ? payload.cause
          .map((item) =>
            item && typeof item === "object" && "description" in item
              ? String((item as { description?: string }).description ?? "")
              : "",
          )
          .filter(Boolean)
          .join("; ")
      : "";
    const message = String(payload.message || payload.error || `Mercado Pago respondió ${response.status}`);
    throw new Error(causes || message);
  }
  return payload as T;
}

export async function createPreapproval(input: {
  reason: string;
  externalReference: string;
  payerEmail: string;
  amount: number;
  currency: string;
  frequency: number;
  frequencyType: MpFrequencyType;
  startDate?: string;
  backUrl: string;
  notificationUrl: string;
}) {
  const autoRecurring: Record<string, unknown> = {
    frequency: input.frequency,
    frequency_type: input.frequencyType,
    transaction_amount: Number(input.amount.toFixed(2)),
    currency_id: input.currency,
  };
  if (input.startDate) autoRecurring.start_date = input.startDate;

  return mpFetch<MpPreapproval>("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: input.reason,
      external_reference: input.externalReference,
      payer_email: input.payerEmail,
      auto_recurring: autoRecurring,
      back_url: input.backUrl,
      notification_url: input.notificationUrl,
      status: "pending",
    }),
  });
}

export async function getPreapproval(id: string) {
  return mpFetch<MpPreapproval>(`/preapproval/${encodeURIComponent(id)}`);
}

export async function updatePreapprovalStatus(id: string, status: "paused" | "authorized" | "cancelled") {
  const payloadStatus = status === "cancelled" ? "cancelled" : status;
  try {
    return await mpFetch<MpPreapproval>(`/preapproval/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ status: payloadStatus }),
    });
  } catch (error) {
    if (status !== "cancelled") throw error;
    return mpFetch<MpPreapproval>(`/preapproval/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ status: "canceled" }),
    });
  }
}

export async function getAuthorizedPayment(id: string) {
  return mpFetch<MpAuthorizedPayment>(`/authorized_payments/${encodeURIComponent(id)}`);
}

export async function getPayment(id: string) {
  return mpFetch<MpPayment>(`/v1/payments/${encodeURIComponent(id)}`);
}

export type MpWebhookPayload = {
  id?: string | number;
  type?: string;
  topic?: string;
  action?: string;
  live_mode?: boolean;
  data?: { id?: string | number };
};

export function parseWebhookPayload(body: unknown, url: URL): MpWebhookPayload {
  const payload = (body && typeof body === "object" ? body : {}) as MpWebhookPayload;
  const queryId = url.searchParams.get("data.id") || url.searchParams.get("id") || "";
  const queryType = url.searchParams.get("type") || url.searchParams.get("topic") || "";
  return {
    ...payload,
    type: payload.type || payload.topic || queryType,
    data: { id: payload.data?.id ?? payload.id ?? queryId },
  };
}

export function webhookResourceId(payload: MpWebhookPayload) {
  return String(payload.data?.id ?? payload.id ?? "").trim();
}

export function verifyMercadoPagoSignature(request: Request, resourceId: string) {
  const secret = process.env.MP_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return { ok: true, skipped: true as const };
  }

  const signature = request.headers.get("x-signature") ?? "";
  const requestId = request.headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(
    signature
      .split(",")
      .map((part) => part.split("=").map((item) => item.trim()))
      .filter((pair) => pair.length >= 2)
      .map(([key, ...rest]) => [key, rest.join("=")]),
  );
  const ts = parts.ts ?? "";
  const v1 = parts.v1 ?? "";
  if (!ts || !v1 || !resourceId || !requestId) {
    return { ok: false, skipped: false as const };
  }

  const canonical = `id:${resourceId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(canonical).digest("hex");
  const received = v1.toLowerCase();
  const computed = expected.toLowerCase();
  if (received.length !== computed.length) return { ok: false, skipped: false as const };
  const matches = timingSafeEqual(Buffer.from(received), Buffer.from(computed));
  return { ok: matches, skipped: false as const };
}

export function mapPreapprovalStatus(status?: string) {
  const value = String(status ?? "").toLowerCase();
  if (value === "authorized") return "authorized" as const;
  if (value === "paused") return "paused" as const;
  if (value === "cancelled" || value === "canceled") return "cancelled" as const;
  if (value === "pending") return "pending_authorization" as const;
  return "pending_authorization" as const;
}

export function mapChargeStatus(authorized?: MpAuthorizedPayment, payment?: MpPayment) {
  const paymentStatus = String(payment?.status || authorized?.payment?.status || "").toLowerCase();
  const authorizedStatus = String(authorized?.status || "").toLowerCase();
  if (["approved", "accredited"].includes(paymentStatus) || authorizedStatus === "processed") {
    return "approved" as const;
  }
  if (["rejected", "declined"].includes(paymentStatus) || authorizedStatus === "recycling") {
    return "rejected" as const;
  }
  if (["cancelled", "canceled"].includes(paymentStatus) || authorizedStatus === "cancelled") {
    return "cancelled" as const;
  }
  if (["refunded", "charged_back"].includes(paymentStatus)) return "refunded" as const;
  if (["pending", "in_process", "scheduled"].includes(paymentStatus) || authorizedStatus === "scheduled") {
    return "pending" as const;
  }
  return (paymentStatus || authorizedStatus || "pending") as
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled"
    | "refunded";
}

export function pesosFromCents(cents: number) {
  return Number((cents / 100).toFixed(2));
}

export function centsFromPesos(amount: number) {
  return Math.round(amount * 100);
}
