"use client";

import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { submitContactInquiryAction } from "@/app/actions/contact";
import { contactInterests } from "@/lib/content";

export function ContactForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [interest, setInterest] = useState("");
  const [whatsappHref, setWhatsappHref] = useState("");

  if (sent) {
    return (
      <div className="py-20 text-center">
        <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-accent" />
        <h2 className="mb-4 font-heading text-3xl">Consulta enviada</h2>
        <p className="text-muted-foreground">
          Gracias por escribirme. Te respondo a la brevedad.
        </p>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-full border-2 border-[#5c3d2e] bg-accent px-6 py-3 text-sm font-medium tracking-widest text-accent-foreground uppercase"
          >
            Abrir WhatsApp
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form
      className="space-y-8"
      action={async (formData) => {
        setPending(true);
        setError("");
        if (interest) formData.set("interest", interest);
        const popup = window.open("", "_blank");
        const result = await submitContactInquiryAction(formData);
        setPending(false);
        if (result?.error) {
          popup?.close();
          setError(result.error);
          return;
        }
        if (result?.whatsappUrl) {
          setWhatsappHref(result.whatsappUrl);
          if (popup && !popup.closed) {
            popup.location.href = result.whatsappUrl;
          } else {
            window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
          }
        } else {
          popup?.close();
        }
        setSent(true);
      }}
    >
      <div>
        <label className="mb-4 block text-lg font-bold tracking-[0.2em] text-black uppercase md:text-2xl">
          ¿Qué te interesa?
        </label>
        <div className="flex flex-wrap gap-2">
          {contactInterests.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setInterest(item)}
              className={`inline-flex items-center gap-2 rounded-full border-2 border-[#5c3d2e] px-5 py-2.5 text-lg transition-all duration-300 md:text-xl ${
                interest === item
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "bg-muted text-black hover:bg-muted/80"
              }`}
            >
              {item === "Frecuencia 44" ? (
                <Lock size={16} strokeWidth={1.75} aria-hidden="true" />
              ) : null}
              {item}
            </button>
          ))}
        </div>
      </div>
      <FloatingField id="firstName" name="firstName" label="Tu nombre" />
      <FloatingField id="lastName" name="lastName" label="Tu apellido" />
      <FloatingField id="phone" name="phone" type="tel" label="Tu celular" />
      <FloatingField id="email" name="email" type="email" label="Tu email" />
      <div className="relative">
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Tu mensaje"
          className="peer w-full resize-none border-b-2 border-border bg-transparent py-3 text-lg text-black outline-none transition-colors placeholder-transparent focus:border-accent md:text-xl"
        />
        <label
          htmlFor="message"
          className="absolute top-3 left-0 text-lg tracking-wider text-black transition-all peer-focus:-top-3 peer-focus:text-sm peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-sm md:text-xl"
        >
          Tu mensaje
        </label>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-[#5c3d2e] bg-accent py-4 text-sm font-medium tracking-widest text-accent-foreground uppercase transition-all hover:shadow-lg hover:shadow-accent/25 disabled:opacity-70"
      >
        {pending ? "Enviando..." : "Enviar consulta"}
      </button>
    </form>
  );
}

function FloatingField({
  id,
  name,
  label,
  type = "text",
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        required
        placeholder={label}
        className="peer w-full border-b-2 border-border bg-transparent py-3 text-lg text-black outline-none transition-colors placeholder-transparent focus:border-accent md:text-xl"
      />
      <label
        htmlFor={id}
        className="absolute top-3 left-0 text-lg tracking-wider text-black transition-all peer-focus:-top-3 peer-focus:text-sm peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-sm md:text-xl"
      >
        {label}
      </label>
    </div>
  );
}
