/**
 * FLOOR PLAN — reconstructed from the reference video
 * ---------------------------------------------------
 * The footage was shot with the phone upside-down; every measurement below was
 * taken from the frames rotated 180°. Units are metres, y-up.
 * +x = east, +z = south (towards the balcony railing), floor level y = 0.
 *
 *           x: -2.0     0.0        2.0                    5.6    6.9
 *   z: -6.6                         ┌─────────────────────┐
 *                                   │      BEDROOM        │
 *                                   │  (mauve, bed N)     ├ window (roman blind)
 *   z: -4.4          ┌──────────────┤                     │
 *            │ KITCHEN alcove│ H │door                 │
 *            │ (L: W + N)    │ A ├──────────────────────┴──────┐ z: -3.3
 *   z: -2.4  ├───────────────┤ L │door     LIVING ROOM         │
 *            │ BATH     door │ L │ table+chairs NE, daybed S,  ├ window (zebra)
 *            │shower  mirror │   │ TV SE, fridge SW            │
 *   z:  0.0  └[win]──┴──────[front door]──[ W1 ]────[ W2 ]──hangings┘   ← facade
 *            end wall ┌───────────────────────────────────────────┐
 *                     │  BALCONY  (covered, wooden ceiling, fan)  │ railing E
 *   z:  2.2           └──────────────── railing S ────────────────┘
 */

export const WALL_H = 2.55 // interior ceiling height
export const BALCONY_CEIL = 2.45
export const ROOF_Y = 2.78
export const LOWER_Y = -2.8 // garden level (the flat is on an upper floor)
export const INT_T = 0.12
export const EXT_T = 0.2
export const EYE_HEIGHT = 1.45 // phone held at chest/face height

export const ROOMS = {
  bathroom: { x0: -2.0, x1: 0.0, z0: -2.4, z1: 0.0 },
  hall: { x0: 0.0, x1: 2.0, z0: -4.4, z1: 0.0 },
  kitchen: { x0: -2.0, x1: 0.0, z0: -4.4, z1: -2.4 }, // alcove west of the hall, hidden from the front door (16.7 s)
  living: { x0: 2.0, x1: 6.9, z0: -3.3, z1: 0.0 },
  bedroom: { x0: 2.0, x1: 5.6, z0: -6.6, z1: -3.3 },
  balcony: { x0: 0.0, x1: 7.2, z0: 0.0, z1: 1.95 }, // ≈1.85 m clear, measured against the 2.05 m door (9.4 s)
}

/** Door and window openings (world coordinates along the wall's axis). */
export const OPENINGS = {
  // facade (z = 0, runs along x)
  frontDoor: { from: 0.55, to: 1.35, bottom: 0, top: 2.1 },
  bathWindow: { from: -1.75, to: -1.2, bottom: 1.5, top: 2.1 },
  w1: { from: 2.1, to: 3.1, bottom: 0.85, top: 2.1 }, // its shutter touches the door frame (14.3 s)
  w2: { from: 4.1, to: 5.1, bottom: 0.85, top: 2.1 },
  // hall walls (x = 0 and x = 2, run along z)
  bathDoor: { from: -2.3, to: -1.5, bottom: 0, top: 2.05 }, // drawer unit is right past its jamb (25 s)
  livingDoor: { from: -3.15, to: -2.35, bottom: 0, top: 2.05 },
  bedroomDoor: { from: -4.25, to: -3.45, bottom: 0, top: 2.05 },
  // other exterior windows
  eastWindow: { from: -2.5, to: -1.4, bottom: 0.9, top: 2.1 }, // living, x = 6.9
  bedWindow: { from: -5.4, to: -4.4, bottom: 0.95, top: 2.1 }, // bedroom, x = 5.6
}

/**
 * Walls as data (shared by the renderer and the walk-mode collision).
 * h: runs along x at z = at, from x0 → x1; `pos` = material on the +z face.
 * v: runs along z at x = at, from z0 (south) → z1 (north); `pos` = material on the +x face.
 */
