import { updateUserAction } from "@/app/panel/actions";
import { PanelModule } from "@/components/panel/PanelModule";
import {
  ActionForm,
  PanelCard,
  StatusBadge,
  SubmitButton,
  fieldClass,
} from "@/components/panel/ui";
import { listUsers, USER_ROLES } from "@/lib/panel-data";

export default async function RolesPage() {
  const users = await listUsers();

  return (
    <PanelModule
      eyebrow="Usuarios"
      title="Roles y permisos"
      description="Definí qué puede ver y hacer cada perfil."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <PanelCard>
          <p className="text-[11px] tracking-[0.18em] text-[#6f8a74] uppercase">Admin</p>
          <p className="mt-2 text-sm text-primary">
            Acceso completo al panel, tesorería, padrón, permisos y configuración.
          </p>
        </PanelCard>
        <PanelCard>
          <p className="text-[11px] tracking-[0.18em] text-[#6f8a74] uppercase">Usuario</p>
          <p className="mt-2 text-sm text-primary">
            Zoom, inscripción a encuentros y adjuntar comprobante de pago.
          </p>
        </PanelCard>
        <PanelCard>
          <p className="text-[11px] tracking-[0.18em] text-[#4f7a58] uppercase">Usuario Membresía</p>
          <p className="mt-2 text-sm text-primary">
            Todo lo de Usuario, más Sala Especial y Activaciones según el checklist de
            permisos.
          </p>
        </PanelCard>
      </div>
      <PanelCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e3eee0] text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">
                <th className="py-3 font-medium">Persona</th>
                <th className="py-3 font-medium">Rol actual</th>
                <th className="py-3 font-medium">Cambiar</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[#f0f5ee]">
                  <td className="py-3">
                    <p className="font-medium text-primary">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </td>
                  <td className="py-3">
                    <StatusBadge value={user.role} />
                  </td>
                  <td className="py-3">
                    <ActionForm action={updateUserAction} className="flex max-w-xs items-center gap-2">
                      <input type="hidden" name="id" value={user.id} />
                      <select name="role" defaultValue={user.role} className={fieldClass}>
                        {USER_ROLES.map((role) => (
                          <option key={role}>{role}</option>
                        ))}
                      </select>
                      <SubmitButton>Guardar</SubmitButton>
                    </ActionForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </PanelModule>
  );
}
