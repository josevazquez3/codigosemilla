import { JoinCtaButton } from "@/components/join/JoinCtaButton";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { getSettings } from "@/lib/panel-data";
import { whatsappUrl } from "@/lib/site-settings";

export async function FinalCta() {
  const settings = await getSettings();
  const wa = whatsappUrl(settings.whatsappNumber, settings.messageStartProcess);

  return (
    <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground lg:py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <Reveal>
          <h2 className="mb-6 font-heading text-4xl font-light leading-tight md:text-5xl lg:text-6xl">
            ¿Estás lista/o para{" "}
            <span className="italic text-accent">recordar</span>?
          </h2>
          <p className="mx-auto mb-10 max-w-xl leading-relaxed text-primary-foreground/70">
            Volver a tu soberanía. Tomar el bastón de mando de tu propia existencia
            y convertirte en alquimista de tu experiencia en la materia.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/contacto" variant="gold">
              Iniciá tu proceso
            </ButtonLink>
            <JoinCtaButton>Quiero Unirme</JoinCtaButton>
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-accent px-8 py-3.5 text-sm font-medium tracking-widest text-accent uppercase transition-all hover:bg-accent hover:text-accent-foreground"
              >
                Comenzar por WhatsApp
              </a>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
