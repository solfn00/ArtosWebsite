import Image from "next/image";
import { photos, site } from "@/content/site";
import BurgerStack from "./BurgerStack";
import { ArrowLeft, ClosedBadge, PinIcon, Ridge } from "./Graphics";

/**
 * Opening scene: a photoreal burger on a navy studio stage. Its layers drop in
 * with CSS (so it plays even if the motion script never loads); on scroll the
 * hero pins and the burger comes apart into a tall tower of its ingredients.
 */
export default function Hero() {
  return (
    // ScrollTrigger pins the hero inside this wrapper instead of wrapping it at
    // runtime: moving the section in the DOM would replay its CSS entrance.
    // The wrapper also carries #top: it always starts at the top of the page,
    // while the pinned section itself sits lower once the pin has run.
    <div id="top" data-hero-spacer>
      <section
        data-hero
        aria-labelledby="hero-title"
        className="grain relative isolate overflow-hidden bg-navy text-cream lg:min-h-svh"
      >
        {/* studio spotlight behind the burger */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(80%_42%_at_50%_24%,#134a90_0%,rgb(5_39_84/0)_72%)] lg:bg-[radial-gradient(40%_58%_at_27%_50%,#134a90_0%,rgb(5_39_84/0)_72%)]"
        />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-navy-deep/70 to-transparent" />

        <div className="relative mx-auto grid h-full w-full max-w-7xl items-center px-5 sm:px-8 lg:grid-cols-2 lg:gap-8">
          {/* the burger: above the title on phones, beside it on desktop */}
          <div className="-mb-14 flex justify-center pt-16 lg:order-last lg:mb-0 lg:pt-8">
            <BurgerStack className="w-[min(62vw,20rem)] md:w-[min(46vw,26rem)] lg:h-[min(74svh,44rem)] lg:w-auto" />
          </div>

          <div data-hero-copy className="relative pb-24 sm:pb-28 lg:pb-12 lg:pt-16">
            {/* logo badge */}
            <div className="hero-pop mb-5 inline-block lg:mb-7" style={{ ["--delay" as string]: "250ms" }}>
              <Image
                src={photos.logo.src}
                alt={photos.logo.alt}
                width={photos.logo.width}
                height={photos.logo.height}
                loading="eager"
                sizes="(min-width: 1024px) 112px, 80px"
                className="h-20 w-20 rounded-full ring-4 ring-cream/80 shadow-[0_18px_45px_-14px_rgb(0_0_0/0.8)] lg:h-28 lg:w-28"
              />
            </div>

            <h1
              id="hero-title"
              className="font-display text-[clamp(5rem,27vw,10rem)] font-black leading-[0.82] tracking-tight [text-shadow:0_10px_50px_rgb(3_26_58/0.75)] lg:text-[clamp(7rem,11vw,11.5rem)]"
            >
              {[...site.nameHe].map((letter, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <span className="hero-rise inline-block" style={{ ["--delay" as string]: `${520 + i * 80}ms` }}>
                    {letter}
                  </span>
                </span>
              ))}
            </h1>

            <div
              className="hero-rise mt-5 flex max-w-xl flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-cream/25 pt-4 lg:mt-7"
              style={{ ["--delay" as string]: "980ms" }}
            >
              <p className="eyebrow text-turq">
                {site.kind} · {site.location}
              </p>
              <p lang="en" dir="ltr" className="text-sm font-medium tracking-[0.45em] text-muted-dark">
                ÁRTOS
              </p>
            </div>

            <p
              className="hero-rise mt-5 max-w-md font-display text-3xl font-medium leading-tight sm:text-4xl lg:mt-6 lg:text-5xl"
              style={{ ["--delay" as string]: "1100ms" }}
            >
              {site.slogan}
              <span className="text-turq">.</span>
            </p>

            <div className="hero-rise mt-8 flex flex-wrap gap-3 lg:mt-9" style={{ ["--delay" as string]: "1220ms" }}>
              <a href="#food" className="btn btn-turq">
                לתפריט
                <ArrowLeft />
              </a>
              <a href="#location" className="btn btn-ghost">
                <PinIcon />
                איך מגיעים
              </a>
            </div>

            {site.temporarilyClosed && (
              <p
                className="hero-rise mt-6 flex flex-wrap items-center gap-3 text-cream/80"
                style={{ ["--delay" as string]: "1340ms" }}
              >
                <ClosedBadge className="bg-cream/10 text-cream ring-1 ring-cream/25" />
                <a
                  href="#contact"
                  className="inline-flex min-h-11 items-center underline decoration-cream/40 underline-offset-4 hover:text-cream hover:decoration-turq"
                >
                  לפרטים ועדכונים
                </a>
              </p>
            )}
          </div>
        </div>

        <Ridge className="absolute inset-x-0 -bottom-px h-14 w-full text-sand sm:h-20 lg:h-24" />
      </section>
    </div>
  );
}
