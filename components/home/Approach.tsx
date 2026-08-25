import { Reveal } from "@/components/ui/Reveal";

export function Approach() {
  return (
    <section className="bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
              Mi forma de acompañar
            </p>
            <h2 className="mb-8 font-heading text-3xl font-light leading-tight md:text-5xl">
              Comprender es importante.{" "}
              <span className="italic text-primary">
                Integrar y encarnar lo comprendido
              </span>{" "}
              es lo que transforma la experiencia.
            </h2>
            <div className="space-y-4 leading-relaxed text-muted-foreground">
              <p>
                Mi enfoque integra lectura del campo, canalización y conciencia
                aplicada en la materia. Acompaño procesos orientados a ampliar
                percepción, reconocer patrones y generar transformaciones reales
                en la vida cotidiana.
              </p>
              <p className="text-foreground">
                Mi propósito es acompañarte a recordar quién sos y activar aquello
                que ya vive en vos.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
