"use client";

import { trackVideoOpen } from "@/components/panel/ActivityTracker";

export function VideoLink({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackVideoOpen(title, "Encuentros")}
      className="mt-2 inline-block text-sm text-[#4f7a58] underline"
    >
      {children}
    </a>
  );
}
