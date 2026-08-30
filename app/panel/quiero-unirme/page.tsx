import { JoinBoard } from "@/components/panel/JoinBoard";
import { getSettings, listApplications, listUsers } from "@/lib/panel-data";

export default async function QuieroUnirmePage() {
  const [applications, users, settings] = await Promise.all([
    listApplications(),
    listUsers(),
    getSettings(),
  ]);

  return (
    <section className="mx-auto max-w-6xl">
      <JoinBoard applications={applications} users={users} settings={settings} />
    </section>
  );
}
