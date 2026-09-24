/**
 * Proves the page actually animates: samples the hero entrance frame by frame
 * and checks that the scroll-linked pieces really move.
 * Usage: node scripts/check-motion.mjs [url]
 */
import puppeteer from "puppeteer";
import { mkdirSync } from "node:fs";

const url = process.argv[2] || "http://localhost:3000";
const out = "motion-check";
mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
// headless Chrome asks for reduced motion by default; emulate a normal visitor
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: "domcontentloaded" });

// the burger layers drop in one by one
const frames = [];
for (let i = 0; i < 8; i++) {
  frames.push(
    await page.evaluate(() => {
      const layer = document.querySelector("[data-burger-layer] img");
      const copy = document.querySelector("[data-hero-copy]");
      const cs = (el) => (el ? getComputedStyle(el) : null);
      return {
        layer: cs(layer)?.transform.slice(0, 34),
        layerOpacity: cs(layer)?.opacity,
        copyOpacity: cs(copy)?.opacity,
      };
    })
  );
  if (i < 3) await page.screenshot({ path: `${out}/load-${i}.png` });
  await new Promise((r) => setTimeout(r, 170));
}
console.log("── hero entrance ──");
console.table(frames);

// scroll-linked: the burger comes apart, the marquee and parallax drift,
// the progress bar fills
const probe = async (y) => {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await new Promise((r) => setTimeout(r, 700));
  return page.evaluate(() => {
    const t = (sel) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).transform : null;
    };
    return {
      y: Math.round(window.scrollY),
      burger: t("[data-burger-layer]"),
      label: document.querySelector("[data-burger-label]") ? getComputedStyle(document.querySelector("[data-burger-label]")).opacity : null,
      marquee: t("[data-marquee]"),
      parallax: t("[data-parallax]"),
      progress: t("[data-progress]"),
    };
  });
};
const a = await probe(0);
const b = await probe(600);
const c = await probe(3200);
console.log("── scroll-linked ──");
console.table([a, b, c]);
const moves = {
  burgerComesApart: a.burger !== b.burger,
  labelsAppear: Number(b.label) > Number(a.label),
  marquee: b.marquee !== c.marquee,
  parallax: b.parallax !== c.parallax,
  progress: a.progress !== c.progress,
};
console.log("moves:", moves);
console.log("page errors:", errors);
await browser.close();
process.exit(Object.values(moves).every(Boolean) && !errors.length ? 0 : 1);
