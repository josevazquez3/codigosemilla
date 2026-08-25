import { Reveal } from "@/components/ui/Reveal";

export function Bio() {
  return (
    <section className="bg-muted/30 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="mb-12 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                Sobre mí
              </p>
              <h2 className="font-heading text-4xl font-light md:text-5xl">
                Arquitecta de{" "}
                <span className="italic text-primary">procesos de ascenso</span>
              </h2>
            </div>
            <div className="space-y-5 leading-relaxed text-muted-foreground">
              <p>
                Soy Guadalupe Vázquez, Puente Sagrado. Desde muy chica estoy en
                contacto con lo que no siempre es visible, pero sí esencial: los
                campos de información.
              </p>
              <p>
                Durante mucho tiempo no supe cómo nombrarlo. Lo percibía, lo
                sentía, pero no tenía una forma clara de integrarlo. Mi camino fue
                ir encontrando esa forma.
              </p>
              <p>
                Hace más de 20 años recorro un proceso sostenido de
                autoconocimiento, conciencia corporal y exploración de lo sutil,
                llevando todo eso a la experiencia en la materia.
              </p>
              <p>
                En paralelo, me formé en planificación comunicacional y trabajé en
                mejora continua y gestión de procesos, lo que me dio una estructura
                clara: ordenar, ver en síntesis y acompañar transformaciones
                reales.
              </p>
              <p>
                Con el tiempo, ambos mundos se integraron. Hoy leo el campo, lo
                canalizo y diseño estructuras que permiten transformar lo que cada
                persona está atravesando.
              </p>
              <p className="text-foreground">
                Soy creadora de <span className="italic">Código Semilla</span>, una
                experiencia nacida de la canalización y activación progresiva de
                los 13 nodos de conciencia. Me recuerdo y me reconozco como una
                arquitecta de procesos de ascenso, al servicio del despliegue de
                una nueva humanidad.
              </p>
              <p>
                Acompaño a quienes están en ese punto donde ya no alcanza con
                entender y aparece el deseo de vivirlo de una manera diferente. No
                es teoría. Es algo que se atraviesa, se ordena y se vive en la
                propia experiencia.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
