import { useEffect, useRef, useState } from 'react'
import { scrollState } from '../state/scrollStore'

/**
 * Subscribes a DOM consumer to the animation clock without re-rendering React
 * every frame.
 *
 *  - `onFrame(state)` runs every animation frame (write styles via refs there)
 *  - `select(state)` derives a *discrete* value; React re-renders only when it changes
 */
export function useScrollProgress(select, onFrame) {
  const [value, setValue] = useState(() => (select ? select(scrollState) : null))
  const last = useRef(value)
  const cb = useRef(onFrame)
  const sel = useRef(select)
  cb.current = onFrame
  sel.current = select

  useEffect(() => {
    let raf
    const loop = () => {
      if (cb.current) cb.current(scrollState)
      if (sel.current) {
        const next = sel.current(scrollState)
        if (next !== last.current) {
          last.current = next
          setValue(next)
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return value
}
