import Image from "next/image";
import { menu, photos, showPrices, site, telHref, type MenuCategory, type MenuItem } from "@/content/site";
import { ArrowLeft } from "./Graphics";
import SectionHeading from "./SectionHeading";

/** Diamond + hairline ornament, echoing the lines on the original printed menu. */
function Rule({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`flex min-w-6 flex-1 items-center gap-2 ${className}`}>
      <span className="h-px flex-1 bg-navy/30" />
      <span className="h-2 w-2 rotate-45 bg-navy" />
    </span>
  );
}

function Price({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`shrink-0 font-display font-bold tabular-nums text-navy ${className}`}>
      <span className="sr-only">מחיר: </span>
      <span dir="ltr">₪{value}</span>
    </span>
  );
}

function Item({ item, compact = false }: { item: MenuItem; compact?: boolean }) {
  return (
    <li className={`group ${compact ? "py-3" : "py-6"}`}>
      <div className="flex items-baseline gap-3">
        <p
          className={`font-display font-bold leading-tight text-navy transition-colors duration-500 group-hover:text-clay ${
            compact ? "text-xl" : "text-[clamp(1.6rem,6.5vw,2.25rem)]"
          }`}
        >
          {item.name}
        </p>
        {showPrices && item.price !== undefined && (
          <>
            <span aria-hidden="true" className="mb-1.5 min-w-4 flex-1 border-b-2 border-dotted border-navy/25" />
            <Price value={item.price} className={compact ? "text-lg" : "text-2xl"} />
          </>
        )}
      </div>
      {item.nameEn && !compact && (
        <p lang="en" dir="ltr" className="mt-0.5 text-end text-xs uppercase tracking-[0.18em] text-muted">
          {item.nameEn}
        </p>
      )}
      {item.description && (
        <p className={`mt-1.5 max-w-lg leading-relaxed text-ink/70 ${compact ? "text-sm" : ""}`}>{item.description}</p>
      )}
      {item.quote && (
        <figure className="mt-3 border-s-2 border-clay/40 ps-3">
          <blockquote className="font-display text-base leading-snug text-clay">
            <p>״{item.quote.text}״</p>
          </blockquote>
          <figcaption className="mt-0.5 text-xs text-muted">
            — <bdi>{item.quote.by}</bdi> · ביקורת ב-Google
          </figcaption>
        </figure>
      )}
    </li>
  );
}

function Category({ cat, id, compact = false }: { cat: MenuCategory; id: string; compact?: boolean }) {
  return (
    <section className="mt-10" aria-labelledby={id}>
      <div className="flex items-center gap-4">
        <Rule />
        {/* long titles wrap instead of pushing the card wider than a small phone */}
        <h4 id={id} className="min-w-0 text-balance text-center text-sm font-semibold tracking-[0.15em] text-clay">
          {cat.title}
        </h4>
        <Rule className="flex-row-reverse" />
      </div>
      {cat.titleEn && (
        <p lang="en" dir="ltr" className="mt-1 text-center text-[0.7rem] uppercase tracking-[0.25em] text-muted">
          {cat.titleEn}
        </p>
      )}
      <ul role="list" className={`divide-y divide-navy/10 ${compact ? "mt-2" : ""}`}>
        {cat.items.map((item) => (
          <Item key={item.name} item={item} compact={compact} />
        ))}
      </ul>
    </section>
  );
}

export default function FoodSection() {
  return (
    <section id="food" aria-labelledby="food-title" className="on-light relative bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          id="food-title"
          eyebrow="התפריט"
          title={
            <>
              מה אוכלים <span className="text-clay">אצלנו</span>
            </>
          }
        />

        <div className="mt-14 grid items-start gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-12">
          {/* the menu card */}
          <article
            aria-label={`התפריט של ${site.nameHe}`}
            className="relative bg-[#fffdf8] p-2 shadow-[0_30px_60px_-35px_rgb(5_39_84/0.45)] ring-1 ring-navy/20 lg:col-span-7"
            data-anim="up"
          >
            <div className="border border-navy/70 px-5 pb-8 pt-10 sm:px-10 sm:pb-10">
              <header className="flex flex-col items-center text-center">
                <Image src={photos.logo.src} alt="" width={96} height={96} className="h-16 w-16 rounded-full sm:h-20 sm:w-20" />
                <h3 className="mt-4 font-display text-5xl font-black text-navy sm:text-6xl">תפריט</h3>
                <p className="mt-2 text-sm tracking-[0.2em] text-muted">
                  <span lang="en">ÁRTOS</span> · {site.slogan}
                </p>
              </header>

              {menu.map((cat, ci) =>
                cat.compact ? null : <Category key={cat.title} cat={cat} id={`menu-cat-${ci}`} />
              )}
              {/* drinks: side by side from sm up */}
              <div className="grid gap-x-10 sm:grid-cols-2">
                {menu.map((cat, ci) =>
                  cat.compact ? <Category key={cat.title} cat={cat} id={`menu-cat-${ci}`} compact /> : null
                )}
              </div>

              <footer className="mt-8 flex flex-col items-center gap-5 border-t border-navy/20 pt-8 text-center">
                {showPrices ? (
                  <p className="max-w-xs leading-relaxed text-ink/70">המחירים בשקלים, לפי התפריט של {site.nameHe}, ועשויים להשתנות.</p>
                ) : (
                  <p className="max-w-xs leading-relaxed text-ink/70">
                    המחירים מתעדכנים.
                    {site.contact.phone && (
                      <>
                        {" "}לפרטים:{" "}
                        <a href={telHref(site.contact.phone)} className="font-semibold text-navy underline underline-offset-4" dir="ltr">
                          {site.contact.phone}
                        </a>
                      </>
                    )}
                  </p>
                )}
                <a href="#location" className="btn btn-navy">
                  איך מגיעים
                  <ArrowLeft />
                </a>
              </footer>
            </div>
          </article>

          <figure className="relative lg:col-span-5 lg:sticky lg:top-28" data-anim="up" style={{ ["--delay" as string]: "180ms" }}>
            <div className="grain relative mx-auto aspect-[4/5] max-w-md overflow-hidden bg-stone lg:ms-auto lg:me-0">
              <div className="absolute inset-0" data-parallax="-12">
                <Image
                  src={photos.tableSea.src}
                  alt={photos.tableSea.alt}
                  fill
                  sizes="(min-width: 1024px) 440px, (min-width: 640px) 448px, 92vw"
                  className="object-cover object-[50%_55%]"
                />
              </div>
            </div>
            <figcaption className="mx-auto mt-3 flex max-w-md items-center justify-between text-sm text-muted lg:me-0">
              <span>מהמטבח של {site.nameHe}</span>
              <span lang="en" dir="ltr" className="tracking-widest">ÁRTOS</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
