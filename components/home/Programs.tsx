import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { programs } from "@/lib/content";

export function Programs() {
  return (
    <section id="programas" className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
              Experiencias disponibles
            </p>
            <h2 className="font-heading text-4xl font-light md:text-5xl">
              Caminos para <span className="italic">recordar y encarnar</span>
            </h2>
          </div>
        </Reveal>
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program, index) => (
            <Reveal key={program.path} delay={index * 0.1}>
              <Link href={program.path} className="group block h-full">
                <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-500 hover:border-accent/50 hover:shadow-xl hover:shadow-accent/5">
                  <span className="font-heading absolute top-4 right-4 select-none text-7xl font-light text-muted/80">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="relative z-10 space-y-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-accent">
                      {program.subtitle}
                    </p>
                    <h3 className="font-heading text-2xl font-light text-foreground transition-colors duration-300 group-hover:text-accent md:text-3xl">
                      {program.title}
                    </h3>
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {program.description}
                    </p>
                    <div className="flex items-center gap-2 pt-2 text-xs tracking-widest text-accent uppercase">
                      <span>Explorar</span>
                      <ArrowUpRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
