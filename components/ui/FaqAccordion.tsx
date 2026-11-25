"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = { q: string; a: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="w-full">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.q} className="border-b border-border">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              className={`group flex w-full items-center justify-between py-6 text-left font-heading text-2xl font-bold md:text-3xl transition-colors duration-300 hover:text-[#8b5724] ${
                isOpen ? "text-[#8b5724]" : ""
              }`}
            >
              <span className="origin-left transition-transform duration-300 group-hover:scale-[1.07]">
                {item.q}
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ${
                isOpen ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"
              }`}
            >
              <p className="overflow-hidden text-lg font-bold leading-relaxed text-muted-foreground md:text-xl">
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
