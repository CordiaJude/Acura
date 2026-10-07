import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { Img } from './ui.jsx'
import { CONDITION_LABEL, detailHref, miles, money } from '../lib/inventory.js'
import { useGarage } from '../lib/garage.jsx'

export function ConditionBadge({ condition }) {
  const cls = condition === 'new' ? 'badge-new' : condition === 'certified' ? 'badge-cpo' : 'badge-used'
  return <span className={`badge ${cls}`}>{CONDITION_LABEL[condition]}</span>
}

function CardCarousel({ v, eager }) {
  const [i, setI] = useState(0)
  const photos = v.photos.length ? v.photos : [null]
  const n = photos.length
  const name = `${v.year} ${v.make} ${v.model} ${v.trim}`
  return (
    <div className="card-media" aria-roledescription="carousel" aria-label={`Photos of ${name}`}>
      <Link to={detailHref(v)} tabIndex={-1} aria-hidden="true">
        <Img
          src={photos[i]}
          alt={`${name}, ${v.exterior || ''} — photo ${i + 1} of ${v.photoCount}`}
          eager={eager && i === 0}
          ratio="4 / 3"
        />
      </Link>
      {v.stockPhotos && <span className="stock-label">Stock photo</span>}
      {n > 1 && (
        <>
          <button type="button" className="car-arrow glass-dark prev" onClick={() => setI((i - 1 + n) % n)} aria-label={`Previous photo of ${name}`}>
            <Icon name="chevL" />
          </button>
          <button type="button" className="car-arrow glass-dark next" onClick={() => setI((i + 1) % n)} aria-label={`Next photo of ${name}`}>
            <Icon name="chevR" />
          </button>
          <span className="car-count small" aria-hidden="true">
            {i + 1}/{n}
          </span>
        </>
      )}
    </div>
  )
}

export default function VehicleCard({ v, eager = false, layout = 'grid', headingLevel = 3 }) {
  const { saved, compare, toggleSaved, toggleCompare } = useGarage()
  const isSaved = saved.includes(v.stock)
  const inCompare = compare.includes(v.stock)
  const H = `h${headingLevel}`
  const showMsrp = v.msrp && v.msrp > v.price
  return (
    <article className={`vcard card ${layout === 'list' ? 'is-list' : ''}`}>
      <CardCarousel v={v} eager={eager} />
      <div className="vcard-body">
        <div className="vcard-top">
          <ConditionBadge condition={v.condition} />
          <div className="vcard-actions">
            <button type="button" className="icon-btn" aria-pressed={isSaved} onClick={() => toggleSaved(v.stock)} aria-label={`Save ${v.year} ${v.make} ${v.model}, stock ${v.stock}`}>
              <Icon name={isSaved ? 'heartFill' : 'heart'} />
            </button>
            <button type="button" className="icon-btn" aria-pressed={inCompare} onClick={() => toggleCompare(v.stock)} aria-label={`Compare ${v.year} ${v.make} ${v.model}, stock ${v.stock}`}>
              <Icon name="compare" />
            </button>
          </div>
        </div>
        <H className="vcard-title">
          <Link to={detailHref(v)}>
            <span className="vcard-ymm">
              {v.year} {v.make} {v.model}
            </span>{' '}
            <span className="vcard-trim">{v.trim}</span>
          </Link>
        </H>
        <div className="vcard-price">
          {showMsrp && (
            <span className="msrp num">
              <span className="sr-only">MSRP </span>
              <s>{money(v.msrp)}</s>
            </span>
          )}
          <span className="price num">{money(v.price)}</span>
          <span className="small muted">{v.condition === 'new' ? 'Dealer price' : 'Price'}</span>
        </div>
        <dl className="vcard-meta">
          {v.condition !== 'new' && (
            <div>
              <dt>Mileage</dt>
              <dd className="num">{miles(v.mileage)}</dd>
            </div>
          )}
          <div>
            <dt>Exterior</dt>
            <dd>{v.exterior || '—'}</dd>
          </div>
          <div>
            <dt>Stock #</dt>
            <dd className="num">{v.stock}</dd>
          </div>
        </dl>
        <Link to={detailHref(v)} className="btn btn-block btn-sm vcard-cta">
          View details<span className="sr-only">: {v.year} {v.make} {v.model} {v.trim}</span>
        </Link>
      </div>
    </article>
  )
}
