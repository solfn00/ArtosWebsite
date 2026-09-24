import { useLayoutEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, EffectGroup, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { QUALITY } from '../config/quality'
import { cameraState } from '../state/scrollStore'
import { ExposureEffect } from '../shaders/ExposureEffect'

/**
 * Post stack, deliberately restrained:
 *  N8AO      contact shadows in corners / under furniture (desktop only)
 *  Exposure  auto-exposure from the camera track (own pass → feeds bloom)
 *  Bloom     lamp shades, windows and the final sunlight only (high threshold)
 *  AgX       filmic tone mapping
 *  Vignette  subtle lens falloff
 */
export default function Effects() {
  const exposure = useMemo(() => new ExposureEffect(), [])
  useLayoutEffect(() => () => exposure.dispose(), [exposure])

  useFrame(() => {
    exposure.exposure = cameraState.exposure
  })

  return (
    <EffectComposer multisampling={QUALITY.msaa} stencilBuffer={false}>
      {QUALITY.ao ? <N8AO aoRadius={0.55} intensity={2.2} distanceFalloff={0.8} halfRes quality="medium" /> : <></>}
      <EffectGroup>
        <primitive object={exposure} />
      </EffectGroup>
      <Bloom mipmapBlur intensity={0.55} luminanceThreshold={1.0} luminanceSmoothing={0.25} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Vignette offset={0.28} darkness={0.5} />
    </EffectComposer>
  )
}
