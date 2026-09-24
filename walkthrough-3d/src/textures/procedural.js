import * as THREE from 'three'
import { QUALITY } from '../config/quality'
import { PALETTE } from '../config/layout'

/**
 * Procedural canvas textures: every surface in the scene is drawn here, so the
 * experience ships with zero image downloads. Textures are generated lazily and
 * cached; `disposeTextures()` frees them when the scene unmounts.
 *
 * Architectural textures are authored in *metres*: geometry UVs are world-space
 * metres and each texture's `repeat` is 1 / (metres covered by one texture tile).
 */

const cache = new Map()
const S = QUALITY.textureSize

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function canvas(w, h = w) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

/** Soft value noise: random pixels on a tiny canvas, upscaled with smoothing. */
function noiseLayer(ctx, w, h, cells, alpha, rand, light = 255, dark = 0) {
  const small = canvas(cells, cells)
  const sctx = small.getContext('2d')
  const img = sctx.createImageData(cells, cells)
  for (let i = 0; i < cells * cells; i++) {
    const v = rand() > 0.5 ? light : dark
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v
    img.data[i * 4 + 3] = 255 * rand()
  }
  sctx.putImageData(img, 0, 0)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(small, 0, 0, w, h)
  ctx.restore()
}

function shade(hex, amount) {
  const c = new THREE.Color(hex)
  c.offsetHSL(0, 0, amount)
  return `#${c.getHexString()}`
}

function finish(c, { metres = null, srgb = true, repeat = null } = {}) {
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace
  if (metres) tex.repeat.set(1 / metres, 1 / metres)
  if (repeat) tex.repeat.set(repeat[0], repeat[1])
  return tex
}

function cached(key, fn) {
  if (!cache.has(key)) cache.set(key, fn())
  return cache.get(key)
}

/** Generic square-tile grid (optionally rectangular tiles). */
function tileGrid({ size = S, cols, rows, base, vary, grout, groutPx, seed, veins = false, gloss = false }) {
  const c = canvas(size)
  const ctx = c.getContext('2d')
  const r = rng(seed)
  const tw = size / cols
  const th = size / rows
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = shade(base, (r() - 0.5) * vary)
      ctx.fillRect(x * tw, y * th, tw, th)
    }
  }
  noiseLayer(ctx, size, size, 64, 0.06, r)
  if (veins) {
    ctx.save()
    ctx.globalAlpha = 0.08
    ctx.strokeStyle = '#8f8a82'
    for (let i = 0; i < 18; i++) {
      ctx.lineWidth = 0.6 + r() * 1.4
      ctx.beginPath()
      let px = r() * size
      let py = r() * size
      ctx.moveTo(px, py)
      for (let k = 0; k < 8; k++) {
        px += (r() - 0.3) * size * 0.12
        py += (r() - 0.5) * size * 0.12
        ctx.lineTo(px, py)
      }
      ctx.stroke()
    }
    ctx.restore()
  }
  if (gloss) {
    // faint diagonal sheen on each tile
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const g = ctx.createLinearGradient(x * tw, y * th, (x + 1) * tw, (y + 1) * th)
        g.addColorStop(0, 'rgba(255,255,255,0.10)')
        g.addColorStop(0.5, 'rgba(255,255,255,0)')
        g.addColorStop(1, 'rgba(0,0,0,0.04)')
        ctx.fillStyle = g
        ctx.fillRect(x * tw, y * th, tw, th)
      }
  }
  ctx.fillStyle = grout
  for (let x = 0; x <= cols; x++) ctx.fillRect(x * tw - groutPx / 2, 0, groutPx, size)
  for (let y = 0; y <= rows; y++) ctx.fillRect(0, y * th - groutPx / 2, size, groutPx)
  return c
}

