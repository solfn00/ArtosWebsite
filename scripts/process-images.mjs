// Prepares the supplied Art'os photos (source-assets/) for the web.
// next/image then serves AVIF/WebP variants at the sizes each layout needs.
// Run: npm run images
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "source-assets";
const OUT = "public/images";
const APP = "src/app";
const NAVY = "#052754"; // sampled from the supplied logo

await mkdir(OUT, { recursive: true });

// High-resolution photos from the Art'os Google Maps listing (downloaded
// 2026-09-21 with the owner side's approval). Resized for the web.
const scenes = {
  "hero-tray-girl": { width: 1400 },
  "tent-night": { width: 1400 },
  "burger-tray": { width: 1200 },
  "table-sea": { width: 1400 },
  "artos-truck": { width: 1600 },
  "artos-seating": { width: 1800 },
  "artos-seaview": { width: 1800 },
  "ein-gedi-palms": { width: 2200 },
  // tall phone shot — crop to the toy truck on the grass
  "artos-kids": { width: 1000, quality: 72, extract: { left: 0, top: 1500, width: 1800, height: 2400 } },
};
for (const [name, { width, extract, quality = 80 }] of Object.entries(scenes)) {
  let img = sharp(`${SRC}/${name}.jpg`).rotate();
  if (extract) img = img.extract(extract);
  const info = await img
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true, progressive: true })
    .toFile(`${OUT}/${name}.jpg`);
  console.log(name, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`);
}

// Logo: crop the circle out of its white square onto transparency.
const LOGO = 447;
const circle = Buffer.from(
  `<svg width="${LOGO}" height="${LOGO}"><circle cx="${LOGO / 2}" cy="${LOGO / 2}" r="${LOGO / 2 - 3}" fill="#fff"/></svg>`
);
const logo = await sharp(`${SRC}/logo.jpg`)
  .resize(LOGO, LOGO)
  .composite([{ input: circle, blend: "dest-in" }])
  .png()
  .toBuffer();
// the logo shows at 447px at most; palette PNG keeps it sharp at a fraction of the weight
await sharp(logo).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(`${OUT}/artos-logo.png`);
await sharp(logo).resize(192, 192).png().toFile(`${APP}/icon.png`);
await sharp(logo)
  .resize(160, 160)
  .extend({ top: 10, bottom: 10, left: 10, right: 10, background: NAVY })
  .flatten({ background: NAVY })
  .png()
  .toFile(`${APP}/apple-icon.png`);

// Open Graph card (1200×630): the truck photo beside a navy panel with the logo.
await sharp({
  create: { width: 1200, height: 630, channels: 3, background: NAVY },
})
  .composite([
    { input: await sharp(`${OUT}/artos-truck.jpg`).resize(780, 630, { fit: "cover", position: "left" }).toBuffer(), left: 0, top: 0 },
    { input: await sharp(logo).resize(300, 300).toBuffer(), left: 840, top: 165 },
  ])
  .jpeg({ quality: 86 })
  .toFile(`${APP}/opengraph-image.jpg`);

console.log("images ready");
