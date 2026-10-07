import { vehicles, loaders, meta } from 'virtual:inventory'

export { vehicles, meta }
export const byStock = new Map(vehicles.map((v) => [v.stock, v]))

// Full records already loaded (filled before hydration and during prerender).
export const vehicleCache = new Map()
export function loadVehicle(stock) {
  if (vehicleCache.has(stock)) return Promise.resolve(vehicleCache.get(stock))
  const load = loaders[stock]
  return load
    ? load().then((m) => {
        vehicleCache.set(stock, m.default)
        return m.default
      })
    : Promise.resolve(null)
}

const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const int = new Intl.NumberFormat('en-US')
export const money = (n) => (n == null || isNaN(n) ? '—' : usd0.format(n))
export const money2 = (n) => (n == null || isNaN(n) ? '—' : usd2.format(n))
export const miles = (n) => (n == null ? 'Not listed' : `${int.format(n)} mi`)
export const number = (n) => int.format(n)

export const CONDITION_LABEL = { new: 'New', certified: 'Acura Precision Certified', used: 'Pre-Owned' }
export const CONDITION_SHORT = { new: 'New', certified: 'Certified', used: 'Pre-Owned' }
export const isPreOwned = (v) => v.condition !== 'new'
export const vehicleName = (v) => `${v.year} ${v.make} ${v.model}${v.trim && v.trim !== v.model ? ` ${v.trim}` : ''}`
export const detailHref = (v) => `/inventory/${v.stock}`

export const newCount = (model) => vehicles.filter((v) => v.condition === 'new' && v.model === model).length

/** Rough body grouping used by presets. */
export const isSuv = (v) => v.body === 'SUVs'
export const isTruck = (v) => v.body === 'Trucks'

// Preset definitions for every listing route. `base` decides the pool; `filters` pre-select URL filters.
const CAPTURED = new Date(meta.captured || '2026-10-07')
const daysInStock = (v) => (CAPTURED - new Date(v.dateInStock)) / 86400000

// New Vehicle Specials: the six longest-in-stock new MDX units (matches "6 MDX today").
// [PLACEHOLDER: confirm which units are flagged as specials on the live site]
const NEW_SPECIALS = new Set(
  vehicles
    .filter((v) => v.condition === 'new' && v.model === 'MDX')
    .sort((a, b) => a.dateInStock.localeCompare(b.dateInStock))
    .slice(0, 6)
    .map((v) => v.stock),
)
// Used Car Specials: pre-owned units in stock 30+ days. [PLACEHOLDER: confirm rule with used-car manager]
const usedSpecial = (v) => isPreOwned(v) && daysInStock(v) >= 30

export const LOW_MILEAGE_MAX = 30000

export const PRESETS = {
  'new': { title: 'New Acura Vehicles', crumb: 'New Vehicles', pool: (v) => v.condition === 'new', kind: 'new' },
  'new-mdx': { title: 'New Acura MDX', crumb: 'MDX', pool: (v) => v.condition === 'new' && v.model === 'MDX', kind: 'new', model: 'MDX' },
  'new-adx': { title: 'New Acura ADX', crumb: 'ADX', pool: (v) => v.condition === 'new' && v.model === 'ADX', kind: 'new', model: 'ADX' },
  'new-integra': { title: 'New Acura Integra', crumb: 'Integra', pool: (v) => v.condition === 'new' && v.model === 'Integra', kind: 'new', model: 'Integra' },
  'new-rdx': { title: 'New Acura RDX', crumb: 'RDX', pool: (v) => v.condition === 'new' && v.model === 'RDX', kind: 'new', model: 'RDX' },
  'new-tlx': { title: 'New Acura TLX', crumb: 'TLX', pool: (v) => v.condition === 'new' && v.model === 'TLX', kind: 'new', model: 'TLX' },
  'new-suvs': { title: 'New Acura SUVs', crumb: 'New SUVs', pool: (v) => v.condition === 'new' && isSuv(v), kind: 'new' },
  'new-specials': {
    title: 'New Vehicle Specials',
    crumb: 'New Vehicle Specials',
    pool: (v) => NEW_SPECIALS.has(v.stock),
    kind: 'new',
    intro: 'Hand-picked new Acura models with dealer savings. Conditional Acura offers may lower your price further; see each vehicle for details.',
  },
  'used': { title: 'Used Vehicles', crumb: 'Used Vehicles', pool: isPreOwned, kind: 'used' },
  'used-cpo': {
    title: 'Acura Precision Certified Used Vehicles',
    crumb: 'Precision Certified Used',
    pool: (v) => v.condition === 'certified',
    kind: 'used',
    intro: 'Every Acura Precision Certified vehicle passes a rigorous multi-point inspection and comes with Acura-backed warranty coverage.',
  },
  'used-specials': { title: 'Used Car Specials', crumb: 'Used Car Specials', pool: usedSpecial, kind: 'used' },
  'used-suvs': { title: 'Used SUVs', crumb: 'Used SUVs', pool: (v) => isPreOwned(v) && isSuv(v), kind: 'used' },
  'used-trucks': { title: 'Used Trucks', crumb: 'Used Trucks', pool: (v) => isPreOwned(v) && isTruck(v), kind: 'used' },
  'used-under-20k': { title: 'Used Vehicles Under $20K', crumb: 'Used Under 20K', pool: (v) => isPreOwned(v) && v.price < 20000, kind: 'used' },
  'used-low-mileage': {
    title: 'Low Mileage Used Vehicles',
    crumb: 'Low Mileage Used Vehicles',
    pool: (v) => isPreOwned(v) && v.mileage != null && v.mileage < LOW_MILEAGE_MAX,
    kind: 'used',
    intro: `Pre-owned vehicles with fewer than ${int.format(LOW_MILEAGE_MAX)} miles.`,
  },
}

