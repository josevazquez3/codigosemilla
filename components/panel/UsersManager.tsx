"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Layers,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import {
  createUserAction,
  createUsersBulkAction,
  deleteUserAction,
  toggleMembershipAction,
  updateUserAction,
} from "@/app/panel/actions";
import { fieldClass } from "@/components/panel/ui";
import { USER_ROLES, type PanelUser, type UserRole } from "@/lib/panel-data";
import type { PadronRow } from "@/lib/padron";
import { applyTemplate, whatsappUrl, type SiteSettings } from "@/lib/site-settings";

type UsersManagerProps = {
  users: PanelUser[];
  padron: PadronRow[];
  settings: SiteSettings;
};

export function UsersManager({ users, padron, settings }: UsersManagerProps) {
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState<"create" | PanelUser | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return users;
    return users.filter((user) =>
      `${user.name} ${user.email} ${user.role} ${statusLabel(user.status)}`
        .toLowerCase()
        .includes(value),
    );
  }, [query, users]);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <Users size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">
            Gestión usuarios
          </h1>
          <p className="mt-2 text-sm text-primary/80">
            Administrá cuentas, roles y permisos de la plataforma.
          </p>
        </div>
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
            placeholder="Buscar por nombre, email, rol o estado..."
            className="w-full rounded-full border border-[#d7e6d3] bg-white py-3 pr-4 pl-11 text-sm outline-none focus:border-[#4f7a58]"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setBulkOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] bg-white px-4 py-2.5 text-[11px] tracking-[0.16em] text-[#4f7a58] uppercase"
          >
            <Layers size={14} />
            Crear usuarios masivamente
          </button>
          <button
            type="button"
            onClick={() => setDrawer("create")}
            className="inline-flex items-center gap-2 rounded-full bg-[#4f7a58] px-4 py-2.5 text-[11px] tracking-[0.16em] text-white uppercase hover:bg-primary"
          >
            <Plus size={14} />
            Crear usuario
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#d7e6d3] bg-white shadow-sm shadow-primary/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e3eee0] bg-[#f7faf5] text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">
                <th className="px-5 py-4 font-medium">Nombre</th>
                <th className="px-5 py-4 font-medium">Email</th>
                <th className="px-5 py-4 font-medium">Rol</th>
                <th className="px-5 py-4 font-medium">Estado</th>
                <th className="px-5 py-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground italic">
                    No hay personas que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b border-[#f0f5ee] ${index % 2 === 1 ? "bg-[#f7faf5]" : "bg-white"}`}
                  >
                    <td className="px-5 py-4 font-medium text-primary">{user.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">{user.email}</td>
                    <td className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          user.status === "active"
                            ? "font-medium text-[#4f7a58]"
                            : user.status === "suspended"
                              ? "font-medium text-[#7a3a34]"
                              : "font-medium text-[#6b5a2e]"
                        }
                      >
                        {statusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <IconButton label="Editar" onClick={() => setDrawer(user)}>
                          <Pencil size={16} />
                        </IconButton>
                        <form action={toggleMembershipAction}>
                          <input type="hidden" name="id" value={user.id} />
                          <input type="hidden" name="role" value={user.role} />
                          <IconButton
                            label="Membresía"
                            type="submit"
                            disabled={user.role === "Admin"}
                          >
                            <UserCheck size={16} />
                          </IconButton>
                        </form>
                        {user.phone ? (
                          <a
                            href={whatsappUrl(
                              user.phone,
                              applyTemplate(settings.messageBulkUsers, {
                                nombre: user.name,
                                usuario: user.email,
                                clave: "tu clave de acceso",
                                email: user.email,
                              }),
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full p-2 text-[#6f8a74] hover:bg-[#e8f3e3] hover:text-primary"
                            aria-label="WhatsApp"
                            title="WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </a>
                        ) : null}
                        <form
                          action={async (formData) => {
                            if (!window.confirm(`¿Eliminar a ${user.name}?`)) return;
                            await deleteUserAction(formData);
                          }}
                        >
                          <input type="hidden" name="id" value={user.id} />
                          <IconButton label="Eliminar" type="submit">
                            <Trash2 size={16} />
                          </IconButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {drawer ? (
        <UserDrawer
          user={drawer === "create" ? null : drawer}
          onClose={() => setDrawer(null)}
        />
      ) : null}
      {bulkOpen ? (
        <BulkCreateModal
          padron={padron}
          settings={settings}
          onClose={() => setBulkOpen(false)}
        />
      ) : null}
    </div>
  );
}

function statusLabel(status: PanelUser["status"]) {
  if (status === "active") return "Activo";
  if (status === "suspended") return "Suspendido";
  return "Invitado";
}

function RoleBadge({ role }: { role: UserRole }) {
  const tone =
    role === "Admin"
      ? "bg-[#2d4739] text-white"
      : role === "Usuario Membresía"
        ? "bg-[#e8f3e3] text-[#2d4739]"
        : "bg-[#eef3ea] text-[#6f8a74]";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] tracking-[0.12em] uppercase ${tone}`}>
      {role}
    </span>
  );
}

function IconButton({
  children,
  label,
  onClick,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-full p-2 text-[#6f8a74] transition-colors hover:bg-[#e8f3e3] hover:text-primary disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function UserDrawer({
  user,
  onClose,
}: {
  user: PanelUser | null;
  onClose: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [active, setActive] = useState(user ? user.status === "active" : true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [lockAutofill, setLockAutofill] = useState(!user);
  const action = user ? updateUserAction : createUserAction;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (user) return;
    const timer = window.setTimeout(() => {
      setEmail("");
      setPassword("");
    }, 50);
    return () => window.clearTimeout(timer);
  }, [user]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-primary/35" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-[#f9f7f2] shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="font-heading text-3xl text-primary uppercase">
            {user ? "Editar usuario" : "Crear usuario"}
          </h2>
          <button type="button" onClick={onClose} className="text-[#6f8a74] hover:text-primary" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <form
          className="relative px-6 py-5"
          autoComplete="off"
          action={async (formData) => {
            setError("");
            const result = await action(formData);
            if (result?.error) {
              setError(result.error);
              return;
            }
            onClose();
          }}
        >
          {user ? <input type="hidden" name="id" value={user.id} /> : null}
          <input type="hidden" name="status" value={active ? "active" : "suspended"} />
          <div aria-hidden className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0">
            <input type="text" tabIndex={-1} autoComplete="username" />
            <input type="password" tabIndex={-1} autoComplete="current-password" />
          </div>
          <div className="space-y-5">
            <DrawerField label="Nombre">
              <input required name="name" defaultValue={user?.name ?? ""} autoComplete="off" className={fieldClass} />
            </DrawerField>
            <DrawerField label="Email">
              <input
                required
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onFocus={() => setLockAutofill(false)}
                readOnly={lockAutofill}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className={fieldClass}
              />
            </DrawerField>
            <DrawerField label="Celular (WhatsApp)">
              <input
                name="phone"
                defaultValue={user?.phone ?? ""}
                className={`${fieldClass} bg-[#eef6ea]`}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Opcional. Si el email está en el padrón, se puede completar después.
              </p>
            </DrawerField>
            <DrawerField label="Contraseña">
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required={!user}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onFocus={() => setLockAutofill(false)}
                  readOnly={lockAutofill}
                  autoComplete="new-password"
                  placeholder="Ej: MiClave1234"
                  className={`${fieldClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-[#6f8a74]"
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </DrawerField>
            <DrawerField label="Rol">
              <select name="role" defaultValue={user?.role ?? "Usuario"} className={fieldClass}>
                {USER_ROLES.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </DrawerField>
            <label className="flex items-center gap-3 text-sm text-primary">
              <input
                type="checkbox"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
                className="h-4 w-4 accent-[#4f7a58]"
              />
              Usuario activo
            </label>
            {error ? <p className="text-sm text-[#7a3a34]">{error}</p> : null}
          </div>
          <div className="flex justify-end gap-3 pt-8 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.16em] text-primary uppercase"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.16em] text-white uppercase hover:bg-primary"
            >
              {user ? "Guardar" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DrawerField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">{label}</span>
      {children}
    </label>
  );
}

function BulkCreateModal({
  padron,
  settings,
  onClose,
}: {
  padron: PadronRow[];
  settings: SiteSettings;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(padron.filter((row) => row.status === "nuevo").map((row) => [row.email, true])),
  );
  const [membership, setMembership] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return padron;
    return padron.filter((row) => `${row.name} ${row.email}`.toLowerCase().includes(value));
  }, [padron, query]);

  const counts = {
    nuevo: padron.filter((row) => row.status === "nuevo").length,
    duplicado: padron.filter((row) => row.status === "duplicado").length,
    sinEmail: padron.filter((row) => row.status === "sin-email").length,
  };
  const selectedCount = visible.filter((row) => row.status === "nuevo" && selected[row.email]).length;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  function toggleVisible(next: boolean) {
    setSelected((current) => {
      const copy = { ...current };
      for (const row of visible) {
        if (row.status === "nuevo") copy[row.email] = next;
      }
      return copy;
    });
  }

  async function createSelected() {
    const items = padron
      .filter((row) => row.status === "nuevo" && selected[row.email])
      .map((row) => ({
        name: row.name,
        email: row.email,
        password: row.password,
        phone: row.phone,
        role: (membership[row.email] ? "Usuario Membresía" : "Usuario") as UserRole,
      }));
    if (items.length === 0) {
      setError("Seleccioná al menos un usuario nuevo.");
      return;
    }
    const formData = new FormData();
    formData.set("payload", JSON.stringify(items));
    setPending(true);
    setError("");
    const result = await createUsersBulkAction(formData);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-primary/35" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#f9f7f2] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#d7e6d3] px-6 py-5">
          <div>
            <h2 className="font-heading text-3xl text-primary uppercase">Crear usuarios masivamente</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Los datos se cargan desde el padrón. La contraseña se genera con el primer nombre más 1234
              (ejemplo: Maria1234). Los emails que ya existen quedan marcados como duplicados y no se vuelven a crear.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-[#6f8a74] hover:text-primary" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <label className="relative block">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#6f8a74]"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-full rounded-full border border-[#d7e6d3] bg-white py-3 pr-4 pl-11 text-sm outline-none focus:border-[#4f7a58]"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-[#4f7a58]">{counts.nuevo} nuevo(s)</span>
              <span className="text-[#b56a2b]">{counts.duplicado} duplicado(s)</span>
              <span className="text-[#a14b55]">{counts.sinEmail} sin email</span>
            </div>
            <button
              type="button"
              onClick={() => toggleVisible(selectedCount === 0)}
              className="rounded-full border border-[#4f7a58] px-4 py-2 text-[11px] tracking-[0.14em] text-[#4f7a58] uppercase"
            >
              {selectedCount === 0 ? "Seleccionar visibles" : "Deseleccionar visibles"}
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#d7e6d3] bg-white">
            <div className="max-h-[42vh] overflow-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="sticky top-0 bg-[#f7faf5] text-[11px] tracking-[0.14em] text-[#6f8a74] uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium" />
                    <th className="px-4 py-3 font-medium">Nombre</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Contraseña</th>
                    <th className="px-4 py-3 font-medium">Usuario membresía</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row, index) => {
                    const disabled = row.status !== "nuevo";
                    return (
                      <tr
                        key={`${row.email}-${row.name}`}
                        className={`border-t border-[#f0f5ee] ${
                          disabled ? "bg-[#f4f1ea] text-[#8a8a8a]" : index % 2 === 1 ? "bg-[#f7faf5]" : "bg-white"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            disabled={disabled}
                            checked={Boolean(selected[row.email])}
                            onChange={(event) =>
                              setSelected((current) => ({
                                ...current,
                                [row.email]: event.target.checked,
                              }))
                            }
                            className="h-4 w-4 accent-[#4f7a58]"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-primary">{row.name}</td>
                        <td className="px-4 py-3">{row.email || "—"}</td>
                        <td className="px-4 py-3">{row.password || "—"}</td>
                        <td className="px-4 py-3">
                          <label className="inline-flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              disabled={disabled}
                              checked={Boolean(membership[row.email])}
                              onChange={(event) =>
                                setMembership((current) => ({
                                  ...current,
                                  [row.email]: event.target.checked,
                                }))
                              }
                              className="h-4 w-4 accent-[#4f7a58]"
                            />
                            Membresía
                          </label>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] tracking-[0.12em] uppercase ${
                              row.status === "nuevo"
                                ? "bg-[#e8f3e3] text-[#2d4739]"
                                : row.status === "duplicado"
                                  ? "bg-[#f4e4d4] text-[#8a4b1f]"
                                  : "bg-[#f8e6e4] text-[#7a3a34]"
                            }`}
                          >
                            {row.status === "nuevo"
                              ? "Nuevo"
                              : row.status === "duplicado"
                                ? "Ya tiene usuario"
                                : "Sin email"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {row.phone ? (
                            <a
                              href={whatsappUrl(
                                row.phone,
                                applyTemplate(settings.messageBulkUsers, {
                                  nombre: row.name,
                                  usuario: row.email,
                                  clave: row.password || "tu clave de acceso",
                                  email: row.email,
                                }),
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#4f7a58] underline"
                            >
                              Enviar
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {error ? <p className="text-sm text-[#7a3a34]">{error}</p> : null}
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-[#d7e6d3] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.16em] text-primary uppercase"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={createSelected}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-[#4f7a58] px-5 py-2.5 text-xs tracking-[0.16em] text-white uppercase hover:bg-primary disabled:opacity-70"
          >
            <Layers size={14} />
            {pending ? "Creando..." : `Crear ${selectedCount} usuarios`}
          </button>
        </div>
      </div>
    </div>
  );
}
