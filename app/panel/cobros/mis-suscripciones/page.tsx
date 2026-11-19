import { MisSuscripcionesBoard } from "@/components/panel/MisSuscripcionesBoard";
import { getSessionUser } from "@/lib/auth";
import { listCharges, listSubscriptionsForUser } from "@/lib/subscriptions";

export default async function MisSuscripcionesPage() {
  const user = await getSessionUser();
  const subscriptions = user?.id ? await listSubscriptionsForUser(user.id) : [];
  const chargesBySubscription: Record<number, Awaited<ReturnType<typeof listCharges>>> = {};
  await Promise.all(
    subscriptions.map(async (item) => {
      chargesBySubscription[item.id] = await listCharges(item.id);
    }),
  );

  return (
    <section className="mx-auto max-w-6xl">
      <MisSuscripcionesBoard subscriptions={subscriptions} chargesBySubscription={chargesBySubscription} />
    </section>
  );
}
