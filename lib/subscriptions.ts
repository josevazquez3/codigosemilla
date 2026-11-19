import { randomBytes } from "crypto";
import { neon } from "@neondatabase/serverless";
import { getUserById, listUsers, logAudit } from "@/lib/panel-data";
import {
  centsFromPesos,
  createPreapproval,
  getAuthorizedPayment,
  getPayment,
  getPreapproval,
  isMercadoPagoConfigured,
  mapChargeStatus,
  mapPreapprovalStatus,
  pesosFromCents,
  publicSiteUrl,
  updatePreapprovalStatus,
  type MpAuthorizedPayment,
  type MpPayment,
  type MpPreapproval,
} from "@/lib/mercadopago";

export type SubscriptionStatus =
  | "pending_authorization"
  | "authorized"
  | "paused"
  | "cancelled"
  | "rejected";

export type ChargeStatus = "pending" | "approved" | "rejected" | "cancelled" | "refunded";

export type FrequencyType = "days" | "months";

export const SUBSCRIPTION_PERIODS = [
  { id: "weekly", label: "Semanal", frequency: 7, frequencyType: "days" as const },
  { id: "monthly", label: "Mensual", frequency: 1, frequencyType: "months" as const },
  { id: "quarterly", label: "Trimestral", frequency: 3, frequencyType: "months" as const },
  { id: "semiannual", label: "Semestral", frequency: 6, frequencyType: "months" as const },
  { id: "annual", label: "Anual", frequency: 12, frequencyType: "months" as const },
] as const;

export type PeriodId = (typeof SUBSCRIPTION_PERIODS)[number]["id"];

export type PanelSubscription = {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  concept: string;
  amountCents: number;
  currency: string;
  periodId: PeriodId;
  frequency: number;
  frequencyType: FrequencyType;
  status: SubscriptionStatus;
  mpPreapprovalId: string;
  mpInitPoint: string;
  mpSandboxInitPoint: string;
  mpPayerId: string;
  authorizationToken: string;
  startDate: string;
  nextChargeAt: string;
  lastChargeAt: string;
  authorizedAt: string;
  cancelledAt: string;
  cancelledReason: string;
  createdAt: string;
  updatedAt: string;
};

export type PanelSubscriptionCharge = {
  id: number;
  subscriptionId: number;
  mpAuthorizedPaymentId: string;
  mpPaymentId: string;
  amountCents: number;
  currency: string;
  status: ChargeStatus;
  mpStatus: string;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
};

export type PanelSubscriptionEvent = {
  id: number;
  subscriptionId: number | null;
  topic: string;
  resourceId: string;
  action: string;
  detail: string;
  createdAt: string;
};

type Memory = {
  subscriptions: PanelSubscription[];
  charges: PanelSubscriptionCharge[];
  events: PanelSubscriptionEvent[];
  notifications: string[];
  ids: Record<string, number>;
};

const g = globalThis as typeof globalThis & { __gvSubscriptions?: Memory };

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

function iso(date = new Date()) {
  return date.toISOString();
}

function nextId(store: Memory, key: string) {
  store.ids[key] = (store.ids[key] ?? 0) + 1;
  return store.ids[key];
}

function memory(): Memory {
  if (!g.__gvSubscriptions) {
    g.__gvSubscriptions = {
      subscriptions: [],
      charges: [],
      events: [],
      notifications: [],
      ids: {},
    };
  }
  return g.__gvSubscriptions;
}

export function periodById(id: string) {
  return SUBSCRIPTION_PERIODS.find((item) => item.id === id) ?? SUBSCRIPTION_PERIODS[1];
}

export function periodLabel(frequency: number, frequencyType: string, periodId?: string) {
  const known = SUBSCRIPTION_PERIODS.find(
    (item) => item.id === periodId || (item.frequency === frequency && item.frequencyType === frequencyType),
  );
  return known?.label ?? `${frequency} ${frequencyType === "days" ? "días" : "meses"}`;
}

export function authorizePublicUrl(token: string) {
  return `${publicSiteUrl()}/s/${token}`;
}

export function webhookUrl() {
  return `${publicSiteUrl()}/api/mercadopago/webhook`;
}