/** Staggered plank floor: 12 planks per texture, planks half a texture long. */
function planks(base, seed, metres = 2.4) {
  const c = canvas(S)
  const ctx = c.getContext('2d')
  const r = rng(seed)
  const n = 12
  const pw = S / n
  for (let i = 0; i < n; i++) {
    const offset = r() * (S / 2)
    // planks are S/2 long; stepping from −S/2 guarantees the column is fully covered
    for (let k = -1; k < 3; k++) {
      const y0 = offset + k * (S / 2)
      ctx.fillStyle = shade(base, (r() - 0.5) * 0.08)
      ctx.fillRect(i * pw, y0, pw, S / 2)
      ctx.save()
      ctx.beginPath()
      ctx.rect(i * pw, y0, pw, S / 2)
      ctx.clip()
      for (let g = 0; g < 14; g++) {
        ctx.strokeStyle = `rgba(70,50,30,${0.04 + r() * 0.07})`
        ctx.lineWidth = 0.5 + r() * 1.5
        const gx = i * pw + r() * pw
        ctx.beginPath()
        ctx.moveTo(gx, y0)
        ctx.bezierCurveTo(gx + (r() - 0.5) * pw * 0.5, y0 + S * 0.15, gx + (r() - 0.5) * pw * 0.5, y0 + S * 0.35, gx, y0 + S / 2)
        ctx.stroke()
      }
      ctx.restore()
      ctx.fillStyle = 'rgba(50,35,20,0.35)'
      ctx.fillRect(i * pw, y0, pw, Math.max(1, S / 700))
    }
    ctx.fillStyle = 'rgba(50,35,20,0.3)'
    ctx.fillRect(i * pw, 0, Math.max(1, S / 700), S)
  }
  noiseLayer(ctx, S, S, 128, 0.04, r)
  return finish(c, { metres })
}

