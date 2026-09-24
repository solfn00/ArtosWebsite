/**
 * Mutable, render-loop friendly state shared between the DOM scroll layer and the
 * WebGL scene. Nothing here triggers React renders: the scene reads it inside
 * useFrame, and the HUD polls it once per animation frame.
 */
export const scrollState = {
  /** Raw scroll progress reported by Lenis (0 → 1). */
  target: 0,
  /** Damped progress actually used to drive the animation. */
  progress: 0,
  /** Reference-video second that `progress` corresponds to. */
  videoTime: 1,
  /** Lenis velocity (px / frame) and its damped version. */
  velocity: 0,
  smoothVelocity: 0,
  /** True once the user has scrolled at least a little. */
  started: false,
  /** Set when the progress should snap instead of glide (deep links, resize). */
  snap: false,
}

/** Camera-derived values other systems react to (exposure, dust, HUD). */
export const cameraState = {
  exposure: 1,
  speed: 0,
}

/** Normalised pointer position (-1 → 1), damped in the camera rig. */
export const pointerState = { x: 0, y: 0 }

/**
 * Navigation mode. 'scroll' = the scroll-driven replay of the video path;
 * 'walk' = free first-person exploration (WASD / arrows + mouse, or touch).
 */
export const navState = {
  mode: 'scroll',
  listeners: new Set(),
  set(mode) {
    if (mode === this.mode) return
    this.mode = mode
    this.listeners.forEach((fn) => fn(mode))
  },
}

/**
 * Walk-mode input, written by the DOM layer (keyboard / mouse / touch) and
 * consumed by the in-canvas controller every frame.
 * move: x = strafe (right +), y = forward (+); look deltas are in radians.
 */
export const walkInput = {
  keys: new Set(),
  stick: { x: 0, y: 0 },
  lookDX: 0,
  lookDY: 0,
  run: false,
  room: null,
}
