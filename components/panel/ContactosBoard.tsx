"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, History, MessageSquare, Search, Trash2 } from "lucide-react";
import { deleteContactInquiryAction, markContactInquiryRespondedAction } from "@/app/panel/actions";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { formatDateTime } from "@/lib/panel-format";
import type { PanelContactInquiry } from "@/lib/panel-data";
import { whatsappUrl } from "@/lib/site-settings";

export function ContactosBoard({
  inquiries,
  variant = "inbox",
}: {
  inquiries: PanelContactInquiry[];
  variant?: "inbox" | "history";
}) {
  const [query, setQuery] = useState("");
  const isHistory = variant === "history";

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return inquiries;
    return inquiries.filter((item) =>
      `${item.firstName} ${item.lastName} ${item.email} ${item.phone} ${item.message}`
        .toLowerCase()
        .includes(value),
    );
  }, [inquiries, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          {isHistory ? <History size={26} /> : <MessageSquare size={26} />}
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">
            {isHistory ? "Historial Consultas" : "Consultas Contactos"}
          </h1>
          <p className="mt-2 text-sm text-primary/80">
            {isHistory
              ? "Consultas de Contacto que ya fueron respondidas."
              : "Consultas pendientes del formulario de Contacto."}
          </p>
        </div>
      </div>

      <label className="relative block">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#6f8a74]"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre, mail, celular o mensaje..."
          className="w-full rounded-full border border-[#d7e6d3] bg-white py-3 pr-4 pl-11 text-sm outline-none focus:border-[#4f7a58]"
        />
      </label>

      <div className="overflow-hidden rounded-3xl border border-[#d7e6d3] bg-white shadow-sm shadow-primary/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e3eee0] bg-[#f7faf5] text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">
                <th className="px-4 py-4 font-medium">Nombre</th>
                <th className="px-4 py-4 font-medium">Apellido</th>
                <th className="px-4 py-4 font-medium">Celular</th>
                <th className="px-4 py-4 font-medium">Mail</th>
                <th className="px-4 py-4 font-medium">Mensaje</th>
                <th className="px-4 py-4 font-medium">Estado</th>
                <th className="px-4 py-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground italic">
                    {isHistory
                      ? "Todavía no hay consultas respondidas."
                      : "Todavía no hay consultas pendientes."}
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const wa = item.phone
                    ? whatsappUrl(
                        item.phone,
                        `Hola ${item.firstName}, te escribimos desde Código Semilla por tu consulta.`,
                      )
                    : "";
                  const responded = item.status === "responded";
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-[#f0f5ee] ${index % 2 === 1 ? "bg-[#f7faf5]" : "bg-white"}`}
                    >
                      <td className="px-4 py-4 font-medium text-primary">{item.firstName || "—"}</td>
                      <td className="px-4 py-4 text-primary">{item.lastName || "—"}</td>
                      <td className="px-4 py-4 text-muted-foreground">{item.phone || "—"}</td>
                      <td className="px-4 py-4 text-muted-foreground">{item.email || "—"}</td>
                      <td className="max-w-xs px-4 py-4 text-muted-foreground" title={item.message}>
                        <span className="line-clamp-2">{item.message || "—"}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] tracking-[0.12em] uppercase ${
                            responded
                              ? "bg-[#e8f3e3] text-[#2d4739]"
                              : "bg-[#f4e4d4] text-[#8a4b1f]"
                          }`}
                        >
                          {responded ? "Respondido" : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          {wa ? (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full p-2 text-[#25D366] hover:bg-[#e8f3e3]"
                              aria-label="Responder por WhatsApp"
                              title="WhatsApp"
                            >
                              <WhatsAppIcon size={16} />
                            </a>
                          ) : (
                            <span className="rounded-full p-2 text-[#c5d0c4]" title="Sin celular">
                              <WhatsAppIcon size={16} />
                            </span>
                          )}
                          <form
                            action={async (formData) => {
                              await markContactInquiryRespondedAction(formData);
                            }}
                          >
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              disabled={responded}
                              className="rounded-full p-2 text-[#4f7a58] hover:bg-[#e8f3e3] disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Marcar respondido"
                              title="Respondido"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          </form>
                          <form
                            action={async (formData) => {
                              if (!window.confirm(`¿Eliminar la consulta de ${item.firstName} ${item.lastName}?`)) {
                                return;
                              }
                              await deleteContactInquiryAction(formData);
                            }}
                          >
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              className="rounded-full p-2 text-[#7a3a34] hover:bg-[#f8e6e4]"
                              aria-label="Eliminar"
                              title="Borrar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </form>
                        </div>
                        <p className="mt-1 text-[10px] text-[#8a9a86]">{formatDateTime(item.createdAt)}</p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
