import { OPENINGS, ROOMS, WALLS } from '../config/layout'

/**
 * 2D collision for walk mode (plan view, x/z).
 * Walls come from the same WALLS data the renderer uses: door openings
 * (bottom = 0) are left open, windows are solid. Furniture is a list of
 * axis-aligned footprints, so the walker cannot pass through beds or counters.
 */

function wallSegments() {
  const segs = []
  WALLS.forEach((w) => {
    const half = w.t / 2
    const doors = (w.openings || []).map((k) => OPENINGS[k]).filter((o) => o.bottom === 0)
    // express the wall as a 1D interval along its axis, cut out the doors
    const lo = Math.min(w.a, w.b)
    const hi = Math.max(w.a, w.b)
    const cuts = doors.map((d) => [d.from, d.to]).sort((p, q) => p[0] - q[0])
    let cursor = lo
    const pieces = []
    cuts.forEach(([a, b]) => {
      if (a > cursor) pieces.push([cursor, a])
      cursor = Math.max(cursor, b)
    })
    if (cursor < hi) pieces.push([cursor, hi])
    pieces.forEach(([a, b]) => {
      if (w.kind === 'h') segs.push({ ax: a, az: w.at, bx: b, bz: w.at, half })
      else segs.push({ ax: w.at, az: a, bx: w.at, bz: b, half })
    })
  })
  // balcony railings (south + east edges)
  const B = ROOMS.balcony
  segs.push({ ax: 0, az: B.z1, bx: B.x1, bz: B.z1, half: 0.04 })
  segs.push({ ax: B.x1, az: 0, bx: B.x1, bz: B.z1, half: 0.04 })
  return segs
}

/** Furniture footprints [x0, z0, x1, z1] (metres), taken from the room components. */
const FURNITURE = [
  // hall / kitchen
  [-1.92, -4.32, -1.28, -2.44], // alcove counter run incl. drawer unit
  [-1.3, -4.32, -0.52, -3.68], // return with hot plates
  [0.18, -4.32, 0.86, -3.94], // pine console in its niche
  // bathroom
  [-1.92, -0.95, -1.03, -0.08], // shower enclosure
  [-1.92, -1.8, -1.25, -1.3], // toilet
  [-1.14, -2.34, -0.3, -1.86], // vanity
  // bedroom
  [2.7, -6.52, 4.3, -4.45], // bed
  [2.1, -5.8, 2.66, -4.4], // lattice wardrobe
  [5.1, -3.9, 5.5, -3.4], // stool with basket
  // living room
  [6.25, -2.78, 6.82, -2.22], // fridge
  [5.9, -2.15, 6.82, -0.1], // daybed
  [5.0, -3.24, 6.2, -2.8], // tv stand
  [4.1, -3.24, 4.7, -2.8], // floating desk
  [2.06, -1.5, 3.4, -0.08], // dining table + chairs
  [3.3, -1.05, 4.3, -0.1], // armchair + lamp
  // balcony
  [2.0, 0.18, 5.2, 0.66], // chairs under the windows
  [3.35, 1.45, 4.75, 1.87], // kilim bench
  [0.02, 0.74, 0.38, 1.5], // shoe rack
  [-0.26, 1.63, 0.16, 2.05], // stone pillar
]

const SEGS = wallSegments()

/**
 * Pushes a circle (x, z, radius) out of walls and furniture. Mutates and
 * returns `p` ({ x, z }). A few relaxation passes handle corners.
 */
export function resolveCollisions(p, r = 0.22) {
  for (let pass = 0; pass < 3; pass++) {
    for (const s of SEGS) {
      const dx = s.bx - s.ax
      const dz = s.bz - s.az
      const len2 = dx * dx + dz * dz || 1e-6
      let t = ((p.x - s.ax) * dx + (p.z - s.az) * dz) / len2
      t = Math.max(0, Math.min(1, t))
      const cx = s.ax + dx * t
      const cz = s.az + dz * t
      let nx = p.x - cx
      let nz = p.z - cz
      const d = Math.hypot(nx, nz)
      const min = r + s.half
      if (d < min) {
        if (d < 1e-5) {
          // exactly on the line: push along the wall normal
          nx = -dz
          nz = dx
        }
        const k = (min - d) / (Math.hypot(nx, nz) || 1)
        p.x += nx * k
        p.z += nz * k
      }
    }
    for (const [x0, z0, x1, z1] of FURNITURE) {
      const cx = Math.max(x0, Math.min(p.x, x1))
      const cz = Math.max(z0, Math.min(p.z, z1))
      const nx = p.x - cx
      const nz = p.z - cz
      const d = Math.hypot(nx, nz)
      if (d < r) {
        if (d < 1e-5) {
          // centre inside the box: leave through the nearest side
          const out = [
            [p.x - x0, -1, 0],
            [x1 - p.x, 1, 0],
            [p.z - z0, 0, -1],
            [z1 - p.z, 0, 1],
          ].sort((a, b) => a[0] - b[0])[0]
          p.x += out[1] * (out[0] + r)
          p.z += out[2] * (out[0] + r)
        } else {
          p.x += (nx / d) * (r - d)
          p.z += (nz / d) * (r - d)
        }
      }
    }
  }
  return p
}

/** Which room (by ROOMS) a plan position lies in, for the walk-mode HUD. */
export function roomAt(x, z) {
  for (const [name, r] of Object.entries(ROOMS)) {
    if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) return name
  }
  return null
}
