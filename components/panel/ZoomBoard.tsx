"use client";

import { useState } from "react";
import { ExternalLink, Monitor, Pencil, Plus, Trash2, Video } from "lucide-react";
import {
  createZoomMeetingAction,
  deleteZoomMeetingAction,
  updateZoomMeetingAction,
} from "@/app/panel/actions";
import { ZoomMeetingModal } from "@/components/panel/ZoomMeetingModal";
import type { PanelZoomMeeting } from "@/lib/panel-data";

export function ZoomBoard({ meetings }: { meetings: PanelZoomMeeting[] }) {
  const [drawer, setDrawer] = useState<"create" | PanelZoomMeeting | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
            <Monitor size={26} />
          </div>
          <div>
            <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">
              Ingresar al Zoom
            </h1>
            <p className="mt-2 text-sm text-primary/80">
              Enlaces y datos para unirte a las videollamadas en vivo.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDrawer("create")}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#2d4739] px-5 py-3 text-[11px] tracking-[0.14em] text-white uppercase hover:bg-[#243a2f]"
        >
          <Plus size={16} />
          Agregar reunión
        </button>
      </div>

      <section className="rounded-3xl border border-[#d7e6d3] bg-[#f9f7f2] p-6 md:p-8">
        {meetings.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#6f8a74]">
            Todavía no hay reuniones. Agregá la primera con el botón de arriba.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {meetings.map((meeting) => (
              <article
                key={meeting.id}
                className="rounded-3xl border border-[#d7e6d3] bg-white p-5 shadow-sm shadow-primary/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
                    <Video size={20} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDrawer(meeting)}
                      className="rounded-full p-2 text-[#6f8a74] hover:bg-[#e8f3e3] hover:text-primary"
                      aria-label="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <form
                      action={async (formData) => {
                        if (!window.confirm(`¿Eliminar la reunión ${meeting.title}?`)) return;
                        await deleteZoomMeetingAction(formData);
                      }}
                    >
                      <input type="hidden" name="id" value={meeting.id} />
                      <button
                        type="submit"
                        className="rounded-full p-2 text-[#7a3a34] hover:bg-[#f8e6e4]"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </div>
                <h2 className="mt-4 font-heading text-2xl text-primary uppercase">{meeting.title}</h2>
                {meeting.meetingId ? (
                  <p className="mt-4">
                    <span className="block text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">
                      ID de reunión
                    </span>
                    <span className="mt-1 block text-sm text-primary">{meeting.meetingId}</span>
                  </p>
                ) : null}
                {meeting.passcode ? (
                  <p className="mt-3">
                    <span className="block text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">
                      Clave de acceso
                    </span>
                    <span className="mt-1 block text-sm text-primary">{meeting.passcode}</span>
                  </p>
                ) : null}
                {meeting.notes ? (
                  <p className="mt-3">
                    <span className="block text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">
                      Datos para ingresar
                    </span>
                    <span className="mt-1 block text-sm text-primary">{meeting.notes}</span>
                  </p>
                ) : null}
                <a
                  href={meeting.joinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2d4739] px-4 py-3 text-[11px] tracking-[0.14em] text-white uppercase hover:bg-[#243a2f]"
                >
                  <ExternalLink size={14} />
                  Ingresar al Zoom
                </a>
              </article>
            ))}
          </div>
        )}
      </section>

      {drawer ? (
        <ZoomMeetingModal
          title={drawer === "create" ? "Nueva reunión Zoom" : "Editar reunión Zoom"}
          meeting={drawer === "create" ? null : drawer}
          onClose={() => setDrawer(null)}
          action={drawer === "create" ? createZoomMeetingAction : updateZoomMeetingAction}
        />
      ) : null}
    </div>
  );
}
