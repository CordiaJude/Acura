import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Page from '../components/Page.jsx'
import VehicleCard from '../components/VehicleCard.jsx'
import Icon from '../components/Icon.jsx'
import { Img } from '../components/ui.jsx'
import { useGarage, COMPARE_MAX } from '../lib/garage.jsx'
import { byStock, CONDITION_LABEL, detailHref, miles, money, vehicles } from '../lib/inventory.js'
import { NAV } from '../data/site.js'

export function MyProfile() {
  const { saved, toggleSaved } = useGarage()
  const list = saved.map((s) => byStock.get(s)).filter(Boolean)
  return (
    <Page title="My Profile" crumbs={[['My Profile']]} intro="Your saved vehicles are stored in this browser only." sidebar={false}>
      <h2>Saved vehicles ({list.length})</h2>
      {list.length === 0 ? (
        <div className="empty card card-pad">
          <Icon name="heart" size={36} />
          <p>Tap the heart on any vehicle to save it here.</p>
          <div className="row">
            <Link to="/new-vehicles" className="btn">
              Shop new
            </Link>
            <Link to="/used-vehicles" className="btn btn-secondary">
              Shop used
            </Link>
          </div>
        </div>
      ) : (
        <>
          <ul className="vgrid vgrid-4">
            {list.map((v) => (
              <li key={v.stock}>
                <VehicleCard v={v} />
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-secondary mt-3" onClick={() => list.forEach((v) => toggleSaved(v.stock))}>
            Clear saved vehicles
          </button>
        </>
      )}
    </Page>
  )
}

export function Compare() {
  const { compare, toggleCompare } = useGarage()
  const list = compare.map((s) => byStock.get(s)).filter(Boolean)
  const rows = [
    ['Condition', (v) => CONDITION_LABEL[v.condition]],
    ['Price', (v) => money(v.price)],
    ['MSRP', (v) => (v.msrp ? money(v.msrp) : '—')],
    ['Mileage', (v) => (v.condition === 'new' ? 'New' : miles(v.mileage))],
    ['Exterior', (v) => v.exterior],
    ['Interior', (v) => v.interior],
    ['Engine', (v) => v.engine],
    ['Transmission', (v) => v.transmission],
    ['Drivetrain', (v) => v.drivetrain],
    ['MPG', (v) => v.mpg || '—'],
    ['Body', (v) => v.body],
    ['Stock #', (v) => v.stock],
  ]
  const allFeatures = [...new Set(list.flatMap((v) => v.keyFeatures))].sort()
  return (
    <Page title="Compare Vehicles" crumbs={[['Compare']]} intro={`Compare up to ${COMPARE_MAX} vehicles side by side.`} sidebar={false}>
      {list.length === 0 ? (
        <div className="empty card card-pad">
          <p>Use the compare button on any vehicle card to add it here.</p>
          <Link to="/new-vehicles" className="btn">
            Browse inventory
          </Link>
        </div>
      ) : (
        <div className="table-wrap" role="region" aria-label="Comparison table" tabIndex={0}>
          <table className="compare-table">
            <thead>
              <tr>
                <td />
                {list.map((v) => (
                  <th key={v.stock} scope="col">
                    <Img src={v.photos[0]} alt="" ratio="4 / 3" />
                    <Link to={detailHref(v)}>
                      {v.year} {v.make} {v.model} {v.trim}
                    </Link>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleCompare(v.stock)}>
                      Remove
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, get]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {list.map((v) => (
                    <td key={v.stock} className="num">
                      {get(v)}
                    </td>
                  ))}
                </tr>
              ))}
              {allFeatures.map((f) => (
                <tr key={f}>
                  <th scope="row">{f}</th>
                  {list.map((v) => (
                    <td key={v.stock}>{v.keyFeatures.includes(f) ? <><Icon name="check" size={18} /><span className="sr-only">Yes</span></> : <span aria-label="No">—</span>}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  )
}

const PAGES = NAV.flatMap((n) => n.items.map(([label, href]) => ({ label, href, group: n.label }))).concat([
  { label: 'Contact Us', href: '/contact', group: 'Dealership' },
  { label: 'Directions', href: '/directions', group: 'Dealership' },
  { label: 'Careers', href: '/careers', group: 'Dealership' },
  { label: 'Specials', href: '/specials', group: 'Specials' },
])

export function Search() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const [draft, setDraft] = useState(q)
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
  const results = useMemo(() => {
    if (!terms.length) return []
    return vehicles.filter((v) => {
      const hay = `${v.title} ${v.year} ${v.make} ${v.model} ${v.trim} ${v.vin} ${v.stock} ${v.exterior} ${v.keyFeatures.join(' ')}`.toLowerCase()
      return terms.every((t) => hay.includes(t))
    })
  }, [q]) // eslint-disable-line react-hooks/exhaustive-deps
  const pages = terms.length ? [...new Map(PAGES.filter((p) => terms.some((t) => p.label.toLowerCase().includes(t))).map((p) => [p.href, p])).values()] : []
  return (
    <Page title="Search" crumbs={[['Search']]} sidebar={false}>
      <form
        role="search"
        className="search-row"
        onSubmit={(e) => {
          e.preventDefault()
          setParams(draft.trim() ? { q: draft.trim() } : {})
        }}
      >
        <label htmlFor="search-q" className="sr-only">
          Search
        </label>
        <input id="search-q" type="search" className="input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="MDX, VIN, stock #, service…" />
        <button type="submit" className="btn btn-navy">
          <Icon name="search" size={18} /> Search
        </button>
      </form>
      {q && (
        <p className="mt-2" role="status">
          {results.length} vehicles and {pages.length} pages match “{q}”.
        </p>
      )}
      {pages.length > 0 && (
        <section aria-labelledby="sp-h" className="mt-3">
          <h2 id="sp-h" className="h3">
            Pages
          </h2>
          <ul className="chips">
            {pages.map((p) => (
              <li key={p.href}>
                <Link to={p.href} className="chip">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {results.length > 0 && (
        <section aria-labelledby="sv-h" className="mt-3">
          <h2 id="sv-h" className="h3">
            Vehicles
          </h2>
          <ul className="vgrid vgrid-4">
            {results.slice(0, 24).map((v) => (
              <li key={v.stock}>
                <VehicleCard v={v} />
              </li>
            ))}
          </ul>
          {results.length > 24 && (
            <p className="mt-2">
              Showing 24 of {results.length}. <Link to={`/new-vehicles?q=${encodeURIComponent(q)}`}>See new matches</Link> ·{' '}
              <Link to={`/used-vehicles?q=${encodeURIComponent(q)}`}>See used matches</Link>
            </p>
          )}
        </section>
      )}
      {q && !results.length && !pages.length && (
        <p className="mt-2">
          Nothing matched. Try a model like “MDX”, a stock number, or browse <Link to="/new-vehicles">new</Link> and <Link to="/used-vehicles">used</Link> inventory.
        </p>
      )}
    </Page>
  )
}
