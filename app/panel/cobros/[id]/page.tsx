import { notFound } from "next/navigation";
import { CobroDetailBoard } from "@/components/panel/CobroDetailBoard";
import {
  getSubscriptionById,
  listCharges,
  listSubscriptionEvents,
  refreshSubscriptionFromMp,
} from "@/lib/subscriptions";

export default async function CobroDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subscriptionId = Number(id);
  if (!subscriptionId) notFound();

  await refreshSubscriptionFromMp(subscriptionId).catch(() => null);
  const subscription = await getSubscriptionById(subscriptionId);
  if (!subscription) notFound();

  const [charges, events] = await Promise.all([
    listCharges(subscription.id),
    listSubscriptionEvents(subscription.id),
  ]);

  return (
    <section className="mx-auto max-w-6xl">
      <CobroDetailBoard subscription={subscription} charges={charges} events={events} />
    </section>
  );
}