export const textures = {
  /** Interior floor: large pale greige porcelain (0.6 m). */
  floorTiles: () =>
    cached('floorTiles', () =>
      finish(tileGrid({ cols: 2, rows: 2, base: '#dcd7cf', vary: 0.025, grout: '#b4ada3', groutPx: S / 400, seed: 13, veins: true }), {
        metres: 1.2,
      }),
    ),
  /** Bathroom walls: glossy white 30 × 60 cm tiles. */
  bathTiles: () =>
    cached('bathTiles', () =>
      finish(tileGrid({ cols: 4, rows: 2, base: '#f4f4f1', vary: 0.015, grout: '#cfccc6', groutPx: S / 400, seed: 14, gloss: true }), {
        metres: 1.2,
      }),
    ),
  /** Oak planks (0.2 m wide, 1.2 m long, staggered). */
  wood: () => cached('wood', () => planks(PALETTE.oak, 21)),
  /** Grey-beige wood-look laminate of the bedroom and living room. */
  laminate: () => cached('laminate', () => planks(PALETTE.laminate, 22)),
  /** Moroccan cement tiles: beige ground with brown interlocking quatrefoils (0.2 m). */
  moroccan: () =>
    cached('moroccan', () => {
      const size = S / 2
      const c = canvas(size)
      const ctx = c.getContext('2d')
      const r = rng(31)
      // grey ground with taupe-brown ornament, as in the bathroom (26–33 s)
      ctx.fillStyle = '#d3cec6'
      ctx.fillRect(0, 0, size, size)
      const t = size / 2
      for (let y = 0; y < 2; y++)
        for (let x = 0; x < 2; x++) {
          const cx = x * t + t / 2
          const cy = y * t + t / 2
          ctx.save()
          ctx.translate(cx, cy)
          ctx.strokeStyle = '#6e6157'
          ctx.fillStyle = '#7d7064'
          ctx.lineWidth = t * 0.05
          // four petals
          for (let k = 0; k < 4; k++) {
            ctx.rotate(Math.PI / 2)
            ctx.beginPath()
            ctx.ellipse(0, -t * 0.25, t * 0.12, t * 0.2, 0, 0, Math.PI * 2)
            ctx.stroke()
          }
          ctx.beginPath()
          ctx.arc(0, 0, t * 0.07, 0, Math.PI * 2)
          ctx.fill()
          // corner quarter-circles link the tiles into a continuous pattern
          ctx.lineWidth = t * 0.045
          for (let k = 0; k < 4; k++) {
            ctx.rotate(Math.PI / 2)
            ctx.beginPath()
            ctx.arc(t / 2, t / 2, t * 0.22, Math.PI, Math.PI * 1.5)
            ctx.stroke()
          }
          ctx.restore()
        }
      noiseLayer(ctx, size, size, 48, 0.08, r)
      ctx.fillStyle = '#a79a86'
      ctx.fillRect(0, 0, size, 1.5)
      ctx.fillRect(0, t - 0.75, size, 1.5)
      ctx.fillRect(0, 0, 1.5, size)
      ctx.fillRect(t - 0.75, 0, 1.5, size)
      return finish(c, { metres: 0.4 })
    }),
  plaster: () =>
    cached('plaster', () => {
      const c = canvas(S / 2)
      const ctx = c.getContext('2d')
      const r = rng(41)
      ctx.fillStyle = PALETTE.plaster
      ctx.fillRect(0, 0, c.width, c.height)
      noiseLayer(ctx, c.width, c.height, 16, 0.12, r, 255, 120)
      noiseLayer(ctx, c.width, c.height, 96, 0.08, r)
      return finish(c, { metres: 2.5 })
    }),
  concrete: () =>
    cached('concrete', () => {
      const c = canvas(S / 2)
      const ctx = c.getContext('2d')
      const r = rng(42)
      ctx.fillStyle = PALETTE.concrete
      ctx.fillRect(0, 0, c.width, c.height)
      noiseLayer(ctx, c.width, c.height, 12, 0.18, r, 230, 90)
      noiseLayer(ctx, c.width, c.height, 128, 0.12, r)
      // a few rain stains
      for (let i = 0; i < 10; i++) {
        const g = ctx.createLinearGradient(0, 0, 0, c.height)
        g.addColorStop(0, 'rgba(70,65,60,0.12)')
        g.addColorStop(1, 'rgba(70,65,60,0)')
        ctx.fillStyle = g
        ctx.fillRect(r() * c.width, 0, 4 + r() * 12, c.height * (0.3 + r() * 0.6))
      }
      return finish(c, { metres: 2 })
    }),
  paint: () =>
    cached('paint', () => {
      const c = canvas(256)
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 256, 256)
      noiseLayer(ctx, 256, 256, 24, 0.05, rng(43), 255, 180)
      return finish(c, { metres: 1.5 })
    }),
  /** Dark rattan weave for the terrace armchairs. */
  wicker: () =>
    cached('wicker', () => {
      const size = 256
      const c = canvas(size)
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#121214'
      ctx.fillRect(0, 0, size, size)
      const n = 16
      const s = size / n
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) {
          const over = (x + y) % 2 === 0
          const g = over
            ? ctx.createLinearGradient(x * s, 0, x * s + s, 0)
            : ctx.createLinearGradient(0, y * s, 0, y * s + s)
          g.addColorStop(0, '#1b1b1e')
          g.addColorStop(0.5, '#4a4a50')
          g.addColorStop(1, '#1b1b1e')
          ctx.fillStyle = g
          ctx.fillRect(x * s + 1, y * s + 1, s - 2, s - 2)
        }
      return finish(c, { metres: 0.14 })
    }),
  /** Red kilim with bands of diamonds (object UVs). */
  kilim: () =>
    cached('kilim', () => {
      const w = 256
      const h = 512
      const c = canvas(w, h)
      const ctx = c.getContext('2d')
      const r = rng(51)
      ctx.fillStyle = PALETTE.kilimRed
      ctx.fillRect(0, 0, w, h)
      const bands = ['#e9b44c', '#1e2a4a', '#f3e6cf', '#7a1426', '#e46a2e']
      let y = 0
      while (y < h) {
        const bh = 10 + r() * 34
        const col = bands[Math.floor(r() * bands.length)]
        if (r() > 0.45) {
          ctx.fillStyle = col
          ctx.fillRect(0, y, w, bh * 0.35)
          // diamond row
          const d = bh * 0.6
          ctx.fillStyle = bands[Math.floor(r() * bands.length)]
          for (let x = d / 2; x < w; x += d * 1.4) {
            ctx.beginPath()
            ctx.moveTo(x, y + bh * 0.35)
            ctx.lineTo(x + d / 2, y + bh * 0.35 + d / 2)
            ctx.lineTo(x, y + bh * 0.35 + d)
            ctx.lineTo(x - d / 2, y + bh * 0.35 + d / 2)
            ctx.fill()
          }
        }
        y += bh + 6
      }
      noiseLayer(ctx, w, h, 64, 0.12, r)
      return finish(c)
    }),
  /** Black / cream bedding stripes. */
  stripes: () =>
    cached('stripes', () => {
      const c = canvas(512, 64)
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#efe8dc'
      ctx.fillRect(0, 0, 512, 64)
      const seq = [18, 10, 6, 10, 18, 26]
      let x = 0
      let i = 0
      while (x < 512) {
        const w = seq[i % seq.length]
        if (i % 2 === 0) {
          ctx.fillStyle = i % 4 === 0 ? '#1a1717' : '#6b5847'
          ctx.fillRect(x, 0, w, 64)
        }
        x += w + 8
        i++
      }
      noiseLayer(ctx, 512, 64, 32, 0.1, rng(52))
      return finish(c, { repeat: [2, 1] })
    }),
  towel: () =>
    cached('towel', () => {
      const c = canvas(64, 256)
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#f6efe9'
      ctx.fillRect(0, 0, 64, 256)
      for (let y = 8; y < 256; y += 22) {
        ctx.fillStyle = '#e59aa3'
        ctx.fillRect(0, y, 64, 5)
        ctx.fillStyle = '#c95f6c'
        ctx.fillRect(0, y + 7, 64, 2)
      }
      noiseLayer(ctx, 64, 256, 32, 0.12, rng(53))
      return finish(c)
    }),
  /** White lattice wardrobe doors. */
  lattice: () =>
    cached('lattice', () => {
      const c = canvas(256, 512)
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#f2efe9'
      ctx.fillRect(0, 0, 256, 512)
      ctx.fillStyle = '#b8b2a9'
      for (let y = 40; y < 470; y += 22)
        for (let x = 28; x < 228; x += 22) {
          ctx.save()
          ctx.translate(x + 8, y + 8)
          ctx.rotate(Math.PI / 4)
          ctx.fillRect(-6, -6, 12, 12)
          ctx.restore()
        }
      ctx.strokeStyle = '#d9d4cc'
      ctx.lineWidth = 10
      ctx.strokeRect(14, 14, 228, 484)
      return finish(c)
    }),
  /** Modern white interior door: three horizontal grooves. */
  doorFace: () =>
    cached('doorFace', () => {
      const c = canvas(128, 256)
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#f4f3ef'
      ctx.fillRect(0, 0, 128, 256)
      for (const y of [64, 128, 192]) {
        ctx.fillStyle = '#c9c6bf'
        ctx.fillRect(10, y, 108, 2)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(10, y + 2, 108, 1)
      }
      return finish(c)
    }),
  /** Blue abstract seascape for the bedroom frame. */
  picture: () =>
    cached('picture', () => {
      const c = canvas(256, 192)
      const ctx = c.getContext('2d')
      const g = ctx.createLinearGradient(0, 0, 0, 192)
      g.addColorStop(0, '#dfe9f2')
      g.addColorStop(0.45, '#8fb7da')
      g.addColorStop(0.5, '#1d4f8f')
      g.addColorStop(1, '#0f2f5c')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 256, 192)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      for (let i = 0; i < 12; i++) ctx.fillRect(20 + i * 18, 100 + (i % 3) * 14, 30, 2)
      return finish(c)
    }),
  /** Palm frond: alpha-cut leaflets along a central rib (object UVs). */
  frond: () =>
    cached('frond', () => {
      const w = 128
      const h = 512
      const c = canvas(w, h)
      const ctx = c.getContext('2d')
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = '#5b6b2e'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(w / 2, h)
      ctx.lineTo(w / 2, 0)
      ctx.stroke()
      for (let y = 8; y < h - 10; y += 7) {
        const len = (w / 2) * Math.sin((y / h) * Math.PI) * 0.95 + 6
        for (const s of [-1, 1]) {
          ctx.strokeStyle = y % 14 === 1 ? '#6f8a3a' : '#57722c'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(w / 2, y)
          ctx.lineTo(w / 2 + s * len, y + 18)
          ctx.stroke()
        }
      }
      const tex = finish(c)
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
      return tex
    }),
  trunk: () =>
    cached('trunk', () => {
      const c = canvas(64, 256)
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#7d6446'
      ctx.fillRect(0, 0, 64, 256)
      for (let y = 0; y < 256; y += 10) {
        ctx.fillStyle = 'rgba(40,28,18,0.45)'
        ctx.fillRect(0, y, 64, 3)
        ctx.fillStyle = 'rgba(170,140,100,0.3)'
        ctx.fillRect(0, y + 4, 64, 2)
      }
      return finish(c, { repeat: [3, 4] })
    }),
  /** Balcony floor: light grey 33 cm tiles. */
  balconyTiles: () =>
    cached('balconyTiles', () =>
      finish(tileGrid({ cols: 4, rows: 4, base: '#c6c2ba', vary: 0.04, grout: '#9b968d', groutPx: S / 300, seed: 15, veins: true }), {
        metres: 1.32,
      }),
    ),
  /** Tongue-and-groove boards of the balcony ceiling (10 cm). */
  woodCeiling: () =>
    cached('woodCeiling', () => {
      const c = canvas(S / 2)
      const ctx = c.getContext('2d')
      const r = rng(24)
      const n = 12
      const w = c.width / n
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = shade(PALETTE.ceilingWood, (r() - 0.5) * 0.08)
        ctx.fillRect(i * w, 0, w, c.height)
        for (let g = 0; g < 6; g++) {
          ctx.fillStyle = `rgba(80,45,15,${0.05 + r() * 0.07})`
          ctx.fillRect(i * w + r() * w, 0, 1 + r() * 2, c.height)
        }
        ctx.fillStyle = 'rgba(60,35,12,0.45)'
        ctx.fillRect(i * w, 0, 2, c.height)
      }
      return finish(c, { metres: 1.2 })
    }),
  cork: () =>
    cached('cork', () => {
      const c = canvas(256)
      const ctx = c.getContext('2d')
      const r = rng(81)
      ctx.fillStyle = '#c28a4f'
      ctx.fillRect(0, 0, 256, 256)
      for (let i = 0; i < 5000; i++) {
        ctx.fillStyle = r() > 0.5 ? 'rgba(120,70,30,0.35)' : 'rgba(230,180,120,0.3)'
        ctx.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 3)
      }
      // the board is four cork tiles
      ctx.strokeStyle = 'rgba(90,55,25,0.5)'
      ctx.lineWidth = 2
      ;[
        [1, 1],
        [128, 1],
        [1, 128],
        [128, 128],
      ].forEach(([x, y]) => ctx.strokeRect(x, y, 127, 127))
      return finish(c)
    }),
  /** Pink / purple striped rag mat with the word HOME (≈13.5 s). */
  homeMat: () =>
    cached('homeMat', () => {
      const w = 512
      const h = 300
      const c = canvas(w, h)
      const ctx = c.getContext('2d')
      const bands = ['#c9587a', '#7c4f8f', '#e0a3b5', '#4f5f9c', '#d8747f']
      bands.forEach((col, i) => {
        ctx.fillStyle = col
        ctx.fillRect((i * w) / bands.length, 0, w / bands.length + 1, h)
      })
      noiseLayer(ctx, w, h, 96, 0.18, rng(82))
      ctx.fillStyle = '#1b1416'
      ctx.font = 'bold 120px Georgia, serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('HOME', w / 2, h / 2 + 6)
      return finish(c)
    }),
  /** Grey day/night (zebra) blind of the living room. */
  zebraGray: () =>
    cached('zebraGray', () => {
      const c = canvas(64, 256)
      const ctx = c.getContext('2d')
      for (let y = 0; y < 256; y += 32) {
        ctx.fillStyle = '#6f6b66'
        ctx.fillRect(0, y, 64, 17)
        ctx.fillStyle = '#d9d6cf'
        ctx.fillRect(0, y + 17, 64, 15)
      }
      return finish(c, { repeat: [1, 1.4] })
    }),
  /** Beige roman blind with soft horizontal folds (bedroom). */
  romanBlind: () =>
    cached('romanBlind', () => {
      const c = canvas(64, 256)
      const ctx = c.getContext('2d')
      for (let y = 0; y < 256; y += 42) {
        const g = ctx.createLinearGradient(0, y, 0, y + 42)
        g.addColorStop(0, '#cbb89b')
        g.addColorStop(0.75, '#b39d7e')
        g.addColorStop(1, '#8c775c')
        ctx.fillStyle = g
        ctx.fillRect(0, y, 64, 42)
      }
      return finish(c)
    }),
  /** Colourful ceramic wall plate (hall, between the two doors). */
  plate: () =>
    cached('plate', () => {
      const c = canvas(128)
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#f4efe6'
      ctx.fillRect(0, 0, 128, 128)
      const cols = ['#d23b2f', '#f0b82a', '#2d7f4a', '#2957a4']
      for (let i = 0; i < 24; i++) {
        ctx.fillStyle = cols[i % 4]
        ctx.beginPath()
        ctx.arc(64 + Math.cos((i / 24) * 6.283) * 44, 64 + Math.sin((i / 24) * 6.283) * 44, 7, 0, 6.283)
        ctx.fill()
      }
      ctx.strokeStyle = '#2957a4'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(64, 64, 28, 0, 6.283)
      ctx.stroke()
      return finish(c)
    }),
  /** Pale, muted landscape painting in the hall (20.3 s). */
  painting: () =>
    cached('painting', () => {
      const c = canvas(256, 180)
      const ctx = c.getContext('2d')
      const r = rng(86)
      ctx.fillStyle = '#e4dccb'
      ctx.fillRect(0, 0, 256, 180)
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(${60 + r() * 60},${80 + r() * 50},${50 + r() * 30},${0.15 + r() * 0.25})`
        ctx.beginPath()
        ctx.ellipse(40 + r() * 170, 40 + r() * 100, 6 + r() * 26, 4 + r() * 14, r() * 3, 0, 6.283)
        ctx.fill()
      }
      noiseLayer(ctx, 256, 180, 48, 0.12, r)
      return finish(c)
    }),
  /** Framed red textile print (living room, ≈58 s). */
  pictureRed: () =>
    cached('pictureRed', () => {
      const c = canvas(192, 128)
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#8f2b36'
      ctx.fillRect(0, 0, 192, 128)
      for (let y = 8; y < 128; y += 10) {
        ctx.fillStyle = y % 20 ? 'rgba(240,190,160,0.35)' : 'rgba(40,10,15,0.3)'
        ctx.fillRect(10, y, 172, 4)
      }
      return finish(c)
    }),
  /** Rough rendered stone of the balcony end pillar. */
  stone: () =>
    cached('stone', () => {
      const c = canvas(256)
      const ctx = c.getContext('2d')
      const r = rng(83)
      ctx.fillStyle = '#9d9282'
      ctx.fillRect(0, 0, 256, 256)
      for (let i = 0; i < 140; i++) {
        ctx.fillStyle = `hsl(${30 + r() * 15},${10 + r() * 12}%,${40 + r() * 25}%)`
        ctx.beginPath()
        ctx.ellipse(r() * 256, r() * 256, 6 + r() * 16, 4 + r() * 10, r() * 3, 0, 6.283)
        ctx.fill()
      }
      noiseLayer(ctx, 256, 256, 64, 0.2, r)
      return finish(c, { metres: 0.8 })
    }),
  /** Synthetic grass of the courtyard below the balcony. */
  turf: () =>
    cached('turf', () => {
      const c = canvas(256)
      const ctx = c.getContext('2d')
      const r = rng(84)
      ctx.fillStyle = '#3f6b2e'
      ctx.fillRect(0, 0, 256, 256)
      for (let i = 0; i < 9000; i++) {
        ctx.fillStyle = r() > 0.5 ? 'rgba(110,160,70,0.45)' : 'rgba(30,60,20,0.4)'
        ctx.fillRect(r() * 256, r() * 256, 1, 2 + r() * 3)
      }
      return finish(c, { metres: 1.5 })
    }),
  gravel: () =>
    cached('gravel', () => {
      const c = canvas(256)
      const ctx = c.getContext('2d')
      const r = rng(85)
      ctx.fillStyle = '#8f877c'
      ctx.fillRect(0, 0, 256, 256)
      for (let i = 0; i < 7000; i++) {
        const v = 90 + r() * 100
        ctx.fillStyle = `rgb(${v},${v - 6},${v - 14})`
        ctx.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2)
      }
      return finish(c, { metres: 1.2 })
    }),
}

export function disposeTextures() {
  cache.forEach((t) => t.dispose())
  cache.clear()
}
