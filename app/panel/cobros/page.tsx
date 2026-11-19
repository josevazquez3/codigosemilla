import { CobrosBoard } from "@/components/panel/CobrosBoard";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";
import { listUsers } from "@/lib/panel-data";
import { listSubscriptions } from "@/lib/subscriptions";

export default async function CobrosPage() {
  const [subscriptions, users, configured] = await Promise.all([
    listSubscriptions(),
    listUsers(),
    isMercadoPagoConfigured(),
  ]);

  return (
    <section className="mx-auto max-w-6xl">
      <CobrosBoard subscriptions={subscriptions} users={users} configured={configured} />
    </section>
  );
}
