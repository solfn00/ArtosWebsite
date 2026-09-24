import { useEffect, useRef, useState } from 'react'
import { IS_TOUCH } from '../config/quality'
import { navState, walkInput } from '../state/scrollStore'

const ROOM_NAMES = {
  balcony: 'Balcony',
  hall: 'Entry hall & kitchenette',
  bathroom: 'Bathroom',
  bedroom: 'Bedroom',
  living: 'Living room',
}
const LOOK_MOUSE = 0.0032 // rad per px
const LOOK_TOUCH = 0.0055
const STICK_RADIUS = 48 // px

/** React hook mirroring navState.mode. */
export function useNavMode() {
  const [mode, setMode] = useState(navState.mode)
  useEffect(() => {
    navState.listeners.add(setMode)
    return () => navState.listeners.delete(setMode)
  }, [])
  return mode
}

/**
 * Walk-mode controls (DOM side): the toggle, keyboard, drag-to-look, and a
 * virtual joystick on touch screens. Scrolling is paused while walking.
 */
export default function WalkUI({ lenis }) {
  const mode = useNavMode()
  const walking = mode === 'walk'
  const [room, setRoom] = useState(null)
  const stickRef = useRef(null)
  const [stick, setStick] = useState(null) // { x, y, dx, dy } for the joystick visual

  // pause / resume the scroll timeline
  useEffect(() => {
    const l = lenis.current
    if (!l) return
    if (walking) l.stop()
    else l.start()
    document.documentElement.classList.toggle('is-walking', walking)
  }, [walking, lenis])

  // keyboard
  useEffect(() => {
    if (!walking) return
    const down = (e) => {
      if (e.code === 'Escape') {
        navState.set('scroll')
        return
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault()
      walkInput.keys.add(e.code)
    }
    const up = (e) => walkInput.keys.delete(e.code)
    const blur = () => walkInput.keys.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
      walkInput.keys.clear()
    }
  }, [walking])

  // drag to look (mouse) + joystick / look split (touch)
  useEffect(() => {
    if (!walking) return
    const pointers = new Map()
    const isUi = (t) => t.closest && t.closest('button, a, .walk-ui')
    const onDown = (e) => {
      if (isUi(e.target)) return
      const role = e.pointerType === 'touch' && e.clientX < window.innerWidth * 0.45 ? 'stick' : 'look'
      pointers.set(e.pointerId, { role, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY })
      if (role === 'stick') setStick({ x: e.clientX, y: e.clientY, dx: 0, dy: 0 })
    }
    const onMove = (e) => {
      const p = pointers.get(e.pointerId)
      if (!p) return
      if (p.role === 'look') {
        const k = e.pointerType === 'touch' ? LOOK_TOUCH : LOOK_MOUSE
        walkInput.lookDX += (e.clientX - p.x) * k
        walkInput.lookDY += (e.clientY - p.y) * k
      } else {
        let dx = e.clientX - p.x0
        let dy = e.clientY - p.y0
        const m = Math.hypot(dx, dy)
        if (m > STICK_RADIUS) {
          dx = (dx / m) * STICK_RADIUS
          dy = (dy / m) * STICK_RADIUS
        }
        walkInput.stick.x = dx / STICK_RADIUS
        walkInput.stick.y = -dy / STICK_RADIUS
        walkInput.run = m > STICK_RADIUS * 1.6
        setStick({ x: p.x0, y: p.y0, dx, dy })
      }
      p.x = e.clientX
      p.y = e.clientY
    }
    const onUp = (e) => {
      const p = pointers.get(e.pointerId)
      if (p?.role === 'stick') {
        walkInput.stick.x = 0
        walkInput.stick.y = 0
        walkInput.run = false
        setStick(null)
      }
      pointers.delete(e.pointerId)
    }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      walkInput.stick.x = walkInput.stick.y = 0
    }
  }, [walking])

  // current room label
  useEffect(() => {
    if (!walking) return
    const id = setInterval(() => setRoom(walkInput.room), 250)
    return () => clearInterval(id)
  }, [walking])

  return (
    <div className={`walk-ui ${walking ? 'is-walking' : ''}`}>
      <button className="walk-toggle" onClick={() => navState.set(walking ? 'scroll' : 'walk')} aria-pressed={walking}>
        {walking ? 'Back to the scroll tour' : 'Walk freely'}
      </button>
      {walking && (
        <>
          <div className="walk-room" aria-live="polite">
            {ROOM_NAMES[room] || 'Outside'}
          </div>
          <p className="walk-hint">
            {IS_TOUCH
              ? 'Left thumb: move · Right thumb: look'
              : 'Drag to look · W A S D / arrows to move · Shift to run · Esc to leave'}
          </p>
          {stick && (
            <div ref={stickRef} className="walk-stick" style={{ left: stick.x, top: stick.y }}>
              <span style={{ transform: `translate(${stick.dx}px, ${stick.dy}px)` }} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
