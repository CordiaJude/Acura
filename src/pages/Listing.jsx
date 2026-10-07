import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Breadcrumbs, Modal } from '../components/ui.jsx'
import { useTitle } from '../components/Page.jsx'
import VehicleCard from '../components/VehicleCard.jsx'
import Icon from '../components/Icon.jsx'
import SmartForm, { CONTACT_FIELDS } from '../components/Form.jsx'
import { PRESETS, money, number, vehicles } from '../lib/inventory.js'
import { OFFERS } from '../data/site.js'

const PER_PAGE = 24

// Facets: [urlKey, label, accessor]
const FACETS = [
  ['year', 'Year', (v) => String(v.year)],
  ['make', 'Make', (v) => v.make],
  ['model', 'Model', (v) => v.model],
  ['trim', 'Trim', (v) => v.trim],
  ['body', 'Body', (v) => v.body],
  ['fuel', 'Fuel', (v) => v.fuel],
  ['drive', 'Drivetrain', (v) => v.drivetrain],
  ['color', 'Exterior Color', (v) => v.exterior],
]
const SORTS = [
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['newest', 'Newest arrivals'],
  ['mileage-asc', 'Mileage: lowest first'],
  ['year-desc', 'Year: newest first'],
  ['year-asc', 'Year: oldest first'],
]
const MILEAGE_STEPS = [10000, 20000, 30000, 50000, 75000, 100000]

const list = (p, k) => (p.get(k) ? p.get(k).split('|').filter(Boolean) : [])

function applyFilters(pool, p, skip) {
  const q = (p.get('q') || '').trim().toLowerCase()
  const pmin = Number(p.get('pmin')) || 0
  const pmax = Number(p.get('pmax')) || Infinity
  const mmax = Number(p.get('mmax')) || Infinity
  const feats = list(p, 'feature')
  const sel = FACETS.map(([k, , get]) => [k, list(p, k), get])
  return pool.filter((v) => {
    if (q) {
      const hay = `${v.title} ${v.year} ${v.make} ${v.model} ${v.trim} ${v.vin} ${v.stock} ${v.exterior} ${v.keyFeatures.join(' ')}`.toLowerCase()
      if (!q.split(/\s+/).every((t) => hay.includes(t))) return false
    }
    if (skip !== 'price' && (v.price < pmin || v.price > pmax)) return false
    if (skip !== 'mileage' && mmax !== Infinity && (v.mileage == null || v.mileage > mmax)) return false
    if (skip !== 'feature' && feats.length && !feats.every((f) => v.keyFeatures.includes(f))) return false
    for (const [k, vals, get] of sel) if (k !== skip && vals.length && !vals.includes(get(v))) return false
    return true
  })
}

function sortList(arr, sort) {
  const a = [...arr]
  const by = {
    'price-asc': (x, y) => x.price - y.price,
    'price-desc': (x, y) => y.price - x.price,
    newest: (x, y) => y.dateInStock.localeCompare(x.dateInStock),
    'mileage-asc': (x, y) => (x.mileage ?? 1e9) - (y.mileage ?? 1e9),
    'year-desc': (x, y) => y.year - x.year || x.price - y.price,
    'year-asc': (x, y) => x.year - y.year || x.price - y.price,
  }[sort]
  return by ? a.sort(by) : a.sort((x, y) => x.price - y.price)
}

