"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  Banknote,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileSpreadsheet,
  History,
  Home,
  IdCard,
  Landmark,
  LogOut,
  BookOpen,
  Monitor,
  Receipt,
  Settings,
  Sparkles,
  Crown,
  Lock,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { navForRole, type PanelIcon } from "@/lib/panel-nav";
import type { SessionUser } from "@/lib/session";

const icons: Record<PanelIcon, typeof Home> = {
  home: Home,
  users: Users,
  audit: ClipboardList,
  settings: Settings,
  join: UserPlus,
  calendar: CalendarDays,
  enroll: CalendarDays,
  people: UsersRound,
  card: IdCard,
  treasury: Landmark,
  sheet: FileSpreadsheet,
  cash: Banknote,
  incoming: ArrowDownLeft,
  history: History,
  zoom: Monitor,
  receipt: Receipt,
  log: BookOpen,
  sparkles: Sparkles,
  crown: Crown,
  lock: Lock,
};

type SidebarProps = {
  user: SessionUser;
  mobileOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ user, mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const items = useMemo(() => navForRole(user.role), [user.role]);
  const initialOpen = useMemo(() => {
    const open: Record<string, boolean> = {};
    for (const item of items) {
      if (item.children?.some((child) => pathname.startsWith(child.href))) {
        open[item.label] = true;
      }
    }
    return open;
  }, [items, pathname]);

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(initialOpen);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-primary/40 backdrop-blur-[2px] lg:hidden ${
          mobileOpen ? "block" : "hidden"
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-primary text-primary-foreground shadow-2xl shadow-primary/20 transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-6 py-6">
          <Link href="/panel" onClick={onClose} className="flex flex-col items-center text-white">
            <Logo compact />
            <p className="mt-3 text-[11px] tracking-[0.28em] text-white/80 uppercase">
              Conciencia Estelar
            </p>
          </Link>
        </div>

        <div className="border-b border-white/10 px-6 py-5">
          <p className="font-heading text-lg capitalize">{user.name}</p>
          <p className="truncate text-xs text-white/70">{user.email}</p>
          <span className="mt-3 inline-flex rounded-full bg-[#dcecc8] px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-primary uppercase">
            {user.role}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {items.map((item, index) => {
            const Icon = icons[item.icon];
            const isHome = item.href === "/panel";
            const active = item.href
              ? isHome
                ? pathname === "/panel"
                : pathname === item.href
              : Boolean(item.children?.some((child) => pathname.startsWith(child.href)));
            const expanded = Boolean(openMenus[item.label]);

            return (
              <div key={item.label} className={index === 1 ? "mt-6" : ""}>
                {index === 1 ? (
                  <p className="mb-2 px-3 text-[10px] tracking-[0.28em] text-[#cfe0c0] uppercase">
                    Módulos
                  </p>
                ) : null}

                {item.children ? (
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenus((current) => ({
                          ...current,
                          [item.label]: !current[item.label],
                        }))
                      }
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        active
                          ? "bg-[#dcecc8]/20 text-white"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon size={16} />
                      <span className="flex-1 leading-snug">{item.label}</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {expanded ? (
                      <div className="mt-1 mb-2 ml-6 space-y-1 border-l border-white/15 pl-3">
                        {item.children.map((child) => {
                          const childActive = pathname === child.href;
                          const ChildIcon = child.icon ? icons[child.icon] : null;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={onClose}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                                childActive
                                  ? "bg-[#dcecc8]/25 text-white"
                                  : "text-white/70 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {ChildIcon ? <ChildIcon size={14} /> : null}
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Link
                    href={item.href ?? "/panel"}
                    onClick={onClose}
                    className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-[#dcecc8]/25 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="leading-snug">{item.label}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-70"
          >
            <LogOut size={16} />
            {loggingOut ? "Saliendo..." : "Cerrar sesión"}
          </button>
        </div>
      </aside>
    </>
  );
}
