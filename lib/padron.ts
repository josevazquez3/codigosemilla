export type PadronPerson = {
  name: string;
  email: string;
  phone: string;
};

export function generatePadronPassword(name: string) {
  const first = name.trim().split(/\s+/)[0] || "Usuario";
  return `${first}1234`;
}

export type PadronRow = PadronPerson & {
  password: string;
  status: "nuevo" | "duplicado" | "sin-email";
};

export function annotatePadron(people: PadronPerson[], existingEmails: string[]): PadronRow[] {
  const known = new Set(existingEmails.map((email) => email.trim().toLowerCase()));
  return people.map((person) => {
    const email = person.email.trim().toLowerCase();
    const status = !email ? "sin-email" : known.has(email) ? "duplicado" : "nuevo";
    return {
      ...person,
      email,
      password: status === "nuevo" ? generatePadronPassword(person.name) : "",
      status,
    };
  });
}

export const padron: PadronPerson[] = [
  { name: "Guadalupe", email: "guadalupe@concienciaestelar.com", phone: "" },
  { name: "Ana Morales", email: "ana@correo.com", phone: "1155551010" },
  { name: "Martín López", email: "martin@correo.com", phone: "" },
  { name: "Fabiana Carina Olivero", email: "fabiana.olivero@correo.com", phone: "2215550313" },
  { name: "Marcelo Andres", email: "marcelo.andres@correo.com", phone: "1144442211" },
  { name: "Elizabeth Judith Rodeja", email: "elizabeth.rodeja@correo.com", phone: "1133338899" },
  { name: "Lucía Pereyra", email: "lucia@correo.com", phone: "1122233344" },
  { name: "Diego Ruiz", email: "diego@correo.com", phone: "" },
  { name: "Sofía Benítez", email: "sofia.benitez@correo.com", phone: "1166677788" },
  { name: "Pablo Herrera", email: "pablo.herrera@correo.com", phone: "1177788899" },
  { name: "Valeria Soto", email: "valeria.soto@correo.com", phone: "" },
  { name: "Jorge Medina", email: "", phone: "1199988877" },
  { name: "Carla Núñez", email: "carla.nunez@correo.com", phone: "1100011122" },
  { name: "Romina Alegre", email: "", phone: "2214445566" },
];
