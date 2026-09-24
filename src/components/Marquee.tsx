import { site } from "@/content/site";

/**
 * A wide band of brand words that drifts sideways as the page scrolls.
 * Scroll-driven (no idle loop), decorative, and hidden from screen readers.
 * Falls back to a static strip where scroll-driven animation is unsupported
 * or when the visitor asks for reduced motion.
 */
export default function Marquee() {
  const words = [site.nameHe, site.slogan, site.location, site.region, "ÁRTOS"];
  const run = [...words, ...words, ...words];

  return (
    <div aria-hidden="true" className="relative overflow-hidden border-y border-navy/10 bg-sand py-5 sm:py-7">
      <div data-marquee
        className="flex w-max items-center gap-8 whitespace-nowrap sm:gap-12">
        {run.map((word, i) => (
          <span key={i} className="flex items-center gap-8 sm:gap-12">
            <span
              className={`font-display text-2xl font-bold sm:text-4xl ${
                i % 5 === 4 ? "text-clay" : "text-navy/85"
              }`}
              lang={i % 5 === 4 ? "en" : undefined}
              dir={i % 5 === 4 ? "ltr" : undefined}
            >
              {word}
            </span>
            <span className="h-2 w-2 shrink-0 rotate-45 bg-turq" />
          </span>
        ))}
      </div>
    </div>
  );
}
