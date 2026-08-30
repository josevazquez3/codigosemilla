import type { PanelBankMovement, PanelPadronPerson } from "@/lib/panel-data";

export function normalizePersonName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function clientNameFromConcept(concept: string) {
  const match = concept.match(/transferencia recibida\s+(.+)/i);
  if (match?.[1]) return match[1].trim();
  return concept.trim() || "Sin identificar";
}

export function movementMatchesPerson(movement: PanelBankMovement, person: PanelPadronPerson) {
  if (movement.amountCents <= 0) return false;
  const extracted = normalizePersonName(clientNameFromConcept(movement.concept));
  const full = normalizePersonName(`${person.firstName} ${person.lastName}`);
  const reversed = normalizePersonName(`${person.lastName} ${person.firstName}`);
  return Boolean(full) && (
    extracted.includes(full) ||
    full.includes(extracted) ||
    extracted.includes(reversed) ||
    reversed.includes(extracted)
  );
}
