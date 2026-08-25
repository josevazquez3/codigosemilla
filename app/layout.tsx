import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LoginProvider } from "@/components/auth/LoginProvider";
import { site } from "@/lib/images";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Guadalupe Vázquez | Guía Espiritual · Conciencia Estelar",
    template: "%s | Guadalupe Vázquez",
  },
  description:
    "Guadalupe Vázquez — Guía espiritual y co-creadora de Conciencia Estelar. Acompañamiento consciente a través de Código Semilla, Frecuencia 44, Registros Akáshicos, Carta Numerológica y experiencias individuales de transformación e integración.",
  keywords: [
    "Guadalupe Vázquez",
    "guía espiritual",
    "conciencia estelar",
    "código semilla",
    "frecuencia 44",
    "registros akáshicos",
    "carta numerológica",
    "ciclo solar",
  ],
  openGraph: {
    title: "Guadalupe Vázquez | Guía Espiritual · Conciencia Estelar",
    description:
      "Acompañamiento consciente a través de Código Semilla, Frecuencia 44, Registros Akáshicos y experiencias de transformación e integración.",
    locale: "es_ES",
    type: "website",
    siteName: "Guadalupe Vázquez",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <LoginProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LoginProvider>
      </body>
    </html>
  );
}
