import { googleSummary, reviews, site, type Review } from "@/content/site";
import { ArrowLeft, Star } from "./Graphics";
import SectionHeading from "./SectionHeading";

/** Verbatim text; an ellipsis marks where the source cut it off. */
function quoteText(r: Review) {
  if (!r.truncated || /(\.\.\.|…)$/.test(r.text)) return r.text;
  return `${r.text} …`;
}

function Meta({ r }: { r: Review }) {
  return (
    <figcaption className="mt-6 flex items-baseline justify-between gap-4 text-sm">
      <span className="font-semibold text-ink">{r.name}</span>
      <span className="text-muted">{[r.source, r.date].filter(Boolean).join(" · ")}</span>
    </figcaption>
  );
}

/** Renders only when real, verbatim reviews exist in src/content/site.ts. */
export default function Reviews() {
  if (reviews.length === 0) return null;
  const [lead, ...rest] = reviews;
  const summary = googleSummary;

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="on-light relative bg-sand py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading id="reviews-title" eyebrow="ביקורות" title={<>מה אומרים <span className="text-clay">עלינו</span></>} />
          {summary && (
            <div className="flex items-center gap-4" data-anim="up">
              <span aria-hidden="true" className="font-display text-6xl font-black leading-none text-navy">
                <span data-count={summary.rating}>{summary.rating}</span>
              </span>
              <div>
                <div className="flex gap-0.5 text-clay" role="img" aria-label={`דירוג ממוצע ${summary.rating} מתוך 5`}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const fill = Math.max(0, Math.min(1, summary.rating - (n - 1)));
                    return (
                      <span key={n} className="relative inline-block h-4 w-4">
                        <Star filled={false} />
                        {/* partial fill, clipped from the start (right) side in RTL */}
                        <span className="absolute inset-y-0 start-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                          <Star filled />
                        </span>
                      </span>
                    );
                  })}
                </div>
                <p className="mt-1 text-sm text-muted">{summary.count} ביקורות ב-Google</p>
              </div>
            </div>
          )}
        </div>

        {/* lead review as an editorial pull quote */}
        <figure className="relative mt-14 border-t-2 border-navy pt-10 lg:mt-20 lg:grid lg:grid-cols-12 lg:gap-8" data-anim="up">
          <span aria-hidden="true" className="font-display text-[7rem] leading-[0.6] text-clay lg:col-span-1 lg:text-[9rem]">
            ”
          </span>
          <div className="lg:col-span-10">
            <blockquote className="font-display text-[clamp(1.6rem,5.2vw,2.9rem)] font-medium leading-snug text-navy text-pretty">
              <p className="whitespace-pre-line">{quoteText(lead)}</p>
            </blockquote>
            <div className="max-w-xl">
              <Meta r={lead} />
            </div>
          </div>
        </figure>

        {/* phones: one card at a time, swiped sideways. md and up: a plain grid.
            The list stays a list either way, so keyboard and reader order hold. */}
        <ul
          className="-mx-5 mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-x-10 md:gap-y-12 md:overflow-visible md:px-0 md:pb-0"
          tabIndex={0}
          role="group"
          aria-label="עוד ביקורות — ניתן לגלול הצידה"
        >
          {rest.map((r, i) => (
            <li
              key={r.name}
              className="w-[78vw] shrink-0 snap-start sm:w-[60vw] md:w-auto md:shrink"
              data-anim="up"
              style={{ ["--delay" as string]: `${(i % 2) * 110}ms` }}
            >
              <figure className="flex h-full flex-col border-t border-navy/25 pt-6">
                <blockquote className="flex-1 text-lg leading-relaxed text-ink/85 sm:text-xl">
                  <p className="whitespace-pre-line">{quoteText(r)}</p>
                </blockquote>
                <Meta r={r} />
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted md:hidden">
          החליקו לעוד ביקורות
          <ArrowLeft className="h-4 w-4" />
        </p>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-navy/15 pt-6" data-anim="up">
          <p className="text-sm text-muted">ביקורות אמיתיות מ-Google, מובאות כלשונן.</p>
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline decoration-navy/30 underline-offset-8 transition-colors hover:decoration-clay"
          >
            לכל הביקורות ב-Google Maps
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="sr-only">(נפתח בחלון חדש)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
