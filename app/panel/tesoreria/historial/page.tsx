import { PaymentHistoryBoard } from "@/components/panel/PaymentHistoryBoard";
import { listBankMovements, listPadron } from "@/lib/panel-data";

export default async function HistorialPagoPage() {
  const [movements, people] = await Promise.all([listBankMovements(), listPadron()]);

  return (
    <section className="mx-auto max-w-6xl">
      <PaymentHistoryBoard movements={movements} people={people} />
    </section>
  );
}
