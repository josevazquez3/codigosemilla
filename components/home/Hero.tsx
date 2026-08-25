"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Sparkles } from "@/components/ui/Sparkles";
import { images } from "@/lib/images";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-28 md:pt-36">
      <div className="absolute inset-0">
        <Image
          src={images.inspo1}
          alt=""
          fill
          preload
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/90" />
      </div>
      <Sparkles />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <Image
            src={images.logo}
            alt="Guadalupe Vázquez"
            width={180}
            height={180}
            className="mx-auto h-20 w-auto animate-float mix-blend-screen md:h-28"
          />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mx-auto max-w-5xl font-heading text-4xl font-light leading-tight text-primary-foreground md:text-6xl lg:text-7xl"
        >
          Un espacio para{" "}
          <span className="italic text-accent">recordar quién sos</span>, volver
          a tu soberanía y habitar la vida desde una nueva conciencia.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 text-base font-light tracking-[0.3em] text-primary-foreground/80 uppercase md:text-lg"
        >
          Recordar · Ordenar · Integrar · Alquimizar
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-24 flex flex-col justify-center gap-4 sm:mt-28 sm:flex-row"
        >
          <ButtonLink href="/contacto" variant="gold">
            Comenzá tu proceso
          </ButtonLink>
          <ButtonLink href="/#programas" variant="outline">
            Explorar experiencias
          </ButtonLink>
        </motion.div>
        <motion.div
          className="mt-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex h-10 w-6 justify-center rounded-full border-2 border-primary-foreground/30 pt-2">
            <div className="h-2 w-1 rounded-full bg-accent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
