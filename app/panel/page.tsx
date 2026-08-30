import Link from "next/link";
import {
  ArrowDownLeft,
  Banknote,
  CalendarDays,
  ClipboardList,
  FileSpreadsheet,
  History,
  IdCard,
  BookOpen,
  Landmark,
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
import { getSessionUser } from "@/lib/auth";
import { getPanelStats, getSettings } from "@/lib/panel-data";
import { cardsForRole, type PanelIcon } from "@/lib/panel-nav";

const icons: Record<Exclude<PanelIcon, "home">, typeof Users> = {
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

export default async function PanelHomePage() {
  const [user, settings, stats] = await Promise.all([
    getSessionUser(),
    getSettings(),
    getPanelStats(),
  ]);
  const name = user?.name ?? "integrante";
  const isAdmin = user?.role === "Admin";
  const cards = cardsForRole(user?.role ?? "Usuario");

  const summary = [
    { label: "Integrantes activos", value: stats.members },
    { label: "Encuentros abiertos", value: stats.openEvents },
    { label: "Solicitudes pendientes", value: stats.pendingApplications },
    { label: "Cuotas pendientes", value: stats.pendingDues },
  ];

  return (
    <section className="mx-auto max-w-6xl">
      <p className="text-[11px] tracking-[0.28em] text-[#6f8a74] uppercase">
        Panel de membresía · {settings.spaceName}
      </p>
      <h1 className="mt-3 font-heading text-4xl text-primary uppercase md:text-5xl">
        Bienvenido/a, {name}
      </h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground italic">
        {settings.welcomeText}
      </p>

      {isAdmin ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summary.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#d7e6d3] bg-white px-5 py-4 shadow-sm shadow-primary/5"
            >
              <p className="text-3xl font-heading text-primary">{item.value}</p>
              <p className="mt-1 text-[11px] tracking-[0.16em] text-[#6f8a74] uppercase">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = icons[card.icon as Exclude<PanelIcon, "home">] ?? Users;
          const isJoin = card.href === "/panel/quiero-unirme";
          const pending = isJoin ? stats.pendingApplicants : [];
          const hasPending = pending.length > 0;
          return (
            <Link
              key={card.href + card.label}
              href={card.href}
              className={`group rounded-3xl border p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
                hasPending
                  ? "border-[#ead56a] bg-[#fff4b0] shadow-[#c4a35a]/15 hover:border-[#d4bc3a] hover:shadow-[#c4a35a]/25"
                  : "border-[#d7e6d3] bg-white shadow-primary/5 hover:border-[#b7d0b4] hover:shadow-primary/10"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  hasPending ? "bg-[#f3e27a] text-[#6b5a12]" : "bg-[#e8f3e3] text-[#4f7a58]"
                }`}
              >
                <Icon size={22} />
              </div>
              {card.category ? (
                <p className="mt-5 text-[10px] tracking-[0.22em] text-[#7a9480] uppercase">
                  {card.category}
                </p>
              ) : null}
              <h2 className="mt-2 font-heading text-2xl text-primary uppercase">
                {card.label}
              </h2>
              {hasPending ? (
                <div className="mt-3">
                  <p className="text-sm font-medium text-[#6b5a12]">
                    {pending.length} {pending.length === 1 ? "solicitud pendiente" : "solicitudes pendientes"}
                  </p>
                  <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-sm leading-relaxed text-primary">
                    {pending.map((item) => (
                      <li key={item.id}>{applicantName(item)}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-3 min-h-[3.2rem] text-sm leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
              )}
              <p
                className={`mt-6 text-sm tracking-[0.2em] uppercase transition-colors group-hover:text-primary ${
                  hasPending ? "text-[#6b5a12]" : "text-[#4f7a58]"
                }`}
              >
                Acceder →
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function applicantName(item: { firstName: string; lastName: string; name: string }) {
  const full = `${item.firstName} ${item.lastName}`.trim();
  return full || item.name || "Sin nombre";
}
