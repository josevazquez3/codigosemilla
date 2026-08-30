import { PadronBoard } from "@/components/panel/PadronBoard";
import { listPadron } from "@/lib/panel-data";

export default async function PadronUsuariosPage() {
  const people = await listPadron();

  return (
    <section className="mx-auto max-w-6xl">
      <PadronBoard people={people} />
    </section>
  );
}
