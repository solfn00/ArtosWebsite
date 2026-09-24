import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DOOR_DEFS } from '../../config/layout'
import { navState, scrollState } from '../../state/scrollStore'
import { clamp01, damp, easeInOutCubic } from '../../utils/interpolation'
import { Box, Cyl } from './primitives'
import Highlightable from './Highlightable'

/**
 * A hinged interior/exterior door (white, 3 grooves, lever + key rosette, as
 * in the footage). Geometry and timing come from DOOR_DEFS in config/layout.js.
 *
 * Local frame: origin at the hinge on the floor, +x runs across the opening
 * towards the latch, z is the wall-thickness direction.
 * In scroll mode the leaf follows the timeline; in walk mode every door stands
 * open so the flat can be explored freely.
 */
export default function Door({ id, height = 2.03 }) {
  const leaf = useRef()
  const current = useRef(0)
  const cfg = DOOR_DEFS[id]
  const { hinge, rotation, width, depth, angle } = cfg

  useFrame((_, dt) => {
    const [t0, t1] = cfg.open
    const scripted = easeInOutCubic(clamp01((scrollState.videoTime - t0) / (t1 - t0)))
    const target = navState.mode === 'walk' ? 1 : scripted
    current.current = navState.mode === 'walk' ? damp(current.current, target, 4, Math.min(dt, 0.05)) : target
    leaf.current.rotation.y = angle * current.current
  })

  const lw = width - 0.02
  const frameDepth = depth + 0.03
  return (
    <group position={[hinge[0], 0, hinge[1]]} rotation={[0, rotation, 0]}>
      {/* frame: two jambs + head, slightly proud of the wall on both faces */}
      <Box m="frameWhite" size={[0.05, height + 0.05, frameDepth]} position={[-0.025, (height + 0.05) / 2, 0]} />
      <Box m="frameWhite" size={[0.05, height + 0.05, frameDepth]} position={[width + 0.025, (height + 0.05) / 2, 0]} />
      <Box m="frameWhite" size={[width + 0.1, 0.05, frameDepth]} position={[width / 2, height + 0.025, 0]} />

      <group ref={leaf}>
        <Highlightable strength={0.1}>
          <Box m="door" size={[lw, height - 0.01, 0.042]} position={[0.01 + lw / 2, height / 2, 0]} />
          {/* lever handles and key rosettes on both faces */}
          {[1, -1].map((s) => (
            <group key={s} position={[lw - 0.07, 1.0, s * 0.027]}>
              <Cyl m="steel" size={[0.052, 0.012]} rotation={[Math.PI / 2, 0, 0]} />
              <Box m="steel" size={[0.022, 0.022, 0.05]} position={[0, 0, s * 0.025]} />
              <Box m="steel" size={[0.13, 0.019, 0.022]} position={[-0.055, 0, s * 0.05]} />
              <Cyl m="steel" size={[0.045, 0.01]} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.13, 0]} />
            </group>
          ))}
        </Highlightable>
      </group>
    </group>
  )
}
