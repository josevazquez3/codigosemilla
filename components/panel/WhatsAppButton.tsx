export function WhatsAppButton({
  href,
  children = "WhatsApp",
}: {
  href?: string;
  children?: string;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex rounded-full border border-[#d7e6d3] px-3 py-1.5 text-[11px] tracking-[0.12em] text-[#4f7a58] uppercase hover:bg-[#e8f3e3]"
    >
      {children}
    </a>
  );
}
