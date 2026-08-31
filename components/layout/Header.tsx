"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navItems } from "@/lib/content";
import { Logo } from "@/components/ui/Logo";
import { useLoginModal } from "@/components/auth/LoginProvider";

export function Header({ loggedIn = false }: { loggedIn?: boolean }) {
  const pathname = usePathname();
  const { openLogin } = useLoginModal();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const solid = scrolled || pathname === "/contacto";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        solid ? "bg-primary/95 shadow-lg backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="relative z-10 text-primary-foreground">
          <Logo compact />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`relative px-3 py-2 text-base font-light tracking-wide transition-colors duration-300 xl:px-4 xl:text-lg ${
                  active
                    ? "text-accent"
                    : "text-primary-foreground/85 hover:text-accent"
                }`}
              >
                {item.label}
                {active ? (
                  <span className="absolute right-3 bottom-1 left-3 h-px bg-accent" />
                ) : null}
              </Link>
            );
          })}
          {loggedIn ? (
            <Link
              href="/panel"
              className="ml-3 rounded-full bg-accent px-5 py-2 text-sm font-medium tracking-widest text-accent-foreground uppercase transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/25 xl:px-6 xl:text-base"
            >
              Ingresar
            </Link>
          ) : (
            <button
              type="button"
              onClick={openLogin}
              className="ml-3 rounded-full bg-accent px-5 py-2 text-sm font-medium tracking-widest text-accent-foreground uppercase transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/25 xl:px-6 xl:text-base"
            >
              Ingresar
            </button>
          )}
        </nav>
        <button
          type="button"
          className="text-primary-foreground lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open ? (
        <div className="overflow-hidden bg-primary/98 lg:hidden">
          <nav className="flex flex-col gap-2 px-6 py-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`block py-2 text-2xl font-heading font-light tracking-wider ${
                  pathname === item.path
                    ? "text-accent"
                    : "text-primary-foreground/80 hover:text-accent"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4">
              {loggedIn ? (
                <Link
                  href="/panel"
                  onClick={() => setOpen(false)}
                  className="inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium tracking-widest text-accent-foreground uppercase"
                >
                  Ingresar
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openLogin();
                  }}
                  className="inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium tracking-widest text-accent-foreground uppercase"
                >
                  Ingresar
                </button>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
