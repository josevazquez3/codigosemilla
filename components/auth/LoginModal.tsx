"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, X } from "lucide-react";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setMode("login");
      setShowPassword(false);
      setMessage("");
      setLoading(false);
    }
  }, [open]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setMessage(data.error || "No se pudo ingresar. Intentá de nuevo.");
        setLoading(false);
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.href = next?.startsWith("/panel") ? next : "/panel";
    } catch {
      setMessage("No se pudo ingresar. Intentá de nuevo.");
      setLoading(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-primary/55 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[420px] rounded-[28px] border border-white/70 bg-gradient-to-b from-white via-[#fbfaf6] to-[#f3f7f1] p-8 shadow-2xl shadow-primary/20 md:p-10"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-1 text-muted-foreground transition-colors hover:text-primary"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#f07820] bg-[#f7f3ea]">
                <svg
                  viewBox="0 0 80 80"
                  className="h-9 w-9 text-[#f07820]"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M40 8 L42.4 36 L66 40 L42.4 44 L40 72 L37.6 44 L14 40 L37.6 36 Z"
                    fill="currentColor"
                  />
                  <path
                    d="M26 16 C12 24, 12 56, 26 64"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M54 16 C68 24, 68 56, 54 64"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <circle cx="60" cy="14" r="2.6" fill="currentColor" />
                  <circle cx="20" cy="66" r="2.6" fill="currentColor" />
                </svg>
              </div>
              <p className="text-[11px] tracking-[0.28em] text-primary uppercase">
                Código Semilla
              </p>
              <h2
                id="login-title"
                className="mt-2 font-heading text-3xl text-primary"
              >
                {isLogin ? "Ingresar" : "Registrate"}
              </h2>
              <div className="mt-3 h-px w-16 bg-accent" />
              <p className="mt-3 text-sm text-muted-foreground italic">
                {isLogin
                  ? "Accedé a tu espacio de acompañamiento y membresía."
                  : "Creá tu espacio para acompañar tu proceso."}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              {!isLogin ? (
                <Field
                  id="login-name"
                  label="Nombre"
                  type="text"
                  value={form.name}
                  onChange={(value) => setForm((current) => ({ ...current, name: value }))}
                />
              ) : null}
              <Field
                id="login-email"
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) => setForm((current) => ({ ...current, email: value }))}
              />
              <div className="space-y-2">
                <label
                  htmlFor="login-password"
                  className="block text-[11px] tracking-[0.2em] text-muted-foreground uppercase"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    required
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 pr-11 text-foreground outline-none transition-colors focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {message ? (
                <p className="text-center text-sm leading-relaxed text-primary">
                  {message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-accent py-3.5 text-sm font-medium tracking-[0.22em] text-accent-foreground uppercase transition-all hover:shadow-lg hover:shadow-accent/25 disabled:opacity-70"
              >
                {loading ? "Ingresando..." : isLogin ? "Ingresar" : "Crear cuenta"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isLogin ? "¿No tenés cuenta? " : "¿Ya tenés cuenta? "}
              <button
                type="button"
                onClick={() => {
                  setMode(isLogin ? "register" : "login");
                  setMessage("");
                }}
                className="text-accent transition-colors hover:text-accent/80"
              >
                {isLogin ? "Registrate" : "Ingresar"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-[11px] tracking-[0.2em] text-muted-foreground uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
      />
    </div>
  );
}
