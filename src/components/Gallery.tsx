"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { photos, site, type Photo } from "@/content/site";
import { ArrowLeft, Laurel } from "./Graphics";
import SectionHeading from "./SectionHeading";

type Shot = Photo & { cell: string; pos?: string; sizes: string };

// Desktop: 12-col mosaic over 4 rows. Mobile: 2 columns in DOM order.
// Only the high-resolution photos are shown.
const shots: Shot[] = [
  { ...photos.tentNight, cell: "col-span-2 aspect-[4/3] md:col-span-7 md:col-start-1 md:row-span-2 md:row-start-1 md:aspect-auto", sizes: "(min-width: 768px) 58vw, 92vw" },
  { ...photos.seaview, cell: "col-span-2 aspect-[4/3] md:col-span-3 md:col-start-8 md:row-start-1 md:aspect-auto", sizes: "(min-width: 768px) 25vw, 92vw" },
  { ...photos.truck, cell: "aspect-[3/4] md:col-span-3 md:col-start-8 md:row-start-2 md:aspect-auto", pos: "40% 50%", sizes: "(min-width: 768px) 25vw, 46vw" },
  { ...photos.seating, cell: "aspect-[3/4] md:col-span-2 md:col-start-11 md:row-start-3 md:aspect-auto", pos: "50% 60%", sizes: "(min-width: 768px) 18vw, 46vw" },
  { ...photos.kids, cell: "aspect-[3/4] md:col-span-3 md:col-start-8 md:row-start-3 md:aspect-auto", sizes: "(min-width: 768px) 25vw, 46vw" },
  { ...photos.tableSea, cell: "col-span-2 aspect-[4/3] md:col-span-4 md:col-start-1 md:row-start-3 md:aspect-auto", sizes: "(min-width: 768px) 34vw, 92vw" },
  { ...photos.burgerTray, cell: "col-span-2 aspect-[4/3] md:col-span-3 md:col-start-5 md:row-start-3 md:aspect-auto", sizes: "(min-width: 768px) 25vw, 92vw" },
];
export default function Gallery() {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  const open = (i: number, el: HTMLButtonElement) => {
    openerRef.current = el;
    setIndex(i);
  };
  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + shots.length) % shots.length)),
    []
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (index !== null) {
      if (!dialog.open) dialog.showModal();
      // the page behind a modal shouldn't scroll (same lock the mobile menu uses)
      document.body.style.overflow = "hidden";
      return;
    }
    document.body.style.overflow = "";
    if (dialog.open) dialog.close();
    // Escape closes the dialog natively before this runs; hand focus back either way
    openerRef.current?.focus();
    openerRef.current = null;
  }, [index]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    // RTL: left arrow = next, right arrow = previous
    if (e.key === "ArrowLeft") step(1);
    if (e.key === "ArrowRight") step(-1);
  };

  const current = index !== null ? shots[index] : null;

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="relative bg-navy py-24 text-cream sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading id="gallery-title" eyebrow="גלריה" eyebrowClassName="text-turq" title={<>מהטראק<span className="text-turq">.</span></>} />
          <p className="max-w-xs text-muted-dark" data-anim="up">
            {site.nameHe} · {site.location}. לחצו על תמונה להגדלה.
          </p>
        </div>

        <ul role="list" className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-12 md:auto-rows-[15rem] lg:auto-rows-[17rem]">
          {shots.map((s, i) => (
            <li key={s.src} className={`relative ${s.cell}`} data-anim="up" style={{ ["--delay" as string]: `${i * 90}ms` }}>
              <button
                type="button"
                onClick={(e) => open(i, e.currentTarget)}
                className="grain lift group absolute inset-0 overflow-hidden bg-navy-deep"
                aria-label={`הגדלת תמונה: ${s.alt}`}
              >
                <Image
                  src={s.src}
                  alt={s.alt}
                  fill
                  sizes={s.sizes}
                  className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-soft)] group-hover:scale-105"
                  style={{ objectPosition: s.pos }}
                />
                <span className="absolute inset-0 bg-navy/0 transition-colors duration-500 group-hover:bg-navy/15" />
              </button>
            </li>
          ))}

          {/* brand tiles */}
          <li className="relative flex aspect-square items-center justify-center bg-turq md:col-span-2 md:col-start-11 md:row-start-2 md:aspect-auto" data-anim="up" style={{ ["--delay" as string]: "200ms" }}>
            <Image src={photos.logo.src} alt={photos.logo.alt} width={447} height={447} sizes="(min-width: 768px) 18vw, 36vw" className="w-3/4 max-w-[11rem]" />
          </li>
          <li className="relative flex aspect-square flex-col justify-between overflow-hidden border border-cream/20 p-5 md:col-span-2 md:col-start-11 md:row-start-1 md:aspect-auto lg:p-7" data-anim="up" style={{ ["--delay" as string]: "260ms" }}>
            <Laurel className="absolute -bottom-6 -end-4 h-40 w-16 rotate-[20deg] text-turq/20" />
            <span className="eyebrow text-xs text-turq">{site.location}</span>
            <p className="relative font-display text-2xl font-bold leading-tight sm:text-3xl">{site.slogan}.</p>
          </li>
        </ul>
      </div>

      <dialog
        ref={dialogRef}
        onClose={close}
        onKeyDown={onKeyDown}
        onClick={(e) => e.target === e.currentTarget && close()}
        aria-label="תצוגת תמונה"
        className="m-auto max-h-[100svh] max-w-[100vw] overflow-y-auto overscroll-contain bg-transparent p-0 text-cream backdrop:bg-navy-deep/92 backdrop:backdrop-blur-sm"
      >
        {current && (
          <figure className="flex flex-col items-center gap-4 p-4">
            <Image
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="(min-width: 768px) 1100px, 92vw"
              className="h-auto max-h-[75svh] w-auto max-w-[92vw] object-contain md:max-w-[min(1100px,92vw)]"
            />
            <figcaption className="max-w-md text-center text-sm text-muted-dark" aria-hidden="true">
              {current.alt}
            </figcaption>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => step(-1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/30 hover:bg-cream/10" aria-label="התמונה הקודמת">
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </button>
              <span className="min-w-14 text-center text-sm tabular-nums text-faint-dark">
                <span aria-hidden="true">
                  {index! + 1} / {shots.length}
                </span>
                <span className="sr-only" aria-live="polite">
                  תמונה {index! + 1} מתוך {shots.length}
                </span>
              </span>
              <button type="button" onClick={() => step(1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/30 hover:bg-cream/10" aria-label="התמונה הבאה">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={close} className="btn btn-turq btn-sm ms-4" autoFocus>
                סגירה
              </button>
            </div>
          </figure>
        )}
      </dialog>
    </section>
  );
}
