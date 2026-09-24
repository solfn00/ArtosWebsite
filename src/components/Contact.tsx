import { site, telHref } from "@/content/site";
import { ArrowLeft, PhoneIcon, PinIcon, WhatsAppIcon, waHref } from "./Graphics";

export default function Contact() {
  const { phone, whatsapp, instagram } = site.contact;
  const closed = site.temporarilyClosed;
  const extra = [
    instagram && { href: instagram, label: "Instagram" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <section id="contact" aria-labelledby="contact-title" className="on-light relative bg-sand py-24 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
        <p className="eyebrow justify-center text-clay" data-anim="up">{closed ? "עדכון" : "נתראה"}</p>
        <h2 id="contact-title" className="mx-auto mt-5 max-w-4xl font-display text-[clamp(3rem,12vw,7.5rem)] font-black leading-[0.92] tracking-tight text-navy text-balance" data-anim="up">
          {closed ? (
            <>
              סגורים <span className="text-clay">זמנית</span>.
            </>
          ) : (
            <>
              רעבים? <span className="text-clay">בואו</span> לעין גדי.
            </>
          )}
        </h2>
        {closed && (
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-ink/75 sm:text-xl" data-anim="up">
            {site.nameHe} סגור כרגע באופן זמני. לפרטים ועדכונים — דברו איתנו.
          </p>
        )}

        {phone && (
          <a
            href={telHref(phone)}
            className="group mt-10 inline-flex items-center gap-3 font-display text-[clamp(2rem,8vw,3.5rem)] font-bold text-navy transition-colors hover:text-clay"
            data-anim="up"
          >
            <PhoneIcon className="h-[0.7em] w-[0.7em] text-clay" />
            <span dir="ltr">{phone}</span>
            <span className="sr-only">— התקשרו אלינו</span>
          </a>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3" data-anim="up">
          {phone && (
            <a href={telHref(phone)} className="btn btn-navy">
              <PhoneIcon />
              התקשרו אלינו
            </a>
          )}
          {whatsapp && (
            <a href={waHref(whatsapp)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <WhatsAppIcon />
              וואטסאפ
              <span className="sr-only">(נפתח בחלון חדש)</span>
            </a>
          )}
          {!closed && (
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={phone ? "btn btn-outline" : "btn btn-navy"}
            >
              <PinIcon />
              נווטו אלינו
              <span className="sr-only">(נפתח בחלון חדש)</span>
            </a>
          )}
          <a href="#food" className="btn btn-outline">
            לתפריט
            <ArrowLeft />
          </a>
          {extra.map((c) => (
            <a key={c.href} href={c.href} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              {c.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
