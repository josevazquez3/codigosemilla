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
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative mx-auto max-w-4xl text-center">
          <Quote className="mx-auto mb-6 h-12 w-12 text-black" strokeWidth={2.25} />
          <div className="relative flex min-h-[200px] items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <p className="mb-6 font-heading text-xl font-bold leading-relaxed text-black italic md:text-2xl">
                  &ldquo;{current.text}&rdquo;
                </p>
                <span className="text-base font-bold tracking-widest text-black uppercase">
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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/25 text-primary/70 transition-all hover:border-primary hover:text-primary"
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
                      ? "w-6 bg-primary"
                      : "w-2 bg-primary/30"
                  }`}
                  aria-label={`Ir al testimonio ${itemIndex + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIndex((current) => (current + 1) % items.length)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/25 text-primary/70 transition-all hover:border-primary hover:text-primary"
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
