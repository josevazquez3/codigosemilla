import { after } from "next/server";
import {
  getAuthorizedPayment,
  getPayment,
  getPreapproval,
  parseWebhookPayload,
  verifyMercadoPagoSignature,
  webhookResourceId,
} from "@/lib/mercadopago";
import {
  claimNotification,
  recordSubscriptionEvent,
  releaseNotification,
  syncAuthorizedPayment,
  syncPayment,
  syncSubscriptionFromPreapproval,
} from "@/lib/subscriptions";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

async function handleTopic(type: string, resourceId: string) {
  if (!resourceId) return;

  if (type === "subscription_preapproval" || type === "preapproval") {
    const remote = await getPreapproval(resourceId);
    await syncSubscriptionFromPreapproval(remote);
    return;
  }

  if (type === "subscription_authorized_payment" || type === "authorized_payment") {
    const remote = await getAuthorizedPayment(resourceId);
    await syncAuthorizedPayment(remote);
    return;
  }

  if (type === "payment" || type === "topic_payment") {
    const remote = await getPayment(resourceId);
    await syncPayment(remote);
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = await request.json().catch(() => ({}));
  const payload = parseWebhookPayload(body, url);
  const resourceId = webhookResourceId(payload);
  const type = String(payload.type || payload.topic || "").toLowerCase();
  const requestId = request.headers.get("x-request-id") ?? "";

  const signature = await verifyMercadoPagoSignature(request, resourceId);
  if (!signature.ok) {
    return new Response("invalid signature", { status: 401 });
  }

  after(async () => {
    try {
      const claimed = await claimNotification(type || "unknown", resourceId, requestId);
      if (!claimed) return;
      await recordSubscriptionEvent({
        topic: type || "webhook",
        resourceId,
        action: payload.action || "notification",
        detail: signature.skipped ? "Webhook recibido (firma no configurada)" : "Webhook verificado",
      });
      await handleTopic(type, resourceId);
    } catch (error) {
      console.error("[mercadopago:webhook]", error);
      await releaseNotification(type || "unknown", resourceId, requestId);
      await recordSubscriptionEvent({
        topic: type || "webhook",
        resourceId,
        action: "error",
        detail: error instanceof Error ? error.message : "Error procesando notificación",
      });
    }
  });

  return new Response("ok", { status: 200 });
}

export async function GET(request: Request) {
  return POST(request);
}
