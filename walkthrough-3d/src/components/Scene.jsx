import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerformanceMonitor, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { PALETTE } from '../config/layout'
import { DEBUG_FREE, QUALITY } from '../config/quality'
import Camera, { CameraPath } from './Camera'
import ScrollController from './ScrollController'
import Lighting from './Lighting'
import Effects from './Effects'
import House from './Objects/House'
import Railings from './Objects/Railings'
import Balcony from './Objects/Balcony'
import Hallway from './Objects/Hallway'
import Bathroom from './Objects/Bathroom'
import Bedroom from './Objects/Bedroom'
import LivingRoom from './Objects/LivingRoom'
import WalkControls from './WalkControls'
import Landscape from './Objects/Landscape'
import DustParticles from './Objects/DustParticles'
import { disposeMaterials } from '../utils/materials'
import { disposeTextures } from '../textures/procedural'
import { disposeGeometries } from '../utils/geometries'

/**
 * Pre-compiles every shader program behind the loading cover, waits a few
 * frames for the shadow map and environment to settle, then reports ready.
 */
function ReadySignal({ onReady }) {
  const { gl, scene, camera } = useThree()
  const frames = useRef(0)
  const done = useRef(false)
  useLayoutEffect(() => {
    gl.compile(scene, camera)
    // upload every texture now, so no room stalls the first time it comes into view
    const seen = new Set()
    scene.traverse((o) => {
      const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []
      mats.forEach((m) => {
        ;['map', 'bumpMap', 'emissiveMap', 'normalMap', 'roughnessMap'].forEach((k) => {
          const t = m[k]
          if (t && !seen.has(t)) {
            seen.add(t)
            gl.initTexture(t)
          }
        })
      })
    })
  }, [gl, scene, camera])
  useFrame(() => {
    if (done.current) return
    if (++frames.current > 4) {
      done.current = true
      onReady?.()
    }
  })
  return null
}

function World() {
  return (
    <>
      <Landscape />
      <House />
      <Railings />
      <Balcony />
      <Hallway />
      <Bathroom />
      <Bedroom />
      <LivingRoom />
      <DustParticles />
    </>
  )
}

/** Device pixel ratio, capped by the quality tier. */
const maxDpr = () => Math.min(window.devicePixelRatio || 1, QUALITY.dpr[1])

export default function Scene({ onReady }) {
  const [dpr, setDpr] = useState(maxDpr)

  // release every GPU resource we generated when the scene unmounts
  useEffect(
    () => () => {
      disposeMaterials()
      disposeTextures()
      disposeGeometries()
    },
    [],
  )

  return (
    <Canvas
      className="webgl"
      dpr={dpr}
      shadows={{ enabled: true, type: THREE.PCFShadowMap }}
      flat
      eventSource={document.getElementById('root')}
      eventPrefix="client"
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace
      }}
    >
      <fogExp2 attach="fog" args={[PALETTE.horizon, 0.0007]} />
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr(Math.max(1, maxDpr() * 0.75))}
        onIncline={() => setDpr(maxDpr())}
        onFallback={() => setDpr(1)}
      />
      <ScrollController />
      {DEBUG_FREE ? (
        <>
          <PerspectiveCamera makeDefault position={[16, 22, 26]} fov={45} far={3000} />
          <OrbitControls target={[0, 0, 0]} makeDefault />
          <CameraPath />
        </>
      ) : (
        <>
          <Camera />
          <WalkControls />
        </>
      )}
      <Lighting />
      <Suspense fallback={null}>
        <World />
        <ReadySignal onReady={onReady} />
      </Suspense>
      <Effects />
    </Canvas>
  )
}
