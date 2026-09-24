import { OPENINGS, ROOMS, WALL_H } from '../../config/layout'
import { GEO } from '../../utils/geometries'
import { getMaterials } from '../../utils/materials'
import Door from './Door'
import Highlightable from './Highlightable'
import { Box, Cyl, Plane, RBox, Sphere, TiledPlane } from './primitives'

/** Recessed LED ceiling disc (the round fixtures seen overhead). */
export function CeilingLight({ position, size = 0.3, y = WALL_H }) {
  return (
    <group position={position}>
      <Cyl m="whiteMatte" size={[size + 0.04, 0.02]} position={[0, y - 0.01, 0]} />
      <Cyl m="lightPanel" size={[size, 0.03]} position={[0, y - 0.03, 0]} />
    </group>
  )
}

// kitchen alcove (x −2.0 … 0, z −4.4 … −2.4): run on the west wall, return on the north wall
const K = ROOMS.kitchen
const WX = K.x0 + 0.1 // west wall face
const NZ = K.z0 + 0.1 // north wall face
const SZ = K.z1 - 0.06 // bathroom partition face
const TOP = 0.9
const RUN = SZ - NZ // length of the west run (≈1.84 m)

function BarHandle({ position, vertical = true }) {
  return <Box m="steel" size={vertical ? [0.012, 0.14, 0.012] : [0.14, 0.012, 0.012]} position={position} />
}

