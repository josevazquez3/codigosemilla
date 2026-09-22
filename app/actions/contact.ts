"use server";

import { revalidatePath } from "next/cache";
import { createContactInquiry } from "@/lib/panel-data";

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
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
  return { ok: true };
}