export function listingHrefFor(v) {
  if (v.condition === 'new') return { label: 'New Vehicles', href: '/new-vehicles' }
  if (v.condition === 'certified') return { label: 'Precision Certified Used', href: '/used-vehicles/precision-used' }
  return { label: 'Used Vehicles', href: '/used-vehicles' }
}

/** Split the scraped description into paragraphs and bullet lists. */
export function parseDescription(text = '') {
  const clean = text
    .replace(/([a-z0-9)])\.([A-Z])/g, '$1. $2')
    .replace(/\s*•\s*/g, '- ') // some listings use • bullets
    .trim()
  const parts = clean.split(/- (?=[A-Z0-9"(])/)
  const blocks = []
  const intro = parts.shift()?.trim()
  if (intro) blocks.push({ type: 'p', text: intro })
  if (parts.length) {
    const bullets = parts.map((p) => p.trim())
    // The last bullet is often glued to the closing paragraph ("...SuspensionThe ADX...").
    const last = bullets.pop()
    const m = last.match(
      /^(.*?[a-z0-9)"%A-Z])((?:The|This|Indulge|Slip|Meticulously|Elevate|Discover|Every|Powered|Crafted|At|Well|Don't|With|Call|Visit|Inside|Whether|Experience|Come|Its|Our|Step|Here|Schedule)\b.*)$/,
    )
    if (m && m[1].length > 3) {
      bullets.push(m[1].trim())
      blocks.push({ type: 'ul', items: bullets })
      splitSentences(m[2]).forEach((t) => blocks.push({ type: 'p', text: t }))
    } else {
      bullets.push(last)
      blocks.push({ type: 'ul', items: bullets })
    }
  }
  return blocks
}

// Break long paragraphs into ~3 sentence chunks for readability.
function splitSentences(text) {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [text]
  const out = []
  for (let i = 0; i < sentences.length; i += 3) out.push(sentences.slice(i, i + 3).join('').trim())
  return out.filter(Boolean)
}

/** Monthly payment for a simple-interest auto loan. */
export function monthlyPayment(principal, aprPct, months) {
  const p = Math.max(0, principal)
  if (!months) return 0
  const r = aprPct / 100 / 12
  if (r === 0) return p / months
  return (p * r) / (1 - Math.pow(1 + r, -months))
}

export function similarVehicles(v, n = 4) {
  return vehicles
    .filter((x) => x.stock !== v.stock && (x.model === v.model || x.body === v.body))
    .sort((a, b) => {
      const sa = a.model === v.model ? 0 : 1
      const sb = b.model === v.model ? 0 : 1
      return sa - sb || Math.abs(a.price - v.price) - Math.abs(b.price - v.price)
    })
    .slice(0, n)
}

/** Count of features across a set; used by the "See what you get" section. */
export function topFeatures(list, n = 9) {
  const c = new Map()
  for (const v of list) for (const f of v.keyFeatures) c.set(f, (c.get(f) || 0) + 1)
  return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([f]) => f)
}
