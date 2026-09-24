/**
 * TIMELINE
 * --------
 * Authored in "reference-video seconds" so every value can be checked against
 * the footage (68 s, filmed upside-down — see the rotated frames). Scroll
 * progress 0 → 1 maps linearly onto VIDEO.start → VIDEO.end.
 *
 *   1.0 – 4.3   east end of the balcony: planters, rail corner, courtyard below
 *   4.3 – 12.6  along the covered balcony: kilim bench, chairs, shutters, hangings, fan
 *  12.6 – 16.4  west end: cork board, shoe rack, HOME mat, the front door opens
 *  16.4 – 19.0  entry hall: console niche, bedroom + living-room doors
 *  19.0 – 21.6  first look into the living room (paper lamp, daybed)
 *  21.6 – 25.2  kitchenette
 *  25.2 – 34.4  bathroom
 *  34.4 – 37.9  back through the hall to the bedroom door
 *  37.9 – 47.8  bedroom
 *  47.8 – 62.4  living room
 *  62.4 – 68.0  back across the hall and out to the balcony, a shutter is closed
 */

export const VIDEO = { start: 1.0, end: 68.0 }

export const SCROLL = {
  /** Total scroll distance in viewport heights (≈ 19vh per video second). */
  lengthVh: 1300,
  /** Lenis interpolation factor (lower = heavier / smoother). */
  lenisLerp: 0.085,
  /** Extra critically-damped smoothing applied to progress inside the render loop. */
  progressDamping: 4.2,
  /** Damping for the velocity signal that drives secondary motion. */
  velocityDamping: 3.0,
}

export const toVideoTime = (p) => VIDEO.start + p * (VIDEO.end - VIDEO.start)
export const toProgress = (t) => (t - VIDEO.start) / (VIDEO.end - VIDEO.start)

/** Vertical FOV of the phone's main camera in the 16:9 landscape frame (~26 mm eq.). */
const FOV = 44
const Y = 1.45 // phone height

/**
 * CAMERA KEYFRAMES (read from the upright frames, placed in the reconstructed plan)
 * t        reference-video second
 * pos      camera position (x east, z south; balcony z 0.1–2.2, rooms z < 0)
 * look     point the lens is aimed at (only its direction is used)
 * fov      vertical FOV in degrees
 * roll     tamed handheld tilt in degrees
 * exposure auto-exposure multiplier (the phone opens up indoors)
 */
