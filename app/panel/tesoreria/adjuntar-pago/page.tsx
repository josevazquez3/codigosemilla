import { AttachPaymentBoard } from "@/components/panel/AttachPaymentBoard";
import { listPaymentReceipts } from "@/lib/panel-data";

export default async function AdjuntarPagoPage() {
  const receipts = await listPaymentReceipts();

  return (
    <section className="mx-auto max-w-6xl">
      <AttachPaymentBoard receipts={receipts} />
    </section>
  );
}
