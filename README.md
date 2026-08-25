# Guadalupe Vázquez

Sitio en Next.js de [Guadalupe Vázquez](https://guadalupevazquez.agenciayuno.com/), listo para Vercel, Neon y Vercel Blob.

## Desarrollo local

```bash
npm install
cp .env.example .env.local
npm run dev
```

El sitio funciona sin base de datos: testimonios, FAQs y copy salen del contenido local. El formulario de contacto también responde, pero solo persiste mensajes cuando hay `DATABASE_URL`.

## Deploy en Vercel

1. Subí el repo y creá un proyecto en [Vercel](https://vercel.com).
2. Framework: Next.js. Build: `next build`.

## Neon

1. Creá un proyecto en [Neon](https://neon.tech) y copiá la connection string.
2. En Vercel → Settings → Environment Variables, agregá `DATABASE_URL`.
3. Después del deploy, sembrá FAQs y testimonios:

```bash
curl -X POST "https://TU-DOMINIO/api/seed?secret=TU_SEED_SECRET"
```

Tablas que se crean solas:

- `testimonials`
- `faqs`
- `contact_messages`

## Vercel Blob

1. En el proyecto de Vercel, habilitá Blob Storage.
2. Agregá `BLOB_READ_WRITE_TOKEN` (Vercel la inyecta al conectar el store).
3. Subí las imágenes:

```bash
curl -X POST "https://TU-DOMINIO/api/blob?secret=TU_SEED_SECRET"
```

4. Copiá `nextPublicBlobBaseUrl` de la respuesta a `NEXT_PUBLIC_BLOB_BASE_URL` y redesplegá.

Mientras esa variable no esté, las imágenes se sirven desde `/public/images`.

## Variables

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Postgres de Neon |
| `BLOB_READ_WRITE_TOKEN` | Escritura en Blob |
| `NEXT_PUBLIC_BLOB_BASE_URL` | CDN de imágenes |
| `NEXT_PUBLIC_SITE_URL` | URL canónica / Open Graph |
| `NEXT_PUBLIC_EMAIL` | Mail del footer |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Instagram (opcional) |
| `NEXT_PUBLIC_YOUTUBE_URL` | YouTube (opcional) |
| `SEED_SECRET` | Protege `/api/seed` y `/api/blob` |