export const CAMERA_KEYS = [
  // ── East end of the balcony ──────────────────────────────────────────────
  { t: 1.0, pos: [6.2, Y, 1.6], look: [6.9, 0.6, 3.2], fov: FOV, roll: 0, exposure: 1.0 },
  { t: 1.6, pos: [6.25, Y, 1.7], look: [6.2, -0.1, 2.55], fov: FOV, roll: -3, exposure: 1.0 },
  { t: 2.2, pos: [6.3, Y, 1.7], look: [5.3, 0.05, 2.7], fov: FOV, roll: 3, exposure: 1.0 },
  { t: 3.0, pos: [6.35, Y, 1.6], look: [7.2, -0.9, 4.6], fov: FOV, roll: -2, exposure: 1.0 },
  { t: 3.8, pos: [6.4, Y, 1.55], look: [5.8, -1.0, 5.4], fov: FOV, roll: 2, exposure: 1.0 },
  // ── Along the balcony ────────────────────────────────────────────────────
  { t: 4.6, pos: [6.1, Y, 1.45], look: [4.4, 0.4, 3.2], fov: FOV, roll: -2, exposure: 1.0 },
  { t: 5.2, pos: [5.6, Y, 1.35], look: [3.0, 0.55, 1.6], fov: FOV, roll: 0, exposure: 1.0 },
  { t: 6.0, pos: [5.45, Y, 1.25], look: [3.4, 0.7, 0.1], fov: FOV, roll: 2, exposure: 1.02 },
  { t: 6.6, pos: [5.4, Y, 1.25], look: [1.2, 1.1, 0.4], fov: FOV, roll: -1, exposure: 1.02 },
  { t: 7.3, pos: [5.5, Y, 1.7], look: [5.9, 1.45, -0.6], fov: FOV, roll: 3, exposure: 1.05 },
  { t: 8.1, pos: [5.5, Y, 1.6], look: [6.6, 1.35, -0.3], fov: FOV, roll: -2, exposure: 1.05 },
  { t: 8.7, pos: [5.4, Y, 1.35], look: [2.6, 0.8, 1.0], fov: FOV, roll: 0, exposure: 1.02 },
  { t: 9.4, pos: [5.2, Y, 1.4], look: [2.0, 0.55, 2.3], fov: FOV, roll: -2, exposure: 1.0 },
  { t: 10.1, pos: [4.85, Y, 1.35], look: [1.8, 0.65, 1.5], fov: FOV, roll: 1, exposure: 1.0 },
  { t: 10.7, pos: [4.5, Y, 1.3], look: [3.0, 1.1, -0.3], fov: FOV, roll: 2, exposure: 1.02 },
  { t: 11.4, pos: [4.1, Y, 1.25], look: [2.5, 1.3, -0.3], fov: FOV, roll: -1, exposure: 1.02 },
  { t: 12.1, pos: [3.55, Y, 1.25], look: [3.3, 2.7, 1.45], fov: FOV + 2, roll: 4, exposure: 1.05 },
  { t: 12.6, pos: [2.9, Y, 1.35], look: [0.8, 1.1, 3.0], fov: FOV, roll: -2, exposure: 1.0 },
  // ── West end: cork board, rack, mat, front door ──────────────────────────
  { t: 13.1, pos: [2.1, Y, 1.2], look: [0.0, 1.45, 1.1], fov: FOV, roll: 0, exposure: 1.02 },
  { t: 13.7, pos: [1.7, Y, 1.15], look: [0.3, 0.3, 0.8], fov: FOV, roll: 2, exposure: 1.02 },
  { t: 14.3, pos: [1.5, Y, 1.0], look: [1.05, 1.05, 0.0], fov: FOV, roll: -1, exposure: 1.05 },
  { t: 15.2, pos: [1.2, Y, 0.8], look: [0.85, 0.95, -0.3], fov: FOV, roll: 0, exposure: 1.1 },
  { t: 16.0, pos: [1.0, Y, 0.45], look: [0.75, 1.0, -2.5], fov: FOV + 2, roll: 0, exposure: 1.2 },
  // ── Entry hall: console niche ahead, the two doors on the right ──────────
  { t: 16.7, pos: [0.95, Y, -0.25], look: [0.7, 1.0, -4.3], fov: FOV + 4, roll: 0, exposure: 1.35 },
  { t: 17.4, pos: [0.95, Y, -0.6], look: [0.35, 1.3, -4.3], fov: FOV + 4, roll: -2, exposure: 1.4 },
  { t: 18.1, pos: [1.0, Y, -0.95], look: [2.0, 1.45, -3.9], fov: FOV + 4, roll: 1, exposure: 1.4 },
  { t: 18.7, pos: [1.05, Y, -1.45], look: [2.0, 1.25, -3.0], fov: FOV + 4, roll: 0, exposure: 1.4 },
  // ── First look into the living room ──────────────────────────────────────
  { t: 19.4, pos: [1.25, Y, -2.75], look: [6.6, 0.95, -2.5], fov: FOV + 4, roll: 0, exposure: 1.4 },
  { t: 20.3, pos: [1.25, Y, -2.3], look: [2.0, 1.75, -1.75], fov: FOV + 4, roll: -2, exposure: 1.4 },
  { t: 21.1, pos: [1.8, Y, -2.75], look: [5.0, 1.0, -1.2], fov: FOV + 4, roll: 1, exposure: 1.4 },
  // ── Kitchenette alcove (look west) ───────────────────────────────────────
  { t: 21.7, pos: [1.2, Y, -3.0], look: [-0.5, 1.2, -3.9], fov: FOV + 4, roll: 0, exposure: 1.4 },
  { t: 22.5, pos: [0.6, Y, -3.3], look: [-1.9, 0.85, -3.25], fov: FOV + 4, roll: -2, exposure: 1.4 },
  { t: 23.2, pos: [0.55, Y, -3.3], look: [-1.9, 1.7, -3.3], fov: FOV + 4, roll: 1, exposure: 1.4 },
  { t: 24.0, pos: [0.45, Y, -3.2], look: [-1.6, 0.55, -3.45], fov: FOV + 4, roll: 0, exposure: 1.4 },
  { t: 24.6, pos: [0.5, Y, -2.95], look: [-1.5, 0.5, -2.6], fov: FOV + 4, roll: -2, exposure: 1.4 },
  // ── Bathroom ─────────────────────────────────────────────────────────────
  { t: 25.2, pos: [0.95, Y, -1.75], look: [0.0, 1.45, -1.3], fov: FOV + 4, roll: 1, exposure: 1.4 },
  { t: 25.8, pos: [0.75, Y, -1.9], look: [-0.7, 1.1, -1.95], fov: FOV + 4, roll: 0, exposure: 1.4 },
  { t: 26.5, pos: [0.15, Y, -1.9], look: [-1.8, 0.6, -1.4], fov: FOV + 6, roll: 0, exposure: 1.4 },
  { t: 27.2, pos: [-0.3, Y, -1.75], look: [-1.9, 0.7, -1.3], fov: FOV + 6, roll: 2, exposure: 1.4 },
  { t: 27.8, pos: [-0.4, Y, -1.7], look: [-1.5, 1.2, -0.4], fov: FOV + 6, roll: -2, exposure: 1.4 },
  { t: 28.8, pos: [-0.45, Y, -1.65], look: [-1.3, 1.8, -0.1], fov: FOV + 6, roll: 2, exposure: 1.4 },
  { t: 29.8, pos: [-0.55, Y, -1.5], look: [-0.72, 1.75, -2.4], fov: FOV + 6, roll: 0, exposure: 1.4 },
  { t: 30.8, pos: [-0.6, Y, -1.45], look: [-0.72, 0.95, -2.3], fov: FOV + 6, roll: -2, exposure: 1.4 },
  { t: 31.6, pos: [-0.62, Y, -1.5], look: [-0.72, 0.75, -2.15], fov: FOV + 6, roll: 1, exposure: 1.4 },
  { t: 32.3, pos: [-0.55, Y, -1.45], look: [-1.8, 0.35, -1.5], fov: FOV + 6, roll: -1, exposure: 1.4 },
  { t: 33.0, pos: [-0.5, Y, -1.4], look: [-1.7, 0.9, -0.6], fov: FOV + 6, roll: 2, exposure: 1.4 },
  { t: 33.6, pos: [-0.45, Y, -1.4], look: [-1.3, 1.5, -0.05], fov: FOV + 6, roll: -1, exposure: 1.4 },
  // ── Back through the hall to the bedroom ─────────────────────────────────
  { t: 34.4, pos: [0.3, Y, -1.9], look: [3.0, 1.1, -2.5], fov: FOV + 4, roll: 0, exposure: 1.4 },
  { t: 35.1, pos: [0.8, Y, -2.0], look: [2.0, 1.15, -3.3], fov: FOV + 4, roll: -1, exposure: 1.4 },
  { t: 36.0, pos: [1.0, Y, -2.4], look: [2.0, 1.35, -3.6], fov: FOV + 4, roll: 1, exposure: 1.4 },
  { t: 37.2, pos: [1.2, Y, -3.2], look: [2.0, 1.0, -3.95], fov: FOV + 4, roll: 0, exposure: 1.4 },
  { t: 38.3, pos: [1.45, Y, -3.85], look: [3.2, 0.85, -4.0], fov: FOV + 4, roll: 0, exposure: 1.45 },
  // ── Bedroom ──────────────────────────────────────────────────────────────
  { t: 39.0, pos: [2.1, Y, -3.9], look: [3.2, 0.1, -4.8], fov: FOV + 4, roll: 2, exposure: 1.65 },
  { t: 39.7, pos: [2.5, Y, -3.8], look: [4.1, 0.25, -4.3], fov: FOV + 4, roll: -1, exposure: 1.7 },
  { t: 40.4, pos: [2.7, Y, -3.75], look: [5.4, 0.9, -3.8], fov: FOV + 4, roll: 1, exposure: 1.75 },
  { t: 41.0, pos: [2.75, Y, -3.75], look: [5.5, 1.55, -4.5], fov: FOV + 4, roll: -2, exposure: 1.75 },
  { t: 41.7, pos: [2.8, Y, -3.8], look: [4.3, 1.1, -6.5], fov: FOV + 4, roll: 2, exposure: 1.8 },
  { t: 42.5, pos: [2.8, Y, -3.85], look: [2.5, 1.2, -6.0], fov: FOV + 4, roll: -2, exposure: 1.8 },
  { t: 43.4, pos: [2.85, Y, -3.9], look: [3.0, 1.7, -6.4], fov: FOV + 4, roll: 1, exposure: 1.8 },
  { t: 44.1, pos: [2.9, Y, -3.95], look: [4.0, 2.5, -5.0], fov: FOV + 4, roll: 3, exposure: 1.8 },
  { t: 44.8, pos: [2.95, Y, -3.95], look: [5.5, 1.35, -4.4], fov: FOV + 4, roll: -1, exposure: 1.75 },
  { t: 45.5, pos: [3.0, Y, -3.95], look: [5.5, 1.1, -3.7], fov: FOV + 4, roll: 1, exposure: 1.75 },
  { t: 46.3, pos: [2.95, Y, -4.0], look: [3.9, 0.85, -6.5], fov: FOV + 4, roll: -2, exposure: 1.8 },
  { t: 47.1, pos: [2.8, Y, -4.0], look: [2.4, 1.0, -6.1], fov: FOV + 4, roll: 1, exposure: 1.8 },
  { t: 47.8, pos: [2.5, Y, -3.9], look: [0.8, 1.2, -2.8], fov: FOV + 4, roll: 0, exposure: 1.6 },
  // ── Living room ──────────────────────────────────────────────────────────
  { t: 48.3, pos: [1.6, Y, -3.75], look: [0.95, 1.05, -0.4], fov: FOV + 4, roll: 0, exposure: 1.45 },
  { t: 49.0, pos: [1.5, Y, -3.0], look: [3.2, 1.0, -2.2], fov: FOV + 4, roll: 1, exposure: 1.4 },
  { t: 49.7, pos: [2.5, Y, -2.6], look: [2.7, 0.75, -0.4], fov: FOV + 4, roll: -1, exposure: 1.4 },
  { t: 50.4, pos: [2.8, Y, -2.5], look: [3.9, 0.6, -0.4], fov: FOV + 4, roll: 2, exposure: 1.4 },
  { t: 51.2, pos: [3.0, Y, -2.4], look: [2.05, 1.3, -2.4], fov: FOV + 4, roll: 0, exposure: 1.4 },
  { t: 52.1, pos: [4.1, Y, -2.2], look: [6.6, 0.7, -2.2], fov: FOV + 4, roll: -2, exposure: 1.4 },
  { t: 53.0, pos: [4.0, Y, -2.0], look: [2.6, 0.7, -0.5], fov: FOV + 4, roll: 1, exposure: 1.4 },
  { t: 53.8, pos: [3.9, Y, -2.0], look: [2.4, 0.75, -0.35], fov: FOV + 4, roll: -1, exposure: 1.4 },
  { t: 54.5, pos: [3.9, Y, -1.9], look: [3.9, 1.0, -0.2], fov: FOV + 4, roll: 2, exposure: 1.4 },
  { t: 55.4, pos: [4.3, Y, -1.6], look: [6.8, 0.8, -1.3], fov: FOV + 4, roll: 0, exposure: 1.35 },
  { t: 56.4, pos: [4.4, Y, -1.7], look: [5.8, 0.95, -3.3], fov: FOV + 4, roll: 1, exposure: 1.35 },
  { t: 57.4, pos: [4.5, Y, -1.7], look: [6.5, 1.65, -2.8], fov: FOV + 4, roll: -1, exposure: 1.35 },
  { t: 58.3, pos: [4.4, Y, -1.8], look: [3.6, 1.5, 0.0], fov: FOV + 4, roll: 1, exposure: 1.35 },
  { t: 59.1, pos: [4.2, Y, -1.8], look: [2.1, 1.5, -1.6], fov: FOV + 4, roll: -1, exposure: 1.35 },
  { t: 59.8, pos: [4.3, Y, -1.8], look: [6.8, 1.35, -1.95], fov: FOV + 4, roll: 2, exposure: 1.35 },
  { t: 60.5, pos: [4.6, Y, -2.1], look: [6.5, 1.0, -2.5], fov: FOV + 4, roll: -2, exposure: 1.35 },
  { t: 61.3, pos: [4.4, Y, -2.2], look: [4.8, 0.95, -3.3], fov: FOV + 4, roll: 1, exposure: 1.35 },
  { t: 62.2, pos: [3.4, Y, -2.5], look: [2.0, 1.1, -2.8], fov: FOV + 4, roll: 0, exposure: 1.4 },
  // ── Back across the hall, out to the balcony, a shutter is pulled shut ───
  { t: 62.9, pos: [2.25, Y, -2.75], look: [0.0, 1.25, -2.0], fov: FOV + 4, roll: 0, exposure: 1.4 },
  { t: 63.6, pos: [1.6, Y, -2.2], look: [0.0, 1.5, -0.85], fov: FOV + 4, roll: -1, exposure: 1.35 },
  { t: 64.3, pos: [1.0, Y, -0.9], look: [0.95, 1.2, 2.0], fov: FOV + 2, roll: 0, exposure: 1.2 },
  { t: 65.0, pos: [0.95, Y, 0.45], look: [2.8, 0.7, 4.5], fov: FOV, roll: 1, exposure: 1.05 },
  { t: 65.8, pos: [1.1, Y, 1.0], look: [5.5, 0.4, 3.4], fov: FOV, roll: -1, exposure: 1.0 },
  { t: 66.6, pos: [1.3, Y, 0.9], look: [1.85, 1.35, 0.1], fov: FOV, roll: 2, exposure: 1.05 },
  { t: 67.4, pos: [1.5, Y, 0.7], look: [1.9, 1.45, 0.05], fov: FOV, roll: -1, exposure: 1.1 },
  { t: 68.0, pos: [1.65, Y, 0.6], look: [2.2, 1.35, 0.0], fov: FOV, roll: 0, exposure: 1.1 },
]