const E = EXT_T / 2
export const WALLS = [
  // ── facade ───────────────────────────────────────────────────────────────
  { kind: 'h', at: 0, a: -2.0 - E, b: 0, t: EXT_T, h: ROOF_Y, pos: 'plaster', neg: 'bathTiles', openings: ['bathWindow'] },
  { kind: 'h', at: 0, a: 0, b: 2.0, t: EXT_T, h: ROOF_Y, pos: 'plaster', neg: 'white', openings: ['frontDoor'] },
  { kind: 'h', at: 0, a: 2.0, b: 6.9 + E, t: EXT_T, h: ROOF_Y, pos: 'plaster', neg: 'livingWall', openings: ['w1', 'w2'] },
  // ── west side: bathroom + kitchen alcove ─────────────────────────────────
  { kind: 'v', at: -2.0, a: 0 + E, b: -2.4, t: EXT_T, h: ROOF_Y, pos: 'bathTiles', neg: 'plaster' },
  { kind: 'v', at: -2.0, a: -2.4, b: -4.4 - E, t: EXT_T, h: ROOF_Y, pos: 'white', neg: 'plaster' },
  { kind: 'h', at: -4.4, a: -2.0 - E, b: 2.0, t: EXT_T, h: ROOF_Y, pos: 'white', neg: 'plaster' },
  { kind: 'h', at: -2.4, a: -2.0, b: 0 + INT_T / 2, t: INT_T, h: WALL_H, pos: 'bathTiles', neg: 'white' },
  // short return beside the console niche (the wall left of it at 16.7 s)
  { kind: 'v', at: 0, a: -3.95, b: -4.4, t: INT_T, h: WALL_H, pos: 'white', neg: 'white' },
  // ── bedroom exterior ─────────────────────────────────────────────────────
  { kind: 'v', at: 2.0, a: -4.4, b: -6.6 - E, t: EXT_T, h: ROOF_Y, pos: 'mauve', neg: 'plaster' },
  { kind: 'h', at: -6.6, a: 2.0 - E, b: 5.6 + E, t: EXT_T, h: ROOF_Y, pos: 'mauve', neg: 'plaster' },
  { kind: 'v', at: 5.6, a: -3.3, b: -6.6, t: EXT_T, h: ROOF_Y, pos: 'plaster', neg: 'bedWhite', openings: ['bedWindow'] },
  // ── living exterior ──────────────────────────────────────────────────────
  { kind: 'h', at: -3.3, a: 5.6, b: 6.9 + E, t: EXT_T, h: ROOF_Y, pos: 'livingWall', neg: 'plaster' },
  { kind: 'v', at: 6.9, a: 0 + E, b: -3.3 - E, t: EXT_T, h: ROOF_Y, pos: 'plaster', neg: 'livingWall', openings: ['eastWindow'] },
  // ── interior partitions ──────────────────────────────────────────────────
  { kind: 'v', at: 0, a: 0, b: -2.4, t: INT_T, h: WALL_H, pos: 'white', neg: 'bathTiles', openings: ['bathDoor'] },
  { kind: 'v', at: 2.0, a: 0, b: -3.3, t: INT_T, h: WALL_H, pos: 'livingWall', neg: 'white', openings: ['livingDoor'] },
  { kind: 'v', at: 2.0, a: -3.3, b: -4.4, t: INT_T, h: WALL_H, pos: 'mauve', neg: 'white', openings: ['bedroomDoor'] },
  { kind: 'h', at: -3.3, a: 2.0, b: 5.6, t: INT_T, h: WALL_H, pos: 'livingWall', neg: 'bedWhite' },
  // ── balcony end wall (west) ──────────────────────────────────────────────
  { kind: 'v', at: -0.12, a: 2.0, b: 0 + E, t: 0.24, h: ROOF_Y, pos: 'plaster', neg: 'plaster' },
]

/**
 * Hinged doors. `hinge` = [x, z] of the hinge; `rotation` orients the closed
 * leaf (local +x points from hinge to latch); `angle` = open swing (radians).
 */
export const DOOR_DEFS = {
  front: { hinge: [1.35, 0], rotation: Math.PI, width: 0.8, depth: EXT_T, angle: -1.62, open: [15.2, 16.4] },
  living: { hinge: [2.0, -3.15], rotation: -Math.PI / 2, width: 0.8, depth: INT_T, angle: 1.6, open: [18.2, 19.2] },
  bathroom: { hinge: [0, -1.5], rotation: Math.PI / 2, width: 0.8, depth: INT_T, angle: 1.62, open: [24.5, 25.3] },
  bedroom: { hinge: [2.0, -3.45], rotation: Math.PI / 2, width: 0.8, depth: INT_T, angle: -1.6, open: [37.9, 38.8] },
}

/** Colour palette sampled from the (upright) reference frames. */
export const PALETTE = {
  plaster: '#c2b3a1', // taupe-beige facade plaster (7 s, 13 s)
  concrete: '#a8a39b',
  white: '#f2f1ed',
  livingWall: '#e8d6bd', // warm cream under tungsten light (20 s, 49–60 s)
  bedWhite: '#efe7df',
  mauve: '#b48f9c',
  shutterBlue: '#1f78d6',
  railBlue: '#5b9ed8',
  baluster: '#eceae4',
  kilimRed: '#a92a3d',
  burgundy: '#6a1422',
  mustard: '#d4a126',
  sage: '#8fb5a2',
  oak: '#c9965c',
  pine: '#d7a86a',
  laminate: '#b9a58d',
  ceilingWood: '#b78450',
  steel: '#c9ccd0',
  ikeaBlue: '#1f55c9',
  lampWarm: '#ffb467',
  sky: '#c9d3da',
  horizon: '#dfe3e2',
  sun: '#fff3e2',
  lawn: '#4f7a38',
}
