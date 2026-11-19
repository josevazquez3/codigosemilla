"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { parseBankAmount } from "@/lib/bank-extract";
import {
  changeSubscriptionLifecycle,
  createAssignedSubscription,
  regenerateCheckout,
  refreshSubscriptionFromMp,
  SUBSCRIPTION_PERIODS,
  type PeriodId,
} from "@/lib/subscriptions";

function refresh() {
  revalidatePath("/panel", "layout");
}

async function actor() {
  const user = await getSessionUser();
  if (!user) throw new Error("Sesión requerida");
  return user;
}

async function adminActor() {
  const user = await actor();
  if (user.role !== "Admin") return { error: "No tenés permiso para esta acción." as const };
  return user;
}

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export async function createSubscriptionAction(formData: FormData): Promise<
  | { error: string }
  | {
      ok: true;
      id: number;
      token: string;
      userName: string;
      userPhone: string;
      concept: string;
      amountCents: number;
      currency: string;
      warning?: string;
    }
> {
  const admin = await adminActor();
  if ("error" in admin) return { error: admin.error };

  const userId = Number(formData.get("userId"));
  const concept = text(formData, "concept");
  const amountCents = parseBankAmount(text(formData, "amount"));
  const periodId = text(formData, "periodId") as PeriodId;
  const startDate = text(formData, "startDate");

  if (!userId) return { error: "Seleccioná un usuario del sistema." };
  if (!concept) return { error: "Completá el concepto del cobro." };
  if (amountCents <= 0) return { error: "El importe debe ser mayor a 0." };
  if (!SUBSCRIPTION_PERIODS.some((item) => item.id === periodId)) {
    return { error: "La periodicidad no es válida." };
  }

  try {
    const result = await createAssignedSubscription({
      userId,
      concept,
      amountCents,
      currency: "ARS",
      periodId,
      startDate: startDate || undefined,
      actorEmail: admin.email,
    });
    refresh();
    return {
      ok: true as const,
      id: result.subscription.id,
      token: result.subscription.authorizationToken,
      userName: result.subscription.userName,
      userPhone: result.subscription.userPhone,
      concept: result.subscription.concept,
      amountCents: result.subscription.amountCents,
      currency: result.subscription.currency,
      warning: result.mpError || undefined,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo crear la suscripción." };
  }
}

export async function regenerateCheckoutAction(formData: FormData) {
  const admin = await adminActor();
  if ("error" in admin) return admin;
  const id = Number(formData.get("id"));
  if (!id) return { error: "Suscripción inválida." };
  try {
    await regenerateCheckout(id, admin.email);
    refresh();
    return { ok: true as const };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo generar el enlace." };
  }
}

export async function pauseSubscriptionAction(formData: FormData) {
  const admin = await adminActor();
  if ("error" in admin) return admin;
  const id = Number(formData.get("id"));
  try {
    await changeSubscriptionLifecycle(id, "pause", admin.email);
    refresh();
    return { ok: true as const };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo pausar." };
  }
}

export async function resumeSubscriptionAction(formData: FormData) {
  const admin = await adminActor();
  if ("error" in admin) return admin;
  const id = Number(formData.get("id"));
  try {
    await changeSubscriptionLifecycle(id, "resume", admin.email);
    refresh();
    return { ok: true as const };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo reactivar." };
  }
}

export async function cancelSubscriptionAction(formData: FormData) {
  const admin = await adminActor();
  if ("error" in admin) return admin;
  const id = Number(formData.get("id"));
  const reason = text(formData, "reason");
  try {
    await changeSubscriptionLifecycle(id, "cancel", admin.email, reason);
    refresh();
    return { ok: true as const };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo cancelar." };
  }
}

export async function refreshSubscriptionAction(formData: FormData) {
  const user = await actor();
  const id = Number(formData.get("id"));
  const current = await refreshSubscriptionFromMp(id);
  if (!current) return { error: "Suscripción no encontrada." };
  if (user.role !== "Admin" && current.userId !== user.id) {
    return { error: "No tenés permiso para esta acción." };
  }
  refresh();
  return { ok: true as const, status: current.status };
}
