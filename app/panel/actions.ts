"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import {
  cancelRegistration,
  createApplication,
  deleteApplication,
  getApplicationById,
  updateApplication,
  addCarouselSlide,
  createEvent,
  deleteCarouselSlide,
  deleteEvent,
  toggleCarouselSlide,
  createInvitation,
  createBankMovement,
  createPadronEntry,
  deleteBankMovement,
  deletePadronEntry,
  importBankMovements,
  importPadronEntries,
  saveBankExtractMeta,
  updateBankMovement,
  updateBankMovementConcept,
  updatePadronEntry,
  defaultBankExtractMeta,
  upsertManualPayment,
  deleteManualPayment,
  createActivation,
  createSpecialRoom,
  createBitacoraEntries,
  createBitacoraEntry,
  createZoomMeeting,
  deleteActivation,
  deleteSpecialRoom,
  deleteBitacoraEntry,
  deleteZoomMeeting,
  toggleActivation,
  toggleSpecialRoom,
  updateActivation,
  updateSpecialRoom,
  listBitacoraEntries,
  updateBitacoraEntry,
  updateZoomMeeting,
  createPayment,
  createPaymentReceipt,
  createUser,
  createUsersBulk,
  deleteUser,
  findUserByEmail,
  saveActivationPermissions,
  getUserById,
  parseRole,
  generateMonthlyDues,
  getSettings,
  logAudit,
  registerToEvent,
  saveSettings,
  updateApplicationStatus,
  updateDueStatus,
  updateEventStatus,
  updateUser,
  updateUserPassword,
  type ApplicationStatus,
  type BankMovementInput,
  type DueStatus,
  type EventStatus,
  type UserRole,
  type UserStatus,
} from "@/lib/panel-data";
import { parseBankAmount } from "@/lib/bank-extract";
import { fetchLinkTitle, isDriveUrl, parseBitacoraUrls } from "@/lib/drive-title";
import { fetchYouTubeTitle, isYouTubeUrl, youtubeWatchUrl } from "@/lib/youtube";
import { generatePadronPassword } from "@/lib/padron";
import { extractPdfText, parseReceiptText } from "@/lib/receipt-ocr";
import { savePanelImage, savePaymentReceipt } from "@/lib/uploads";

function refresh() {
  revalidatePath("/panel", "layout");
}

async function actor() {
  const user = await getSessionUser();
  if (!user) throw new Error("Sesión requerida");
  return user;
}

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export async function createUserAction(formData: FormData) {
  const actorUser = await actor();
  const email = text(formData, "email").toLowerCase();
  const name = text(formData, "name");
  if (!email || !name) return { error: "Completá nombre y email." };
  if (await findUserByEmail(email)) return { error: "Ya existe una persona con ese email." };

  const user = await createUser({
    email,
    name,
    password: text(formData, "password") || undefined,
    role: parseRole(text(formData, "role")),
    status: text(formData, "status") === "suspended" ? "suspended" : "active",
    phone: text(formData, "phone"),
    notes: text(formData, "notes"),
  });
  await logAudit({
    actorEmail: actorUser.email,
    action: "user.create",
    entityType: "user",
    entityId: user.id,
    detail: `Alta de ${user.name}`,
  });
  refresh();
  return { ok: true };
}

export async function updateUserAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  const roleValue = text(formData, "role");
  const user = await updateUser(id, {
    name: text(formData, "name") || undefined,
    email: text(formData, "email") ? text(formData, "email").toLowerCase() : undefined,
    role: roleValue ? parseRole(roleValue) : undefined,
    status: text(formData, "status")
      ? text(formData, "status") === "suspended"
        ? "suspended"
        : "active"
      : undefined,
    phone: formData.has("phone") ? text(formData, "phone") : undefined,
    notes: formData.has("notes") ? text(formData, "notes") : undefined,
  });
  if (!user) return { error: "No se encontró a la persona." };
  const password = text(formData, "password");
  if (password) await updateUserPassword(id, password);
  await logAudit({
    actorEmail: actorUser.email,
    action: "user.update",
    entityType: "user",
    entityId: user.id,
    detail: `Actualizó a ${user.name}`,
  });
  refresh();
  return { ok: true };
}

export async function inviteUserAction(formData: FormData) {
  const actorUser = await actor();
  const email = text(formData, "email").toLowerCase();
  const role: UserRole = parseRole(text(formData, "role"));
  if (!email) return { error: "Ingresá un email." };
  await createInvitation({ email, role });
  await logAudit({
    actorEmail: actorUser.email,
    action: "user.invite",
    entityType: "user",
    detail: `Invitó a ${email} como ${role}`,
  });
  refresh();
  return { ok: true };
}

