import Image from "next/image";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { images } from "@/lib/images";

export function AboutIntro() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl">
                <Image
                  src={images.portrait}
                  alt="Guadalupe Vázquez"
                  width={900}
                  height={1200}
                  className="aspect-[3/4] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
              </div>
              <div className="absolute -top-4 -left-4 h-24 w-24 rounded-tl-2xl border-t-2 border-l-2 border-accent/30" />
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-br-2xl border-r-2 border-b-2 border-accent/30" />
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.3em] text-accent">
                Guadalupe Vázquez
              </p>
              <h2 className="font-heading text-4xl font-light leading-tight md:text-5xl">
                Soy <span className="italic text-primary">Puente Sagrado</span>
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Acompaño procesos individuales y colectivos orientados a ampliar
                  percepción, reorganizar patrones y transformar la experiencia
                  cotidiana desde una mayor coherencia interna.
                </p>
                <p>
                  Mi enfoque integra{" "}
                  <span className="text-foreground">
                    lectura del campo, canalización y conciencia aplicada en la
                    materia
                  </span>
                  . Diseño estructuras y experiencias que permiten ordenar, activar
                  e integrar aquello que cada persona está atravesando.
                </p>
                <p>
                  No me interesa quedarme en lo abstracto. Me interesa que eso
                  pueda ser vivido, encarnado y sostenido en la vida cotidiana.
                </p>
              </div>
              <ButtonLink href="/contacto" variant="primary">
                Conectemos
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
