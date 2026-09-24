/** Decorative SVG pieces of the Art'os identity. All are aria-hidden. */

/** A single laurel sprig, echoing the branches in the supplied logo. */
export function Laurel({ className = "" }: { className?: string }) {
  const leaves = [0, 1, 2, 3, 4, 5];
  return (
    <svg viewBox="0 0 60 140" className={className} aria-hidden="true" fill="currentColor">
      <path d="M30 138 C28 100 30 50 36 6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {leaves.map((i) => {
        const y = 122 - i * 21;
        const x = 29.5 + i * 1.1;
        return (
          <g key={i}>
            <ellipse cx={x - 10} cy={y - 4} rx="11" ry="4.6" transform={`rotate(-38 ${x - 10} ${y - 4})`} />
            <ellipse cx={x + 10} cy={y - 10} rx="11" ry="4.6" transform={`rotate(38 ${x + 10} ${y - 10})`} />
          </g>
        );
      })}
      <ellipse cx="37" cy="4" rx="4.4" ry="9" transform="rotate(10 37 4)" />
    </svg>
  );
}

/**
 * Judean-desert cliff line, as seen above Ein Gedi.
 * Used as a hard edge between sections — fill comes from `currentColor`.
 */
export function Ridge({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M0 120V70l60-8 38-26 44 14 52-40 36 22 58-6 40 30 70-12 34-26 48 18 60-34 44 30 46-4 38 26 62-22 40 10 52-36 46 28 60 4 36-22 50 16 40-28 58 30 44-8 38 20 64-24 46 18 40-14 42 26 50-8V120Z" />
    </svg>
  );
}

export function ArrowLeft({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" data-arrow fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function PinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function PhoneIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 5.3 5.3l1.4-2.2L19 13.5V17a2 2 0 0 1-2 2A15 15 0 0 1 3 5a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

/** "972536651928" → wa.me link */
export function waHref(number: string) {
  return `https://wa.me/${number}`;
}

/** Small status pill shown while Art'os is temporarily closed. */
export function ClosedBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${className}`}>
      <span className="h-2 w-2 rounded-full bg-[#e0653a]" aria-hidden="true" />
      סגור זמנית
    </span>
  );
}

export function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 max-w-none" aria-hidden="true" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4">
      <path d="m10 1.8 2.5 5.3 5.7.7-4.2 4 1.1 5.7L10 14.7l-5.1 2.8L6 11.8l-4.2-4 5.7-.7L10 1.8Z" />
    </svg>
  );
}
