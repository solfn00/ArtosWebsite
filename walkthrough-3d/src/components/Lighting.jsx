import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { PALETTE } from '../config/layout'
import { QUALITY } from '../config/quality'
import { navState, scrollState, cameraState } from '../state/scrollStore'
import { smoothstep } from '../utils/interpolation'
import { SUN_DIR } from './Objects/Landscape'

/**
 * Practical lights, matched to the footage (candela, physical falloff):
 * cool LED discs in the hall and bathroom, the warm rice-paper pendant in the
 * living room (20.5 s), dim warm lamps in the bedroom (42–47 s), the balcony
 * fan light. `essential: false` lights are dropped on the low quality tier.
 */
export const ROOM_LIGHTS = [
  { name: 'hall-front', pos: [1.0, 2.2, -0.45], color: '#f4f2ee', intensity: 2.2, essential: true },
  { name: 'hall-mid', pos: [1.0, 2.35, -2.0], color: '#f4f2ee', intensity: 5.5, essential: true },
  { name: 'kitchen', pos: [-0.95, 2.35, -3.4], color: '#f6f3ec', intensity: 5, essential: true },
  { name: 'bathroom', pos: [-1.0, 2.35, -1.2], color: '#f3f6fb', intensity: 6.5, essential: true },
  { name: 'living-pendant', pos: [4.3, 1.85, -1.6], color: '#ffa860', intensity: 8, essential: true },
  { name: 'living-floorlamp', pos: [4.6, 1.45, -2.4], color: '#ffc58a', intensity: 2, essential: false },
  { name: 'bed-lamp', pos: [2.42, 0.85, -6.25], color: PALETTE.lampWarm, intensity: 3.5, essential: true },
  { name: 'bed-pendant', pos: [3.8, 2.0, -4.9], color: '#ffc58a', intensity: 3, essential: true },
  { name: 'balcony-fan', pos: [3.7, 2.05, 1.15], color: '#fff1dc', intensity: 2.5, essential: false },
]

/**
 * Sky fill is dialled down while the camera is inside, so rooms are lit by
 * their own lamps and windows (as in the video, where the interior reads warm
 * against a grey evening outside). Video seconds: [enter start, enter end,
 * exit start, exit end].
 */
const INDOOR = [16.2, 17.4, 64.0, 65.0]
const AMBIENT = { outdoor: { hemi: 1.15, env: 0.6 }, indoor: { hemi: 0.14, env: 0.22 } }

/** Shadow maps are static except while the front door is swinging. */
const SHADOW_REFRESH_WINDOWS = [[15.0, 16.6]]
const SHADOW_TARGET = [2.5, 0, -1.8]

/** Indoor-ness of the walk-mode camera (inside the building footprint, not on the balcony). */
function walkIndoor(pos) {
  return pos.z < 0 && pos.x > -2.05 && pos.x < 6.95 && pos.z > -6.65 ? 1 : 0
}

export default function Lighting() {
  const sun = useRef()
  const hemi = useRef()
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const frames = useRef(0)
  const lastT = useRef(-1)
  const walkMix = useRef(0)

  useLayoutEffect(() => {
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
    sun.current.target.position.set(...SHADOW_TARGET)
    sun.current.target.updateMatrixWorld()
    return () => {
      gl.shadowMap.autoUpdate = true
    }
  }, [gl])

  useFrame((_, dt) => {
    frames.current++
    const t = scrollState.videoTime
    let indoor = smoothstep(INDOOR[0], INDOOR[1], t) * (1 - smoothstep(INDOOR[2], INDOOR[3], t))
    if (navState.mode === 'walk') {
      walkMix.current += (walkIndoor(camera.position) - walkMix.current) * (1 - Math.exp(-3 * Math.min(dt, 0.1)))
      indoor = walkMix.current
      cameraState.exposure = 1.05 + indoor * 0.45
    } else {
      walkMix.current = indoor
    }
    hemi.current.intensity = AMBIENT.outdoor.hemi + (AMBIENT.indoor.hemi - AMBIENT.outdoor.hemi) * indoor
    scene.environmentIntensity = AMBIENT.outdoor.env + (AMBIENT.indoor.env - AMBIENT.outdoor.env) * indoor

    const inWindow = SHADOW_REFRESH_WINDOWS.some(([a, b]) => t > a && t < b)
    if (frames.current < 4 || (inWindow && Math.abs(t - lastT.current) > 0.01)) {
      gl.shadowMap.needsUpdate = true
      lastT.current = t
    }
  })

  const sunPos = SUN_DIR.clone().multiplyScalar(30).add({ x: SHADOW_TARGET[0], y: 0, z: SHADOW_TARGET[2] })
  const lights = ROOM_LIGHTS.filter((l) => l.essential || QUALITY.extraLights)

  return (
    <>
      <hemisphereLight ref={hemi} args={['#e3e8ec', '#8e8a74', AMBIENT.outdoor.hemi]} />
      {/* overcast: a weak, high sun only for soft contact shadows */}
      <directionalLight
        ref={sun}
        position={sunPos.toArray()}
        color={PALETTE.sun}
        intensity={1.1}
        castShadow
        shadow-mapSize={[QUALITY.shadowMapSize, QUALITY.shadowMapSize]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.04}
        shadow-radius={6}
        shadow-camera-near={2}
        shadow-camera-far={70}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {lights.map((l) => (
        <pointLight key={l.name} position={l.pos} color={l.color} intensity={l.intensity} distance={7} decay={2} />
      ))}

      {/* soft grey-sky studio environment for reflections on chrome, glass and tiles */}
      <Environment resolution={64} frames={1} environmentIntensity={AMBIENT.outdoor.env}>
        <Lightformer form="rect" intensity={2.0} color="#eef1f3" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#dfe6ec" position={[0, 2, 8]} rotation-y={Math.PI} scale={[12, 4, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#ffe6c8" position={[-8, 2, 0]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#ffffff" position={[8, 2, 0]} rotation-y={-Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={0.35} color="#9a9a86" position={[0, -4, 0]} rotation-x={-Math.PI / 2} scale={[12, 12, 1]} />
      </Environment>
    </>
  )
}
