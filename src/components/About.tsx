import Image from "next/image";
import { photos, signatureDish, site } from "@/content/site";
import { Laurel } from "./Graphics";
import SectionHeading from "./SectionHeading";

export default function About() {
  const facts = [
    { term: "מה", value: site.kind },
    { term: "איפה", value: `${site.location}, ${site.region}` },
    { term: "בצלחת", value: `בשר · ${signatureDish}` },
  ];

  return (
    <section id="about" aria-labelledby="about-title" className="on-light relative overflow-hidden bg-sand py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <SectionHeading
            id="about-title"
            eyebrow="אודות"
            title={
              <>
                פודטראק
                <br />
                בנווה המדבר<span className="text-clay">.</span>
              </>
            }
          />
          <div className="mt-10 max-w-xl space-y-5 text-lg leading-relaxed text-ink/80 sm:text-xl" data-anim="up" style={{ ["--delay" as string]: "120ms" }}>
            <p>
              {site.nameHe} הוא {site.kind} ב{site.location} — נווה המדבר שבין צוקי מדבר יהודה לחוף {site.region}.
            </p>
            <p>
              על הלוגו שלנו כתוב בדיוק מה מחכה לכם כאן:{" "}
              <strong className="font-display text-2xl font-bold text-navy">{site.slogan}.</strong>
            </p>
          </div>
        </div>

        <div className="relative lg:col-span-5 lg:pt-24">
          <Laurel className="absolute -top-10 end-0 h-40 w-16 rotate-12 text-stone lg:-top-4 lg:end-4 lg:h-56 lg:w-24" />
          <dl className="relative border-t-2 border-navy" data-anim="up" style={{ ["--delay" as string]: "200ms" }}>
            {facts.map((f, i) => (
              <div key={f.term} className="grid grid-cols-[minmax(4.5rem,auto)_1fr] items-baseline gap-4 border-b border-navy/15 py-5">
                <dt className="min-w-0 text-sm font-semibold tracking-wider text-clay">
                  <span className="me-2 font-display text-navy/40" aria-hidden="true">0{i + 1}</span>
                  {f.term}
                </dt>
                <dd className="font-display text-2xl font-bold text-navy sm:text-3xl">{f.value}</dd>
              </div>
            ))}
          </dl>
          <p lang="en" dir="ltr" aria-hidden="true" className="mt-8 select-none text-end font-display text-[clamp(4rem,14vw,8rem)] font-black leading-none text-transparent [-webkit-text-stroke:1.5px_var(--color-stone)]">
            Ártos
          </p>
        </div>
      </div>

      <figure className="mx-auto mt-16 max-w-7xl px-5 sm:mt-24 sm:px-8" data-anim="up">
        <div className="relative aspect-[4/3] overflow-hidden bg-stone sm:aspect-[16/9] lg:aspect-[21/9]">
          <div className="absolute inset-0" data-parallax="-10">
            <Image
              src={photos.trayGirl.src}
              alt={photos.trayGirl.alt}
              fill
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="object-cover object-[50%_45%]"
            />
          </div>
        </div>
        <figcaption className="mt-3 flex items-center justify-between gap-4 text-sm text-muted">
          <span>מגש מ{site.nameHe}, מול הנוף של {site.region}.</span>
          <span lang="en" dir="ltr" className="shrink-0 tracking-widest">ÁRTOS</span>
        </figcaption>
      </figure>
    </section>
  );
}
