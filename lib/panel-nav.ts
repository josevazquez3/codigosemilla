export type PanelIcon =
  | "home"
  | "users"
  | "audit"
  | "settings"
  | "join"
  | "calendar"
  | "enroll"
  | "people"
  | "card"
  | "treasury"
  | "sheet"
  | "cash"
  | "incoming"
  | "history"
  | "zoom"
  | "receipt"
  | "log"
  | "sparkles"
  | "crown"
  | "lock";

export type PanelLink = {
  href: string;
  label: string;
  description: string;
  icon?: PanelIcon;
};

export type PanelNavItem = {
  href?: string;
  label: string;
  description: string;
  icon: PanelIcon;
  children?: PanelLink[];
};

export const panelNav: PanelNavItem[] = [
  {
    href: "/panel",
    label: "Inicio",
    icon: "home",
    description: "Resumen de tu espacio de membresía.",
  },
  {
    href: "/panel/gestion-usuarios",
    label: "Gestión Usuarios",
    icon: "users",
    description: "Administrá altas, estados y datos de las personas de la red.",
  },
  {
    label: "Usuarios",
    icon: "people",
    description: "Padrón general y ficha detallada de cada persona.",
    children: [
      {
        href: "/panel/usuarios",
        label: "Padrón Usuarios",
        description: "Listado general y padrón de usuarios.",
        icon: "audit",
      },
      {
        href: "/panel/usuarios/fichas",
        label: "Ficha de Usuarios",
        description: "Ficha detallada y datos de cada usuario.",
        icon: "card",
      },
    ],
  },
  {
    href: "/panel/auditoria",
    label: "Auditoría",
    icon: "audit",
    description: "Registro de accesos, módulos visitados y videos abiertos por usuario.",
  },
  {
    href: "/panel/configuracion",
    label: "Configuración",
    icon: "settings",
    description: "Ajustá preferencias generales del espacio.",
  },
  {
    href: "/panel/zoom",
    label: "Ingresar al Zoom",
    icon: "zoom",
    description: "Enlaces y datos para unirte a las videollamadas en vivo.",
  },
  {
    href: "/panel/bitacora",
    label: "Bitácora",
    icon: "log",
    description: "Registro de enlaces y documentos de Drive.",
  },
  {
    href: "/panel/activaciones",
    label: "Activaciones",
    icon: "sparkles",
    description: "Biblioteca de activaciones y grabaciones.",
  },
  {
    href: "/panel/sala-especial",
    label: "Sala Especial",
    icon: "crown",
    description: "Biblioteca de sala especial y grabaciones.",
  },
  {
    href: "/panel/permisos-sala-especial",
    label: "Permisos Sala Especial",
    icon: "lock",
    description: "Habilitá videos de Activaciones a Usuarios Membresía, por padrón.",
  },
  {
    href: "/panel/quiero-unirme",
    label: "Quiero unirme",
    icon: "join",
    description: "Solicitudes de ingreso y seguimiento de nuevos integrantes.",
  },
  {
    href: "/panel/encuentros-seminarios",
    label: "Configuración Encuentros y Seminarios",
    icon: "calendar",
    description: "Organizá fechas, cupos y materiales de cada encuentro.",
  },
  {
    label: "Inscripción Encuentros",
    icon: "enroll",
    description: "Vista previa de encuentros y seminarios, y reserva de inscripción.",
    children: [
      {
        href: "/panel/inscripcion-encuentros",
        label: "Inscripción Encuentros",
        description: "Vista previa de encuentros y seminarios, y reserva de inscripción.",
        icon: "enroll",
      },
      {
        href: "/panel/inscripcion-encuentros/inscriptos",
        label: "Usuarios Inscriptos Encuentros",
        description: "Listado, exportación y gestión de inscripciones a encuentros.",
        icon: "audit",
      },
    ],
  },
  {
    label: "Tesorería",
    icon: "treasury",
    description: "Extracto, pagos, transferencias e historial económico.",
    children: [
      {
        href: "/panel/tesoreria",
        label: "Extracto Banco",
        description: "Gestión e importación de movimientos bancarios.",
        icon: "sheet",
      },
      {
        href: "/panel/tesoreria/pagos-manual",
        label: "Ingresar Pagos manual",
        description: "Registro manual de pagos de clientes del padrón.",
        icon: "cash",
      },
      {
        href: "/panel/tesoreria/adjuntar-pago",
        label: "Adjuntar Pago",
        description: "Subí tu comprobante de transferencia en PDF o JPG.",
        icon: "receipt",
      },
      {
        href: "/panel/tesoreria/transferencias",
        label: "Transferencias recibidas",
        description: "Transferencias recibidas con importe positivo del extracto bancario.",
        icon: "incoming",
      },
      {
        href: "/panel/tesoreria/historial",
        label: "Historial de pago",
        description: "Historial de transferencias recibidas por cliente.",
        icon: "history",
      },
      {
        href: "/panel/tesoreria/pagos-mes",
        label: "Pagos del Mes",
        description: "Control mensual de pagos cruzando padrón de clientes y transferencias.",
        icon: "calendar",
      },
    ],
  },
];

export const panelCards = panelNav
  .filter((item) => item.href !== "/panel")
  .map((item) => ({
    href: item.href ?? item.children?.[0]?.href ?? "/panel",
    label: item.label,
    description: item.description,
    icon: item.icon,
    category: item.children ? item.label : undefined,
  }));

export type PanelRole = "Admin" | "Usuario" | "Usuario Membresía";

const usuarioPaths = [
  "/panel",
  "/panel/zoom",
  "/panel/bitacora",
  "/panel/activaciones",
  "/panel/inscripcion-encuentros",
  "/panel/tesoreria/adjuntar-pago",
];

const membresiaPaths = [
  ...usuarioPaths,
  "/panel/bitacora",
  "/panel/activaciones",
  "/panel/sala-especial",
];

function pathMatches(path: string, prefix: string) {
  if (prefix === "/panel") return path === "/panel";
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function isAdminRole(role?: string | null) {
  return role === "Admin";
}

export function canAccessPath(role: PanelRole, path: string) {
  if (isAdminRole(role)) return true;
  if (path.startsWith("/panel/inscripcion-encuentros/inscriptos")) return false;
  if (pathMatches(path, "/panel/sala-especial")) return role === "Usuario Membresía";
  const allowed = role === "Usuario Membresía" ? membresiaPaths : usuarioPaths;
  return allowed.some((prefix) => pathMatches(path, prefix));
}

export function navForRole(role: PanelRole): PanelNavItem[] {
  if (isAdminRole(role)) return panelNav;
  return panelNav
    .map((item) => {
      if (item.children) {
        const children = item.children.filter((child) => canAccessPath(role, child.href));
        if (!children.length) return null;
        return { ...item, children };
      }
      if (!item.href || !canAccessPath(role, item.href)) return null;
      return item;
    })
    .filter((item): item is PanelNavItem => Boolean(item));
}

export function cardsForRole(role: PanelRole) {
  return navForRole(role)
    .filter((item) => item.href !== "/panel")
    .map((item) => ({
      href: item.href ?? item.children?.[0]?.href ?? "/panel",
      label: item.label,
      description: item.description,
      icon: item.icon,
      category: item.children ? item.label : undefined,
    }));
}
