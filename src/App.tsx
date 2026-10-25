import { useCallback, useEffect, useRef, useState } from 'react'
import { tricks, tricksById, type Trick } from './data/tricks'

type Route =
  | { view: 'home' }
  | { view: 'brief'; id: string }
  | { view: 'full'; id: string }

function parseHash(): Route {
  const clean = location.hash.replace(/^#\/?/, '')
  const [view, id] = clean.split('/')
  if ((view === 'brief' || view === 'full') && id && tricksById[id]) {
    return { view, id }
  }
  return { view: 'home' }
}

function go(path: string) {
  if (location.hash === path) return
  location.hash = path
}

function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('drive.theme')
    return saved === 'light' ? 'light' : 'dark'
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('drive.theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', theme === 'light' ? '#f4f6f9' : '#0b0f14')
  }, [theme])
  return { theme, setTheme }
}

function ThemeToggle({
  theme,
  onToggle
}: {
  theme: 'dark' | 'light'
  onToggle: () => void
}) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={theme === 'dark' ? '切換淺色' : '切換深色'}
      title={theme === 'dark' ? '切換淺色' : '切換深色'}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}

function Home({ theme, onToggle }: { theme: 'dark' | 'light'; onToggle: () => void }) {
  return (
    <main className="home">
      <header className="home-head">
        <div className="home-head-top">
          <p className="kicker">上車前 30 秒</p>
          <ThemeToggle theme={theme} onToggle={onToggle} />
        </div>
        <h1>開車技巧速查</h1>
      </header>

      <nav className="list" aria-label="技巧清單">
        {tricks.map((t) => (
          <div className="trick-card" key={t.id}>
            <button className="card-main" onClick={() => go(`#/brief/${t.id}`)}>
              <span className="no" aria-hidden="true">
                {t.no}
              </span>
              <span className="card-body">
                <span className="card-name">{t.name}</span>
                <span className="card-one">{t.oneLiner}</span>
              </span>
              <span className="chev" aria-hidden="true">
                ›
              </span>
            </button>
            <div className="card-foot">
              <span className="tag">{t.tag}</span>
              <button className="link" onClick={() => go(`#/full/${t.id}`)}>
                看完整內容
              </button>
            </div>
          </div>
        ))}
      </nav>

      <footer className="home-foot">
        <p>參照點以一般中型車（Fit 級）為基準；第一次用請在空地校準一次。</p>
        <p className="install">
          加到主畫面：Safari「分享 → 加入主畫面」；Chrome「⋮ → 安裝應用程式」。
        </p>
      </footer>
    </main>
  )
}

type Page =
  | { kind: 'mantra' }
  | { kind: 'step'; index: number }
  | { kind: 'rescue' }

function Brief({ trick, theme, onToggle }: { trick: Trick; theme: 'dark' | 'light'; onToggle: () => void }) {
  const pages: Page[] = [
    { kind: 'mantra' },
    ...trick.steps.map((_, i) => ({ kind: 'step' as const, index: i })),
    { kind: 'rescue' }
  ]
  const [idx, setIdx] = useState(0)
  const touchX = useRef<number | null>(null)
  const total = pages.length

  const back = useCallback(() => {
    if (idx === 0) go('#/')
    else setIdx((i) => i - 1)
  }, [idx])

  const next = useCallback(() => {
    setIdx((i) => (i < total - 1 ? i + 1 : i))
  }, [total])

  useEffect(() => {
    setIdx(0)
  }, [trick.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') back()
      if (e.key === 'Escape') go('#/')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, back])

  const page = pages[idx]

  return (
    <div
      className="brief"
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) < 50) return
        if (dx < 0) next()
        else back()
      }}
    >
      <header className="brief-head">
        <button className="icon-btn" onClick={() => go('#/')} aria-label="回列表">
          ‹
        </button>
        <div className="brief-title">
          <span className="no-small">{trick.no}</span>
          <span>{trick.name}</span>
        </div>
        <div className="head-right">
          <span className="counter">
            {idx + 1}/{total}
          </span>
          <ThemeToggle theme={theme} onToggle={onToggle} />
        </div>
      </header>

      <div className="progress" aria-hidden="true">
        <span style={{ width: `${((idx + 1) / total) * 100}%` }} />
      </div>

      <section className="stage" key={idx}>
        {page.kind === 'mantra' && (
          <div className="mantra">
            <p className="eyebrow">心法</p>
            <p className="mantra-text">{trick.oneLiner}</p>
            <p className="situation">{trick.situation}</p>
          </div>
        )}

        {page.kind === 'step' && (
          <div className="step">
            <p className="step-no">{String(page.index + 1).padStart(2, '0')}</p>
            <h2 className="step-action">{trick.steps[page.index].action}</h2>
            <p className="step-look">
              <span className="look-label">看</span>
              {trick.steps[page.index].look}
            </p>
            <p className="cue">{trick.steps[page.index].cue}</p>
          </div>
        )}

        {page.kind === 'rescue' && (
          <div className="rescue">
            <p className="eyebrow">卡住時怎麼辦</p>
            <ul>
              {trick.rescue.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {idx === total - 1 && (
              <button className="wide-link" onClick={() => go(`#/full/${trick.id}`)}>
                看完整內容（參照點、適用範圍）›
              </button>
            )}
          </div>
        )}
      </section>

      <footer className="brief-foot">
        <button className="nav-btn ghost" onClick={back}>
          {idx === 0 ? '回列表' : '上一步'}
        </button>
        <button className="nav-btn primary" onClick={next} disabled={idx === total - 1}>
          下一步
        </button>
      </footer>
    </div>
  )
}

function Full({ trick, theme, onToggle }: { trick: Trick; theme: 'dark' | 'light'; onToggle: () => void }) {
  return (
    <div className="full">
      <header className="full-head">
        <button className="icon-btn" onClick={() => go('#/')} aria-label="回列表">
          ‹
        </button>
        <div className="brief-title">
          <span className="no-small">{trick.no}</span>
          <span>{trick.name}</span>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggle} />
      </header>

      <main className="full-body">
        <p className="full-mantra">{trick.oneLiner}</p>
        <p className="full-situation">{trick.situation}</p>

        <section className="block">
          <h3>參照點</h3>
          <dl className="refs">
            {trick.refs.map((r) => (
              <div className="ref-row" key={r.k}>
                <dt>{r.k}</dt>
                <dd>{r.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="block">
          <h3>步驟</h3>
          <ol className="steps">
            {trick.steps.map((s, i) => (
              <li key={s.action}>
                <div className="ol-head">
                  <span className="ol-no">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ol-action">{s.action}</span>
                </div>
                <p className="ol-look">
                  <span className="look-label">看</span>
                  {s.look}
                </p>
                <span className="cue small">{s.cue}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="block">
          <h3>卡住時怎麼辦</h3>
          <ul className="plain-list">
            {trick.rescue.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <section className="block">
          <h3>適用與不適用</h3>
          <ul className="plain-list">
            {trick.limits.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <button className="wide-link top-gap" onClick={() => go(`#/brief/${trick.id}`)}>
          用逐步模式看 ›
        </button>
      </main>
    </div>
  )
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash)
  const { theme, setTheme } = useTheme()
  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [setTheme])

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (route.view === 'brief') {
    return <Brief trick={tricksById[route.id]} theme={theme} onToggle={toggle} />
  }
  if (route.view === 'full') {
    return <Full trick={tricksById[route.id]} theme={theme} onToggle={toggle} />
  }
  return <Home theme={theme} onToggle={toggle} />
}
