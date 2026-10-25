import { useCallback, useEffect, useState } from 'react'
import { tricks, tricksById, type Step, type Trick, type Variant } from './data/tricks'

type Route =
  | { view: 'home' }
  | { view: 'pick'; id: string }
  | { view: 'full'; id: string; vid?: string }

function variantOf(trick: Trick | undefined, vid?: string): Variant | undefined {
  return trick?.variants?.find((v) => v.id === vid)
}

/** 動作列：方向盤 → 動作 → 行進方向 → 行進補充 */
function stepAction(s: Step): string {
  const parts: string[] = []
  if (s.turn) parts.push(`${s.turn === 'R' ? '↻ 右打' : '↺ 左打'}${s.amount ?? ''}`)
  if (s.action) parts.push(s.action)
  if (s.move) parts.push(s.move === 'fwd' ? '↑ 前進' : '↓ 倒車')
  if (s.note) parts.push(s.note)
  return parts.join('　')
}

function parseHash(): Route {
  const clean = location.hash.replace(/^#\/?/, '')
  const [view, id, vid] = clean.split('/')
  const trick = id ? tricksById[id] : undefined
  if (view === 'pick' && trick?.variants) return { view, id }
  // 舊的逐步分頁網址一律導到同一頁
  if ((view === 'full' || view === 'brief') && trick) {
    return { view: 'full', id, vid: variantOf(trick, vid)?.id }
  }
  return { view: 'home' }
}

function go(path: string) {
  if (location.hash === path) return
  location.hash = path
}

/** 首頁卡片點進去的第一站 */
function entry(t: Trick) {
  return t.variants ? `#/pick/${t.id}` : `#/full/${t.id}`
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
                onClick={() => go(`#/full/${trick.id}/${v.id}`)}
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
              <span>右打滿駛入</span>
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

function Sheet({
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
  const overview = variant?.overview
  const backTarget = variant ? `#/pick/${trick.id}` : '#/'

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
          </>
        ) : (
          <>
            <p className="full-mantra">{trick.oneLiner}</p>
            <p className="full-situation">{trick.situation}</p>
          </>
        )}

        {overview && (
          <figure className="overview">
            <a href={overview} target="_blank" rel="noreferrer" aria-label="放大看示意圖">
              <img src={overview} alt={`${variant?.name}路線示意圖`} />
            </a>
            <figcaption>{variant?.overviewNote ?? '俯視示意圖'}</figcaption>
          </figure>
        )}

        {steps.length > 0 && (
          <section className="block">
            <h3>步驟</h3>
            <ol className="steps">
              {steps.map((s, i) => {
                const act = stepAction(s)
                return (
                  <li key={i} className={s.image ? 'has-img' : undefined}>
                    <div className="step-main">
                      <span className="ol-no">{String(i + 1).padStart(2, '0')}</span>
                      {s.judge && <p className="judge">{s.judge}</p>}
                      {act && (
                        <div className="do">
                          <p className="do-text">{act}</p>
                        </div>
                      )}
                    </div>
                    {s.image && (
                      <figure className="step-img">
                        <img src={s.image} alt={`步驟 ${i + 1} 示意圖`} loading="lazy" />
                      </figure>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>
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

        {variant && (
          <button className="wide-link top-gap" onClick={() => go(`#/pick/${trick.id}`)}>
            換一種打法 ›
          </button>
        )}
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

  if (route.view === 'pick') {
    return <Pick trick={tricksById[route.id]} theme={theme} onToggle={toggle} />
  }
  if (route.view === 'full') {
    const trick = tricksById[route.id]
    const variant = variantOf(trick, route.vid)
    // 有多種打法的招式，沒指定打法就先去選
    if (trick.variants && !variant) {
      return <Pick trick={trick} theme={theme} onToggle={toggle} />
    }
    return <Sheet trick={trick} variant={variant} theme={theme} onToggle={toggle} />
  }
  return <Home theme={theme} onToggle={toggle} />
}
