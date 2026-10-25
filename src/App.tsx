import { useCallback, useEffect, useRef, useState } from 'react'
import { tricks, tricksById, type Trick, type Variant } from './data/tricks'

type Route =
  | { view: 'home' }
  | { view: 'pick'; id: string }
  | { view: 'brief'; id: string; vid?: string }
  | { view: 'full'; id: string; vid?: string }

function variantOf(trick: Trick | undefined, vid?: string): Variant | undefined {
  return trick?.variants?.find((v) => v.id === vid)
}

function parseHash(): Route {
  const clean = location.hash.replace(/^#\/?/, '')
  const [view, id, vid] = clean.split('/')
  const trick = id ? tricksById[id] : undefined
  if (view === 'pick' && trick?.variants) return { view, id }
  if ((view === 'brief' || view === 'full') && trick) {
    return { view, id, vid: variantOf(trick, vid)?.id }
  }
  return { view: 'home' }
}

function go(path: string) {
  if (location.hash === path) return
  location.hash = path
}

/** 首頁卡片點進去的第一站 */
function entry(t: Trick) {
  return t.variants ? `#/pick/${t.id}` : `#/brief/${t.id}`
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
            <button className="card-main" onClick={() => go(entry(t))}>
              <span className="no" aria-hidden="true">
                {t.no}
              </span>
              <span className="card-body">
                <span className="card-name">
                  {t.name}
                  {t.variants && <span className="card-sub">4 種打法</span>}
                </span>
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

function Pick({ trick, theme, onToggle }: { trick: Trick; theme: 'dark' | 'light'; onToggle: () => void }) {
  const variants = trick.variants ?? []
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
          <h3>選一種打法</h3>
          <div className="variant-list">
            {variants.map((v, i) => (
              <button
                className="variant-card"
                key={v.id}
                onClick={() => go(`#/brief/${trick.id}/${v.id}`)}
              >
                <span className="variant-top">
                  <span className="variant-no">{String(i + 1).padStart(2, '0')}</span>
                  <span className="variant-name">{v.name}</span>
                  <span className="variant-sway">{v.sway}</span>
                </span>
                <span className="variant-when">{v.when}</span>
                <span className="variant-start">起點：{v.start}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="block">
          <h3>四種打法差在哪</h3>
          <div className="compare">
            <div className="compare-row compare-head">
              <span>打法</span>
              <span>起點對位</span>
              <span>第一把</span>
            </div>
            <div className="compare-row">
              <span>半圈</span>
              <span>B 柱對前車車頭</span>
              <span>右半圈</span>
            </div>
            <div className="compare-row">
              <span>一圈</span>
              <span>車尾對前車車尾</span>
              <span>右一圈</span>
            </div>
            <div className="compare-row">
              <span>打滿</span>
              <span>車尾對前車車尾</span>
              <span>右打滿</span>
            </div>
            <div className="compare-row">
              <span>車頭先進</span>
              <span>B 柱對後車車頭</span>
              <span>右打滿進</span>
            </div>
          </div>
          <p className="compare-note">
            共同收尾：看到後車完整車頭就回正直倒；右前門把手壓到路邊就左打滿，車身平行後微調。
          </p>
        </section>
      </main>
    </div>
  )
}

type Page =
  | { kind: 'mantra' }
  | { kind: 'step'; index: number }
  | { kind: 'rescue' }

function Brief({
  trick,
  variant,
  theme,
  onToggle
}: {
  trick: Trick
  variant?: Variant
  theme: 'dark' | 'light'
  onToggle: () => void
}) {
  const steps = variant?.steps ?? trick.steps
  const rescue = variant?.rescue ?? trick.rescue
  const backTarget = variant ? `#/pick/${trick.id}` : '#/'

  const pages: Page[] = [
    { kind: 'mantra' },
    ...steps.map((_, i) => ({ kind: 'step' as const, index: i })),
    { kind: 'rescue' }
  ]
  const [idx, setIdx] = useState(0)
  const [zoom, setZoom] = useState<string | null>(null)
  const touchX = useRef<number | null>(null)
  const total = pages.length

  const back = useCallback(() => {
    if (idx === 0) go(backTarget)
    else setIdx((i) => i - 1)
  }, [idx, backTarget])

  const next = useCallback(() => {
    setIdx((i) => (i < total - 1 ? i + 1 : i))
  }, [total])

  useEffect(() => {
    setIdx(0)
  }, [trick.id, variant?.id])

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
        <button className="icon-btn" onClick={back} aria-label={idx === 0 ? '回上一頁' : '上一步'}>
          ‹
        </button>
        <div className="brief-title">
          <span className="no-small">{trick.no}</span>
          <span>{variant ? variant.name : trick.name}</span>
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
            <p className="eyebrow">{variant ? variant.name : '心法'}</p>
            <p className="mantra-text">{variant ? variant.sway : trick.oneLiner}</p>
            <p className="situation">{variant ? variant.when : trick.situation}</p>
          </div>
        )}

        {page.kind === 'step' && (
          <div className="step">
            <p className="step-no">{String(page.index + 1).padStart(2, '0')}</p>
            <h2 className="step-action">{steps[page.index].action}</h2>
            <p className="step-look">
              <span className="look-label">看</span>
              {steps[page.index].look}
            </p>
            <p className="cue">{steps[page.index].cue}</p>
            {steps[page.index].diagram && (
              <img
                className="diagram"
                src={`${import.meta.env.BASE_URL}${steps[page.index].diagram}`}
                alt={`${variant?.name ?? trick.name} 第 ${page.index + 1} 步俯視示意圖`}
                loading="lazy"
                onClick={() =>
                  setZoom(`${import.meta.env.BASE_URL}${steps[page.index].diagram}`)
                }
              />
            )}
          </div>
        )}

        {page.kind === 'rescue' && (
          <div className="rescue">
            <p className="eyebrow">卡住時怎麼辦</p>
            <ul>
              {rescue.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {idx === total - 1 && (
              <button
                className="wide-link"
                onClick={() =>
                  go(variant ? `#/full/${trick.id}/${variant.id}` : `#/full/${trick.id}`)
                }
              >
                看完整內容（參照點、適用範圍）›
              </button>
            )}
          </div>
        )}
      </section>

      <footer className="brief-foot">
        <button className="nav-btn ghost" onClick={back}>
          {idx === 0 ? (variant ? '換打法' : '回列表') : '上一步'}
        </button>
        <button className="nav-btn primary" onClick={next} disabled={idx === total - 1}>
          下一步
        </button>
      </footer>

      {zoom && (
        <div className="zoom" onClick={() => setZoom(null)}>
          <img src={zoom} alt="放大示意圖" />
        </div>
      )}
    </div>
  )
}

function Full({
  trick,
  variant,
  theme,
  onToggle
}: {
  trick: Trick
  variant?: Variant
  theme: 'dark' | 'light'
  onToggle: () => void
}) {
  const refs = variant?.refs ?? trick.refs
  const steps = variant?.steps ?? trick.steps
  const rescue = variant?.rescue ?? trick.rescue
  const limits = variant?.limits ?? trick.limits
  const backTarget = variant ? `#/pick/${trick.id}` : '#/'
  const [zoom, setZoom] = useState<string | null>(null)

  return (
    <div className="full">
      <header className="full-head">
        <button className="icon-btn" onClick={() => go(backTarget)} aria-label="回上一頁">
          ‹
        </button>
        <div className="brief-title">
          <span className="no-small">{trick.no}</span>
          <span>{variant ? `${trick.name}・${variant.name}` : trick.name}</span>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggle} />
      </header>

      <main className="full-body">
        {variant ? (
          <>
            <p className="full-mantra">{variant.sway}</p>
            <p className="full-situation">{variant.when}</p>
            <button className="wide-link" onClick={() => go(`#/pick/${trick.id}`)}>
              換一種打法 ›
            </button>
          </>
        ) : (
          <>
            <p className="full-mantra">{trick.oneLiner}</p>
            <p className="full-situation">{trick.situation}</p>
            {trick.variants && (
              <button className="wide-link" onClick={() => go(`#/pick/${trick.id}`)}>
                選一種打法 ›
              </button>
            )}
          </>
        )}

        {refs.length > 0 && (
          <section className="block">
            <h3>參照點</h3>
            <dl className="refs">
              {refs.map((r) => (
                <div className="ref-row" key={r.k}>
                  <dt>{r.k}</dt>
                  <dd>{r.v}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {steps.length > 0 && (
          <section className="block">
            <h3>步驟</h3>
            <ol className="steps">
              {steps.map((s, i) => (
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
                  {s.diagram && (
                    <img
                      className="diagram"
                      src={`${import.meta.env.BASE_URL}${s.diagram}`}
                      alt={`第 ${i + 1} 步俯視示意圖`}
                      loading="lazy"
                      onClick={() => setZoom(`${import.meta.env.BASE_URL}${s.diagram}`)}
                    />
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="block">
          <h3>卡住時怎麼辦</h3>
          <ul className="plain-list">
            {rescue.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <section className="block">
          <h3>適用與不適用</h3>
          <ul className="plain-list">
            {limits.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <button
          className="wide-link top-gap"
          onClick={() =>
            go(variant ? `#/brief/${trick.id}/${variant.id}` : `#/brief/${trick.id}`)
          }
        >
          用逐步模式看 ›
        </button>
      </main>

      {zoom && (
        <div className="zoom" onClick={() => setZoom(null)}>
          <img src={zoom} alt="放大示意圖" />
        </div>
      )}
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

  if (route.view === 'pick') {
    return <Pick trick={tricksById[route.id]} theme={theme} onToggle={toggle} />
  }
  if (route.view === 'brief') {
    const trick = tricksById[route.id]
    return (
      <Brief
        trick={trick}
        variant={variantOf(trick, route.vid)}
        theme={theme}
        onToggle={toggle}
      />
    )
  }
  if (route.view === 'full') {
    const trick = tricksById[route.id]
    return (
      <Full trick={trick} variant={variantOf(trick, route.vid)} theme={theme} onToggle={toggle} />
    )
  }
  return <Home theme={theme} onToggle={toggle} />
}
