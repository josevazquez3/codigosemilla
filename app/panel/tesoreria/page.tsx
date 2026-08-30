import { BankExtractBoard } from "@/components/panel/BankExtractBoard";
import { getBankExtractMeta, listBankMovements } from "@/lib/panel-data";

export default async function ExtractoBancoPage() {
  const [movements, meta] = await Promise.all([listBankMovements(), getBankExtractMeta()]);

  return (
    <section className="mx-auto max-w-6xl">
      <BankExtractBoard movements={movements} meta={meta} />
    </section>
  );
}
