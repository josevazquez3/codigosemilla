"use client";

import { useMemo, useRef, useState } from "react";
import {
  ClipboardList,
  FileDown,
  FileUp,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createPadronEntryAction,
  deletePadronEntryAction,
  importPadronAction,
  updatePadronEntryAction,
} from "@/app/panel/actions";
import { PadronPersonModal } from "@/components/panel/PadronPersonModal";
import { formatBirthDate } from "@/lib/panel-format";
import { parsePadronCsv, padronToCsv } from "@/lib/padron-csv";
import type { PanelPadronPerson } from "@/lib/panel-data";

export function PadronBoard({ people }: { people: PanelPadronPerson[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [drawer, setDrawer] = useState<"create" | PanelPadronPerson | null>(null);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return people;
    return people.filter((person) =>
      `${person.firstName} ${person.lastName} ${person.dni} ${person.email}`
        .toLowerCase()
        .includes(value),
    );
  }, [people, query]);

  const allVisibleSelected = filtered.length > 0 && filtered.every((item) => selected[item.id]);

  function exportRows() {
    const rows = filtered.filter((item) => selected[item.id]);
    const data = rows.length > 0 ? rows : filtered;
    const blob = new Blob([padronToCsv(data)], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "padron-usuarios.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <ClipboardList size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">
            Padrón usuarios
          </h1>
          <p className="mt-2 text-sm text-primary/80">Listado general y padrón de usuarios.</p>
        </div>
      </div>

      <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm shadow-primary/5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-primary">
            <Users size={16} />
            <h2 className="font-heading text-xl uppercase">Padrón de usuarios</h2>
          </div>
          <p className="text-xs tracking-[0.16em] text-[#6f8a74] uppercase">
            {people.length} registros
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#6f8a74]"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, documento, email..."
              className="w-full rounded-full border border-[#d7e6d3] bg-white py-3 pr-4 pl-11 text-sm outline-none focus:border-[#4f7a58]"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDrawer("create")}
              className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] px-4 py-2.5 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
            >
              <Plus size={14} />
              Carga manual
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] px-4 py-2.5 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
            >
              <FileUp size={14} />
              Importar Excel
            </button>
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
              onClick={exportRows}
              className="inline-flex items-center gap-2 rounded-full border border-[#4f7a58] px-4 py-2.5 text-[11px] tracking-[0.14em] text-[#2d4739] uppercase"
            >
              <FileDown size={14} />
              Exportar
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv,.txt"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              const text = await file.text();
              const rows = parsePadronCsv(text);
              if (rows.length === 0) {
                window.alert("No se encontraron filas. Usá un CSV exportado desde Excel.");
                return;
              }
              const formData = new FormData();
              formData.set("csv", JSON.stringify(rows));
              const result = await importPadronAction(formData);
              if (result?.error) window.alert(result.error);
              else window.alert(`Se importaron ${result?.created ?? rows.length} registros.`);
            }}
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e3eee0] bg-[#f7faf5] text-[11px] tracking-[0.14em] text-[#6f8a74] uppercase">
                <th className="px-3 py-3 font-medium">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={(event) => {
                      const next = event.target.checked;
                      setSelected((current) => {
                        const copy = { ...current };
                        for (const item of filtered) copy[item.id] = next;
                        return copy;
                      });
                    }}
                    className="h-4 w-4 accent-[#4f7a58]"
                    aria-label="Seleccionar visibles"
                  />
                </th>
                <th className="px-3 py-3 font-medium">Nombres</th>
                <th className="px-3 py-3 font-medium">Apellidos</th>
                <th className="px-3 py-3 font-medium">DNI o pasaporte</th>
                <th className="px-3 py-3 font-medium">Fecha de nacimiento</th>
                <th className="px-3 py-3 font-medium">Correo electrónico</th>
                <th className="px-3 py-3 font-medium">Nº de celular</th>
                <th className="px-3 py-3 font-medium">Lugar de residencia</th>
                <th className="px-3 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((person, index) => (
                <tr
                  key={person.id}
                  className={`border-b border-[#f0f5ee] ${
                    selected[person.id] ? "bg-[#eaf3fb]" : index % 2 === 1 ? "bg-[#f7faf5]" : "bg-white"
                  }`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={Boolean(selected[person.id])}
                      onChange={(event) =>
                        setSelected((current) => ({ ...current, [person.id]: event.target.checked }))
                      }
                      className="h-4 w-4 accent-[#4f7a58]"
                    />
                  </td>
                  <td className="px-3 py-3 font-medium text-primary">{person.firstName || "—"}</td>
                  <td className="px-3 py-3 text-primary">{person.lastName || "—"}</td>
                  <td className="px-3 py-3 text-muted-foreground">{person.dni || "—"}</td>
                  <td className="px-3 py-3 text-muted-foreground">{formatBirthDate(person.birthDate)}</td>
                  <td className="px-3 py-3 text-muted-foreground">{person.email || "—"}</td>
                  <td className="px-3 py-3 text-muted-foreground">{person.phone || "—"}</td>
                  <td className="px-3 py-3 text-muted-foreground">{person.residence || "—"}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setDrawer(person)}
                        className="rounded-full p-2 text-[#2d4739] hover:bg-[#e8f3e3]"
                        aria-label="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <form
                        action={async (formData) => {
                          if (!window.confirm(`¿Eliminar a ${person.firstName} ${person.lastName}?`)) return;
                          await deletePadronEntryAction(formData);
                        }}
                      >
                        <input type="hidden" name="id" value={person.id} />
                        <button
                          type="submit"
                          className="rounded-full p-2 text-[#2d4739] hover:bg-[#e8f3e3]"
                          aria-label="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {drawer ? (
        <PadronPersonModal
          title={drawer === "create" ? "Carga manual" : "Editar registro"}
          person={drawer === "create" ? null : drawer}
          onClose={() => setDrawer(null)}
          action={drawer === "create" ? createPadronEntryAction : updatePadronEntryAction}
        />
      ) : null}
    </div>
  );
}