export async function deleteUserAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  const target = await getUserById(id);
  if (!target) return { error: "No se encontró a la persona." };
  if (target.email === actorUser.email) {
    return { error: "No podés eliminar tu propio acceso." };
  }
  await deleteUser(id);
  await logAudit({
    actorEmail: actorUser.email,
    action: "user.delete",
    entityType: "user",
    entityId: id,
    detail: `Eliminó un usuario (#${id})`,
  });
  refresh();
  return { ok: true };
}

export async function toggleMembershipAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  const currentRole = parseRole(text(formData, "role"));
  const nextRole = currentRole === "Usuario Membresía" ? "Usuario" : "Usuario Membresía";
  const user = await updateUser(id, { role: nextRole });
  if (!user) return { error: "No se encontró a la persona." };
  await logAudit({
    actorEmail: actorUser.email,
    action: "user.update",
    entityType: "user",
    entityId: user.id,
    detail: `Cambió la membresía de ${user.name} a ${nextRole}`,
  });
  refresh();
  return { ok: true };
}

export async function createUsersBulkAction(formData: FormData) {
  const actorUser = await actor();
  const raw = text(formData, "payload");
  let items: Array<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
  }> = [];
  try {
    items = JSON.parse(raw) as typeof items;
  } catch {
    return { error: "No se pudo leer la selección." };
  }
  const created = await createUsersBulk(
    items.map((item) => ({
      ...item,
      role: parseRole(item.role),
    })),
  );
  await logAudit({
    actorEmail: actorUser.email,
    action: "user.bulk-create",
    entityType: "user",
    detail: `Creó ${created.length} usuario(s) desde el padrón`,
  });
  refresh();
  return { ok: true, created: created.length };
}

export async function createEventAction(formData: FormData) {
  const actorUser = await actor();
  const title = text(formData, "title");
  const startsAt = text(formData, "startsAt");
  if (!title || !startsAt) return { error: "Completá título y fecha." };
  const cover = formData.get("cover");
  let coverImageUrl = "";
  if (cover instanceof File && cover.size > 0) {
    const saved = await savePanelImage(cover);
    if (saved.error) return { error: saved.error };
    coverImageUrl = saved.url ?? "";
  }
  const event = await createEvent({
    title,
    program: text(formData, "program"),
    description: text(formData, "description"),
    startsAt,
    capacity: Number(formData.get("capacity") || 20),
    location: text(formData, "location"),
    materialsUrl: text(formData, "materialsUrl"),
    coverImageUrl,
    registrationDeadline: text(formData, "registrationDeadline"),
    status: "open",
  });
  await logAudit({
    actorEmail: actorUser.email,
    action: "event.create",
    entityType: "event",
    entityId: event.id,
    detail: `Creó el encuentro ${event.title}`,
  });
  refresh();
  return { ok: true };
}

export async function deleteEventAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  if (!id) return { error: "Encuentro inválido." };
  await deleteEvent(id);
  await logAudit({
    actorEmail: actorUser.email,
    action: "event.delete",
    entityType: "event",
    entityId: id,
    detail: "Eliminó un encuentro",
  });
  refresh();
  return { ok: true };
}

export async function addCarouselSlideAction(formData: FormData) {
  const actorUser = await actor();
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return { error: "Elegí una foto JPG." };
  }
  const saved = await savePanelImage(image);
  if (saved.error) return { error: saved.error };
  await addCarouselSlide(saved.url ?? "");
  await logAudit({
    actorEmail: actorUser.email,
    action: "carousel.create",
    entityType: "carousel",
    detail: "Agregó una foto al carrusel de la landing",
  });
  refresh();
  return { ok: true };
}

export async function toggleCarouselSlideAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  const visible = text(formData, "visible") === "true";
  await toggleCarouselSlide(id, visible);
  await logAudit({
    actorEmail: actorUser.email,
    action: "carousel.update",
    entityType: "carousel",
    entityId: id,
    detail: visible ? "Mostró una foto del carrusel" : "Ocultó una foto del carrusel",
  });
  refresh();
  return { ok: true };
}

export async function deleteCarouselSlideAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  await deleteCarouselSlide(id);
  await logAudit({
    actorEmail: actorUser.email,
    action: "carousel.delete",
    entityType: "carousel",
    entityId: id,
    detail: "Eliminó una foto del carrusel",
  });
  refresh();
  return { ok: true };
}

export async function updateEventStatusAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  const status = text(formData, "status") as EventStatus;
  await updateEventStatus(id, status);
  await logAudit({
    actorEmail: actorUser.email,
    action: "event.update",
    entityType: "event",
    entityId: id,
    detail: `Cambió el estado del encuentro a ${status}`,
  });
  refresh();
}

