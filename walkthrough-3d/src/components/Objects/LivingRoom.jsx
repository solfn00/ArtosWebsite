import { OPENINGS, ROOMS, WALL_H } from '../../config/layout'
import Highlightable from './Highlightable'
import WindowUnit from './WindowUnit'
import { Box, Cyl, Plane, RBox, Sphere } from './primitives'

// inner faces of the living room (x 2.0 … 6.9, z −3.3 … 0)
const W = ROOMS.living.x0 + 0.06
const E = ROOMS.living.x1 - 0.1
const N = ROOMS.living.z0 + 0.06
const S = ROOMS.living.z1 - 0.1

/** Burgundy daybed along the east wall under the zebra window (50.5–56 s). */
function Daybed() {
  return (
    <Highlightable strength={0.08}>
      <group position={[E - 0.44, 0, -1.15]} rotation={[0, Math.PI / 2, 0]}>
        <RBox m="burgundy" size={[1.95, 0.4, 0.86]} r={0.05} position={[0, 0.2, 0]} />
        <RBox m="linen" size={[1.1, 0.12, 0.72]} r={0.06} position={[0.35, 0.44, 0.02]} rotation={[0.02, 0.08, 0.02]} />
        <RBox m="linen" size={[0.6, 0.1, 0.5]} r={0.05} position={[0.55, 0.53, 0.05]} rotation={[0, -0.25, 0.05]} />
        <RBox m="mustard" size={[0.5, 0.4, 0.14]} r={0.07} position={[-0.6, 0.6, 0.3]} rotation={[0.25, 0.1, 0]} />
        <RBox m="mustard" size={[0.5, 0.4, 0.14]} r={0.07} position={[-0.72, 0.52, -0.05]} rotation={[-1.2, 0.3, 0]} />
      </group>
    </Highlightable>
  )
}

/** White mini-fridge with the cream retro oven on top, against the east wall facing the door (19 s, 52–60 s). */
function FridgeCorner() {
  return (
    <group position={[E - 0.27, 0, -2.5]} rotation={[0, Math.PI, 0]}>
      <RBox m="whiteMatte" size={[0.5, 0.84, 0.52]} r={0.02} position={[0, 0.42, 0]} />
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} m="greyShelf" size={[0.005, 0.012, 0.12]} position={[0.252, 0.18 + i * 0.03, -0.12]} />
      ))}
      <Highlightable strength={0.1}>
        <group position={[0, 0.84, 0]}>
          <RBox m="creamPlastic" size={[0.44, 0.27, 0.36]} r={0.03} position={[0, 0.14, 0]} />
          <Box m="blackGlass" size={[0.005, 0.16, 0.24]} position={[0.222, 0.14, -0.03]} />
          {[0.07, 0.13].map((z) => (
            <Cyl key={z} m="steel" size={[0.03, 0.01]} position={[0.225, 0.2, z]} rotation={[0, 0, Math.PI / 2]} />
          ))}
        </group>
      </Highlightable>
    </group>
  )
}

/** Low light-wood TV stand in the north-east corner, flat TV, egg-shaped rattan lamp (56–61 s). */
function TvCorner() {
  return (
    <group position={[5.6, 0, N + 0.22]} rotation={[0, Math.PI, 0]}>
      <Box m="beigeWood" size={[1.1, 0.42, 0.4]} position={[0, 0.21, 0]} />
      <Box m="greyShelf" size={[0.5, 0.005, 0.35]} position={[-0.2, 0.2, 0.001]} />
      <Highlightable strength={0.06}>
        <group position={[-0.05, 0.42, 0]} rotation={[0, 0.25, 0]}>
          <Box m="black" size={[0.1, 0.02, 0.22]} position={[0, 0.01, 0]} />
          <Box m="black" size={[1.0, 0.6, 0.05]} position={[0, 0.34, 0]} />
          <Box m="blackGlass" size={[0.96, 0.56, 0.005]} position={[0, 0.34, -0.028]} />
        </group>
      </Highlightable>
      <Sphere m="rattan" size={[0.22, 0.32, 0.22]} position={[0.42, 0.58, 0.02]} />
    </group>
  )
}

/** Oak-topped table with white legs and two white chairs in the corner by the first facade window (49.5–54 s). */
function DiningCorner() {
  const tx = W + 0.4
  const tz = S - 0.42
  const chair = (pos, rot) => (
    <group position={pos} rotation={[0, rot, 0]}>
      {[-0.19, 0.19].map((x) =>
        [-0.18, 0.18].map((z) => <Box key={`${x}${z}`} m="whiteMatte" size={[0.025, 0.45, 0.025]} position={[x, 0.225, z]} />),
      )}
      <Box m="whiteMatte" size={[0.42, 0.03, 0.42]} position={[0, 0.45, 0]} />
      <RBox m="paleBlue" size={[0.38, 0.04, 0.38]} r={0.015} position={[0, 0.485, 0]} />
      {[-0.19, 0.19].map((x) => (
        <Box key={x} m="whiteMatte" size={[0.025, 0.42, 0.025]} position={[x, 0.68, -0.19]} />
      ))}
      {[0.62, 0.78].map((y) => (
        <Box key={y} m="whiteMatte" size={[0.4, 0.06, 0.02]} position={[0, y, -0.19]} />
      ))}
    </group>
  )
  return (
    <group name="dining">
      {[-0.33, 0.33].map((dx) =>
        [-0.33, 0.33].map((dz) => (
          <Box key={`${dx}${dz}`} m="whiteMatte" size={[0.04, 0.73, 0.04]} position={[tx + dx, 0.365, tz + dz]} />
        )),
      )}
      <Box m="oak" size={[0.75, 0.035, 0.75]} position={[tx, 0.745, tz]} />
      <Box m="whiteMatte" size={[0.12, 0.2, 0.05]} position={[tx, 0.86, tz]} />
      {chair([tx + 0.62, 0, tz], -Math.PI / 2)}
      {chair([tx, 0, tz - 0.62], 0)}
    </group>
  )
}

