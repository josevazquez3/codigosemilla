import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { images } from "@/lib/images";

export function Bio() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-14">
          <Reveal>
            <div className="mx-auto max-w-[440px] overflow-hidden rounded-2xl border-[3px] border-[#5c3d2e] lg:mx-0">
              <Image
                src={images.portraitForest}
                alt="Guadalupe Vázquez"
                width={560}
                height={750}
                className="aspect-[3/4] w-full object-cover object-[center_72%]"
              />
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div>
              <p className="mb-5 text-base font-bold uppercase tracking-[0.28em] text-[#5c3d2e] md:text-xl">
                Sobre mí
              </p>
              <h2 className="mb-8 font-heading text-4xl font-bold md:text-5xl">
                Arquitecta de{" "}
                <span className="italic text-primary">procesos evolutivos</span>
              </h2>
              <div className="space-y-5 text-lg font-normal leading-relaxed text-black md:text-xl">
                <p>
                  Soy Guadalupe Vazquez, Puente Sagrado. Desde muy chica estoy en
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
                <p>
                  Soy creadora de <span className="italic">Código Semilla</span>, una
                  experiencia nacida de la canalización y activación progresiva de
                  los 13 nodos de conciencia. Me recuerdo y me reconozco como una
                  arquitecta de procesos evolutivos, al servicio del despliegue de
                  una nueva humanidad.
                </p>
                <p>
                  Acompaño a quienes están en ese punto donde ya no alcanza con
                  entender y aparece el deseo de vivirlo de una manera diferente. No
                  es teoría. Es algo que se atraviesa, se ordena y se vive en la
                  propia experiencia.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
