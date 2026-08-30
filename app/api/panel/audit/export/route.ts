import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { ensureAuditReady, listAuditSessions } from "@/lib/audit-sessions";
import { sessionTotals } from "@/lib/audit-types";
import { getSessionUser } from "@/lib/auth";
import { formatDateTime, formatDuration } from "@/lib/panel-format";

function cell(value: string | number) {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) redirect("/ingresar");

  await ensureAuditReady();
  const sessions = await listAuditSessions();
  const lines = [
    [
      "Usuario",
      "Email",
      "Inicio sesión",
      "Fin sesión",
      "Módulos",
      "Tiempo módulos",
      "Videos",
      "Detalle módulos",
      "Detalle videos",
    ].map(cell).join(";"),
  ];

  for (const session of sessions) {
    const totals = sessionTotals(session);
    lines.push(
      [
        session.userName,
        session.userEmail,
        formatDateTime(session.startedAt),
        session.endedAt ? formatDateTime(session.endedAt) : "En curso",
        totals.moduleNames.join(", "),
        formatDuration(totals.moduleSeconds),
        String(totals.videoCount),
        session.modules
          .map((item) => `${item.label} (${formatDateTime(item.startedAt)} · ${formatDuration(item.durationSeconds)})`)
          .join(" | "),
        session.videos
          .map((item) => `${item.title} (${formatDateTime(item.openedAt)})`)
          .join(" | "),
      ]
        .map(cell)
        .join(";"),
    );
  }

  const csv = `\uFEFF${lines.join("\n")}`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="auditoria.csv"`,
    },
  });
}