export async function registerEventAction(formData: FormData) {
  const actorUser = await actor();
  const eventId = Number(formData.get("eventId"));
  const user = await findUserByEmail(actorUser.email);
  if (!user) return { error: "No encontramos tu usuario." };
  const result = await registerToEvent({
    eventId,
    userId: user.id,
    notes: text(formData, "notes"),
  });
  if (result.error) return { error: result.error };
  await logAudit({
    actorEmail: actorUser.email,
    action: "registration.create",
    entityType: "registration",
    entityId: result.registration?.id,
    detail: `Se inscribió al encuentro #${eventId}`,
  });
  refresh();
  return { ok: true, status: result.registration?.status };
}

export async function cancelRegistrationAction(formData: FormData) {
  const actorUser = await actor();
  const user = await findUserByEmail(actorUser.email);
  await cancelRegistration(Number(formData.get("id")), user?.id);
  await logAudit({
    actorEmail: actorUser.email,
    action: "registration.cancel",
    entityType: "registration",
    entityId: Number(formData.get("id")),
    detail: "Canceló una inscripción",
  });
  refresh();
}

function applicationFromForm(formData: FormData) {
  const firstName = text(formData, "firstName");
  const lastName = text(formData, "lastName");
  return {
    firstName,
    lastName,
    name: text(formData, "name") || `${firstName} ${lastName}`.trim(),
    email: text(formData, "email").toLowerCase(),
    dni: text(formData, "dni"),
    phone: text(formData, "phone"),
    birthDate: text(formData, "birthDate"),
    residence: text(formData, "residence"),
    isEncuentros: formData.get("isEncuentros") === "on",
    isSpecialRoom: formData.get("isSpecialRoom") === "on",
    interest: text(formData, "interest"),
    message: text(formData, "message"),
  };
}

export async function createApplicationAction(formData: FormData) {
  const actorUser = await actor();
  const input = applicationFromForm(formData);
  if (!input.name || !input.email) return { error: "Completá nombre y email." };
  await createApplication(input);
  await logAudit({
    actorEmail: actorUser.email,
    action: "application.create",
    entityType: "application",
    detail: `Cargó solicitud de ${input.name}`,
  });
  refresh();
  return { ok: true };
}

export async function updateApplicationAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  const input = applicationFromForm(formData);
  if (!id || !input.name || !input.email) return { error: "Completá nombre y email." };
  const application = await updateApplication(id, input);
  if (!application) return { error: "No se encontró la solicitud." };
  await logAudit({
    actorEmail: actorUser.email,
    action: "application.update",
    entityType: "application",
    entityId: id,
    detail: `Editó la solicitud de ${application.name}`,
  });
  refresh();
  return { ok: true };
}

export async function deleteApplicationAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  if (!id) return { error: "Solicitud inválida." };
  await deleteApplication(id);
  await logAudit({
    actorEmail: actorUser.email,
    action: "application.delete",
    entityType: "application",
    entityId: id,
    detail: "Eliminó una solicitud",
  });
  refresh();
  return { ok: true };
}

export async function createUserFromApplicationAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  const application = await getApplicationById(id);
  if (!application) return { error: "No se encontró la solicitud." };
  if (!application.email) return { error: "La solicitud no tiene email." };
  const existing = await findUserByEmail(application.email);
  if (existing) return { error: "Ya existe un usuario con ese email." };
  const password = generatePadronPassword(application.firstName || application.name);
  const user = await createUser({
    email: application.email,
    name: application.name,
    password,
    phone: application.phone,
    role: application.isSpecialRoom ? "Usuario Membresía" : "Usuario",
    status: "active",
    notes: application.isSpecialRoom
      ? "Alta desde Quiero unirme · Membresía especial"
      : application.isEncuentros
        ? "Alta desde Quiero unirme · Encuentros"
        : "Alta desde Quiero unirme",
  });
  await updateApplicationStatus(id, "accepted");
  await logAudit({
    actorEmail: actorUser.email,
    action: "application.user",
    entityType: "application",
    entityId: id,
    detail: `Creó el usuario ${user.name} desde la solicitud`,
  });
  refresh();
  return { ok: true, password };
}

export async function reviewApplicationAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  const status = text(formData, "status") as ApplicationStatus;
  const application = await updateApplicationStatus(id, status);
  await logAudit({
    actorEmail: actorUser.email,
    action: "application.update",
    entityType: "application",
    entityId: id,
    detail: `Marcó la solicitud como ${status}`,
  });
  refresh();
}

