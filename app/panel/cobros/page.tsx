import { CobrosBoard } from "@/components/panel/CobrosBoard";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";
import { listUsers } from "@/lib/panel-data";
import { listSubscriptions } from "@/lib/subscriptions";

export default async function CobrosPage() {
  const [subscriptions, users] = await Promise.all([listSubscriptions(), listUsers()]);

  return (
    <section className="mx-auto max-w-6xl">
      <CobrosBoard subscriptions={subscriptions} users={users} configured={isMercadoPagoConfigured()} />
    </section>
  );
}
