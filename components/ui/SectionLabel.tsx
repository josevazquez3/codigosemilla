export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-base font-bold uppercase tracking-[0.28em] text-[#5c3d2e] md:text-xl">
      {children}
    </p>
  );
}
