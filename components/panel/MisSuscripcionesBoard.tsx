"use client";

import { Repeat } from "lucide-react";
import { StatusBadge } from "@/components/panel/ui";
import { formatDateTime, formatMoney } from "@/lib/panel-format";
import {
  authorizePublicUrl,
  checkoutFor,
  periodLabel,
  type PanelSubscription,
  type PanelSubscriptionCharge,
} from "@/lib/subscriptions";

export function MisSuscripcionesBoard({
  subscriptions,
  chargesBySubscription,
}: {
  subscriptions: PanelSubscription[];
  chargesBySubscription: Record<number, PanelSubscriptionCharge[]>;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <Repeat size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">Mis suscripciones</h1>
          <p className="mt-2 max-w-2xl text-sm text-primary/80">
            Autorizá el débito en Mercado Pago. Nunca cargues tu tarjeta en este sitio.
          </p>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <p className="rounded-3xl border border-[#d7e6d3] bg-white px-6 py-10 text-center text-sm italic text-muted-foreground">
          Todavía no tenés cobros automáticos asignados.
        </p>
      ) : (
        subscriptions.map((item) => {
          const checkout = checkoutFor(item);
          const authorize = authorizePublicUrl(item.authorizationToken);
          const charges = chargesBySubscription[item.id] ?? [];
          return (
            <article key={item.id} className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="font-heading text-2xl text-primary">{item.concept}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatMoney(item.amountCents, item.currency)} ·{" "}
                    {periodLabel(item.frequency, item.frequencyType, item.periodId)}
                  </p>
                </div>
                <StatusBadge value={item.status} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Próximo cobro: {item.nextChargeAt ? formatDateTime(item.nextChargeAt) : "Se informa al autorizar"}
              </p>
              {item.status === "pending_authorization" ? (
                <a
                  href={checkout || authorize}
                  className="mt-5 inline-flex rounded-full bg-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.18em] text-white uppercase"
                >
                  Autorizar en Mercado Pago
                </a>
              ) : null}
              {charges.length > 0 ? (
                <ul className="mt-6 space-y-2 border-t border-[#e3eee0] pt-4 text-sm">
                  {charges.slice(0, 6).map((charge) => (
                    <li key={charge.id} className="flex items-center justify-between gap-3">
                      <span>{charge.paidAt ? formatDateTime(charge.paidAt) : formatDateTime(charge.createdAt)}</span>
                      <span>{formatMoney(charge.amountCents, charge.currency)}</span>
                      <StatusBadge value={charge.status} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })
      )}
    </div>
  );
}
