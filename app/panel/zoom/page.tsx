import { ZoomBoard } from "@/components/panel/ZoomBoard";
import { listZoomMeetings } from "@/lib/panel-data";

export default async function ZoomPage() {
  const meetings = await listZoomMeetings();

  return (
    <section className="mx-auto max-w-6xl">
      <ZoomBoard meetings={meetings} />
    </section>
  );
}
