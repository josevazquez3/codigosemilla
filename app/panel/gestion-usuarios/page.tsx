import { UsersManager } from "@/components/panel/UsersManager";
import { getSettings, listUsers } from "@/lib/panel-data";
import { annotatePadron, padron } from "@/lib/padron";

export default async function GestionUsuariosPage() {
  const [users, settings] = await Promise.all([listUsers(), getSettings()]);
  const rows = annotatePadron(
    padron,
    users.map((user) => user.email),
  );

  return (
    <section className="mx-auto max-w-6xl">
      <UsersManager users={users} padron={rows} settings={settings} />
    </section>
  );
}