function FacetGroup({ k, label, options, selected, onToggle, defaultOpen, idp }) {
  const [open, setOpen] = useState(defaultOpen || selected.length > 0)
  const [all, setAll] = useState(false)
  const shown = all ? options : options.slice(0, 8)
  return (
    <div className="facet">
      <h3 className="facet-h">
        <button type="button" className="acc-btn" aria-expanded={open} aria-controls={`${idp}facet-${k}`} onClick={() => setOpen(!open)}>
          {label}
          {selected.length > 0 && <span className="facet-count">{selected.length}</span>}
          <Icon name="chevD" className="chev" />
        </button>
      </h3>
      <div id={`${idp}facet-${k}`} hidden={!open}>
        <ul className="facet-list">
          {shown.map(([val, count]) => (
            <li key={val}>
              <label className="check">
                <input type="checkbox" checked={selected.includes(val)} onChange={() => onToggle(k, val)} disabled={!count && !selected.includes(val)} />
                <span>
                  {val} <span className="muted num">({count})</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        {options.length > 8 && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAll(!all)} aria-expanded={all}>
            {all ? 'Show fewer' : `Show all ${options.length}`}
          </button>
        )}
      </div>
    </div>
  )
}

function Filters({ pool, params, setParam, toggle, preset, idp = '' }) {
  const prices = pool.map((v) => v.price)
  const lo = Math.floor(Math.min(...prices) / 1000) * 1000 || 0
  const hi = Math.ceil(Math.max(...prices) / 1000) * 1000 || 100000
  const pmin = Number(params.get('pmin')) || lo
  const pmax = Number(params.get('pmax')) || hi
  const [draft, setDraft] = useState([pmin, pmax])
  useEffect(() => setDraft([pmin, pmax]), [pmin, pmax])
  const commit = (a, b) => {
    setParam({ pmin: a > lo ? a : null, pmax: b < hi ? b : null })
  }

  const facetOptions = (k, get) => {
    const base = applyFilters(pool, params, k)
    const all = new Map()
    for (const v of pool) all.set(get(v), 0)
    for (const v of base) all.set(get(v), (all.get(get(v)) || 0) + 1)
    return [...all.entries()].filter(([val]) => val).sort((a, b) => (k === 'year' ? b[0].localeCompare(a[0]) : b[1] - a[1] || a[0].localeCompare(b[0])))
  }
  const featureOptions = (() => {
    const base = applyFilters(pool, params, 'feature')
    const m = new Map()
    for (const v of pool) for (const f of v.keyFeatures) m.set(f, 0)
    for (const v of base) for (const f of v.keyFeatures) m.set(f, m.get(f) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  })()
  const mmax = params.get('mmax') || ''

  return (
    <div className="filters">
      <div className="facet">
        <h3 className="facet-h facet-static">Price</h3>
        <div className="price-range">
          <p className="num price-range-val" aria-live="polite">
            {money(draft[0])} – {money(draft[1])}
          </p>
          <label className="sr-only" htmlFor={`${idp}pmin`}>
            Minimum price
          </label>
          <input id={`${idp}pmin`} type="range" min={lo} max={hi} step={1000} value={draft[0]}
            onChange={(e) => setDraft([Math.min(Number(e.target.value), draft[1]), draft[1]])}
            onPointerUp={() => commit(draft[0], draft[1])} onKeyUp={() => commit(draft[0], draft[1])} onBlur={() => commit(draft[0], draft[1])}
            aria-valuetext={money(draft[0])} />
          <label className="sr-only" htmlFor={`${idp}pmax`}>
            Maximum price
          </label>
          <input id={`${idp}pmax`} type="range" min={lo} max={hi} step={1000} value={draft[1]}
            onChange={(e) => setDraft([draft[0], Math.max(Number(e.target.value), draft[0])])}
            onPointerUp={() => commit(draft[0], draft[1])} onKeyUp={() => commit(draft[0], draft[1])} onBlur={() => commit(draft[0], draft[1])}
            aria-valuetext={money(draft[1])} />
        </div>
      </div>
      {preset.kind === 'used' && (
        <div className="facet">
          <h3 className="facet-h facet-static">
            <label htmlFor={`${idp}mmax`}>Mileage</label>
          </h3>
          <select id={`${idp}mmax`} className="select" value={mmax} onChange={(e) => setParam({ mmax: e.target.value || null })}>
            <option value="">Any mileage</option>
            {MILEAGE_STEPS.map((m) => (
              <option key={m} value={m}>
                Under {number(m)} mi
              </option>
            ))}
          </select>
        </div>
      )}
      {FACETS.map(([k, label, get], i) => {
        const opts = facetOptions(k, get)
        if (opts.length < 1) return null
        return <FacetGroup key={k} idp={idp} k={k} label={label} options={opts} selected={list(params, k)} onToggle={toggle} defaultOpen={i < 3} />
      })}
      <FacetGroup idp={idp} k="feature" label="Features" options={featureOptions} selected={list(params, 'feature')} onToggle={toggle} />
    </div>
  )
}

function Pagination({ page, pages, onPage }) {
  if (pages < 2) return null
  const nums = Array.from({ length: pages }, (_, i) => i + 1)
  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="icon-btn" disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
        <Icon name="chevL" />
      </button>
      {nums.map((n) => (
        <button key={n} type="button" className={`page-num${n === page ? ' is-current' : ''}`} aria-current={n === page ? 'page' : undefined} onClick={() => onPage(n)} aria-label={`Page ${n}`}>
          {n}
        </button>
      ))}
      <button type="button" className="icon-btn" disabled={page === pages} onClick={() => onPage(page + 1)} aria-label="Next page">
        <Icon name="chevR" />
      </button>
    </nav>
  )
}

function PromoTile({ kind }) {
  const offer = kind === 'new' ? OFFERS[0] : OFFERS[3]
  return (
    <aside className="promo-tile card on-dark" aria-label="Featured offer">
      <p className="eyebrow">{offer.eyebrow}</p>
      <p className="promo-head">{offer.headline}</p>
      <p className="small">{kind === 'new' ? offer.sub : 'Know your trade value before you shop.'}</p>
      <div className="row mt-2">
        {kind === 'new' ? (
          <Link to="/new-lease-specials" className="btn btn-light btn-sm">
            See lease specials
          </Link>
        ) : (
          <Link to="/value-your-trade" className="btn btn-light btn-sm">
            Value your trade
          </Link>
        )}
      </div>
    </aside>
  )
}

function EmptyModel({ preset }) {
  const isRdx = preset.model === 'RDX'
  return (
    <div className="empty card card-pad">
      <Icon name="car" size={40} />
      <h2>
        {preset.model ? `No new ${preset.model} models in stock right now` : 'Nothing in stock right now'}
      </h2>
      <p>
        {isRdx
          ? 'Our new RDX allocation is on the way. In the meantime, Acura Precision Certified RDX models are available today.'
          : `We don't have a new ${preset.model || 'vehicle'} on the lot at the moment. Tell us what you want and we'll let you know as soon as one arrives.`}
      </p>
      <div className="row">
        <Link className="btn btn-secondary" to="/used-vehicles/precision-used?model=RDX">
          See certified RDX
        </Link>
        <Link className="btn btn-ghost" to="/model-research">
          Research Acura models <Icon name="arrowR" size={18} className="arrow" />
        </Link>
      </div>
      <h3 className="mt-4">Notify me when one arrives</h3>
      <SmartForm
        refPrefix="NTF"
        submitLabel="Notify me"
        successTitle={`You're on the list for the ${preset.model || 'next arrival'}.`}
        fields={[
          ...CONTACT_FIELDS.slice(0, 3),
          { name: 'phone', label: 'Phone', type: 'tel' },
          { name: 'trim', label: 'Preferred trim', type: 'select', options: ['Base', 'Technology Package', 'A-Spec Package', 'Advance Package', 'Type S', 'Not sure yet'] },
          { name: 'color', label: 'Preferred color', placeholder: 'Any' },
        ]}
      />
    </div>
  )
}

export default function Listing({ presetKey, crumbs }) {
  const preset = PRESETS[presetKey]
  useTitle(preset.title)
  const [params, setParams] = useSearchParams()
  const [sheet, setSheet] = useState(false)
  const headRef = useRef(null)
  const pool = useMemo(() => vehicles.filter(preset.pool), [preset])
  const [q, setQ] = useState(params.get('q') || '')
  useEffect(() => setQ(params.get('q') || ''), [params])

  const setParam = (obj, keepPage = false) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(obj)) {
      if (v == null || v === '' || (Array.isArray(v) && !v.length)) next.delete(k)
      else next.set(k, Array.isArray(v) ? v.join('|') : String(v))
    }
    if (!keepPage) next.delete('page')
    setParams(next, { preventScrollReset: true, flushSync: true })
  }
  const toggle = (k, val) => {
    const cur = list(params, k)
    setParam({ [k]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] })
  }

  const results = useMemo(() => sortList(applyFilters(pool, params), params.get('sort')), [pool, params])
  const pages = Math.max(1, Math.ceil(results.length / PER_PAGE))
  const page = Math.min(pages, Math.max(1, Number(params.get('page')) || 1))
  const pageItems = results.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const view = params.get('view') === 'list' ? 'list' : 'grid'

  // Active filter chips
  const chips = []
  if (params.get('q')) chips.push([`Search: “${params.get('q')}”`, { q: null }])
  for (const [k, label] of FACETS) for (const val of list(params, k)) chips.push([`${label}: ${val}`, { [k]: list(params, k).filter((x) => x !== val) }])
  for (const f of list(params, 'feature')) chips.push([f, { feature: list(params, 'feature').filter((x) => x !== f) }])
  if (params.get('pmin') || params.get('pmax'))
    chips.push([`Price: ${money(Number(params.get('pmin')) || 0)} – ${params.get('pmax') ? money(Number(params.get('pmax'))) : 'any'}`, { pmin: null, pmax: null }])
  if (params.get('mmax')) chips.push([`Under ${number(Number(params.get('mmax')))} mi`, { mmax: null }])
  const clearAll = () => {
    const next = new URLSearchParams()
    if (params.get('sort')) next.set('sort', params.get('sort'))
    if (params.get('view')) next.set('view', params.get('view'))
    setParams(next, { preventScrollReset: true, flushSync: true })
  }

  const filterProps = { pool: pool.length ? pool : vehicles, params, setParam, toggle, preset }
  const trail = crumbs || [[preset.kind === 'new' ? 'New Vehicles' : 'Used Vehicles', preset.kind === 'new' ? '/new-vehicles' : '/used-vehicles'], [preset.crumb]]
  const dedupTrail = trail.length === 2 && trail[0][0] === trail[1][0] ? [trail[0].slice(0, 1)] : trail
  const promoAt = Math.min(6, pageItems.length)

  return (
    <>
      <div className="crumb-bar">
        <div className="container">
          <Breadcrumbs trail={dedupTrail} />
        </div>
      </div>
      <div className="container listing">
        <header className="listing-head">
          <h1>{preset.title}</h1>
          {preset.intro && <p className="lead">{preset.intro}</p>}
        </header>

        {pool.length === 0 ? (
          <EmptyModel preset={preset} />
        ) : (
          <div className="listing-grid">
            {/* Desktop rail; on small screens CSS hides it and the same filters open in a bottom sheet. */}
            <>
              <aside className="filter-rail" aria-labelledby="filters-h">
                <div className="filter-rail-head">
                  <h2 id="filters-h" className="h4 mb-0">
                    Filter
                  </h2>
                  {chips.length > 0 && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={clearAll}>
                      Clear all
                    </button>
                  )}
                </div>
                <Filters {...filterProps} />
              </aside>
              <Modal open={sheet} onClose={() => setSheet(false)} title="Filter vehicles" wide>
                <div className="sheet-body">
                  <Filters {...filterProps} idp="m-" />
                </div>
                <div className="sheet-foot">
                  <button type="button" className="btn btn-secondary" onClick={clearAll}>
                    Clear all
                  </button>
                  <button type="button" className="btn" onClick={() => setSheet(false)}>
                    Show {results.length} vehicles
                  </button>
                </div>
              </Modal>
            </>

            <div className="results">
              <div className="toolbar">
                <form
                  role="search"
                  className="search-row"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setParam({ q: q.trim() || null })
                  }}
                >
                  <label htmlFor="inv-q" className="sr-only">
                    Search inventory by keyword, VIN, stock number or feature
                  </label>
                  <input id="inv-q" type="search" className="input" placeholder="Search by model, VIN, stock # or feature" value={q} onChange={(e) => setQ(e.target.value)} />
                  <button type="submit" className="btn btn-navy">
                    <Icon name="search" size={18} />
                    Search
                  </button>
                </form>
                <div className="toolbar-row">
                  <h2 className="result-count" ref={headRef} aria-live="polite">
                    <span className="num">{results.length}</span> Vehicles for Sale in Mobile, AL
                  </h2>
                  <div className="row">
                    <button type="button" className="btn btn-secondary btn-sm filter-btn" onClick={() => setSheet(true)} aria-haspopup="dialog">
                      <Icon name="filter" size={18} /> Filters{chips.length ? ` (${chips.length})` : ''}
                    </button>
                    <label htmlFor="sort" className="sr-only">
                      Sort by
                    </label>
                    <select id="sort" className="select select-sm" value={params.get('sort') || 'price-asc'} onChange={(e) => setParam({ sort: e.target.value })}>
                      {SORTS.filter(([k]) => preset.kind === 'used' || k !== 'mileage-asc').map(([k, l]) => (
                        <option key={k} value={k}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <div className="view-toggle" role="group" aria-label="Layout">
                      <button type="button" className="icon-btn" aria-pressed={view === 'grid'} onClick={() => setParam({ view: null }, true)} aria-label="Grid view">
                        <Icon name="grid" />
                      </button>
                      <button type="button" className="icon-btn" aria-pressed={view === 'list'} onClick={() => setParam({ view: 'list' }, true)} aria-label="List view">
                        <Icon name="list" />
                      </button>
                    </div>
                  </div>
                </div>
                {chips.length > 0 && (
                  <div className="chip-row">
                    <ul className="chips" aria-label="Active filters">
                      {chips.map(([label, patch]) => (
                        <li key={label}>
                          <button type="button" className="chip chip-active" onClick={() => setParam(patch)} aria-label={`Remove filter ${label}`}>
                            {label} <Icon name="close" className="chip-x" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={clearAll}>
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {results.length === 0 ? (
                <div className="empty card card-pad">
                  <h2 className="h3">No vehicles match those filters</h2>
                  <p>Try removing a filter, or tell us what you're looking for and we'll find it.</p>
                  <div className="row">
                    <button type="button" className="btn" onClick={clearAll}>
                      Clear all filters
                    </button>
                    <Link to="/contact" className="btn btn-secondary">
                      Contact us
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className={`vgrid ${view === 'list' ? 'is-list' : ''}`} aria-label="Vehicles">
                  {pageItems.map((v, i) => (
                    <FragmentItem key={v.stock} showPromo={i === promoAt - 1 && pageItems.length >= 4} kind={preset.kind}>
                      <VehicleCard v={v} eager={i < 2} layout={view} />
                    </FragmentItem>
                  ))}
                </ul>
              )}
              <Pagination
                page={page}
                pages={pages}
                onPage={(n) => {
                  setParam({ page: n > 1 ? n : null }, true)
                  headRef.current?.scrollIntoView({ block: 'start' })
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function FragmentItem({ children, showPromo, kind }) {
  return (
    <>
      <li>{children}</li>
      {showPromo && (
        <li className="promo-li">
          <PromoTile kind={kind} />
        </li>
      )}
    </>
  )
}
