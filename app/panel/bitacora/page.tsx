import { BitacoraBoard } from "@/components/panel/BitacoraBoard";
import { getSessionUser } from "@/lib/auth";
import { listBitacoraEntries } from "@/lib/panel-data";

export default async function BitacoraPage() {
  const [entries, session] = await Promise.all([listBitacoraEntries(), getSessionUser()]);
  const canManage = session?.role === "Admin";

  return (
    <section className="mx-auto max-w-6xl">
      <BitacoraBoard entries={entries} canManage={canManage} />
    </section>
  );
}
