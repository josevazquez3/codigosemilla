"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Repeat, Search, X } from "lucide-react";
import { createSubscriptionAction } from "@/app/panel/cobros/actions";
import { fieldClass, StatusBadge } from "@/components/panel/ui";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { formatDate, formatDateTime, formatMoney } from "@/lib/panel-format";
import type { PanelUser } from "@/lib/panel-data";
import {
  authorizePublicUrl,
  periodLabel,
  SUBSCRIPTION_PERIODS,
  type PanelSubscription,
} from "@/lib/subscriptions";
import { whatsappUrl } from "@/lib/site-settings";

type Filter = "all" | PanelSubscription["status"];

export function CobrosBoard({
  subscriptions,
  users,
  configured,
}: {
  subscriptions: PanelSubscription[];
  users: PanelUser[];
  configured: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [assignOpen, setAssignOpen] = useState(false);
  const [created, setCreated] = useState<{
    id: number;
    token: string;
    userName: string;
    userPhone: string;
    concept: string;
    amountCents: number;
    currency: string;
    warning?: string;
  } | null>(null);

  const stats = useMemo(
    () => ({
      total: subscriptions.length,
      pending: subscriptions.filter((item) => item.status === "pending_authorization").length,
      authorized: subscriptions.filter((item) => item.status === "authorized").length,
      paused: subscriptions.filter((item) => item.status === "paused").length,
    }),
    [subscriptions],
  );

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return subscriptions.filter((item) => {
      if (filter !== "all" && item.status !== filter) return false;
      if (!value) return true;
      return `${item.id} ${item.userName} ${item.userEmail} ${item.userPhone} ${item.concept} ${item.mpPreapprovalId}`
        .toLowerCase()
        .includes(value);
    });
  }, [filter, query, subscriptions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
            <Repeat size={26} />
          </div>
          <div>
            <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">
              Cobros y Suscripciones
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-primary/80">
              Asigná un débito automático. El usuario autoriza el medio de pago en Mercado Pago; acá no se cargan tarjetas.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] px-4 py-2.5 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
          >
            <RefreshCw size={14} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => setAssignOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#4f7a58] px-4 py-2.5 text-[11px] tracking-[0.14em] text-white uppercase hover:bg-primary"
          >
            <Plus size={14} />
            Asignar suscripción
          </button>
        </div>
      </div>

      {!configured ? (
        <p className="rounded-2xl border border-[#ead56a] bg-[#fff8d9] px-4 py-3 text-sm text-[#6b5a2e]">
          Falta configurar <code>MP_ACCESS_TOKEN</code>. Podés asignar suscripciones, pero el enlace de Mercado Pago se genera después.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Pendientes", value: stats.pending },
          { label: "Autorizadas", value: stats.authorized },
          { label: "Pausadas", value: stats.paused },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#d7e6d3] bg-white px-5 py-4 shadow-sm">
            <p className="font-heading text-3xl text-primary">{item.value}</p>
            <p className="mt-1 text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#6f8a74]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, apellido, email, ID o concepto"
            className="w-full rounded-full border border-[#d7e6d3] bg-white py-2.5 pr-4 pl-11 text-sm outline-none focus:border-[#4f7a58]"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Todas"],
              ["pending_authorization", "Pendientes"],
              ["authorized", "Autorizadas"],
              ["paused", "Pausadas"],
              ["cancelled", "Canceladas"],
            ] as Array<[Filter, string]>
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-3 py-1.5 text-[11px] tracking-[0.12em] uppercase ${
                filter === value ? "bg-[#4f7a58] text-white" : "border border-[#d7e6d3] text-[#4f7a58]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#d7e6d3] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e3eee0] bg-[#f7faf5] text-[11px] tracking-[0.14em] text-[#6f8a74] uppercase">
                <th className="px-4 py-4 font-medium">ID</th>
                <th className="px-4 py-4 font-medium">Usuario</th>
                <th className="px-4 py-4 font-medium">Concepto</th>
                <th className="px-4 py-4 font-medium">Importe</th>
                <th className="px-4 py-4 font-medium">Periodicidad</th>
                <th className="px-4 py-4 font-medium">Estado</th>
                <th className="px-4 py-4 font-medium">Próximo cobro</th>
                <th className="px-4 py-4 font-medium">Alta</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground italic">
                    No hay suscripciones para mostrar.
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr key={item.id} className={`border-b border-[#f0f5ee] ${index % 2 === 1 ? "bg-[#f7faf5]" : ""}`}>
                    <td className="px-4 py-3 text-muted-foreground">{item.id}</td>
                    <td className="px-4 py-3">
                      <Link href={`/panel/cobros/${item.id}`} className="font-medium text-primary hover:underline">
                        {item.userName}
                      </Link>
                      <p className="text-xs text-muted-foreground">{item.userEmail}</p>
                    </td>
                    <td className="px-4 py-3">{item.concept}</td>
                    <td className="px-4 py-3">{formatMoney(item.amountCents, item.currency)}</td>
                    <td className="px-4 py-3">{periodLabel(item.frequency, item.frequencyType, item.periodId)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={item.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.nextChargeAt ? formatDateTime(item.nextChargeAt) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(item.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {assignOpen ? (
        <AssignModal
          users={users}
          onClose={() => setAssignOpen(false)}
          onCreated={(result) => {
            setAssignOpen(false);
            setCreated(result);
            router.refresh();
          }}
        />
      ) : null}

      {created ? (
        <CreatedModal created={created} onClose={() => setCreated(null)} />
      ) : null}
    </div>
  );
}

function AssignModal({
  users,
  onClose,
  onCreated,
}: {
  users: PanelUser[];
  onClose: () => void;
  onCreated: (result: {
    id: number;
    token: string;
    userName: string;
    userPhone: string;
    concept: string;
    amountCents: number;
    currency: string;
    warning?: string;
  }) => void;
}) {
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState<number | "">("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const matches = useMemo(() => {
    const value = query.trim().toLowerCase();
    const list = users.filter((user) => user.status !== "suspended");
    if (!value) return list.slice(0, 8);
    return list
      .filter((user) => `${user.id} ${user.name} ${user.email} ${user.phone}`.toLowerCase().includes(value))
      .slice(0, 12);
  }, [query, users]);

  const selected = users.find((user) => user.id === userId);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-primary/35" onClick={onClose} />
      <form
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#f9f7f2] shadow-2xl"
        action={async (formData) => {
          setPending(true);
          setError("");
          const result = await createSubscriptionAction(formData);
          setPending(false);
          if (result && "error" in result && result.error) {
            setError(result.error);
            return;
          }
          if (result && "ok" in result) {
            onCreated({
              id: result.id,
              token: result.token,
              userName: result.userName,
              userPhone: result.userPhone,
              concept: result.concept,
              amountCents: result.amountCents,
              currency: result.currency,
              warning: result.warning,
            });
          }
        }}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <h2 className="font-heading text-3xl text-primary uppercase">Asignar suscripción</h2>
          <button type="button" onClick={onClose} className="text-[#6f8a74] hover:text-primary" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <p className="px-6 pt-2 text-sm text-muted-foreground">
          El usuario va a autorizar el débito en Mercado Pago. No ingreses tarjetas ni datos bancarios acá.
        </p>

        <div className="space-y-4 px-6 py-5">
          <input type="hidden" name="userId" value={userId} />
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Buscar usuario</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nombre, apellido, email, teléfono o ID"
              className={fieldClass}
            />
          </label>
          {selected ? (
            <p className="rounded-xl bg-[#e8f3e3] px-4 py-3 text-sm text-[#2d4739]">
              Seleccionado: <strong>{selected.name}</strong> · {selected.email}
            </p>
          ) : null}
          <ul className="max-h-44 overflow-y-auto rounded-2xl border border-[#d7e6d3] bg-white">
            {matches.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => setUserId(user.id)}
                  className={`flex w-full items-start justify-between px-4 py-3 text-left text-sm ${
                    userId === user.id ? "bg-[#e8f3e3]" : "hover:bg-[#f7faf5]"
                  }`}
                >
                  <span>
                    <span className="font-medium text-primary">{user.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      #{user.id} · {user.email}
                    </span>
                  </span>
                  <span className="text-[10px] tracking-[0.12em] text-[#6f8a74] uppercase">{user.role}</span>
                </button>
              </li>
            ))}
          </ul>

          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Concepto</span>
            <input name="concept" required placeholder="Ej: Cuota membresía Código Semilla" className={fieldClass} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Importe ARS</span>
              <input name="amount" required placeholder="Ej: 25.000,00" className={fieldClass} />
            </label>
            <label className="block space-y-2">
              <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Periodicidad</span>
              <select name="periodId" defaultValue="monthly" className={fieldClass}>
                {SUBSCRIPTION_PERIODS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Fecha de inicio (opcional)</span>
            <input name="startDate" type="date" className={fieldClass} />
          </label>
          {error ? <p className="text-sm text-[#7a3a34]">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm text-[#4f7a58]">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending || !userId}
            className="rounded-full bg-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.18em] text-white uppercase disabled:opacity-70"
          >
            {pending ? "Generando..." : "Generar autorización"}
          </button>
        </div>
      </form>
    </div>
  );
}

function CreatedModal({
  created,
  onClose,
}: {
  created: {
    id: number;
    token: string;
    userName: string;
    userPhone: string;
    concept: string;
    amountCents: number;
    currency: string;
    warning?: string;
  };
  onClose: () => void;
}) {
  const url = authorizePublicUrl(created.token);
  const message = `Hola ${created.userName}, te asignamos el débito automático de ${created.concept} por ${formatMoney(
    created.amountCents,
    created.currency,
  )}. Autorizalo en Mercado Pago con este enlace (no compartas tu tarjeta con nosotros): ${url}`;
  const wa = created.userPhone ? whatsappUrl(created.userPhone, message) : "";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-primary/35" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="font-heading text-3xl text-primary uppercase">Suscripción creada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          El cobro queda pendiente hasta que la persona autorice en Mercado Pago.
        </p>
        {created.warning ? (
          <p className="mt-3 rounded-xl bg-[#fff8d9] px-4 py-3 text-sm text-[#6b5a2e]">{created.warning}</p>
        ) : null}
        <p className="mt-4 break-all rounded-xl bg-[#f7faf5] px-4 py-3 text-sm text-primary">{url}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(url)}
            className="rounded-full border border-[#d7e6d3] px-4 py-2 text-[11px] tracking-[0.14em] text-[#4f7a58] uppercase"
          >
            Copiar enlace
          </button>
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#4f7a58] px-4 py-2 text-[11px] tracking-[0.14em] text-white uppercase"
            >
              <WhatsAppIcon size={14} />
              Enviar por WhatsApp
            </a>
          ) : null}
          <Link
            href={`/panel/cobros/${created.id}`}
            className="rounded-full border border-[#4f7a58] px-4 py-2 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
          >
            Ver detalle
          </Link>
        </div>
        <button type="button" onClick={onClose} className="mt-4 text-sm text-[#6f8a74]">
          Cerrar
        </button>
      </div>
    </div>
  );
}
