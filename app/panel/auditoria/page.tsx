import { AuditBoard } from "@/components/panel/AuditBoard";
import { ensureAuditReady, listAuditSessions } from "@/lib/audit-sessions";

export default async function AuditoriaPage() {
  await ensureAuditReady();
  const sessions = await listAuditSessions();

  return (
    <section className="mx-auto max-w-6xl">
      <AuditBoard sessions={sessions} />
    </section>
  );
}
