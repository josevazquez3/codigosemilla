"use client";

import { useMemo, useState } from "react";
import { IdCard, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { updatePadronEntryAction } from "@/app/panel/actions";
import { PadronPersonModal } from "@/components/panel/PadronPersonModal";
import type { PanelPadronPerson } from "@/lib/panel-data";

export function FichasBoard({ people }: { people: PanelPadronPerson[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<PanelPadronPerson | null>(null);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return people;
    return people.filter((person) =>
      `${person.firstName} ${person.lastName} ${person.dni}`.toLowerCase().includes(value),
    );
  }, [people, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <IdCard size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">
            Ficha de usuarios
          </h1>
          <p className="mt-2 text-sm text-primary/80">Ficha detallada y datos de cada usuario.</p>
        </div>
      </div>

      <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm shadow-primary/5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl text-primary uppercase">Ficha de usuarios</h2>
          <p className="text-xs tracking-[0.16em] text-[#6f8a74] uppercase">
            {people.length} registros
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#6f8a74]"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre o DNI..."
              className="w-full rounded-full border border-[#d7e6d3] bg-white py-3 pr-4 pl-11 text-sm outline-none focus:border-[#4f7a58]"
            />
          </label>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] px-4 py-2.5 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
          >
            <RefreshCw size={14} />
            Actualizar
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e3eee0] bg-[#f7faf5] text-[11px] tracking-[0.14em] text-[#6f8a74] uppercase">
                <th className="px-4 py-3 font-medium">Nombres</th>
                <th className="px-4 py-3 font-medium">Apellidos</th>
                <th className="px-4 py-3 font-medium">DNI o pasaporte</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((person, index) => (
                <tr
                  key={person.id}
                  className={`border-b border-[#f0f5ee] ${
                    open?.id === person.id ? "bg-[#eaf3fb]" : index % 2 === 1 ? "bg-[#f7faf5]" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-primary">{person.firstName || "—"}</td>
                  <td className="px-4 py-3 text-primary">{person.lastName || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{person.dni || "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setOpen(person)}
                      className="inline-flex items-center gap-2 text-[11px] tracking-[0.16em] text-[#2d4739] uppercase hover:underline"
                    >
                      <IdCard size={14} />
                      Ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {open ? (
        <PadronPersonModal
          title="Ficha de cliente"
          person={open}
          onClose={() => setOpen(null)}
          action={updatePadronEntryAction}
        />
      ) : null}
    </div>
  );
}
