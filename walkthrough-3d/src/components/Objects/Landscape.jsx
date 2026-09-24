import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { getMaterials } from '../../utils/materials'
import { LOWER_Y, PALETTE } from '../../config/layout'
import { GEO } from '../../utils/geometries'
import { QUALITY } from '../../config/quality'
import { skyFragment, skyVertex } from '../../shaders/sky'

/** Overcast late-afternoon light: a high, soft sun from the south-west (see 9 s, 65 s). */
export const SUN_DIR = new THREE.Vector3(-0.35, 0.8, 0.5).normalize()

/** Deterministic pseudo-random helpers so the landscape is identical every load. */
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
const hash = (x) => {
  const s = Math.sin(x * 127.1) * 43758.5453
  return s - Math.floor(s)
}
const noise1 = (x) => {
  const i = Math.floor(x)
  const f = x - i
  const u = f * f * (3 - 2 * f)
  return hash(i) * (1 - u) + hash(i + 1) * u
}

function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uZenith: { value: new THREE.Color('#aebcc8') },
          uHorizon: { value: new THREE.Color(PALETTE.horizon) },
          uGround: { value: new THREE.Color('#c9cbbd') },
          uSunDir: { value: SUN_DIR },
          uSunColor: { value: new THREE.Color('#fff4e6').multiplyScalar(0.25) },
        },
      }),
    [],
  )
  useLayoutEffect(() => () => mat.dispose(), [mat])
  return (
    <mesh material={mat} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[2800, 32, 16]} />
    </mesh>
  )
}

/** Garden lawn one storey below the balcony (seen through the railing, 9–10 s, 65 s). */
function Ground() {
  const geo = useMemo(() => {
    const size = 1200
    const g = new THREE.PlaneGeometry(size, size, 120, 120)
    g.rotateX(-Math.PI / 2)
    const p = g.attributes.position
    const uv = g.attributes.uv
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      const z = p.getZ(i)
      const undulate = (noise1(x * 0.03) + noise1(z * 0.04 + 7)) * 1.2 * THREE.MathUtils.smoothstep(Math.hypot(x, z), 30, 80)
      p.setY(i, LOWER_Y + undulate)
      uv.setXY(i, x, -z)
    }
    g.computeVertexNormals()
    return g
  }, [])
  useLayoutEffect(() => () => geo.dispose(), [geo])
  return <mesh geometry={geo} material={getMaterials().ground} receiveShadow />
}

/** Lumpy foliage blob shared by shrubs and tree crowns. */
function foliageBlob(detail = 2, amount = 0.35) {
  const g = new THREE.IcosahedronGeometry(0.5, detail)
  const p = g.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const k = 1 + (noise1(v.x * 9 + v.y * 5) - 0.5) * amount + (noise1(v.z * 13 + 3) - 0.5) * amount * 0.6
    v.multiplyScalar(k)
    p.setXYZ(i, v.x, Math.max(v.y, -0.25), v.z)
  }
  g.computeVertexNormals()
  return g
}

/** Instanced garden shrubs: a green oasis ring around the plinth. */
function Shrubs() {
  const ref = useRef()
  const count = QUALITY.bushes
  const geo = useMemo(() => foliageBlob(2, 0.35), [])
  useLayoutEffect(() => {
    const r = rng(7)
    const o = new THREE.Object3D()
    const col = new THREE.Color()
    let placed = 0
    let guard = 0
    while (placed < count && guard++ < count * 20) {
      const x = -14 + r() * 36
      const z = -14 + r() * 32
      // keep clear of the house, the terrace and the stair walkway
      if (x > -2.6 && x < 7.9 && z > -7.2 && z < 7.6) continue
      if (x > 7.6 && x < 14 && z > -2 && z < 7.6) continue
      const near = Math.hypot(x - 0.5, z) < 14
      const s = near ? 0.35 + r() * 0.7 : 0.5 + r() * 1.3
      o.position.set(x, LOWER_Y + s * 0.3, z)
      o.scale.set(s * (0.8 + r() * 0.5), s * (0.6 + r() * 0.5), s * (0.8 + r() * 0.5))
      o.rotation.set(r(), r() * 6, r())
      o.updateMatrix()
      ref.current.setMatrixAt(placed, o.matrix)
      col.setHSL(0.2 + r() * 0.08, 0.38 + r() * 0.22, 0.16 + r() * 0.12)
      ref.current.setColorAt(placed, col)
      placed++
    }
    ref.current.count = placed
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.instanceColor.needsUpdate = true
    ref.current.computeBoundingSphere()
    return () => geo.dispose()
  }, [count, geo])
  return <instancedMesh ref={ref} args={[geo, getMaterials().foliage, count]} castShadow receiveShadow />
}

/**
 * Date palms: bent trunks + a crown of drooping fronds. All fronds of all palms
 * share one InstancedMesh.
 */
