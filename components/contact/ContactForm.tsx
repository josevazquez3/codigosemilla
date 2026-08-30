"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { contactInterests } from "@/lib/content";
import { applyTemplate, splitName } from "@/lib/site-settings";

export function ContactForm({
  whatsappHref,
  joinTemplate,
  platformNumber,
}: {
  whatsappHref?: string;
  joinTemplate?: string;
  platformNumber?: string;
}) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    interest: "",
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        throw new Error("No se pudo enviar el mensaje");
      }
      setSent(true);
    } catch {
      setError("Hubo un inconveniente al enviar. Intentá de nuevo en unos minutos.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    const joinConfirmation =
      form.interest === "Quiero unirme" && joinTemplate
        ? applyTemplate(joinTemplate, {
            ...splitName(form.name),
            celular: form.phone,
            numeroPlataforma: platformNumber ?? "",
          })
        : "";
    return (
      <div className="py-20 text-center">
        <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-accent" />
        <h2 className="mb-4 font-heading text-3xl">Mensaje enviado</h2>
        {joinConfirmation ? (
          <p className="mx-auto max-w-xl whitespace-pre-wrap text-left text-muted-foreground">
            {joinConfirmation}
          </p>
        ) : (
          <p className="text-muted-foreground">
            Gracias por escribirme. Te respondo a la brevedad.
          </p>
        )}
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex text-sm text-accent"
          >
            Seguir por WhatsApp →
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <label className="mb-3 block text-xs tracking-[0.2em] text-muted-foreground uppercase">
          ¿Qué te interesa?
        </label>
        <div className="flex flex-wrap gap-2">
          {contactInterests.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => setForm((current) => ({ ...current, interest }))}
              className={`rounded-full px-4 py-2 text-sm transition-all duration-300 ${
                form.interest === interest
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>
      <FloatingField
        id="name"
        label="Tu nombre"
        value={form.name}
        onChange={(value) => setForm((current) => ({ ...current, name: value }))}
      />
      <FloatingField
        id="email"
        type="email"
        label="Tu email"
        value={form.email}
        onChange={(value) => setForm((current) => ({ ...current, email: value }))}
      />
      {form.interest === "Quiero unirme" ? (
        <FloatingField
          id="phone"
          type="tel"
          label="Tu celular"
          value={form.phone}
          onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
        />
      ) : null}
      <div className="relative">
        <textarea
          id="message"
          required
          rows={4}
          placeholder="Tu mensaje"
          value={form.message}
          onChange={(event) =>
            setForm((current) => ({ ...current, message: event.target.value }))
          }
          className="peer w-full resize-none border-b-2 border-border bg-transparent py-3 text-foreground outline-none transition-colors placeholder-transparent focus:border-accent"
        />
        <label
          htmlFor="message"
          className="absolute top-3 left-0 text-base tracking-wider text-muted-foreground transition-all peer-focus:-top-3 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs"
        >
          Tu mensaje
        </label>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-3 rounded-full border border-accent py-4 text-sm font-medium tracking-widest text-accent uppercase"
        >
          Escribir por WhatsApp
        </a>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-full bg-accent py-4 text-sm font-medium tracking-widest text-accent-foreground uppercase transition-all hover:shadow-lg hover:shadow-accent/25 disabled:opacity-70"
      >
        <span>{loading ? "Enviando..." : "Enviar mensaje"}</span>
        <ArrowRight size={16} />
      </button>
    </form>
  );
}

function FloatingField({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        required
        placeholder={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="peer w-full border-b-2 border-border bg-transparent py-3 text-foreground outline-none transition-colors placeholder-transparent focus:border-accent"
      />
      <label
        htmlFor={id}
        className="absolute top-3 left-0 text-base tracking-wider text-muted-foreground transition-all peer-focus:-top-3 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs"
      >
        {label}
      </label>
    </div>
  );
}
