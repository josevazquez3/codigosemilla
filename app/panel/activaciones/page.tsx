import { ActivacionesBoard } from "@/components/panel/ActivacionesBoard";
import { getSessionUser } from "@/lib/auth";
import {
  findUserByEmail,
  getSettings,
  listActivationPermissionIds,
  listActivations,
} from "@/lib/panel-data";

export default async function ActivacionesPage() {
  const session = await getSessionUser();
  const [activations, settings, user] = await Promise.all([
    listActivations(),
    getSettings(),
    session ? findUserByEmail(session.email) : null,
  ]);
  const canManage = session?.role === "Admin" || user?.role === "Admin";
  const allowedIds = canManage
    ? null
    : await listActivationPermissionIds(user?.role === "Usuario Membresía" ? (user.id ?? 0) : 0);

  return (
    <section className="mx-auto max-w-6xl">
      <ActivacionesBoard
        activations={activations}
        canManage={canManage}
        allowedIds={allowedIds}
        blockedMessage={settings.messageBlockedVideo}
      />
    </section>
  );
}
