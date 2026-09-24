export const clamp01 = (v) => Math.min(1, Math.max(0, v))
export const smoothstep = (a, b, v) => {
  const x = clamp01((v - a) / (b - a))
  return x * x * (3 - 2 * x)
}
/** Cinematic ease used for door swings and other one-shot transitions. */
export const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

/** Frame-rate independent exponential damping. */
export const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt))

/**
 * Monotone cubic interpolation (Fritsch–Carlson).
 * Never overshoots between samples, which keeps scalar tracks (fov, exposure,
 * time → keyframe index) free of wobble while staying C1-continuous.
 */
export function monotoneCubic(xs, ys) {
  const n = xs.length
  const dx = []
  const m = []
  for (let i = 0; i < n - 1; i++) {
    dx[i] = xs[i + 1] - xs[i]
    m[i] = (ys[i + 1] - ys[i]) / dx[i]
  }
  const c1 = [m[0]]
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) c1[i] = 0
    else {
      const common = dx[i - 1] + dx[i]
      c1[i] = (3 * common) / ((common + dx[i]) / m[i - 1] + (common + dx[i - 1]) / m[i])
    }
  }
  c1[n - 1] = m[n - 2]
  const c2 = []
  const c3 = []
  for (let i = 0; i < n - 1; i++) {
    const inv = 1 / dx[i]
    const common = c1[i] + c1[i + 1] - 2 * m[i]
    c2[i] = (m[i] - c1[i] - common) * inv
    c3[i] = common * inv * inv
  }
  return (x) => {
    if (x <= xs[0]) return ys[0]
    if (x >= xs[n - 1]) return ys[n - 1]
    let lo = 0
    let hi = n - 2
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (xs[mid] <= x) lo = mid
      else hi = mid - 1
    }
    const d = x - xs[lo]
    return ys[lo] + c1[lo] * d + c2[lo] * d * d + c3[lo] * d * d * d
  }
}
