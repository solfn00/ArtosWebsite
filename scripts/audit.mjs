/**
 * Production audit: loads the page at every width we support and asserts the
 * things that keep breaking — horizontal overflow, elements left invisible by
 * the motion layer, console/network errors, tiny tap targets, heading order.
 * Usage: node scripts/audit.mjs [url] [--shots]
 */
import puppeteer from "puppeteer";
import { mkdirSync } from "node:fs";

const url = process.argv[2] || "http://localhost:3000";
const shots = process.argv.includes("--shots");
const OUT = "motion-check";
if (shots) mkdirSync(OUT, { recursive: true });

const WIDTHS = [320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1920];
const browser = await puppeteer.launch({ headless: true });
let failures = 0;

for (const width of WIDTHS) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("JS: " + e.message));
  page.on("console", (m) => m.type() === "error" && errors.push("console: " + m.text().slice(0, 120)));
  page.on("requestfailed", (r) => errors.push("request: " + r.url().slice(-60)));
  await page.setViewport({ width, height: 900 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
  await page.goto(url, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2600));

  // walk the whole page so every scroll-triggered reveal fires
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 45));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 900));

  const r = await page.evaluate(() => {
    const doc = document.documentElement;
    const invisible = [...document.querySelectorAll("[data-anim]")]
      .filter((e) => {
        const cs = getComputedStyle(e);
        return cs.visibility !== "visible" || Number(cs.opacity) < 0.05;
      })
      .map((e) => (e.tagName + "." + String(e.className)).slice(0, 50));
    const wide = [...document.querySelectorAll("body *")]
      .filter((e) => {
        const b = e.getBoundingClientRect();
        return b.width > 0 && (b.right > doc.clientWidth + 1 || b.left < -1);
      })
      // a scroll container is allowed to hold wider children (the reviews carousel)
      .filter((e) => !e.closest("[aria-hidden='true'], dialog, [data-marquee]"))
      .filter((e) => {
        for (let p = e.parentElement; p; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX;
          if (o === "hidden" || o === "auto" || o === "scroll" || o === "clip") return false;
        }
        return true;
      })
      .slice(0, 5)
      .map((e) => (e.tagName + "." + String(e.className)).slice(0, 50));
    const small = [...document.querySelectorAll("a[href], button")]
      .filter((e) => {
        const b = e.getBoundingClientRect();
        // skip-links and other sr-only controls are 1px until focused
        if (e.className && String(e.className).includes("sr-only")) return false;
        return b.width > 0 && b.height > 0 && (b.height < 40 || b.width < 24);
      })
      .map((e) => `${e.tagName}:${(e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 18)} ${Math.round(e.getBoundingClientRect().height)}px`);
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => Number(h.tagName[1]));
    let order = "ok";
    for (let i = 1; i < headings.length; i++) if (headings[i] - headings[i - 1] > 1) order = `jump ${headings[i - 1]}→${headings[i]}`;
    const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length;
    return {
      overflow: doc.scrollWidth - doc.clientWidth,
      invisible, wide, small, order, broken,
      h1: document.querySelectorAll("h1").length,
    };
  });

  const bad =
    r.overflow > 0 || r.invisible.length || r.wide.length || r.small.length ||
    r.order !== "ok" || r.broken || r.h1 !== 1 || errors.length;
  if (bad) failures++;
  console.log(
    `${String(width).padStart(4)}px ${bad ? "FAIL" : "ok  "} overflow:${r.overflow} h1:${r.h1} headings:${r.order} broken:${r.broken}` +
      (r.invisible.length ? `\n      invisible: ${r.invisible.join(" | ")}` : "") +
      (r.wide.length ? `\n      overflowing: ${r.wide.join(" | ")}` : "") +
      (r.small.length ? `\n      small targets: ${r.small.join(" | ")}` : "") +
      (errors.length ? `\n      errors: ${[...new Set(errors)].join(" | ")}` : "")
  );
  if (shots) await page.screenshot({ path: `${OUT}/w${width}.png`, fullPage: width < 500 });
  await page.close();
}

// reduced motion: everything must be readable and still
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await page.goto(url, { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 2200));
const rm = await page.evaluate(() => ({
  hidden: [...document.querySelectorAll("[data-anim]")].filter((e) => getComputedStyle(e).visibility !== "visible" || Number(getComputedStyle(e).opacity) < 0.05).length,
  running: document.getAnimations().filter((a) => a.playState === "running").length,
}));
console.log(`reduced-motion  hidden:${rm.hidden} running-animations:${rm.running}`);
if (rm.hidden) failures++;
await page.close();

await browser.close();
console.log(failures ? `\n${failures} viewport(s) with problems` : "\nall viewports clean");
process.exit(failures ? 1 : 0);
