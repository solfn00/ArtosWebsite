import { OPENINGS, ROOMS } from '../../config/layout'
import { GEO } from '../../utils/geometries'
import { getMaterials } from '../../utils/materials'
import { CeilingLight } from './Hallway'
import Highlightable from './Highlightable'
import WindowUnit from './WindowUnit'
import { Box, Cyl, RBox, TiledPlane } from './primitives'

// inner wall faces of the bathroom (x −2.0 … 0, z −2.4 … 0)
const W = ROOMS.bathroom.x0 + 0.1
const E = ROOMS.bathroom.x1 - 0.06
const N = ROOMS.bathroom.z0 + 0.1
const S = ROOMS.bathroom.z1 - 0.1
const BAND = [1.1, 1.34] // patterned tile border height (28 s, 31 s, 33.5 s)

/** Walk-in shower in the south-west corner: two framed glass panels, rail + head. */
function Shower() {
  const mats = getMaterials()
  const gx = -1.05
  const gz = -0.95
  return (
    <group name="shower">
      <Box m="glass" size={[gx - W, 1.95, 0.008]} position={[(W + gx) / 2, 1.0, gz]} />
      <Box m="glass" size={[0.008, 1.95, S - gz]} position={[gx, 1.0, (gz + S) / 2]} />
      {[
        [gx, gz],
        [W + 0.01, gz],
        [gx, S - 0.01],
      ].map(([x, z]) => (
        <Box key={`${x}${z}`} m="chrome" size={[0.025, 1.97, 0.025]} position={[x, 1.0, z]} />
      ))}
      <Box m="chrome" size={[gx - W, 0.025, 0.025]} position={[(W + gx) / 2, 1.97, gz]} />
      <Box m="chrome" size={[0.025, 0.025, S - gz]} position={[gx, 1.97, (gz + S) / 2]} />
      {/* cream towel hung over the sliding panel (28–29 s) */}
      <RBox m="towelCream" size={[0.035, 0.62, 0.5]} r={0.012} position={[gx, 1.68, -0.5]} />
      {/* riser, rain head, hose and mixer on the west wall */}
      <group position={[W + 0.04, 0, -0.52]}>
        <Cyl m="chrome" size={[0.022, 1.0]} position={[0, 1.55, 0]} />
        <Box m="chrome" size={[0.3, 0.02, 0.02]} position={[0.15, 2.05, 0]} />
        <Cyl m="chrome" size={[0.22, 0.02]} position={[0.3, 2.02, 0]} />
        <RBox m="chrome" size={[0.06, 0.08, 0.2]} r={0.02} position={[0.02, 1.05, 0]} />
        <mesh geometry={GEO.torus} material={mats.chrome} position={[0.05, 1.35, 0.06]} scale={[0.25, 0.55, 0.25]} rotation={[0, Math.PI / 2, 0]} />
      </group>
    </group>
  )
}

/** Close-coupled toilet against the west wall, facing the door (26.5–32.5 s). */
function Toilet() {
  return (
    <group position={[W + 0.36, 0, -1.55]} rotation={[0, Math.PI / 2, 0]}>
      <RBox m="ceramic" size={[0.4, 0.38, 0.17]} r={0.04} position={[0, 0.72, -0.28]} />
      <RBox m="ceramic" size={[0.42, 0.04, 0.19]} r={0.015} position={[0, 0.925, -0.28]} />
      <Cyl m="ceramic" size={[0.37, 0.36, 0.5]} position={[0, 0.2, 0.02]} />
      <Cyl m="ceramic" size={[0.38, 0.03, 0.52]} position={[0, 0.41, 0.03]} />
      <Cyl m="ceramic" size={[0.37, 0.025, 0.5]} position={[0, 0.44, 0.02]} rotation={[-0.05, 0, 0]} />
    </group>
  )
}

