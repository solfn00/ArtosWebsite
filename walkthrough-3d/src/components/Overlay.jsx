import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { CHAPTERS, ENDING, toProgress } from '../config/timeline'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { smoothstep } from '../utils/interpolation'

const pad = (n) => String(n).padStart(2, '0')
const chapterAt = (t) => {
  let idx = 0
  for (let i = 0; i < CHAPTERS.length; i++) if (t >= CHAPTERS[i].from) idx = i
  return idx
}

/**
 * Minimal HTML layer over the canvas. Per-frame values (progress rail, whiteout)
 * are written straight to the DOM; React only re-renders when the chapter or
 * the start/end state actually changes.
 */
export default function Overlay({ ready, lenis }) {
  const root = useRef()
  const rail = useRef()
  const whiteout = useRef()

  const chapter = useScrollProgress((s) => chapterAt(s.videoTime))
  const started = useScrollProgress((s) => s.started && s.progress > 0.004)
  const chapterOn = useScrollProgress((s) => s.progress > 0.028)
  const ended = useScrollProgress((s) => s.progress > 0.975)

  useScrollProgress(null, (s) => {
    if (rail.current) rail.current.style.transform = `scaleY(${s.progress})`
    if (whiteout.current) {
      whiteout.current.style.opacity = String(smoothstep(ENDING.fadeFrom, ENDING.fadeTo, s.progress) * 0.38)
    }
  })

  // Intro title drifts up and dissolves over the first screen of scrolling.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.intro-inner', {
        opacity: 0,
        y: -60,
        filter: 'blur(6px)',
        ease: 'none',
        scrollTrigger: { trigger: document.querySelector('.scroll-track'), start: 'top top', end: '+=45%', scrub: 0.6 },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const c = CHAPTERS[chapter]
  return (
    <div ref={root} className={`overlay ${ready ? 'is-ready' : ''}`}>
      <div className="loader" aria-hidden="true">
        <span className="loader-mark">HOME</span>
      </div>

      <header className="hud-top">
        <span className="brand">
          Home <em>— a walkthrough</em>
        </span>
        <span className="counter" aria-live="polite">
          {pad(chapter + 1)} <span>/ {pad(CHAPTERS.length)}</span>
        </span>
      </header>

      <section className="intro" aria-hidden={started}>
        <div className="intro-inner">
          <p className="kicker">3D reconstruction of the video</p>
          <h1>
            Welcome <em>home</em>
          </h1>
          <p className="lede">Along the covered balcony and through every room of the flat — scroll, or walk it freely.</p>
        </div>
      </section>

      <div className={`scroll-indicator ${started ? 'is-hidden' : ''}`} aria-hidden="true">
        <span className="mouse">
          <span className="wheel" />
        </span>
        <span className="label">Scroll to walk in</span>
      </div>

      <div className={`chapter ${chapterOn && !ended ? 'is-visible' : ''}`}>
        <div key={chapter} className="chapter-inner">
          <span className="chapter-index">{pad(chapter + 1)}</span>
          <h2>{c.title}</h2>
          <p>{c.caption}</p>
        </div>
      </div>

      <nav className="rail" aria-label="Walkthrough progress">
        <div className="rail-track">
          <div ref={rail} className="rail-fill" />
          {CHAPTERS.map((ch, i) => (
            <button
              key={ch.from}
              className={`rail-tick ${i === chapter ? 'is-active' : ''}`}
              style={{ top: `${toProgress(ch.from) * 100}%` }}
              aria-label={`Go to ${ch.title}`}
              onClick={() => lenis.current?.scrollTo(toProgress(ch.from + 0.4) * lenis.current.limit, { duration: 2.4 })}
            >
              <span>{ch.title}</span>
            </button>
          ))}
        </div>
      </nav>

      <div ref={whiteout} className="whiteout" aria-hidden="true" />

      <section className={`end-card ${ended ? 'is-visible' : ''}`} aria-hidden={!ended}>
        <p className="kicker">End of the walk</p>
        <h2>
          Welcome <em>home.</em>
        </h2>
        <button className="restart" onClick={() => lenis.current?.scrollTo(0, { duration: 7, easing: (x) => 1 - Math.pow(1 - x, 3) })}>
          Walk it again
        </button>
      </section>
    </div>
  )
}
