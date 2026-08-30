"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { JoinApplicationModal } from "@/components/join/JoinApplicationModal";

export function JoinCtaButton({
  children = "Quiero Unirme",
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-[hsl(38,85%,55%)] px-8 py-3.5 text-sm font-medium tracking-widest text-accent-foreground uppercase transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-accent/30 ${className}`}
      >
        {children}
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </button>
      {open ? <JoinApplicationModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}
