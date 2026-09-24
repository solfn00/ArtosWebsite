/**
 * Art'os — single source of truth for site content.
 *
 * RULE: only verified information goes here. Everything below comes from the
 * material supplied by the business (logo, menu graphic, photos), the project
 * brief, or the Google Maps reviews supplied on 2026-09-21. If a field is `null` or an array is empty, the matching UI is
 * simply not rendered — never fill it with placeholder data.
 */

export type Review = {
  name: string;
  /** 1–5, only if the source shows it */
  rating?: number;
  /** verbatim — do not edit */
  text: string;
  /** only if the source shows it, e.g. "לפני חודש" */
  date?: string;
  source?: string;
  /** the source cut the text off ("… עוד") — shown with an ellipsis */
  truncated?: boolean;
};

export type Photo = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export const site = {
  nameHe: "ארטוס",
  nameEn: "Ártos",
  /** From the supplied logo: "בשר בנווה מדבר ." */
  slogan: "בשר בנווה מדבר",
  kind: "פודטראק",
  location: "עין גדי",
  region: "ים המלח",
  description:
    "ארטוס — פודטראק בעין גדי. בשר בנווה מדבר, על שפת ים המלח.",

  /** Official Google Maps share link, supplied 2026-09-21. */
  mapsUrl: "https://maps.app.goo.gl/CeDU4YqM2GvKFGkt6",
  mapsIsPlaceholder: false,
  /** Read off the owner's own Google Maps link for the listing (2026-09-22). */
  geo: { lat: 31.4505016, lng: 35.3852351 },

  /**
   * Business status. Confirmed by the owner side on 2026-09-21 (matches Google
   * Maps). Set `temporarilyClosed: false` when Art'os reopens — every closure
   * notice on the site disappears.
   */
  temporarilyClosed: true,

  /** Fill in to show the matching buttons. */
  contact: {
    /** Confirmed 2026-09-21 (also listed on Google Maps). */
    phone: "053-665-1928" as string | null,
    /** Confirmed 2026-09-21 — same number as the phone. Digits only. */
    whatsapp: "972536651928" as string | null,
    /**
     * Supplied by the owner 2026-09-24, both confirmed live. The share
     * tracking (`utm_source`, `stkn`, `locale`) is stripped on purpose: the
     * `stkn` token is tied to the owner's own share session.
     */
    instagram: "https://www.instagram.com/artos.kitchen/" as string | null,
    facebook: "https://www.facebook.com/p/Artos-100057154492461/" as string | null,
  },

  /**
   * Not supplied yet — the hours block and the live open/closed badge stay
   * hidden while this is empty. To switch them on, add real hours, e.g.
   *   { days: "א׳–ה׳", time: "11:00–21:00", opens: "11:00", closes: "21:00", weekdays: [0,1,2,3,4] }
   * `weekdays` is 0=Sunday … 6=Saturday. Never fill this in with a guess.
   */
  hours: [] as {
    days: string;
    time: string;
    opens?: string;
    closes?: string;
    weekdays?: number[];
  }[],
};

/**
 * Live open/closed state, derived only from real `site.hours`.
 * Returns null when there are no hours to judge by, or while the business is
 * temporarily closed — the site then shows the verified closure notice instead.
 */
export function isOpenNow(now = new Date()): boolean | null {
  if (site.temporarilyClosed || site.hours.length === 0) return null;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
  };
  return site.hours.some((h) => {
    if (!h.opens || !h.closes || !h.weekdays?.includes(now.getDay())) return false;
    const open = toMinutes(h.opens);
    const close = toMinutes(h.closes);
    // a span that ends after midnight counts until closing time the next day
    return close > open ? minutes >= open && minutes < close : minutes >= open || minutes < close;
  });
}

/**
 * The business's own social profiles, in the order they are shown.
 * Handles are read off the profile URLs — nothing here is guessed.
 */
export const socials = (
  [
    { key: "instagram", label: "Instagram", handle: "@artos.kitchen", href: site.contact.instagram },
    { key: "facebook", label: "Facebook", handle: "Artos", href: site.contact.facebook },
  ] as const
).filter((s): s is typeof s & { href: string } => Boolean(s.href));

/** "053-665-1928" → "tel:+972536651928" */
export function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `tel:+972${digits.replace(/^0/, "")}`;
}

export type MenuItem = {
  /** Hebrew name shown on the site */
  name: string;
  /** English name for tourists (see the note on `menu`) */
  nameEn?: string;
  /** In ₪, exactly as printed on the menu */
  price?: number;
  /** Hebrew translation of the printed description */
  description?: string;
  /** A short verbatim excerpt from a real review that mentions this item. */
  quote?: { text: string; by: string };
};

