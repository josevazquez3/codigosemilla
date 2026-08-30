import type { PadronInput } from "@/lib/panel-data";

function normalizeHeader(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function parseBirthDate(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  return trimmed;
}

export function parsePadronCsv(text: string): PadronInput[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const delimiter = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(delimiter).map((cell) => normalizeHeader(cell.replace(/^"|"$/g, "")));
  const index = (aliases: string[]) => headers.findIndex((header) => aliases.includes(header));

  const first = index(["nombres", "nombre", "firstname"]);
  const last = index(["apellidos", "apellido", "lastname"]);
  const dni = index(["dniopasaporte", "dni", "pasaporte", "documento"]);
  const birth = index(["fechadenacimiento", "nacimiento", "birthdate"]);
  const email = index(["correoelectronico", "email", "mail", "correo"]);
  const phone = index(["ndecelular", "celular", "telefono", "phone"]);
  const residence = index(["lugarderesidencia", "residencia", "domicilio"]);

  return lines.slice(1).map((line) => {
    const cells = line.split(delimiter).map((cell) => cell.replace(/^"|"$/g, "").trim());
    return {
      firstName: first >= 0 ? cells[first] ?? "" : "",
      lastName: last >= 0 ? cells[last] ?? "" : "",
      dni: dni >= 0 ? cells[dni] ?? "" : "",
      birthDate: birth >= 0 ? parseBirthDate(cells[birth] ?? "") : "",
      email: email >= 0 ? cells[email] ?? "" : "",
      phone: phone >= 0 ? cells[phone] ?? "" : "",
      residence: residence >= 0 ? cells[residence] ?? "" : "",
    };
  });
}

export function padronToCsv(rows: Array<PadronInput & { id?: number }>) {
  const header = [
    "Nombres",
    "Apellidos",
    "DNI o pasaporte",
    "Fecha de nacimiento",
    "Correo electrónico",
    "Nº de celular",
    "Lugar de residencia",
  ];
  const lines = [
    header.join(";"),
    ...rows.map((row) =>
      [row.firstName, row.lastName, row.dni, row.birthDate, row.email, row.phone, row.residence]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(";"),
    ),
  ];
  return `\uFEFF${lines.join("\n")}`;
}
