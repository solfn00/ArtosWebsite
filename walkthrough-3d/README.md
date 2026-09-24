# Home — interactive 3D reconstruction

A real-time WebGL reconstruction of the flat shown in
`WhatsApp Video 2026-09-23 at 18.37.41.mp4` (68 s). Two ways to explore it:

- **Scroll tour**: scrolling replays the exact path of the video. Scroll back to reverse.
- **Walk freely**: first-person, with collision against the real walls and furniture.
  - Desktop: drag to look, W A S D or arrows to move, Shift to run, Esc to leave.
  - Touch: left thumb moves, right thumb looks.

React 19 · Vite 8 · three r186 · React Three Fiber 9 · drei · postprocessing · GSAP ScrollTrigger · Lenis

```bash
npm install
npm run dev        # http://localhost:5174
npm run build      # static output in dist/
```

## How the space was reconstructed

The phone filmed the video **upside-down**, so the geometry was read from the frames rotated 180°.

| Space | Seen at | What is modelled |
|---|---|---|
| Covered balcony (≈7.2 × 1.85 m, upper floor) | 1–16 s, 64–68 s | wooden board ceiling on a white beam grid, ceiling fan, white balusters with light-blue top rail, prickly-pear planters on the ledge, kilim over a grey bench, four black chairs, two 2×2 windows with blue louvred shutters, burlap/driftwood hanging and dream-catcher, stone pillar, cork board, shoe rack, HOME mat, lower terrace with synthetic grass and X-braced railing below |
| Entry hall (2 × 4.4 m) | 16–19, 25, 34–38, 48, 63 s | front door, ornate mirror, bathroom door, pine console in a niche, bedroom + living-room doors side by side, wall plates, gold-framed painting, blue bag |
| Kitchenette alcove | 22–25, 63 s | L-shaped: 4-drawer unit, sink under white wall cupboards, double hot plate on the return, oak worktop and shelf |
| Bathroom (2 × 2.4 m) | 25–34 s | patterned floor and tile border, framed glass shower with towel, close-coupled toilet, wood vanity with mirror, high window, coats on hooks |
| Bedroom (3.6 × 3.3 m) | 38–48 s | mauve walls, double bed (oak frame, charcoal runner, striped pillows), floating bedside shelves and lamps, roman blind, large seascape, lattice wardrobe with garland |
| Living room (4.9 × 3.3 m) | 19–21, 49–62 s | paper pendant, fridge + retro oven, burgundy daybed under the zebra window, TV corner with egg lamp, grey floating desk, AC unit, dining table + 2 chairs, sage armchair, arc lamp |

Parts the video never shows clearly were inferred, not invented. That covers exact wall
lengths, the outside faces of the building, and anything behind the camera. The
plan in `src/config/layout.js` documents the result.

## Where to tune things

- **`src/config/layout.js`**: rooms, walls (with openings), doors, colour palette. The renderer and the walk-mode collision both read from this file.
- **`src/config/timeline.js`**: camera keyframes in *video seconds* (position, look target, FOV, roll, exposure) and the chapter names.
- `src/utils/collision.js`: furniture footprints for walk mode.
- `src/components/Objects/*`: one file per space.
- `src/textures/procedural.js`: all textures are drawn on canvas; there are no image downloads.

Debug URL params:
- `?p=0.42` jumps to a progress value.
- `?free` gives an orbit camera and draws the camera path.
- `?tier=low` forces the mobile tier.

## Performance

- The walls, floors and ceilings are merged into one mesh per material.
- Chairs, balusters, shutter slats, trees and palm fronds are instanced.
- Shadows are static, and every texture is uploaded behind the loader.
- The low tier (phones) drops ambient occlusion, MSAA and some lights.