export type MenuCategory = {
  title: string;
  titleEn?: string;
  /** compact categories (drinks) sit side by side on wider screens */
  compact?: boolean;
  items: MenuItem[];
};

/** Prices are current as of the owner's update on 2026-09-21. */
export const showPrices = true;

/*
 * Updated menu (owner, 2026-09-21): prices and items below replace the older
 * menu image. English names: from the printed menu where the dish is
 * unchanged; otherwise a plain translation of the owner's Hebrew name.
 * Descriptions are translated from the printed menu; items new in this update
 * have none. Confirm with the owner that the older descriptions still apply.
 */
export const menu: MenuCategory[] = [
  {
    title: "המנות",
    titleEn: "Menu",
    items: [
      {
        name: "כריך אנטריקוט",
        nameEn: "Entrecote sandwich",
        price: 69,
        description: "בשר איכותי קצוץ דק, חמוצים, חסה, עגבנייה ורוטב שום. מוגש עם צ׳יפס.",
        quote: { text: "לקחתי כריך אנטריקוט, טעים מאוד ומשביע ממש", by: "ofer levy" },
      },
      {
        name: "המבורגר 220 ג׳",
        nameEn: "Burger 220g",
        price: 67,
        description:
          "קציצת צלע אנטריקוט, עגבנייה, חמוצים, חסה ובצל — או שלא, זה תלוי בכם! ו… כן, גם צ׳יפס, כמובן!",
        quote: { text: "המבורגר וכריך אנטריקוט מצוינים", by: "אריאל הוד" },
      },
      {
        name: "המבורגר 180 ג׳",
        nameEn: "Burger 180g",
        price: 60,
      },
      {
        name: "שניצל בחלה של פלג",
        nameEn: "Schnitzel in Challah à la Peleg",
        price: 55,
        description:
          "שניצל אמיתי, הטחינה של איציקו ומטבוחה, חמוצים וסלט ירקות. צ׳יפס בצד, כמו שצריך!",
        quote: { text: "החלה המטבוחה והכל היה טרי", by: "Hen" },
      },
      {
        name: "שניצלונים וצ׳יפס של תהלול",
        nameEn: "Tahelool's Schnitzel Bites & Fries",
        price: 55,
      },
      {
        name: "קריספי פיש אנד צ׳יפס",
        nameEn: "Crispy Fish & Chips",
        price: 55,
        description: "כיף על מגש, עם רוטב בדיוק במידה.",
      },
      {
        name: "נאגטס וצ׳יפס",
        nameEn: "Nuggets & Fries",
        price: 45,
      },
    ],
  },
  {
    title: "ועוד",
    items: [{ name: "רק צ׳יפס בשבילי", nameEn: "Just fries for me", price: 17 }],
  },
  {
    title: "משקאות קרים במדבר הלוהט",
    titleEn: "Cold drinks in the fiery desert..",
    compact: true,
    items: [
      { name: "שתייה קלה", nameEn: "Soft Drink", price: 10 },
      { name: "טרופית", nameEn: "\"Tropit\"", price: 5, description: "מיץ ענבים בשקית" },
      { name: "בירה", nameEn: "Beer", price: 23 },
      { name: "מים מינרליים", nameEn: "Mineral water", price: 8 },
    ],
  },
  {
    title: "ברד",
    titleEn: "slushie frozen drink",
    compact: true,
    items: [
      { name: "גדול", nameEn: "Big", price: 12 },
      { name: "עם ערק", nameEn: "With Arak", price: 23, description: "למבוגרים בלבד ⁦;)⁩" },
    ],
  },
];

/** Signature dish, used in the About section. */
export const signatureDish = "שניצל בחלה";


