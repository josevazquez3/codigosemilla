import Link from "next/link";
import { getSubscriptionByToken, refreshSubscriptionFromMp } from "@/lib/subscriptions";

export default async function RetornoSuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const subscription = token ? await getSubscriptionByToken(token) : null;
  if (subscription?.id) {
    await refreshSubscriptionFromMp(subscription.id).catch(() => null);
  }
  const confirmed = subscription?.status === "authorized";

  return (
    <section className="mx-auto max-w-xl px-5 py-20">
      <p className="text-[11px] tracking-[0.28em] text-[#6f8a74] uppercase">Mercado Pago</p>
      <h1 className="mt-3 font-heading text-4xl text-primary uppercase">
        {confirmed ? "Autorización confirmada" : "Estamos confirmando"}
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        {confirmed
          ? "Mercado Pago ya informó la autorización. Los próximos cobros se debitan según lo acordado."
          : "El estado real lo confirma Mercado Pago. Si recién autorizaste, puede tardar unos minutos. No se da por aprobado solo por haber vuelto a esta página."}
      </p>
      <Link
        href="/panel/cobros/mis-suscripciones"
        className="mt-8 inline-flex rounded-full bg-[#4f7a58] px-6 py-3 text-xs tracking-[0.18em] text-white uppercase"
      >
        Ver mis suscripciones
      </Link>
    </section>
  );
}
