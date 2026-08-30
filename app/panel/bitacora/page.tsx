import { BitacoraBoard } from "@/components/panel/BitacoraBoard";
import { listBitacoraEntries } from "@/lib/panel-data";

export default async function BitacoraPage() {
  const entries = await listBitacoraEntries();

  return (
    <section className="mx-auto max-w-6xl">
      <BitacoraBoard entries={entries} />
    </section>
  );
}
