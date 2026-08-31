import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { neon } from "@neondatabase/serverless";
import { formatDate, formatMoney } from "@/lib/panel-format";
import { defaultSiteSettings, splitName, type SiteSettings } from "@/lib/site-settings";
import { padron as seedPadronPeople } from "@/lib/padron";

export { formatDate, formatMoney };
export type PanelSettings = SiteSettings;

export type UserRole = "Admin" | "Usuario" | "Usuario Membresía";

export const USER_ROLES: UserRole[] = ["Admin", "Usuario", "Usuario Membresía"];

export function parseRole(value: string): UserRole {
  const normalized = value.trim();
  if (/^admin(istrador)?$/i.test(normalized)) return "Admin";
  if (/^usuario membres[ií]a$/i.test(normalized)) return "Usuario Membresía";
  return "Usuario";
}
export type UserStatus = "active" | "invited" | "suspended";
export type EventStatus = "draft" | "open" | "closed" | "cancelled";
export type RegistrationStatus = "pending" | "confirmed" | "cancelled" | "waitlist";
export type ApplicationStatus = "pending" | "reviewed" | "accepted" | "rejected";
export type DueStatus = "pending" | "paid" | "overdue" | "waived";

export type PanelUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  phone: string;
  notes: string;
  createdAt: string;
};

export type PanelEvent = {
  id: number;
  title: string;
  program: string;
  description: string;
  startsAt: string;
  capacity: number;
  location: string;
  materialsUrl: string;
  coverImageUrl: string;
  registrationDeadline: string;
  status: EventStatus;
  registeredCount: number;
};

export type PanelPadronPerson = {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  email: string;
  phone: string;
  residence: string;
  createdAt: string;
};

export type PadronInput = Omit<PanelPadronPerson, "id" | "createdAt">;

export type PanelManualPayment = {
  id: number;
  padronId: number;
  period: string;
  amountCents: number;
  currency: string;
  method: string;
  paidAt: string;
  notes: string;
};

export type ManualPaymentInput = Omit<PanelManualPayment, "id">;

export type CarouselSlide = {
  id: number;
  imageUrl: string;
  visible: boolean;
  createdAt: string;
};

export type PanelZoomMeeting = {
  id: number;
  title: string;
  joinUrl: string;
  meetingId: string;
  passcode: string;
  notes: string;
  createdAt: string;
};

export type ZoomMeetingInput = Omit<PanelZoomMeeting, "id" | "createdAt">;

export type PanelBitacoraEntry = {
  id: number;
  url: string;
  title: string;
  createdAt: string;
};

export type BitacoraInput = {
  url: string;
  title: string;
};

export type PanelActivation = {
  id: number;
  title: string;
  youtubeUrl: string;
  occurredAt: string;
  enabled: boolean;
  createdAt: string;
};

export type ActivationInput = {
  title: string;
  youtubeUrl: string;
  occurredAt: string;
  enabled: boolean;
};

export type PanelSpecialRoom = PanelActivation;
export type SpecialRoomInput = ActivationInput;

export type PanelActivationPermission = {
  id: number;
  userId: number;
  activationId: number;
};

export function isEventJoinOpen(deadline: string, now = new Date()) {
  if (!deadline) return true;
  const [year, month, day] = deadline.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return true;
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);
  return now.getTime() <= end.getTime();
}

export type PanelRegistration = {
  id: number;
  eventId: number;
  userId: number;
  status: RegistrationStatus;
  notes: string;
  createdAt: string;
  eventTitle: string;
  eventStartsAt: string;
  userName: string;
  userEmail: string;
  userPhone: string;
};

export type PanelApplication = {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
  phone: string;
  birthDate: string;
  residence: string;
  isEncuentros: boolean;
  isSpecialRoom: boolean;
  interest: string;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
};

export type ApplicationInput = {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  dni?: string;
  phone?: string;
  birthDate?: string;
  residence?: string;
  isEncuentros?: boolean;
  isSpecialRoom?: boolean;
  interest?: string;
  message?: string;
};

export type PanelPayment = {
  id: number;
  userId: number;
  amountCents: number;
  currency: string;
  method: string;
  reference: string;
  paidAt: string;
  notes: string;
  userName: string;
};

export type PanelPaymentReceipt = {
  id: number;
  fileName: string;
  fileUrl: string;
  kind: "pdf" | "jpg";
  amountCents: number | null;
  paidAt: string;
  rawText: string;
  createdAt: string;
};

export type BankCurrency = "ARS" | "USD";

export type PanelBankMovement = {
  id: number;
  occurredAt: string;
  reference: string;
  concept: string;
  amountCents: number;
  currency: BankCurrency;
  createdAt: string;
};

export type BankMovementInput = {
  occurredAt: string;
  reference: string;
  concept: string;
  amountCents: number;
  currency: BankCurrency;
};

export type BankExtractMeta = {
  initialBalanceCents: number;
  initialBalanceUsdCents: number;
  initialBalanceDate: string;
};

export const defaultBankExtractMeta: BankExtractMeta = {
  initialBalanceCents: 8114366,
  initialBalanceUsdCents: 0,
  initialBalanceDate: "2026-05-31",
};

export type PanelDue = {
  id: number;
  userId: number;
  period: string;
  amountCents: number;
  currency: string;
  dueDate: string;
  status: DueStatus;
  userName: string;
};

export type PanelAudit = {
  id: number;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: number | null;
  detail: string;
  createdAt: string;
};

export type PanelInvitation = {
  id: number;
  email: string;
  role: UserRole;
  createdAt: string;
};

type Memory = {
  users: Array<PanelUser & { passwordHash: string | null }>;
  events: Array<Omit<PanelEvent, "registeredCount">>;
  registrations: Array<
    Omit<PanelRegistration, "eventTitle" | "eventStartsAt" | "userName" | "userEmail" | "userPhone">
  >;
  applications: PanelApplication[];
  payments: Array<Omit<PanelPayment, "userName">>;
  dues: Array<Omit<PanelDue, "userName">>;
  audit: PanelAudit[];
  invitations: PanelInvitation[];
  carouselSlides: CarouselSlide[];
  zoomMeetings: PanelZoomMeeting[];
  padron: PanelPadronPerson[];
  manualPayments: PanelManualPayment[];
  bankMovements: PanelBankMovement[];
  bankExtract: BankExtractMeta;
  receipts: PanelPaymentReceipt[];
  bitacora: PanelBitacoraEntry[];
  activations: PanelActivation[];
  specialRooms: PanelSpecialRoom[];
  activationPermissions: PanelActivationPermission[];
  settings: PanelSettings;
  ids: Record<string, number>;
};

const g = globalThis as typeof globalThis & { __gvPanel?: Memory };

function nextId(store: Memory, key: string) {
  store.ids[key] = (store.ids[key] ?? 0) + 1;
  return store.ids[key];
}

function iso(date = new Date()) {
  return date.toISOString();
}

function daysFromNow(days: number) {
  return iso(new Date(Date.now() + days * 86400000));
}

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const prev = Buffer.from(hash, "hex");
  if (prev.length !== next.length) return false;
  return timingSafeEqual(prev, next);
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

function defaultSettings(): PanelSettings {
  return { ...defaultSiteSettings };
}

function seedMemory(store: Memory) {
  const adminHash = hashPassword("semilla");
  const memberHash = hashPassword("semilla");
  const guadalupe: Memory["users"][number] = {
    id: nextId(store, "users"),
    email: "guadalupe@concienciaestelar.com",
    name: "Guadalupe",
    role: "Admin",
    status: "active",
    phone: "",
    notes: "Guía del espacio",
    createdAt: daysFromNow(-40),
    passwordHash: adminHash,
  };
  const ana: Memory["users"][number] = {
    id: nextId(store, "users"),
    email: "ana@correo.com",
    name: "Ana Morales",
    role: "Usuario Membresía",
    status: "active",
    phone: "11 5555 1010",
    notes: "Código Semilla 2026",
    createdAt: daysFromNow(-20),
    passwordHash: memberHash,
  };
  const martin: Memory["users"][number] = {
    id: nextId(store, "users"),
    email: "martin@correo.com",
    name: "Martín López",
    role: "Usuario",
    status: "invited",
    phone: "",
    notes: "",
    createdAt: daysFromNow(-3),
    passwordHash: null,
  };
  store.users.push(guadalupe, ana, martin);

  const encuentro1 = {
    id: nextId(store, "events"),
    title: "Círculo de integración",
    program: "Código Semilla",
    description: "Encuentro mensual para integrar lo transitado y compartir la práctica.",
    startsAt: daysFromNow(10),
    capacity: 24,
    location: "Zoom",
    materialsUrl: "https://www.youtube.com/results?search_query=conciencia+estelar+encuentro",
    coverImageUrl: "",
    registrationDeadline: "",
    status: "open" as EventStatus,
  };
  const encuentro2 = {
    id: nextId(store, "events"),
    title: "Apertura Frecuencia 44",
    program: "Frecuencia 44",
    description: "Inicio del ciclo de 44 días. Presentación del ritmo y la práctica diaria.",
    startsAt: daysFromNow(18),
    capacity: 40,
    location: "Online",
    materialsUrl: "",
    coverImageUrl: "",
    registrationDeadline: "",
    status: "open" as EventStatus,
  };
  store.events.push(encuentro1, encuentro2, {
    id: nextId(store, "events"),
    title: "Lectura de apertura",
    program: "Experiencias Individuales",
    description: "Espacio reducido para lecturas de campo.",
    startsAt: daysFromNow(28),
    capacity: 8,
    location: "Presencial / online",
    materialsUrl: "",
    coverImageUrl: "",
    registrationDeadline: "",
    status: "draft",
  });

  store.registrations.push({
    id: nextId(store, "registrations"),
    eventId: encuentro1.id,
    userId: ana.id,
    status: "confirmed",
    notes: "",
    createdAt: daysFromNow(-2),
  });

  store.applications.push(
    buildApplication({
      id: nextId(store, "applications"),
      firstName: "Lucía",
      lastName: "Pereyra",
      email: "lucia@correo.com",
      dni: "38444555",
      phone: "2215551234",
      birthDate: "1992-03-14",
      residence: "La Plata",
      isEncuentros: true,
      isSpecialRoom: false,
      interest: "Código Semilla",
      message: "Quiero sumarme al próximo ciclo. Siento que es el momento.",
      status: "pending",
      createdAt: "2026-08-27T12:12:00.000Z",
    }),
    buildApplication({
      id: nextId(store, "applications"),
      firstName: "Diego",
      lastName: "Ruiz",
      email: "diego@correo.com",
      dni: "30111222",
      phone: "1144442211",
      birthDate: "1988-11-02",
      residence: "CABA",
      isEncuentros: false,
      isSpecialRoom: true,
      interest: "Frecuencia 44",
      message: "Me interesa el entrenamiento diario de los 44 días.",
      status: "pending",
      createdAt: daysFromNow(-8),
    }),
  );

  store.payments.push({
    id: nextId(store, "payments"),
    userId: ana.id,
    amountCents: 2500000,
    currency: "ARS",
    method: "Transferencia",
    reference: "ANA-0826",
    paidAt: daysFromNow(-6),
    notes: "Cuota agosto",
  });

  store.dues.push(
    {
      id: nextId(store, "dues"),
      userId: ana.id,
      period: currentPeriod(),
      amountCents: 2500000,
      currency: "ARS",
      dueDate: daysFromNow(12).slice(0, 10),
      status: "paid",
    },
    {
      id: nextId(store, "dues"),
      userId: martin.id,
      period: currentPeriod(),
      amountCents: 2500000,
      currency: "ARS",
      dueDate: daysFromNow(-2).slice(0, 10),
      status: "overdue",
    },
  );

  store.audit.push({
    id: nextId(store, "audit"),
    actorEmail: guadalupe.email,
    action: "seed",
    entityType: "system",
    entityId: null,
    detail: "Se inicializó el espacio de membresía",
    createdAt: daysFromNow(-40),
  });

  store.invitations.push({
    id: nextId(store, "invitations"),
    email: martin.email,
    role: "Usuario",
    createdAt: daysFromNow(-3),
  });

  for (const person of defaultPadronEntries()) {
    store.padron.push({
      ...person,
      id: nextId(store, "padron"),
      createdAt: iso(),
    });
  }

  const period = currentPeriod();
  for (const person of store.padron.slice(0, 2)) {
    store.manualPayments.push({
      id: nextId(store, "manualPayments"),
      padronId: person.id,
      period,
      amountCents: store.settings.monthlyDueCents,
      currency: store.settings.currency,
      method: "Manual",
      paidAt: iso(),
      notes: "",
    });
  }

  for (const meeting of defaultZoomMeetings()) {
    store.zoomMeetings.push({
      ...meeting,
      id: nextId(store, "zoom"),
      createdAt: iso(),
    });
  }

  store.bankExtract = { ...defaultBankExtractMeta };
  for (const movement of defaultBankMovements()) {
    store.bankMovements.push({
      ...movement,
      id: nextId(store, "bankMovements"),
      createdAt: iso(),
    });
  }
}

