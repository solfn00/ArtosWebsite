import { useLayoutEffect, useMemo } from 'react'
import { ArchitectureBuilder, hWall, vWall } from '../../utils/architecture'
import { getMaterials } from '../../utils/materials'
import { BALCONY_CEIL, LOWER_Y, OPENINGS, ROOF_Y, ROOMS, WALL_H, WALLS } from '../../config/layout'

/**
 * The static shell of the flat, built from the WALLS / ROOMS data in
 * config/layout.js and merged into one mesh per material.
 */
function buildHouse() {
  const b = new ArchitectureBuilder()

  // ── walls (with real thickness and door / window openings) ────────────────
  WALLS.forEach((w) => {
    const openings = (w.openings || []).map((k) => OPENINGS[k])
    const opts = { height: w.h, thickness: w.t, pos: w.pos, neg: w.neg, edge: w.edge || w.neg, openings }
    if (w.kind === 'h') hWall(b, w.at, w.a, w.b, opts)
    else vWall(b, w.at, w.a, w.b, opts)
  })

  // ── floors ────────────────────────────────────────────────────────────────
  const { bathroom, hall, kitchen, living, bedroom, balcony } = ROOMS
  b.quad(bathroom.x0, bathroom.x1, bathroom.z0, bathroom.z1, 0, 'moroccan')
  b.quad(hall.x0, hall.x1, hall.z0, hall.z1, 0, 'floorTiles')
  b.quad(kitchen.x0, kitchen.x1, kitchen.z0, kitchen.z1, 0, 'floorTiles')
  b.quad(living.x0, living.x1, living.z0, living.z1, 0, 'laminate')
  b.quad(bedroom.x0, bedroom.x1, bedroom.z0, bedroom.z1, 0, 'laminate')
  b.quad(balcony.x0 - 0.02, balcony.x1, 0.1, balcony.z1, 0, 'balconyTiles')
  // door thresholds (marble strips flush with the floor)
  b.quad(OPENINGS.frontDoor.from, OPENINGS.frontDoor.to, -0.1, 0.1, 0.004, 'threshold')

  // ── interior ceilings ─────────────────────────────────────────────────────
  ;[bathroom, hall, kitchen, living, bedroom].forEach((r) => b.quad(r.x0, r.x1, r.z0, r.z1, WALL_H, 'ceilingWhite', 'down'))
  // bulkhead over the hall entrance (the step seen in the ceiling at 18 s)
  b.block([hall.x0, WALL_H - 0.28, -0.9], [hall.x1, WALL_H, 0], ['white', 'white', null, 'white', 'white', 'white'])

  // ── balcony: wooden board ceiling on a white beam grid ────────────────────
  b.quad(-0.25, balcony.x1 + 0.1, 0.1, balcony.z1 + 0.1, BALCONY_CEIL, 'woodCeiling', 'down')
  const beam = 'frameWhite'
  for (const z of [0.16, 0.8, 1.42, balcony.z1 + 0.06]) b.block([-0.25, BALCONY_CEIL - 0.12, z - 0.05], [balcony.x1 + 0.1, BALCONY_CEIL, z + 0.05], beam)
  for (let x = 0.55; x < balcony.x1; x += 1.2) b.block([x - 0.04, BALCONY_CEIL - 0.09, 0.1], [x + 0.04, BALCONY_CEIL, balcony.z1 + 0.1], beam)
  // fascia + posts carrying the balcony roof
  b.block([-0.25, BALCONY_CEIL - 0.25, balcony.z1 + 0.06], [balcony.x1 + 0.12, ROOF_Y, balcony.z1 + 0.2], 'plaster')
  b.block([balcony.x1 - 0.02, BALCONY_CEIL - 0.25, 0.1], [balcony.x1 + 0.12, ROOF_Y, balcony.z1 + 0.2], 'plaster')
  b.block([balcony.x1 - 0.06, 0, balcony.z1 - 0.06], [balcony.x1 + 0.12, BALCONY_CEIL, balcony.z1 + 0.12], 'frameWhite')
  // rough stone pillar at the west end of the balcony (12.8 s)
  b.block([-0.24, 0, balcony.z1 - 0.3], [0.14, BALCONY_CEIL, balcony.z1 + 0.12], 'stone')

  // ── roof slab and the lower storey the flat sits on ───────────────────────
  b.block([-2.2, ROOF_Y, -6.8], [7.35, ROOF_Y + 0.22, balcony.z1 + 0.22], 'concrete')
  b.block([-2.1, LOWER_Y, -6.7], [7.0, -0.02, 0.1], 'plaster')
  // balcony slab edge
  b.block([-0.25, -0.28, 0.1], [balcony.x1 + 0.12, -0.02, balcony.z1 + 0.12], 'concrete')
  b.block([-0.25, LOWER_Y, 0.1], [balcony.x1 + 0.12, -0.28, 0.4], 'plaster')

  return b.build()
}

/** Horizontal finishes only receive shadows; casting them onto themselves causes acne. */
const NO_CAST = new Set(['moroccan', 'floorTiles', 'laminate', 'balconyTiles', 'threshold', 'ceilingWhite', 'woodCeiling'])

export default function House() {
  const mats = getMaterials()
  const geos = useMemo(buildHouse, [])
  useLayoutEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos])
  return (
    <group name="house">
      {Object.entries(geos).map(([key, geo]) => (
        <mesh key={key} geometry={geo} material={mats[key]} castShadow={!NO_CAST.has(key)} receiveShadow matrixAutoUpdate={false} />
      ))}
    </group>
  )
}
