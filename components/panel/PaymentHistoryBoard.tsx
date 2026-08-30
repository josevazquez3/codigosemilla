"use client";

import { useMemo, useState } from "react";
import { History, Search, UserRound, X } from "lucide-react";
import { formatBankMoney, formatExtractDate } from "@/lib/panel-format";
import { groupTransfersByClient, type TransferClientGroup } from "@/lib/bank-extract";
import type { PanelBankMovement, PanelPadronPerson } from "@/lib/panel-data";

export function PaymentHistoryBoard({
  movements,
  people,
}: {
  movements: PanelBankMovement[];
  people: PanelPadronPerson[];
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const clients = useMemo(() => groupTransfersByClient(movements, people), [movements, people]);
  const selected = clients.find((item) => item.key === selectedKey) ?? null;

  const filteredClients = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return clients;
    return clients.filter((item) => item.name.toLowerCase().includes(value));
  }, [clients, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3e3] text-[#4f7a58]">
          <History size={26} />
        </div>
        <div>
          <h1 className="font-heading text-4xl text-primary uppercase md:text-5xl">Historial de pago</h1>
          <p className="mt-2 text-sm text-primary/80">
            Historial de transferencias recibidas por cliente.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-[#d7e6d3] bg-white p-6 shadow-sm shadow-primary/5 md:p-8">
        <h2 className="font-heading text-xl text-primary uppercase">Historial de pago</h2>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setPickerOpen(true);
          }}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2d4739] px-5 py-2.5 text-[11px] tracking-[0.14em] text-white uppercase hover:bg-[#243a2f]"
        >
          <UserRound size={16} />
          Seleccionar cliente
        </button>

        <div className="mt-6 border-t border-[#e3eee0] pt-8">
          {!selected ? (
            <p className="py-10 text-center text-sm text-[#6f8a74]">
              Seleccioná un cliente para ver su historial de transferencias recibidas.
            </p>
          ) : (
            <ClientHistory client={selected} />
          )}
        </div>
      </section>

      {pickerOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-primary/35"
            onClick={() => setPickerOpen(false)}
          />
          <div className="relative flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-[#f9f7f2] shadow-2xl">
            <div className="flex items-start justify-between gap-4 px-6 pt-6">
              <h2 className="font-heading text-2xl text-primary uppercase">Seleccionar cliente</h2>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="text-[#6f8a74] hover:text-primary"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <label className="relative mx-6 mt-5">
              <Search
                size={16}
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#6f8a74]"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre y apellido..."
                className="w-full rounded-full border border-[#d7e6d3] bg-white py-3 pr-4 pl-11 text-sm outline-none focus:border-[#4f7a58]"
              />
            </label>
            <div className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
              {filteredClients.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-[#6f8a74]">
                  No hay clientes con transferencias recibidas.
                </p>
              ) : (
                filteredClients.map((client) => (
                  <button
                    key={client.key}
                    type="button"
                    onClick={() => {
                      setSelectedKey(client.key);
                      setPickerOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left hover:bg-[#e8f3e3]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d7e6d3] text-[#4f7a58]">
                      <UserRound size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-primary">{client.name}</span>
                      <span className="block text-xs text-[#6f8a74]">
                        {client.transfers.length}{" "}
                        {client.transfers.length === 1 ? "transferencia" : "transferencias"} •{" "}
                        {formatBankMoney(client.totalArs, "ARS")}
                        {client.totalUsd
                          ? ` · ${formatBankMoney(client.totalUsd, "USD")}`
                          : ""}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ClientHistory({ client }: { client: TransferClientGroup }) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">Cliente</p>
          <p className="mt-1 font-heading text-2xl text-primary">{client.name}</p>
        </div>
        <p className="text-sm text-primary">
          {client.transfers.length}{" "}
          {client.transfers.length === 1 ? "transferencia" : "transferencias"} •{" "}
          {formatBankMoney(client.totalArs, "ARS")}
          {client.totalUsd ? ` · ${formatBankMoney(client.totalUsd, "USD")}` : ""}
        </p>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#e3eee0] bg-[#f7faf5] text-[11px] tracking-[0.14em] text-[#6f8a74] uppercase">
              <th className="px-3 py-3 font-medium">Fecha</th>
              <th className="px-3 py-3 font-medium">Referencia</th>
              <th className="px-3 py-3 font-medium">Concepto</th>
              <th className="px-3 py-3 font-medium">Importe</th>
              <th className="px-3 py-3 font-medium">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {client.transfers.map((row, index) => (
              <tr
                key={row.id}
                className={`border-b border-[#f0f5ee] ${index % 2 === 1 ? "bg-[#f7faf5]" : "bg-white"}`}
              >
                <td className="px-3 py-3 whitespace-nowrap text-primary">
                  {formatExtractDate(row.occurredAt)}
                </td>
                <td className="px-3 py-3 text-muted-foreground">{row.reference || "—"}</td>
                <td className="px-3 py-3 text-primary" title={row.concept}>
                  {row.concept || "—"}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-[#4f7a58]">
                  {formatBankMoney(row.amountCents, row.currency)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-primary">
                  {formatBankMoney(row.balanceCents, row.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
