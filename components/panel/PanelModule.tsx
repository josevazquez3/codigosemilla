import type { ReactNode } from "react";

export function PanelModule({
  eyebrow = "Panel de membresía",
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl">
      <p className="text-[11px] tracking-[0.28em] text-[#6f8a74] uppercase">{eyebrow}</p>
      <h1 className="mt-3 font-heading text-4xl text-primary md:text-5xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground italic">{description}</p>
      <div className="mt-10 space-y-6">{children}</div>
    </section>
  );
}
