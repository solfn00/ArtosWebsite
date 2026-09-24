// Slices the AI-generated exploded burger (source-assets/burger/master-cutout.png,
// generated 2026-09-23 with Higgsfield, background removed) into one
// transparent WebP per layer for the hero animation.
//
// Every layer is kept in the master's 688×1024 frame, so the exploded state is
// exactly the generated picture and nothing has to line up by hand. The script
// also writes where each layer sits once the burger is assembled.
// Run: node scripts/burger-layers.mjs
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const SRC = "source-assets/burger/master-cutout.png";
const OUT = "public/images/burger";
const DATA = "src/content/burgerLayers.ts";

// Top → bottom. `gap` is the row band the seam between this layer and the next
// one is searched in. `sink` is how deep the layer above sinks into this one
// once assembled, as a share of this layer's height (its top surface).
const LAYERS = [
  { name: "bun-top", label: "לחמנייה", gap: [231, 243] },
  { name: "onion", label: "בצל סגול", gap: [318, 340], sink: 0.3 },
  { name: "tomato", label: "עגבנייה", gap: [414, 434], sink: 0.2 },
  { name: "lettuce", label: "חסה", gap: [528, 552], sink: 0.35 },
  // sliced so the seams stay right, but left out of the site (owner's call, 2026-09-23)
  { name: "cheese", label: "צ׳דר", gap: [622, 654], sink: 0.3, skip: true },
  { name: "patty", label: "קציצת בקר", gap: [782, 802], sink: 0.25 },
  { name: "bun-bottom", label: "לחמנייה קלויה", sink: 0.28 },
];

await mkdir(OUT, { recursive: true });

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const at = (x, y) => (y * W + x) * 4;

// The remover left the grey studio backdrop inside the onion rings and in
// thin, half-transparent bridges between layers: key out bright, colourless
// pixels there (not everywhere, or the highlights on the meat go too).
const ONION_ROWS = [240, 335];
for (let i = 0; i < W * H * 4; i += 4) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
  const y = Math.floor(i / 4 / W);
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  const lum = (r + g + b) / 3;
  const suspect = (y >= ONION_ROWS[0] && y <= ONION_ROWS[1]) || data[i + 3] < 230;
  if (suspect && spread <= 9 && lum > 150 && lum < 240) data[i + 3] = 0;
  // tighten the soft matte edge so no grey halo shows on the navy hero
  else data[i + 3] = Math.max(0, Math.min(255, (data[i + 3] - 50) * 1.3));
}

/** Cheapest left→right path through a band of rows (seam carving on alpha). */
function seam([top, bottom]) {
  const rows = bottom - top + 1;
  const cost = new Float64Array(W * rows);
  const from = new Int32Array(W * rows);
  for (let x = 0; x < W; x++) {
    for (let r = 0; r < rows; r++) {
      const here = data[at(x, top + r) + 3];
      if (x === 0) {
        cost[r] = here;
        continue;
      }
      let best = Infinity;
      for (const d of [-1, 0, 1]) {
        const pr = r + d;
        if (pr < 0 || pr >= rows) continue;
        const c = cost[(x - 1) * rows + pr];
        if (c < best) {
          best = c;
          from[x * rows + r] = pr;
        }
      }
      cost[x * rows + r] = best + here;
    }
  }
  let r = 0;
  for (let i = 1; i < rows; i++) if (cost[(W - 1) * rows + i] < cost[(W - 1) * rows + r]) r = i;
  const path = new Int32Array(W);
  for (let x = W - 1; x >= 0; x--) {
    path[x] = top + r;
    r = from[x * rows + r];
  }
  return path;
}

const seams = LAYERS.slice(0, -1).map((l) => seam(l.gap));

const boxes = [];
for (const [i, layer] of LAYERS.entries()) {
  const above = seams[i - 1];
  const below = seams[i];
  const px = Buffer.alloc(W * H * 4);
  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (above && y <= above[x]) continue;
      if (below && y > below[x]) continue;
      const p = at(x, y);
      if (data[p + 3] < 8) continue;
      // the cheddar's drips hang down over the patty; drop that bright orange
      if (layer.name === "patty" && y < 676) {
        const [r, g, b] = [data[p], data[p + 1], data[p + 2]];
        if (r > 160 && g > 90 && r - b > 100) continue;
      }
      data.copy(px, p, p, p + 4);
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  const box = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  boxes.push(box);
  if (layer.skip) continue;
  const out = await sharp(px, { raw: { width: W, height: H, channels: 4 } })
    .extract({ left: box.x, top: box.y, width: box.w, height: box.h })
    .resize({ width: box.w * 2, kernel: "lanczos3" }) // 2× for retina
    .webp({ quality: 82, alphaQuality: 90, effort: 6 })
    .toFile(`${OUT}/${layer.name}.webp`);
  console.log(layer.name, box, `${Math.round(out.size / 1024)}KB`);
}

// Close the hole a skipped layer leaves in the exploded frame, keeping it centred.
for (const [i, layer] of LAYERS.entries()) {
  if (!layer.skip) continue;
  const hole = boxes[i + 1].y - boxes[i].y;
  boxes.forEach((b, j) => (b.y += j > i ? -hole / 2 : hole / 2));
}
const kept = LAYERS.map((l, i) => ({ ...l, box: boxes[i] })).filter((l) => !l.skip);

// Assembled stack: build it bottom-up, then centre it on the exploded one.
const restY = new Array(kept.length);
restY[kept.length - 1] = kept.at(-1).box.y;
for (let i = kept.length - 2; i >= 0; i--) {
  const under = kept[i + 1];
  restY[i] = restY[i + 1] + under.box.h * under.sink - kept[i].box.h;
}
const explodedMid = (kept[0].box.y + kept.at(-1).box.y + kept.at(-1).box.h) / 2;
const restMid = (restY[0] + restY.at(-1) + kept.at(-1).box.h) / 2;
const shift = explodedMid - restMid;

const pct = (n, of) => Math.round((n / of) * 10000) / 100;
const layers = kept.map((l, i) => ({
  name: l.name,
  label: l.label,
  src: `/images/burger/${l.name}.webp`,
  width: l.box.w * 2,
  height: l.box.h * 2,
  // position of the layer in the exploded frame, in % of the frame
  left: pct(l.box.x, W),
  top: pct(l.box.y, H),
  w: pct(l.box.w, W),
  // assembled position, as translateY in % of the layer's own height
  restY: pct(restY[i] + shift - l.box.y, l.box.h),
}));

await writeFile(
  DATA,
  `// Generated by scripts/burger-layers.mjs — do not edit by hand.\n` +
    `export const burgerFrame = { width: ${W}, height: ${H} };\n\n` +
    `export const burgerLayers = ${JSON.stringify(layers, null, 2)} as const;\n`
);
console.log("wrote", DATA);
