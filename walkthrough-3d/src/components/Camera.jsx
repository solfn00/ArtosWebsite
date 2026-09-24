import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { CAMERA_KEYS, CAMERA_MOTION as M } from '../config/timeline'
import { REDUCED_MOTION } from '../config/quality'
import { cameraState, navState, pointerState, scrollState } from '../state/scrollStore'
import { damp, easeInOutCubic } from '../utils/interpolation'
import { createCameraSampler } from '../utils/cameraSampler'

const UP = new THREE.Vector3(0, 1, 0)

/**
 * Scroll-driven handheld camera.
 *
 * Per frame:
 *  1. sample the keyframe spline at the current (damped) video time
 *  2. add a walk cycle whose phase advances with *distance travelled*, so the
 *     bob only exists while the user is actually moving through the house
 *  3. add breathing + pointer parallax (look-offset and a tiny counter shift)
 *  4. widen the FOV a touch with scroll speed and on portrait screens
 */
export default function Camera() {
  const cam = useRef()
  const size = useThree((s) => s.size)
  const sampler = useMemo(() => createCameraSampler(CAMERA_KEYS), [])
  const sample = useMemo(() => ({ position: new THREE.Vector3(), direction: new THREE.Vector3(), fov: 50, roll: 0, exposure: 1 }), [])
  const state = useRef({
    prev: null,
    phase: 0,
    walk: 0,
    pointer: new THREE.Vector2(),
    // hand-back from walk mode: blend from the walker's pose to the timeline pose
    wasWalking: false,
    blend: 1,
    fromPos: new THREE.Vector3(),
    fromQuat: new THREE.Quaternion(),
    toQuat: new THREE.Quaternion(),
  })
  const tmp = useMemo(
    () => ({ right: new THREE.Vector3(), up: new THREE.Vector3(), target: new THREE.Vector3(), pos: new THREE.Vector3() }),
    [],
  )

  // pointer parallax source (ignored on touch: there is no hover there)
  useEffect(() => {
    const onMove = (e) => {
      pointerState.x = (e.clientX / window.innerWidth) * 2 - 1
      pointerState.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    const onLeave = () => {
      pointerState.x = 0
      pointerState.y = 0
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  useFrame(({ clock }, rawDt) => {
    const c = cam.current
    const s = state.current
    const dt = Math.min(rawDt, 1 / 20)
    if (navState.mode === 'walk') {
      s.wasWalking = true
      return
    }
    if (s.wasWalking) {
      s.wasWalking = false
      s.blend = 0
      s.fromPos.copy(c.position)
      s.fromQuat.copy(c.quaternion)
    }
    const time = clock.elapsedTime
    sampler.sample(scrollState.videoTime, sample)

    // ── walk cycle ────────────────────────────────────────────────────────
    if (!s.prev) s.prev = sample.position.clone()
    const moved = s.prev.distanceTo(sample.position)
    s.prev.copy(sample.position)
    const speed = moved / Math.max(dt, 1e-4)
    cameraState.speed = speed
    s.phase += (moved / M.strideLength) * Math.PI
    s.walk = damp(s.walk, Math.min(1, speed / 1.2), 4, dt)
    const motion = REDUCED_MOTION ? 0 : 1
    const bob = s.walk * motion

    // ── basis vectors from the sampled look direction ────────────────────
    const dir = sample.direction
    tmp.right.crossVectors(dir, UP).normalize()
    tmp.up.crossVectors(tmp.right, dir).normalize()

    s.pointer.x = damp(s.pointer.x, pointerState.x, M.pointerDamping, dt)
    s.pointer.y = damp(s.pointer.y, pointerState.y, M.pointerDamping, dt)

    tmp.pos
      .copy(sample.position)
      .addScaledVector(UP, Math.abs(Math.sin(s.phase)) * M.bobHeight * 2 * bob - M.bobHeight * bob)
      .addScaledVector(tmp.right, Math.sin(s.phase * 0.5) * M.bobSway * bob)
      .addScaledVector(UP, Math.sin(time * 1.1) * M.breathe * motion)
      .addScaledVector(tmp.right, -s.pointer.x * M.mouseShift)
      .addScaledVector(tmp.up, -s.pointer.y * M.mouseShift * 0.6)

    tmp.target
      .copy(tmp.pos)
      .addScaledVector(dir, 4)
      .addScaledVector(tmp.right, s.pointer.x * M.mouseLook[0] + Math.sin(time * 0.37) * 0.015 * motion)
      .addScaledVector(tmp.up, s.pointer.y * M.mouseLook[1] + Math.sin(time * 0.53 + 1) * 0.012 * motion)

    c.position.copy(tmp.pos)
    c.up.copy(UP)
    c.lookAt(tmp.target)
    c.rotateZ(sample.roll * (REDUCED_MOTION ? 0.3 : 1) + Math.sin(s.phase * 0.5) * M.bobRoll * bob)
    if (s.blend < 1) {
      s.blend = Math.min(1, s.blend + dt / 1.2)
      const e = easeInOutCubic(s.blend)
      s.toQuat.copy(c.quaternion)
      c.position.lerpVectors(s.fromPos, c.position, e)
      c.quaternion.slerpQuaternions(s.fromQuat, s.toQuat, e)
    }

    // ── lens ──────────────────────────────────────────────────────────────
    const velocityKick = Math.min(1, Math.abs(scrollState.smoothVelocity) / 60) * M.velocityFov * motion
    let fov = sample.fov + velocityKick
    const aspect = size.width / size.height
    if (aspect < 1.5) {
      // keep roughly the horizontal coverage of a 3:2 frame on portrait screens
      const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(fov) / 2) * 1.5)
      const wanted = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hfov / 2) / aspect))
      fov = Math.min(88, THREE.MathUtils.lerp(fov, wanted, 0.7))
    }
    if (Math.abs(c.fov - fov) > 0.01) {
      c.fov = fov
      c.updateProjectionMatrix()
    }
    cameraState.exposure = sample.exposure
  })

  return <PerspectiveCamera ref={cam} makeDefault near={0.05} far={6000} fov={50} position={CAMERA_KEYS[0].pos} />
}

/** Debug helper (?free): the camera spline drawn as a line. */
export function CameraPath() {
  const geo = useMemo(() => {
    const sampler = createCameraSampler(CAMERA_KEYS)
    return new THREE.BufferGeometry().setFromPoints(sampler.posCurve.getPoints(600))
  }, [])
  return (
    <line geometry={geo}>
      <lineBasicMaterial color="#ff3366" />
    </line>
  )
}
