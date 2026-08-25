"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

type Testimonial = { text: string; author: string };

export function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  const current = items[index];

  return (
    <section className="relative overflow-hidden bg-secondary py-20">
      <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative mx-auto max-w-4xl text-center">
          <Quote className="mx-auto mb-6 h-10 w-10 text-accent/40" />
          <div className="relative flex min-h-[180px] items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <p className="mb-6 font-heading text-lg leading-relaxed text-secondary-foreground/90 italic md:text-xl">
                  &ldquo;{current.text}&rdquo;
                </p>
                <span className="text-sm tracking-widest text-accent uppercase">
                  — {current.author}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <button
              type="button"
              onClick={() =>
                setIndex((current) => (current - 1 + items.length) % items.length)
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-secondary-foreground/20 text-secondary-foreground/60 transition-all hover:border-accent hover:text-accent"
              aria-label="Testimonio anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              {items.map((item, itemIndex) => (
                <button
                  key={item.text}
                  type="button"
                  onClick={() => setIndex(itemIndex)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    itemIndex === index
                      ? "w-6 bg-accent"
                      : "w-2 bg-secondary-foreground/30"
                  }`}
                  aria-label={`Ir al testimonio ${itemIndex + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIndex((current) => (current + 1) % items.length)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-secondary-foreground/20 text-secondary-foreground/60 transition-all hover:border-accent hover:text-accent"
              aria-label="Testimonio siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
