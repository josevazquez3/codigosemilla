import Link from "next/link";
import { ArrowRight } from "lucide-react";

const variants = {
  primary:
    "bg-accent text-accent-foreground hover:shadow-lg hover:shadow-accent/25",
  outline:
    "border border-accent text-accent hover:bg-accent hover:text-accent-foreground",
  gold: "bg-gradient-to-r from-accent to-[hsl(38,85%,55%)] text-accent-foreground hover:shadow-lg hover:shadow-accent/30",
} as const;

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium tracking-widest uppercase transition-all duration-500 hover:scale-105 ${variants[variant]} ${className}`}
    >
      {children}
      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
