import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { getMaterials } from '../../utils/materials'
import { GEO } from '../../utils/geometries'
import { BALCONY_CEIL, OPENINGS, ROOMS } from '../../config/layout'
import WindowUnit from './WindowUnit'
import Door from './Door'
import Highlightable from './Highlightable'
import { Box, Cyl, Plane, RBox, Sphere } from './primitives'

const B = ROOMS.balcony

/**
 * Black steel-frame chairs with woven black seat and back, lined up under the
 * two windows (5–11 s). One chair = 2 merged geometries; 4 instances each.
 */
const CHAIRS = [2.3, 2.9, 4.3, 4.9].map((x) => ({ position: [x, 0, 0.42], rotation: 0 }))

function buildChair() {
  const tube = (len, pos, rot) => {
    const g = new THREE.CylinderGeometry(0.011, 0.011, len, 8)
    g.rotateX(rot[0])
    g.rotateZ(rot[2])
    g.translate(...pos)
    return g.toNonIndexed()
  }
  const frame = mergeGeometries([
    tube(0.45, [-0.22, 0.225, 0.2], [0, 0, 0]),
    tube(0.45, [0.22, 0.225, 0.2], [0, 0, 0]),
    tube(0.86, [-0.22, 0.43, -0.2], [0.12, 0, 0]),
    tube(0.86, [0.22, 0.43, -0.2], [0.12, 0, 0]),
    tube(0.44, [0, 0.45, 0.2], [0, 0, Math.PI / 2]),
    tube(0.42, [-0.22, 0.45, 0], [Math.PI / 2, 0, 0]),
    tube(0.42, [0.22, 0.45, 0], [Math.PI / 2, 0, 0]),
  ])
  const seat = new THREE.BoxGeometry(0.44, 0.02, 0.42).toNonIndexed()
  seat.translate(0, 0.46, 0)
  const back = new THREE.BoxGeometry(0.44, 0.36, 0.02).toNonIndexed()
  back.rotateX(-0.12)
  back.translate(0, 0.7, -0.23)
  return { frame, weave: mergeGeometries([seat, back]) }
}

function Chairs() {
  const mats = getMaterials()
  const geos = useMemo(buildChair, [])
  const a = useRef()
  const b = useRef()
  useLayoutEffect(() => {
    const o = new THREE.Object3D()
    CHAIRS.forEach((c, i) => {
      o.position.set(...c.position)
      o.rotation.set(0, c.rotation, 0)
      o.updateMatrix()
      a.current.setMatrixAt(i, o.matrix)
      b.current.setMatrixAt(i, o.matrix)
    })
    ;[a, b].forEach((r) => {
      r.current.instanceMatrix.needsUpdate = true
      r.current.computeBoundingSphere()
    })
    return () => Object.values(geos).forEach((g) => g.dispose())
  }, [geos])
  return (
    <group name="chairs">
      <instancedMesh ref={a} args={[geos.frame, mats.blackMetal, CHAIRS.length]} castShadow />
      <instancedMesh ref={b} args={[geos.weave, mats.wicker, CHAIRS.length]} castShadow receiveShadow />
    </group>
  )
}

/** Cloth swept along x with a given (z, y) cross-section; small ripples. */
function useDrapeX(profile, length, segs = 28) {
  const geo = useMemo(() => {
    const pts = profile.map(([z, y]) => new THREE.Vector2(z, y))
    const lens = [0]
    for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + pts[i].distanceTo(pts[i - 1]))
    const total = lens[lens.length - 1]
    const pos = []
    const uv = []
    const idx = []
    const cols = segs + 1
    pts.forEach((p, j) => {
      for (let i = 0; i <= segs; i++) {
        const u = i / segs
        const hang = Math.min(1, Math.max(0, 0.5 - p.y) * 3)
        const ripple = Math.sin(u * Math.PI * 6 + j) * 0.015 * hang
        pos.push((u - 0.5) * length, p.y, p.x + ripple * Math.sign(p.x || 1))
        uv.push(lens[j] / total, u)
      }
    })
    for (let j = 0; j < pts.length - 1; j++)
      for (let i = 0; i < segs; i++) {
        const k = j * cols + i
        idx.push(k, k + 1, k + cols, k + 1, k + cols + 1, k + cols)
      }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
    g.setIndex(idx)
    g.computeVertexNormals()
    return g
  }, [profile, length, segs])
  useLayoutEffect(() => () => geo.dispose(), [geo])
  return geo
}