export async function createPaymentAction(formData: FormData) {
  const actorUser = await actor();
  const userId = Number(formData.get("userId"));
  const amount = Number(formData.get("amount"));
  if (!userId || !amount) return { error: "Elegí una persona y un monto." };
  await createPayment({
    userId,
    amountCents: Math.round(amount * 100),
    currency: text(formData, "currency") || "ARS",
    method: text(formData, "method") || "Transferencia",
    reference: text(formData, "reference"),
    paidAt: text(formData, "paidAt") || new Date().toISOString(),
    notes: text(formData, "notes"),
  });
  await logAudit({
    actorEmail: actorUser.email,
    action: "payment.create",
    entityType: "payment",
    detail: `Registró un pago de ${amount}`,
  });
  refresh();
  return { ok: true };
}

export async function generateDuesAction(_formData?: FormData) {
  const actorUser = await actor();
  const period = await generateMonthlyDues();
  await logAudit({
    actorEmail: actorUser.email,
    action: "dues.generate",
    entityType: "due",
    detail: `Generó cuotas del período ${period}`,
  });
  refresh();
}

export async function updateDueAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  const status = text(formData, "status") as DueStatus;
  const due = await updateDueStatus(id, status);
  if (due && status === "paid") {
    await createPayment({
      userId: due.userId,
      amountCents: due.amountCents,
      currency: due.currency,
      method: "Cuota",
      reference: due.period,
      paidAt: new Date().toISOString(),
      notes: `Pago de cuota ${due.period}`,
    });
  }
  await logAudit({
    actorEmail: actorUser.email,
    action: "due.update",
    entityType: "due",
    entityId: id,
    detail: `Marcó la cuota como ${status}`,
  });
  refresh();
}

export async function saveSettingsAction(formData: FormData) {
  const actorUser = await actor();
  const current = await getSettings();
  const raw = text(formData, "payload");
  let parsed: Partial<typeof current> = {};
  if (raw) {
    try {
      parsed = JSON.parse(raw) as Partial<typeof current>;
    } catch {
      return { error: "No se pudo leer la configuración." };
    }
  }
  await saveSettings({
    ...current,
    ...parsed,
    spaceName: parsed.spaceName || text(formData, "spaceName") || current.spaceName,
    monthlyDueCents:
      typeof parsed.monthlyDueCents === "number"
        ? parsed.monthlyDueCents
        : Math.round(Number(formData.get("monthlyDue") || current.monthlyDueCents / 100) * 100),
    currency: parsed.currency || text(formData, "currency") || current.currency,
    welcomeText: parsed.welcomeText || text(formData, "welcomeText") || current.welcomeText,
    notifyEmail: parsed.notifyEmail || text(formData, "notifyEmail") || current.notifyEmail,
  });
  await logAudit({
    actorEmail: actorUser.email,
    action: "settings.update",
    entityType: "settings",
    detail: "Actualizó la configuración del espacio",
  });
  refresh();
  return { ok: true };
}

function padronFromForm(formData: FormData) {
  return {
    firstName: text(formData, "firstName"),
    lastName: text(formData, "lastName"),
    dni: text(formData, "dni"),
    birthDate: text(formData, "birthDate"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    residence: text(formData, "residence"),
  };
}

export async function createPadronEntryAction(formData: FormData) {
  const actorUser = await actor();
  const input = padronFromForm(formData);
  if (!input.firstName && !input.lastName) return { error: "Completá al menos el nombre." };
  await createPadronEntry(input);
  await logAudit({
    actorEmail: actorUser.email,
    action: "padron.create",
    entityType: "padron",
    detail: `Cargó a ${input.firstName} ${input.lastName}`.trim(),
  });
  refresh();
  return { ok: true };
}

export async function updatePadronEntryAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  const input = padronFromForm(formData);
  if (!id) return { error: "Registro inválido." };
  const person = await updatePadronEntry(id, input);
  if (!person) return { error: "No se encontró el registro." };
  await logAudit({
    actorEmail: actorUser.email,
    action: "padron.update",
    entityType: "padron",
    entityId: id,
    detail: `Actualizó la ficha de ${person.firstName} ${person.lastName}`.trim(),
  });
  refresh();
  return { ok: true };
}

export async function deletePadronEntryAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  await deletePadronEntry(id);
  await logAudit({
    actorEmail: actorUser.email,
    action: "padron.delete",
    entityType: "padron",
    entityId: id,
    detail: "Eliminó un registro del padrón",
  });
  refresh();
  return { ok: true };
}

