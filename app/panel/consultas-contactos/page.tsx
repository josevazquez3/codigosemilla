import { ContactosBoard } from "@/components/panel/ContactosBoard";
import { listContactInquiries } from "@/lib/panel-data";

export default async function ConsultasContactosPage() {
  const inquiries = (await listContactInquiries()).filter((item) => item.status !== "responded");

  return (
    <section className="mx-auto max-w-6xl">
      <ContactosBoard inquiries={inquiries} />
    </section>
  );
}