const KILIM_OVER_BENCH = [
  [-0.24, 0.12],
  [-0.225, 0.3],
  [-0.2, 0.46],
  [-0.17, 0.485],
  [0.0, 0.49],
  [0.17, 0.485],
  [0.2, 0.46],
  [0.215, 0.36],
]

/** Low grey metal bench against the railing with the red kilim thrown over it (4.5–10 s). */
function KilimBench() {
  const kilim = useDrapeX(KILIM_OVER_BENCH, 1.15)
  return (
    <group position={[4.05, 0, B.z1 - 0.3]}>
      <Box m="greyShelf" size={[1.4, 0.03, 0.36]} position={[0, 0.455, 0]} shadow />
      {[-0.66, 0.66].map((x) =>
        [-0.15, 0.15].map((z) => <Box key={`${x}${z}`} m="blackMetal" size={[0.025, 0.44, 0.025]} position={[x, 0.22, z]} shadow />),
      )}
      <Highlightable strength={0.1}>
        <mesh geometry={kilim} material={getMaterials().kilim} position={[-0.1, 0, 0]} castShadow receiveShadow />
      </Highlightable>
    </group>
  )
}

/** End wall: black shoe rack with a dark top, cork board, switch plate, mats (12.8–14 s). */
function EndWallCorner() {
  const shelves = [0.12, 0.38, 0.64]
  return (
    <group>
      <group position={[0.2, 0, 1.12]}>
        {shelves.map((y) => (
          <Box key={y} m={y > 0.6 ? 'darkWood' : 'blackMetal'} size={[0.32, y > 0.6 ? 0.03 : 0.015, 0.72]} position={[0, y, 0]} />
        ))}
        {[-0.15, 0.15].map((x) =>
          [-0.34, 0.34].map((z) => <Box key={`${x}${z}`} m="blackMetal" size={[0.018, 0.66, 0.018]} position={[x, 0.33, z]} />),
        )}
        <RBox m="black" size={[0.26, 0.09, 0.1]} r={0.03} position={[0, 0.18, -0.2]} />
        <RBox m="black" size={[0.26, 0.09, 0.1]} r={0.03} position={[0, 0.18, -0.07]} />
        <RBox m="paleBlue" size={[0.26, 0.08, 0.1]} r={0.03} position={[0, 0.43, 0.15]} />
        <RBox m="linen" size={[0.2, 0.05, 0.16]} r={0.02} position={[0.02, 0.68, -0.15]} />
      </group>
      {/* cork board (four tiles) and a switch plate on the end wall's east face */}
      <Box m="cork" size={[0.015, 0.78, 0.74]} position={[0.008, 1.55, 1.1]} />
      <Box m="frameWhite" size={[0.012, 0.12, 0.08]} position={[0.006, 1.25, 0.45]} />
      {/* HOME rag mat in front of the door, and a blue-grey mat by the rack */}
      <Highlightable strength={0.12}>
        <Plane m="homeMat" size={[0.72, 0.44]} position={[0.95, 0.008, 0.42]} rotation={[-Math.PI / 2, 0, 0]} />
      </Highlightable>
      <Plane m="greyMat" size={[0.5, 0.42]} position={[0.66, 0.006, 1.2]} rotation={[-Math.PI / 2, 0, 0.12]} />
    </group>
  )
}

/** Burlap wall panel on a driftwood rod with a dried-flower rosette, and a small dream-catcher (7–8 s). */
function WallHangings() {
  const mats = getMaterials()
  const petals = []
  for (let ring = 0; ring < 3; ring++) {
    const n = 7 + ring * 4
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ring * 0.4
      const rad = 0.05 + ring * 0.06
      petals.push([Math.cos(a) * rad, Math.sin(a) * rad * 1.25, a + Math.PI / 2, ring])
    }
  }
  return (
    <group position={[5.95, 0, 0.115]}>
      <Cyl m="driftwood" size={[0.035, 0.66]} position={[0, 2.08, 0.01]} rotation={[0, 0, Math.PI / 2 + 0.05]} />
      <Box m="beigeThrow" size={[0.48, 0.82, 0.008]} position={[0, 1.64, 0]} />
      <group position={[0, 1.55, 0.012]}>
        {petals.map(([x, y, r, ring], i) => (
          <mesh
            key={i}
            geometry={GEO.plane}
            material={mats.driedLeaf}
            position={[x, y, ring * 0.004]}
            rotation={[0, 0, r]}
            scale={[0.045, 0.11 - ring * 0.015, 1]}
          />
        ))}
        <Sphere m="darkWood" size={[0.06, 0.06, 0.03]} position={[0, 0, 0.02]} />
      </group>
      <group position={[0.5, 1.72, 0.01]}>
        <mesh geometry={GEO.torus} material={mats.rope} scale={0.24} />
        {[-0.05, 0, 0.05].map((x) => (
          <Box key={x} m="rope" size={[0.005, 0.35, 0.005]} position={[x, -0.3, 0]} />
        ))}
      </group>
    </group>
  )
}

