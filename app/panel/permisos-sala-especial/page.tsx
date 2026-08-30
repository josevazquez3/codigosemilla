import { PermisosSalaEspecialBoard } from "@/components/panel/PermisosSalaEspecialBoard";
import { listActivationPermissionsByUser, listActivations, listMembershipUsers } from "@/lib/panel-data";

export default async function PermisosSalaEspecialPage() {
  const [users, activations, byUser] = await Promise.all([
    listMembershipUsers(),
    listActivations(),
    listActivationPermissionsByUser(),
  ]);
  const members = users ?? [];
  const granted = Object.fromEntries(
    members.map((user) => [String(user.id), byUser?.[user.id] ?? []]),
  );

  return (
    <section className="mx-auto max-w-6xl">
      <PermisosSalaEspecialBoard users={members} activations={activations ?? []} granted={granted} />
    </section>
  );
}
