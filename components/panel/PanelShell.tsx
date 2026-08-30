"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { ActivityTracker } from "@/components/panel/ActivityTracker";
import { Sidebar } from "@/components/panel/Sidebar";
import type { SessionUser } from "@/lib/session";

export function PanelShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-full bg-[linear-gradient(180deg,#f4f8f2_0%,#f9f7f2_42%,#ffffff_100%)]">
      <ActivityTracker />
      <Sidebar
        user={user}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 px-4 py-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-full border border-[#d7e6d3] bg-white p-2 text-primary shadow-sm"
            aria-label="Abrir menú"
          >
            <Menu size={18} />
          </button>
          <p className="text-[11px] tracking-[0.22em] text-primary uppercase">
            Panel de membresía
          </p>
        </header>
        <main className="flex-1 px-4 py-8 md:px-10 md:py-12">{children}</main>
      </div>
    </div>
  );
}