const PALMS = [
  { at: [3.0, 9.5], h: 6.5, lean: [0.1, 0.15] },
  { at: [8.8, 9.0], h: 7.0, lean: [-0.1, 0.1] },
  { at: [14.0, 7.0], h: 8.0, lean: [0.15, -0.05] },
  { at: [-4.5, 12.0], h: 7.5, lean: [0.2, 0.1] },
  { at: [16.5, 14.5], h: 10.0, lean: [-0.05, 0.1] },
  { at: [1.0, 19.0], h: 9.0, lean: [0.05, -0.1] },
  { at: [-9.0, 6.0], h: 8.5, lean: [-0.2, 0.05] },
  { at: [12.0, -6.0], h: 9.0, lean: [0.1, -0.15] },
].slice(0, QUALITY.palms + 3)

function Palms() {
  const mats = getMaterials()
  const fronds = useRef()
  const { trunk, frond, matrices } = useMemo(() => {
    const parts = []
    const matrices = []
    const o = new THREE.Object3D()
    PALMS.forEach((p, pi) => {
      const t = new THREE.CylinderGeometry(0.17, 0.26, p.h, 10, 12)
      const pos = t.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const k = (pos.getY(i) + p.h / 2) / p.h
        pos.setX(i, pos.getX(i) + p.lean[0] * k * k * p.h * 0.3)
        pos.setZ(i, pos.getZ(i) + p.lean[1] * k * k * p.h * 0.3)
      }
      t.translate(p.at[0], LOWER_Y + p.h / 2, p.at[1])
      t.computeVertexNormals()
      parts.push(t)
      const crown = new THREE.Vector3(p.at[0] + p.lean[0] * p.h * 0.3, LOWER_Y + p.h, p.at[1] + p.lean[1] * p.h * 0.3)
      const n = 14
      for (let i = 0; i < n; i++) {
        o.position.copy(crown)
        o.rotation.set(0, (i / n) * Math.PI * 2 + pi, 0)
        o.rotateX(-0.25 - (i % 3) * 0.28)
        o.scale.setScalar(0.85 + ((i * 37) % 10) / 30)
        o.updateMatrix()
        matrices.push(o.matrix.clone())
      }
    })
    // a single frond: a strip bent into a drooping arc along +z
    const f = new THREE.PlaneGeometry(0.95, 3.2, 1, 10)
    f.rotateX(-Math.PI / 2)
    f.translate(0, 0, 1.6)
    const fp = f.attributes.position
    for (let i = 0; i < fp.count; i++) {
      const z = fp.getZ(i)
      fp.setY(i, -0.12 * z * z + 0.35 * z * 0.5 - Math.abs(fp.getX(i)) * 0.35)
    }
    f.computeVertexNormals()
    return { trunk: mergeGeometries(parts), frond: f, matrices }
  }, [])

  useLayoutEffect(() => {
    matrices.forEach((m, i) => fronds.current.setMatrixAt(i, m))
    fronds.current.instanceMatrix.needsUpdate = true
    fronds.current.computeBoundingSphere()
    return () => {
      trunk.dispose()
      frond.dispose()
    }
  }, [matrices, trunk, frond])

  return (
    <group name="palms">
      <mesh geometry={trunk} material={mats.trunk} castShadow receiveShadow />
      <instancedMesh ref={fronds} args={[frond, mats.frond, matrices.length]} castShadow />
    </group>
  )
}

/**
 * The lower roof terrace directly below and south of the balcony (≈1 m down):
 * paving, a patch of synthetic grass, an X-braced railing on its outer edge
 * and a flat gravel roof to the east (2.5–4.5 s, 64.5–66 s).
 */
