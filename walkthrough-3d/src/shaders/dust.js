/**
 * Floating dust motes. Each particle orbits its seed position with its own phase;
 * `uVelocity` (damped scroll speed) stirs them so walking faster kicks up air.
 */
export const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uVelocity;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute vec4 aSeed; // xyz = phase offsets, w = size jitter
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float t = uTime * 0.25;
    float stir = 1.0 + uVelocity * 4.0;
    p.x += sin(t * 1.3 + aSeed.x * 6.28) * 0.12 * stir;
    p.y += sin(t * 0.9 + aSeed.y * 6.28) * 0.09 + uVelocity * aSeed.w * 0.35;
    p.z += cos(t * 1.1 + aSeed.z * 6.28) * 0.12 * stir;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;
    gl_PointSize = uSize * (0.5 + aSeed.w) * uPixelRatio / max(dist, 0.3);
    // fade when very close (avoid big blobs) and with distance
    vAlpha = smoothstep(0.25, 0.9, dist) * (1.0 - smoothstep(6.0, 12.0, dist));
    vAlpha *= 0.55 + 0.45 * sin(uTime * 0.8 + aSeed.x * 20.0);
  }
`

export const dustFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * a * vAlpha * uOpacity);
  }
`
