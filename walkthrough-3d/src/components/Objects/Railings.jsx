import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { GEO } from '../../utils/geometries'
import { getMaterials } from '../../utils/materials'
import { ROOMS } from '../../config/layout'

/**
 * The balcony balustrade: white square balusters, a white bottom rail and a
 * light-blue round top rail (1–5 s, 9–10 s). All balusters are one InstancedMesh.
 */
const RUNS = [
  // along the balcony's outer (south) edge, from the stone pillar to the corner post
  { from: [0.2, 0, ROOMS.balcony.z1 - 0.03], to: [ROOMS.balcony.x1 - 0.08, 0, ROOMS.balcony.z1 - 0.03], pipe: true },
  // the east end, where the rail turns back to the facade (1–4 s)
  { from: [ROOMS.balcony.x1 - 0.03, 0, ROOMS.balcony.z1 - 0.1], to: [ROOMS.balcony.x1 - 0.03, 0, 0.16], pipe: true },
]

const HEIGHT = 1.0
const SPACING = 0.12

export default function Railings() {
  const mats = getMaterials()
  const inst = useRef()

  const { matrices, rails } = useMemo(() => {
    const matrices = []
    const rails = []
    const o = new THREE.Object3D()
    RUNS.forEach((run) => {
      const a = new THREE.Vector3(...run.from)
      const b = new THREE.Vector3(...run.to)
      const horiz = Math.hypot(b.x - a.x, b.z - a.z)
      const count = Math.max(2, Math.round(horiz / SPACING))
      for (let i = 0; i <= count; i++) {
        const p = a.clone().lerp(b, i / count)
        const post = i === 0 || i === count
        o.position.set(p.x, p.y + HEIGHT / 2, p.z)
        o.rotation.set(0, 0, 0)
        o.scale.set(post ? 0.05 : 0.024, HEIGHT, post ? 0.05 : 0.024)
        o.updateMatrix()
        matrices.push(o.matrix.clone())
      }
      // rails: oriented boxes / pipes between the raised end points
      const railAt = (lift, thick, key, round) => {
        const s = a.clone().add(new THREE.Vector3(0, lift, 0))
        const e = b.clone().add(new THREE.Vector3(0, lift, 0))
        const mid = s.clone().add(e).multiplyScalar(0.5)
        const len = s.distanceTo(e) + (round ? 0.08 : 0.04)
        const q = new THREE.Object3D()
        q.position.copy(mid)
        q.lookAt(e)
        rails.push({ position: mid.toArray(), quaternion: q.quaternion.toArray(), len, thick, key, round })
      }
      railAt(HEIGHT + 0.03, run.pipe ? 0.055 : 0.06, 'railBlue', run.pipe)
      railAt(0.09, 0.035, 'baluster', false)
    })
    return { matrices, rails }
  }, [])

  useLayoutEffect(() => {
    matrices.forEach((m, i) => inst.current.setMatrixAt(i, m))
    inst.current.instanceMatrix.needsUpdate = true
    inst.current.computeBoundingSphere()
  }, [matrices])

  return (
    <group name="railings">
      <instancedMesh ref={inst} args={[GEO.box, mats.baluster, matrices.length]} castShadow receiveShadow />
      {rails.map((r, i) =>
        r.round ? (
          // pipe: cylinder's axis is y, rotate it onto the lookAt z axis
          <group key={i} position={r.position} quaternion={r.quaternion}>
            <mesh
              geometry={GEO.cylinder}
              material={mats[r.key]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[r.thick, r.len, r.thick]}
              castShadow
            />
          </group>
        ) : (
          <mesh
            key={i}
            geometry={GEO.box}
            material={mats[r.key]}
            position={r.position}
            quaternion={r.quaternion}
            scale={[r.thick * 1.3, r.thick, r.len]}
            castShadow
            receiveShadow
          />
        ),
      )}
    </group>
  )
}