export async function importPadronAction(formData: FormData) {
  const actorUser = await actor();
  const raw = text(formData, "csv");
  if (!raw) return { error: "No se pudo leer el archivo." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "El archivo no se pudo interpretar." };
  }
  if (!Array.isArray(parsed)) return { error: "El archivo no tiene filas." };
  const entries = parsed.map((item) => ({
    firstName: String((item as { firstName?: string }).firstName ?? ""),
    lastName: String((item as { lastName?: string }).lastName ?? ""),
    dni: String((item as { dni?: string }).dni ?? ""),
    birthDate: String((item as { birthDate?: string }).birthDate ?? ""),
    email: String((item as { email?: string }).email ?? ""),
    phone: String((item as { phone?: string }).phone ?? ""),
    residence: String((item as { residence?: string }).residence ?? ""),
  }));
  const created = await importPadronEntries(entries);
  await logAudit({
    actorEmail: actorUser.email,
    action: "padron.import",
    entityType: "padron",
    detail: `Importó ${created} registro(s) al padrón`,
  });
  refresh();
  return { ok: true, created };
}

function movementFromForm(formData: FormData): BankMovementInput {
  return {
    occurredAt: text(formData, "occurredAt") || new Date().toISOString(),
    reference: text(formData, "reference"),
    concept: text(formData, "concept"),
    amountCents: parseBankAmount(text(formData, "amount")),
    currency: text(formData, "currency") === "USD" ? "USD" : "ARS",
  };
}

export async function createBankMovementAction(formData: FormData) {
  const actorUser = await actor();
  const input = movementFromForm(formData);
  if (!input.occurredAt || Number.isNaN(new Date(input.occurredAt).getTime())) {
    return { error: "Completá la fecha del movimiento." };
  }
  if (!input.amountCents) return { error: "Completá un importe distinto de cero." };
  await createBankMovement(input);
  await logAudit({
    actorEmail: actorUser.email,
    action: "bank.create",
    entityType: "bank",
    detail: `Cargó un movimiento de extracto: ${input.concept || input.reference}`,
  });
  refresh();
  return { ok: true };
}

export async function updateBankMovementAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  const input = movementFromForm(formData);
  if (!id) return { error: "Movimiento inválido." };
  const movement = await updateBankMovement(id, input);
  if (!movement) return { error: "No se encontró el movimiento." };
  await logAudit({
    actorEmail: actorUser.email,
    action: "bank.update",
    entityType: "bank",
    entityId: id,
    detail: `Actualizó el movimiento ${movement.reference || movement.concept}`,
  });
  refresh();
  return { ok: true };
}

export async function updateBankConceptAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  const concept = text(formData, "concept");
  if (!id) return { error: "Movimiento inválido." };
  if (!concept) return { error: "Completá el concepto." };
  const movement = await updateBankMovementConcept(id, concept);
  if (!movement) return { error: "No se encontró el movimiento." };
  await logAudit({
    actorEmail: actorUser.email,
    action: "bank.concept",
    entityType: "bank",
    entityId: id,
    detail: `Actualizó el concepto: ${concept}`,
  });
  refresh();
  return { ok: true };
}

export async function deleteBankMovementAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  await deleteBankMovement(id);
  await logAudit({
    actorEmail: actorUser.email,
    action: "bank.delete",
    entityType: "bank",
    entityId: id,
    detail: "Eliminó un movimiento del extracto",
  });
  refresh();
  return { ok: true };
}

export async function importBankExtractAction(formData: FormData) {
  const actorUser = await actor();
  const raw = text(formData, "csv");
  if (!raw) return { error: "No se pudo leer el archivo." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "El archivo no se pudo interpretar." };
  }
  if (!Array.isArray(parsed)) return { error: "El archivo no tiene filas." };
  const entries: BankMovementInput[] = parsed.map((item) => {
    const row = item as Partial<BankMovementInput>;
    return {
      occurredAt: String(row.occurredAt ?? ""),
      reference: String(row.reference ?? ""),
      concept: String(row.concept ?? ""),
      amountCents: Number(row.amountCents ?? 0),
      currency: row.currency === "USD" ? "USD" : "ARS",
    };
  });
  const created = await importBankMovements(entries);
  await logAudit({
    actorEmail: actorUser.email,
    action: "bank.import",
    entityType: "bank",
    detail: `Importó ${created} movimiento(s) al extracto`,
  });
  refresh();
  return { ok: true, created };
}

export async function upsertManualPaymentAction(formData: FormData) {
  const actorUser = await actor();
  const padronId = Number(formData.get("padronId"));
  const period = text(formData, "period");
  const amountCents = parseBankAmount(text(formData, "amount"));
  if (!padronId || !period) return { error: "Falta la persona o el período." };
  if (!amountCents) return { error: "Completá un importe." };
  await upsertManualPayment({
    padronId,
    period,
    amountCents,
    currency: text(formData, "currency") || "ARS",
    method: text(formData, "method") || "Manual",
    paidAt: text(formData, "paidAt") || new Date().toISOString(),
    notes: text(formData, "notes"),
  });
  await logAudit({
    actorEmail: actorUser.email,
    action: "payment.manual",
    entityType: "payment",
    entityId: padronId,
    detail: `Registró un pago manual del período ${period}`,
  });
  refresh();
  return { ok: true };
}

