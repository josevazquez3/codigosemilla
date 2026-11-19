import { neon } from "@neondatabase/serverless";

function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_ENV === "production") return "https://www.guadalupevazquez.com.ar";
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export type MercadoPagoSecrets = {
  accessToken: string;
  webhookSecret: string;
  publicKey: string;
  accountLabel: string;
  accountEmail: string;
  accountId: string;
};

export type MercadoPagoStatus = {
  configured: boolean;
  tokenConfigured: boolean;
  webhookConfigured: boolean;
  tokenHint: string;
  webhookHint: string;
  publicKeyHint: string;
  accountLabel: string;
  accountEmail: string;
  accountId: string;
  webhookUrl: string;
  source: "panel" | "env" | "none";
};

type Memory = MercadoPagoSecrets;

const g = globalThis as typeof globalThis & { __gvMpSettings?: Memory };
const KEYS = {
  accessToken: "mpAccessToken",
  webhookSecret: "mpWebhookSecret",
  publicKey: "mpPublicKey",
  accountLabel: "mpAccountLabel",
  accountEmail: "mpAccountEmail",
  accountId: "mpAccountId",
} as const;

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

function emptySecrets(): MercadoPagoSecrets {
  return {
    accessToken: "",
    webhookSecret: "",
    publicKey: "",
    accountLabel: "",
    accountEmail: "",
    accountId: "",
  };
}

function memory() {
  g.__gvMpSettings ??= emptySecrets();
  return g.__gvMpSettings;
}

function maskSecret(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length <= 10) return "••••••••";
  return `${trimmed.slice(0, 8)}••••${trimmed.slice(-4)}`;
}

async function readStored(): Promise<MercadoPagoSecrets> {
  const sql = getSql();
  if (!sql) return { ...memory() };
  const rows = await sql`SELECT key, value FROM panel_settings WHERE key LIKE 'mp%'`;
  const stored = emptySecrets();
  for (const row of rows) {
    const key = String(row.key);
    const value = String(row.value ?? "");
    if (key === KEYS.accessToken) stored.accessToken = value;
    if (key === KEYS.webhookSecret) stored.webhookSecret = value;
    if (key === KEYS.publicKey) stored.publicKey = value;
    if (key === KEYS.accountLabel) stored.accountLabel = value;
    if (key === KEYS.accountEmail) stored.accountEmail = value;
    if (key === KEYS.accountId) stored.accountId = value;
  }
  return stored;
}

async function writeKey(key: string, value: string) {
  const sql = getSql();
  if (!sql) {
    const store = memory();
    if (key === KEYS.accessToken) store.accessToken = value;
    if (key === KEYS.webhookSecret) store.webhookSecret = value;
    if (key === KEYS.publicKey) store.publicKey = value;
    if (key === KEYS.accountLabel) store.accountLabel = value;
    if (key === KEYS.accountEmail) store.accountEmail = value;
    if (key === KEYS.accountId) store.accountId = value;
    return;
  }
  await sql`
    INSERT INTO panel_settings (key, value)
    VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
}

export async function getMercadoPagoSecrets(): Promise<MercadoPagoSecrets> {
  const stored = await readStored();
  return {
    accessToken: stored.accessToken || process.env.MP_ACCESS_TOKEN?.trim() || "",
    webhookSecret: stored.webhookSecret || process.env.MP_WEBHOOK_SECRET?.trim() || "",
    publicKey: stored.publicKey || process.env.NEXT_PUBLIC_MP_PUBLIC_KEY?.trim() || "",
    accountLabel: stored.accountLabel,
    accountEmail: stored.accountEmail,
    accountId: stored.accountId,
  };
}

export async function getMercadoPagoStatus(): Promise<MercadoPagoStatus> {
  const stored = await readStored();
  const envToken = process.env.MP_ACCESS_TOKEN?.trim() || "";
  const envSecret = process.env.MP_WEBHOOK_SECRET?.trim() || "";
  const token = stored.accessToken || envToken;
  const webhook = stored.webhookSecret || envSecret;
  const source = stored.accessToken ? "panel" : envToken ? "env" : "none";
  return {
    configured: Boolean(token),
    tokenConfigured: Boolean(token),
    webhookConfigured: Boolean(webhook),
    tokenHint: maskSecret(token),
    webhookHint: maskSecret(webhook),
    publicKeyHint: maskSecret(stored.publicKey),
    accountLabel: stored.accountLabel,
    accountEmail: stored.accountEmail,
    accountId: stored.accountId,
    webhookUrl: `${siteUrl()}/api/mercadopago/webhook`,
    source,
  };
}

export async function fetchMercadoPagoAccount(accessToken: string) {
  const response = await fetch("https://api.mercadopago.com/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(String(payload.message || "El Access Token no es válido."));
  }
  const nickname = String(payload.nickname || payload.first_name || "").trim();
  const email = String(payload.email || "").trim();
  const id = String(payload.id || "").trim();
  return {
    accountLabel: nickname || email || `Cuenta ${id}`,
    accountEmail: email,
    accountId: id,
  };
}

export async function saveMercadoPagoSettings(input: {
  accessToken?: string;
  webhookSecret?: string;
  publicKey?: string;
  clear?: boolean;
}) {
  if (input.clear) {
    await writeKey(KEYS.accessToken, "");
    await writeKey(KEYS.webhookSecret, "");
    await writeKey(KEYS.publicKey, "");
    await writeKey(KEYS.accountLabel, "");
    await writeKey(KEYS.accountEmail, "");
    await writeKey(KEYS.accountId, "");
    return getMercadoPagoStatus();
  }

  const token = input.accessToken?.trim() ?? "";
  const webhookSecret = input.webhookSecret?.trim() ?? "";
  const publicKey = input.publicKey?.trim() ?? "";
  if (!token && !webhookSecret && !publicKey) {
    throw new Error("Pegá el Access Token de producción para conectar la cuenta.");
  }
  if (token) {
    const account = await fetchMercadoPagoAccount(token);
    await writeKey(KEYS.accessToken, token);
    await writeKey(KEYS.accountLabel, account.accountLabel);
    await writeKey(KEYS.accountEmail, account.accountEmail);
    await writeKey(KEYS.accountId, account.accountId);
  }
  if (webhookSecret) {
    await writeKey(KEYS.webhookSecret, webhookSecret);
  }
  if (publicKey) {
    await writeKey(KEYS.publicKey, publicKey);
  }
  return getMercadoPagoStatus();
}
