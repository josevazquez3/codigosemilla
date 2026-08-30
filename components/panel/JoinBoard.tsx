"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  FileDown,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
  UserRoundPlus,
  X,
} from "lucide-react";
import {
  createApplicationAction,
  createUserFromApplicationAction,
  deleteApplicationAction,
  reviewApplicationAction,
  updateApplicationAction,
} from "@/app/panel/actions";
import { fieldClass } from "@/components/panel/ui";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { formatDateTime } from "@/lib/panel-format";
import type { PanelApplication, PanelUser } from "@/lib/panel-data";
import { applyTemplate, whatsappUrl, type SiteSettings } from "@/lib/site-settings";

type FilterKind = "all" | "especial" | "encuentros";

export function JoinBoard({
  applications,
  users,
  settings,
}: {
  applications: PanelApplication[];
  users: PanelUser[];
  settings: SiteSettings;
}) {
  const [query, setQuery] = useState("");
  const [onlyUsers, setOnlyUsers] = useState(false);
  const [kind, setKind] = useState<FilterKind>("all");
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [drawer, setDrawer] = useState<"create" | PanelApplication | null>(null);
  const existingEmails = useMemo(
    () => new Set(users.map((user) => user.email.toLowerCase())),
    [users],
  );

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return applications.filter((item) => {
      if (onlyUsers && !existingEmails.has(item.email)) return false;
      if (kind === "especial" && !item.isSpecialRoom) return false;
      if (kind === "encuentros" && !item.isEncuentros) return false;
      if (!value) return true;
      return `${item.firstName} ${item.lastName} ${item.name} ${item.dni} ${item.email} ${item.phone}`
        .toLowerCase()
        .includes(value);
    });
  }, [applications, existingEmails, kind, onlyUsers, query]);

  const selectedRows = filtered.filter((item) => selected[item.id]);
  const allVisibleSelected = filtered.length > 0 && filtered.every((item) => selected[item.id]);

  function toggleAll(next: boolean) {
    setSelected((current) => {
      const copy = { ...current };
      for (const item of filtered) copy[item.id] = next;
      return copy;
    });
  }

  function exportRows() {
    const rows = selectedRows.length > 0 ? selectedRows : filtered;
    const header = [
      "Fecha",
      "Nombres",
      "Apellidos",
      "DNI",
      "Celular",
      "Mail",
      "Estado",
      "Encuentros",
      "Sala especial",
      "Residencia",
    ];
    const lines = [
      header.join(";"),
      ...rows.map((item) =>
        [
          formatDateTime(item.createdAt),
          item.firstName,
          item.lastName,
          item.dni,
          item.phone,
          item.email,
          statusLabel(item.status),
          item.isEncuentros ? "Sí" : "No",
          item.isSpecialRoom ? "Sí" : "No",
          item.residence,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(";"),
      ),
    ];
    const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "quiero-unirme.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <UserRoundPlus size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">
            Quiero unirme
          </h1>
          <p className="mt-2 text-sm text-primary/80">
            Solicitudes de membresía, exportación y creación de usuarios desde el padrón.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-full border border-[#d7e6d3] bg-white px-5 py-3">
        <label className="inline-flex items-center gap-2 text-sm text-primary">
          <input
            type="checkbox"
            checked={onlyUsers}
            onChange={(event) => setOnlyUsers(event.target.checked)}
            className="h-4 w-4 accent-[#4f7a58]"
          />
          Usuarios
        </label>
        <button
          type="button"
          onClick={() => setKind((current) => (current === "especial" ? "all" : "especial"))}
          className={`inline-flex items-center gap-2 text-sm ${kind === "especial" ? "font-medium text-primary" : "text-[#6f8a74]"}`}
        >
          <span className="h-3.5 w-3.5 rounded-sm bg-[#9ec4e8]" />
          Usuario Membresía Especial
        </button>
        <button
          type="button"
          onClick={() => setKind((current) => (current === "encuentros" ? "all" : "encuentros"))}
          className={`inline-flex items-center gap-2 text-sm ${kind === "encuentros" ? "font-medium text-primary" : "text-[#6f8a74]"}`}
        >
          <span className="h-3.5 w-3.5 rounded-sm bg-[#7dba7a]" />
          Usuario Encuentros
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#6f8a74]"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, DNI, mail o celular..."
            className="w-full rounded-full border border-[#d7e6d3] bg-white py-3 pr-4 pl-11 text-sm outline-none focus:border-[#4f7a58]"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDrawer("create")}
            className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] bg-white px-4 py-2.5 text-[11px] tracking-[0.16em] text-[#4f7a58] uppercase"
          >
            <Plus size={14} />
            Nueva solicitud
          </button>
          <button
            type="button"
            onClick={exportRows}
            className="inline-flex items-center gap-2 rounded-full bg-[#4f7a58] px-4 py-2.5 text-[11px] tracking-[0.16em] text-white uppercase hover:bg-primary"
          >
            <FileDown size={14} />
            Exportar
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#d7e6d3] bg-white shadow-sm shadow-primary/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e3eee0] bg-[#f7faf5] text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">
                <th className="px-4 py-4 font-medium">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={(event) => toggleAll(event.target.checked)}
                    className="h-4 w-4 accent-[#4f7a58]"
                    aria-label="Seleccionar visibles"
                  />
                </th>
                <th className="px-4 py-4 font-medium">Fecha</th>
                <th className="px-4 py-4 font-medium">Nombres</th>
                <th className="px-4 py-4 font-medium">Apellidos</th>
                <th className="px-4 py-4 font-medium">DNI</th>
                <th className="px-4 py-4 font-medium">Celular</th>
                <th className="px-4 py-4 font-medium">Mail</th>
                <th className="px-4 py-4 font-medium">Estado</th>
                <th className="px-4 py-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-sm text-muted-foreground italic">
                    No hay solicitudes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const wa = whatsappHref(item, settings);
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-[#f0f5ee] ${rowTone(item, Boolean(selected[item.id]))}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={Boolean(selected[item.id])}
                          onChange={(event) =>
                            setSelected((current) => ({
                              ...current,
                              [item.id]: event.target.checked,
                            }))
                          }
                          className="h-4 w-4 accent-[#4f7a58]"
                          aria-label={`Seleccionar ${item.name}`}
                        />
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{formatDateTime(item.createdAt)}</td>
                      <td className="px-4 py-4 font-medium text-primary">{item.firstName || "—"}</td>
                      <td className="px-4 py-4 text-primary">{item.lastName || "—"}</td>
                      <td className="px-4 py-4 text-muted-foreground">{item.dni || "—"}</td>
                      <td className="px-4 py-4 text-muted-foreground">{item.phone || "—"}</td>
                      <td className="px-4 py-4 text-muted-foreground">{item.email}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] tracking-[0.12em] uppercase ${statusTone(item.status)}`}>
                          {statusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          {wa ? (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full p-2 text-[#4f7a58] hover:bg-[#e8f3e3]"
                              aria-label="WhatsApp"
                              title="WhatsApp"
                            >
                              <WhatsAppIcon size={16} />
                            </a>
                          ) : null}
                          <form
                            action={async (formData) => {
                              const result = await createUserFromApplicationAction(formData);
                              if (result?.error) {
                                window.alert(result.error);
                                return;
                              }
                              if (result?.password) {
                                window.alert(`Usuario creado. Clave: ${result.password}`);
                              }
                            }}
                          >
                            <input type="hidden" name="id" value={item.id} />
                            <IconButton label="Crear usuario" type="submit" className="text-primary">
                              <UserPlus size={16} />
                            </IconButton>
                          </form>
                          <IconButton label="Editar" onClick={() => setDrawer(item)}>
                            <Pencil size={16} />
                          </IconButton>
                          <form action={reviewApplicationAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="status" value="accepted" />
                            <IconButton
                              label="Marcar gestionada"
                              type="submit"
                              disabled={item.status === "accepted"}
                            >
                              <CheckCircle2 size={16} />
                            </IconButton>
                          </form>
                          <form
                            action={async (formData) => {
                              if (!window.confirm(`¿Eliminar la solicitud de ${item.name}?`)) return;
                              await deleteApplicationAction(formData);
                            }}
                          >
                            <input type="hidden" name="id" value={item.id} />
                            <IconButton label="Eliminar" type="submit">
                              <Trash2 size={16} />
                            </IconButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {drawer ? (
        <ApplicationModal
          application={drawer === "create" ? null : drawer}
          onClose={() => setDrawer(null)}
        />
      ) : null}
    </div>
  );
}

function whatsappHref(item: PanelApplication, settings: SiteSettings) {
  const phone = item.phone || settings.whatsappNumber;
  return whatsappUrl(
    phone,
    applyTemplate(settings.messageJoinForm, {
      nombres: item.firstName,
      apellidos: item.lastName,
      celular: item.phone,
      numeroPlataforma: settings.whatsappNumber,
    }),
  );
}

function rowTone(item: PanelApplication, selected: boolean) {
  if (selected) return "bg-[#e4efe8]";
  if (item.isSpecialRoom) return "bg-[#eaf3fb]";
  if (item.isEncuentros) return "bg-[#e8f3e3]";
  return "bg-white";
}

function statusLabel(status: PanelApplication["status"]) {
  if (status === "accepted") return "Gestionada";
  if (status === "reviewed") return "En revisión";
  if (status === "rejected") return "Rechazada";
  return "Pendiente";
}

function statusTone(status: PanelApplication["status"]) {
  if (status === "accepted") return "bg-[#e8f3e3] text-[#2d4739]";
  if (status === "rejected") return "bg-[#f8e6e4] text-[#7a3a34]";
  return "bg-[#f4e4d4] text-[#8a4b1f]";
}

function IconButton({
  children,
  label,
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full p-2 text-[#2d4739] transition-colors hover:bg-[#e8f3e3] disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

function ApplicationModal({
  application,
  onClose,
}: {
  application: PanelApplication | null;
  onClose: () => void;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-primary/35" onClick={onClose} />
      <form
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-[#f9f7f2] shadow-2xl"
        action={async (formData) => {
          setPending(true);
          setError("");
          const result = application
            ? await updateApplicationAction(formData)
            : await createApplicationAction(formData);
          setPending(false);
          if (result?.error) {
            setError(result.error);
            return;
          }
          onClose();
        }}
      >
        {application ? <input type="hidden" name="id" value={application.id} /> : null}
        <div className="flex items-start justify-between gap-4 border-b border-[#d7e6d3] px-6 py-5">
          <div>
            <h2 className="font-heading text-3xl text-primary uppercase">
              {application ? "Editar solicitud" : "Quiero unirme"}
            </h2>
            {!application ? (
              <p className="mt-1 text-sm text-[#6f8a74]">
                Completá todos los datos para enviar tu solicitud de inscripción.
              </p>
            ) : null}
          </div>
          <button type="button" onClick={onClose} className="text-[#6f8a74] hover:text-primary" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <label className="flex items-center gap-3 rounded-2xl border border-[#d7e6d3] bg-white px-4 py-3 text-sm text-primary">
            <input
              type="checkbox"
              name="isEncuentros"
              defaultChecked={application?.isEncuentros}
              className="h-4 w-4 accent-[#4f7a58]"
            />
            Usuario Encuentros
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-[#d7e6d3] bg-white px-4 py-3 text-sm text-primary">
            <input
              type="checkbox"
              name="isSpecialRoom"
              defaultChecked={application?.isSpecialRoom}
              className="h-4 w-4 accent-[#4f7a58]"
            />
            Marca la tilde para Sala Especial
          </label>
          <Field label="Nombres" name="firstName" defaultValue={application?.firstName} required />
          <Field label="Apellidos" name="lastName" defaultValue={application?.lastName} />
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">DNI o pasaporte</span>
            <input
              name="dni"
              defaultValue={application?.dni}
              inputMode="numeric"
              placeholder="EJ: 30123456"
              className={fieldClass}
            />
            <p className="text-xs text-[#6f8a74]">Solo números, sin puntos ni guiones.</p>
          </label>
          <Field
            label="Fecha de nacimiento"
            name="birthDate"
            type="date"
            defaultValue={application?.birthDate}
          />
          <Field
            label="Correo electrónico"
            name="email"
            type="email"
            defaultValue={application?.email}
            required
          />
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Nº de celular</span>
            <input
              name="phone"
              type="tel"
              defaultValue={application?.phone}
              placeholder="EJ: +54 9 221 555-1234"
              className={fieldClass}
            />
            <p className="text-xs text-[#6f8a74]">Podés incluir código de país con +, ej: +54, +55.</p>
          </label>
          <Field label="Lugar de residencia" name="residence" defaultValue={application?.residence} />
          {error ? <p className="text-sm text-[#7a3a34]">{error}</p> : null}
        </div>
        <div className="flex flex-wrap justify-center gap-3 border-t border-[#d7e6d3] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#4f7a58] px-6 py-2.5 text-xs tracking-[0.16em] text-primary uppercase"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-[#4f7a58] px-6 py-2.5 text-xs tracking-[0.16em] text-white uppercase hover:bg-primary disabled:opacity-70"
          >
            {pending ? "Guardando..." : application ? "Guardar" : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className={fieldClass}
      />
    </label>
  );
}