export async function deleteManualPaymentAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  if (!id) return { error: "Pago inválido." };
  await deleteManualPayment(id);
  await logAudit({
    actorEmail: actorUser.email,
    action: "payment.manual.delete",
    entityType: "payment",
    entityId: id,
    detail: "Eliminó un pago manual del mes",
  });
  refresh();
  return { ok: true };
}

export async function saveBankExtractMetaAction(formData: FormData) {
  const actorUser = await actor();
  const meta = await saveBankExtractMeta({
    initialBalanceCents: parseBankAmount(text(formData, "initialBalance")),
    initialBalanceUsdCents: parseBankAmount(text(formData, "initialBalanceUsd")),
    initialBalanceDate: text(formData, "initialBalanceDate") || defaultBankExtractMeta.initialBalanceDate,
  });
  await logAudit({
    actorEmail: actorUser.email,
    action: "bank.meta",
    entityType: "bank",
    detail: "Actualizó el saldo inicial del extracto",
  });
  refresh();
  return { ok: true, meta };
}

function zoomFromForm(formData: FormData) {
  return {
    title: text(formData, "title"),
    joinUrl: text(formData, "joinUrl"),
    meetingId: text(formData, "meetingId"),
    passcode: text(formData, "passcode"),
    notes: text(formData, "notes"),
  };
}

export async function createZoomMeetingAction(formData: FormData) {
  const actorUser = await actor();
  const input = zoomFromForm(formData);
  if (!input.title) return { error: "Completá el título." };
  if (!input.joinUrl) return { error: "Completá el enlace de Zoom." };
  await createZoomMeeting(input);
  await logAudit({
    actorEmail: actorUser.email,
    action: "zoom.create",
    entityType: "zoom",
    detail: `Agregó la reunión ${input.title}`,
  });
  refresh();
  return { ok: true };
}

export async function updateZoomMeetingAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  const input = zoomFromForm(formData);
  if (!id) return { error: "Reunión inválida." };
  if (!input.title) return { error: "Completá el título." };
  if (!input.joinUrl) return { error: "Completá el enlace de Zoom." };
  const meeting = await updateZoomMeeting(id, input);
  if (!meeting) return { error: "No se encontró la reunión." };
  await logAudit({
    actorEmail: actorUser.email,
    action: "zoom.update",
    entityType: "zoom",
    entityId: id,
    detail: `Actualizó la reunión ${meeting.title}`,
  });
  refresh();
  return { ok: true };
}

export async function fetchBitacoraTitleAction(url: string) {
  await actor();
  const trimmed = url.trim();
  if (!trimmed) return { ok: true, title: "" };
  if (!isDriveUrl(trimmed)) return { ok: true, title: "" };
  const title = await fetchLinkTitle(trimmed);
  return { ok: true, title };
}

export async function fetchBitacoraTitlesAction(urls: string[]) {
  await actor();
  const unique = parseBitacoraUrls(urls.join("\n")).slice(0, 50);
  const items = await Promise.all(
    unique.map(async (url) => ({
      url,
      title: isDriveUrl(url) ? await fetchLinkTitle(url) : "",
    })),
  );
  return { ok: true, items };
}

export async function createBitacoraEntryAction(formData: FormData) {
  const actorUser = await actor();
  const url = text(formData, "url");
  let title = text(formData, "title");
  if (!url) return { error: "Completá la URL." };
  if (!title && isDriveUrl(url)) title = await fetchLinkTitle(url);
  const result = await createBitacoraEntry({ url, title });
  if (result.error) return { error: result.error };
  await logAudit({
    actorEmail: actorUser.email,
    action: "bitacora.create",
    entityType: "bitacora",
    entityId: result.entry?.id,
    detail: `Agregó ${title || url} a la bitácora`,
  });
  refresh();
  return { ok: true };
}

export async function createBitacoraBulkAction(formData: FormData) {
  const actorUser = await actor();
  const raw = text(formData, "items") || text(formData, "urls");
  let inputs: { url: string; title: string }[] = [];
  try {
    const parsed = JSON.parse(raw) as Array<{ url?: string; title?: string } | string>;
    inputs = parsed
      .map((item) =>
        typeof item === "string"
          ? { url: item, title: "" }
          : { url: String(item.url ?? ""), title: String(item.title ?? "") },
      )
      .filter((item) => item.url);
  } catch {
    inputs = parseBitacoraUrls(raw).map((url) => ({ url, title: "" }));
  }
  inputs = inputs.slice(0, 50);
  if (!inputs.length) return { error: "Agregá al menos una URL." };
  const pending = await Promise.all(
    inputs.map(async (item) => ({
      url: item.url,
      title: item.title || (isDriveUrl(item.url) ? await fetchLinkTitle(item.url) : ""),
    })),
  );
  const result = await createBitacoraEntries(pending);
  await logAudit({
    actorEmail: actorUser.email,
    action: "bitacora.bulk",
    entityType: "bitacora",
    detail: `Carga masiva: ${result.created.length} registros, ${result.skipped.length} omitidos`,
  });
  refresh();
  return { ok: true, created: result.created.length, skipped: result.skipped.length };
}

