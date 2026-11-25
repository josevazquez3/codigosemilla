import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { programs } from "@/lib/content";

export function Programs() {
  return (
    <section id="programas" className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mb-16 text-center">
            <p className="mb-5 text-base font-bold uppercase tracking-[0.28em] text-[#5c3d2e] md:text-xl">
              Experiencias disponibles
            </p>
            <h2 className="font-heading text-4xl font-light md:text-5xl">
              Caminos para <span className="italic">recordar y encarnar</span>
            </h2>
          </div>
        </Reveal>
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program, index) => (
            <Reveal key={program.path} delay={index * 0.1} className="h-full">
              <Link href={program.path} className="group block h-full">
                <div className="relative h-full overflow-hidden rounded-2xl border-2 border-border bg-card p-8 shadow-sm transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:scale-[1.03] group-hover:border-[#5c3d2e] group-hover:bg-accent group-hover:shadow-2xl group-hover:shadow-[#5c3d2e]/30">
                  <span className="font-heading absolute top-4 right-4 select-none text-7xl font-light text-muted/80 transition-colors duration-500 group-hover:text-accent-foreground/20">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="relative z-10 space-y-4">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#3d6b52] transition-colors duration-500 group-hover:text-accent-foreground">
                      {program.subtitle}
                    </p>
                    <h3 className="font-heading text-[1.75rem] leading-tight font-light text-foreground transition-colors duration-500 group-hover:text-accent-foreground md:text-[2rem]">
                      {program.title}
                    </h3>
                    {program.path === "/frecuencia-44" ? (
                      <div className="flex items-center gap-2.5 pt-2 text-sm font-bold tracking-widest text-[#3d6b52] uppercase transition-colors duration-500 group-hover:text-accent-foreground">
                        <Lock size={16} strokeWidth={1.75} aria-hidden="true" />
                        <span>Próximamente</span>
                      </div>
                    ) : (
                      <>
                        <p className="line-clamp-3 text-base leading-relaxed text-muted-foreground transition-colors duration-500 group-hover:text-accent-foreground/85">
                          {program.description}
                        </p>
                        <div className="flex items-center gap-2 pt-2 text-sm font-bold tracking-widest text-[#3d6b52] uppercase transition-colors duration-500 group-hover:text-accent-foreground">
                          <span>Explorar</span>
                          <ArrowUpRight
                            size={16}
                            className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
