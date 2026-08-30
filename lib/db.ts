import { neon } from "@neondatabase/serverless";
import { faqs as fallbackFaqs, testimonials as fallbackTestimonials } from "./content";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export async function ensureSchema() {
  const sql = getSql();
  if (!sql) return;

  await sql`
    CREATE TABLE IF NOT EXISTS testimonials (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      author TEXT NOT NULL,
      sort_order INT DEFAULT 0,
      published BOOLEAN DEFAULT true
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS faqs (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sort_order INT DEFAULT 0
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      interest TEXT,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function getTestimonials() {
  const sql = getSql();
  if (!sql) return [...fallbackTestimonials];

  try {
    await ensureSchema();
    const rows = await sql`
      SELECT text, author
      FROM testimonials
      WHERE published = true
      ORDER BY sort_order ASC, id ASC
    `;
    if (rows.length === 0) return [...fallbackTestimonials];
    return rows.map((row) => ({
      text: String(row.text),
      author: String(row.author),
    }));
  } catch {
    return [...fallbackTestimonials];
  }
}

export async function getFaqs() {
  const sql = getSql();
  if (!sql) return [...fallbackFaqs];

  try {
    await ensureSchema();
    const rows = await sql`
      SELECT question AS q, answer AS a
      FROM faqs
      ORDER BY sort_order ASC, id ASC
    `;
    if (rows.length === 0) return [...fallbackFaqs];
    return rows.map((row) => ({
      q: String(row.q),
      a: String(row.a),
    }));
  } catch {
    return [...fallbackFaqs];
  }
}

export async function saveContactMessage(input: {
  name: string;
  email: string;
  interest: string;
  message: string;
}) {
  const sql = getSql();
  if (!sql) {
    console.info("[contact] DATABASE_URL no configurada. Mensaje no persistido:", input);
    try {
      const { createApplication } = await import("@/lib/panel-data");
      await createApplication(input);
    } catch {
      /* el panel en memoria se actualiza si está disponible */
    }
    return { persisted: false };
  }

  await ensureSchema();
  await sql`
    INSERT INTO contact_messages (name, email, interest, message)
    VALUES (${input.name}, ${input.email}, ${input.interest}, ${input.message})
  `;
  try {
    const { createApplication } = await import("@/lib/panel-data");
    await createApplication(input);
  } catch {
    /* el panel se actualiza cuando la base está disponible */
  }
  return { persisted: true };
}

export async function seedContent() {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL no está configurada");

  await ensureSchema();

  const existingFaqs = await sql`SELECT COUNT(*)::int AS count FROM faqs`;
  if (Number(existingFaqs[0]?.count ?? 0) === 0) {
    for (const [index, faq] of fallbackFaqs.entries()) {
      await sql`
        INSERT INTO faqs (question, answer, sort_order)
        VALUES (${faq.q}, ${faq.a}, ${index})
      `;
    }
  }

  const existingTestimonials = await sql`SELECT COUNT(*)::int AS count FROM testimonials`;
  if (Number(existingTestimonials[0]?.count ?? 0) === 0) {
    for (const [index, item] of fallbackTestimonials.entries()) {
      await sql`
        INSERT INTO testimonials (text, author, sort_order)
        VALUES (${item.text}, ${item.author}, ${index})
      `;
    }
  }

  return { ok: true };
}