export async function syncBitacoraDriveAction() {
  const actorUser = await actor();
  const entries = await listBitacoraEntries();
  let updated = 0;
  for (const entry of entries) {
    if (!isDriveUrl(entry.url)) continue;
    const title = await fetchLinkTitle(entry.url);
    if (!title || title === entry.title) continue;
    await updateBitacoraEntry(entry.id, { title });
    updated += 1;
  }
  await logAudit({
    actorEmail: actorUser.email,
    action: "bitacora.sync",
    entityType: "bitacora",
    detail: `Sincronizó Drive: ${updated} títulos actualizados`,
  });
  refresh();
  return { ok: true, updated };
}

export async function deleteBitacoraEntryAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  if (!id) return { error: "Registro inválido." };
  await deleteBitacoraEntry(id);
  await logAudit({
    actorEmail: actorUser.email,
    action: "bitacora.delete",
    entityType: "bitacora",
    entityId: id,
    detail: "Eliminó un registro de la bitácora",
  });
  refresh();
  return { ok: true };
}

export async function fetchYouTubeTitleAction(url: string) {
  await actor();
  const title = await fetchYouTubeTitle(url);
  return { ok: true, title };
}

function activationFromForm(formData: FormData) {
  return {
    title: text(formData, "title"),
    youtubeUrl: youtubeWatchUrl(text(formData, "youtubeUrl")),
    occurredAt: text(formData, "occurredAt"),
    enabled: text(formData, "enabled") !== "false",
  };
}

export async function createActivationAction(formData: FormData) {
  const actorUser = await actor();
  const input = activationFromForm(formData);
  if (!input.youtubeUrl || !isYouTubeUrl(input.youtubeUrl)) {
    return { error: "Pegá una URL de YouTube válida." };
  }
  if (!input.title) {
    const fetched = await fetchYouTubeTitle(input.youtubeUrl);
    input.title = fetched;
  }
  if (!input.title) return { error: "Completá el título." };
  if (!input.occurredAt) return { error: "Completá la fecha." };
  const entry = await createActivation(input);
  await logAudit({
    actorEmail: actorUser.email,
    action: "activation.create",
    entityType: "activation",
    entityId: entry.id,
    detail: `Agregó la activación ${entry.title}`,
  });
  refresh();
  return { ok: true };
}

export async function updateActivationAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  const input = activationFromForm(formData);
  if (!id) return { error: "Activación inválida." };
  if (!input.youtubeUrl || !isYouTubeUrl(input.youtubeUrl)) {
    return { error: "Pegá una URL de YouTube válida." };
  }
  if (!input.title) return { error: "Completá el título." };
  if (!input.occurredAt) return { error: "Completá la fecha." };
  const entry = await updateActivation(id, input);
  if (!entry) return { error: "No se encontró la activación." };
  await logAudit({
    actorEmail: actorUser.email,
    action: "activation.update",
    entityType: "activation",
    entityId: id,
    detail: `Actualizó la activación ${entry.title}`,
  });
  refresh();
  return { ok: true };
}

export async function toggleActivationAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  if (!id) return { error: "Activación inválida." };
  const entry = await toggleActivation(id);
  if (!entry) return { error: "No se encontró la activación." };
  await logAudit({
    actorEmail: actorUser.email,
    action: "activation.toggle",
    entityType: "activation",
    entityId: id,
    detail: `${entry.enabled ? "Habilitó" : "Ocultó"} la activación ${entry.title}`,
  });
  refresh();
  return { ok: true };
}

export async function deleteActivationAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  if (!id) return { error: "Activación inválida." };
  await deleteActivation(id);
  await logAudit({
    actorEmail: actorUser.email,
    action: "activation.delete",
    entityType: "activation",
    entityId: id,
    detail: "Eliminó una activación",
  });
  refresh();
  return { ok: true };
}

export async function saveActivationPermissionsAction(formData: FormData) {
  const actorUser = await actor();
  const userId = Number(formData.get("userId"));
  if (!userId) return { error: "Elegí un Usuario Membresía." };
  const raw = text(formData, "activationIds");
  const activationIds = raw
    ? raw
        .split(",")
        .map((value) => Number(value))
        .filter((id) => Number.isFinite(id) && id > 0)
    : [];
  await saveActivationPermissions(userId, activationIds);
  await logAudit({
    actorEmail: actorUser.email,
    action: "activation.permissions",
    entityType: "user",
    entityId: userId,
    detail: `Actualizó permisos de Activaciones: ${activationIds.length} videos`,
  });
  refresh();
  return { ok: true };
}

