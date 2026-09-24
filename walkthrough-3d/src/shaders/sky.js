/**
 * Gradient sky dome with a soft sun halo. Rendered on a back-faced sphere that
 * ignores fog and depth, so it always sits behind the landscape.
 */
export const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * p;
    gl_Position.z = gl_Position.w; // push to the far plane
  }
`

export const skyFragment = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uGround;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  varying vec3 vDir;
  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 col = mix(uHorizon, uZenith, smoothstep(0.0, 0.55, h));
    col = mix(col, uGround, smoothstep(0.0, -0.25, h));
    float s = max(dot(d, normalize(uSunDir)), 0.0);
    col += uSunColor * (pow(s, 900.0) * 6.0 + pow(s, 24.0) * 0.35 + pow(s, 4.0) * 0.12);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`