/** L-shaped kitchenette in its alcove (22–24.5 s, 62.8 s). */
function Kitchen() {
  const zDrawer = SZ - 0.22
  const zSink = SZ - 0.44 - 0.4
  const zCorner = NZ + 0.3
  return (
    <group name="kitchenette">
      {/* 4-drawer unit with round white knobs, right past the bathroom door jamb */}
      <group position={[WX + 0.3, 0, zDrawer]}>
        <Box m="whiteMatte" size={[0.58, TOP - 0.04, 0.44]} position={[0, (TOP - 0.04) / 2, 0]} />
        {[0.14, 0.34, 0.54, 0.74].map((y) => (
          <group key={y}>
            <Box m="whiteMatte" size={[0.01, 0.18, 0.4]} position={[0.295, y, 0]} />
            <Sphere m="ceramic" size={[0.035, 0.035, 0.035]} position={[0.31, y, 0]} />
          </group>
        ))}
      </group>
      {/* sink base (two doors, vertical bar handles) + corner base */}
      <Box m="whiteMatte" size={[0.58, TOP - 0.04, 0.8]} position={[WX + 0.3, (TOP - 0.04) / 2, zSink]} />
      <Box m="blackMetal" size={[0.005, 0.78, 0.004]} position={[WX + 0.592, 0.45, zSink]} />
      <BarHandle position={[WX + 0.6, 0.72, zSink + 0.06]} />
      <BarHandle position={[WX + 0.6, 0.72, zSink - 0.06]} />
      <Box m="whiteMatte" size={[0.58, TOP - 0.04, 0.6]} position={[WX + 0.3, (TOP - 0.04) / 2, zCorner]} />
      {/* return along the north wall */}
      <Box m="whiteMatte" size={[0.75, TOP - 0.04, 0.58]} position={[WX + 0.975, (TOP - 0.04) / 2, NZ + 0.3]} />
      <BarHandle position={[WX + 0.975, 0.72, NZ + 0.6]} vertical={false} />
      {/* oak worktop (L) */}
      <Box m="oak" size={[0.62, 0.035, RUN + 0.02]} position={[WX + 0.31, TOP - 0.02, (SZ + NZ) / 2]} shadow />
      <Box m="oak" size={[0.76, 0.035, 0.62]} position={[WX + 0.98, TOP - 0.02, NZ + 0.31]} />
      {/* white tiled splash-back */}
      <TiledPlane m="bathTiles" size={[RUN, 0.55]} position={[WX + 0.004, TOP + 0.275, (SZ + NZ) / 2]} rotation={[0, Math.PI / 2, 0]} />
      <TiledPlane m="bathTiles" size={[1.35, 0.55]} position={[WX + 0.675, TOP + 0.275, NZ + 0.004]} />
      {/* stainless sink + arched mixer */}
      <Box m="steel" size={[0.42, 0.012, 0.52]} position={[WX + 0.32, TOP + 0.002, zSink]} />
      <Box m="blackMetal" size={[0.36, 0.004, 0.44]} position={[WX + 0.32, TOP + 0.008, zSink]} />
      <group position={[WX + 0.08, TOP, zSink]}>
        <Cyl m="chrome" size={[0.035, 0.3]} position={[0, 0.15, 0]} />
        <Cyl m="chrome" size={[0.025, 0.2]} position={[0.09, 0.29, 0]} rotation={[0, 0, Math.PI / 2]} />
      </group>
      {/* black wire dish rack, utensil pot, soap bottle, kettle, coffee maker */}
      <group position={[WX + 0.3, TOP, zDrawer]}>
        {[-0.12, 0, 0.12].map((z) => (
          <Box key={z} m="blackMetal" size={[0.36, 0.006, 0.006]} position={[0, 0.02, z]} />
        ))}
        {[-0.14, 0.14].map((x) => (
          <Box key={x} m="blackMetal" size={[0.006, 0.34, 0.3]} position={[x, 0.17, 0]} />
        ))}
        {[-0.06, 0, 0.06].map((x) => (
          <Cyl key={x} m="ceramic" size={[0.2, 0.012]} position={[x, 0.14, 0]} rotation={[0, 0, Math.PI / 2]} />
        ))}
      </group>
      <Cyl m="steel" size={[0.1, 0.14]} position={[WX + 0.14, TOP + 0.07, zSink + 0.32]} />
      <Cyl m="paleBlue" size={[0.05, 0.16]} position={[WX + 0.16, TOP + 0.08, zSink + 0.22]} />
      <Cyl m="steel" size={[0.16, 0.26]} position={[WX + 0.18, TOP + 0.13, zCorner - 0.05]} />
      <Cyl m="black" size={[0.1, 0.22]} position={[WX + 0.2, TOP + 0.11, zCorner + 0.15]} />
      {/* portable double hot plate on the return */}
      <group position={[WX + 1.0, TOP, NZ + 0.28]}>
        <RBox m="steel" size={[0.5, 0.06, 0.3]} r={0.01} position={[0, 0.03, 0]} />
        {[-0.12, 0.12].map((x) => (
          <Cyl key={x} m="blackGlass" size={[0.17, 0.012]} position={[x, 0.065, 0]} />
        ))}
      </group>
      {/* white wall cupboards above the sink */}
      <group position={[WX + 0.17, 0, zSink - 0.05]}>
        <Box m="whiteMatte" size={[0.33, 0.68, 1.2]} position={[0, 1.83, 0]} />
        <Box m="blackMetal" size={[0.005, 0.64, 0.004]} position={[0.166, 1.83, 0]} />
        <BarHandle position={[0.175, 1.56, -0.06]} />
        <BarHandle position={[0.175, 1.56, 0.06]} />
      </group>
      {/* oak shelf with canisters ("SUGAR", 35.5 s) above the return */}
      <Box m="oak" size={[0.8, 0.03, 0.22]} position={[WX + 0.95, 1.62, NZ + 0.11]} />
      <RBox m="linen" size={[0.12, 0.14, 0.12]} r={0.01} position={[WX + 0.75, 1.705, NZ + 0.11]} />
      <RBox m="linen" size={[0.12, 0.14, 0.12]} r={0.01} position={[WX + 0.9, 1.705, NZ + 0.11]} />
      <Cyl m="glass" size={[0.1, 0.16]} position={[WX + 1.1, 1.71, NZ + 0.11]} />
      {/* striped rug in front of the sink */}
      <Box m="stripeRug" size={[0.55, 0.01, 1.0]} position={[WX + 0.95, 0.005, zSink]} />
    </group>
  )
}

