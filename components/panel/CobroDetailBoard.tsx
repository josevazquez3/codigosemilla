"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pause, Play, RefreshCw, Repeat, XCircle } from "lucide-react";
import {
  cancelSubscriptionAction,
  pauseSubscriptionAction,
  regenerateCheckoutAction,
  resumeSubscriptionAction,
} from "@/app/panel/cobros/actions";
import { fieldClass, StatusBadge } from "@/components/panel/ui";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { formatDate, formatDateTime, formatMoney } from "@/lib/panel-format";
import {
  authorizePublicUrl,
  checkoutFor,
  periodLabel,
  type PanelSubscription,
  type PanelSubscriptionCharge,
  type PanelSubscriptionEvent,
} from "@/lib/subscriptions";
import { whatsappUrl } from "@/lib/site-settings";

export function CobroDetailBoard({
  subscription,
  charges,
  events,
}: {
  subscription: PanelSubscription;
  charges: PanelSubscriptionCharge[];
  events: PanelSubscriptionEvent[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const url = authorizePublicUrl(subscription.authorizationToken);
  const checkout = checkoutFor(subscription);
  const wa = subscription.userPhone
    ? whatsappUrl(
        subscription.userPhone,
        `Hola ${subscription.userName}, autorizá el débito automático de ${subscription.concept} (${formatMoney(
          subscription.amountCents,
          subscription.currency,
        )}) en Mercado Pago: ${url}`,
      )
    : "";

  async function run(
    action: (formData: FormData) => Promise<{ error?: string; ok?: boolean }>,
    extra?: Record<string, string>,
  ) {
    setError("");
    const form = new FormData();
    form.set("id", String(subscription.id));
    for (const [key, value] of Object.entries(extra ?? {})) form.set(key, value);
    const result = await action(form);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Link href="/panel/cobros" className="inline-flex items-center gap-2 text-sm text-[#4f7a58]">
        <ArrowLeft size={16} />
        Volver al listado
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <Repeat size={26} />
        </div>
        <div className="min-w-0">
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">{subscription.concept}</h1>
          <p className="mt-2 text-sm text-primary/80">
            {subscription.userName} · {subscription.userEmail}
          </p>
        </div>
      </div>

      {error ? <p className="rounded-2xl bg-[#f8e6e4] px-4 py-3 text-sm text-[#7a3a34]">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm">
          <p className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Suscripción</p>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Estado" value={<StatusBadge value={subscription.status} />} />
            <Row label="Importe" value={formatMoney(subscription.amountCents, subscription.currency)} />
            <Row label="Periodicidad" value={periodLabel(subscription.frequency, subscription.frequencyType, subscription.periodId)} />
            <Row label="Inicio" value={subscription.startDate || "Al autorizar"} />
            <Row label="Próximo cobro" value={subscription.nextChargeAt ? formatDateTime(subscription.nextChargeAt) : "—"} />
            <Row label="Último cobro" value={subscription.lastChargeAt ? formatDateTime(subscription.lastChargeAt) : "—"} />
            <Row label="Alta" value={formatDateTime(subscription.createdAt)} />
            <Row label="Actualización" value={formatDateTime(subscription.updatedAt)} />
            <Row label="ID Mercado Pago" value={subscription.mpPreapprovalId || "—"} />
          </dl>
        </section>

        <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm">
          <p className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Autorización</p>
          <p className="mt-4 break-all rounded-xl bg-[#f7faf5] px-4 py-3 text-sm">{url}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(url)}
              className="rounded-full border border-[#d7e6d3] px-4 py-2 text-[11px] tracking-[0.14em] text-[#4f7a58] uppercase"
            >
              Copiar enlace
            </button>
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#d7e6d3] px-4 py-2 text-[11px] tracking-[0.14em] text-[#4f7a58] uppercase"
              >
                <WhatsAppIcon size={14} />
                WhatsApp
              </a>
            ) : null}
            {checkout ? (
              <a
                href={checkout}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#d7e6d3] px-4 py-2 text-[11px] tracking-[0.14em] text-[#4f7a58] uppercase"
              >
                Abrir Mercado Pago
              </a>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => run(regenerateCheckoutAction)}
              className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] px-4 py-2 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
            >
              <RefreshCw size={14} />
              Regenerar enlace
            </button>
            {subscription.status === "authorized" ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("¿Pausar esta suscripción en Mercado Pago?")) run(pauseSubscriptionAction);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#ead56a] px-4 py-2 text-[11px] tracking-[0.14em] text-[#6b5a2e] uppercase"
              >
                <Pause size={14} />
                Pausar
              </button>
            ) : null}
            {subscription.status === "paused" ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("¿Reactivar esta suscripción?")) run(resumeSubscriptionAction);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] px-4 py-2 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
              >
                <Play size={14} />
                Reactivar
              </button>
            ) : null}
            {subscription.status !== "cancelled" ? (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-[#7a3a34] px-4 py-2 text-[11px] tracking-[0.14em] text-[#7a3a34] uppercase"
              >
                <XCircle size={14} />
                Cancelar
              </button>
            ) : null}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-3xl border border-[#d7e6d3] bg-white shadow-sm">
        <div className="px-6 py-5">
          <h2 className="font-heading text-2xl text-primary">Historial de pagos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Solo se marca aprobado cuando Mercado Pago confirma el cobro.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-y border-[#e3eee0] bg-[#f7faf5] text-[11px] tracking-[0.14em] text-[#6f8a74] uppercase">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Importe</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Pago MP</th>
                <th className="px-4 py-3 font-medium">Cobro autorizado</th>
              </tr>
            </thead>
            <tbody>
              {charges.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm italic text-muted-foreground">
                    Todavía no hay movimientos.
                  </td>
                </tr>
              ) : (
                charges.map((item) => (
                  <tr key={item.id} className="border-b border-[#f0f5ee]">
                    <td className="px-4 py-3">{item.paidAt ? formatDateTime(item.paidAt) : formatDateTime(item.createdAt)}</td>
                    <td className="px-4 py-3">{formatMoney(item.amountCents, item.currency)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={item.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.mpPaymentId || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.mpAuthorizedPaymentId || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm">
        <h2 className="font-heading text-2xl text-primary">Eventos</h2>
        <ul className="mt-4 space-y-3">
          {events.length === 0 ? (
            <li className="text-sm italic text-muted-foreground">Sin eventos todavía.</li>
          ) : (
            events.map((item) => (
              <li key={item.id} className="border-b border-[#f0f5ee] pb-3 text-sm last:border-0">
                <p className="text-[11px] tracking-[0.14em] text-[#6f8a74] uppercase">
                  {formatDateTime(item.createdAt)} · {item.action}
                </p>
                <p className="mt-1 text-primary">{item.detail}</p>
              </li>
            ))
          )}
        </ul>
      </section>

      {cancelOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <button type="button" className="absolute inset-0 bg-primary/35" onClick={() => setCancelOpen(false)} />
          <form
            className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            action={async (formData) => {
              const result = await cancelSubscriptionAction(formData);
              if (result?.error) {
                setError(result.error);
                return;
              }
              setCancelOpen(false);
              router.refresh();
            }}
          >
            <input type="hidden" name="id" value={subscription.id} />
            <h3 className="font-heading text-2xl text-primary uppercase">Cancelar suscripción</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Se cancela el débito automático en Mercado Pago. Esta acción no se puede deshacer.
            </p>
            <label className="mt-4 block space-y-2">
              <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Motivo (opcional)</span>
              <input name="reason" className={fieldClass} />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setCancelOpen(false)} className="px-4 py-2 text-sm text-[#4f7a58]">
                Volver
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#7a3a34] px-4 py-2 text-[11px] tracking-[0.14em] text-white uppercase"
              >
                Confirmar cancelación
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[#6f8a74]">{label}</dt>
      <dd className="text-right text-primary">{value}</dd>
    </div>
  );
}
