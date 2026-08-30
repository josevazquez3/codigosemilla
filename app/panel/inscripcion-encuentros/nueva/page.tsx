import { registerEventAction } from "@/app/panel/actions";
import { PanelModule } from "@/components/panel/PanelModule";
import {
  ActionForm,
  EmptyState,
  Field,
  PanelCard,
  SubmitButton,
  fieldClass,
} from "@/components/panel/ui";
import { formatDate, listEvents } from "@/lib/panel-data";

export default async function NuevaInscripcionPage() {
  const events = (await listEvents()).filter((event) => event.status === "open");

  return (
    <PanelModule
      eyebrow="Inscripción Encuentros"
      title="Nueva inscripción"
      description="Completá una inscripción para un encuentro."
    >
      <PanelCard>
        {events.length === 0 ? (
          <EmptyState>Todavía no hay encuentros publicados.</EmptyState>
        ) : (
          <ActionForm action={registerEventAction}>
            <Field label="Encuentro">
              <select required name="eventId" className={fieldClass}>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} · {formatDate(event.startsAt)} ·{" "}
                    {event.registeredCount}/{event.capacity}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Notas">
              <textarea name="notes" rows={3} className={fieldClass} />
            </Field>
            <SubmitButton>Confirmar inscripción</SubmitButton>
          </ActionForm>
        )}
      </PanelCard>
    </PanelModule>
  );
}