/** Light-wood vanity with a white ceramic top and a wide mirror above (25.5–31.5 s). */
function Vanity() {
  return (
    <group position={[-0.72, 0, N + 0.23]}>
      <Box m="beigeWood" size={[0.8, 0.72, 0.44]} position={[0, 0.36, 0]} />
      <Box m="blackMetal" size={[0.004, 0.66, 0.004]} position={[0, 0.39, 0.222]} />
      {[-0.06, 0.06].map((x) => (
        <Box key={x} m="steel" size={[0.012, 0.13, 0.012]} position={[x, 0.55, 0.232]} />
      ))}
      <RBox m="ceramic" size={[0.82, 0.12, 0.47]} r={0.025} position={[0, 0.78, 0.01]} />
      <Box m="ceramic" size={[0.5, 0.01, 0.3]} position={[0, 0.845, 0.04]} />
      <group position={[0, 0.84, -0.17]}>
        <Cyl m="chrome" size={[0.045, 0.16]} position={[0, 0.08, 0]} />
        <Box m="chrome" size={[0.03, 0.03, 0.14]} position={[0, 0.15, 0.06]} />
        <Box m="chrome" size={[0.02, 0.02, 0.1]} position={[0, 0.2, -0.02]} rotation={[0.5, 0, 0]} />
      </group>
      <Cyl m="beigeThrow" size={[0.08, 0.1]} position={[-0.28, 0.9, -0.1]} />
      <Cyl m="beigeThrow" size={[0.07, 0.09]} position={[-0.18, 0.895, -0.12]} />
      <Box m="mirror" size={[0.8, 0.72, 0.015]} position={[0, 1.78, -0.22]} />
    </group>
  )
}

export default function Bathroom() {
  const { bathWindow } = OPENINGS
  const band = BAND[1] - BAND[0]
  const bandY = (BAND[0] + BAND[1]) / 2
  return (
    <group name="bathroom">
      {/* patterned tile border around the room */}
      <TiledPlane m="moroccan" size={[E - W, band]} position={[(E + W) / 2, bandY, N + 0.005]} />
      <TiledPlane m="moroccan" size={[E - W, band]} position={[(E + W) / 2, bandY, S - 0.005]} rotation={[0, Math.PI, 0]} />
      <TiledPlane m="moroccan" size={[S - N, band]} position={[W + 0.005, bandY, (S + N) / 2]} rotation={[0, Math.PI / 2, 0]} />
      <TiledPlane m="moroccan" size={[S - N, band]} position={[E - 0.005, bandY, (S + N) / 2]} rotation={[0, -Math.PI / 2, 0]} />

      <Shower />
      <Toilet />
      <Vanity />
      {/* toilet-roll holder, brush, small bin */}
      <Cyl m="chrome" size={[0.02, 0.14]} position={[W + 0.05, 0.72, -1.95]} rotation={[Math.PI / 2, 0, 0]} />
      <Cyl m="ceramic" size={[0.11, 0.1]} position={[W + 0.05, 0.72, -2.0]} rotation={[Math.PI / 2, 0, 0]} />
      <Cyl m="whiteMatte" size={[0.1, 0.35]} position={[W + 0.1, 0.175, -1.12]} />
      <Cyl m="rattan" size={[0.2, 0.26]} position={[W + 0.12, 0.13, -2.12]} />
      {/* coat hooks on the door wall (seen in the mirror, 30.5 s) */}
      <Box m="oak" size={[0.03, 0.06, 0.5]} position={[E - 0.015, 1.72, -0.8]} />
      <Highlightable strength={0.08}>
        <RBox m="charcoal" size={[0.12, 0.8, 0.34]} r={0.05} position={[E - 0.09, 1.3, -0.95]} />
        <RBox m="beigeThrow" size={[0.12, 0.72, 0.3]} r={0.05} position={[E - 0.1, 1.33, -0.65]} />
      </Highlightable>

      <WindowUnit
        position={[(bathWindow.from + bathWindow.to) / 2, bathWindow.bottom, 0]}
        width={bathWindow.to - bathWindow.from}
        height={bathWindow.top - bathWindow.bottom}
      />
      <CeilingLight position={[-1.0, 0, -1.2]} size={0.32} />
    </group>
  )
}
