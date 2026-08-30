"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function PanelCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm shadow-primary/5 md:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

export function Field({
  id,
  label,
  children,
}: {
  id?: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className="block space-y-2">
      <span className="block text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

export const fieldClass =
  "w-full rounded-xl border border-[#d7e6d3] bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#4f7a58]";

export function StatusBadge({
  value,
}: {
  value: string;
}) {
  const tone =
    ["active", "open", "confirmed", "accepted", "paid"].includes(value)
      ? "bg-[#e8f3e3] text-[#2d4739]"
      : ["pending", "reviewed", "invited", "waitlist", "draft"].includes(value)
        ? "bg-[#f4efe2] text-[#6b5a2e]"
        : ["overdue", "suspended", "rejected", "cancelled"].includes(value)
          ? "bg-[#f8e6e4] text-[#7a3a34]"
          : "bg-[#eef3ea] text-[#4f7a58]";

  const labels: Record<string, string> = {
    active: "Activa/o",
    invited: "Invitada/o",
    suspended: "Suspendida/o",
    open: "Abierto",
    draft: "Borrador",
    closed: "Cerrado",
    cancelled: "Cancelado",
    confirmed: "Confirmada",
    pending: "Pendiente",
    waitlist: "Lista de espera",
    reviewed: "En revisión",
    accepted: "Aceptada",
    rejected: "Rechazada",
    paid: "Pagada",
    overdue: "Vencida",
    waived: "Eximida",
    Admin: "Admin",
    Usuario: "Usuario",
    "Usuario Membresía": "Usuario Membresía",
    Miembro: "Usuario",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] tracking-[0.14em] uppercase ${tone}`}>
      {labels[value] ?? value}
    </span>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.18em] text-white uppercase transition-colors hover:bg-primary disabled:opacity-70"
    >
      {pending ? "Guardando..." : children}
    </button>
  );
}

export function GhostButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-[#d7e6d3] px-3 py-1.5 text-[11px] tracking-[0.12em] text-[#4f7a58] uppercase hover:bg-[#e8f3e3] disabled:opacity-70"
    >
      {pending ? "..." : children}
    </button>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground italic">{children}</p>;
}

export function ActionForm({
  action,
  children,
  className = "space-y-4",
}: {
  action: (formData: FormData) => Promise<{ error?: string; ok?: boolean } | void>;
  children: ReactNode;
  className?: string;
}) {
  const [error, setError] = useState("");

  return (
    <form
      className={className}
      action={async (formData) => {
        setError("");
        const result = await action(formData);
        if (result?.error) setError(result.error);
      }}
    >
      {children}
      {error ? <p className="text-sm text-[#7a3a34]">{error}</p> : null}
    </form>
  );
}
