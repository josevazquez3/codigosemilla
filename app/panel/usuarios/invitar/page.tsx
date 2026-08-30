import { inviteUserAction } from "@/app/panel/actions";
import { PanelModule } from "@/components/panel/PanelModule";
import {
  ActionForm,
  EmptyState,
  Field,
  PanelCard,
  StatusBadge,
  SubmitButton,
  fieldClass,
} from "@/components/panel/ui";
import { formatDate, listInvitations } from "@/lib/panel-data";

export default async function InvitarUsuarioPage() {
  const invitations = await listInvitations();

  return (
    <PanelModule
      eyebrow="Usuarios"
      title="Invitar usuario"
      description="Enviá una invitación para sumarse al espacio."
    >
      <PanelCard>
        <h2 className="font-heading text-2xl text-primary">Nueva invitación</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La persona va a poder ingresar con ese email y elegir su contraseña la primera vez.
        </p>
        <ActionForm action={inviteUserAction} className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Email">
            <input required type="email" name="email" className={fieldClass} />
          </Field>
          <Field label="Rol">
            <select name="role" className={fieldClass} defaultValue="Usuario">
              <option>Usuario</option>
              <option>Usuario Membresía</option>
              <option>Admin</option>
            </select>
          </Field>
          <div>
            <SubmitButton>Invitar</SubmitButton>
          </div>
        </ActionForm>
      </PanelCard>
      <PanelCard>
        <h2 className="font-heading text-2xl text-primary">Invitaciones recientes</h2>
        <div className="mt-6 space-y-3">
          {invitations.length === 0 ? (
            <EmptyState>Todavía no hay invitaciones.</EmptyState>
          ) : (
            invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e3eee0] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-primary">{invitation.email}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(invitation.createdAt)}</p>
                </div>
                <StatusBadge value={invitation.role} />
              </div>
            ))
          )}
        </div>
      </PanelCard>
    </PanelModule>
  );
}
