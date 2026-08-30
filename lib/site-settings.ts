export type SiteSettings = {
  spaceName: string;
  monthlyDueCents: number;
  currency: string;
  welcomeText: string;
  notifyEmail: string;
  whatsappNumber: string;
  messageContact: string;
  messageJoinAr: string;
  messageStartProcess: string;
  messageBlockedVideo: string;
  messagePaymentMonth: string;
  messageBulkUsers: string;
  messageJoinForm: string;
  messageEventRegistration: string;
  bankHolder: string;
  bankName: string;
  bankAlias: string;
  bankCbu: string;
  bankCvu: string;
  bankAccount: string;
};

export const defaultSiteSettings: SiteSettings = {
  spaceName: "Conciencia Estelar",
  monthlyDueCents: 2500000,
  currency: "ARS",
  welcomeText: "Elegí un módulo para acceder a tu contenido y acompañamiento.",
  notifyEmail: "hola@guadalupevazquez.com",
  whatsappNumber: "+5492216014212",
  messageContact: "Hola, me gustaría obtener más información sobre Conciencia Estelar.",
  messageJoinAr: "Hola, quiero unirme a la membresía de Conciencia Estelar (Argentina).",
  messageStartProcess: "Hola, quiero comenzar mi proceso en Conciencia Estelar.",
  messageBlockedVideo: "Conectarse con el Administrador al celular: +5492216014212",
  messagePaymentMonth:
    "Hola {nombres} {apellidos} te escribimos desde Conciencia Estelar para recordarte el pago de la membresía correspondiente a {mes}. Gracias.",
  messageBulkUsers:
    "Hola {nombre}, te damos la bienvenida a Conciencia Estelar.\n\nYa podés ingresar a la plataforma: www.concienciaestelar.com.ar/\nCon estos datos:\nUsuario: {usuario}\nClave: {clave}",
  messageJoinForm:
    "¡Bienvenido/a a la Membresía Conciencia Estelar! {nombres} {apellidos}, enviá el comprobante al WhatsApp {numeroPlataforma}. Alias: concienciaestelar33. Titular: Guadalupe Vázquez.",
  messageEventRegistration:
    "Hola {nombres}, te escribimos desde Conciencia Estelar por tu inscripción a {encuentro}. Nos pondremos en comunicación. ¡Gracias!",
  bankHolder: "Guadalupe Vazquez",
  bankName: "",
  bankAlias: "concienciaestelar33",
  bankCbu: "",
  bankCvu: "",
  bankAccount: "",
};

export function applyTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

export function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    nombres: parts[0] ?? "",
    apellidos: parts.slice(1).join(" "),
  };
}

export function currentMonthLabel() {
  return new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

export function whatsappUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function formatBankDetails(settings: SiteSettings) {
  const lines = [`Datos para transferencia – ${settings.spaceName}:`];
  if (settings.bankHolder) lines.push(`Titular: ${settings.bankHolder}`);
  if (settings.bankName) lines.push(`Banco: ${settings.bankName}`);
  if (settings.bankAlias) lines.push(`Alias: ${settings.bankAlias}`);
  if (settings.bankCbu) lines.push(`CBU: ${settings.bankCbu}`);
  if (settings.bankCvu) lines.push(`CVU: ${settings.bankCvu}`);
  if (settings.bankAccount) lines.push(`Cuenta: ${settings.bankAccount}`);
  return lines.join("\n");
}
