import { Effect } from 'postprocessing'
import { Uniform } from 'three'

/**
 * Linear exposure applied to the HDR buffer *before* bloom and tone mapping, so
 * the camera's auto-exposure (and the final walk into the sunlight) also drives
 * how much the highlights bloom. Runs in its own pass (see Effects.jsx).
 */
const fragment = /* glsl */ `
  uniform float exposure;
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    outputColor = vec4(inputColor.rgb * exposure, inputColor.a);
  }
`

export class ExposureEffect extends Effect {
  constructor({ exposure = 1 } = {}) {
    super('ExposureEffect', fragment, { uniforms: new Map([['exposure', new Uniform(exposure)]]) })
  }
  set exposure(v) {
    this.uniforms.get('exposure').value = v
  }
  get exposure() {
    return this.uniforms.get('exposure').value
  }
}
