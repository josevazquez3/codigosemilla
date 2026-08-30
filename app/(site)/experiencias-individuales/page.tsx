import type { Metadata } from "next";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import {
  individualExperiences,
  iniciacionForWho,
} from "@/lib/content";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Experiencias Individuales · Lecturas y Acompañamiento",
  description:
    "Espacios de observación, claridad y reorganización profunda. Lectura de Registros Akáshicos, Carta Numerológica, Ciclo Solar e Iniciación Akáshica. Cupos limitados.",
  alternates: { canonical: "/experiencias-individuales" },
};

export default function ExperienciasPage() {
  return (
    <>
      <PageHero
        image={images.inspo1}
        eyebrow="Espacios de acompañamiento personalizado"
        title={
          <>
            Experiencias <span className="italic text-accent">Individuales</span>
          </>
        }
      >
        <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-primary-foreground/80 md:text-xl">
          Espacios de observación, claridad y reorganización profunda, construidos
          a partir de la lectura integral del sistema y del campo.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <ButtonLink href="/contacto" variant="gold">
            Reservar mi experiencia
          </ButtonLink>
          <ButtonLink href="#experiencias" variant="outline">
            Ver experiencias
          </ButtonLink>
        </div>
      </PageHero>

      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                Cupos limitados
              </p>
              <h2 className="font-heading text-3xl font-light leading-tight md:text-5xl">
                Los espacios individuales se abren de manera{" "}
                <span className="italic text-primary">limitada cada mes</span>
              </h2>
            </div>
            <div className="space-y-5 leading-relaxed text-muted-foreground">
              <p>
                Cada encuentro requiere presencia, lectura profunda y
                acompañamiento personalizado, por eso la disponibilidad es reducida
                y los procesos se sostienen de forma cuidada y consciente.
              </p>
              <p>
                Las experiencias individuales funcionan como espacios de
                observación, claridad y reorganización profunda, construidos a
                partir de la lectura integral del sistema y de la información
                disponible en el campo en ese momento.
              </p>
              <p className="text-foreground">
                No se trata solo de comprender. Se trata de identificar qué está
                organizando hoy tu experiencia y acompañar movimientos concretos de
                transformación en la materia.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="experiencias"
        className="border-y border-border bg-muted/30 py-12"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap justify-center gap-3 md:gap-6">
            {individualExperiences.map((experience) => (
              <a
                key={experience.id}
                href={`#${experience.id}`}
                className="rounded-full border border-border px-4 py-2 text-xs tracking-wider text-muted-foreground uppercase transition-colors hover:border-accent/50 hover:text-accent md:text-sm"
              >
                {experience.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {individualExperiences.map((experience, index) => (
        <section
          key={experience.id}
          id={experience.id}
          className={`scroll-mt-24 py-24 lg:py-32 ${index % 2 === 1 ? "bg-muted/30" : ""}`}
        >
          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <div className="mb-12 text-center">
                <p className="mb-3 text-xs uppercase tracking-[0.3em] text-accent">
                  {experience.subtitle}
                </p>
                <h2 className="font-heading text-4xl font-light leading-tight md:text-5xl">
                  {experience.title}
                </h2>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mx-auto mb-16 max-w-3xl space-y-5 leading-relaxed text-muted-foreground">
                {experience.paragraphs.map((paragraph, paragraphIndex) => (
                  <p
                    key={paragraph}
                    className={
                      paragraphIndex === experience.paragraphs.length - 1
                        ? "text-foreground"
                        : ""
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mb-6 text-center text-xs uppercase tracking-[0.3em] text-accent">
                Modalidad
              </p>
              <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {experience.modalidad.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-border bg-background/80 p-5 transition-colors hover:border-accent/50 hover:bg-accent/25"
                  >
                    <Sparkles
                      className="mt-0.5 shrink-0 text-accent"
                      size={20}
                      strokeWidth={1.5}
                    />
                    <p className="text-sm leading-relaxed text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            {experience.extra ? (
              <Reveal delay={0.2}>
                <div className="mb-12 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 to-primary/5 p-8">
                  <h3 className="mb-3 font-heading text-2xl font-light text-foreground">
                    {experience.extra.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {experience.extra.text}
                  </p>
                </div>
              </Reveal>
            ) : null}
            {experience.precio.ar !== "Consultar" ? (
              <Reveal delay={0.2}>
                <div className="mx-auto mb-10 grid max-w-3xl gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 to-primary/5 p-8 text-center">
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent">
                      Argentina
                    </p>
                    <p className="font-heading text-4xl font-light text-foreground">
                      {experience.precio.ar}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-primary/5 to-accent/10 p-8 text-center">
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent">
                      Internacional
                    </p>
                    <p className="font-heading text-4xl font-light text-foreground">
                      {experience.precio.intl}
                    </p>
                  </div>
                </div>
              </Reveal>
            ) : null}
            <Reveal delay={0.25}>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <ButtonLink href="/contacto" variant="gold">
                  Reservar {experience.title}
                </ButtonLink>
                <ButtonLink href="/contacto" variant="outline">
                  Solicitar información
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      <section className="bg-muted/30 py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                Iniciación · Para quién es
              </p>
              <h2 className="font-heading text-4xl font-light leading-tight md:text-5xl">
                Para quienes sienten el llamado a{" "}
                <span className="italic text-primary">leer el campo</span>
              </h2>
            </div>
          </Reveal>
          <div className="space-y-4">
            {iniciacionForWho.map((item, index) => (
              <Reveal key={item} delay={index * 0.05}>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-5">
                  <span className="mt-0.5 shrink-0 text-lg text-accent">✦</span>
                  <p className="text-sm leading-relaxed text-foreground md:text-base">
                    {item}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground lg:py-32">
        <div className="absolute inset-0">
          <Image
            src={images.inspo2}
            alt=""
            fill
            loading="eager"
            className="object-cover opacity-10"
            sizes="100vw"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <h2 className="mb-6 font-heading text-4xl font-light leading-tight md:text-6xl">
              Abrí un espacio para{" "}
              <span className="italic text-accent">ver con claridad</span> lo que
              hoy busca movimiento
            </h2>
            <p className="mb-10 leading-relaxed text-primary-foreground/70">
              Los cupos son limitados cada mes. Escribime y vemos juntos qué
              experiencia acompaña mejor el momento que estás atravesando.
            </p>
            <ButtonLink href="/contacto" variant="gold">
              Reservar mi espacio
            </ButtonLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
