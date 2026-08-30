import { CalendarPlus } from "lucide-react";
import { registerEventAction } from "@/app/panel/actions";
import { getSessionUser } from "@/lib/auth";
import { ActionForm, GhostButton } from "@/components/panel/ui";
import {
  findUserByEmail,
  formatDate,
  isEventJoinOpen,
  listEvents,
  listRegistrations,
} from "@/lib/panel-data";

export default async function InscripcionEncuentrosPage() {
  const session = await getSessionUser();
  const current = session ? await findUserByEmail(session.email) : null;
  const [events, mine] = await Promise.all([
    listEvents(),
    current ? listRegistrations(current.id) : Promise.resolve([]),
  ]);
  const published = events.filter((event) => event.status === "open");

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <CalendarPlus size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">
            Inscripción encuentros
          </h1>
          <p className="mt-2 text-sm text-primary/80">
            Vista previa de encuentros y seminarios, y reserva de inscripción.
          </p>
        </div>
      </div>

      {published.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-[#d7e6d3] bg-[#f7faf5]">
          <p className="text-sm text-muted-foreground italic">
            Todavía no hay encuentros publicados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {published.map((event) => {
            const already = mine.find(
              (item) => item.eventId === event.id && item.status !== "cancelled",
            );
            const open = isEventJoinOpen(event.registrationDeadline);
            return (
              <article
                key={event.id}
                className="overflow-hidden rounded-3xl border border-[#d7e6d3] bg-white shadow-sm shadow-primary/5"
              >
                {event.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.coverImageUrl} alt="" className="h-56 w-full object-cover" />
                ) : null}
                <div className="p-6 md:p-8">
                  <p className="text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">
                    {formatDate(event.startsAt)}
                    {event.registrationDeadline
                      ? ` · Inscripción hasta ${formatDate(event.registrationDeadline)}`
                      : ""}
                  </p>
                  <h2 className="mt-2 font-heading text-3xl text-primary">{event.title}</h2>
                  {event.description ? (
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      {event.description}
                    </p>
                  ) : null}
                  <div className="mt-6">
                    {already ? (
                      <p className="text-sm text-[#4f7a58]">
                        Ya reservaste tu lugar · {already.status === "waitlist" ? "Lista de espera" : "Confirmada"}
                      </p>
                    ) : open ? (
                      <ActionForm action={registerEventAction}>
                        <input type="hidden" name="eventId" value={event.id} />
                        <GhostButton>Unirme</GhostButton>
                      </ActionForm>
                    ) : (
                      <p className="text-sm text-muted-foreground">Inscripción cerrada</p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