function LowerCourt() {
  const mats = getMaterials()
  const y = -1.0
  const x0 = -0.3
  const x1 = 7.8
  const z0 = 2.35
  const z1 = 7.4
  const rails = []
  const run = (a, b) => {
    const n = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 1.2)
    for (let i = 0; i < n; i++) {
      const p = [a[0] + ((b[0] - a[0]) * (i + 0.5)) / n, a[1] + ((b[1] - a[1]) * (i + 0.5)) / n]
      const ang = Math.atan2(-(b[1] - a[1]), b[0] - a[0])
      rails.push({ p, ang, len: Math.hypot(b[0] - a[0], b[1] - a[1]) / n })
    }
  }
  run([x0, z1], [x1, z1])
  run([x1, z1], [x1, z0])
  return (
    <group name="lower-court">
      <mesh geometry={GEO.box} material={mats.concrete} position={[(x0 + x1) / 2, (y + LOWER_Y) / 2, (z0 + z1) / 2]} scale={[x1 - x0, y - LOWER_Y, z1 - z0]} receiveShadow castShadow />
      <mesh geometry={GEO.plane} material={mats.balconyTiles} position={[(x0 + x1) / 2, y + 0.005, (z0 + z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} scale={[x1 - x0, z1 - z0, 1]} receiveShadow />
      <mesh geometry={GEO.plane} material={mats.turf} position={[3.6, y + 0.012, 5.1]} rotation={[-Math.PI / 2, 0, 0]} scale={[5.2, 3.4, 1]} receiveShadow />
      {rails.map(({ p, ang, len }, i) => (
        <group key={i} position={[p[0], y, p[1]]} rotation={[0, ang, 0]}>
          <mesh geometry={GEO.box} material={mats.railBlue} position={[0, 1.0, 0]} scale={[len, 0.04, 0.04]} />
          <mesh geometry={GEO.box} material={mats.baluster} position={[0, 0.08, 0]} scale={[len, 0.03, 0.03]} />
          <mesh geometry={GEO.box} material={mats.baluster} position={[-len / 2, 0.5, 0]} scale={[0.035, 1.0, 0.035]} />
          {[1, -1].map((sgn) => (
            <mesh key={sgn} geometry={GEO.box} material={mats.baluster} position={[0, 0.54, 0]} rotation={[0, 0, sgn * Math.atan2(0.9, len)]} scale={[Math.hypot(len, 0.9), 0.018, 0.018]} />
          ))}
        </group>
      ))}
      {/* flat gravel roof of the neighbouring low building, east */}
      <mesh geometry={GEO.box} material={mats.plaster} position={[10.8, (LOWER_Y - 0.7) / 2, 3.0]} scale={[6, -0.7 - LOWER_Y, 9]} castShadow receiveShadow />
      <mesh geometry={GEO.plane} material={mats.gravel} position={[10.8, -0.69, 3.0]} rotation={[-Math.PI / 2, 0, 0]} scale={[6, 9, 1]} receiveShadow />
    </group>
  )
}

/**
 * Dense garden canopy around the plot: rounded tree crowns on trunks at the
 * height of the balcony, as seen behind the railing (9 s, 64–66 s).
 */
function Trees() {
  const crowns = useRef()
  const trunks = useRef()
  const count = Math.round(QUALITY.bushes * 0.35)
  const geo = useMemo(() => {
    const parts = [
      [0, 0, 0, 1.0],
      [0.55, -0.15, 0.2, 0.75],
      [-0.45, -0.1, -0.3, 0.8],
      [0.1, 0.35, -0.4, 0.65],
    ].map(([x, y, z, s]) => {
      const b = foliageBlob(2, 0.55)
      b.scale(s * 2, s * 2, s * 2)
      b.translate(x, y, z)
      return b
    })
    const merged = mergeGeometries(parts)
    parts.forEach((p) => p.dispose())
    return merged
  }, [])
  useLayoutEffect(() => {
    const r = rng(19)
    const o = new THREE.Object3D()
    const col = new THREE.Color()
    let placed = 0
    let guard = 0
    while (placed < count && guard++ < count * 30) {
      const ang = r() * Math.PI * 2
      const dist = 11 + r() * 16
      const x = 3 + Math.cos(ang) * dist
      const z = -1 + Math.sin(ang) * dist
      if (z < -12) continue
      const h = 3.2 + r() * 3.5
      const s = 1.4 + r() * 1.6
      o.position.set(x, LOWER_Y + h, z)
      o.scale.set(s * (0.9 + r() * 0.4), s * (0.7 + r() * 0.3), s * (0.9 + r() * 0.4))
      o.rotation.set(0, r() * 6, 0)
      o.updateMatrix()
      crowns.current.setMatrixAt(placed, o.matrix)
      col.setHSL(0.2 + r() * 0.07, 0.3 + r() * 0.2, 0.15 + r() * 0.1)
      crowns.current.setColorAt(placed, col)
      o.position.set(x, LOWER_Y + h / 2, z)
      o.scale.set(0.22, h, 0.22)
      o.updateMatrix()
      trunks.current.setMatrixAt(placed, o.matrix)
      placed++
    }
    crowns.current.count = placed
    trunks.current.count = placed
    ;[crowns, trunks].forEach((m) => {
      m.current.instanceMatrix.needsUpdate = true
      m.current.computeBoundingSphere()
    })
    crowns.current.instanceColor.needsUpdate = true
    return () => geo.dispose()
  }, [count, geo])
  const mats = getMaterials()
  return (
    <group name="trees">
      <instancedMesh ref={crowns} args={[geo, mats.foliage, count]} castShadow receiveShadow />
      <instancedMesh ref={trunks} args={[GEO.cylinderLow, mats.darkWood, count]} />
    </group>
  )
}

/** Weathered wooden slat fence at the far side of the lawn (9 s). */
function Fence() {
  const mats = getMaterials()
  return (
    <group name="fence">
      <mesh geometry={GEO.box} material={mats.darkWood} position={[2, LOWER_Y + 0.9, 11.5]} scale={[26, 1.8, 0.06]} castShadow receiveShadow />
    </group>
  )
}

export default function Landscape() {
  return (
    <group name="landscape">
      <Sky />
      <Ground />
      <LowerCourt />
      <Fence />
      <Trees />
      <Shrubs />
      <Palms />
    </group>
  )
}
