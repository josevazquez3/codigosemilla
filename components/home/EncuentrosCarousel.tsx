"use client";

import { useEffect, useState } from "react";
import type { CarouselSlide } from "@/lib/panel-data";

export function EncuentrosCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const current = slides[index];
  if (!current) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.imageUrl}
        alt=""
        className="aspect-[16/7] w-full object-cover"
      />
      {slides.length > 1 ? (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Foto ${slideIndex + 1}`}
              onClick={() => setIndex(slideIndex)}
              className={`h-2 w-2 rounded-full ${
                slideIndex === index ? "bg-accent" : "bg-white/60"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
