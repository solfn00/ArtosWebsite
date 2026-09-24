import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SCROLL } from '../config/timeline'
import { DEBUG_PROGRESS, REDUCED_MOTION } from '../config/quality'
import { scrollState } from '../state/scrollStore'

gsap.registerPlugin(ScrollTrigger)

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so Lenis, ScrollTrigger and
 * every GSAP tween share one clock (no desync between HUD and scene).
 * Publishes progress + velocity into the shared scroll store.
 */
export function useSmoothScroll() {
  const lenisRef = useRef(null)

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    const lenis = new Lenis({
      lerp: REDUCED_MOTION ? 1 : SCROLL.lenisLerp,
      smoothWheel: true,
      syncTouch: false, // native momentum on touch devices feels right and is cheapest
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    })
    lenisRef.current = lenis

    const publish = (l) => {
      scrollState.target = l.limit > 0 ? Math.min(1, Math.max(0, l.scroll / l.limit)) : 0
      scrollState.velocity = l.velocity
      if (!scrollState.started && l.scroll > 4) scrollState.started = true
    }
    lenis.on('scroll', (l) => {
      publish(l)
      ScrollTrigger.update()
    })

    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // deep link (?p=0.4): jump there immediately and let the scene snap too
    if (DEBUG_PROGRESS !== null) {
      requestAnimationFrame(() => {
        lenis.scrollTo(DEBUG_PROGRESS * lenis.limit, { immediate: true, force: true })
        publish(lenis)
        scrollState.snap = true
      })
    } else {
      lenis.scrollTo(0, { immediate: true, force: true })
    }

    // keep progress stable across resizes (the track height changes with vh)
    const onResize = () => {
      lenis.resize()
      publish(lenis)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}
