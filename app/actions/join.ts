"use server";

import { revalidatePath } from "next/cache";
import { createApplication } from "@/lib/panel-data";

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export async function submitJoinApplicationAction(formData: FormData) {
  const firstName = text(formData, "firstName");
  const lastName = text(formData, "lastName");
  const email = text(formData, "email").toLowerCase();
  const dni = text(formData, "dni").replace(/\D/g, "");
  const phone = text(formData, "phone");
  const birthDate = text(formData, "birthDate");
  const residence = text(formData, "residence");

  if (!firstName || !lastName) return { error: "Completá nombres y apellidos." };
  if (!dni) return { error: "Completá el DNI o pasaporte, solo números." };
  if (!birthDate) return { error: "Completá la fecha de nacimiento." };
  if (!email) return { error: "Completá el correo electrónico." };
  if (!phone) return { error: "Completá el número de celular." };
  if (!residence) return { error: "Completá el lugar de residencia." };

  await createApplication({
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email,
    dni,
    phone,
    birthDate,
    residence,
    isSpecialRoom: formData.get("isSpecialRoom") === "on",
    interest: "Quiero unirme",
  });
  revalidatePath("/panel/quiero-unirme");
  return { ok: true };
}
