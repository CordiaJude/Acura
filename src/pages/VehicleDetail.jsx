import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Accordion, Breadcrumbs, Modal } from '../components/ui.jsx'
import { useTitle } from '../components/Page.jsx'
import Gallery from '../components/Gallery.jsx'
import Icon from '../components/Icon.jsx'
import PaymentCalculator from '../components/PaymentCalculator.jsx'
import SmartForm, { COMMENTS, CONTACT_FIELDS, CONTACT_PREF } from '../components/Form.jsx'
import VehicleCard, { ConditionBadge } from '../components/VehicleCard.jsx'
import { byStock, vehicleCache, CONDITION_LABEL, listingHrefFor, loadVehicle, miles, money, parseDescription, similarVehicles, vehicleName } from '../lib/inventory.js'
import { useGarage } from '../lib/garage.jsx'
import { PHONES, tel } from '../data/site.js'
import NotFound from './NotFound.jsx'

const SPEC_ORDER = ['Exterior', 'Interior', 'Entertainment', 'Mechanical', 'Safety', 'Tech Specs', 'Details']

function PriceBox({ v, onEPrice }) {
  const base = v.priceBreakdown.filter((b) => b.kind === 'base' || b.kind === 'fee')
  const total = v.priceBreakdown.find((b) => b.kind === 'total')
  const offers = v.priceBreakdown.filter((b) => b.kind === 'conditional_offer')
  return (
    <aside className="price-box glass" aria-labelledby="price-h">
      <h2 id="price-h" className="sr-only">
        Pricing
      </h2>
      <ul className="receipt">
        {base.map((b) => (
          <li key={b.label} className={`r-${b.kind}`}>
            <span>{b.label}</span>
            <span className="num">{b.kind === 'fee' ? '+ ' : ''}{money(b.amount)}</span>
          </li>
        ))}
        {total && (
          <li className="r-total">
            <span>{total.label}</span>
            <span className="num">{money(total.amount)}</span>
          </li>
        )}
      </ul>
      {v.finance?.length > 0 && (
        <ul className="finance-lines small">
          {v.finance.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
      {offers.length > 0 && (
        <div className="offers">
          <h3 className="h4">You may qualify for</h3>
          <ul className="receipt receipt-offers">
            {offers.map((o) => (
              <li key={o.label}>
                <span>{o.label}</span>
                <span className="num">{money(o.amount)}</span>
              </li>
            ))}
          </ul>
          <p className="legal mb-0">Conditions apply. Offers are not included in the Dealer Price above and require proof of eligibility. See dealer for details.</p>
        </div>
      )}
      <div className="price-ctas">
        <button type="button" className="btn btn-block" onClick={onEPrice}>
          Get E-Price
        </button>
        <a href="#payment" className="btn btn-secondary btn-block">
          Calculate Your Payment
        </a>
        <Link to={`/value-your-trade?stock=${v.stock}`} className="btn btn-secondary btn-block">
          Value Your Trade
        </Link>
        <Link to={`/apply-for-financing?stock=${v.stock}`} className="btn btn-secondary btn-block">
          Get Pre-Approved
        </Link>
        <a href={tel(PHONES.sales.number)} className="btn btn-ghost btn-block">
          <Icon name="phone" size={18} /> Call Sales <span className="num">{PHONES.sales.number}</span>
        </a>
      </div>
    </aside>
  )
}

function DetailSkeleton() {
  return (
    <div className="container detail" aria-busy="true" aria-label="Loading vehicle">
      <div className="skeleton" style={{ height: 40, width: '60%', margin: '24px 0' }} />
      <div className="detail-grid">
        <div className="skeleton" style={{ aspectRatio: '4 / 3' }} />
        <div className="skeleton" style={{ height: 420 }} />
      </div>
    </div>
  )
}

export default function VehicleDetail() {
  const { stock } = useParams()
  const slim = byStock.get(stock)
  const [v, setV] = useState(() => vehicleCache.get(stock) || null)
  const [modal, setModal] = useState(null)
  const { saved, compare, toggleSaved, toggleCompare, announce } = useGarage()
  useTitle(slim ? `${slim.condition === 'new' ? 'New' : 'Used'} ${vehicleName(slim)}` : 'Vehicle not found')

  useEffect(() => {
    let live = true
    if (vehicleCache.has(stock)) {
      setV(vehicleCache.get(stock))
      return
    }
    setV(null)
    if (slim) loadVehicle(stock).then((full) => live && setV(full))
    return () => {
      live = false
    }
  }, [stock, slim])

  if (!slim) return <NotFound />
  if (!v) return <DetailSkeleton />

  const name = vehicleName(v)
  const back = listingHrefFor(v)
  const isSaved = saved.includes(v.stock)
  const inCompare = compare.includes(v.stock)
  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: `${name} at Joe Bullard Acura`, url })
      else {
        await navigator.clipboard.writeText(url)
        announce('Link copied to clipboard')
      }
    } catch {
      /* share cancelled */
    }
  }
  const basic = [
    ['Exterior', v.colors?.exterior],
    ['Interior', v.colors?.interior],
    ['Drivetrain', v.drivetrain],
    ['Transmission', v.transmission],
    ['Engine', v.engine],
    ['MPG', v.mpg],
    ['Mileage', v.condition === 'new' && !v.mileage ? 'New' : miles(v.mileage)],
    ['Fuel', v.fuel],
    ['Body', v.body],
    ['Stock #', v.stock],
    ['VIN', v.vin],
  ]
  const desc = parseDescription(v.description)
  const similar = similarVehicles(byStock.get(v.stock))
  const trail = v.condition === 'certified' ? [['Used Vehicles', '/used-vehicles'], [back.label, back.href], [name]] : [[back.label, back.href], [name]]

  return (
    <>
      <div className="crumb-bar">
        <div className="container">
          <Breadcrumbs trail={trail} />
        </div>
      </div>
      <div className="container detail">
        <header className="title-bar">
          <div>
            <ConditionBadge condition={v.condition} />
            <h1 className="detail-title">
              <span className="sr-only">{CONDITION_LABEL[v.condition]} </span>
              {v.year} {v.make} {v.model} <span className="trim">{v.trim}</span>
            </h1>
            <p className="ids small">
              <span>
                VIN <span className="num">{v.vin}</span>
              </span>
              <span>
                Stock # <span className="num">{v.stock}</span>
              </span>
            </p>
          </div>
          <div className="title-actions">
            <button type="button" className="icon-btn" aria-pressed={isSaved} onClick={() => toggleSaved(v.stock)} aria-label="Save vehicle">
              <Icon name={isSaved ? 'heartFill' : 'heart'} />
            </button>
            <button type="button" className="icon-btn" aria-pressed={inCompare} onClick={() => toggleCompare(v.stock)} aria-label="Add to compare">
              <Icon name="compare" />
            </button>
            <button type="button" className="icon-btn" onClick={share} aria-label="Share vehicle">
              <Icon name="share" />
            </button>
            <button type="button" className="icon-btn" onClick={() => window.print()} aria-label="Print window sticker summary">
              <Icon name="print" />
            </button>
          </div>
        </header>

        <div className="detail-grid">
          <div className="detail-main">
            <Gallery photos={v.photos} name={name} stockPhotos={v.stockPhotos} />

            <section className="detail-sec" aria-labelledby="basic-h">
              <h2 id="basic-h">Basic info</h2>
              <dl className="basic-grid">
                {basic.map(([k, val]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd className={k === 'VIN' || k === 'Stock #' ? 'num' : undefined}>{val || '—'}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {v.keyFeatures?.length > 0 && (
              <section className="detail-sec" aria-labelledby="kf-h">
                <h2 id="kf-h">Key features</h2>
                <ul className="chips">
                  {v.keyFeatures.map((f) => (
                    <li key={f} className="chip">
                      <Icon name="check" size={16} /> {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="detail-sec prose" aria-labelledby="desc-h">
              <h2 id="desc-h">Description</h2>
              {desc.map((b, i) =>
                b.type === 'p' ? (
                  <p key={i}>{b.text}</p>
                ) : (
                  <ul key={i} className="list-check two-col-list">
                    {b.items.map((t, k) => (
                      <li key={k}>{t}</li>
                    ))}
                  </ul>
                ),
              )}
            </section>

            <section className="detail-sec" aria-labelledby="specs-h">
              <h2 id="specs-h">Vehicle details</h2>
              <Accordion
                items={SPEC_ORDER.filter((g) => v.specs?.[g]?.length).map((g) => ({
                  id: g,
                  title: `${g} (${v.specs[g].length})`,
                  content: (
                    <ul className="spec-list">
                      {v.specs[g].map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  ),
                }))}
              />
            </section>

            <section className="detail-sec" id="payment" aria-labelledby="pay-h">
              <h2 id="pay-h">Payment calculator</h2>
              <PaymentCalculator price={v.price} />
            </section>

            <section className="detail-sec" aria-labelledby="td-h">
              <div className="card card-pad test-drive">
                <div>
                  <h2 id="td-h" className="h3">
                    Want to drive it?
                  </h2>
                  <p className="mb-0">Pick a time and we'll have this {v.model} ready for you.</p>
                </div>
                <button type="button" className="btn btn-dark" onClick={() => setModal('drive')}>
                  Schedule a test drive
                </button>
              </div>
            </section>
          </div>

          <div className="detail-side">
            <PriceBox v={v} onEPrice={() => setModal('eprice')} />
          </div>
        </div>

        {similar.length > 0 && (
          <section className="section-sm" aria-labelledby="sim-h">
            <div className="section-head">
              <h2 id="sim-h">Similar vehicles</h2>
              <Link to={back.href} className="btn btn-ghost">
                Back to {back.label} <Icon name="arrowR" size={18} className="arrow" />
              </Link>
            </div>
            <ul className="vgrid vgrid-4">
              {similar.map((s) => (
                <li key={s.stock}>
                  <VehicleCard v={s} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="detail-foot small">
          <span>
            In stock since <span className="num">{v.dateInStock}</span>.
          </span>{' '}
          <a href={v.liveUrl} target="_blank" rel="noopener noreferrer">
            View on current site <Icon name="external" size={14} style={{ display: 'inline' }} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </footer>
      </div>

      <Modal open={modal === 'eprice'} onClose={() => setModal(null)} title="Get E-Price">
        <p className="muted">
          {name} · Stock # <span className="num">{v.stock}</span>
        </p>
        <SmartForm
          refPrefix="EPR"
          submitLabel="Get my E-Price"
          successTitle="Your E-Price request is in."
          successBody={<p className="mb-0 muted">A Joe Bullard Acura sales consultant will send your E-Price shortly. Demo only — nothing was sent.</p>}
          fields={[...CONTACT_FIELDS, CONTACT_PREF, { ...COMMENTS, label: 'Questions about this vehicle' }]}
        />
      </Modal>
      <Modal open={modal === 'drive'} onClose={() => setModal(null)} title="Schedule a test drive">
        <p className="muted">{name}</p>
        <SmartForm
          refPrefix="TD"
          submitLabel="Request test drive"
          successTitle="Test drive requested."
          fields={[
            ...CONTACT_FIELDS,
            { name: 'date', label: 'Preferred date', type: 'date', required: true, min: new Date().toISOString().slice(0, 10) },
            { name: 'time', label: 'Preferred time', type: 'select', required: true, options: ['Morning (9-12)', 'Afternoon (12-4)', 'Evening (4-7)'] },
          ]}
        />
      </Modal>
    </>
  )
}