export async function createSpecialRoomAction(formData: FormData) {
  const actorUser = await actor();
  const input = activationFromForm(formData);
  if (!input.youtubeUrl || !isYouTubeUrl(input.youtubeUrl)) {
    return { error: "Pegá una URL de YouTube válida." };
  }
  if (!input.title) {
    const fetched = await fetchYouTubeTitle(input.youtubeUrl);
    input.title = fetched;
  }
  if (!input.title) return { error: "Completá el título." };
  if (!input.occurredAt) return { error: "Completá la fecha." };
  const entry = await createSpecialRoom(input);
  await logAudit({
    actorEmail: actorUser.email,
    action: "specialRoom.create",
    entityType: "specialRoom",
    entityId: entry.id,
    detail: `Agregó la sala especial ${entry.title}`,
  });
  refresh();
  return { ok: true };
}

export async function updateSpecialRoomAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  const input = activationFromForm(formData);
  if (!id) return { error: "Sala inválida." };
  if (!input.youtubeUrl || !isYouTubeUrl(input.youtubeUrl)) {
    return { error: "Pegá una URL de YouTube válida." };
  }
  if (!input.title) return { error: "Completá el título." };
  if (!input.occurredAt) return { error: "Completá la fecha." };
  const entry = await updateSpecialRoom(id, input);
  if (!entry) return { error: "No se encontró la sala." };
  await logAudit({
    actorEmail: actorUser.email,
    action: "specialRoom.update",
    entityType: "specialRoom",
    entityId: id,
    detail: `Actualizó la sala especial ${entry.title}`,
  });
  refresh();
  return { ok: true };
}

export async function toggleSpecialRoomAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  if (!id) return { error: "Sala inválida." };
  const entry = await toggleSpecialRoom(id);
  if (!entry) return { error: "No se encontró la sala." };
  await logAudit({
    actorEmail: actorUser.email,
    action: "specialRoom.toggle",
    entityType: "specialRoom",
    entityId: id,
    detail: `${entry.enabled ? "Habilitó" : "Ocultó"} la sala especial ${entry.title}`,
  });
  refresh();
  return { ok: true };
}

export async function deleteSpecialRoomAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  if (!id) return { error: "Sala inválida." };
  await deleteSpecialRoom(id);
  await logAudit({
    actorEmail: actorUser.email,
    action: "specialRoom.delete",
    entityType: "specialRoom",
    entityId: id,
    detail: "Eliminó una sala especial",
  });
  refresh();
  return { ok: true };
}

export async function deleteZoomMeetingAction(formData: FormData) {
  const actorUser = await actor();
  const id = Number(formData.get("id"));
  await deleteZoomMeeting(id);
  await logAudit({
    actorEmail: actorUser.email,
    action: "zoom.delete",
    entityType: "zoom",
    entityId: id,
    detail: "Eliminó una reunión de Zoom",
  });
  refresh();
  return { ok: true };
}

export async function scanReceiptAction(formData: FormData) {
  await actor();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Elegí un comprobante PDF o JPG." };
  const saved = await savePaymentReceipt(file);
  if ("error" in saved) return { error: saved.error };
  const text = saved.kind === "pdf" ? extractPdfText(saved.bytes) : "";
  const scanned = parseReceiptText(text);
  return {
    ok: true,
    fileName: file.name,
    fileUrl: saved.url,
    kind: saved.kind,
    amountCents: scanned.amountCents,
    paidAt: scanned.paidAt,
    rawText: scanned.rawText,
  };
}

export async function saveReceiptAction(formData: FormData) {
  const actorUser = await actor();
  const fileUrl = text(formData, "fileUrl");
  const fileName = text(formData, "fileName");
  const kind = text(formData, "kind") === "pdf" ? "pdf" : "jpg";
  if (!fileUrl) return { error: "Falta el archivo del comprobante." };
  const amountCents = text(formData, "amount") ? parseBankAmount(text(formData, "amount")) : null;
  await createPaymentReceipt({
    fileName,
    fileUrl,
    kind,
    amountCents: amountCents || null,
    paidAt: text(formData, "paidAt"),
    rawText: text(formData, "rawText"),
  });
  await logAudit({
    actorEmail: actorUser.email,
    action: "receipt.create",
    entityType: "receipt",
    detail: `Adjuntó un comprobante${amountCents ? ` de ${amountCents / 100}` : ""}`,
  });
  refresh();
  return { ok: true };
}
