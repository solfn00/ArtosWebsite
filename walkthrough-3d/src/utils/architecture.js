import * as THREE from 'three'

/**
 * ArchitectureBuilder
 * -------------------
 * Collects walls (with door/window openings), slabs and blocks, and merges every
 * face into ONE BufferGeometry per material key. The whole house therefore costs
 * roughly a dozen draw calls regardless of how many wall segments it has.
 *
 * UVs are generated in metres (planar projection by face normal), so tiled
 * textures line up across segments and never stretch.
 */

const _p = new THREE.Vector3()
const _n = new THREE.Vector3()
const _m3 = new THREE.Matrix3()
const IDENTITY = new THREE.Matrix4()

export class ArchitectureBuilder {
  constructor() {
    this.buckets = new Map()
  }

  bucket(key) {
    if (!this.buckets.has(key)) this.buckets.set(key, { pos: [], nor: [], uv: [] })
    return this.buckets.get(key)
  }

  /**
   * Adds a box. `keys` = material key per face in BoxGeometry group order
   * [+x, −x, +y, −y, +z, −z] (null skips a face). `offset` positions the box in
   * the local frame described by `matrix`; UVs are derived from that local frame.
   */
  box(w, h, d, offset, keys, matrix = IDENTITY) {
    const g = new THREE.BoxGeometry(w, h, d).toNonIndexed()
    g.translate(offset[0], offset[1], offset[2])
    const pos = g.attributes.position
    const nor = g.attributes.normal
    _m3.getNormalMatrix(matrix)
    g.groups.forEach((group, gi) => {
      const key = keys[gi]
      if (!key) return
      const b = this.bucket(key)
      for (let i = group.start; i < group.start + group.count; i++) {
        _p.fromBufferAttribute(pos, i)
        _n.fromBufferAttribute(nor, i)
        const ax = Math.abs(_n.x)
        const ay = Math.abs(_n.y)
        const az = Math.abs(_n.z)
        let u
        let v
        if (az >= ax && az >= ay) {
          u = _p.x
          v = _p.y
        } else if (ax >= ay) {
          u = _p.z
          v = _p.y
        } else {
          u = _p.x
          v = _p.z
        }
        _p.applyMatrix4(matrix)
        _n.applyMatrix3(_m3).normalize()
        b.pos.push(_p.x, _p.y, _p.z)
        b.nor.push(_n.x, _n.y, _n.z)
        b.uv.push(u, v)
      }
    })
    g.dispose()
  }

  /** Axis-aligned block in world space, one material on every face. */
  block(min, max, key) {
    const k = Array.isArray(key) ? key : [key, key, key, key, key, key]
    this.box(
      max[0] - min[0],
      max[1] - min[1],
      max[2] - min[2],
      [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2],
      k,
    )
  }

  /**
   * Straight wall from `a` to `b` (plan coordinates [x, z]) with openings
   * expressed as distances along the wall. `pos` is the material on the wall's
   * local +z side (= +z for walls running along +x, = +x for walls running along −z).
   */
  wall({ a, b, height, thickness, pos, neg, edge = pos, openings = [], y0 = 0 }) {
    const dx = b[0] - a[0]
    const dz = b[1] - a[1]
    const length = Math.hypot(dx, dz)
    const matrix = new THREE.Matrix4()
      .makeRotationY(Math.atan2(-dz, dx))
      .setPosition(a[0], y0, a[1])
    const keys = [edge, edge, edge, edge, pos, neg]
    const seg = (s0, s1, h0, h1) => {
      if (s1 - s0 < 1e-3 || h1 - h0 < 1e-3) return
      this.box(s1 - s0, h1 - h0, thickness, [(s0 + s1) / 2, (h0 + h1) / 2, 0], keys, matrix)
    }
    let cursor = 0
    ;[...openings]
      .sort((p, q) => p.from - q.from)
      .forEach((o) => {
        seg(cursor, o.from, 0, height)
        seg(o.from, o.to, 0, o.bottom)
        seg(o.from, o.to, o.top, height)
        cursor = o.to
      })
    seg(cursor, length, 0, height)
  }

  /** Horizontal quad (floor facing up, ceiling facing down) with world-metre UVs. */
  quad(x0, x1, z0, z1, y, key, facing = 'up') {
    const b = this.bucket(key)
    const up = facing === 'up'
    const v = up
      ? [
          [x0, z1],
          [x1, z1],
          [x1, z0],
          [x0, z1],
          [x1, z0],
          [x0, z0],
        ]
      : [
          [x0, z1],
          [x1, z0],
          [x1, z1],
          [x0, z1],
          [x0, z0],
          [x1, z0],
        ]
    v.forEach(([x, z]) => {
      b.pos.push(x, y, z)
      b.nor.push(0, up ? 1 : -1, 0)
      b.uv.push(x, -z)
    })
  }

  build() {
    const out = {}
    this.buckets.forEach((b, key) => {
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3))
      g.setAttribute('normal', new THREE.Float32BufferAttribute(b.nor, 3))
      g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2))
      g.computeBoundingSphere()
      out[key] = g
    })
    return out
  }
}

/** Wall helpers taking world-space openings. */
export function hWall(builder, z, x0, x1, opts) {
  builder.wall({
    ...opts,
    a: [x0, z],
    b: [x1, z],
    openings: (opts.openings || []).map((o) => ({ ...o, from: o.from - x0, to: o.to - x0 })),
  })
}

/** Wall running from z0 (south) to z1 (north, z1 < z0) at a fixed x. */
export function vWall(builder, x, z0, z1, opts) {
  builder.wall({
    ...opts,
    a: [x, z0],
    b: [x, z1],
    openings: (opts.openings || []).map((o) => ({ ...o, from: z0 - o.to, to: z0 - o.from })),
  })
}
