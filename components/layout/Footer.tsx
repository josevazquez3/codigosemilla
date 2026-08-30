import Link from "next/link";
import { Mail } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { site } from "@/lib/images";
import { getSettings } from "@/lib/panel-data";
import { whatsappUrl } from "@/lib/site-settings";

const programs = [
  { href: "/codigo-semilla", label: "Código Semilla" },
  { href: "/frecuencia-44", label: "Frecuencia 44" },
  { href: "/experiencias-individuales#lectura-akashica", label: "Registros Akáshicos" },
  { href: "/experiencias-individuales#lectura-akashica", label: "Sesiones 1:1" },
  { href: "/experiencias-individuales#carta-numerologica", label: "Carta Numerológica" },
];

export async function Footer() {
  const settings = await getSettings();
  const wa = whatsappUrl(settings.whatsappNumber, settings.messageContact);

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-4">
            <Logo className="items-start text-primary-foreground" />
            <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/70">
              Ser puente sagrado. Acompañar a que lo sutil se traduzca en la materia.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-heading text-lg text-accent">Programas</h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              {programs.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-heading text-lg text-accent">Conectá</h4>
            <div className="flex gap-4">
              {site.instagram ? (
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/20 transition-all hover:border-accent hover:bg-accent hover:text-accent-foreground"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
              ) : null}
              {site.youtube ? (
                <a
                  href={site.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/20 transition-all hover:border-accent hover:bg-accent hover:text-accent-foreground"
                  aria-label="YouTube"
                >
                  <YoutubeIcon />
                </a>
              ) : null}
              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/20 transition-all hover:border-accent hover:bg-accent hover:text-accent-foreground"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon />
                </a>
              ) : null}
              <a
                href={`mailto:${site.email}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/20 transition-all hover:border-accent hover:bg-accent hover:text-accent-foreground"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} Guadalupe Vázquez · Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}
