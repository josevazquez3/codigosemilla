"use client";

import { SearchBox } from "@/components/panel/SearchBox";
import { EmptyState, StatusBadge } from "@/components/panel/ui";
import { formatDate } from "@/lib/panel-format";
import type { PanelUser } from "@/lib/panel-data";

export function UsersDirectory({ users }: { users: PanelUser[] }) {
  return (
    <SearchBox
      items={users}
      placeholder="Buscar integrantes..."
      predicate={(user, query) =>
        `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(query)
      }
    >
      {(filtered) =>
        filtered.length === 0 ? (
          <EmptyState>No hay integrantes para mostrar.</EmptyState>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((user) => (
              <article
                key={user.id}
                className="rounded-2xl border border-[#e3eee0] bg-[#f7faf5] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-xl text-primary">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <StatusBadge value={user.role} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <StatusBadge value={user.status} />
                  <span className="text-xs text-[#6f8a74]">Alta {formatDate(user.createdAt)}</span>
                </div>
                {user.phone ? (
                  <p className="mt-2 text-sm text-muted-foreground">{user.phone}</p>
                ) : null}
              </article>
            ))}
          </div>
        )
      }
    </SearchBox>
  );
}
