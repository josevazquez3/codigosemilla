import type { Metadata } from "next";
import { Users, Video, UserRound, Sparkles, MessageCircle, Clapperboard } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { codigoSemilla } from "@/lib/content";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Código Semilla · Transformación, Integración y Activación",
  description:
    "Código Semilla es una plataforma catalizadora de procesos. 11 semanas para activar progresivamente los 13 nodos y encarnar tu código original.",
  alternates: { canonical: "/codigo-semilla" },
};

const howIcons = [Sparkles, Video, UserRound, Users, MessageCircle, Clapperboard];

export default function CodigoSemillaPage() {
  return (
    <>
      <PageHero
        image={images.inspo1}
        eyebrow="✦ Programa insignia"
        title={
          <>
            Código <span className="italic text-accent">Semilla</span>
          </>
        }
      >
        <p className="mx-auto mb-8 max-w-3xl font-heading text-lg font-light text-primary-foreground/90 italic md:text-2xl">
          Arquitectura Viva: Transformación, Integración y Activación
        </p>
        <div className="mx-auto max-w-3xl space-y-5 text-base leading-relaxed text-primary-foreground/80 md:text-lg">
          <p>
            Una{" "}
            <span className="text-accent">plataforma catalizadora de procesos</span>.
            Un laboratorio de transformación y activación diseñado para generar
            cambios reales y sostenidos en la forma de percibir, vincularse y
            habitar la vida.
          </p>
          <p>
            A través de la activación progresiva de los 13 nodos, el recorrido abre
            procesos profundos de integración en múltiples niveles, combinando
            encuentros individuales, grupos reducidos y trabajo en red.
          </p>
          <p className="pt-2 font-heading text-xl text-primary-foreground italic md:text-2xl">
            La experiencia no busca solo comprender. Busca que puedas atravesar,
            sostener y encarnar tu código original en la materia.
          </p>
        </div>
        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3">
          {codigoSemilla.heroPills.map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-accent/40 bg-primary-foreground/5 px-4 py-2 text-xs tracking-wider text-primary-foreground/90 uppercase backdrop-blur-sm md:text-sm"
            >
              ✦ {pill}
            </span>
          ))}
        </div>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <ButtonLink href="/contacto" variant="gold">
            Quiero participar
          </ButtonLink>
          <ButtonLink href="/contacto" variant="outline">
            Solicitar información
          </ButtonLink>
        </div>
      </PageHero>

      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <p className="font-heading text-base font-light leading-relaxed italic md:text-xl">
              Un proceso que transforma la experiencia individual e impacta en la
              malla colectiva, acompañando el despliegue de{" "}
              <span className="text-accent">nuevas formas de conciencia</span>.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                ✦ Qué es
              </p>
              <h2 className="font-heading text-4xl font-light leading-tight md:text-5xl">
                Una plataforma viva de{" "}
                <span className="italic text-primary">
                  activación, entrenamiento y orden
                </span>{" "}
                de la conciencia
              </h2>
            </div>
            <div className="space-y-5 leading-relaxed text-muted-foreground">
              <p>
                Un espacio donde la transformación se vuelve real y verificable en
                la experiencia. Aquí no se avanza desde lo conceptual:{" "}
                <span className="text-foreground">se avanza desde la frecuencia</span>.
              </p>
              <p>
                No es una experiencia pasiva donde alguien recibe información. Cada
                persona que ingresa forma parte activa de la red y del movimiento
                colectivo del proceso.
              </p>
              <p>
                Cada integrante trae su propio código, su propia frecuencia y su
                propia información para aportar al campo. Todos funcionan como nodos
                activos de una misma célula viva.
              </p>
              <p className="pt-2 font-heading text-xl text-foreground italic">
                No es teoría. Es práctica viva.
                <br />
                Observación. Integración. Presencia.
              </p>
              <p>
                El foco no está en comprender más, sino en{" "}
                <span className="text-foreground">
                  encarnar lo que ya está disponible
                </span>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-muted/30 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                ✦ Arquitectura del proceso
              </p>
              <h2 className="font-heading text-4xl font-light md:text-5xl">
                Una{" "}
                <span className="italic text-primary">
                  arquitectura viva e inteligente
                </span>
              </h2>
            </div>
            <div className="space-y-5 leading-relaxed text-muted-foreground">
              <p>
                Código Semilla se estructura a través de la activación progresiva de
                los 13 nodos. Los nodos no se activan de manera lineal ni fija.
              </p>
              <p>
                Lo que se abre en cada encuentro surge de la interacción entre la
                información canalizada, la red activa y la disponibilidad colectiva
                del grupo para sostener e integrar esa información en la materia.
              </p>
              <p>
                A medida que el campo se expande, se habilitan nuevas capas de
                conciencia que reorganizan la percepción, los vínculos, la dirección
                interna y la forma de habitar la realidad.
              </p>
              <p className="pt-2 font-heading text-xl text-foreground italic">
                No se trata solo de comprender nuevas frecuencias.
                <br />
                Se trata de poder habitarlas en la materia.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                ✦ Los nodos
              </p>
              <h2 className="font-heading text-4xl font-light md:text-5xl">
                <span className="italic text-primary">13 nodos</span> de activación
                progresiva
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mx-auto mb-16 flex max-w-3xl flex-wrap justify-center gap-4">
              {Array.from({ length: 13 }).map((_, index) => (
                <div
                  key={index}
                  className="relative flex h-16 w-16 cursor-default items-center justify-center rounded-full border border-accent/40 font-heading text-accent transition-all duration-500 hover:bg-accent hover:text-primary-foreground"
                >
                  <span className="text-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mx-auto max-w-3xl space-y-5 leading-relaxed text-muted-foreground">
              <p>
                Los nodos son{" "}
                <span className="text-foreground">centros de conciencia</span> que se
                encuentran más allá del cuerpo físico y funcionan como puentes de
                integración entre distintas capas de percepción y experiencia.
              </p>
              <p>
                Su activación permite ampliar la conexión con el campo cuántico y
                reorganizar progresivamente la forma en la que la conciencia se
                expresa en la materia.
              </p>
              <p>
                No se trata de &quot;dimensiones&quot; como lugares separados, sino de
                distintos estados de conciencia y percepción disponibles para ser
                habitados. Cada nodo habilita nuevas formas de observar, comprender,
                vincularse y responder frente a la realidad.
              </p>
              <p>
                La activación progresiva también está vinculada a procesos profundos
                de reorganización interna, impactando sobre la percepción, la
                biología, el sistema energético y la forma en la que la experiencia
                humana es vivida e integrada.
              </p>
              <p className="text-foreground">
                Por eso el trabajo no queda solo en lo sutil. El foco está en
                traducir aquello que se activa en cambios concretos y sostenibles
                dentro de la vida cotidiana.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                ✦ Las etapas del recorrido
              </p>
              <h2 className="font-heading text-4xl font-light md:text-5xl">
                Observar · <span className="italic">Ordenar</span> · Integrar
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {codigoSemilla.stages.map((stage, index) => (
              <Reveal key={stage.n} delay={index * 0.1}>
                <div className="h-full rounded-2xl border border-border bg-card p-8 transition-all duration-500 hover:border-accent/50">
                  <span className="font-heading text-5xl font-light text-accent/60">
                    {stage.n}
                  </span>
                  <h3 className="mt-4 mb-4 font-heading text-2xl font-light">
                    {stage.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {stage.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                ✦ Cómo funciona
              </p>
              <h2 className="font-heading text-4xl font-light md:text-5xl">
                <span className="italic text-primary">11 semanas</span> de proceso
                vivo
              </h2>
            </div>
          </Reveal>
          <div className="mb-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {codigoSemilla.howItWorks.map((item, index) => {
              const Icon = howIcons[index] ?? Sparkles;
              return (
                <Reveal key={item} delay={index * 0.05}>
                  <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent/40">
                    <Icon className="mt-1 shrink-0 text-accent" size={22} />
                    <p className="text-sm leading-relaxed text-foreground">{item}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={0.2}>
            <div className="mx-auto max-w-3xl space-y-4 text-center leading-relaxed text-muted-foreground">
              <p>
                El proceso también incluye{" "}
                <span className="text-foreground">activaciones y canalizaciones</span>
                , masterclasses complementarias, material de anclaje y
                acompañamiento continuo entre encuentros.
              </p>
              <p className="pt-2 font-heading text-xl text-foreground italic">
                Cada edición es única y se abre según quienes participan.
              </p>
              <p>
                Más que un grupo, muchas personas encuentran aquí una{" "}
                <span className="italic text-accent">familia álmica</span>: un
                espacio de resonancia, contención y expansión compartida.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground">
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                ✦ Qué se vuelve posible
              </p>
              <h2 className="font-heading text-4xl font-light md:text-5xl">
                Una nueva forma de{" "}
                <span className="italic text-accent">leer, habitar y transformar</span>{" "}
                tu realidad
              </h2>
            </div>
          </Reveal>
          <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
            {codigoSemilla.possibles.map((item, index) => (
              <Reveal key={item} delay={index * 0.04}>
                <div className="flex items-start gap-3 rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-4 backdrop-blur-sm">
                  <span className="mt-0.5 shrink-0 text-accent">✦</span>
                  <p className="text-sm text-primary-foreground/90">{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <div className="mt-12 text-center">
              <ButtonLink href="/contacto" variant="gold">
                Quiero comenzar mi proceso
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                ✦ Herramientas y soporte
              </p>
              <h2 className="font-heading text-4xl font-light md:text-5xl">
                Todo lo canalizado se{" "}
                <span className="italic text-primary">traduce, se ordena y se baja</span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-muted-foreground">
                La información no queda solo en lo energético. Se vuelve clara,
                aplicable e integrable en la vida cotidiana. Todos los encuentros
                quedan grabados y el proceso continúa integrándose entre encuentro y
                encuentro.
              </p>
            </div>
          </Reveal>
          <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3">
            {codigoSemilla.tools.map((tool) => (
              <span
                key={tool}
                className="rounded-full border border-accent/40 bg-card px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/10"
              >
                ✦ {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                ✦ Para quién es
              </p>
              <h2 className="font-heading text-4xl font-light md:text-5xl">
                Para quienes sienten que{" "}
                <span className="italic text-primary">llegó el momento</span>
              </h2>
            </div>
            <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
              <p>
                Para quienes sienten que llegó el momento de atravesar una{" "}
                <span className="text-foreground">transformación profunda</span> en
                su forma de habitar la vida.
              </p>
              <p>
                Para quienes saben que existe una versión más alineada disponible y
                desean expresarla con mayor conciencia, dirección y presencia.
              </p>
              <p>
                Para quienes buscan transformar su realidad, comprender el movimiento
                del holograma y convertirse en{" "}
                <span className="italic text-foreground">
                  alquimistas de su propia experiencia
                </span>
                .
              </p>
              <p>
                Para los seres que sienten el llamado a recordar quiénes son,
                ordenarse y habitar con mayor plenitud aquello que vinieron a
                expresar.
              </p>
              <p>
                Y para quienes desean formar parte de una{" "}
                <span className="text-accent">red con propósito</span>, donde la
                transformación individual también impacta en lo colectivo.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground lg:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
              ✦ Cierre
            </p>
            <h2 className="mb-8 font-heading text-4xl font-light leading-tight md:text-5xl lg:text-6xl">
              Código Semilla no viene a{" "}
              <span className="italic text-accent">darte algo nuevo</span>
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-primary-foreground/80">
              Viene a acompañarte a{" "}
              <span className="text-accent">recordar quién sos</span>, recuperar tu
              soberanía y habitar con mayor conciencia aquello que ya busca
              expresarse a través de vos.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <ButtonLink href="/contacto" variant="gold">
                Quiero participar
              </ButtonLink>
              <ButtonLink href="/contacto" variant="outline">
                Hablemos antes de inscribirme
              </ButtonLink>
            </div>
            <p className="mt-8 text-xs uppercase tracking-[0.3em] text-primary-foreground/60">
              Cupos limitados · Próxima edición
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
