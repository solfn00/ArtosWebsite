import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EYE_HEIGHT } from '../config/layout'
import { navState, walkInput } from '../state/scrollStore'
import { resolveCollisions, roomAt } from '../utils/collision'
import { damp } from '../utils/interpolation'

/** First-person tuning: roughly the pace and head height of the person filming. */
export const WALK = {
  speed: 1.25, // m/s, relaxed indoor walk
  runSpeed: 2.3,
  accel: 8,
  radius: 0.22, // body radius for collision (fits 0.8 m doorways)
  pitchLimit: 1.25,
  bob: 0.018,
  stride: 0.65,
}

const FORWARD = new THREE.Vector3()
const RIGHT = new THREE.Vector3()
const EULER = new THREE.Euler(0, 0, 0, 'YXZ')

/**
 * Free first-person navigation, active when navState.mode === 'walk'.
 * Takes over the default camera from its current pose (so switching modes
 * never jumps), integrates velocity with damping, slides along walls and
 * furniture via 2D collision, and adds a light head bob.
 */
export default function WalkControls() {
  const camera = useThree((s) => s.camera)
  const st = useRef({ active: false, yaw: 0, pitch: 0, vel: new THREE.Vector2(), pos: { x: 0, z: 0 }, phase: 0, y: EYE_HEIGHT })

  useEffect(() => {
    const onMode = (mode) => {
      const s = st.current
      if (mode !== 'walk') {
        s.active = false
        return
      }
      // adopt the current scroll-camera pose
      EULER.setFromQuaternion(camera.quaternion, 'YXZ')
      s.yaw = EULER.y
      s.pitch = THREE.MathUtils.clamp(EULER.x, -0.6, 0.6)
      s.pos.x = camera.position.x
      s.pos.z = camera.position.z
      s.y = camera.position.y
      s.vel.set(0, 0)
      resolveCollisions(s.pos, WALK.radius)
      s.active = true
    }
    navState.listeners.add(onMode)
    return () => navState.listeners.delete(onMode)
  }, [camera])

  useFrame((_, rawDt) => {
    const s = st.current
    if (!s.active) return
    const dt = Math.min(rawDt, 1 / 20)

    // look
    s.yaw -= walkInput.lookDX
    s.pitch = THREE.MathUtils.clamp(s.pitch - walkInput.lookDY, -WALK.pitchLimit, WALK.pitchLimit)
    walkInput.lookDX = 0
    walkInput.lookDY = 0

    // desired planar velocity from keys + virtual stick
    const k = walkInput.keys
    let fwd = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) + walkInput.stick.y
    let str = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0) + walkInput.stick.x
    const mag = Math.hypot(fwd, str)
    if (mag > 1) {
      fwd /= mag
      str /= mag
    }
    const speed = walkInput.run || k.has('ShiftLeft') || k.has('ShiftRight') ? WALK.runSpeed : WALK.speed
    FORWARD.set(-Math.sin(s.yaw), 0, -Math.cos(s.yaw))
    RIGHT.set(Math.cos(s.yaw), 0, -Math.sin(s.yaw))
    const tx = (FORWARD.x * fwd + RIGHT.x * str) * speed
    const tz = (FORWARD.z * fwd + RIGHT.z * str) * speed
    s.vel.x = damp(s.vel.x, tx, WALK.accel, dt)
    s.vel.y = damp(s.vel.y, tz, WALK.accel, dt)

    const px = s.pos.x
    const pz = s.pos.z
    s.pos.x += s.vel.x * dt
    s.pos.z += s.vel.y * dt
    resolveCollisions(s.pos, WALK.radius)
    const moved = Math.hypot(s.pos.x - px, s.pos.z - pz)
    s.phase += (moved / WALK.stride) * Math.PI
    s.y = damp(s.y, EYE_HEIGHT, 4, dt)
    const bob = Math.min(1, Math.hypot(s.vel.x, s.vel.y) / WALK.speed)

    camera.position.set(s.pos.x, s.y + (Math.abs(Math.sin(s.phase)) - 0.5) * WALK.bob * 2 * bob, s.pos.z)
    EULER.set(s.pitch, s.yaw, 0, 'YXZ')
    camera.quaternion.setFromEuler(EULER)
    if (Math.abs(camera.fov - 55) > 0.05) {
      camera.fov = damp(camera.fov, 55, 4, dt)
      camera.updateProjectionMatrix()
    }
    walkInput.room = roomAt(s.pos.x, s.pos.z)
    if (import.meta.env.DEV) window.__walk = { x: s.pos.x, z: s.pos.z, yaw: s.yaw }
  }, -1)

  return null
}
