import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { IS_TOUCH } from '../../config/quality'
import { damp } from '../../utils/interpolation'

const WHITE = new THREE.Color('#fff6e8')
const GLOW = new THREE.Color()

/**
 * Wraps key props so hovering them adds a soft emissive lift. Materials of the
 * wrapped meshes are cloned once (same shader program, separate uniforms) so the
 * glow never leaks onto other objects sharing the library material.
 * Disabled on touch devices, where hover does not exist.
 */
export default function Highlightable({ children, strength = 0.14 }) {
  const ref = useRef()
  const hovered = useRef(false)
  const level = useRef(0)
  const entries = useRef([])

  useLayoutEffect(() => {
    if (IS_TOUCH) return
    const list = []
    ref.current.traverse((o) => {
      if (!o.isMesh && !o.isInstancedMesh) return
      o.material = o.material.clone()
      list.push({
        m: o.material,
        emissive: o.material.emissive.clone(),
        intensity: o.material.emissiveIntensity,
      })
    })
    entries.current = list
    return () => list.forEach((e) => e.m.dispose())
  }, [])

  useFrame((_, dt) => {
    if (IS_TOUCH) return
    const next = damp(level.current, hovered.current ? 1 : 0, 9, dt)
    if (Math.abs(next - level.current) < 1e-4) return
    level.current = next
    entries.current.forEach(({ m, emissive, intensity }) => {
      GLOW.copy(WHITE).multiplyScalar(next * strength)
      m.emissive.copy(emissive).multiplyScalar(intensity).add(GLOW)
      m.emissiveIntensity = 1
    })
  })

  if (IS_TOUCH) return <group ref={ref}>{children}</group>
  return (
    <group
      ref={ref}
      onPointerOver={(e) => {
        e.stopPropagation()
        hovered.current = true
      }}
      onPointerOut={() => {
        hovered.current = false
      }}
    >
      {children}
    </group>
  )
}