export const photos = {
  // — supplied by the business, 2026-09-22 —
  burgerTray: {
    src: "/images/burger-tray.jpg",
    width: 1053,
    height: 782,
    alt: "המבורגר בלחמניית שומשום עם חסה ועגבנייה, על מגש עם צ'יפס, מול ים המלח",
  },
  trayGirl: {
    src: "/images/hero-tray-girl.jpg",
    width: 1179,
    height: 873,
    alt: "אורחת מחזיקה מגש עם המבורגר וצ'יפס על רקע ים המלח",
  },
  tentNight: {
    src: "/images/tent-night.jpg",
    width: 1145,
    height: 817,
    alt: "אוהל הישיבה של ארטוס בלילה, מוארך בשרשרת אורות, עם אורחים ליד השולחנות ופינת משחקים",
  },
  tableSea: {
    src: "/images/table-sea.jpg",
    width: 1179,
    height: 871,
    alt: "שני המבורגרים עם צ'יפס וסלט על השולחן, מול הנוף של ים המלח",
  },

  // — from the Art'os Google Maps listing, downloaded 2026-09-21 —
  truck: {
    src: "/images/artos-truck.jpg",
    width: 1600,
    height: 1200,
    alt: "הטראק האדום של ארטוס, ולקוחות מזמינים ליד הדלפק",
  },
  seating: {
    src: "/images/artos-seating.jpg",
    width: 1800,
    height: 1350,
    alt: "אוהל הישיבה של ארטוס: שולחנות, כיסאות צבעוניים ודשא, והטראק ברקע",
  },
  seaview: {
    src: "/images/artos-seaview.jpg",
    width: 1800,
    height: 1350,
    alt: "פינת ישיבה מוצלת בארטוס, מול ים המלח",
  },
  palms: {
    src: "/images/ein-gedi-palms.jpg",
    width: 2200,
    height: 990,
    alt: "עצי דקל בשקיעה על שפת ים המלח, עין גדי",
  },
  kids: {
    src: "/images/artos-kids.jpg",
    width: 1200,
    height: 1600,
    alt: "משאית צעצוע על הדשא בארטוס",
  },
  logo: {
    src: "/images/artos-logo.png",
    width: 447,
    height: 447,
    alt: "הלוגו של ארטוס: Ártos, זרי דפנה והכיתוב בשר בנווה מדבר",
  },
} satisfies Record<string, Photo>;

/**
 * Google Maps summary as supplied on 2026-09-21. Update or set to null when it
 * changes — it is shown on the page as a snapshot.
 */
export const googleSummary = { rating: 4.5, count: 51 } as { rating: number; count: number } | null;

/**
 * Real Google Maps reviews, copied verbatim (typos included) from the listing
 * as supplied on 2026-09-21. Relative dates are as of that day. The source
 * shows no per-review star rating, so none is displayed. Never write, edit or
 * paraphrase reviews; empty this array to hide the section and nav link.
 */
export const reviews: Review[] = [
  {
    name: "שי ניסר",
    text: "וואו איזה מקום נהדר. אכלנו שניצל בחלה והיה פשוט מצוין, האווירה נעימה וכיף לשבת, מי שהפעיל את העגלה היה מקסים. סך הכל מקום מקסים וכיפי, לגמרי אחזור אם אני בסביבה.",
    date: "לפני 3 חודשים",
    source: "Google",
    truncated: true,
  },
  {
    name: "Hen",
    text: "אכלנו שניצל בחלה והיה ממש ממש טעים, החלה המטבוחה והכל היה טרי וטעיםםםם\nוגם הכמות הייתה ממש יפה, המון שניצל והמון צ׳יפס\nמומלץ מאוד",
    date: "לפני שנה",
    source: "Google",
  },
  {
    name: "Reut Cohen",
    text: "וואווו! פוד טראק מעולה!\nמיקום יפהפה, מול ים המלח.\nמנות מפנקות ומאד טעימות. אפילו הילדה הבררנית התלהבה מכריך האנטריקוט וביקשה שנכין לה כאלו בבית...",
    date: "לפני שנה",
    source: "Google",
    truncated: true,
  },
  {
    name: "Shiri Topman",
    text: "המבורגר טעים, אחלה אווירה ונוף. לקח קצת זמן עד שהאוכל הגיע אבל לא נורא. הרבההההה יותר טוב מהאוכל בחדר האוכל של המלון אז לא להסס בכלל!",
    date: "לפני שנה",
    source: "Google",
  },
  {
    name: "EDEN FROM",
    text: "אווירה טובה ואוכל טעים בטירוף! מנות גדולות ואחלה מחירים, ממליצה בחום!",
    date: "לפני שנה",
    source: "Google",
  },
];

export const nav = [
  { id: "top", label: "בית" },
  { id: "about", label: "אודות" },
  { id: "food", label: "אוכל" },
  { id: "reviews", label: "ביקורות", requires: "reviews" as const },
  { id: "gallery", label: "גלריה" },
  { id: "location", label: "מיקום" },
].filter((item) => item.requires !== "reviews" || reviews.length > 0);

/**
 * Absolute site URL for canonical / Open Graph / JSON-LD.
 * Order: explicit NEXT_PUBLIC_SITE_URL (set this once there is a custom
 * domain) → Vercel's production domain (set automatically at build) → local.
 */
/** Bump when the page's content actually changes — feeds sitemap.xml. */
export const contentUpdated = "2026-09-24";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