/** Named chapters shown in the HUD. Times are reference-video seconds. */
export const CHAPTERS = [
  { from: 1.0, title: 'The balcony', caption: 'Planters on the ledge, the courtyard below' },
  { from: 4.3, title: 'Along the balcony', caption: 'Kilim bench, black chairs, blue shutters' },
  { from: 12.6, title: 'Front door', caption: 'Cork board, shoe rack and the HOME mat' },
  { from: 16.4, title: 'Entry hall', caption: 'Console niche and the two doors' },
  { from: 19.0, title: 'Living room', caption: 'A first look under the paper lamp' },
  { from: 21.6, title: 'Kitchenette', caption: 'Oak worktop, sink and drawer unit' },
  { from: 25.2, title: 'Bathroom', caption: 'Patterned border, shower and vanity' },
  { from: 37.9, title: 'Bedroom', caption: 'Mauve walls and a roman blind' },
  { from: 47.8, title: 'Living room', caption: 'Daybed, dining corner and the TV' },
  { from: 62.4, title: 'Back outside', caption: 'Out to the balcony, closing a shutter' },
]

/** Secondary motion tuning for the handheld camera. */
export const CAMERA_MOTION = {
  strideLength: 0.65, // metres per step: drives the walk bob
  bobHeight: 0.016,
  bobSway: 0.01,
  bobRoll: 0.006,
  breathe: 0.005,
  mouseLook: [0.3, 0.16], // look-target offset per unit pointer (x, y) in metres
  mouseShift: 0.04,
  pointerDamping: 3.5,
  velocityFov: 3.0, // max extra FOV degrees at high scroll speed
}

/** Last stretch of the scroll: the end card. */
export const ENDING = { fadeFrom: 0.975, fadeTo: 1.0 }
