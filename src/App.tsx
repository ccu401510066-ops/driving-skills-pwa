import { useCallback, useEffect, useState } from 'react'
import { tricks, tricksById, type Step, type Trick, type Variant } from './data/tricks'
import { entry, methodOf, methodPath, parseRoute, sideOf, twoLevels, type Route } from './route'

/** 動作列：方向盤 → 動作 → 行進方向 → 行進補充 */
function stepAction(s: Step): string {
  const parts: string[] = []
  if (s.turn) parts.push(`${s.turn === 'R' ? '↻ 右打' : '↺ 左打'}${s.amount ?? ''}`)
  if (s.action) parts.push(s.action)
  if (s.move) parts.push(s.move === 'fwd' ? '↑ 前進' : '↓ 倒車')
  if (s.note) parts.push(s.note)
  return parts.join('　')
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
            <button className="card-main" onClick={() => go(entry(t))}>
              <span className="no" aria-hidden="true">
                {t.no}
              </span>
              <span className="card-body">
                <span className="card-name">
                  {t.name}
                  {t.badge && <span className="card-sub">{t.badge}</span>}
                </span>
                {t.oneLiner && <span className="card-one">{t.oneLiner}</span>}
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

function Pick({
  trick,
  sideId,
  theme,
  onToggle
}: {
  trick: Trick
  sideId?: string
  theme: 'dark' | 'light'
  onToggle: () => void
}) {
  const all = trick.variants ?? []
  const grouped = twoLevels(trick)
  const side = sideId ? all.find((s) => s.id === sideId) : undefined
  const items = grouped ? (side?.variants ?? []) : all
  /** 只有兩個選項（例如左側／右側庫位）：上下排、字放大、卡片不放起點那行 */
  const bigPick = !side && items.length === 2
  const compare = grouped ? side?.compare : trick.compare
  const listTitle = side ? '選一種打法' : (trick.pickTitle ?? '選一種打法')
  const backTarget = grouped && side ? `#/pick/${trick.id}` : '#/'
  const mantra = side ? side.name : trick.oneLiner
  const situation = side ? side.when : trick.situation

  return (
    <div className="full">
      <header className="full-head">
        <button className="icon-btn" onClick={() => go(backTarget)} aria-label="回上一頁">
          ‹
        </button>
        <div className="brief-title">
          <span className="no-small">{trick.no}</span>
          <span>{grouped && side ? `${trick.name}・${side.name}` : trick.name}</span>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggle} />
      </header>

      <main className="full-body">
        {mantra && <p className="full-mantra">{mantra}</p>}
        {situation && <p className="full-situation">{situation}</p>}

        {side?.start && <p className="variant-start start-line">起點：{side.start}</p>}

        <section className="block">
          <h3>{listTitle}</h3>
          <div className={bigPick ? 'variant-list big' : 'variant-list'}>
            {items.map((v, i) => (
              <button
                className={bigPick ? 'variant-card big' : 'variant-card'}
                key={v.id}
                onClick={() =>
                  go(grouped && !side ? `#/pick/${trick.id}/${v.id}` : methodPath(trick, side, v))
                }
              >
                {bigPick ? (
                  <>
                    <span className="variant-name">{v.name}</span>
                    <span className="chev" aria-hidden="true">
                      ›
                    </span>
                  </>
                ) : (
                  <>
                    <span className="variant-top">
                      <span className="variant-no">{String(i + 1).padStart(2, '0')}</span>
                      <span className="variant-name">{v.name}</span>
                      {v.sway && <span className="variant-sway">{v.sway}</span>}
                    </span>
                    {v.when && <span className="variant-when">{v.when}</span>}
                    {v.start && <span className="variant-start">起點：{v.start}</span>}
                    {grouped && !side && (
                      <span className="variant-start more">
                        {(v.variants ?? []).length} 種打法 ›
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </section>

        {compare && (
          <section className="block">
            <h3>打法比較</h3>
            <div className="compare">
              <div className="compare-row compare-head">
                {compare.head.map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </div>
              {compare.rows.map((row) => (
                <div className="compare-row" key={row[0]}>
                  {row.map((cell, i) => (
                    <span key={i}>{cell}</span>
                  ))}
                </div>
              ))}
            </div>
            {compare.note && <p className="compare-note">{compare.note}</p>}
          </section>
        )}
      </main>
    </div>
  )
}

function Sheet({
  trick,
  variant,
  side,
  theme,
  onToggle
}: {
  trick: Trick
  variant?: Variant
  side?: Variant
  theme: 'dark' | 'light'
  onToggle: () => void
}) {
  const steps = variant?.steps ?? trick.steps
  const overview = variant?.overview
  const mantra = variant ? (side ? variant.name : (variant.sway || trick.oneLiner)) : trick.oneLiner
  const situation = variant ? variant.when : trick.situation
  const backTarget = side
    ? `#/pick/${trick.id}/${side.id}`
    : trick.variants
      ? `#/pick/${trick.id}`
      : '#/'

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
        {mantra && <p className="full-mantra">{mantra}</p>}
        {(side || situation) && (
          <p className="full-situation">
            {side && <span className="side-chip">{side.name}</span>}
            {situation}
          </p>
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

        {variant && (
          <button className="wide-link top-gap" onClick={() => go(backTarget)}>
            換一種打法 ›
          </button>
        )}
      </main>
    </div>
  )
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute(location.hash))
  const { theme, setTheme } = useTheme()
  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [setTheme])

  useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute(location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (route.view === 'pick') {
    return (
      <Pick
        trick={tricksById[route.id]}
        sideId={route.side}
        theme={theme}
        onToggle={toggle}
      />
    )
  }
  if (route.view === 'full') {
    const trick = tricksById[route.id]
    // 有多種打法的招式，沒指定打法就先去選
    if (trick.variants) {
      const side = sideOf(trick, route.side)
      const method = methodOf(trick, route.side, route.method)
      if (!method) {
        return (
          <Pick trick={trick} sideId={side?.id} theme={theme} onToggle={toggle} />
        )
      }
      return (
        <Sheet trick={trick} variant={method} side={side} theme={theme} onToggle={toggle} />
      )
    }
    return <Sheet trick={trick} theme={theme} onToggle={toggle} />
  }
  return <Home theme={theme} onToggle={toggle} />
}
