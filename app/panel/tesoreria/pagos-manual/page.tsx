import { ManualPaymentsBoard } from "@/components/panel/ManualPaymentsBoard";
import { getSettings, listManualPayments, listPadron } from "@/lib/panel-data";

export default async function PagosManualPage() {
  const [people, payments, settings] = await Promise.all([
    listPadron(),
    listManualPayments(),
    getSettings(),
  ]);

  return (
    <section className="mx-auto max-w-6xl">
      <ManualPaymentsBoard
        people={people}
        payments={payments}
        currency={settings.currency}
      />
    </section>
  );
}
