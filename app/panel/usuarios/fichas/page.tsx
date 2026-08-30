import { FichasBoard } from "@/components/panel/FichasBoard";
import { listPadron } from "@/lib/panel-data";

export default async function FichaUsuariosPage() {
  const people = await listPadron();

  return (
    <section className="mx-auto max-w-6xl">
      <FichasBoard people={people} />
    </section>
  );
}
