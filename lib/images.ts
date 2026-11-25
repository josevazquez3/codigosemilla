const DEFAULT_IMAGES = {
  portrait: "/images/portrait-guada.jpg",
  inspo1: "/images/inspo-1.jpeg",
  inspo2: "/images/inspo-2.jpeg",
  logo: "/images/logo-white.png",
  leaves: "/images/leaves.png",
  portraitForest: "/images/portrait-forest.jpg",
} as const;

function blobUrl(fileName: string) {
  const base = process.env.NEXT_PUBLIC_BLOB_BASE_URL?.trim();
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/${fileName}`;
}

function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return "https://guadalupevazquez.com";
}

export const images = {
  portrait: blobUrl("portrait-guada.jpg") ?? DEFAULT_IMAGES.portrait,
  inspo1: blobUrl("inspo-1.jpeg") ?? DEFAULT_IMAGES.inspo1,
  inspo2: blobUrl("inspo-2.jpeg") ?? DEFAULT_IMAGES.inspo2,
  logo: blobUrl("logo-white.png") ?? DEFAULT_IMAGES.logo,
  leaves: blobUrl("leaves.png") ?? DEFAULT_IMAGES.leaves,
  portraitForest: blobUrl("portrait-forest.jpg") ?? DEFAULT_IMAGES.portraitForest,
};

export const site = {
  name: "Guadalupe Vázquez",
  email: process.env.NEXT_PUBLIC_EMAIL?.trim() || "contacto@guadalupevazquez.com",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ?? "",
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL?.trim() ?? "",
  url: siteUrl(),
};
