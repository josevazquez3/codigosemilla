import Image from "next/image";
import { Sparkles } from "@/components/ui/Sparkles";

type PageHeroProps = {
  image: string;
  eyebrow?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
};

export function PageHero({ image, eyebrow, title, children }: PageHeroProps) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={image}
          alt=""
          fill
          preload
          loading="eager"
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/75 to-background" />
      </div>
      <Sparkles count={8} />
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-32 pb-12 text-center">
        {eyebrow ? (
          <p className="mb-6 text-xs uppercase tracking-[0.4em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mb-6 font-heading text-5xl font-light leading-[1.05] text-primary-foreground md:text-7xl">
          {title}
        </h1>
        {children}
      </div>
    </section>
  );
}
