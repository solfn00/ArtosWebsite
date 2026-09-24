import { OPENINGS, ROOMS, WALL_H } from '../../config/layout'
import Highlightable from './Highlightable'
import WindowUnit from './WindowUnit'
import { Box, Cyl, Plane, RBox, Sphere } from './primitives'

// inner faces of the bedroom (x 2.0 … 5.6, z −6.6 … −3.3)
const W = ROOMS.bedroom.x0 + 0.08
const E = ROOMS.bedroom.x1 - 0.1
const N = ROOMS.bedroom.z0 + 0.1

/**
 * Double bed, headboard against the mauve north wall (41.5–46.5 s): wooden
 * frame with a brass edge and black legs (39 s), beige cover with a charcoal
 * runner across the foot, black-and-white striped pillows.
 */
function Bed() {
  const x0 = 2.75
  const x1 = 4.25
  const z0 = N
  const z1 = N + 2.0
  const cx = (x0 + x1) / 2
  const cz = (z0 + z1) / 2
  return (
    <Highlightable strength={0.08}>
      <group name="bed">
        {[
          [x0 + 0.05, z1 - 0.05],
          [x1 - 0.05, z1 - 0.05],
          [x0 + 0.05, z0 + 0.1],
          [x1 - 0.05, z0 + 0.1],
        ].map(([x, z]) => (
          <Cyl key={`${x}${z}`} m="black" size={[0.035, 0.14]} position={[x, 0.07, z]} low />
        ))}
        <Box m="oak" size={[x1 - x0, 0.2, z1 - z0]} position={[cx, 0.24, cz]} />
        <Box m="rattan" size={[x1 - x0 + 0.01, 0.02, 0.012]} position={[cx, 0.3, z1 + 0.001]} />
        <Box m="oak" size={[x1 - x0, 0.75, 0.05]} position={[cx, 0.52, z0 + 0.02]} />
        <RBox m="linen" size={[x1 - x0 - 0.06, 0.2, z1 - z0 - 0.1]} r={0.05} position={[cx, 0.44, cz + 0.02]} />
        {/* beige cover draping over the sides, charcoal runner at the foot */}
        <RBox m="beigeThrow" size={[x1 - x0 + 0.06, 0.24, 1.55]} r={0.05} position={[cx, 0.44, z1 - 0.76]} />
        <RBox m="charcoal" size={[x1 - x0 + 0.08, 0.25, 0.45]} r={0.05} position={[cx, 0.445, z1 - 0.3]} />
        {/* pillows: striped fronts, beige behind */}
        {[cx - 0.36, cx + 0.36].map((x) => (
          <group key={x}>
            <RBox m="beigeThrow" size={[0.62, 0.36, 0.14]} r={0.06} position={[x, 0.72, z0 + 0.14]} rotation={[-0.3, 0, 0]} />
            <RBox m="stripes" size={[0.6, 0.34, 0.13]} r={0.06} position={[x, 0.68, z0 + 0.3]} rotation={[-0.35, 0, 0]} />
          </group>
        ))}
      </group>
    </Highlightable>
  )
}

/** Floating white bedside shelf with a lamp; blue triangular sconce above. */
function Bedside({ x, lamp }) {
  return (
    <group position={[x, 0, N + 0.16]}>
      <Box m="whiteMatte" size={[0.4, 0.04, 0.3]} position={[0, 0.58, 0]} />
      {lamp && (
        <group position={[0, 0.6, 0.02]}>
          <Cyl m="rattan" size={[0.08, 0.1]} position={[0, 0.05, 0]} />
          <Sphere m="lampShade" size={[0.2, 0.18, 0.2]} position={[0, 0.18, 0]} />
        </group>
      )}
      <mesh position={[0, 1.35, -0.08]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.12, 0.2, 3, 1, true]} />
        <meshStandardMaterial color="#2e62b8" emissive="#ffb467" emissiveIntensity={0.25} side={2} roughness={0.6} />
      </mesh>
    </group>
  )
}

/** White lattice-door wardrobe beside the door, with a dried-flower garland (42.5–47 s). */
function LatticeWardrobe() {
  const z0 = -4.42
  const z1 = -5.75
  const cz = (z0 + z1) / 2
  return (
    <group>
      <Box m="whiteMatte" size={[0.52, 2.05, z0 - z1]} position={[W + 0.26, 1.025, cz]} />
      {[cz + 0.33, cz - 0.33].map((z) => (
        <Plane key={z} m="lattice" size={[0.62, 1.9]} position={[W + 0.522, 1.03, z]} rotation={[0, Math.PI / 2, 0]} />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <Sphere
          key={i}
          m={i % 3 ? 'driedFlower' : 'foliageDark'}
          size={[0.045, 0.045, 0.045]}
          position={[W + 0.55, 2.0 - i * 0.14, z1 - 0.04 + Math.sin(i) * 0.02]}
        />
      ))}
    </group>
  )
}

export default function Bedroom() {
  const { bedWindow } = OPENINGS
  return (
    <group name="bedroom">
      <Bed />
      <Bedside x={2.42} lamp />
      <Bedside x={4.58} />
      <LatticeWardrobe />
      {/* small blue seascape prints above the bed */}
      {[3.15, 3.85].map((x) => (
        <group key={x} position={[x, 1.55, N + 0.012]}>
          <Box m="frameWhite" size={[0.36, 0.26, 0.02]} />
          <Plane m="picture" size={[0.3, 0.2]} position={[0, 0, 0.011]} />
        </group>
      ))}
      {/* large seascape on the east wall next to the window (41–45 s) */}
      <group position={[E - 0.012, 1.6, -3.85]} rotation={[0, -Math.PI / 2, 0]}>
        <Box m="frameWhite" size={[0.95, 0.68, 0.025]} />
        <Plane m="picture" size={[0.86, 0.6]} position={[0, 0, 0.014]} />
      </group>
      {/* white panel heater under the window, wicker basket on a stool in the SE corner */}
      <RBox m="whiteMatte" size={[0.08, 0.45, 0.9]} r={0.015} position={[E - 0.05, 0.45, (bedWindow.from + bedWindow.to) / 2]} />
      <group position={[E - 0.25, 0, -3.65]}>
        <Cyl m="whiteMatte" size={[0.34, 0.03]} position={[0, 0.5, 0]} />
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            m="blackMetal"
            size={[0.015, 0.5, 0.015]}
            position={[Math.cos((i * 2 * Math.PI) / 3) * 0.12, 0.25, Math.sin((i * 2 * Math.PI) / 3) * 0.12]}
          />
        ))}
        <Cyl m="rattan" size={[0.3, 0.2]} position={[0, 0.62, 0]} />
        <RBox m="burgundy" size={[0.24, 0.06, 0.2]} r={0.02} position={[0, 0.73, 0]} />
        <Box m="rattan" size={[0.02, 0.3, 0.02]} position={[0, 0.85, 0]} />
      </group>

      <WindowUnit
        position={[ROOMS.bedroom.x1, bedWindow.bottom, (bedWindow.from + bedWindow.to) / 2]}
        rotation={Math.PI / 2}
        width={bedWindow.to - bedWindow.from}
        height={bedWindow.top - bedWindow.bottom}
        blind="romanBlind"
        blindDrop={0.6}
      />
      {/* white fabric pendant (44 s) */}
      <group position={[3.8, WALL_H, -4.9]}>
        <Cyl m="whiteMatte" size={[0.01, 0.35]} position={[0, -0.18, 0]} />
        <Sphere m="paperLamp" size={[0.42, 0.26, 0.42]} position={[0, -0.45, 0]} />
      </group>
    </group>
  )
}