/** Sage-green tub armchair on wooden legs and a white arc floor lamp beside the table (50–54.5 s). */
function Armchair() {
  return (
    <group position={[3.75, 0, S - 0.5]} rotation={[0, Math.PI - 0.3, 0]}>
      {[
        [-0.25, -0.22],
        [0.25, -0.22],
        [-0.25, 0.22],
        [0.25, 0.22],
      ].map(([x, z]) => (
        <Cyl key={`${x}${z}`} m="darkWood" size={[0.035, 0.22]} position={[x, 0.11, z]} rotation={[z * 0.6, 0, -x * 0.6]} low />
      ))}
      <RBox m="sage" size={[0.72, 0.18, 0.66]} r={0.07} position={[0, 0.3, 0.02]} />
      <RBox m="sage" size={[0.72, 0.5, 0.16]} r={0.07} position={[0, 0.58, -0.26]} rotation={[-0.15, 0, 0]} />
      {[-0.33, 0.33].map((x) => (
        <RBox key={x} m="sage" size={[0.12, 0.3, 0.55]} r={0.05} position={[x, 0.5, 0]} />
      ))}
      {/* arc floor lamp */}
      <group position={[-0.55, 0, -0.3]}>
        <Cyl m="whiteMatte" size={[0.25, 0.02]} position={[0, 0.01, 0]} />
        <Cyl m="whiteMatte" size={[0.018, 1.6]} position={[0, 0.8, 0]} />
        <Box m="whiteMatte" size={[0.018, 0.018, 0.4]} position={[0, 1.6, 0.18]} rotation={[0.35, 0, 0]} />
        <Cyl m="lampShade" size={[0.1, 0.08]} position={[0, 1.52, 0.38]} />
      </group>
    </group>
  )
}

export default function LivingRoom() {
  const { eastWindow } = OPENINGS
  return (
    <group name="living-room">
      <Daybed />
      <FridgeCorner />
      <TvCorner />
      <DiningCorner />
      <Armchair />
      {/* grey floating desk with a wicker basket on the north wall, prints and the split AC above (56.5–60.5 s) */}
      <group position={[4.4, 0, N + 0.2]} rotation={[0, Math.PI / 2, 0]}>
        <Box m="greyShelf" size={[0.4, 0.04, 0.8]} position={[0, 0.74, 0]} />
        <Box m="greyShelf" size={[0.04, 0.12, 0.8]} position={[0.18, 0.66, 0]} />
        <RBox m="rattan" size={[0.3, 0.12, 0.4]} r={0.02} position={[-0.02, 0.82, -0.12]} />
        <Box m="whiteMatte" size={[0.05, 0.02, 0.16]} position={[-0.05, 0.77, 0.25]} />
      </group>
      <RBox m="whiteMatte" size={[0.85, 0.28, 0.2]} r={0.03} position={[5.7, 2.18, N + 0.1]} />
      {[4.2, 4.6].map((x) => (
        <group key={x} position={[x, 1.48, N + 0.012]}>
          <Box m="black" size={[0.28, 0.34, 0.02]} />
          <Plane m="linen" size={[0.22, 0.28]} position={[0, 0, 0.011]} />
        </group>
      ))}
      {/* red framed textile print between the facade windows, woven hanging by the door */}
      <group position={[3.6, 1.55, S - 0.012]} rotation={[0, Math.PI, 0]}>
        <Box m="darkWood" size={[0.62, 0.44, 0.025]} />
        <Plane m="pictureRed" size={[0.54, 0.36]} position={[0, 0, 0.014]} />
      </group>
      <group position={[W + 0.012, 1.6, -1.6]} rotation={[0, Math.PI / 2, 0]}>
        <Box m="driftwood" size={[0.4, 0.02, 0.02]} position={[0, 0.3, 0.01]} />
        <Plane m="rattan" size={[0.34, 0.5]} position={[0, 0.02, 0.01]} />
      </group>
      {/* rice-paper pendant: the warm light of this room (20.5–21 s) */}
      <group position={[4.3, WALL_H, -1.6]}>
        <Cyl m="whiteMatte" size={[0.01, 0.5]} position={[0, -0.25, 0]} />
        <Sphere m="paperLamp" size={[0.46, 0.3, 0.46]} position={[0, -0.6, 0]} />
      </group>

      <WindowUnit
        position={[ROOMS.living.x1, eastWindow.bottom, (eastWindow.from + eastWindow.to) / 2]}
        rotation={Math.PI / 2}
        width={eastWindow.to - eastWindow.from}
        height={eastWindow.top - eastWindow.bottom}
        blind="zebraGray"
        blindDrop={0.85}
      />
    </group>
  )
}
