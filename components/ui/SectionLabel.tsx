export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
      {children}
    </p>
  );
}
