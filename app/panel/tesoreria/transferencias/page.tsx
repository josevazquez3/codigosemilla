import { ReceivedTransfersBoard } from "@/components/panel/ReceivedTransfersBoard";
import { getBankExtractMeta, listBankMovements } from "@/lib/panel-data";

export default async function TransferenciasPage() {
  const [movements, meta] = await Promise.all([listBankMovements(), getBankExtractMeta()]);

  return (
    <section className="mx-auto max-w-6xl">
      <ReceivedTransfersBoard movements={movements} meta={meta} />
    </section>
  );
}
