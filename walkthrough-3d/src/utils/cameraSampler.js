import * as THREE from 'three'
import { monotoneCubic } from './interpolation'

/**
 * Builds a sampler for the camera keyframe track.
 *
 * Position runs through a centripetal Catmull-Rom spline (smooth, no cusps).
 * The *direction* the lens points at is splined separately from normalised
 * look vectors, so near and far look targets blend equally smoothly.
 * Keyframe times are irregular, so time is first mapped to a fractional keyframe
 * index with a monotone cubic; that gives continuous speed across keys instead of
 * the velocity kinks a piecewise-linear remap would produce.
 */
export function createCameraSampler(keys) {
  const times = keys.map((k) => k.t)
  const indices = keys.map((_, i) => i)
  const timeToIndex = monotoneCubic(times, indices)

  const posCurve = new THREE.CatmullRomCurve3(
    keys.map((k) => new THREE.Vector3(...k.pos)),
    false,
    'centripetal',
  )
  const dirCurve = new THREE.CatmullRomCurve3(
    keys.map((k) => new THREE.Vector3(...k.look).sub(new THREE.Vector3(...k.pos)).normalize()),
    false,
    'catmullrom',
    0.5,
  )
  const fov = monotoneCubic(times, keys.map((k) => k.fov))
  const roll = monotoneCubic(times, keys.map((k) => THREE.MathUtils.degToRad(k.roll)))
  const exposure = monotoneCubic(times, keys.map((k) => k.exposure))
  const last = keys.length - 1

  return {
    posCurve,
    sample(t, out) {
      const u = timeToIndex(t) / last
      posCurve.getPoint(u, out.position)
      dirCurve.getPoint(u, out.direction).normalize()
      out.fov = fov(t)
      out.roll = roll(t)
      out.exposure = exposure(t)
      return out
    },
  }
}