function memory(): Memory {
  if (!g.__gvPanel) {
    const store: Memory = {
      users: [],
      events: [],
      registrations: [],
      applications: [],
      payments: [],
      dues: [],
      audit: [],
      invitations: [],
      carouselSlides: [],
      zoomMeetings: [],
      padron: [],
      manualPayments: [],
      bankMovements: [],
      bankExtract: { ...defaultBankExtractMeta },
      receipts: [],
      bitacora: [],
      activations: [],
      specialRooms: [],
      activationPermissions: [],
      settings: defaultSettings(),
      ids: {},
    };
    seedMemory(store);
    g.__gvPanel = store;
  }
  g.__gvPanel.activationPermissions ??= [];
  g.__gvPanel.specialRooms ??= [];
  g.__gvPanel.activations ??= [];
  g.__gvPanel.bitacora ??= [];
  g.__gvPanel.receipts ??= [];
  g.__gvPanel.carouselSlides ??= [];
  if (!g.__gvPanel.zoomMeetings) {
    g.__gvPanel.zoomMeetings = defaultZoomMeetings().map((meeting) => ({
      ...meeting,
      id: nextId(g.__gvPanel!, "zoom"),
      createdAt: iso(),
    }));
  }
  g.__gvPanel.padron ??= [];
  g.__gvPanel.manualPayments ??= [];
  g.__gvPanel.bankExtract ??= { ...defaultBankExtractMeta };
  if (!g.__gvPanel.bankMovements) {
    g.__gvPanel.bankMovements = defaultBankMovements().map((movement) => ({
      ...movement,
      id: nextId(g.__gvPanel!, "bankMovements"),
      createdAt: iso(),
    }));
  }
  if (g.__gvPanel.padron.length === 0) {
    for (const person of defaultPadronEntries()) {
      g.__gvPanel.padron.push({
        ...person,
        id: nextId(g.__gvPanel, "padron"),
        createdAt: iso(),
      });
    }
  }
  return g.__gvPanel;
}

