export type AuditModuleVisit = {
  id: number;
  label: string;
  startedAt: string;
  durationSeconds: number;
};

export type AuditVideoOpen = {
  id: number;
  title: string;
  source: string;
  openedAt: string;
};

export type AuditSessionRow = {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  startedAt: string;
  endedAt: string | null;
  modules: AuditModuleVisit[];
  videos: AuditVideoOpen[];
};

export function sessionTotals(session: AuditSessionRow) {
  const moduleSeconds = session.modules.reduce((sum, item) => sum + item.durationSeconds, 0);
  return {
    moduleSeconds,
    moduleNames: [...new Set(session.modules.map((item) => item.label))],
    videoCount: session.videos.length,
  };
}
