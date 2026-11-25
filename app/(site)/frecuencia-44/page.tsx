import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Frecuencia 44 · Próximamente",
  description: "Frecuencia 44 estará disponible próximamente.",
  alternates: { canonical: "/frecuencia-44" },
};

export default function Frecuencia44Page() {
  return (
    <PageHero
      image={images.inspo2}
      eyebrow="Entrenamiento de Reconfiguración y Conciencia"
      title={
        <>
          Frecuencia <span className="italic text-accent">44</span>
        </>
      }
    >
      <div className="mx-auto mt-4 flex max-w-xl flex-col items-center gap-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/40 bg-primary-foreground/5 text-accent">
          <Lock size={28} strokeWidth={1.5} />
        </span>
        <p className="font-heading text-2xl tracking-[0.28em] text-primary-foreground uppercase md:text-3xl">
          Próximamente
        </p>
      </div>
    </PageHero>
  );
}
