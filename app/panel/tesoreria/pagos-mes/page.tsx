import { MonthlyPaymentsBoard } from "@/components/panel/MonthlyPaymentsBoard";
import { getSettings, listBankMovements, listManualPayments, listPadron } from "@/lib/panel-data";

export default async function PagosDelMesPage() {
  const [people, movements, payments, settings] = await Promise.all([
    listPadron(),
    listBankMovements(),
    listManualPayments(),
    getSettings(),
  ]);

  return (
    <section className="mx-auto max-w-6xl">
      <MonthlyPaymentsBoard
        people={people}
        movements={movements}
        payments={payments}
        settings={settings}
      />
    </section>
  );
}
