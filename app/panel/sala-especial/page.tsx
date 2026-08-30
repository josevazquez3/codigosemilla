import { SalaEspecialBoard } from "@/components/panel/SalaEspecialBoard";
import { getSessionUser } from "@/lib/auth";
import { listSpecialRooms } from "@/lib/panel-data";

export default async function SalaEspecialPage() {
  const [rooms, session] = await Promise.all([listSpecialRooms(), getSessionUser()]);

  return (
    <section className="mx-auto max-w-6xl">
      <SalaEspecialBoard rooms={rooms} canManage={session?.role === "Admin"} />
    </section>
  );
}
