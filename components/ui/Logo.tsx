type LogoProps = {
  className?: string;
  compact?: boolean;
};

export function Logo({ className = "", compact = false }: LogoProps) {
  return (
    <div className={`flex flex-col items-center text-current ${className}`}>
      <svg
        viewBox="0 0 80 80"
        className={compact ? "h-11 w-11" : "h-14 w-14"}
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M40 8 L44 32 L68 28 L48 40 L68 52 L44 48 L40 72 L36 48 L12 52 L32 40 L12 28 L36 32 Z"
          fill="currentColor"
        />
        <path
          d="M18 22 C22 12, 58 12, 62 22"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />
        <path
          d="M18 58 C22 68, 58 68, 62 58"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />
        <circle cx="63" cy="18" r="2" fill="currentColor" />
        <circle cx="17" cy="62" r="2" fill="currentColor" />
      </svg>
      <span
        className={`mt-1 text-center leading-none tracking-[0.18em] ${
          compact ? "text-[11px]" : "text-sm"
        }`}
      >
        <span className="block font-heading uppercase">Guadalupe</span>
        <span className="block font-heading lowercase">vazquez</span>
      </span>
    </div>
  );
}
