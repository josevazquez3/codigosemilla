import Link from "next/link";
import { notFound } from "next/navigation";
import { checkoutFor, getSubscriptionByToken, periodLabel } from "@/lib/subscriptions";
import { formatMoney } from "@/lib/panel-format";

export default async function AutorizarSuscripcionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const subscription = await getSubscriptionByToken(token);
  if (!subscription) notFound();

  const checkout = checkoutFor(subscription);
  const canAuthorize = subscription.status === "pending_authorization" && Boolean(checkout);

  return (
    <section className="mx-auto max-w-xl px-5 py-20">
      <p className="text-[11px] tracking-[0.28em] text-[#6f8a74] uppercase">Débito automático</p>
      <h1 className="mt-3 font-heading text-4xl text-primary uppercase">Autorizar cobro</h1>
      <p className="mt-3 text-muted-foreground">
        {subscription.concept} · {formatMoney(subscription.amountCents, subscription.currency)} ·{" "}
        {periodLabel(subscription.frequency, subscription.frequencyType, subscription.periodId)}
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Vas a continuar en Mercado Pago para vincular tu medio de pago. En este sitio no se piden ni se guardan datos de tarjetas.
      </p>

      {subscription.status === "authorized" ? (
        <p className="mt-8 rounded-2xl bg-[#e8f3e3] px-4 py-3 text-sm text-[#2d4739]">
          Esta suscripción ya está autorizada.
        </p>
      ) : null}
      {subscription.status === "cancelled" ? (
        <p className="mt-8 rounded-2xl bg-[#f8e6e4] px-4 py-3 text-sm text-[#7a3a34]">
          Esta suscripción fue cancelada.
        </p>
      ) : null}
      {subscription.status === "paused" ? (
        <p className="mt-8 rounded-2xl bg-[#fff8d9] px-4 py-3 text-sm text-[#6b5a2e]">
          Esta suscripción está pausada.
        </p>
      ) : null}

      {canAuthorize ? (
        <a
          href={checkout}
          className="mt-8 inline-flex rounded-full bg-[#4f7a58] px-6 py-3 text-xs tracking-[0.18em] text-white uppercase"
        >
          Continuar en Mercado Pago
        </a>
      ) : subscription.status === "pending_authorization" ? (
        <p className="mt-8 rounded-2xl bg-[#fff8d9] px-4 py-3 text-sm text-[#6b5a2e]">
          El enlace de Mercado Pago todavía no está disponible. Pedile al administrador que lo regenere.
        </p>
      ) : null}

      <p className="mt-8">
        <Link href="/ingresar" className="text-sm text-[#4f7a58] underline">
          Ir al panel
        </Link>
      </p>
    </section>
  );
}
