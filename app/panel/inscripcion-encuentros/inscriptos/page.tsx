import { EventRegistrantsBoard } from "@/components/panel/EventRegistrantsBoard";
import { getSettings, listApplications, listRegistrations, listUsers } from "@/lib/panel-data";
import { splitName } from "@/lib/site-settings";

export default async function UsuariosInscriptosEncuentrosPage() {
  const [registrations, users, applications, settings] = await Promise.all([
    listRegistrations(),
    listUsers(),
    listApplications(),
    getSettings(),
  ]);
  const usersById = new Map(users.map((user) => [user.id, user]));
  const applicationsByEmail = new Map(
    applications.map((item) => [item.email.toLowerCase(), item]),
  );

  const rows = registrations
    .filter((item) => item.status !== "cancelled")
    .map((item) => {
      const user = usersById.get(item.userId);
      const application = applicationsByEmail.get(item.userEmail.toLowerCase());
      const names = splitName(item.userName);
      return {
        id: item.id,
        firstName: application?.firstName || names.nombres,
        lastName: application?.lastName || names.apellidos,
        dni: application?.dni ?? "",
        email: item.userEmail,
        phone: user?.phone || item.userPhone || application?.phone || "",
        eventTitle: item.eventTitle,
        createdAt: item.createdAt,
        status: item.status,
      };
    });

  return (
    <section className="mx-auto max-w-6xl">
      <EventRegistrantsBoard rows={rows} settings={settings} />
    </section>
  );
}
