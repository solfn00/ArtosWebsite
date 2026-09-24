import { site, telHref } from "@/content/site";
import { PhoneIcon, PinIcon, WhatsAppIcon, waHref } from "./Graphics";

/**
 * Phone-only action bar pinned to the bottom of the screen: call, WhatsApp,
 * navigate. Sits under the mobile menu overlay (z-30 < z-40) and is marked
 * `data-behind-menu`, so Navbar makes it inert while the menu is open.
 * Each action only appears when its detail is actually known.
 */
export default function MobileActionBar() {
  const { phone, whatsapp } = site.contact;
  const actions = [
    phone && { href: telHref(phone), label: "חיוג", icon: <PhoneIcon className="h-5 w-5" /> },
    whatsapp && {
      href: waHref(whatsapp),
      label: "וואטסאפ",
      icon: <WhatsAppIcon className="h-5 w-5" />,
      external: true,
    },
    site.mapsUrl && {
      href: site.mapsUrl,
      label: "ניווט",
      icon: <PinIcon className="h-5 w-5" />,
      external: true,
    },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode; external?: boolean }[];

  if (actions.length === 0) return null;

  return (
    <div
      data-behind-menu
      className="fixed inset-x-0 bottom-0 z-30 border-t border-cream/15 bg-navy/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <nav
        aria-label="פעולות מהירות"
        className="mx-auto grid max-w-md"
        style={{ gridTemplateColumns: `repeat(${actions.length}, minmax(0, 1fr))` }}
      >
        {actions.map((a) => (
          <a
            key={a.label}
            href={a.href}
            {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-xs font-semibold text-cream transition-colors active:bg-cream/10"
          >
            <span className="text-turq">{a.icon}</span>
            {a.label}
            {a.external && <span className="sr-only">(נפתח בחלון חדש)</span>}
          </a>
        ))}
      </nav>
    </div>
  );
}
