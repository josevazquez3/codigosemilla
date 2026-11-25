import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";

export function Essence() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="mb-5 text-base font-bold uppercase tracking-[0.28em] text-[#5c3d2e] md:text-xl">
              Esencia
            </p>
            <h2 className="mb-8 font-heading text-4xl font-light leading-tight md:text-5xl">
              Cuando el campo se reconoce, la energía se acomoda{" "}
              <span className="italic text-primary">y la experiencia cambia</span>
            </h2>
            <div className="mb-10 space-y-5 text-xl font-normal leading-relaxed text-black md:text-2xl">
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
