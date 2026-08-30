export function extractYouTubeId(url: string) {
  const value = url.trim();
  if (!value) return "";
  const patterns = [
    /(?:youtube\.com\/watch\?[^#]*v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }
  return "";
}

export function isYouTubeUrl(url: string) {
  return Boolean(extractYouTubeId(url));
}

export function youtubeWatchUrl(url: string) {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/watch?v=${id}` : url.trim();
}

export function youtubeThumbnailUrl(url: string) {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
}

export async function fetchYouTubeTitle(url: string) {
  const watch = youtubeWatchUrl(url);
  if (!extractYouTubeId(watch)) return "";
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`,
    );
    if (!response.ok) return "";
    const data = (await response.json()) as { title?: string };
    return String(data.title ?? "").trim();
  } catch {
    return "";
  }
}
