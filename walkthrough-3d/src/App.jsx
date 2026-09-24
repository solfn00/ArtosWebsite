import { Component, lazy, Suspense, useEffect, useState } from 'react'
import { CHAPTERS, SCROLL } from './config/timeline'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import Overlay from './components/Overlay'
import WalkUI from './components/WalkUI'

// The WebGL bundle (three + R3F + postprocessing) loads after first paint.
const Scene = lazy(() => import('./components/Scene'))

/** Never leave the visitor on the black loader: reveal after this long regardless. */
const READY_TIMEOUT_MS = 8000

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Catches WebGL/context or chunk-load failures and shows a readable fallback. */
class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    console.error('[walkthrough] scene failed:', err)
    this.props.onFail?.()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function App() {
  const lenis = useSmoothScroll()
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(() => !hasWebGL())

  useEffect(() => {
    const id = setTimeout(() => setReady(true), READY_TIMEOUT_MS)
    return () => clearTimeout(id)
  }, [])

  return (
    <main>
      <div className="stage">
        {!failed && (
          <SceneBoundary onFail={() => setFailed(true)}>
            <Suspense fallback={null}>
              <Scene onReady={() => setReady(true)} />
            </Suspense>
          </SceneBoundary>
        )}
      </div>
      {failed && (
        <div className="fallback" role="alert">
          <p className="kicker">3D unavailable</p>
          <p>This walkthrough needs WebGL. Try a current browser, or enable hardware acceleration.</p>
        </div>
      )}
      <Overlay ready={ready || failed} lenis={lenis} />
      {!failed && <WalkUI lenis={lenis} />}
      {/* The scroll track is the timeline: its height sets the pace of the walk. */}
      <div className="scroll-track" style={{ height: `${SCROLL.lengthVh}vh` }} />
      <ol className="sr-only">
        {CHAPTERS.map((c) => (
          <li key={c.from}>
            {c.title}: {c.caption}
          </li>
        ))}
      </ol>
    </main>
  )
}
