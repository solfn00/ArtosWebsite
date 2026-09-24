import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GEO } from '../../utils/geometries'
import { getMaterials } from '../../utils/materials'
import { Box, Plane } from './primitives'
import { scrollState } from '../../state/scrollStore'
import { clamp01, easeInOutCubic } from '../../utils/interpolation'
import Highlightable from './Highlightable'

const SLAT_PITCH = 0.075

/**
 * One louvered shutter leaf. Slats are a single InstancedMesh.
 * `side` = -1 for a leaf hinged on the left edge (extends to the left), +1 right.
 */
function ShutterLeaf({ width, height, side, openAngle = 0.07, close = null }) {
  const mats = getMaterials()
  const slats = useRef()
  const group = useRef()
  const count = Math.floor((height - 0.16) / SLAT_PITCH)

  const matrices = useMemo(() => {
    const o = new THREE.Object3D()
    const list = []
    for (let i = 0; i < count; i++) {
      o.position.set((side * width) / 2, 0.1 + i * SLAT_PITCH + SLAT_PITCH / 2, 0)
      o.rotation.set(-0.6, 0, 0)
      o.scale.set(width - 0.08, 0.06, 0.012)
      o.updateMatrix()
      list.push(o.matrix.clone())
    }
    return list
  }, [count, width, side])

  useLayoutEffect(() => {
    matrices.forEach((m, i) => slats.current.setMatrixAt(i, m))
    slats.current.instanceMatrix.needsUpdate = true
    slats.current.computeBoundingSphere()
  }, [matrices])

  // optional scripted close (the hand pulling a shutter shut at the end, 66.5–68 s)
  useFrame(() => {
    if (!close) return
    const f = easeInOutCubic(clamp01((scrollState.videoTime - close[0]) / (close[1] - close[0])))
    group.current.rotation.y = side * -(openAngle + (Math.PI - openAngle - 0.03) * f)
  })

  const cx = (side * width) / 2
  return (
    <group ref={group} rotation={[0, side * -openAngle, 0]}>
      <Box m="shutterBlue" size={[0.045, height, 0.035]} position={[side * 0.0225, height / 2, 0]} shadow />
      <Box m="shutterBlue" size={[0.045, height, 0.035]} position={[side * (width - 0.0225), height / 2, 0]} shadow />
      <Box m="shutterBlue" size={[width, 0.08, 0.035]} position={[cx, 0.04, 0]} shadow />
      <Box m="shutterBlue" size={[width, 0.08, 0.035]} position={[cx, height - 0.04, 0]} shadow />
      <instancedMesh ref={slats} args={[GEO.box, mats.shutterBlue, count]} castShadow receiveShadow />
    </group>
  )
}

/**
 * Window opening fill: white frame, mullion, glass, sill, and optionally blue
 * shutters folded back against the exterior face (+z local) or an interior
 * blind (−z local).
 *
 * `position` is the centre of the opening at sill height on the wall centreline.
 */
export default function WindowUnit({
  position,
  rotation = 0,
  width,
  height,
  depth = 0.2,
  shutters = false,
  closeLeft = null,
  closeRight = null,
  blind = null,
  blindDrop = 1,
  frosted = false,
}) {
  const f = 0.05
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* frame */}
      <Box m="frameWhite" size={[width, f, depth * 0.5]} position={[0, f / 2, 0]} />
      <Box m="frameWhite" size={[width, f, depth * 0.5]} position={[0, height - f / 2, 0]} />
      <Box m="frameWhite" size={[f, height, depth * 0.5]} position={[-width / 2 + f / 2, height / 2, 0]} />
      <Box m="frameWhite" size={[f, height, depth * 0.5]} position={[width / 2 - f / 2, height / 2, 0]} />
      <Box m="frameWhite" size={[0.04, height, depth * 0.45]} position={[0, height / 2, 0]} />
      <Box m="frameWhite" size={[width - 2 * f, 0.035, depth * 0.45]} position={[0, height * 0.5, 0]} />
      {/* glass */}
      <Plane m="windowGlass" size={[width - 2 * f, height - 2 * f]} position={[0, height / 2, 0.005]} />
      <Plane
        m={frosted ? 'daylight' : 'windowGlass'}
        size={[width - 2 * f, height - 2 * f]}
        position={[0, height / 2, -0.005]}
        rotation={[0, Math.PI, 0]}
      />
      {/* exterior sill */}
      <Box m="concrete" size={[width + 0.12, 0.04, depth * 0.7]} position={[0, -0.02, depth * 0.45]} shadow />

      {shutters && (
        <Highlightable strength={0.08}>
          <group position={[-width / 2, 0, depth / 2 + 0.03]}>
            <ShutterLeaf width={width / 2} height={height} side={-1} close={closeLeft} />
          </group>
          <group position={[width / 2, 0, depth / 2 + 0.03]}>
            <ShutterLeaf width={width / 2} height={height} side={1} close={closeRight} openAngle={0.09} />
          </group>
        </Highlightable>
      )}

      {blind && (
        <group position={[0, 0, -depth / 2 - 0.05]}>
          <Box m="frameWhite" size={[width + 0.08, 0.09, 0.09]} position={[0, height + 0.06, 0]} />
          <Plane
            m={blind}
            size={[width + 0.04, height * blindDrop]}
            position={[0, height - (height * blindDrop) / 2 + 0.02, 0]}
            rotation={[0, Math.PI, 0]}
          />
        </group>
      )}
    </group>
  )
}
