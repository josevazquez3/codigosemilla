import type { Metadata } from "next";
import { AboutIntro } from "@/components/home/AboutIntro";
import { Approach } from "@/components/home/Approach";
import { Bio } from "@/components/home/Bio";
import { Essence } from "@/components/home/Essence";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { Programs } from "@/components/home/Programs";
import { Testimonials } from "@/components/home/Testimonials";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Reveal } from "@/components/ui/Reveal";
import { getFaqs, getTestimonials } from "@/lib/db";

export const metadata: Metadata = {
  title: "Guadalupe Vázquez | Guía Espiritual · Conciencia Estelar",
  description:
    "Guadalupe Vázquez — Guía espiritual y co-creadora de Conciencia Estelar. Programas de transformación: Código Semilla, Frecuencia 44, Registros Akáshicos y experiencias individuales.",
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [faqItems, testimonialItems] = await Promise.all([
    getFaqs(),
    getTestimonials(),
  ]);

  return (
    <>
      <Hero />
      <AboutIntro />
      <Approach />
      <Programs />
      <Testimonials items={testimonialItems} />
      <Bio />
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <div className="mb-12 text-center">
                <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                  Preguntas frecuentes
                </p>
                <h2 className="font-heading text-4xl font-light md:text-5xl">
                  Lo que <span className="italic">necesitás saber</span>
                </h2>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <FaqAccordion items={faqItems} />
            </Reveal>
          </div>
        </div>
      </section>
      <Essence />
      <FinalCta />
    </>
  );
}
