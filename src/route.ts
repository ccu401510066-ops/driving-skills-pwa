import { tricksById, type Trick, type Variant } from './data/tricks'

export type Route =
  | { view: 'home' }
  | { view: 'pick'; id: string; side?: string }
  | { view: 'full'; id: string; side?: string; method?: string }

export const isGroup = (v: Variant) => (v.variants?.length ?? 0) > 0

export const twoLevels = (trick: Trick) => (trick.variants ?? []).some(isGroup)

export function sideOf(trick: Trick | undefined, sideId?: string): Variant | undefined {
  return trick?.variants?.find((v) => v.id === sideId && isGroup(v))
}

export function methodOf(
  trick: Trick | undefined,
  sideId?: string,
  methodId?: string
): Variant | undefined {
  if (!trick?.variants) return undefined
  const side = sideOf(trick, sideId)
  if (side) return side.variants?.find((m) => m.id === methodId)
  // 單層打法：sideId 本身就是打法 id；雙層時打法 id 在 methodId
  return trick.variants.find((v) => v.id === (methodId ?? sideId) && !isGroup(v))
}

export function methodPath(trick: Trick, side: Variant | undefined, method: Variant) {
  return side
    ? `#/full/${trick.id}/${side.id}/${method.id}`
    : `#/full/${trick.id}/${method.id}`
}

/** 首頁卡片點進去的第一站 */
export function entry(t: Trick) {
  return t.variants ? `#/pick/${t.id}` : `#/full/${t.id}`
}

export function parseRoute(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '')
  const [view, id, a, b] = clean.split('/')
  const trick = id ? tricksById[id] : undefined
  if (view === 'pick' && trick?.variants) {
    return { view: 'pick', id, side: sideOf(trick, a)?.id }
  }
  // 舊的逐步分頁網址一律導到同一頁
  if ((view === 'full' || view === 'brief') && trick) {
    if (!trick.variants) return { view: 'full', id }
    const side = sideOf(trick, a)
    const method = methodOf(trick, a, b)
    if (method) return { view: 'full', id, side: side?.id, method: method.id }
    return { view: 'pick', id, side: side?.id }
  }
  return { view: 'home' }
}
