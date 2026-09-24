export const fps = 30;

export const brand = {
  navy: "#052754",
  navyDeep: "#031a3a",
  turq: "#5de2e7",
  turqSoft: "#b9f1f3",
  sand: "#f1e8d8",
  stone: "#dccaa9",
  cream: "#fbf6ec",
  clay: "#9c4726",
  ink: "#10182b",
};

export type Beat =
  | {
      kind: "hook";
      image: string;
      seconds: number;
    }
  | {
      kind: "food";
      image: string;
      seconds: number;
      name: string;
      price: number;
      pan: "left" | "right";
      inset?: boolean;
    }
  | {
      kind: "rating";
      image: string;
      seconds: number;
      pan: "left" | "right";
    }
  | {
      kind: "quote";
      image: string;
      seconds: number;
      text: string;
      by: string;
      pan: "left" | "right";
    }
  | {
      kind: "family";
      image: string;
      seconds: number;
      tagline: string;
      pan: "left" | "right";
    }
  | {
      kind: "cta";
      image: string;
      seconds: number;
    };

export const beats: Beat[] = [
  { kind: "hook", image: "artos-seating.jpg", seconds: 3.0 },
  {
    kind: "food",
    image: "burger-tray.jpg",
    seconds: 2.2,
    name: "המבורגר 220 ג׳",
    price: 67,
    pan: "left",
  },
  {
    kind: "food",
    image: "hero-tray-girl.jpg",
    seconds: 2.2,
    name: "כריך אנטריקוט",
    price: 69,
    pan: "right",
  },
  {
    kind: "food",
    image: "food-schnitzel.jpg",
    seconds: 2.0,
    name: "שניצל בחלה של פלג",
    price: 55,
    pan: "left",
    inset: true,
  },
  { kind: "rating", image: "artos-seaview.jpg", seconds: 2.4, pan: "right" },
  {
    kind: "quote",
    image: "tent-night.jpg",
    seconds: 2.6,
    text: "אווירה טובה ואוכל טעים בטירוף! מנות גדולות ואחלה מחירים",
    by: "EDEN FROM · Google",
    pan: "left",
  },
  {
    kind: "family",
    image: "artos-kids.jpg",
    seconds: 2.0,
    tagline: "פינת משחקים לילדים · מושלם למשפחה",
    pan: "right",
  },
  { kind: "cta", image: "ein-gedi-palms.jpg", seconds: 5.5 },
];

export const totalSeconds = beats.reduce((sum, b) => sum + b.seconds, 0);
export const totalFrames = Math.round(totalSeconds * fps);

export const contact = {
  phone: "053-665-1928",
  slogan: "בשר בנווה מדבר",
  nameHe: "ארטוס",
  location: "עין גדי · ים המלח",
  rating: { score: 4.5, count: 51 },
  ctaMenu: "לתפריט",
  ctaDirections: "איך מגיעים",
  openNow: "פתוחים עכשיו",
};
