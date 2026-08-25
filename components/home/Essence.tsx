import Image from "next/image";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { images } from "@/lib/images";

export function Essence() {
  return (
    <section className="relative overflow-hidden bg-muted/30 py-24 lg:py-32">
      <div className="absolute inset-0">
        <Image
          src={images.inspo2}
          alt=""
          fill
          className="object-cover opacity-10"
          sizes="100vw"
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
              Esencia
            </p>
            <h2 className="mb-8 font-heading text-4xl font-light leading-tight md:text-5xl">
              Cuando el campo se reconoce, la energía se acomoda{" "}
              <span className="italic text-primary">y la experiencia cambia</span>
            </h2>
            <div className="mb-10 space-y-4 leading-relaxed text-muted-foreground">
              <p>
                No hay recetas ni resultados prometidos. Cada proceso es único y
                requiere presencia, verdad y coherencia.
              </p>
              <p>
                Acompaño procesos donde lo sutil encuentra una forma de expresarse
                en la materia, permitiendo reconocer patrones, recuperar claridad y
                volver al propio eje.
              </p>
            </div>
            <ButtonLink href="/contacto" variant="gold">
              Reservá tu espacio
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
