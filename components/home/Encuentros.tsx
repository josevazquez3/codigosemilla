import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { EncuentrosCarousel } from "@/components/home/EncuentrosCarousel";
import { formatDate } from "@/lib/panel-format";
import { isEventJoinOpen, type CarouselSlide, type PanelEvent } from "@/lib/panel-data";

export function Encuentros({
  slides,
  events,
}: {
  slides: CarouselSlide[];
  events: PanelEvent[];
}) {
  const visibleSlides = slides.filter((slide) => slide.visible);
  const published = events.filter((event) => event.status === "open");
  if (visibleSlides.length === 0 && published.length === 0) return null;

  return (
    <section id="encuentros" className="bg-muted/30 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mb-12 text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">Encuentros</p>
            <h2 className="font-heading text-4xl font-light md:text-5xl">
              Próximos <span className="italic">encuentros y seminarios</span>
            </h2>
          </div>
        </Reveal>
        {visibleSlides.length > 0 ? (
          <Reveal delay={0.1}>
            <EncuentrosCarousel slides={visibleSlides} />
          </Reveal>
        ) : null}
        {published.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {published.map((event, index) => {
              const open = isEventJoinOpen(event.registrationDeadline);
              return (
                <Reveal key={event.id} delay={index * 0.08}>
                  <article className="overflow-hidden rounded-2xl border border-border bg-card">
                    {event.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={event.coverImageUrl} alt="" className="h-56 w-full object-cover" />
                    ) : null}
                    <div className="space-y-4 p-6">
                      <p className="text-xs tracking-[0.2em] text-accent uppercase">
                        {formatDate(event.startsAt)}
                      </p>
                      <h3 className="font-heading text-2xl text-foreground">{event.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p>
                      {open ? (
                        <Link
                          href={`/ingresar?next=${encodeURIComponent("/panel/inscripcion-encuentros")}`}
                          className="inline-flex rounded-full bg-accent px-6 py-2.5 text-xs tracking-[0.16em] text-accent-foreground uppercase"
                        >
                          Unirme
                        </Link>
                      ) : (
                        <span className="inline-flex rounded-full border border-border px-6 py-2.5 text-xs tracking-[0.16em] text-muted-foreground uppercase">
                          Inscripción cerrada
                        </span>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