async function ensureSubscriptionSchema() {
  const sql = getSql();
  if (!sql) return;

  await sql`
    CREATE TABLE IF NOT EXISTS panel_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL,
      concept TEXT NOT NULL,
      amount_cents INT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ARS',
      period_id TEXT NOT NULL DEFAULT 'monthly',
      frequency INT NOT NULL DEFAULT 1,
      frequency_type TEXT NOT NULL DEFAULT 'months',
      status TEXT NOT NULL DEFAULT 'pending_authorization',
      mp_preapproval_id TEXT DEFAULT '',
      mp_init_point TEXT DEFAULT '',
      mp_sandbox_init_point TEXT DEFAULT '',
      mp_payer_id TEXT DEFAULT '',
      authorization_token TEXT NOT NULL,
      start_date TEXT DEFAULT '',
      next_charge_at TEXT DEFAULT '',
      last_charge_at TEXT DEFAULT '',
      authorized_at TEXT DEFAULT '',
      cancelled_at TEXT DEFAULT '',
      cancelled_reason TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS panel_subscriptions_user ON panel_subscriptions (user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS panel_subscriptions_status ON panel_subscriptions (status)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS panel_subscriptions_token ON panel_subscriptions (authorization_token)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS panel_subscriptions_mp_id ON panel_subscriptions (mp_preapproval_id) WHERE mp_preapproval_id <> ''`;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_subscription_charges (
      id SERIAL PRIMARY KEY,
      subscription_id INT NOT NULL,
      mp_authorized_payment_id TEXT DEFAULT '',
      mp_payment_id TEXT DEFAULT '',
      amount_cents INT NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'ARS',
      status TEXT NOT NULL DEFAULT 'pending',
      mp_status TEXT DEFAULT '',
      paid_at TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS panel_subscription_charges_sub ON panel_subscription_charges (subscription_id)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS panel_subscription_charges_auth ON panel_subscription_charges (mp_authorized_payment_id) WHERE mp_authorized_payment_id <> ''`;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_subscription_events (
      id SERIAL PRIMARY KEY,
      subscription_id INT,
      topic TEXT DEFAULT '',
      resource_id TEXT DEFAULT '',
      action TEXT DEFAULT '',
      detail TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_mp_notifications (
      id SERIAL PRIMARY KEY,
      dedupe_key TEXT NOT NULL UNIQUE,
      topic TEXT DEFAULT '',
      resource_id TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

function parseStatus(value: unknown): SubscriptionStatus {
  const status = String(value ?? "");
  if (status === "authorized" || status === "paused" || status === "cancelled" || status === "rejected") {
    return status;
  }
  return "pending_authorization";
}

function parseChargeStatus(value: unknown): ChargeStatus {
  const status = String(value ?? "");
  if (status === "approved" || status === "rejected" || status === "cancelled" || status === "refunded") {
    return status;
  }
  return "pending";
}

function parsePeriodId(value: unknown): PeriodId {
  const id = String(value ?? "");
  return SUBSCRIPTION_PERIODS.some((item) => item.id === id) ? (id as PeriodId) : "monthly";
}

function mapSubscription(
  row: Record<string, unknown>,
  user?: { name: string; email: string; phone: string } | null,
): PanelSubscription {
  return {
    id: Number(row.id),
    userId: Number(row.user_id ?? row.userId),
    userName: user?.name ?? String(row.user_name ?? row.userName ?? ""),
    userEmail: user?.email ?? String(row.user_email ?? row.userEmail ?? ""),
    userPhone: user?.phone ?? String(row.user_phone ?? row.userPhone ?? ""),
    concept: String(row.concept ?? ""),
    amountCents: Number(row.amount_cents ?? row.amountCents ?? 0),
    currency: String(row.currency ?? "ARS"),
    periodId: parsePeriodId(row.period_id ?? row.periodId),
    frequency: Number(row.frequency ?? 1),
    frequencyType: String(row.frequency_type ?? row.frequencyType ?? "months") === "days" ? "days" : "months",
    status: parseStatus(row.status),
    mpPreapprovalId: String(row.mp_preapproval_id ?? row.mpPreapprovalId ?? ""),
    mpInitPoint: String(row.mp_init_point ?? row.mpInitPoint ?? ""),
    mpSandboxInitPoint: String(row.mp_sandbox_init_point ?? row.mpSandboxInitPoint ?? ""),
    mpPayerId: String(row.mp_payer_id ?? row.mpPayerId ?? ""),
    authorizationToken: String(row.authorization_token ?? row.authorizationToken ?? ""),
    startDate: String(row.start_date ?? row.startDate ?? ""),
    nextChargeAt: String(row.next_charge_at ?? row.nextChargeAt ?? ""),
    lastChargeAt: String(row.last_charge_at ?? row.lastChargeAt ?? ""),
    authorizedAt: String(row.authorized_at ?? row.authorizedAt ?? ""),
    cancelledAt: String(row.cancelled_at ?? row.cancelledAt ?? ""),
    cancelledReason: String(row.cancelled_reason ?? row.cancelledReason ?? ""),
    createdAt: iso(new Date(String(row.created_at ?? row.createdAt ?? Date.now()))),
    updatedAt: iso(new Date(String(row.updated_at ?? row.updatedAt ?? Date.now()))),
  };
}

function mapCharge(row: Record<string, unknown>): PanelSubscriptionCharge {
  return {
    id: Number(row.id),
    subscriptionId: Number(row.subscription_id ?? row.subscriptionId),
    mpAuthorizedPaymentId: String(row.mp_authorized_payment_id ?? row.mpAuthorizedPaymentId ?? ""),
    mpPaymentId: String(row.mp_payment_id ?? row.mpPaymentId ?? ""),
    amountCents: Number(row.amount_cents ?? row.amountCents ?? 0),
    currency: String(row.currency ?? "ARS"),
    status: parseChargeStatus(row.status),
    mpStatus: String(row.mp_status ?? row.mpStatus ?? ""),
    paidAt: String(row.paid_at ?? row.paidAt ?? ""),
    createdAt: iso(new Date(String(row.created_at ?? row.createdAt ?? Date.now()))),
    updatedAt: iso(new Date(String(row.updated_at ?? row.updatedAt ?? Date.now()))),
  };
}

function mapEvent(row: Record<string, unknown>): PanelSubscriptionEvent {
  return {
    id: Number(row.id),
    subscriptionId: row.subscription_id == null && row.subscriptionId == null ? null : Number(row.subscription_id ?? row.subscriptionId),
    topic: String(row.topic ?? ""),
    resourceId: String(row.resource_id ?? row.resourceId ?? ""),
    action: String(row.action ?? ""),
    detail: String(row.detail ?? ""),
    createdAt: iso(new Date(String(row.created_at ?? row.createdAt ?? Date.now()))),
  };
}

async function withUsers(items: PanelSubscription[]) {
  const users = await listUsers();
  const byId = new Map(users.map((user) => [user.id, user]));
  return items.map((item) => {
    const user = byId.get(item.userId);
    return user
      ? { ...item, userName: user.name, userEmail: user.email, userPhone: user.phone }
      : item;
  });
}

export async function listSubscriptions(): Promise<PanelSubscription[]> {
  const sql = getSql();
  if (!sql) {
    return withUsers(
      [...memory().subscriptions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  }
  await ensureSubscriptionSchema();
  const rows = await sql`SELECT * FROM panel_subscriptions ORDER BY created_at DESC`;
  return withUsers(rows.map((row) => mapSubscription(row as Record<string, unknown>)));
}

export async function listSubscriptionsForUser(userId: number) {
  const all = await listSubscriptions();
  return all.filter((item) => item.userId === userId);
}

export async function getSubscriptionById(id: number) {
  const sql = getSql();
  if (!sql) {
    const found = memory().subscriptions.find((item) => item.id === id);
    if (!found) return null;
    const [hydrated] = await withUsers([found]);
    return hydrated ?? null;
  }
  await ensureSubscriptionSchema();
  const rows = await sql`SELECT * FROM panel_subscriptions WHERE id = ${id} LIMIT 1`;
  if (!rows[0]) return null;
  const [hydrated] = await withUsers([mapSubscription(rows[0] as Record<string, unknown>)]);
  return hydrated ?? null;
}

export async function getSubscriptionByToken(token: string) {
  const normalized = token.trim();
  if (!normalized) return null;
  const sql = getSql();
  if (!sql) {
    const found = memory().subscriptions.find((item) => item.authorizationToken === normalized);
    if (!found) return null;
    const [hydrated] = await withUsers([found]);
    return hydrated ?? null;
  }
  await ensureSubscriptionSchema();
  const rows = await sql`SELECT * FROM panel_subscriptions WHERE authorization_token = ${normalized} LIMIT 1`;
  if (!rows[0]) return null;
  const [hydrated] = await withUsers([mapSubscription(rows[0] as Record<string, unknown>)]);
  return hydrated ?? null;
}

export async function getSubscriptionByMpId(mpId: string) {
  const id = mpId.trim();
  if (!id) return null;
  const sql = getSql();
  if (!sql) {
    const found = memory().subscriptions.find((item) => item.mpPreapprovalId === id);
    if (!found) return null;
    const [hydrated] = await withUsers([found]);
    return hydrated ?? null;
  }
  await ensureSubscriptionSchema();
  const rows = await sql`SELECT * FROM panel_subscriptions WHERE mp_preapproval_id = ${id} LIMIT 1`;
  if (!rows[0]) return null;
  const [hydrated] = await withUsers([mapSubscription(rows[0] as Record<string, unknown>)]);
  return hydrated ?? null;
}

async function persistSubscription(item: PanelSubscription) {
  const sql = getSql();
  if (!sql) {
    const store = memory();
    const index = store.subscriptions.findIndex((row) => row.id === item.id);
    if (index >= 0) store.subscriptions[index] = item;
    else store.subscriptions.unshift(item);
    return item;
  }
  await ensureSubscriptionSchema();
  await sql`
    UPDATE panel_subscriptions SET
      user_id = ${item.userId},
      concept = ${item.concept},
      amount_cents = ${item.amountCents},
      currency = ${item.currency},
      period_id = ${item.periodId},
      frequency = ${item.frequency},
      frequency_type = ${item.frequencyType},
      status = ${item.status},
      mp_preapproval_id = ${item.mpPreapprovalId},
      mp_init_point = ${item.mpInitPoint},
      mp_sandbox_init_point = ${item.mpSandboxInitPoint},
      mp_payer_id = ${item.mpPayerId},
      authorization_token = ${item.authorizationToken},
      start_date = ${item.startDate},
      next_charge_at = ${item.nextChargeAt},
      last_charge_at = ${item.lastChargeAt},
      authorized_at = ${item.authorizedAt},
      cancelled_at = ${item.cancelledAt},
      cancelled_reason = ${item.cancelledReason},
      updated_at = NOW()
    WHERE id = ${item.id}
  `;
  return (await getSubscriptionById(item.id)) ?? item;
}

export async function listCharges(subscriptionId: number) {
  const sql = getSql();
  if (!sql) {
    return memory()
      .charges.filter((item) => item.subscriptionId === subscriptionId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  await ensureSubscriptionSchema();
  const rows = await sql`
    SELECT * FROM panel_subscription_charges
    WHERE subscription_id = ${subscriptionId}
    ORDER BY created_at DESC
  `;
  return rows.map((row) => mapCharge(row as Record<string, unknown>));
}

export async function listSubscriptionEvents(subscriptionId: number) {
  const sql = getSql();
  if (!sql) {
    return memory()
      .events.filter((item) => item.subscriptionId === subscriptionId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  await ensureSubscriptionSchema();
  const rows = await sql`
    SELECT * FROM panel_subscription_events
    WHERE subscription_id = ${subscriptionId}
    ORDER BY created_at DESC
  `;
  return rows.map((row) => mapEvent(row as Record<string, unknown>));
}

export async function recordSubscriptionEvent(input: {
  subscriptionId?: number | null;
  topic: string;
  resourceId?: string;
  action: string;
  detail: string;
}) {
  const sql = getSql();
  if (!sql) {
    const store = memory();
    store.events.unshift({
      id: nextId(store, "events"),
      subscriptionId: input.subscriptionId ?? null,
      topic: input.topic,
      resourceId: input.resourceId ?? "",
      action: input.action,
      detail: input.detail,
      createdAt: iso(),
    });
    return;
  }
  await ensureSubscriptionSchema();
  await sql`
    INSERT INTO panel_subscription_events (subscription_id, topic, resource_id, action, detail)
    VALUES (${input.subscriptionId ?? null}, ${input.topic}, ${input.resourceId ?? ""}, ${input.action}, ${input.detail})
  `;
}

function notificationKey(topic: string, resourceId: string, requestId = "") {
  return `${topic}:${resourceId}:${requestId || "na"}`;
}

export async function claimNotification(topic: string, resourceId: string, requestId = "") {
  const key = notificationKey(topic, resourceId, requestId);
  const sql = getSql();
  if (!sql) {
    const store = memory();
    if (store.notifications.includes(key)) return false;
    store.notifications.push(key);
    return true;
  }
  await ensureSubscriptionSchema();
  try {
    await sql`
      INSERT INTO panel_mp_notifications (dedupe_key, topic, resource_id)
      VALUES (${key}, ${topic}, ${resourceId})
    `;
    return true;
  } catch {
    return false;
  }
}

export async function releaseNotification(topic: string, resourceId: string, requestId = "") {
  const key = notificationKey(topic, resourceId, requestId);
  const sql = getSql();
  if (!sql) {
    const store = memory();
    store.notifications = store.notifications.filter((item) => item !== key);
    return;
  }
  await ensureSubscriptionSchema();
  await sql`DELETE FROM panel_mp_notifications WHERE dedupe_key = ${key}`;
}

function applyPreapproval(local: PanelSubscription, remote: MpPreapproval): PanelSubscription {
  const status = mapPreapprovalStatus(remote.status);
  const next = { ...local };
  next.mpPreapprovalId = String(remote.id || local.mpPreapprovalId);
  next.mpInitPoint = String(remote.init_point || local.mpInitPoint);
  next.mpSandboxInitPoint = String(remote.sandbox_init_point || local.mpSandboxInitPoint);
  next.mpPayerId = String(remote.payer_id ?? local.mpPayerId);
  next.nextChargeAt = String(remote.next_payment_date || local.nextChargeAt);
  next.status = local.status === "rejected" && status === "pending_authorization" ? local.status : status;
  if (status === "authorized" && !next.authorizedAt) next.authorizedAt = iso();
  if (status === "cancelled") {
    next.cancelledAt = next.cancelledAt || iso();
  }
  next.updatedAt = iso();
  return next;
}

export async function createAssignedSubscription(input: {
  userId: number;
  concept: string;
  amountCents: number;
  currency?: string;
  periodId: PeriodId;
  startDate?: string;
  actorEmail: string;
}) {
  const user = await getUserById(input.userId);
  if (!user) throw new Error("El usuario no existe.");
  if (!user.email) throw new Error("El usuario no tiene email para Mercado Pago.");
  const period = periodById(input.periodId);
  const token = randomBytes(24).toString("base64url");
  const now = iso();
  const currency = (input.currency || "ARS").toUpperCase();
  const base: PanelSubscription = {
    id: 0,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
    concept: input.concept.trim(),
    amountCents: input.amountCents,
    currency,
    periodId: period.id,
    frequency: period.frequency,
    frequencyType: period.frequencyType,
    status: "pending_authorization",
    mpPreapprovalId: "",
    mpInitPoint: "",
    mpSandboxInitPoint: "",
    mpPayerId: "",
    authorizationToken: token,
    startDate: input.startDate?.slice(0, 10) ?? "",
    nextChargeAt: "",
    lastChargeAt: "",
    authorizedAt: "",
    cancelledAt: "",
    cancelledReason: "",
    createdAt: now,
    updatedAt: now,
  };

  const sql = getSql();
  let created: PanelSubscription;
  if (!sql) {
    const store = memory();
    created = { ...base, id: nextId(store, "subscriptions") };
    store.subscriptions.unshift(created);
  } else {
    await ensureSubscriptionSchema();
    const rows = await sql`
      INSERT INTO panel_subscriptions (
        user_id, concept, amount_cents, currency, period_id, frequency, frequency_type,
        status, authorization_token, start_date
      )
      VALUES (
        ${base.userId}, ${base.concept}, ${base.amountCents}, ${base.currency}, ${base.periodId},
        ${base.frequency}, ${base.frequencyType}, ${base.status}, ${base.authorizationToken}, ${base.startDate}
      )
      RETURNING *
    `;
    created = mapSubscription(rows[0] as Record<string, unknown>, user);
  }

  let mpError = "";
  if (isMercadoPagoConfigured()) {
    try {
      const startDate = created.startDate
        ? new Date(`${created.startDate}T12:00:00-03:00`).toISOString()
        : undefined;
      const remote = await createPreapproval({
        reason: created.concept,
        externalReference: `gv-sub-${created.id}`,
        payerEmail: user.email,
        amount: pesosFromCents(created.amountCents),
        currency: created.currency,
        frequency: created.frequency,
        frequencyType: created.frequencyType,
        startDate,
        backUrl: `${publicSiteUrl()}/s/retorno?token=${created.authorizationToken}`,
        notificationUrl: webhookUrl(),
      });
      created = await persistSubscription(applyPreapproval(created, remote));
    } catch (error) {
      mpError = error instanceof Error ? error.message : "No se pudo crear la suscripción en Mercado Pago.";
      await recordSubscriptionEvent({
        subscriptionId: created.id,
        topic: "subscription_preapproval",
        action: "create_error",
        detail: mpError,
      });
    }
  } else {
    mpError = "Falta MP_ACCESS_TOKEN. La asignación quedó guardada; configurá Mercado Pago y reenviá el enlace.";
  }

  await recordSubscriptionEvent({
    subscriptionId: created.id,
    topic: "subscription_preapproval",
    action: "created",
    detail: `Asignada a ${user.name} (${user.email})`,
  });
  await logAudit({
    actorEmail: input.actorEmail,
    action: "subscription.create",
    entityType: "subscription",
    entityId: created.id,
    detail: `${created.concept} · ${user.name}`,
  });

  return { subscription: created, mpError };
}

export async function regenerateCheckout(subscriptionId: number, actorEmail: string) {
  const current = await getSubscriptionById(subscriptionId);
  if (!current) throw new Error("Suscripción no encontrada.");
  if (current.status === "cancelled") throw new Error("La suscripción está cancelada.");
  if (!isMercadoPagoConfigured()) throw new Error("Falta MP_ACCESS_TOKEN.");

  if (current.mpPreapprovalId) {
    const remote = await getPreapproval(current.mpPreapprovalId);
    const updated = await persistSubscription(applyPreapproval(current, remote));
    await logAudit({
      actorEmail,
      action: "subscription.refresh",
      entityType: "subscription",
      entityId: updated.id,
      detail: "Se actualizó el enlace de autorización",
    });
    return updated;
  }

  const remote = await createPreapproval({
    reason: current.concept,
    externalReference: `gv-sub-${current.id}`,
    payerEmail: current.userEmail,
    amount: pesosFromCents(current.amountCents),
    currency: current.currency,
    frequency: current.frequency,
    frequencyType: current.frequencyType,
    startDate: current.startDate ? new Date(`${current.startDate}T12:00:00-03:00`).toISOString() : undefined,
    backUrl: `${publicSiteUrl()}/s/retorno?token=${current.authorizationToken}`,
    notificationUrl: webhookUrl(),
  });
  const updated = await persistSubscription(applyPreapproval(current, remote));
  await recordSubscriptionEvent({
    subscriptionId: updated.id,
    topic: "subscription_preapproval",
    resourceId: updated.mpPreapprovalId,
    action: "checkout_created",
    detail: "Se generó el enlace de Mercado Pago",
  });
  return updated;
}

export async function changeSubscriptionLifecycle(
  subscriptionId: number,
  action: "pause" | "resume" | "cancel",
  actorEmail: string,
  reason = "",
) {
  const current = await getSubscriptionById(subscriptionId);
  if (!current) throw new Error("Suscripción no encontrada.");
  if (!current.mpPreapprovalId) throw new Error("Todavía no hay una suscripción en Mercado Pago.");

  const mpStatus = action === "pause" ? "paused" : action === "resume" ? "authorized" : "cancelled";
  const remote = await updatePreapprovalStatus(current.mpPreapprovalId, mpStatus);
  let next = applyPreapproval(current, remote);
  if (action === "cancel") {
    next.cancelledReason = reason;
    next.cancelledAt = next.cancelledAt || iso();
    next.status = "cancelled";
  }
  next = await persistSubscription(next);
  await recordSubscriptionEvent({
    subscriptionId: next.id,
    topic: "subscription_preapproval",
    resourceId: next.mpPreapprovalId,
    action,
    detail: reason || `Acción ${action}`,
  });
  await logAudit({
    actorEmail,
    action: `subscription.${action}`,
    entityType: "subscription",
    entityId: next.id,
    detail: reason || action,
  });
  return next;
}

export async function syncSubscriptionFromPreapproval(remote: MpPreapproval) {
  const local = await getSubscriptionByMpId(String(remote.id));
  if (!local) {
    const external = String(remote.external_reference ?? "");
    const match = external.match(/^gv-sub-(\d+)$/);
    if (!match) return null;
    const byId = await getSubscriptionById(Number(match[1]));
    if (!byId) return null;
    return persistSubscription(applyPreapproval(byId, remote));
  }
  return persistSubscription(applyPreapproval(local, remote));
}

async function upsertCharge(input: {
  subscriptionId: number;
  mpAuthorizedPaymentId: string;
  mpPaymentId: string;
  amountCents: number;
  currency: string;
  status: ChargeStatus;
  mpStatus: string;
  paidAt: string;
}) {
  const sql = getSql();
  const now = iso();
  if (!sql) {
    const store = memory();
    const existing = store.charges.find(
      (item) =>
        (input.mpAuthorizedPaymentId && item.mpAuthorizedPaymentId === input.mpAuthorizedPaymentId) ||
        (input.mpPaymentId && item.mpPaymentId === input.mpPaymentId && item.subscriptionId === input.subscriptionId),
    );
    if (existing) {
      Object.assign(existing, { ...input, updatedAt: now });
      return existing;
    }
    const created: PanelSubscriptionCharge = {
      id: nextId(store, "charges"),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    store.charges.unshift(created);
    return created;
  }

  await ensureSubscriptionSchema();
  const existing = input.mpAuthorizedPaymentId
    ? await sql`
        SELECT * FROM panel_subscription_charges
        WHERE mp_authorized_payment_id = ${input.mpAuthorizedPaymentId}
        LIMIT 1
      `
    : input.mpPaymentId
      ? await sql`
          SELECT * FROM panel_subscription_charges
          WHERE mp_payment_id = ${input.mpPaymentId} AND subscription_id = ${input.subscriptionId}
          LIMIT 1
        `
      : [];
  if (existing[0]) {
    await sql`
      UPDATE panel_subscription_charges SET
        mp_authorized_payment_id = ${input.mpAuthorizedPaymentId || String(existing[0].mp_authorized_payment_id ?? "")},
        mp_payment_id = ${input.mpPaymentId || String(existing[0].mp_payment_id ?? "")},
        amount_cents = ${input.amountCents},
        currency = ${input.currency},
        status = ${input.status},
        mp_status = ${input.mpStatus},
        paid_at = ${input.paidAt},
        updated_at = NOW()
      WHERE id = ${Number(existing[0].id)}
    `;
    return mapCharge({ ...(existing[0] as Record<string, unknown>), ...input, updated_at: now });
  }

  const rows = await sql`
    INSERT INTO panel_subscription_charges (
      subscription_id, mp_authorized_payment_id, mp_payment_id, amount_cents, currency, status, mp_status, paid_at
    )
    VALUES (
      ${input.subscriptionId}, ${input.mpAuthorizedPaymentId}, ${input.mpPaymentId}, ${input.amountCents},
      ${input.currency}, ${input.status}, ${input.mpStatus}, ${input.paidAt}
    )
    RETURNING *
  `;
  return mapCharge(rows[0] as Record<string, unknown>);
}

export async function syncAuthorizedPayment(remote: MpAuthorizedPayment) {
  const preapprovalId = String(remote.preapproval_id ?? "");
  const subscription = preapprovalId ? await getSubscriptionByMpId(preapprovalId) : null;
  if (!subscription) return null;

  let payment: MpPayment | undefined;
  const paymentId = remote.payment?.id ? String(remote.payment.id) : "";
  if (paymentId && isMercadoPagoConfigured()) {
    try {
      payment = await getPayment(paymentId);
    } catch {
      payment = undefined;
    }
  }

  const status = mapChargeStatus(remote, payment);
  const amount = Number(remote.transaction_amount ?? payment?.transaction_amount ?? pesosFromCents(subscription.amountCents));
  const paidAt =
    status === "approved"
      ? String(payment?.date_approved || remote.debit_date || iso())
      : String(remote.debit_date || "");

  const charge = await upsertCharge({
    subscriptionId: subscription.id,
    mpAuthorizedPaymentId: String(remote.id),
    mpPaymentId: paymentId,
    amountCents: centsFromPesos(amount),
    currency: String(remote.currency_id || payment?.currency_id || subscription.currency),
    status,
    mpStatus: String(payment?.status || remote.status || ""),
    paidAt,
  });

  if (status === "approved") {
    await persistSubscription({
      ...subscription,
      lastChargeAt: paidAt || iso(),
      nextChargeAt: String(remote.next_retry_date || subscription.nextChargeAt),
      updatedAt: iso(),
    });
  }

  await recordSubscriptionEvent({
    subscriptionId: subscription.id,
    topic: "subscription_authorized_payment",
    resourceId: String(remote.id),
    action: status,
    detail: status === "approved" ? "Cobro confirmado por Mercado Pago" : `Cobro ${status}`,
  });

  return charge;
}

export async function syncPayment(remote: MpPayment) {
  const status = mapChargeStatus(undefined, remote);
  const external = String(remote.external_reference ?? "");
  const match = external.match(/^gv-sub-(\d+)$/);
  let subscription = match ? await getSubscriptionById(Number(match[1])) : null;
  if (!subscription) {
    const subId = String(remote.point_of_interaction?.transaction_data?.subscription_id ?? "");
    if (subId) subscription = await getSubscriptionByMpId(subId);
  }
  if (!subscription) return null;

  const charge = await upsertCharge({
    subscriptionId: subscription.id,
    mpAuthorizedPaymentId: "",
    mpPaymentId: String(remote.id),
    amountCents: centsFromPesos(Number(remote.transaction_amount ?? pesosFromCents(subscription.amountCents))),
    currency: String(remote.currency_id || subscription.currency),
    status,
    mpStatus: String(remote.status ?? ""),
    paidAt: status === "approved" ? String(remote.date_approved || iso()) : "",
  });

  if (status === "approved") {
    await persistSubscription({
      ...subscription,
      lastChargeAt: charge.paidAt || iso(),
      updatedAt: iso(),
    });
  }

  await recordSubscriptionEvent({
    subscriptionId: subscription.id,
    topic: "payment",
    resourceId: String(remote.id),
    action: status,
    detail: `Pago ${status} informado por Mercado Pago`,
  });
  return charge;
}

export async function refreshSubscriptionFromMp(subscriptionId: number) {
  const current = await getSubscriptionById(subscriptionId);
  if (!current?.mpPreapprovalId || !isMercadoPagoConfigured()) return current;
  const remote = await getPreapproval(current.mpPreapprovalId);
  return persistSubscription(applyPreapproval(current, remote));
}

export async function getSubscriptionStats(items?: PanelSubscription[]) {
  const list = items ?? (await listSubscriptions());
  return {
    total: list.length,
    pending: list.filter((item) => item.status === "pending_authorization").length,
    authorized: list.filter((item) => item.status === "authorized").length,
    paused: list.filter((item) => item.status === "paused").length,
    cancelled: list.filter((item) => item.status === "cancelled").length,
  };
}

export function checkoutFor(subscription: PanelSubscription) {
  if (process.env.MP_ACCESS_TOKEN?.startsWith("TEST-")) {
    return subscription.mpSandboxInitPoint || subscription.mpInitPoint;
  }
  return subscription.mpInitPoint || subscription.mpSandboxInitPoint;
}

export { isMercadoPagoConfigured, publicSiteUrl, pesosFromCents };
