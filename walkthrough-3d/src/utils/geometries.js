import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/**
 * Shared geometry pool. Furniture is composed from a handful of unit shapes that
 * are scaled per mesh, so the whole interior allocates only a few GPU buffers.
 */
export const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 24),
  cylinderLow: new THREE.CylinderGeometry(0.5, 0.5, 1, 10),
  sphere: new THREE.SphereGeometry(0.5, 24, 16),
  plane: new THREE.PlaneGeometry(1, 1),
  torus: new THREE.TorusGeometry(0.5, 0.06, 12, 32),
}

const rounded = new Map()
/** Rounded boxes are cached per exact size so the bevel radius never distorts. */
export function roundedBox(w, h, d, r = 0.03, seg = 3) {
  const key = `${w}|${h}|${d}|${r}|${seg}`
  if (!rounded.has(key)) rounded.set(key, new RoundedBoxGeometry(w, h, d, seg, r))
  return rounded.get(key)
}

export function disposeGeometries() {
  Object.values(GEO).forEach((g) => g.dispose())
  rounded.forEach((g) => g.dispose())
  rounded.clear()
}
