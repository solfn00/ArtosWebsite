import Image from "next/image";
import { photos, site, telHref } from "@/content/site";
import { ArrowLeft, ClosedBadge, PhoneIcon, PinIcon, Ridge, WhatsAppIcon, waHref } from "./Graphics";

/** Abstract contour lines — decorative, NOT a map. */
function Contours() {
  const rings = [0, 1, 2, 3, 4, 5, 6];
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
      {rings.map((i) => {
        const r = 30 + i * 26;
        const wob = 6 + i * 3;
        return (
          <path
            key={i}
            d={`M${200 - r} 200
               C${200 - r} ${200 - r * 0.6 - wob} ${200 - r * 0.4} ${200 - r - wob} 200 ${200 - r}
               S${200 + r + wob} ${200 - r * 0.5} ${200 + r} ${200 + wob / 2}
               S${200 + r * 0.4} ${200 + r + wob} ${200 - wob} ${200 + r}
               S${200 - r - wob / 2} ${200 + r * 0.5} ${200 - r} 200Z`}
          />
        );
      })}
    </svg>
  );
}

export default function Location() {
  return (
    <section id="location" aria-labelledby="location-title" className="on-light relative overflow-hidden bg-turq pb-40 text-navy sm:pb-32 lg:pb-40">
      {/* Ein Gedi panorama, cut by the desert ridge line */}
      <figure className="relative h-[44svh] min-h-64 max-h-[34rem] w-full overflow-hidden bg-navy">
        <div className="absolute inset-0" data-parallax="-16">
          <Image src={photos.palms.src} alt={photos.palms.alt} fill sizes="100vw" className="object-cover object-[50%_55%]" />
        </div>
        <figcaption className="absolute bottom-16 start-5 z-10 text-sm tracking-widest text-cream drop-shadow sm:bottom-20 sm:start-8 lg:bottom-28">
          {site.location} · {site.region}
        </figcaption>
        <Ridge className="absolute inset-x-0 -bottom-px z-10 h-12 w-full text-turq sm:h-16 lg:h-20" />
      </figure>

      <div className="pointer-events-none absolute -bottom-72 -end-52 h-[40rem] w-[40rem] text-navy/15 sm:-end-24 lg:bottom-auto lg:end-[4%] lg:top-1/2 lg:h-[46rem] lg:w-[46rem] lg:-translate-y-1/2">
        <Contours />
        <span className="absolute left-1/2 top-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <span className="h-3 w-3 rounded-full bg-navy" />
        </span>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24">
        <p className="eyebrow mb-4 text-navy" data-anim="up">מיקום</p>
        <h2 id="location-title" className="font-display font-black leading-[0.9] tracking-tight" data-anim="up">
          <span className="block text-[clamp(4.5rem,24vw,10rem)]">{site.nameHe}</span>
          <span className="mt-2 flex items-center gap-4 text-[clamp(2.25rem,9vw,5.5rem)]">
            <span aria-hidden="true" className="inline-block h-[3px] w-[0.8em] bg-navy" />
            <span className="sr-only">—</span>
            {site.location}
          </span>
        </h2>

        <p className="mt-8 max-w-md text-lg leading-relaxed text-navy/80 sm:text-xl" data-anim="up">
          נווה המדבר על שפת {site.region}. שימו את היעד בניווט — ונתראה אצלנו.
        </p>
        {site.temporarilyClosed && (
          <p className="mt-5 flex flex-wrap items-center gap-3 text-navy" data-anim="up">
            <ClosedBadge className="bg-navy text-cream" />
            <span>
              שימו לב: כרגע אנחנו סגורים. <a href="#contact" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">לפרטים</a>
            </span>
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3" data-anim="up">
          <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-navy">
            <PinIcon />
            נווטו אלינו
            <ArrowLeft />
            <span className="sr-only">(נפתח ב-Google Maps בחלון חדש)</span>
          </a>
          {site.contact.phone && (
            <a href={telHref(site.contact.phone)} className="btn btn-outline">
              <PhoneIcon />
              <span dir="ltr">{site.contact.phone}</span>
              <span className="sr-only">— התקשרו אלינו</span>
            </a>
          )}
          {site.contact.whatsapp && (
            <a
              href={waHref(site.contact.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <WhatsAppIcon />
              וואטסאפ
              <span className="sr-only">(נפתח בחלון חדש)</span>
            </a>
          )}
        </div>

        {site.hours.length > 0 && (
          <div className="mt-16 max-w-sm" data-anim="up">
            <h3 className="mb-3 text-sm font-semibold tracking-wider">שעות פתיחה</h3>
            <dl className="border-t-2 border-navy">
              {site.hours.map((h) => (
                <div key={h.days} className="flex justify-between border-b border-navy/20 py-3">
                  <dt>{h.days}</dt>
                  <dd className="font-semibold tabular-nums">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
