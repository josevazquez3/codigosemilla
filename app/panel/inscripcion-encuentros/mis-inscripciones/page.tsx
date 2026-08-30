import { cancelRegistrationAction } from "@/app/panel/actions";
import { getSessionUser } from "@/lib/auth";
import { PanelModule } from "@/components/panel/PanelModule";
import {
  ActionForm,
  EmptyState,
  GhostButton,
  PanelCard,
  StatusBadge,
} from "@/components/panel/ui";
import { findUserByEmail, formatDate, listRegistrations } from "@/lib/panel-data";

export default async function MisInscripcionesPage() {
  const session = await getSessionUser();
  const current = session ? await findUserByEmail(session.email) : null;
  const registrations = current ? await listRegistrations(current.id) : [];

  return (
    <PanelModule
      eyebrow="Inscripción Encuentros"
      title="Mis inscripciones"
      description="Consultá el estado de tus reservas."
    >
      <PanelCard>
        {registrations.length === 0 ? (
          <EmptyState>Todavía no tenés inscripciones.</EmptyState>
        ) : (
          <div className="space-y-3">
            {registrations.map((registration) => (
              <article
                key={registration.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e3eee0] bg-[#f7faf5] px-4 py-4"
              >
                <div>
                  <h3 className="font-heading text-xl text-primary">{registration.eventTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(registration.eventStartsAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge value={registration.status} />
                  {registration.status !== "cancelled" ? (
                    <ActionForm action={cancelRegistrationAction} className="inline">
                      <input type="hidden" name="id" value={registration.id} />
                      <GhostButton>Cancelar</GhostButton>
                    </ActionForm>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </PanelCard>
    </PanelModule>
  );
}
