"use client";

import { useRef, useState } from "react";
import { CalendarDays, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import {
  addCarouselSlideAction,
  createEventAction,
  deleteCarouselSlideAction,
  deleteEventAction,
  toggleCarouselSlideAction,
} from "@/app/panel/actions";
import { fieldClass } from "@/components/panel/ui";
import { formatDate } from "@/lib/panel-format";
import {
  isEventJoinOpen,
  type CarouselSlide,
  type PanelEvent,
} from "@/lib/panel-data";

export function EventsBoard({
  events,
  slides,
}: {
  events: PanelEvent[];
  slides: CarouselSlide[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const published = events.filter((event) => event.status !== "cancelled");

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <CalendarDays size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">
            Configuración encuentros y seminarios
          </h1>
          <p className="mt-2 text-sm text-primary/80">
            Carrusel y fichas de encuentros/seminarios visibles en la landing.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm shadow-primary/5 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl text-primary uppercase">Carrusel de la landing</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fotos JPG que rotan en la sección Encuentros (máx. 1,5 MB c/u).
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full bg-[#4f7a58] px-4 py-2.5 text-[11px] tracking-[0.16em] text-white uppercase hover:bg-primary"
          >
            <Plus size={14} />
            Agregar foto
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,.jpg,.jpeg"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              const formData = new FormData();
              formData.set("image", file);
              setError("");
              const result = await addCarouselSlideAction(formData);
              if (result?.error) setError(result.error);
            }}
          />
        </div>
        {error ? <p className="mt-4 text-sm text-[#7a3a34]">{error}</p> : null}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Todavía no hay fotos en el carrusel.</p>
          ) : (
            slides.map((slide) => (
              <article key={slide.id} className="overflow-hidden rounded-2xl border border-[#d7e6d3] bg-[#f7faf5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.imageUrl} alt="" className="h-48 w-full object-cover" />
                <div className="flex items-center gap-2 p-3">
                  <form
                    action={async (formData) => {
                      await toggleCarouselSlideAction(formData);
                    }}
                    className="flex-1"
                  >
                    <input type="hidden" name="id" value={slide.id} />
                    <input type="hidden" name="visible" value={slide.visible ? "false" : "true"} />
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#d7e6d3] bg-white px-3 py-2 text-[11px] tracking-[0.14em] text-primary uppercase"
                    >
                      {slide.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      {slide.visible ? "Visible" : "Oculta"}
                    </button>
                  </form>
                  <form
                    action={async (formData) => {
                      if (!window.confirm("¿Eliminar esta foto?")) return;
                      await deleteCarouselSlideAction(formData);
                    }}
                  >
                    <input type="hidden" name="id" value={slide.id} />
                    <button
                      type="submit"
                      className="rounded-xl border border-[#f0d6d3] bg-white p-2 text-[#7a3a34]"
                      aria-label="Eliminar foto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm shadow-primary/5 md:p-8">
        <h2 className="font-heading text-2xl text-primary uppercase">Agregar encuentro / seminario</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Título, fecha, fecha límite de inscripción, foto de portada JPG y descripción.
        </p>
        <form
          ref={formRef}
          className="mt-6 space-y-4"
          action={async (formData) => {
            setPending(true);
            setError("");
            const result = await createEventAction(formData);
            setPending(false);
            if (result?.error) {
              setError(result.error);
              return;
            }
            formRef.current?.reset();
          }}
        >
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Título</span>
            <input required name="title" className={fieldClass} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Fecha</span>
              <input required type="date" name="startsAt" className={fieldClass} />
            </label>
            <label className="block space-y-2">
              <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">
                Fecha límite de inscripción
              </span>
              <input type="date" name="registrationDeadline" className={fieldClass} />
              <p className="text-xs text-muted-foreground">
                El botón Unirme se deshabilita al día siguiente de esta fecha.
              </p>
            </label>
          </div>
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Foto de portada (JPG)</span>
            <input type="file" name="cover" accept="image/jpeg,.jpg,.jpeg" className="text-sm" />
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] tracking-[0.2em] text-[#6f8a74] uppercase">Descripción</span>
            <textarea name="description" rows={5} className={`${fieldClass} resize-y`} />
          </label>
          {error ? <p className="text-sm text-[#7a3a34]">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-[#4f7a58] px-6 py-3 text-xs tracking-[0.16em] text-white uppercase hover:bg-primary disabled:opacity-70"
          >
            {pending ? "Guardando..." : "Guardar encuentro"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm shadow-primary/5 md:p-8">
        <h2 className="font-heading text-2xl text-primary uppercase">Publicados ({published.length})</h2>
        <div className="mt-6 space-y-4">
          {published.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Todavía no hay encuentros cargados.</p>
          ) : (
            published.map((event) => (
              <article
                key={event.id}
                className="overflow-hidden rounded-2xl border border-[#e3eee0] bg-[#f7faf5]"
              >
                {event.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.coverImageUrl} alt="" className="h-48 w-full object-cover" />
                ) : null}
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-2xl text-primary">{event.title}</h3>
                      <p className="mt-2 text-sm text-[#4f7a58]">
                        {formatDate(event.startsAt)}
                        {event.registrationDeadline
                          ? ` · Inscripción hasta ${formatDate(event.registrationDeadline)}`
                          : ""}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                      <p className="mt-2 text-xs text-[#6f8a74]">
                        {isEventJoinOpen(event.registrationDeadline)
                          ? "Unirme habilitado"
                          : "Unirme deshabilitado"}
                      </p>
                    </div>
                    <form
                      action={async (formData) => {
                        if (!window.confirm(`¿Eliminar ${event.title}?`)) return;
                        await deleteEventAction(formData);
                      }}
                    >
                      <input type="hidden" name="id" value={event.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-[#f0d6d3] bg-white p-2 text-[#7a3a34]"
                        aria-label="Eliminar encuentro"
                      >
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
