import type { Metadata } from "next";
import {
  Compass,
  Footprints,
  Heart,
  Sparkles,
  Timer,
  Waves,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { frecuencia44 } from "@/lib/content";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Frecuencia 44 · Entrenamiento de Reconfiguración y Conciencia",
  description:
    "44 días para transformar la forma en la que habitás tu realidad. 20 minutos diarios que generan movimientos reales en biología, percepción, mente y conciencia.",
  alternates: { canonical: "/frecuencia-44" },
};

const axisIcons = [Heart, Compass, Sparkles, Waves];
const modalityIcons = [Timer, Sparkles, Footprints, Timer, Heart, Compass];

export default function Frecuencia44Page() {
  return (
    <>
      <PageHero
        image={images.inspo2}
        eyebrow="Entrenamiento de Reconfiguración y Conciencia"
        title={
          <>
            Frecuencia <span className="italic text-accent">44</span>
          </>
        }
      >
        <p className="mx-auto max-w-3xl text-lg font-light leading-relaxed text-primary-foreground/85 md:text-xl">
          Un entrenamiento diseñado para generar nuevos surcos cognitivos y
          transformar la forma en la que habitás tu realidad.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <ButtonLink href="/contacto" variant="gold">
            Quiero comenzar
          </ButtonLink>
          <ButtonLink href="/contacto" variant="outline">
            Solicitar información
          </ButtonLink>
        </div>
        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-4">
          {frecuencia44.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading text-3xl font-light text-accent md:text-4xl">
                {stat.num}
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-primary-foreground/60">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="space-y-6 leading-relaxed text-muted-foreground">
              <p>
                Durante 44 días, el recorrido propone prácticas guiadas orientadas a
                generar movimientos reales en la biología, la percepción, los
                estados emocionales, la mente y la conciencia.
              </p>
              <p>
                Cada práctica funciona como un entrenamiento de{" "}
                <span className="text-foreground">
                  observación, presencia y reconfiguración
                </span>
                , donde la conciencia deja de ser solo comprensión y comienza a
                expresarse en la materia.
              </p>
              <p>
                El proceso se sostiene principalmente a través de{" "}
                <span className="text-foreground">
                  caminatas conscientes con activaciones guiadas
                </span>
                , acompañando la creación de nuevos hábitos, nuevas respuestas y
                nuevas formas de habitar la vida.
              </p>
              <p className="pt-4 font-heading text-xl text-foreground italic">
                No se trata de hacerlo perfecto. Se trata de sostener presencia,
                voluntad y coherencia en pequeñas acciones que, sostenidas en el
                tiempo, transforman profundamente la experiencia.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid items-start gap-16 md:grid-cols-2">
            <Reveal>
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                Qué es
              </p>
              <h2 className="font-heading text-4xl font-light leading-tight md:text-5xl">
                Un entrenamiento de{" "}
                <span className="italic text-primary">conciencia aplicada</span>
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Un recorrido diseñado para acompañar procesos de observación,
                  reorganización interna y transformación sostenida a través de la
                  práctica cotidiana.
                </p>
                <p>
                  La propuesta trabaja sobre la práctica sostenida como herramienta
                  de reconfiguración. No desde la exigencia.{" "}
                  <span className="italic text-foreground">Desde la presencia.</span>
                </p>
                <p>
                  A medida que el recorrido avanza, comienzan a abrirse nuevos
                  niveles de percepción, comprensión y respuesta frente a la propia
                  realidad.
                </p>
                <p>
                  El trabajo no queda solo en lo mental o en lo energético. La
                  práctica busca producir movimiento real en la forma en la que la
                  persona piensa, siente, se vincula y habita su vida.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                La práctica
              </p>
              <h2 className="font-heading text-4xl font-light md:text-5xl">
                Cuando el cuerpo entra en{" "}
                <span className="italic text-primary">movimiento</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative rounded-3xl border border-accent/10 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent p-10 md:p-14">
              <Footprints className="absolute top-6 right-6 h-10 w-10 text-accent/30" />
              <div className="space-y-5 leading-relaxed text-muted-foreground">
                <p>
                  El recorrido se sostiene principalmente a través de{" "}
                  <span className="text-foreground">
                    caminatas conscientes con activaciones guiadas
                  </span>
                  .
                </p>
                <p>
                  Cuando el cuerpo entra en movimiento, también comienzan a
                  movilizarse la percepción, los estados emocionales y las formas
                  automáticas de responder frente a la realidad.
                </p>
                <p>
                  La práctica busca sacar al sistema de la estática y habilitar
                  nuevas formas de organización interna. A través de la práctica
                  sostenida, comienzan a abrirse nuevas respuestas, nuevas
                  asociaciones y nuevas maneras de habitar la vida.
                </p>
                <p className="pt-2 font-heading text-xl text-foreground italic">
                  No se trata solo de comprender. Se trata de mover la conciencia en
                  la materia.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-primary py-24 text-primary-foreground">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                La arquitectura 44
              </p>
              <h2 className="mb-6 font-heading text-4xl font-light md:text-5xl">
                4 fases · <span className="italic text-accent">11 días cada una</span>
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-primary-foreground/70">
                Desde la neurociencia, la creación de nuevos hábitos requiere
                constancia y sostenimiento en el tiempo. La estructura 44 nace como
                una arquitectura de integración progresiva.
              </p>
            </div>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {frecuencia44.phases.map((phase, index) => (
              <Reveal key={phase.num} delay={index * 0.1}>
                <div className="relative h-full rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-8 transition-colors hover:border-accent/40">
                  <div className="mb-4 font-heading text-5xl font-light text-accent/40">
                    {phase.num}
                  </div>
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent">
                    {phase.dias}
                  </p>
                  <h3 className="mb-3 font-heading text-2xl">{phase.title}</h3>
                  <p className="text-sm leading-relaxed text-primary-foreground/70">
                    {phase.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.4}>
            <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-primary-foreground/60 italic">
              El foco no está solo en generar insight. Está en sostener una nueva
              organización interna el tiempo suficiente para que pueda convertirse
              en una realidad habitable.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                Los 4 ejes
              </p>
              <h2 className="font-heading text-4xl font-light md:text-5xl">
                El recorrido se mueve en{" "}
                <span className="italic text-primary">cuatro direcciones</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {frecuencia44.axes.map((axis, index) => {
              const Icon = axisIcons[index];
              return (
                <Reveal key={axis.title} delay={index * 0.1}>
                  <div className="h-full rounded-2xl bg-muted/40 p-8 transition-colors hover:bg-muted/70">
                    <Icon className="mb-5 h-8 w-8 text-accent" strokeWidth={1.2} />
                    <h3 className="mb-3 font-heading text-2xl">{axis.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {axis.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-14 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                Qué se vuelve posible
              </p>
              <h2 className="font-heading text-4xl font-light md:text-5xl">
                Una nueva base interna desde la{" "}
                <span className="italic text-primary">práctica sostenida</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            {frecuencia44.possibles.map((item, index) => (
              <Reveal key={item} delay={index * 0.05}>
                <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-background p-5">
                  <span className="mt-0.5 text-lg text-accent">✦</span>
                  <p className="text-sm leading-relaxed text-foreground">{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-14 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                Modalidad
              </p>
              <h2 className="font-heading text-4xl font-light md:text-5xl">
                Cómo se <span className="italic text-primary">vive el recorrido</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {frecuencia44.modality.map((item, index) => {
              const Icon = modalityIcons[index] ?? Sparkles;
              return (
                <Reveal key={item} delay={index * 0.07}>
                  <div className="flex h-full items-center gap-4 rounded-2xl bg-muted/40 p-6 transition-colors hover:bg-muted/70">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/15">
                      <Icon className="h-5 w-5 text-accent" strokeWidth={1.4} />
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{item}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                Para quién es
              </p>
              <h2 className="font-heading text-4xl font-light leading-tight md:text-5xl">
                Frecuencia 44 es para vos si...
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="space-y-5 leading-relaxed text-muted-foreground">
              <p>
                Sentís la necesidad de transformar hábitos, percepción y formas
                automáticas de vivir la realidad.
              </p>
              <p>
                Deseás desarrollar mayor presencia, coherencia y dirección interna.
              </p>
              <p>
                Buscás integrar la conciencia en la vida de una manera práctica,
                simple y sostenida.
              </p>
              <p className="text-foreground">
                Y comprendés que las transformaciones profundas se construyen a
                través de pequeñas acciones sostenidas en el tiempo.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground lg:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-accent">
              Cierre
            </p>
            <h2 className="mb-8 font-heading text-4xl font-light leading-tight md:text-5xl lg:text-6xl">
              Frecuencia 44 no busca agregar{" "}
              <span className="italic text-accent">más información</span>
            </h2>
            <p className="mb-4 leading-relaxed text-primary-foreground/75">
              Busca generar las condiciones para que puedas reorganizarte desde
              adentro y sostener nuevas formas de habitar tu realidad.
            </p>
            <p className="mb-10 text-primary-foreground/60 italic">
              Porque son las pequeñas acciones sostenidas en el tiempo las que
              terminan transformando profundamente la forma en la que vivimos.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <ButtonLink href="/contacto" variant="gold">
                Empezar el entrenamiento
              </ButtonLink>
              <ButtonLink href="/contacto" variant="outline">
                Quiero más información
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
