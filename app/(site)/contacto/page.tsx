import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Reveal } from "@/components/ui/Reveal";
import { getSettings } from "@/lib/panel-data";
import { whatsappUrl } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Contacto · Conciencia Estelar",
  description:
    "Contactá a Guadalupe Vázquez para consultas, reservas de experiencias individuales o inscripción en Código Semilla y Frecuencia 44.",
  alternates: { canonical: "/contacto" },
};

export default async function ContactoPage() {
  const settings = await getSettings();
  const whatsappHref = whatsappUrl(settings.whatsappNumber, settings.messageContact);

  return (
    <section className="min-h-screen pt-32 pb-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
              Contacto
            </p>
            <h1 className="mb-4 font-heading text-5xl font-light md:text-6xl">
              Conectá con tu <span className="italic text-primary">proceso</span>
            </h1>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Escribime para consultas, para reservar tu espacio o simplemente para
              resonar.
            </p>
          </div>
        </Reveal>
        <div className="mx-auto max-w-2xl">
          <Reveal delay={0.2}>
            <ContactForm
              whatsappHref={whatsappHref}
              joinTemplate={settings.messageJoinForm}
              platformNumber={settings.whatsappNumber}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
