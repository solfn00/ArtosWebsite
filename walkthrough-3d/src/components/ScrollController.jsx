import { useFrame } from '@react-three/fiber'
import { SCROLL, toVideoTime } from '../config/timeline'
import { scrollState } from '../state/scrollStore'
import { damp } from '../utils/interpolation'

/**
 * Converts the (already Lenis-smoothed) scroll target into the animation clock.
 * A second, critically damped stage runs inside the render loop so camera motion
 * is always in lock-step with rendered frames, independent of scroll event timing.
 * Runs before the camera rig (priority −2).
 */
export default function ScrollController() {
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20)
    const s = scrollState
    if (s.snap) {
      s.progress = s.target
      s.snap = false
    } else {
      s.progress = damp(s.progress, s.target, SCROLL.progressDamping, dt)
      if (Math.abs(s.progress - s.target) < 1e-5) s.progress = s.target
    }
    s.smoothVelocity = damp(s.smoothVelocity, s.velocity, SCROLL.velocityDamping, dt)
    s.videoTime = toVideoTime(s.progress)
  }, -2)
  return null
}
