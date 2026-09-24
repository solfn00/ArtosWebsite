import * as THREE from 'three'
import { GEO, roundedBox } from '../../utils/geometries'
import { getMaterials } from '../../utils/materials'

/**
 * Tiny building blocks used by all furniture. `m` is a material key from the
 * shared library. Interior props do not cast sun shadows (the sun never reaches
 * them), which keeps the shadow pass cheap.
 */
export function Box({ size = [1, 1, 1], m = 'whiteMatte', shadow = false, ...props }) {
  return (
    <mesh geometry={GEO.box} material={getMaterials()[m]} scale={size} castShadow={shadow} receiveShadow {...props} />
  )
}

export function RBox({ size, r = 0.03, m = 'whiteMatte', shadow = false, ...props }) {
  return (
    <mesh
      geometry={roundedBox(size[0], size[1], size[2], r)}
      material={getMaterials()[m]}
      castShadow={shadow}
      receiveShadow
      {...props}
    />
  )
}

/** Cylinder standing on the y axis; size = [diameter, height, diameterZ?]. */
export function Cyl({ size = [1, 1], m = 'whiteMatte', low = false, shadow = false, ...props }) {
  return (
    <mesh
      geometry={low ? GEO.cylinderLow : GEO.cylinder}
      material={getMaterials()[m]}
      scale={[size[0], size[1], size[2] ?? size[0]]}
      castShadow={shadow}
      receiveShadow
      {...props}
    />
  )
}

export function Sphere({ size = [1, 1, 1], m = 'whiteMatte', ...props }) {
  return <mesh geometry={GEO.sphere} material={getMaterials()[m]} scale={size} receiveShadow {...props} />
}

export function Plane({ size = [1, 1], m = 'whiteMatte', ...props }) {
  return <mesh geometry={GEO.plane} material={getMaterials()[m]} scale={[size[0], size[1], 1]} receiveShadow {...props} />
}

const tiled = new Map()
/** Plane whose UVs are in metres, for tiled library textures (cladding, splashbacks). */
export function TiledPlane({ size, m, ...props }) {
  const key = `${size[0]}|${size[1]}`
  if (!tiled.has(key)) {
    const g = new THREE.PlaneGeometry(size[0], size[1])
    const uv = g.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * size[0], uv.getY(i) * size[1])
    tiled.set(key, g)
  }
  return <mesh geometry={tiled.get(key)} material={getMaterials()[m]} receiveShadow {...props} />
}
