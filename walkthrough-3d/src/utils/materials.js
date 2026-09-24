import * as THREE from 'three'
import { textures } from '../textures/procedural'
import { PALETTE } from '../config/layout'

/**
 * One shared PBR material library. Every mesh references these instances, so
 * there is one shader program per material type and no per-object allocations
 * (hover highlights clone on demand). Colours are sampled from the upright
 * reference frames.
 */
let lib = null

const std = (params) => new THREE.MeshStandardMaterial(params)

export function getMaterials() {
  if (lib) return lib
  const t = textures
  lib = {
    // ── Architecture ───────────────────────────────────────────────────────
    plaster: std({ map: t.plaster(), roughness: 0.95 }),
    concrete: std({ map: t.concrete(), roughness: 0.92 }),
    stone: std({ map: t.stone(), roughness: 1 }),
    white: std({ map: t.paint(), color: PALETTE.white, roughness: 0.9 }),
    livingWall: std({ map: t.paint(), color: PALETTE.livingWall, roughness: 0.92 }),
    bedWhite: std({ map: t.paint(), color: PALETTE.bedWhite, roughness: 0.92 }),
    mauve: std({ map: t.paint(), color: PALETTE.mauve, roughness: 0.95 }),
    bathTiles: std({ map: t.bathTiles(), roughness: 0.12, envMapIntensity: 1.1 }),
    moroccan: std({ map: t.moroccan(), roughness: 0.4 }),
    ceilingWhite: std({ map: t.paint(), color: '#f7f6f2', roughness: 0.95 }),
    woodCeiling: std({ map: t.woodCeiling(), roughness: 0.7 }),
    balconyTiles: std({ map: t.balconyTiles(), roughness: 0.55 }),
    floorTiles: std({ map: t.floorTiles(), roughness: 0.2, envMapIntensity: 0.8 }),
    laminate: std({ map: t.laminate(), roughness: 0.45 }),
    threshold: std({ color: '#d8d3ca', roughness: 0.25 }),
    turf: std({ map: t.turf(), roughness: 1 }),
    gravel: std({ map: t.gravel(), roughness: 1 }),

    // ── Joinery & metal ────────────────────────────────────────────────────
    shutterBlue: std({ color: PALETTE.shutterBlue, roughness: 0.45 }),
    railBlue: std({ color: PALETTE.railBlue, roughness: 0.35, metalness: 0.3 }),
    baluster: std({ color: PALETTE.baluster, roughness: 0.5, metalness: 0.2 }),
    frameWhite: std({ color: '#f5f4f0', roughness: 0.38 }),
    door: std({ map: t.doorFace(), roughness: 0.4 }),
    steel: std({ color: PALETTE.steel, metalness: 0.85, roughness: 0.3, envMapIntensity: 1.6 }),
    chrome: std({ color: '#f1f3f5', metalness: 1, roughness: 0.07 }),
    blackMetal: std({ color: '#161616', metalness: 0.55, roughness: 0.45 }),
    blackGlass: std({ color: '#0b0c0e', metalness: 0.2, roughness: 0.08 }),
    glass: std({ color: '#dcebea', roughness: 0.04, transparent: true, opacity: 0.18, depthWrite: false, envMapIntensity: 2 }),
    windowGlass: std({ color: '#95a8b3', roughness: 0.04, metalness: 0.3, transparent: true, opacity: 0.35, depthWrite: false, envMapIntensity: 2 }),
    mirror: std({ color: '#e4eaec', metalness: 0.9, roughness: 0.05, envMapIntensity: 3.2 }),
    ceramic: std({ color: '#fbfbf9', roughness: 0.12, envMapIntensity: 1.3 }),
    whiteMatte: std({ color: '#f2f0ec', roughness: 0.55 }),
    creamPlastic: std({ color: '#efe6d3', roughness: 0.4 }),
    oak: std({ color: PALETTE.oak, roughness: 0.55 }),
    pine: std({ color: PALETTE.pine, roughness: 0.6 }),
    beigeWood: std({ color: '#d9c7a8', roughness: 0.5 }),
    darkWood: std({ color: '#4a3524', roughness: 0.6 }),
    greyShelf: std({ color: '#8d8f8e', roughness: 0.6 }),
    black: std({ color: '#161616', roughness: 0.55 }),

    // ── Textiles & decor ───────────────────────────────────────────────────
    wicker: std({ map: t.wicker(), bumpMap: t.wicker(), bumpScale: 3, roughness: 0.75, color: '#8e8e96' }),
    kilim: std({ map: t.kilim(), roughness: 1, side: THREE.DoubleSide }),
    stripes: std({ map: t.stripes(), roughness: 1 }),
    towelCream: std({ color: '#efe5d3', roughness: 1, side: THREE.DoubleSide }),
    burgundy: std({ color: PALETTE.burgundy, roughness: 0.95 }),
    mustard: std({ color: PALETTE.mustard, roughness: 1 }),
    sage: std({ color: PALETTE.sage, roughness: 0.95 }),
    linen: std({ color: '#f4f0e8', roughness: 1 }),
    beigeThrow: std({ color: '#d8c7aa', roughness: 1 }),
    charcoal: std({ color: '#2e2f33', roughness: 1 }),
    ikeaBlue: std({ color: PALETTE.ikeaBlue, roughness: 0.55, metalness: 0.05 }),
    homeMat: std({ map: t.homeMat(), roughness: 1 }),
    greyMat: std({ color: '#7d8691', roughness: 1 }),
    stripeRug: std({ map: t.towel(), roughness: 1 }),
    tealRug: std({ color: '#3fa3a3', roughness: 1 }),
    cork: std({ map: t.cork(), roughness: 1 }),
    zebraGray: std({ map: t.zebraGray(), roughness: 0.9, emissive: '#ffffff', emissiveIntensity: 0.12, emissiveMap: t.zebraGray() }),
    romanBlind: std({ map: t.romanBlind(), roughness: 0.95, emissive: '#ffe2bf', emissiveIntensity: 0.1, emissiveMap: t.romanBlind() }),
    lattice: std({ map: t.lattice(), roughness: 0.6 }),
    picture: std({ map: t.picture(), roughness: 0.3 }),
    pictureRed: std({ map: t.pictureRed(), roughness: 0.6 }),
    painting: std({ map: t.painting(), roughness: 0.7 }),
    plate: std({ map: t.plate(), roughness: 0.2 }),
    rope: std({ color: '#c8a978', roughness: 1 }),
    rattan: std({ color: '#b98a4e', roughness: 0.9 }),
    driftwood: std({ color: '#9c8a74', roughness: 1 }),
    driedLeaf: std({ color: '#a8703f', roughness: 1, side: THREE.DoubleSide }),
    driedFlower: std({ color: '#b98a86', roughness: 1 }),
    paleBlue: std({ color: '#8fc5d8', roughness: 0.7 }),
    lampBlue: std({ color: '#2e62b8', roughness: 0.6, side: THREE.DoubleSide }),
    terracotta: std({ color: '#8f3527', roughness: 0.8 }),
    cactus: std({ color: '#6f8f45', roughness: 0.8, flatShading: true }),

    // ── Light emitters (feed the bloom pass) ───────────────────────────────
    lampShade: std({ color: '#ffd9a8', emissive: PALETTE.lampWarm, emissiveIntensity: 3, roughness: 0.9 }),
    paperLamp: std({ color: '#fff2da', emissive: '#ffc27a', emissiveIntensity: 2.4, roughness: 0.9, side: THREE.DoubleSide }),
    lightPanel: std({ color: '#ffffff', emissive: '#fffaf0', emissiveIntensity: 2.2, roughness: 0.5 }),
    daylight: std({ color: '#ffffff', emissive: '#f4f6f5', emissiveIntensity: 1.8 }),

    // ── Nature ─────────────────────────────────────────────────────────────
    foliage: std({ color: '#ffffff', roughness: 0.8 }),
    foliageDark: std({ color: '#4d6a2b', roughness: 0.9, flatShading: true }),
    frond: std({ map: t.frond(), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.8 }),
    trunk: std({ map: t.trunk(), roughness: 1 }),
    ground: std({ map: t.turf(), roughness: 1, color: '#a9b596' }),
  }
  return lib
}

export function disposeMaterials() {
  if (!lib) return
  Object.values(lib).forEach((m) => m.dispose())
  lib = null
}
