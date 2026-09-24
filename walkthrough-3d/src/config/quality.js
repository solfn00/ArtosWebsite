/**
 * Device quality tiers. Chosen once at start-up; everything that scales with
 * device power reads from here so there is a single place to tune.
 */
const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
const narrow = typeof window !== 'undefined' && window.innerWidth < 820
const lowCores = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 8) <= 4

export const IS_TOUCH = !!coarse
export const IS_MOBILE = !!(coarse || narrow)
export const REDUCED_MOTION =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const TIERS = {
  high: {
    name: 'high',
    dpr: [1, 1.75],
    shadowMapSize: 2048,
    ao: true,
    msaa: 4,
    bloom: true,
    particles: 1400,
    textureSize: 1024,
    bushes: 180,
    extraLights: true,
    palms: 5,
  },
  low: {
    name: 'low',
    dpr: [1, 1.5],
    shadowMapSize: 1024,
    ao: false,
    msaa: 0,
    bloom: true,
    particles: 420,
    textureSize: 512,
    bushes: 70,
    extraLights: false,
    palms: 3,
  },
}

const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()

/** `?tier=low|high` forces a quality tier (testing). */
export const QUALITY = TIERS[params.get('tier')] || (IS_MOBILE || lowCores ? TIERS.low : TIERS.high)

/** `?p=0.42` jumps straight to a progress value (handy for reviewing a moment). */
export const DEBUG_PROGRESS = params.has('p') ? Math.min(1, Math.max(0, parseFloat(params.get('p')) || 0)) : null
/** `?free` swaps the scroll camera for orbit controls and draws the camera path. */
export const DEBUG_FREE = params.has('free')