/** Tall pine console in the niche facing the front door, hot plate + utensil rail (16.6–17.4 s). */
function Console() {
  return (
    <group position={[0.52, 0, -4.3 + 0.17]}>
      {[-0.28, 0.28].map((x) =>
        [-0.12, 0.12].map((z) => <Box key={`${x}${z}`} m="pine" size={[0.045, 0.88, 0.045]} position={[x, 0.44, z]} />),
      )}
      <Box m="pine" size={[0.64, 0.03, 0.32]} position={[0, 0.895, 0]} />
      <Box m="pine" size={[0.6, 0.02, 0.28]} position={[0, 0.12, 0]} />
      <RBox m="steel" size={[0.3, 0.05, 0.28]} r={0.01} position={[0.05, 0.935, 0]} />
      <Cyl m="blackGlass" size={[0.18, 0.01]} position={[0.05, 0.962, 0]} />
      <Box m="steel" size={[0.5, 0.012, 0.012]} position={[0, 1.45, -0.15]} />
      {[-0.18, -0.09, 0, 0.09, 0.18].map((x, i) => (
        <Box key={x} m={i % 2 ? 'blackMetal' : 'steel'} size={[0.025, 0.22, 0.008]} position={[x, 1.33, -0.14]} />
      ))}
      <Cyl m="charcoal" size={[0.3, 0.2]} position={[0, 0.23, 0]} />
      <Cyl m="terracotta" size={[0.31, 0.05]} position={[0, 0.355, 0]} />
      <Cyl m="rattan" size={[0.34, 0.02]} position={[0, 1.85, -0.16]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  )
}

/** Ornate scroll-framed round mirror on the hall's west wall (25.2 s, 63 s). */
function OrnateMirror() {
  const mats = getMaterials()
  const scrolls = [0, 1, 2, 3, 4, 5, 6, 7]
  return (
    <Highlightable strength={0.12}>
      <group position={[0.075, 1.55, -0.85]} rotation={[0, Math.PI / 2, 0]} scale={1.5}>
        <Cyl m="mirror" size={[0.22, 0.01]} rotation={[Math.PI / 2, 0, 0]} />
        <mesh geometry={GEO.torus} material={mats.steel} scale={[0.24, 0.24, 0.3]} />
        {scrolls.map((i) => {
          const a = (i / scrolls.length) * Math.PI * 2
          return (
            <mesh
              key={i}
              geometry={GEO.torus}
              material={mats.steel}
              position={[Math.cos(a) * 0.19, Math.sin(a) * 0.23, 0]}
              scale={[0.09, 0.09, 0.2]}
            />
          )
        })}
      </group>
    </Highlightable>
  )
}

export default function Hallway() {
  const { livingDoor } = OPENINGS
  return (
    <group name="hallway">
      <Kitchen />
      <Console />
      <OrnateMirror />
      {/* two ceramic plates on the short wall between the living-room and bedroom doors */}
      <Plane m="plate" size={[0.24, 0.24]} position={[1.935, 2.2, -3.3]} rotation={[0, -Math.PI / 2, 0]} />
      <Plane m="plate" size={[0.2, 0.2]} position={[1.935, 1.85, -3.3]} rotation={[0, -Math.PI / 2, 0]} />
      <Box m="frameWhite" size={[0.015, 0.08, 0.08]} position={[1.935, 1.25, -3.3]} />
      {/* large gold-framed painting beside the living-room door (20.3 s) */}
      <group position={[1.935, 1.55, (livingDoor.to + 0) / 2 - 0.1]} rotation={[0, -Math.PI / 2, 0]}>
        <Box m="rattan" size={[0.95, 0.7, 0.03]} />
        <Plane m="painting" size={[0.85, 0.6]} position={[0, 0, 0.016]} />
      </group>
      {/* blue woven bag on the floor by the front door (48 s) */}
      <Highlightable strength={0.14}>
        <RBox m="ikeaBlue" size={[0.45, 0.32, 0.3]} r={0.05} position={[1.68, 0.16, -0.4]} rotation={[0, 0.3, 0.05]} />
      </Highlightable>
      <CeilingLight position={[1.0, 0, -0.45]} size={0.18} y={WALL_H - 0.28} />
      <CeilingLight position={[1.0, 0, -2.0]} />
      <CeilingLight position={[0.9, 0, -3.6]} />
      <CeilingLight position={[-0.95, 0, -3.4]} size={0.26} />

      <Door id="bathroom" />
      <Door id="living" />
      <Door id="bedroom" />
    </group>
  )
}
