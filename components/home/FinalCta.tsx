import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCta() {
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
          <ButtonLink href="/contacto" variant="gold">
            Iniciá tu proceso
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
