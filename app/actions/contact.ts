"use server";

import { revalidatePath } from "next/cache";
import { createContactInquiry, getSettings } from "@/lib/panel-data";
import { whatsappWebUrl } from "@/lib/site-settings";

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function contactWhatsAppMessage(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  interest: string;
}) {
  const lines = [`Hola, soy ${input.firstName} ${input.lastName}.`];
  if (input.interest) lines.push(`Me interesa: ${input.interest}.`);
  lines.push("", input.message, "", `Celular: ${input.phone}`, `Email: ${input.email}`);
  return lines.join("\n");
}

export async function submitContactInquiryAction(formData: FormData) {
  const firstName = text(formData, "firstName");
  const lastName = text(formData, "lastName");
  const email = text(formData, "email").toLowerCase();
  const phone = text(formData, "phone");
  const message = text(formData, "message");
  const interest = text(formData, "interest");

  if (!firstName || !lastName) return { error: "Completá nombre y apellido." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Completá un correo electrónico válido." };
  }
  if (!phone) return { error: "Completá el celular." };
  if (!message) return { error: "Completá el mensaje." };

  await createContactInquiry({
    firstName,
    lastName,
    email,
    phone,
    message,
    interest,
  });
  revalidatePath("/panel/consultas-contactos");

  const settings = await getSettings();
  const whatsapp = whatsappWebUrl(
    settings.whatsappNumber,
    contactWhatsAppMessage({
      firstName,
      lastName,
      email,
      phone,
      message,
      interest,
    }),
  );

  return { ok: true, whatsappUrl: whatsapp };
}
