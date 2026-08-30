"use client";

import { useMemo, useState } from "react";
import { ClipboardList, FileDown, Search } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { formatDateTime } from "@/lib/panel-format";
import { applyTemplate, whatsappUrl, type SiteSettings } from "@/lib/site-settings";

export type EventRegistrantRow = {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  phone: string;
  eventTitle: string;
  createdAt: string;
  status: string;
};

export function EventRegistrantsBoard({
  rows,
  settings,
}: {
  rows: EventRegistrantRow[];
  settings: SiteSettings;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return rows;
    return rows.filter((row) =>
      `${row.firstName} ${row.lastName} ${row.dni} ${row.email} ${row.phone} ${row.eventTitle}`
        .toLowerCase()
        .includes(value),
    );
  }, [query, rows]);

  function exportRows() {
    const header = ["Fecha", "Nombres", "Apellidos", "DNI", "Email", "Celular", "Encuentro", "Estado"];
    const lines = [
      header.join(";"),
      ...filtered.map((row) =>
        [
          formatDateTime(row.createdAt),
          row.firstName,
          row.lastName,
          row.dni,
          row.email,
          row.phone,
          row.eventTitle,
          row.status,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(";"),
      ),
    ];
    const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "usuarios-inscriptos-encuentros.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function whatsappHref(row: EventRegistrantRow) {
    const phone = row.phone || settings.whatsappNumber;
    return whatsappUrl(
      phone,
      applyTemplate(settings.messageEventRegistration, {
        nombres: row.firstName,
        apellidos: row.lastName,
        encuentro: row.eventTitle,
        celular: row.phone,
        numeroPlataforma: settings.whatsappNumber,
      }),
    );
  }

  function sendAllWhatsApp() {
    const links = filtered.map(whatsappHref).filter(Boolean);
    if (links.length === 0) {
      window.alert("No hay celulares para contactar.");
      return;
    }
    links.forEach((href, index) => {
      window.setTimeout(() => window.open(href, "_blank", "noopener,noreferrer"), index * 400);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <ClipboardList size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">
            Usuarios inscriptos encuentros
          </h1>
          <p className="mt-2 text-sm text-primary/80">
            Listado, exportación y gestión de inscripciones a encuentros.
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
            placeholder="Buscar por nombre, apellido, DNI, email, encuentro..."
            className="w-full rounded-full border border-[#d7e6d3] bg-white py-3 pr-4 pl-11 text-sm outline-none focus:border-[#4f7a58]"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={sendAllWhatsApp}
            className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] bg-white px-4 py-2.5 text-[11px] tracking-[0.16em] text-[#2d4739] uppercase"
          >
            <WhatsAppIcon size={14} />
            Enviar WhatsApp a todos
          </button>
          <button
            type="button"
            onClick={exportRows}
            className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] bg-white px-4 py-2.5 text-[11px] tracking-[0.16em] text-[#2d4739] uppercase"
          >
            <FileDown size={14} />
            Exportar
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-[#d7e6d3] bg-white">
          <p className="text-sm text-muted-foreground italic">
            Todavía no hay usuarios inscriptos.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-[#d7e6d3] bg-white shadow-sm shadow-primary/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e3eee0] bg-[#f7faf5] text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">
                  <th className="px-4 py-4 font-medium">Fecha</th>
                  <th className="px-4 py-4 font-medium">Nombres</th>
                  <th className="px-4 py-4 font-medium">Apellidos</th>
                  <th className="px-4 py-4 font-medium">DNI</th>
                  <th className="px-4 py-4 font-medium">Email</th>
                  <th className="px-4 py-4 font-medium">Encuentro</th>
                  <th className="px-4 py-4 font-medium">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const href = whatsappHref(row);
                  return (
                    <tr key={row.id} className="border-b border-[#f0f5ee]">
                      <td className="px-4 py-4 text-muted-foreground">{formatDateTime(row.createdAt)}</td>
                      <td className="px-4 py-4 font-medium text-primary">{row.firstName || "—"}</td>
                      <td className="px-4 py-4 text-primary">{row.lastName || "—"}</td>
                      <td className="px-4 py-4 text-muted-foreground">{row.dni || "—"}</td>
                      <td className="px-4 py-4 text-muted-foreground">{row.email}</td>
                      <td className="px-4 py-4 text-primary">{row.eventTitle}</td>
                      <td className="px-4 py-4">
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-full p-2 text-[#2d4739] hover:bg-[#e8f3e3]"
                            aria-label="WhatsApp"
                          >
                            <WhatsAppIcon size={16} />
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
      )}
    </div>
  );
}