async function ensurePanelSchema() {
  const sql = getSql();
  if (!sql) return;

  await sql`
    CREATE TABLE IF NOT EXISTS panel_users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'Miembro',
      status TEXT NOT NULL DEFAULT 'active',
      phone TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_events (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      program TEXT DEFAULT '',
      description TEXT DEFAULT '',
      starts_at TIMESTAMPTZ NOT NULL,
      capacity INT DEFAULT 20,
      location TEXT DEFAULT '',
      materials_url TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE panel_events ADD COLUMN IF NOT EXISTS cover_image_url TEXT DEFAULT ''`;
  await sql`ALTER TABLE panel_events ADD COLUMN IF NOT EXISTS registration_deadline TEXT DEFAULT ''`;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_carousel_slides (
      id SERIAL PRIMARY KEY,
      image_url TEXT NOT NULL,
      visible BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_registrations (
      id SERIAL PRIMARY KEY,
      event_id INT NOT NULL REFERENCES panel_events(id) ON DELETE CASCADE,
      user_id INT NOT NULL REFERENCES panel_users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'confirmed',
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (event_id, user_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_applications (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      interest TEXT DEFAULT '',
      message TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE panel_applications ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT ''`;
  await sql`ALTER TABLE panel_applications ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT ''`;
  await sql`ALTER TABLE panel_applications ADD COLUMN IF NOT EXISTS dni TEXT DEFAULT ''`;
  await sql`ALTER TABLE panel_applications ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT ''`;
  await sql`ALTER TABLE panel_applications ADD COLUMN IF NOT EXISTS birth_date TEXT DEFAULT ''`;
  await sql`ALTER TABLE panel_applications ADD COLUMN IF NOT EXISTS residence TEXT DEFAULT ''`;
  await sql`ALTER TABLE panel_applications ADD COLUMN IF NOT EXISTS is_encuentros BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE panel_applications ADD COLUMN IF NOT EXISTS is_special_room BOOLEAN DEFAULT false`;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_payments (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES panel_users(id) ON DELETE CASCADE,
      amount_cents INT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ARS',
      method TEXT DEFAULT '',
      reference TEXT DEFAULT '',
      paid_at TIMESTAMPTZ NOT NULL,
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_dues (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES panel_users(id) ON DELETE CASCADE,
      period TEXT NOT NULL,
      amount_cents INT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ARS',
      due_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (user_id, period)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_audit (
      id SERIAL PRIMARY KEY,
      actor_email TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INT,
      detail TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_invitations (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Miembro',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_zoom_meetings (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      join_url TEXT NOT NULL,
      meeting_id TEXT DEFAULT '',
      passcode TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  const zoomCount = await sql`SELECT COUNT(*)::int AS count FROM panel_zoom_meetings`;
  if (Number(zoomCount[0]?.count ?? 0) === 0) {
    for (const meeting of defaultZoomMeetings()) {
      await sql`
        INSERT INTO panel_zoom_meetings (title, join_url, meeting_id, passcode, notes)
        VALUES (${meeting.title}, ${meeting.joinUrl}, ${meeting.meetingId}, ${meeting.passcode}, ${meeting.notes})
      `;
    }
  }
  await sql`
    CREATE TABLE IF NOT EXISTS panel_padron (
      id SERIAL PRIMARY KEY,
      first_name TEXT DEFAULT '',
      last_name TEXT DEFAULT '',
      dni TEXT DEFAULT '',
      birth_date TEXT DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      residence TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_manual_payments (
      id SERIAL PRIMARY KEY,
      padron_id INT NOT NULL REFERENCES panel_padron(id) ON DELETE CASCADE,
      period TEXT NOT NULL,
      amount_cents INT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ARS',
      method TEXT DEFAULT 'Manual',
      paid_at TIMESTAMPTZ NOT NULL,
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS panel_manual_payments_padron_period ON panel_manual_payments (padron_id, period)`;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_bitacora (
      id SERIAL PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS panel_bitacora_url ON panel_bitacora (url)`;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_activations (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      youtube_url TEXT NOT NULL,
      occurred_at DATE NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_activation_permissions (
      id SERIAL PRIMARY KEY,
      padron_id INT NOT NULL REFERENCES panel_padron(id) ON DELETE CASCADE,
      activation_id INT NOT NULL REFERENCES panel_activations(id) ON DELETE CASCADE
    )
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS panel_activation_permissions_unique ON panel_activation_permissions (padron_id, activation_id)`;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_membership_permissions (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES panel_users(id) ON DELETE CASCADE,
      activation_id INT NOT NULL REFERENCES panel_activations(id) ON DELETE CASCADE
    )
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS panel_membership_permissions_unique ON panel_membership_permissions (user_id, activation_id)`;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_special_rooms (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      youtube_url TEXT NOT NULL,
      occurred_at DATE NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_payment_receipts (
      id SERIAL PRIMARY KEY,
      file_name TEXT DEFAULT '',
      file_url TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'jpg',
      amount_cents INT,
      paid_at TEXT DEFAULT '',
      raw_text TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS panel_bank_movements (
      id SERIAL PRIMARY KEY,
      occurred_at TIMESTAMPTZ NOT NULL,
      reference TEXT DEFAULT '',
      concept TEXT DEFAULT '',
      amount_cents INT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ARS',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  const bankCount = await sql`SELECT COUNT(*)::int AS count FROM panel_bank_movements`;
  if (Number(bankCount[0]?.count ?? 0) === 0) {
    for (const movement of defaultBankMovements()) {
      await sql`
        INSERT INTO panel_bank_movements (occurred_at, reference, concept, amount_cents, currency)
        VALUES (${movement.occurredAt}, ${movement.reference}, ${movement.concept}, ${movement.amountCents}, ${movement.currency})
      `;
    }
  }
  const extractMeta = await sql`SELECT value FROM panel_settings WHERE key = 'bankExtract' LIMIT 1`;
  if (!extractMeta[0]) {
    await sql`
      INSERT INTO panel_settings (key, value)
      VALUES ('bankExtract', ${JSON.stringify(defaultBankExtractMeta)})
      ON CONFLICT (key) DO NOTHING
    `;
  }

  const count = await sql`SELECT COUNT(*)::int AS count FROM panel_users`;
  if (Number(count[0]?.count ?? 0) === 0) {
    const tmp = {
      users: [],
      events: [],
      registrations: [],
      applications: [],
      payments: [],
      dues: [],
      audit: [],
      invitations: [],
      carouselSlides: [],
      zoomMeetings: [],
      padron: [],
      manualPayments: [],
      bankMovements: [],
      bankExtract: { ...defaultBankExtractMeta },
      receipts: [],
      bitacora: [],
      activations: [],
      specialRooms: [],
      activationPermissions: [],
      settings: defaultSettings(),
      ids: {},
    } as Memory;
    seedMemory(tmp);
    for (const user of tmp.users) {
      await sql`
        INSERT INTO panel_users (email, name, password_hash, role, status, phone, notes, created_at)
        VALUES (${user.email}, ${user.name}, ${user.passwordHash}, ${user.role}, ${user.status}, ${user.phone}, ${user.notes}, ${user.createdAt})
      `;
    }
    const users = await sql`SELECT id, email FROM panel_users`;
    const userIdByEmail = Object.fromEntries(
      users.map((row) => [String(row.email), Number(row.id)]),
    );
    const eventIdByTitle: Record<string, number> = {};
    for (const event of tmp.events) {
      const inserted = await sql`
        INSERT INTO panel_events (title, program, description, starts_at, capacity, location, materials_url, cover_image_url, registration_deadline, status)
        VALUES (${event.title}, ${event.program}, ${event.description}, ${event.startsAt}, ${event.capacity}, ${event.location}, ${event.materialsUrl}, ${event.coverImageUrl}, ${event.registrationDeadline}, ${event.status})
        RETURNING id
      `;
      eventIdByTitle[event.title] = Number(inserted[0]?.id);
    }
    for (const registration of tmp.registrations) {
      const event = tmp.events.find((item) => item.id === registration.eventId);
      const user = tmp.users.find((item) => item.id === registration.userId);
      const eventId = event ? eventIdByTitle[event.title] : null;
      const userId = user ? userIdByEmail[user.email] : null;
      if (eventId && userId) {
        await sql`
          INSERT INTO panel_registrations (event_id, user_id, status, notes, created_at)
          VALUES (${eventId}, ${userId}, ${registration.status}, ${registration.notes}, ${registration.createdAt})
        `;
      }
    }
    for (const application of tmp.applications) {
      await sql`
        INSERT INTO panel_applications (
          name, first_name, last_name, email, dni, phone, birth_date, residence,
          is_encuentros, is_special_room, interest, message, status, created_at
        )
        VALUES (
          ${application.name}, ${application.firstName}, ${application.lastName}, ${application.email},
          ${application.dni}, ${application.phone}, ${application.birthDate}, ${application.residence},
          ${application.isEncuentros}, ${application.isSpecialRoom}, ${application.interest},
          ${application.message}, ${application.status}, ${application.createdAt}
        )
      `;
    }
    for (const payment of tmp.payments) {
      const user = tmp.users.find((item) => item.id === payment.userId);
      const userId = user ? userIdByEmail[user.email] : null;
      if (!userId) continue;
      await sql`
        INSERT INTO panel_payments (user_id, amount_cents, currency, method, reference, paid_at, notes)
        VALUES (${userId}, ${payment.amountCents}, ${payment.currency}, ${payment.method}, ${payment.reference}, ${payment.paidAt}, ${payment.notes})
      `;
    }
    for (const due of tmp.dues) {
      const user = tmp.users.find((item) => item.id === due.userId);
      const userId = user ? userIdByEmail[user.email] : null;
      if (!userId) continue;
      await sql`
        INSERT INTO panel_dues (user_id, period, amount_cents, currency, due_date, status)
        VALUES (${userId}, ${due.period}, ${due.amountCents}, ${due.currency}, ${due.dueDate}, ${due.status})
      `;
    }
    for (const invitation of tmp.invitations) {
      await sql`
        INSERT INTO panel_invitations (email, role, created_at)
        VALUES (${invitation.email}, ${invitation.role}, ${invitation.createdAt})
      `;
    }
    for (const [key, value] of Object.entries(tmp.settings)) {
      await sql`
        INSERT INTO panel_settings (key, value)
        VALUES (${key}, ${String(value)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }
    await sql`
      INSERT INTO panel_audit (actor_email, action, entity_type, detail)
      VALUES ('sistema', 'seed', 'system', 'Se inicializó el espacio de membresía')
    `;
    for (const person of tmp.padron) {
      await sql`
        INSERT INTO panel_padron (first_name, last_name, dni, birth_date, email, phone, residence, created_at)
        VALUES (${person.firstName}, ${person.lastName}, ${person.dni}, ${person.birthDate}, ${person.email}, ${person.phone}, ${person.residence}, ${person.createdAt})
      `;
    }
    const padronRows = await sql`SELECT id, first_name, last_name, dni, email FROM panel_padron`;
    for (const payment of tmp.manualPayments) {
      const person = tmp.padron.find((item) => item.id === payment.padronId);
      if (!person) continue;
      const row = padronRows.find(
        (item) =>
          String(item.first_name) === person.firstName &&
          String(item.last_name) === person.lastName &&
          String(item.email ?? "") === person.email,
      );
      if (!row) continue;
      await sql`
        INSERT INTO panel_manual_payments (padron_id, period, amount_cents, currency, method, paid_at, notes)
        VALUES (${Number(row.id)}, ${payment.period}, ${payment.amountCents}, ${payment.currency}, ${payment.method}, ${payment.paidAt}, ${payment.notes})
        ON CONFLICT (padron_id, period) DO NOTHING
      `;
    }
  }

  const padronCount = await sql`SELECT COUNT(*)::int AS count FROM panel_padron`;
  if (Number(padronCount[0]?.count ?? 0) === 0) {
    for (const person of defaultPadronEntries()) {
      await sql`
        INSERT INTO panel_padron (first_name, last_name, dni, birth_date, email, phone, residence)
        VALUES (${person.firstName}, ${person.lastName}, ${person.dni}, ${person.birthDate}, ${person.email}, ${person.phone}, ${person.residence})
      `;
    }
  }
}

function mapUser(row: Record<string, unknown>): PanelUser {
  return {
    id: Number(row.id),
    email: String(row.email),
    name: String(row.name),
    role: parseRole(String(row.role ?? "Usuario")),
    status: (["active", "invited", "suspended"] as UserStatus[]).includes(row.status as UserStatus)
      ? (row.status as UserStatus)
      : "active",
    phone: String(row.phone ?? ""),
    notes: String(row.notes ?? ""),
    createdAt: iso(new Date(String(row.created_at ?? row.createdAt ?? Date.now()))),
  };
}

export async function logAudit(input: {
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: number | null;
  detail: string;
}) {
  const sql = getSql();
  if (!sql) {
    const store = memory();
    store.audit.unshift({
      id: nextId(store, "audit"),
      actorEmail: input.actorEmail,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      detail: input.detail,
      createdAt: iso(),
    });
    return;
  }
  await ensurePanelSchema();
  await sql`
    INSERT INTO panel_audit (actor_email, action, entity_type, entity_id, detail)
    VALUES (${input.actorEmail}, ${input.action}, ${input.entityType}, ${input.entityId ?? null}, ${input.detail})
  `;
}

export async function listUsers(): Promise<PanelUser[]> {
  const sql = getSql();
  if (!sql) {
    return memory()
      .users.map(({ passwordHash, ...user }) => ({ ...user, role: parseRole(user.role) }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT * FROM panel_users ORDER BY name ASC`;
  return rows.map((row) => mapUser(row as Record<string, unknown>));
}

export async function getUserById(id: number): Promise<PanelUser | null> {
  const sql = getSql();
  if (!sql) {
    const user = memory().users.find((item) => item.id === id);
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT * FROM panel_users WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapUser(rows[0] as Record<string, unknown>) : null;
}

export async function findUserByEmail(email: string): Promise<PanelUser | null> {
  const normalized = email.trim().toLowerCase();
  const sql = getSql();
  if (!sql) {
    const user = memory().users.find((item) => item.email === normalized);
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT * FROM panel_users WHERE email = ${normalized} LIMIT 1`;
  return rows[0] ? mapUser(rows[0] as Record<string, unknown>) : null;
}

export async function createUser(input: {
  email: string;
  name: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  notes?: string;
}): Promise<PanelUser> {
  const email = input.email.trim().toLowerCase();
  const passwordHash = input.password ? hashPassword(input.password) : null;
  const sql = getSql();
  if (!sql) {
    const store = memory();
    const user: Memory["users"][number] = {
      id: nextId(store, "users"),
      email,
      name: input.name.trim(),
      role: input.role ?? "Usuario",
      status: input.status ?? "active",
      phone: input.phone ?? "",
      notes: input.notes ?? "",
      createdAt: iso(),
      passwordHash,
    };
    store.users.push(user);
    const { passwordHash: _, ...rest } = user;
    return rest;
  }
  await ensurePanelSchema();
  const rows = await sql`
    INSERT INTO panel_users (email, name, password_hash, role, status, phone, notes)
    VALUES (${email}, ${input.name.trim()}, ${passwordHash}, ${input.role ?? "Usuario"}, ${input.status ?? "active"}, ${input.phone ?? ""}, ${input.notes ?? ""})
    RETURNING *
  `;
  return mapUser(rows[0] as Record<string, unknown>);
}

export async function updateUser(
  id: number,
  patch: Partial<Pick<PanelUser, "name" | "email" | "role" | "status" | "phone" | "notes">>,
): Promise<PanelUser | null> {
  const current = await getUserById(id);
  if (!current) return null;
  const next = {
    ...current,
    ...Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined),
    ),
  };
  const sql = getSql();
  if (!sql) {
    const user = memory().users.find((item) => item.id === id);
    if (!user) return null;
    Object.assign(user, patch);
    const { passwordHash, ...rest } = user;
    return rest;
  }
  await ensurePanelSchema();
  await sql`
    UPDATE panel_users
    SET name = ${next.name},
        email = ${next.email},
        role = ${next.role},
        status = ${next.status},
        phone = ${next.phone},
        notes = ${next.notes},
        updated_at = NOW()
    WHERE id = ${id}
  `;
  return getUserById(id);
}

export async function updateUserPassword(id: number, password: string) {
  await setPasswordHash(id, hashPassword(password));
}

export async function deleteUser(id: number) {
  const sql = getSql();
  if (!sql) {
    const store = memory();
    store.users = store.users.filter((item) => item.id !== id);
    store.registrations = store.registrations.filter((item) => item.userId !== id);
    store.payments = store.payments.filter((item) => item.userId !== id);
    store.dues = store.dues.filter((item) => item.userId !== id);
    store.activationPermissions = store.activationPermissions.filter((item) => item.userId !== id);
    return;
  }
  await ensurePanelSchema();
  await sql`DELETE FROM panel_users WHERE id = ${id}`;
}

export async function createUsersBulk(
  items: Array<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
  }>,
) {
  const created: PanelUser[] = [];
  for (const item of items) {
    if (!item.email) continue;
    if (await findUserByEmail(item.email)) continue;
    created.push(
      await createUser({
        email: item.email,
        name: item.name,
        password: item.password,
        role: item.role,
        status: "active",
        phone: item.phone ?? "",
      }),
    );
  }
  return created;
}

async function setPasswordHash(id: number, passwordHash: string) {
  const sql = getSql();
  if (!sql) {
    const user = memory().users.find((item) => item.id === id);
    if (user) user.passwordHash = passwordHash;
    return;
  }
  await ensurePanelSchema();
  await sql`UPDATE panel_users SET password_hash = ${passwordHash}, updated_at = NOW() WHERE id = ${id}`;
}

async function getPasswordHash(id: number): Promise<string | null> {
  const sql = getSql();
  if (!sql) {
    return memory().users.find((item) => item.id === id)?.passwordHash ?? null;
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT password_hash FROM panel_users WHERE id = ${id} LIMIT 1`;
  const value = rows[0]?.password_hash;
  return value ? String(value) : null;
}

export async function authenticateUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<{ user: PanelUser } | { error: string }> {
  const email = input.email.trim().toLowerCase();
  const name = (input.name || email.split("@")[0] || "Integrante").trim();
  const existing = await findUserByEmail(email);

  if (existing) {
    if (existing.status === "suspended") {
      return { error: "Tu acceso está suspendido. Escribime para revisarlo." };
    }
    const hash = await getPasswordHash(existing.id);
    if (hash && !verifyPassword(input.password, hash)) {
      return { error: "Email o contraseña incorrectos." };
    }
    if (!hash) {
      await setPasswordHash(existing.id, hashPassword(input.password));
    }
    if (existing.status === "invited") {
      await updateUser(existing.id, { status: "active", name });
    }
    const user = (await getUserById(existing.id)) ?? existing;
    await logAudit({
      actorEmail: user.email,
      action: "login",
      entityType: "user",
      entityId: user.id,
      detail: "Ingresó al panel",
    });
    return { user };
  }

  const users = await listUsers();
  const user = await createUser({
    email,
    name,
    password: input.password,
    role: users.length === 0 ? "Admin" : "Usuario",
    status: "active",
  });
  await logAudit({
    actorEmail: user.email,
    action: "user.create",
    entityType: "user",
    entityId: user.id,
    detail: "Se creó el acceso al ingresar por primera vez",
  });
  return { user };
}

function hydrateRegistrations(
  registrations: Memory["registrations"],
  events: Memory["events"],
  users: Memory["users"],
): PanelRegistration[] {
  return registrations
    .map((registration) => {
      const event = events.find((item) => item.id === registration.eventId);
      const user = users.find((item) => item.id === registration.userId);
      return {
        ...registration,
        eventTitle: event?.title ?? "Encuentro",
        eventStartsAt: event?.startsAt ?? registration.createdAt,
        userName: user?.name ?? "Integrante",
        userEmail: user?.email ?? "",
        userPhone: user?.phone ?? "",
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function mapEvent(row: Record<string, unknown>, registeredCount = 0): PanelEvent {
  return {
    id: Number(row.id),
    title: String(row.title ?? ""),
    program: String(row.program ?? ""),
    description: String(row.description ?? ""),
    startsAt: iso(new Date(String(row.startsAt ?? row.starts_at))),
    capacity: Number(row.capacity ?? 0),
    location: String(row.location ?? ""),
    materialsUrl: String(row.materialsUrl ?? row.materials_url ?? ""),
    coverImageUrl: String(row.coverImageUrl ?? row.cover_image_url ?? ""),
    registrationDeadline: String(row.registrationDeadline ?? row.registration_deadline ?? ""),
    status: (row.status as EventStatus) || "draft",
    registeredCount,
  };
}

export async function listEvents(): Promise<PanelEvent[]> {
  const sql = getSql();
  if (!sql) {
    const store = memory();
    return store.events
      .map((event) =>
        mapEvent(event as unknown as Record<string, unknown>, store.registrations.filter(
          (item) => item.eventId === event.id && item.status !== "cancelled",
        ).length),
      )
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }
  await ensurePanelSchema();
  const rows = await sql`
    SELECT e.*,
      COUNT(r.id) FILTER (WHERE r.status IS NOT NULL AND r.status <> 'cancelled')::int AS registered_count
    FROM panel_events e
    LEFT JOIN panel_registrations r ON r.event_id = e.id
    GROUP BY e.id
    ORDER BY e.starts_at ASC
  `;
  return rows.map((row) => mapEvent(row as Record<string, unknown>, Number(row.registered_count ?? 0)));
}

export async function createEvent(input: {
  title: string;
  program?: string;
  description: string;
  startsAt: string;
  capacity?: number;
  location?: string;
  materialsUrl?: string;
  coverImageUrl?: string;
  registrationDeadline?: string;
  status?: EventStatus;
}): Promise<PanelEvent> {
  const event = {
    title: input.title,
    program: input.program ?? "",
    description: input.description,
    startsAt: new Date(
      input.startsAt.includes("T") ? input.startsAt : `${input.startsAt}T12:00:00`,
    ).toISOString(),
    capacity: input.capacity ?? 20,
    location: input.location ?? "",
    materialsUrl: input.materialsUrl ?? "",
    coverImageUrl: input.coverImageUrl ?? "",
    registrationDeadline: input.registrationDeadline ?? "",
    status: input.status ?? "open",
  };
  const sql = getSql();
  if (!sql) {
    const store = memory();
    const created = { id: nextId(store, "events"), ...event };
    store.events.push(created);
    return { ...created, registeredCount: 0 };
  }
  await ensurePanelSchema();
  const rows = await sql`
    INSERT INTO panel_events (
      title, program, description, starts_at, capacity, location, materials_url,
      cover_image_url, registration_deadline, status
    )
    VALUES (
      ${event.title}, ${event.program}, ${event.description}, ${event.startsAt}, ${event.capacity},
      ${event.location}, ${event.materialsUrl}, ${event.coverImageUrl}, ${event.registrationDeadline}, ${event.status}
    )
    RETURNING *
  `;
  return mapEvent(rows[0] as Record<string, unknown>);
}

export async function deleteEvent(id: number) {
  const sql = getSql();
  if (!sql) {
    memory().events = memory().events.filter((item) => item.id !== id);
    memory().registrations = memory().registrations.filter((item) => item.eventId !== id);
    return;
  }
  await ensurePanelSchema();
  await sql`DELETE FROM panel_events WHERE id = ${id}`;
}

export async function listCarouselSlides(): Promise<CarouselSlide[]> {
  const sql = getSql();
  if (!sql) {
    return [...memory().carouselSlides].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT * FROM panel_carousel_slides ORDER BY created_at DESC`;
  return rows.map((row) => ({
    id: Number(row.id),
    imageUrl: String(row.image_url),
    visible: row.visible !== false,
    createdAt: iso(new Date(String(row.created_at))),
  }));
}

export async function addCarouselSlide(imageUrl: string) {
  const sql = getSql();
  if (!sql) {
    memory().carouselSlides.unshift({
      id: nextId(memory(), "carousel"),
      imageUrl,
      visible: true,
      createdAt: iso(),
    });
    return;
  }
  await ensurePanelSchema();
  await sql`INSERT INTO panel_carousel_slides (image_url, visible) VALUES (${imageUrl}, true)`;
}

export async function toggleCarouselSlide(id: number, visible: boolean) {
  const sql = getSql();
  if (!sql) {
    const slide = memory().carouselSlides.find((item) => item.id === id);
    if (slide) slide.visible = visible;
    return;
  }
  await ensurePanelSchema();
  await sql`UPDATE panel_carousel_slides SET visible = ${visible} WHERE id = ${id}`;
}

export async function deleteCarouselSlide(id: number) {
  const sql = getSql();
  if (!sql) {
    memory().carouselSlides = memory().carouselSlides.filter((item) => item.id !== id);
    return;
  }
  await ensurePanelSchema();
  await sql`DELETE FROM panel_carousel_slides WHERE id = ${id}`;
}

function mapZoomMeeting(row: Record<string, unknown>): PanelZoomMeeting {
  return {
    id: Number(row.id),
    title: String(row.title ?? ""),
    joinUrl: String(row.join_url ?? row.joinUrl ?? ""),
    meetingId: String(row.meeting_id ?? row.meetingId ?? ""),
    passcode: String(row.passcode ?? ""),
    notes: String(row.notes ?? ""),
    createdAt: iso(new Date(String(row.created_at ?? row.createdAt ?? Date.now()))),
  };
}

export async function listZoomMeetings(): Promise<PanelZoomMeeting[]> {
  const sql = getSql();
  if (!sql) {
    return [...memory().zoomMeetings].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT * FROM panel_zoom_meetings ORDER BY created_at ASC`;
  return rows.map((row) => mapZoomMeeting(row as Record<string, unknown>));
}

export async function createZoomMeeting(input: ZoomMeetingInput) {
  const entry: PanelZoomMeeting = {
    id: 0,
    title: input.title.trim(),
    joinUrl: input.joinUrl.trim(),
    meetingId: input.meetingId.trim(),
    passcode: input.passcode.trim(),
    notes: input.notes.trim(),
    createdAt: iso(),
  };
  const sql = getSql();
  if (!sql) {
    entry.id = nextId(memory(), "zoom");
    memory().zoomMeetings.unshift(entry);
    return entry;
  }
  await ensurePanelSchema();
  const rows = await sql`
    INSERT INTO panel_zoom_meetings (title, join_url, meeting_id, passcode, notes)
    VALUES (${entry.title}, ${entry.joinUrl}, ${entry.meetingId}, ${entry.passcode}, ${entry.notes})
    RETURNING *
  `;
  return mapZoomMeeting(rows[0] as Record<string, unknown>);
}

export async function updateZoomMeeting(id: number, input: ZoomMeetingInput) {
  const sql = getSql();
  if (!sql) {
    const current = memory().zoomMeetings.find((item) => item.id === id);
    if (!current) return null;
    Object.assign(current, {
      title: input.title.trim(),
      joinUrl: input.joinUrl.trim(),
      meetingId: input.meetingId.trim(),
      passcode: input.passcode.trim(),
      notes: input.notes.trim(),
    });
    return current;
  }
  await ensurePanelSchema();
  await sql`
    UPDATE panel_zoom_meetings
    SET
      title = ${input.title.trim()},
      join_url = ${input.joinUrl.trim()},
      meeting_id = ${input.meetingId.trim()},
      passcode = ${input.passcode.trim()},
      notes = ${input.notes.trim()}
    WHERE id = ${id}
  `;
  const rows = await sql`SELECT * FROM panel_zoom_meetings WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapZoomMeeting(rows[0] as Record<string, unknown>) : null;
}

export async function deleteZoomMeeting(id: number) {
  const sql = getSql();
  if (!sql) {
    memory().zoomMeetings = memory().zoomMeetings.filter((item) => item.id !== id);
    return;
  }
  await ensurePanelSchema();
  await sql`DELETE FROM panel_zoom_meetings WHERE id = ${id}`;
}

function mapBitacora(row: Record<string, unknown>): PanelBitacoraEntry {
  return {
    id: Number(row.id),
    url: String(row.url ?? ""),
    title: String(row.title ?? ""),
    createdAt: iso(new Date(String(row.created_at ?? row.createdAt ?? Date.now()))),
  };
}

export function normalizeBitacoraUrl(url: string) {
  return url.trim().replace(/[.,;)\]]+$/, "");
}

export async function listBitacoraEntries(): Promise<PanelBitacoraEntry[]> {
  const sql = getSql();
  if (!sql) {
    return [...memory().bitacora].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT * FROM panel_bitacora ORDER BY created_at DESC`;
  return rows.map((row) => mapBitacora(row as Record<string, unknown>));
}

export async function createBitacoraEntry(input: BitacoraInput) {
  const url = normalizeBitacoraUrl(input.url);
  if (!url) return { error: "Completá la URL." };
  const title = input.title.trim();
  const sql = getSql();
  if (!sql) {
    const store = memory();
    if (store.bitacora.some((item) => item.url.toLowerCase() === url.toLowerCase())) {
      return { error: "Esa URL ya está en la bitácora." };
    }
    const entry: PanelBitacoraEntry = {
      id: nextId(store, "bitacora"),
      url,
      title,
      createdAt: iso(),
    };
    store.bitacora.unshift(entry);
    return { entry };
  }
  await ensurePanelSchema();
  const existing = await sql`SELECT id FROM panel_bitacora WHERE lower(url) = ${url.toLowerCase()} LIMIT 1`;
  if (existing[0]) return { error: "Esa URL ya está en la bitácora." };
  const rows = await sql`
    INSERT INTO panel_bitacora (url, title)
    VALUES (${url}, ${title})
    RETURNING *
  `;
  return { entry: mapBitacora(rows[0] as Record<string, unknown>) };
}

export async function createBitacoraEntries(inputs: BitacoraInput[]) {
  const created: PanelBitacoraEntry[] = [];
  const skipped: string[] = [];
  for (const input of inputs.slice(0, 50)) {
    const result = await createBitacoraEntry(input);
    if (result.error) skipped.push(normalizeBitacoraUrl(input.url));
    else if (result.entry) created.push(result.entry);
  }
  return { created, skipped };
}

export async function updateBitacoraEntry(id: number, input: Partial<BitacoraInput>) {
  const sql = getSql();
  if (!sql) {
    const current = memory().bitacora.find((item) => item.id === id);
    if (!current) return null;
    if (input.url !== undefined) current.url = normalizeBitacoraUrl(input.url);
    if (input.title !== undefined) current.title = input.title.trim();
    return current;
  }
  await ensurePanelSchema();
  const currentRows = await sql`SELECT * FROM panel_bitacora WHERE id = ${id} LIMIT 1`;
  if (!currentRows[0]) return null;
  const current = mapBitacora(currentRows[0] as Record<string, unknown>);
  const url = input.url !== undefined ? normalizeBitacoraUrl(input.url) : current.url;
  const title = input.title !== undefined ? input.title.trim() : current.title;
  await sql`UPDATE panel_bitacora SET url = ${url}, title = ${title} WHERE id = ${id}`;
  const rows = await sql`SELECT * FROM panel_bitacora WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapBitacora(rows[0] as Record<string, unknown>) : null;
}

export async function deleteBitacoraEntry(id: number) {
  const sql = getSql();
  if (!sql) {
    memory().bitacora = memory().bitacora.filter((item) => item.id !== id);
    return;
  }
  await ensurePanelSchema();
  await sql`DELETE FROM panel_bitacora WHERE id = ${id}`;
}

function dateOnly(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  const text = String(value ?? "");
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
}

function mapActivation(row: Record<string, unknown>): PanelActivation {
  const enabled = row.enabled;
  return {
    id: Number(row.id),
    title: String(row.title ?? ""),
    youtubeUrl: String(row.youtube_url ?? row.youtubeUrl ?? ""),
    occurredAt: dateOnly(row.occurred_at ?? row.occurredAt),
    enabled: enabled !== false && enabled !== "f" && enabled !== 0,
    createdAt: iso(new Date(String(row.created_at ?? row.createdAt ?? Date.now()))),
  };
}

export async function listActivations(): Promise<PanelActivation[]> {
  const sql = getSql();
  if (!sql) {
    return [...memory().activations].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.id - a.id);
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT * FROM panel_activations ORDER BY occurred_at DESC, id DESC`;
  return rows.map((row) => mapActivation(row as Record<string, unknown>));
}

export async function createActivation(input: ActivationInput) {
  const entry: PanelActivation = {
    id: 0,
    title: input.title.trim(),
    youtubeUrl: input.youtubeUrl.trim(),
    occurredAt: input.occurredAt.slice(0, 10),
    enabled: input.enabled,
    createdAt: iso(),
  };
  const sql = getSql();
  if (!sql) {
    entry.id = nextId(memory(), "activations");
    memory().activations.unshift(entry);
    return entry;
  }
  await ensurePanelSchema();
  const rows = await sql`
    INSERT INTO panel_activations (title, youtube_url, occurred_at, enabled)
    VALUES (${entry.title}, ${entry.youtubeUrl}, ${entry.occurredAt}, ${entry.enabled})
    RETURNING *
  `;
  return mapActivation(rows[0] as Record<string, unknown>);
}

export async function updateActivation(id: number, input: ActivationInput) {
  const sql = getSql();
  if (!sql) {
    const current = memory().activations.find((item) => item.id === id);
    if (!current) return null;
    Object.assign(current, {
      title: input.title.trim(),
      youtubeUrl: input.youtubeUrl.trim(),
      occurredAt: input.occurredAt.slice(0, 10),
      enabled: input.enabled,
    });
    return current;
  }
  await ensurePanelSchema();
  await sql`
    UPDATE panel_activations
    SET
      title = ${input.title.trim()},
      youtube_url = ${input.youtubeUrl.trim()},
      occurred_at = ${input.occurredAt.slice(0, 10)},
      enabled = ${input.enabled}
    WHERE id = ${id}
  `;
  const rows = await sql`SELECT * FROM panel_activations WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapActivation(rows[0] as Record<string, unknown>) : null;
}

export async function toggleActivation(id: number) {
  const sql = getSql();
  if (!sql) {
    const current = memory().activations.find((item) => item.id === id);
    if (!current) return null;
    current.enabled = !current.enabled;
    return current;
  }
  await ensurePanelSchema();
  await sql`UPDATE panel_activations SET enabled = NOT enabled WHERE id = ${id}`;
  const rows = await sql`SELECT * FROM panel_activations WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapActivation(rows[0] as Record<string, unknown>) : null;
}

export async function deleteActivation(id: number) {
  const sql = getSql();
  if (!sql) {
    memory().activations = memory().activations.filter((item) => item.id !== id);
    memory().activationPermissions = memory().activationPermissions.filter((item) => item.activationId !== id);
    return;
  }
  await ensurePanelSchema();
  await sql`DELETE FROM panel_activations WHERE id = ${id}`;
}

export async function listSpecialRooms(): Promise<PanelSpecialRoom[]> {
  const sql = getSql();
  if (!sql) {
    return [...memory().specialRooms].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.id - a.id);
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT * FROM panel_special_rooms ORDER BY occurred_at DESC, id DESC`;
  return rows.map((row) => mapActivation(row as Record<string, unknown>));
}

export async function createSpecialRoom(input: SpecialRoomInput) {
  const entry: PanelSpecialRoom = {
    id: 0,
    title: input.title.trim(),
    youtubeUrl: input.youtubeUrl.trim(),
    occurredAt: input.occurredAt.slice(0, 10),
    enabled: input.enabled,
    createdAt: iso(),
  };
  const sql = getSql();
  if (!sql) {
    entry.id = nextId(memory(), "specialRooms");
    memory().specialRooms.unshift(entry);
    return entry;
  }
  await ensurePanelSchema();
  const rows = await sql`
    INSERT INTO panel_special_rooms (title, youtube_url, occurred_at, enabled)
    VALUES (${entry.title}, ${entry.youtubeUrl}, ${entry.occurredAt}, ${entry.enabled})
    RETURNING *
  `;
  return mapActivation(rows[0] as Record<string, unknown>);
}

export async function updateSpecialRoom(id: number, input: SpecialRoomInput) {
  const sql = getSql();
  if (!sql) {
    const current = memory().specialRooms.find((item) => item.id === id);
    if (!current) return null;
    Object.assign(current, {
      title: input.title.trim(),
      youtubeUrl: input.youtubeUrl.trim(),
      occurredAt: input.occurredAt.slice(0, 10),
      enabled: input.enabled,
    });
    return current;
  }
  await ensurePanelSchema();
  await sql`
    UPDATE panel_special_rooms
    SET
      title = ${input.title.trim()},
      youtube_url = ${input.youtubeUrl.trim()},
      occurred_at = ${input.occurredAt.slice(0, 10)},
      enabled = ${input.enabled}
    WHERE id = ${id}
  `;
  const rows = await sql`SELECT * FROM panel_special_rooms WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapActivation(rows[0] as Record<string, unknown>) : null;
}

export async function toggleSpecialRoom(id: number) {
  const sql = getSql();
  if (!sql) {
    const current = memory().specialRooms.find((item) => item.id === id);
    if (!current) return null;
    current.enabled = !current.enabled;
    return current;
  }
  await ensurePanelSchema();
  await sql`UPDATE panel_special_rooms SET enabled = NOT enabled WHERE id = ${id}`;
  const rows = await sql`SELECT * FROM panel_special_rooms WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapActivation(rows[0] as Record<string, unknown>) : null;
}

export async function deleteSpecialRoom(id: number) {
  const sql = getSql();
  if (!sql) {
    memory().specialRooms = memory().specialRooms.filter((item) => item.id !== id);
    return;
  }
  await ensurePanelSchema();
  await sql`DELETE FROM panel_special_rooms WHERE id = ${id}`;
}

export async function updateEventStatus(id: number, status: EventStatus) {
  const sql = getSql();
  if (!sql) {
    const event = memory().events.find((item) => item.id === id);
    if (event) event.status = status;
    return;
  }
  await ensurePanelSchema();
  await sql`UPDATE panel_events SET status = ${status} WHERE id = ${id}`;
}

export async function listRegistrations(userId?: number): Promise<PanelRegistration[]> {
  const sql = getSql();
  if (!sql) {
    const store = memory();
    const rows = userId
      ? store.registrations.filter((item) => item.userId === userId)
      : store.registrations;
    return hydrateRegistrations(rows, store.events, store.users);
  }
  await ensurePanelSchema();
  const rows = userId
    ? await sql`
        SELECT r.*, e.title AS event_title, e.starts_at AS event_starts_at, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
        FROM panel_registrations r
        JOIN panel_events e ON e.id = r.event_id
        JOIN panel_users u ON u.id = r.user_id
        WHERE r.user_id = ${userId}
        ORDER BY r.created_at DESC
      `
    : await sql`
        SELECT r.*, e.title AS event_title, e.starts_at AS event_starts_at, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
        FROM panel_registrations r
        JOIN panel_events e ON e.id = r.event_id
        JOIN panel_users u ON u.id = r.user_id
        ORDER BY r.created_at DESC
      `;
  return rows.map((row) => ({
    id: Number(row.id),
    eventId: Number(row.event_id),
    userId: Number(row.user_id),
    status: (row.status as RegistrationStatus) || "confirmed",
    notes: String(row.notes ?? ""),
    createdAt: iso(new Date(String(row.created_at))),
    eventTitle: String(row.event_title),
    eventStartsAt: iso(new Date(String(row.event_starts_at))),
    userName: String(row.user_name),
    userEmail: String(row.user_email),
    userPhone: String(row.user_phone ?? ""),
  }));
}

export async function registerToEvent(input: {
  eventId: number;
  userId: number;
  notes?: string;
}): Promise<{ registration?: PanelRegistration; error?: string }> {
  const events = await listEvents();
  const event = events.find((item) => item.id === input.eventId);
  if (!event) return { error: "El encuentro no existe." };
  if (event.status !== "open") return { error: "Este encuentro no está abierto a inscripción." };
  if (!isEventJoinOpen(event.registrationDeadline)) {
    return { error: "La inscripción de este encuentro ya cerró." };
  }

  const existing = (await listRegistrations(input.userId)).find(
    (item) => item.eventId === input.eventId && item.status !== "cancelled",
  );
  if (existing) return { error: "Ya estás inscripta/o en este encuentro." };

  const status: RegistrationStatus =
    event.registeredCount >= event.capacity ? "waitlist" : "confirmed";

  const sql = getSql();
  if (!sql) {
    const store = memory();
    const cancelled = store.registrations.find(
      (item) => item.eventId === input.eventId && item.userId === input.userId,
    );
    if (cancelled) {
      cancelled.status = status;
      cancelled.notes = input.notes ?? "";
    } else {
      store.registrations.push({
        id: nextId(store, "registrations"),
        eventId: input.eventId,
        userId: input.userId,
        status,
        notes: input.notes ?? "",
        createdAt: iso(),
      });
    }
    const rows = await listRegistrations(input.userId);
    return { registration: rows.find((item) => item.eventId === input.eventId) };
  }

  await ensurePanelSchema();
  await sql`
    INSERT INTO panel_registrations (event_id, user_id, status, notes)
    VALUES (${input.eventId}, ${input.userId}, ${status}, ${input.notes ?? ""})
    ON CONFLICT (event_id, user_id)
    DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes
  `;
  const rows = await listRegistrations(input.userId);
  return { registration: rows.find((item) => item.eventId === input.eventId) };
}

export async function cancelRegistration(id: number, userId?: number) {
  const sql = getSql();
  if (!sql) {
    const registration = memory().registrations.find((item) => item.id === id);
    if (registration && (!userId || registration.userId === userId)) {
      registration.status = "cancelled";
    }
    return;
  }
  await ensurePanelSchema();
  if (userId) {
    await sql`UPDATE panel_registrations SET status = 'cancelled' WHERE id = ${id} AND user_id = ${userId}`;
    return;
  }
  await sql`UPDATE panel_registrations SET status = 'cancelled' WHERE id = ${id}`;
}

function flag(value: unknown) {
  return value === true || value === "true" || value === "t" || value === 1 || value === "1";
}

function applicationName(firstName: string, lastName: string, fallback = "") {
  return `${firstName} ${lastName}`.trim() || fallback;
}

function buildApplication(
  input: Partial<PanelApplication> & { email: string; createdAt?: string; id?: number },
): PanelApplication {
  const fromName = splitName(String(input.name ?? ""));
  const firstName = String(input.firstName ?? fromName.nombres);
  const lastName = String(input.lastName ?? fromName.apellidos);
  const name = applicationName(firstName, lastName, String(input.name ?? ""));
  return {
    id: input.id ?? 0,
    name,
    firstName,
    lastName,
    email: input.email.trim().toLowerCase(),
    dni: String(input.dni ?? ""),
    phone: String(input.phone ?? ""),
    birthDate: String(input.birthDate ?? ""),
    residence: String(input.residence ?? ""),
    isEncuentros: Boolean(input.isEncuentros),
    isSpecialRoom: Boolean(input.isSpecialRoom),
    interest: String(input.interest ?? ""),
    message: String(input.message ?? ""),
    status: input.status ?? "pending",
    createdAt: input.createdAt ?? iso(),
  };
}

function mapApplication(row: Record<string, unknown>): PanelApplication {
  return buildApplication({
    id: Number(row.id),
    name: String(row.name ?? ""),
    firstName: String(row.firstName ?? row.first_name ?? ""),
    lastName: String(row.lastName ?? row.last_name ?? ""),
    email: String(row.email ?? ""),
    dni: String(row.dni ?? ""),
    phone: String(row.phone ?? ""),
    birthDate: String(row.birthDate ?? row.birth_date ?? ""),
    residence: String(row.residence ?? ""),
    isEncuentros: flag(row.isEncuentros ?? row.is_encuentros),
    isSpecialRoom: flag(row.isSpecialRoom ?? row.is_special_room),
    interest: String(row.interest ?? ""),
    message: String(row.message ?? ""),
    status: (row.status as ApplicationStatus) || "pending",
    createdAt: iso(new Date(String(row.createdAt ?? row.created_at))),
  });
}

export async function listApplications(): Promise<PanelApplication[]> {
  const sql = getSql();
  if (!sql) {
    return [...memory().applications]
      .map((item) => buildApplication(item))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT * FROM panel_applications ORDER BY created_at DESC`;
  return rows.map((row) => mapApplication(row as Record<string, unknown>));
}

export async function getApplicationById(id: number) {
  const rows = await listApplications();
  return rows.find((item) => item.id === id) ?? null;
}

export async function createApplication(input: ApplicationInput) {
  const application = buildApplication({
    ...input,
    email: input.email,
    createdAt: iso(),
  });
  const sql = getSql();
  if (!sql) {
    const store = memory();
    application.id = nextId(store, "applications");
    store.applications.unshift(application);
    return application;
  }
  await ensurePanelSchema();
  const rows = await sql`
    INSERT INTO panel_applications (
      name, first_name, last_name, email, dni, phone, birth_date, residence,
      is_encuentros, is_special_room, interest, message, status, created_at
    )
    VALUES (
      ${application.name}, ${application.firstName}, ${application.lastName}, ${application.email},
      ${application.dni}, ${application.phone}, ${application.birthDate}, ${application.residence},
      ${application.isEncuentros}, ${application.isSpecialRoom}, ${application.interest},
      ${application.message}, ${application.status}, ${application.createdAt}
    )
    RETURNING *
  `;
  return mapApplication(rows[0] as Record<string, unknown>);
}

export async function updateApplication(id: number, input: ApplicationInput) {
  const current = await getApplicationById(id);
  if (!current) return null;
  const next = buildApplication({
    ...current,
    ...input,
    id,
    email: input.email || current.email,
    createdAt: current.createdAt,
  });
  const sql = getSql();
  if (!sql) {
    const index = memory().applications.findIndex((item) => item.id === id);
    if (index >= 0) memory().applications[index] = next;
    return next;
  }
  await ensurePanelSchema();
  await sql`
    UPDATE panel_applications
    SET
      name = ${next.name},
      first_name = ${next.firstName},
      last_name = ${next.lastName},
      email = ${next.email},
      dni = ${next.dni},
      phone = ${next.phone},
      birth_date = ${next.birthDate},
      residence = ${next.residence},
      is_encuentros = ${next.isEncuentros},
      is_special_room = ${next.isSpecialRoom},
      interest = ${next.interest},
      message = ${next.message}
    WHERE id = ${id}
  `;
  return next;
}

export async function deleteApplication(id: number) {
  const sql = getSql();
  if (!sql) {
    memory().applications = memory().applications.filter((item) => item.id !== id);
    return;
  }
  await ensurePanelSchema();
  await sql`DELETE FROM panel_applications WHERE id = ${id}`;
}

export async function updateApplicationStatus(id: number, status: ApplicationStatus) {
  const sql = getSql();
  if (!sql) {
    const application = memory().applications.find((item) => item.id === id);
    if (application) application.status = status;
    return application ?? null;
  }
  await ensurePanelSchema();
  await sql`UPDATE panel_applications SET status = ${status} WHERE id = ${id}`;
  return getApplicationById(id);
}

export async function listPayments(): Promise<PanelPayment[]> {
  const sql = getSql();
  if (!sql) {
    const store = memory();
    return store.payments
      .map((payment) => ({
        ...payment,
        userName: store.users.find((user) => user.id === payment.userId)?.name ?? "Integrante",
      }))
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  }
  await ensurePanelSchema();
  const rows = await sql`
    SELECT p.*, u.name AS user_name
    FROM panel_payments p
    JOIN panel_users u ON u.id = p.user_id
    ORDER BY p.paid_at DESC
  `;
  return rows.map((row) => ({
    id: Number(row.id),
    userId: Number(row.user_id),
    amountCents: Number(row.amount_cents),
    currency: String(row.currency ?? "ARS"),
    method: String(row.method ?? ""),
    reference: String(row.reference ?? ""),
    paidAt: iso(new Date(String(row.paid_at))),
    notes: String(row.notes ?? ""),
    userName: String(row.user_name),
  }));
}

export async function createPayment(input: {
  userId: number;
  amountCents: number;
  currency: string;
  method: string;
  reference: string;
  paidAt: string;
  notes: string;
}) {
  const sql = getSql();
  if (!sql) {
    memory().payments.unshift({
      id: nextId(memory(), "payments"),
      userId: input.userId,
      amountCents: input.amountCents,
      currency: input.currency,
      method: input.method,
      reference: input.reference,
      paidAt: new Date(input.paidAt).toISOString(),
      notes: input.notes,
    });
    return;
  }
  await ensurePanelSchema();
  await sql`
    INSERT INTO panel_payments (user_id, amount_cents, currency, method, reference, paid_at, notes)
    VALUES (${input.userId}, ${input.amountCents}, ${input.currency}, ${input.method}, ${input.reference}, ${input.paidAt}, ${input.notes})
  `;
}

export async function listDues(): Promise<PanelDue[]> {
  const sql = getSql();
  if (!sql) {
    const store = memory();
    return store.dues
      .map((due) => ({
        ...due,
        status:
          due.status === "pending" && due.dueDate < iso().slice(0, 10) ? "overdue" : due.status,
        userName: store.users.find((user) => user.id === due.userId)?.name ?? "Integrante",
      }))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }
  await ensurePanelSchema();
  await sql`
    UPDATE panel_dues
    SET status = 'overdue'
    WHERE status = 'pending' AND due_date < CURRENT_DATE
  `;
  const rows = await sql`
    SELECT d.*, u.name AS user_name
    FROM panel_dues d
    JOIN panel_users u ON u.id = d.user_id
    ORDER BY d.due_date ASC
  `;
  return rows.map((row) => ({
    id: Number(row.id),
    userId: Number(row.user_id),
    period: String(row.period),
    amountCents: Number(row.amount_cents),
    currency: String(row.currency ?? "ARS"),
    dueDate: String(row.due_date).slice(0, 10),
    status: (row.status as DueStatus) || "pending",
    userName: String(row.user_name),
  }));
}

export async function generateMonthlyDues() {
  const settings = await getSettings();
  const period = currentPeriod();
  const dueDate = `${period}-10`;
  const users = (await listUsers()).filter((user) => user.status === "active");
  const existing = await listDues();
  for (const user of users) {
    if (existing.some((due) => due.userId === user.id && due.period === period)) continue;
    const sql = getSql();
    if (!sql) {
      memory().dues.push({
        id: nextId(memory(), "dues"),
        userId: user.id,
        period,
        amountCents: settings.monthlyDueCents,
        currency: settings.currency,
        dueDate,
        status: "pending",
      });
      continue;
    }
    await ensurePanelSchema();
    await sql`
      INSERT INTO panel_dues (user_id, period, amount_cents, currency, due_date, status)
      VALUES (${user.id}, ${period}, ${settings.monthlyDueCents}, ${settings.currency}, ${dueDate}, 'pending')
      ON CONFLICT (user_id, period) DO NOTHING
    `;
  }
  return period;
}

export async function updateDueStatus(id: number, status: DueStatus) {
  const sql = getSql();
  if (!sql) {
    const due = memory().dues.find((item) => item.id === id);
    if (due) due.status = status;
    return due ?? null;
  }
  await ensurePanelSchema();
  await sql`UPDATE panel_dues SET status = ${status} WHERE id = ${id}`;
  const dues = await listDues();
  return dues.find((item) => item.id === id) ?? null;
}

export async function listAudit(): Promise<PanelAudit[]> {
  const sql = getSql();
  if (!sql) {
    return [...memory().audit].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT * FROM panel_audit ORDER BY created_at DESC LIMIT 80`;
  return rows.map((row) => ({
    id: Number(row.id),
    actorEmail: String(row.actor_email),
    action: String(row.action),
    entityType: String(row.entity_type),
    entityId: row.entity_id == null ? null : Number(row.entity_id),
    detail: String(row.detail ?? ""),
    createdAt: iso(new Date(String(row.created_at))),
  }));
}

export async function listInvitations(): Promise<PanelInvitation[]> {
  const sql = getSql();
  if (!sql) {
    return [...memory().invitations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT * FROM panel_invitations ORDER BY created_at DESC`;
  return rows.map((row) => ({
    id: Number(row.id),
    email: String(row.email),
    role: parseRole(String(row.role ?? "Usuario")),
    createdAt: iso(new Date(String(row.created_at))),
  }));
}

export async function createInvitation(input: { email: string; role: UserRole }) {
  const email = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(email);
  if (!existing) {
    await createUser({
      email,
      name: email.split("@")[0] || "Invitada/o",
      role: input.role,
      status: "invited",
    });
  }
  const sql = getSql();
  if (!sql) {
    memory().invitations.unshift({
      id: nextId(memory(), "invitations"),
      email,
      role: input.role,
      createdAt: iso(),
    });
    return;
  }
  await ensurePanelSchema();
  await sql`INSERT INTO panel_invitations (email, role) VALUES (${email}, ${input.role})`;
}

function defaultZoomMeetings(): ZoomMeetingInput[] {
  return [
    {
      title: "Encuentros Conciencia Estelar",
      joinUrl: "https://zoom.us/j/9043157896",
      meetingId: "904 315 7896",
      passcode: "7YApr9",
      notes: "Si requeris asistencia en algo referido al zoom comunicate al +5492216014212",
    },
  ];
}

function defaultBankMovements(): BankMovementInput[] {
  return [
    {
      occurredAt: "2026-06-10T13:00:00.000Z",
      reference: "COMPROBANTE-173065698740",
      concept: "Transferencia recibida Valeria Victoria Gómez",
      amountCents: 4500000,
      currency: "ARS",
    },
    {
      occurredAt: "2026-07-02T14:30:00.000Z",
      reference: "COMPROBANTE-168289976070",
      concept: "Transferencia recibida Agustina Cardozo",
      amountCents: 8000000,
      currency: "ARS",
    },
    {
      occurredAt: "2026-07-18T15:00:00.000Z",
      reference: "168289976070",
      concept: "Pago con QR Mateu Sports",
      amountCents: -2719000,
      currency: "ARS",
    },
    {
      occurredAt: "2026-07-22T18:00:00.000Z",
      reference: "COMPROBANTE-COELSA-2",
      concept: "Transferencia recibida Daniela Maria Azar",
      amountCents: 2500000,
      currency: "ARS",
    },
    {
      occurredAt: "2026-08-05T12:30:00.000Z",
      reference: "USD-80",
      concept: "Acreditación USD membresía",
      amountCents: 8000,
      currency: "USD",
    },
    {
      occurredAt: "2026-08-16T12:00:00.000Z",
      reference: "COMPROBANTE-COELSA",
      concept: "Transferencia recibida Cintia Pamela Ortiz",
      amountCents: 8000000,
      currency: "ARS",
    },
  ];
}

function defaultPadronEntries(): PadronInput[] {
  const extras: PadronInput[] = [
    {
      firstName: "Estefania",
      lastName: "Aguilera",
      dni: "3613195",
      birthDate: "1991-10-26",
      email: "aguileraestafania@gmail.com",
      phone: "3548546840",
      residence: "Huerta grande .Córdoba",
    },
    {
      firstName: "Daniela Maria",
      lastName: "Azar",
      dni: "",
      birthDate: "1963-09-03",
      email: "danielaazar24@gmail.com",
      phone: "3516858246",
      residence: "Cordoba",
    },
  ];
  return [
    ...extras,
    ...seedPadronPeople.map((person) => {
      const names = splitName(person.name);
      return {
        firstName: names.nombres,
        lastName: names.apellidos,
        dni: "",
        birthDate: "",
        email: person.email,
        phone: person.phone,
        residence: "",
      };
    }),
  ];
}

function mapPadron(row: Record<string, unknown>): PanelPadronPerson {
  return {
    id: Number(row.id),
    firstName: String(row.firstName ?? row.first_name ?? ""),
    lastName: String(row.lastName ?? row.last_name ?? ""),
    dni: String(row.dni ?? ""),
    birthDate: String(row.birthDate ?? row.birth_date ?? ""),
    email: String(row.email ?? "").toLowerCase(),
    phone: String(row.phone ?? ""),
    residence: String(row.residence ?? ""),
    createdAt: iso(new Date(String(row.createdAt ?? row.created_at ?? Date.now()))),
  };
}

export async function listPadron(): Promise<PanelPadronPerson[]> {
  const sql = getSql();
  if (!sql) {
    return [...memory().padron].sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "es"),
    );
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT * FROM panel_padron ORDER BY last_name ASC, first_name ASC`;
  return rows.map((row) => mapPadron(row as Record<string, unknown>));
}

export async function createPadronEntry(input: PadronInput) {
  const entry: PanelPadronPerson = {
    id: 0,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    dni: input.dni.trim(),
    birthDate: input.birthDate.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    residence: input.residence.trim(),
    createdAt: iso(),
  };
  const sql = getSql();
  if (!sql) {
    entry.id = nextId(memory(), "padron");
    memory().padron.unshift(entry);
    return entry;
  }
  await ensurePanelSchema();
  const rows = await sql`
    INSERT INTO panel_padron (first_name, last_name, dni, birth_date, email, phone, residence)
    VALUES (${entry.firstName}, ${entry.lastName}, ${entry.dni}, ${entry.birthDate}, ${entry.email}, ${entry.phone}, ${entry.residence})
    RETURNING *
  `;
  return mapPadron(rows[0] as Record<string, unknown>);
}

export async function updatePadronEntry(id: number, input: PadronInput) {
  const sql = getSql();
  if (!sql) {
    const current = memory().padron.find((item) => item.id === id);
    if (!current) return null;
    Object.assign(current, {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      dni: input.dni.trim(),
      birthDate: input.birthDate.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      residence: input.residence.trim(),
    });
    return current;
  }
  await ensurePanelSchema();
  await sql`
    UPDATE panel_padron
    SET
      first_name = ${input.firstName.trim()},
      last_name = ${input.lastName.trim()},
      dni = ${input.dni.trim()},
      birth_date = ${input.birthDate.trim()},
      email = ${input.email.trim().toLowerCase()},
      phone = ${input.phone.trim()},
      residence = ${input.residence.trim()}
    WHERE id = ${id}
  `;
  const rows = await sql`SELECT * FROM panel_padron WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapPadron(rows[0] as Record<string, unknown>) : null;
}

export async function deletePadronEntry(id: number) {
  const sql = getSql();
  if (!sql) {
    memory().padron = memory().padron.filter((item) => item.id !== id);
    return;
  }
  await ensurePanelSchema();
  await sql`DELETE FROM panel_padron WHERE id = ${id}`;
}

export async function findPadronByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const people = await listPadron();
  return people.find((item) => item.email === normalized) ?? null;
}

export async function listMembershipUsers() {
  const users = await listUsers();
  return (users ?? []).filter((user) => user.role === "Usuario Membresía");
}

export async function listActivationPermissionIds(userId: number) {
  if (!userId) return [];
  const all = await listActivationPermissionsByUser();
  return all[userId] ?? [];
}

export async function listActivationPermissionsByUser() {
  const grouped: Record<number, number[]> = {};
  const sql = getSql();
  if (!sql) {
    for (const item of memory().activationPermissions) {
      grouped[item.userId] ??= [];
      grouped[item.userId].push(item.activationId);
    }
    return grouped;
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT user_id, activation_id FROM panel_membership_permissions`;
  for (const row of rows) {
    const userId = Number(row.user_id);
    grouped[userId] ??= [];
    grouped[userId].push(Number(row.activation_id));
  }
  return grouped;
}

export async function saveActivationPermissions(userId: number, activationIds: number[]) {
  const unique = [...new Set(activationIds.filter((id) => Number.isFinite(id) && id > 0))];
  const sql = getSql();
  if (!sql) {
    const store = memory();
    store.activationPermissions = store.activationPermissions.filter((item) => item.userId !== userId);
    for (const activationId of unique) {
      store.activationPermissions.push({
        id: nextId(store, "activationPermissions"),
        userId,
        activationId,
      });
    }
    return unique;
  }
  await ensurePanelSchema();
  await sql`DELETE FROM panel_membership_permissions WHERE user_id = ${userId}`;
  for (const activationId of unique) {
    await sql`
      INSERT INTO panel_membership_permissions (user_id, activation_id)
      VALUES (${userId}, ${activationId})
      ON CONFLICT DO NOTHING
    `;
  }
  return unique;
}

export async function importPadronEntries(entries: PadronInput[]) {
  let created = 0;
  for (const entry of entries) {
    if (!entry.firstName && !entry.lastName && !entry.email) continue;
    await createPadronEntry(entry);
    created += 1;
  }
  return created;
}

function mapManualPayment(row: Record<string, unknown>): PanelManualPayment {
  return {
    id: Number(row.id),
    padronId: Number(row.padron_id ?? row.padronId),
    period: String(row.period ?? ""),
    amountCents: Number(row.amount_cents ?? row.amountCents ?? 0),
    currency: String(row.currency ?? "ARS"),
    method: String(row.method ?? "Manual"),
    paidAt: iso(new Date(String(row.paid_at ?? row.paidAt))),
    notes: String(row.notes ?? ""),
  };
}

export async function listManualPayments(): Promise<PanelManualPayment[]> {
  const sql = getSql();
  if (!sql) {
    return [...memory().manualPayments].sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT * FROM panel_manual_payments ORDER BY paid_at DESC`;
  return rows.map((row) => mapManualPayment(row as Record<string, unknown>));
}

export async function upsertManualPayment(input: ManualPaymentInput) {
  const paidAt = new Date(input.paidAt || Date.now()).toISOString();
  const sql = getSql();
  if (!sql) {
    const store = memory();
    const current = store.manualPayments.find(
      (item) => item.padronId === input.padronId && item.period === input.period,
    );
    if (current) {
      Object.assign(current, {
        amountCents: input.amountCents,
        currency: input.currency,
        method: input.method,
        paidAt,
        notes: input.notes,
      });
      return current;
    }
    const created: PanelManualPayment = {
      id: nextId(store, "manualPayments"),
      padronId: input.padronId,
      period: input.period,
      amountCents: input.amountCents,
      currency: input.currency,
      method: input.method,
      paidAt,
      notes: input.notes,
    };
    store.manualPayments.unshift(created);
    return created;
  }
  await ensurePanelSchema();
  const rows = await sql`
    INSERT INTO panel_manual_payments (padron_id, period, amount_cents, currency, method, paid_at, notes)
    VALUES (${input.padronId}, ${input.period}, ${input.amountCents}, ${input.currency}, ${input.method}, ${paidAt}, ${input.notes})
    ON CONFLICT (padron_id, period) DO UPDATE SET
      amount_cents = EXCLUDED.amount_cents,
      currency = EXCLUDED.currency,
      method = EXCLUDED.method,
      paid_at = EXCLUDED.paid_at,
      notes = EXCLUDED.notes
    RETURNING *
  `;
  return mapManualPayment(rows[0] as Record<string, unknown>);
}

export async function deleteManualPayment(id: number) {
  const sql = getSql();
  if (!sql) {
    memory().manualPayments = memory().manualPayments.filter((item) => item.id !== id);
    return;
  }
  await ensurePanelSchema();
  await sql`DELETE FROM panel_manual_payments WHERE id = ${id}`;
}

function parseBankCurrency(value: string): BankCurrency {
  return value === "USD" ? "USD" : "ARS";
}

function mapBankMovement(row: Record<string, unknown>): PanelBankMovement {
  return {
    id: Number(row.id),
    occurredAt: iso(new Date(String(row.occurred_at ?? row.occurredAt))),
    reference: String(row.reference ?? ""),
    concept: String(row.concept ?? ""),
    amountCents: Number(row.amount_cents ?? row.amountCents ?? 0),
    currency: parseBankCurrency(String(row.currency ?? "ARS")),
    createdAt: iso(new Date(String(row.created_at ?? row.createdAt ?? Date.now()))),
  };
}

export async function getBankExtractMeta(): Promise<BankExtractMeta> {
  const sql = getSql();
  if (!sql) {
    return { ...memory().bankExtract };
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT value FROM panel_settings WHERE key = 'bankExtract' LIMIT 1`;
  if (!rows[0]?.value) return { ...defaultBankExtractMeta };
  try {
    const parsed = JSON.parse(String(rows[0].value)) as Partial<BankExtractMeta>;
    return {
      initialBalanceCents: Number(parsed.initialBalanceCents ?? defaultBankExtractMeta.initialBalanceCents),
      initialBalanceUsdCents: Number(
        parsed.initialBalanceUsdCents ?? defaultBankExtractMeta.initialBalanceUsdCents,
      ),
      initialBalanceDate: String(parsed.initialBalanceDate ?? defaultBankExtractMeta.initialBalanceDate),
    };
  } catch {
    return { ...defaultBankExtractMeta };
  }
}

export async function saveBankExtractMeta(meta: BankExtractMeta) {
  const next = {
    initialBalanceCents: meta.initialBalanceCents,
    initialBalanceUsdCents: meta.initialBalanceUsdCents,
    initialBalanceDate: meta.initialBalanceDate,
  };
  const sql = getSql();
  if (!sql) {
    memory().bankExtract = next;
    return next;
  }
  await ensurePanelSchema();
  await sql`
    INSERT INTO panel_settings (key, value)
    VALUES ('bankExtract', ${JSON.stringify(next)})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
  return next;
}

export async function listBankMovements(): Promise<PanelBankMovement[]> {
  const sql = getSql();
  if (!sql) {
    return [...memory().bankMovements].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.id - a.id);
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT * FROM panel_bank_movements ORDER BY occurred_at DESC, id DESC`;
  return rows.map((row) => mapBankMovement(row as Record<string, unknown>));
}

export async function createBankMovement(input: BankMovementInput) {
  const entry: PanelBankMovement = {
    id: 0,
    occurredAt: new Date(input.occurredAt).toISOString(),
    reference: input.reference.trim(),
    concept: input.concept.trim(),
    amountCents: input.amountCents,
    currency: parseBankCurrency(input.currency),
    createdAt: iso(),
  };
  const sql = getSql();
  if (!sql) {
    entry.id = nextId(memory(), "bankMovements");
    memory().bankMovements.unshift(entry);
    return entry;
  }
  await ensurePanelSchema();
  const rows = await sql`
    INSERT INTO panel_bank_movements (occurred_at, reference, concept, amount_cents, currency)
    VALUES (${entry.occurredAt}, ${entry.reference}, ${entry.concept}, ${entry.amountCents}, ${entry.currency})
    RETURNING *
  `;
  return mapBankMovement(rows[0] as Record<string, unknown>);
}

export async function updateBankMovement(id: number, input: BankMovementInput) {
  const sql = getSql();
  if (!sql) {
    const current = memory().bankMovements.find((item) => item.id === id);
    if (!current) return null;
    Object.assign(current, {
      occurredAt: new Date(input.occurredAt).toISOString(),
      reference: input.reference.trim(),
      concept: input.concept.trim(),
      amountCents: input.amountCents,
      currency: parseBankCurrency(input.currency),
    });
    return current;
  }
  await ensurePanelSchema();
  await sql`
    UPDATE panel_bank_movements
    SET
      occurred_at = ${new Date(input.occurredAt).toISOString()},
      reference = ${input.reference.trim()},
      concept = ${input.concept.trim()},
      amount_cents = ${input.amountCents},
      currency = ${parseBankCurrency(input.currency)}
    WHERE id = ${id}
  `;
  const rows = await sql`SELECT * FROM panel_bank_movements WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapBankMovement(rows[0] as Record<string, unknown>) : null;
}

export async function updateBankMovementConcept(id: number, concept: string) {
  const sql = getSql();
  if (!sql) {
    const current = memory().bankMovements.find((item) => item.id === id);
    if (!current) return null;
    current.concept = concept.trim();
    return current;
  }
  await ensurePanelSchema();
  await sql`UPDATE panel_bank_movements SET concept = ${concept.trim()} WHERE id = ${id}`;
  const rows = await sql`SELECT * FROM panel_bank_movements WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapBankMovement(rows[0] as Record<string, unknown>) : null;
}

export async function deleteBankMovement(id: number) {
  const sql = getSql();
  if (!sql) {
    memory().bankMovements = memory().bankMovements.filter((item) => item.id !== id);
    return;
  }
  await ensurePanelSchema();
  await sql`DELETE FROM panel_bank_movements WHERE id = ${id}`;
}

export async function importBankMovements(entries: BankMovementInput[]) {
  const existing = await listBankMovements();
  const seen = new Set(
    existing.map((item) => `${item.occurredAt}|${item.reference}|${item.amountCents}|${item.currency}`),
  );
  let created = 0;
  for (const entry of entries) {
    if (!entry.occurredAt || entry.amountCents === 0) continue;
    const key = `${new Date(entry.occurredAt).toISOString()}|${entry.reference.trim()}|${entry.amountCents}|${parseBankCurrency(entry.currency)}`;
    if (seen.has(key)) continue;
    await createBankMovement(entry);
    seen.add(key);
    created += 1;
  }
  return created;
}

function mapReceipt(row: Record<string, unknown>): PanelPaymentReceipt {
  return {
    id: Number(row.id),
    fileName: String(row.file_name ?? row.fileName ?? ""),
    fileUrl: String(row.file_url ?? row.fileUrl ?? ""),
    kind: String(row.kind ?? "jpg") === "pdf" ? "pdf" : "jpg",
    amountCents: row.amount_cents == null && row.amountCents == null ? null : Number(row.amount_cents ?? row.amountCents),
    paidAt: String(row.paid_at ?? row.paidAt ?? ""),
    rawText: String(row.raw_text ?? row.rawText ?? ""),
    createdAt: iso(new Date(String(row.created_at ?? row.createdAt ?? Date.now()))),
  };
}

export async function listPaymentReceipts(): Promise<PanelPaymentReceipt[]> {
  const sql = getSql();
  if (!sql) {
    return [...memory().receipts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT * FROM panel_payment_receipts ORDER BY created_at DESC`;
  return rows.map((row) => mapReceipt(row as Record<string, unknown>));
}

export async function createPaymentReceipt(input: Omit<PanelPaymentReceipt, "id" | "createdAt">) {
  const entry: PanelPaymentReceipt = {
    id: 0,
    fileName: input.fileName,
    fileUrl: input.fileUrl,
    kind: input.kind,
    amountCents: input.amountCents,
    paidAt: input.paidAt,
    rawText: input.rawText,
    createdAt: iso(),
  };
  const sql = getSql();
  if (!sql) {
    entry.id = nextId(memory(), "receipts");
    memory().receipts.unshift(entry);
    return entry;
  }
  await ensurePanelSchema();
  const rows = await sql`
    INSERT INTO panel_payment_receipts (file_name, file_url, kind, amount_cents, paid_at, raw_text)
    VALUES (${entry.fileName}, ${entry.fileUrl}, ${entry.kind}, ${entry.amountCents}, ${entry.paidAt}, ${entry.rawText})
    RETURNING *
  `;
  return mapReceipt(rows[0] as Record<string, unknown>);
}

export async function getSettings(): Promise<PanelSettings> {
  const settings = defaultSettings();
  const sql = getSql();
  const source = sql ? null : memory().settings;
  if (!sql) {
    return { ...settings, ...source };
  }
  await ensurePanelSchema();
  const rows = await sql`SELECT key, value FROM panel_settings`;
  for (const row of rows) {
    const key = String(row.key) as keyof PanelSettings;
    if (!(key in settings)) continue;
    if (key === "monthlyDueCents") {
      settings.monthlyDueCents = Number(row.value);
    } else {
      (settings as Record<string, string | number>)[key] = String(row.value);
    }
  }
  return settings;
}

export async function saveSettings(settings: PanelSettings) {
  const sql = getSql();
  if (!sql) {
    memory().settings = settings;
    return;
  }
  await ensurePanelSchema();
  for (const [key, value] of Object.entries(settings)) {
    await sql`
      INSERT INTO panel_settings (key, value)
      VALUES (${key}, ${String(value)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
  }
}

export async function getPanelStats() {
  const [users, events, applications, dues] = await Promise.all([
    listUsers(),
    listEvents(),
    listApplications(),
    listDues(),
  ]);
  const pendingApplicants = applications.filter((item) => item.status === "pending");
  return {
    members: users.filter((user) => user.status === "active").length,
    openEvents: events.filter((event) => event.status === "open").length,
    pendingApplications: pendingApplicants.length,
    pendingApplicants: pendingApplicants.map((item) => ({
      id: item.id,
      firstName: item.firstName,
      lastName: item.lastName,
      name: item.name,
    })),
    pendingDues: dues.filter((item) => item.status === "pending" || item.status === "overdue").length,
  };
}
