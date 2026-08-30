export function parseBitacoraUrls(text: string) {
  const matches = text.match(/https?:\/\/[^\s<>"'`]+/gi) ?? [];
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const raw of matches) {
    const url = raw.trim().replace(/[.,;)\]]+$/, "");
    const key = url.toLowerCase();
    if (!url || seen.has(key)) continue;
    seen.add(key);
    urls.push(url);
  }
  return urls;
}

export function extractDriveId(url: string) {
  const value = url.trim();
  const file = value.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (file?.[1]) return file[1];
  const folder = value.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folder?.[1]) return folder[1];
  const doc = value.match(/\/(?:document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/);
  if (doc?.[1]) return doc[1];
  const open = value.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return open?.[1] ?? "";
}

export function isDriveUrl(url: string) {
  return /drive\.google\.com|docs\.google\.com/i.test(url);
}

function cleanDriveTitle(value: string) {
  return value
    .replace(/\s+[-–—]\s+Google\s+(Drive|Docs|Sheets|Slides).*$/i, "")
    .replace(/\s+\|\s+Google\s+Drive.*$/i, "")
    .trim();
}

export async function fetchLinkTitle(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    const response = await fetch(trimmed, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ConcienciaEstelar/1.0)" },
      redirect: "follow",
    });
    const html = await response.text();
    const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const raw = og?.[1] || title?.[1] || "";
    const decoded = raw
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    return cleanDriveTitle(decoded);
  } catch {
    return "";
  }
}
