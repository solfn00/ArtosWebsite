import { useLayoutEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { QUALITY } from '../../config/quality'
import { dustFragment, dustVertex } from '../../shaders/dust'
import { scrollState } from '../../state/scrollStore'

/** Sun-lit dust drifting through the terrace and the rooms. */
export default function DustParticles() {
  const dpr = useThree((s) => s.viewport.dpr)
  const count = QUALITY.particles

  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      // 30 % under the balcony roof, the rest spread through the rooms
      const outside = i < count * 0.3
      pos[i * 3] = outside ? Math.random() * 7.1 : -1.9 + Math.random() * 8.7
      pos[i * 3 + 1] = 0.2 + Math.random() * 2.2
      pos[i * 3 + 2] = outside ? 0.2 + Math.random() * 1.9 : -6.5 + Math.random() * 6.4
      seed.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4))
    return g
  }, [count])

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: dustVertex,
        fragmentShader: dustFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uVelocity: { value: 0 },
          uPixelRatio: { value: 1 },
          uSize: { value: 26 },
          uColor: { value: new THREE.Color('#fff1d6') },
          uOpacity: { value: 0.3 },
        },
      }),
    [],
  )

  useLayoutEffect(
    () => () => {
      geo.dispose()
      mat.dispose()
    },
    [geo, mat],
  )

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime
    mat.uniforms.uVelocity.value = Math.min(1, Math.abs(scrollState.smoothVelocity) / 40)
    mat.uniforms.uPixelRatio.value = dpr
  })

  return <points geometry={geo} material={mat} frustumCulled={false} />
}
