"use client";

import { useRef, useState } from "react";
import {
  Briefcase,
  Crown,
  ExternalLink,
  Settings,
} from "lucide-react";
import { saveSettingsAction } from "@/app/panel/actions";
import { fieldClass } from "@/components/panel/ui";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import {
  applyTemplate,
  currentMonthLabel,
  formatBankDetails,
  whatsappUrl,
  type SiteSettings,
} from "@/lib/site-settings";

export function SettingsBoard({ settings }: { settings: SiteSettings }) {
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  const bankPreview = formatBankDetails(form);
  const paymentPreview = applyTemplate(form.messagePaymentMonth, {
    nombres: "María",
    apellidos: "García",
    mes: currentMonthLabel(),
  });
  const bulkPreview = applyTemplate(form.messageBulkUsers, {
    nombre: "María García",
    usuario: "maria@email.com",
    clave: "Maria1234",
    email: "maria@email.com",
  });
  const joinFormPreview = applyTemplate(form.messageJoinForm, {
    nombres: "María",
    apellidos: "García",
    celular: "221 555-1234",
    numeroPlataforma: form.whatsappNumber,
  });
  const eventPreview = applyTemplate(form.messageEventRegistration, {
    nombres: "María",
    apellidos: "García",
    encuentro: "Seminario de Luna",
    celular: "221 555-1234",
    numeroPlataforma: form.whatsappNumber,
  });
  const contactWa = whatsappUrl(form.whatsappNumber, form.messageContact);
  const joinWa = whatsappUrl(
    form.whatsappNumber,
    `${form.messageJoinAr}\n\n${bankPreview}`,
  );
  const bankWa = whatsappUrl(form.whatsappNumber, bankPreview);

  return (
    <form
      className="space-y-6"
      action={async (formData) => {
        setError("");
        formData.set("payload", JSON.stringify(form));
        const result = await saveSettingsAction(formData);
        if (result?.error) {
          setError(result.error);
          return;
        }
        setSaved(true);
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <Settings size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">
            Configuración
          </h1>
          <p className="mt-2 text-sm text-primary/80">
            Ajustes generales de la plataforma y preferencias.
          </p>
        </div>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Nombre del espacio"
            value={form.spaceName}
            onChange={(value) => update("spaceName", value)}
          />
          <TextField
            label="Email de avisos"
            type="email"
            value={form.notifyEmail}
            onChange={(value) => update("notifyEmail", value)}
          />
          <TextField
            label="Cuota mensual"
            type="number"
            value={String(form.monthlyDueCents / 100)}
            onChange={(value) => update("monthlyDueCents", Math.round(Number(value || 0) * 100))}
          />
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Moneda</span>
            <select
              value={form.currency}
              onChange={(event) => update("currency", event.target.value)}
              className={fieldClass}
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <div className="md:col-span-2">
            <TextField
              label="Texto de bienvenida"
              value={form.welcomeText}
              onChange={(value) => update("welcomeText", value)}
            />
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={<WhatsAppIcon size={18} />} title="WhatsApp Web">
          Número y mensajes que se abren al hacer clic en los botones de la plataforma.
        </SectionTitle>
        <div className="mt-6 space-y-6">
          <TextField
            label="Número de celular"
            value={form.whatsappNumber}
            onChange={(value) => update("whatsappNumber", value)}
            hint="Ejemplo: +5492216014212 – Incluí código de país, sin espacios ni guiones."
          />
          <p className="text-sm text-muted-foreground">
            Estos textos aparecen ya escritos cuando alguien abre WhatsApp desde la web.
          </p>
          <CountedArea
            label="Contacto general"
            value={form.messageContact}
            onChange={(value) => update("messageContact", value)}
            hint="Se usa en la sección Contacto y en el ícono de WhatsApp del pie de página."
          />
          <CountedArea
            label="Quiero unirme (Argentina)"
            value={form.messageJoinAr}
            onChange={(value) => update("messageJoinAr", value)}
            hint="Botón de membresía en pesos en la sección de precios."
          />
          <CountedArea
            label="Comenzar mi proceso"
            value={form.messageStartProcess}
            onChange={(value) => update("messageStartProcess", value)}
            hint="Botón principal al final de la sección de precios."
          />
          <Preview title="Vista previa (contacto)">
            <p className="text-sm text-primary">{form.whatsappNumber}</p>
            <p className="mt-2 text-sm text-muted-foreground italic">{form.messageContact}</p>
            {contactWa ? (
              <a
                href={contactWa}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm text-[#4f7a58]"
              >
                Probar en WhatsApp Web <ExternalLink size={14} />
              </a>
            ) : null}
          </Preview>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={<Crown size={18} />} title="Sala especial — videos bloqueados">
          Mensaje del popup cuando un Usuario Membresía hace clic en un video de otra sala
          sin permiso.
        </SectionTitle>
        <div className="mt-6">
          <CountedArea
            label="Mensaje del popup"
            value={form.messageBlockedVideo}
            max={280}
            onChange={(value) => update("messageBlockedVideo", value)}
          />
        </div>
      </Card>

      <TemplateCard
        title="Mensajes pago del mes"
        description="Texto predeterminado al contactar clientes desde Tesorería → Pagos del Mes. Insertá los campos con un clic."
        label="Pago del mes"
        value={form.messagePaymentMonth}
        onChange={(value) => update("messagePaymentMonth", value)}
        fields={[
          { token: "{nombres}", label: "Nombres" },
          { token: "{apellidos}", label: "Apellidos" },
          { token: "{mes}", label: "Mes" },
        ]}
        hint="Se reemplazan al contactar desde Pagos del Mes."
        preview={paymentPreview}
        sample="Nombres: María · Apellidos: García · Mes: julio 2026"
      />

      <TemplateCard
        title="Alta masiva de usuarios"
        description="Mensaje al enviar credenciales desde Gestión Usuarios. Insertá nombre, usuario, clave y email con un clic."
        label="Alta masiva de usuarios"
        value={form.messageBulkUsers}
        onChange={(value) => update("messageBulkUsers", value)}
        fields={[
          { token: "{nombre}", label: "Nombre" },
          { token: "{usuario}", label: "Usuario" },
          { token: "{clave}", label: "Clave" },
          { token: "{email}", label: "Email" },
        ]}
        hint="Se reemplazan automáticamente al enviar por WhatsApp."
        preview={bulkPreview}
        sample="Nombre: María García · Usuario: maria@email.com · Clave: Maria1234 · Email: maria@email.com"
      />

      <TemplateCard
        title="Formulario quiero unirme"
        description="Mensaje que se muestra al completar el formulario de inscripción (incluye el celular de la plataforma)."
        label="Formulario quiero unirme (landing)"
        value={form.messageJoinForm}
        onChange={(value) => update("messageJoinForm", value)}
        fields={[
          { token: "{nombres}", label: "Nombres" },
          { token: "{apellidos}", label: "Apellidos" },
          { token: "{celular}", label: "Celular" },
          { token: "{numeroPlataforma}", label: "Nº plataforma" },
        ]}
        hint="Mensaje de confirmación al enviar el formulario. Podés usar {nombres}, {apellidos}, {celular} y {numeroPlataforma}."
        preview={joinFormPreview}
        sample={`Nombres: María · Apellidos: García · Celular: 221 555-1234 · Nº plataforma: ${form.whatsappNumber}`}
      />

      <TemplateCard
        title="Usuarios inscriptos encuentros"
        description="Mensaje al contactar desde Inscripción Encuentros. Insertá los campos con un clic."
        label="Usuarios inscriptos encuentros"
        value={form.messageEventRegistration}
        onChange={(value) => update("messageEventRegistration", value)}
        fields={[
          { token: "{nombres}", label: "Nombres" },
          { token: "{apellidos}", label: "Apellidos" },
          { token: "{encuentro}", label: "Encuentro" },
          { token: "{celular}", label: "Celular" },
          { token: "{numeroPlataforma}", label: "Nº plataforma" },
        ]}
        hint="Podés usar {nombres}, {apellidos}, {encuentro}, {celular} y {numeroPlataforma}."
        preview={eventPreview}
        sample="Nombres: María · Encuentro: Seminario de Luna"
      />

      <Card>
        <SectionTitle icon={<Briefcase size={18} />} title="Datos bancarios (Argentina)">
          Completá solo los campos que uses. Se muestran en la web y se pueden enviar por
          WhatsApp.
        </SectionTitle>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <TextField label="Titular (opcional)" value={form.bankHolder} onChange={(value) => update("bankHolder", value)} />
          <TextField label="Banco (opcional)" value={form.bankName} onChange={(value) => update("bankName", value)} placeholder="Ej: Banco Galicia" />
          <TextField label="Alias (opcional)" value={form.bankAlias} onChange={(value) => update("bankAlias", value)} />
          <TextField label="CBU (opcional)" value={form.bankCbu} onChange={(value) => update("bankCbu", value)} placeholder="22 dígitos" />
          <TextField label="CVU (opcional)" value={form.bankCvu} onChange={(value) => update("bankCvu", value)} placeholder="Ej: 000000310001..." />
          <TextField label="Cta. (opcional)" value={form.bankAccount} onChange={(value) => update("bankAccount", value)} placeholder="Número de cuenta" />
        </div>
        <Preview title="Vista previa del mensaje">
          <pre className="font-sans text-sm whitespace-pre-wrap text-primary">{bankPreview}</pre>
          {bankWa ? (
            <a href={bankWa} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-[#4f7a58]">
              Enviar datos bancarios por WhatsApp <ExternalLink size={14} />
            </a>
          ) : null}
          <div className="mt-5 border-t border-[#d7e6d3] pt-4">
            <p className="text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">
              Mensaje “Quiero unirme” con datos incluidos
            </p>
            <p className="mt-2 text-sm text-muted-foreground italic">{form.messageJoinAr}</p>
            <pre className="mt-2 font-sans text-sm whitespace-pre-wrap text-primary">{bankPreview}</pre>
            {joinWa ? (
              <a href={joinWa} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-[#4f7a58]">
                Probar mensaje de membresía <ExternalLink size={14} />
              </a>
            ) : null}
          </div>
        </Preview>
      </Card>

      {error ? <p className="text-sm text-[#7a3a34]">{error}</p> : null}
      {saved ? <p className="text-sm text-[#4f7a58]">La configuración se guardó.</p> : null}
      <button
        type="submit"
        className="rounded-full bg-[#4f7a58] px-8 py-3 text-xs tracking-[0.18em] text-white uppercase hover:bg-primary"
      >
        Guardar configuración
      </button>
    </form>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm shadow-primary/5 md:p-8">
      {children}
    </section>
  );
}

function SectionTitle({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f3e3] text-[#4f7a58]">
        {icon}
      </div>
      <div>
        <h2 className="font-heading text-2xl text-primary uppercase">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  hint,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </label>
  );
}

function CountedArea({
  label,
  value,
  onChange,
  hint,
  max = 500,
  areaRef,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  max?: number;
  areaRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">{label}</span>
      <textarea
        ref={areaRef}
        rows={4}
        maxLength={max}
        value={value}
        onChange={(event) => onChange(event.target.value.slice(0, max))}
        className={`${fieldClass} resize-y`}
      />
      <div className="flex items-start justify-between gap-4">
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : <span />}
        <p className="text-xs text-[#6f8a74]">
          {value.length}/{max}
        </p>
      </div>
    </label>
  );
}

function Preview({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#d7e6d3] bg-[#f7faf5] p-5">
      <p className="text-[11px] tracking-[0.18em] text-[#6f8a74] uppercase">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function TemplateCard({
  title,
  description,
  label,
  value,
  onChange,
  fields,
  hint,
  preview,
  sample,
}: {
  title: string;
  description: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  fields: Array<{ token: string; label: string }>;
  hint: string;
  preview: string;
  sample: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function insert(token: string) {
    const area = ref.current;
    if (!area) {
      onChange(`${value}${token}`.slice(0, 500));
      return;
    }
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const next = `${value.slice(0, start)}${token}${value.slice(end)}`.slice(0, 500);
    onChange(next);
    requestAnimationFrame(() => {
      area.focus();
      const pos = Math.min(start + token.length, 500);
      area.setSelectionRange(pos, pos);
    });
  }

  return (
    <Card>
      <SectionTitle icon={<WhatsAppIcon size={18} />} title={title}>
        {description}
      </SectionTitle>
      <div className="mt-6 space-y-4">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-[#6f8a74] uppercase">Campos disponibles</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Hacé clic en un campo para insertarlo donde está el cursor en el mensaje.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {fields.map((field) => (
              <button
                key={field.token}
                type="button"
                onClick={() => insert(field.token)}
                className="rounded-full border border-[#4f7a58] bg-white px-3 py-1.5 text-[11px] tracking-[0.12em] text-[#4f7a58] uppercase"
              >
                + {field.label}
              </button>
            ))}
          </div>
        </div>
        <CountedArea
          label={label}
          value={value}
          onChange={onChange}
          hint={hint}
          areaRef={ref}
        />
        <Preview title="Vista previa con datos de ejemplo">
          <p className="text-sm whitespace-pre-wrap text-primary">{preview}</p>
          <p className="mt-3 text-xs text-[#6f8a74]">{sample}</p>
        </Preview>
      </div>
    </Card>
  );
}
