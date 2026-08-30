import { EventsBoard } from "@/components/panel/EventsBoard";
import { listCarouselSlides, listEvents } from "@/lib/panel-data";

export default async function EncuentrosSeminariosPage() {
  const [events, slides] = await Promise.all([listEvents(), listCarouselSlides()]);

  return (
    <section className="mx-auto max-w-6xl">
      <EventsBoard events={events} slides={slides} />
    </section>
  );
}