/** Three-blade ceiling fan: black blades, white motor housing (12 s). */
function CeilingFan() {
  const blades = useRef()
  useFrame((_, dt) => {
    blades.current.rotation.y += Math.min(dt, 0.05) * 1.6
  })
  return (
    <group position={[3.7, BALCONY_CEIL, 1.15]}>
      <Cyl m="whiteMatte" size={[0.03, 0.22]} position={[0, -0.11, 0]} />
      <Sphere m="whiteMatte" size={[0.24, 0.13, 0.24]} position={[0, -0.26, 0]} />
      <Sphere m="lightPanel" size={[0.16, 0.07, 0.16]} position={[0, -0.32, 0]} />
      <group ref={blades} position={[0, -0.24, 0]}>
        {[0, 1, 2].map((i) => (
          <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
            <RBox m="black" size={[0.62, 0.012, 0.12]} r={0.005} position={[0.42, 0, 0]} rotation={[0.12, 0, 0]} />
          </group>
        ))}
      </group>
    </group>
  )
}

/** Concrete and red plastic planters with prickly pear on the ledge outside the south rail, east end (1–3 s). */
function Planters() {
  const pads = useMemo(() => {
    const out = []
    let s = 7
    const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
    for (const [x, h] of [
      [5.35, 0.55],
      [5.95, 0.75],
      [6.55, 0.6],
      [7.0, 0.5],
    ])
      for (let i = 0; i < 7; i++)
        out.push({ p: [x + (r() - 0.5) * 0.5, 0.2 + r() * h, B.z1 + 0.42 + (r() - 0.5) * 0.2], rot: [(r() - 0.5) * 1.2, r() * 3, r() * 0.6] })
    return out
  }, [])
  return (
    <group name="planters">
      <Box m="concrete" size={[2.3, 1.05, 0.6]} position={[6.1, -0.505, B.z1 + 0.42]} shadow />
      <RBox m="terracotta" size={[0.62, 0.2, 0.26]} r={0.02} position={[5.35, 0.12, B.z1 + 0.42]} shadow />
      <RBox m="concrete" size={[0.7, 0.2, 0.3]} r={0.02} position={[5.95, 0.12, B.z1 + 0.42]} shadow />
      <RBox m="terracotta" size={[0.62, 0.2, 0.26]} r={0.02} position={[6.55, 0.12, B.z1 + 0.42]} shadow />
      <RBox m="concrete" size={[0.4, 0.2, 0.3]} r={0.02} position={[7.0, 0.12, B.z1 + 0.42]} shadow />
      {pads.map(({ p, rot }, i) => (
        <Sphere key={i} m="cactus" size={[0.2, 0.26, 0.05]} position={p} rotation={rot} castShadow />
      ))}
    </group>
  )
}

export default function Balcony() {
  const { w1, w2 } = OPENINGS
  return (
    <group name="balcony">
      <Chairs />
      <KilimBench />
      <EndWallCorner />
      <WallHangings />
      <CeilingFan />
      <Planters />
      {/* small white globe light high on the facade (7 s) */}
      <Sphere m="lightPanel" size={[0.18, 0.18, 0.18]} position={[5.7, 2.28, 0.2]} />

      <WindowUnit
        position={[(w1.from + w1.to) / 2, w1.bottom, 0]}
        width={w1.to - w1.from}
        height={w1.top - w1.bottom}
        shutters
        closeLeft={[66.2, 67.6]}
        blind="zebraGray"
        blindDrop={0.96}
      />
      <WindowUnit
        position={[(w2.from + w2.to) / 2, w2.bottom, 0]}
        width={w2.to - w2.from}
        height={w2.top - w2.bottom}
        shutters
        blind="zebraGray"
        blindDrop={0.96}
      />
      <Door id="front" />
    </group>
  )
}
