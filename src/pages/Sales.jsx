import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Page, { Section } from '../components/Page.jsx'
import { Accordion, GhostLink, Img, Modal, Placeholder, WithPlaceholders } from '../components/ui.jsx'
import SmartForm, { COMMENTS, CONTACT_FIELDS } from '../components/Form.jsx'
import Icon from '../components/Icon.jsx'
import { FEATURED_LEASE, MODELS, OFFERS } from '../data/site.js'
import { byStock, money, newCount, vehicleName, vehicles } from '../lib/inventory.js'

const NEW = ['New Vehicles', '/new-vehicles']
const YEARS = Array.from({ length: 2027 - 1999 }, (_, i) => String(2027 - i))
const modelImg = (m) =>
  vehicles.find((v) => v.stockPhotos && v.model === m)?.photos[0] || vehicles.find((v) => v.model === m && v.make === 'Acura')?.photos[0]

const VEHICLE_FIELDS = [
  { name: 'year', label: 'Year', type: 'select', required: true, options: YEARS },
  { name: 'make', label: 'Make', required: true, autoComplete: 'off' },
  { name: 'model', label: 'Model', required: true },
  { name: 'trim', label: 'Trim' },
  { name: 'mileage', label: 'Mileage', type: 'number', required: true, min: 0, max: 999999 },
  { name: 'vin', label: 'VIN', type: 'vin', hint: 'Optional, but speeds up your offer.' },
  { name: 'condition', label: 'Condition', type: 'select', required: true, options: ['Excellent', 'Good', 'Fair', 'Needs work'] },
]

export function SellToUs() {
  return (
    <Page
      title="Sell Your Current Vehicle To Us"
      crumbs={[['Sell/Trade', '/sell-to-us'], ['Sell Your Car']]}
      hero
      intro="Get a fair offer on your car, truck or SUV, whether or not you buy from us."
      actions={
        <>
          <a href="#sell-form" className="btn btn-light">
            Sell Your Car
          </a>
          <Link to="/contact" className="btn btn-outline-light">
            Contact Us
          </Link>
        </>
      }
    >
      <Section id="sell-form" title="Tell us about your vehicle">
        <div className="card card-pad">
          <SmartForm
            steps={[
              { title: 'Personal Information', fields: CONTACT_FIELDS },
              { title: 'Vehicle Information', fields: [...VEHICLE_FIELDS, { ...COMMENTS, label: 'Anything we should know?' }] },
            ]}
            refPrefix="SELL"
            submitLabel="Get my offer"
            successTitle="Thanks — your vehicle details are in."
            successBody={<p className="mb-0 muted">An appraiser will contact you with next steps. Demo only — nothing was sent.</p>}
          />
        </div>
      </Section>
      <Section id="why" title="Why Sell Us Your Car">
        <ul className="list-check">
          <li>We buy all makes and models, not just Acura.</li>
          <li>No obligation to buy a vehicle from us.</li>
          <li>We handle the paperwork, including paying off your loan.</li>
          <li>Get paid quickly, often the same day.</li>
        </ul>
      </Section>
      <Section id="benefits" title="Benefits of Trading In">
        <p>Trading in can lower the taxable price of your next vehicle in Alabama and saves you the time and risk of a private sale. Your trade value can go straight toward your down payment.</p>
      </Section>
      <Section id="how" title="How Trading In Works">
        <ol className="num-steps">
          <li><strong>Share your vehicle details</strong> online or in person.</li>
          <li><strong>Get an appraisal</strong> from our used-car team.</li>
          <li><strong>Accept your offer</strong> and apply it to your next Acura, or take a check.</li>
        </ol>
      </Section>
    </Page>
  )
}

export function ValueYourTrade() {
  const [params] = useSearchParams()
  const target = byStock.get(params.get('stock') || '')
  return (
    <Page title="Value Your Trade" crumbs={[['Finance Center', '/finance'], ['Value Your Trade']]} intro="Tell us about your vehicle and get a trade-in value from our appraisers.">
      {target && (
        <p className="card card-pad small">
          Trading toward: <Link to={`/inventory/${target.stock}`}>{vehicleName(target)}</Link> (stock <span className="num">{target.stock}</span>)
        </p>
      )}
      <div className="card card-pad">
        <SmartForm
          steps={[
            { title: 'Vehicle', fields: [...VEHICLE_FIELDS, { name: 'payoff', label: 'Do you owe money on it?', type: 'select', options: ['No', 'Yes, financed', 'Yes, leased'] }] },
            { title: 'Contact', fields: CONTACT_FIELDS },
          ]}
          refPrefix="TRD"
          submitLabel="Get my trade value"
          successTitle="Trade-in request received."
          successBody={(v) => (
            <p className="mb-0 muted">
              We'll review your {v.year} {v.make} {v.model} and follow up with a value. Demo only — nothing was sent.
            </p>
          )}
        />
      </div>
    </Page>
  )
}

function OfferCard({ o, onDetails }) {
  return (
    <article className="offer-card card">
      {o.stockPhotoOf && (
        <Img src={o.stockPhotoOf === 'certified' ? vehicles.find((v) => v.condition === 'certified')?.photos[0] : modelImg(o.stockPhotoOf)} alt={o.eyebrow} ratio="16 / 10" className={o.stockPhotoOf !== 'certified' ? 'cutout' : ''} />
      )}
      <div className="card-pad">
        <p className="eyebrow">{o.eyebrow}</p>
        <h3>{o.headline}</h3>
        <p className="small">
          <WithPlaceholders text={o.sub} />
        </p>
        <div className="row">
          <Link to={o.cta[1]} className="btn btn-sm">
            {o.cta[0]}
          </Link>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onDetails(o)}>
            See details
          </button>
        </div>
      </div>
    </article>
  )
}

export function NewLeaseSpecials() {
  const [disc, setDisc] = useState(false)
  const [legal, setLegal] = useState(null)
  const f = FEATURED_LEASE
  return (
    <Page title="New Lease Specials" crumbs={[NEW, ['New Lease Specials']]} intro="Current Acura lease offers at Joe Bullard Acura in Mobile, AL.">
      <article className="featured-lease card">
        <Img src={modelImg('MDX')} alt="2026 Acura MDX SH-AWD" ratio="16 / 10" className="cutout" />
        <div className="card-pad">
          <span className="badge badge-new">{f.label}</span>
          <h2 className="mt-1">{f.title}</h2>
          <div className="lease-figs">
            <div>
              <span className="lease-big num">{money(f.monthly)}</span>
              <span className="small">per month / {f.months} months</span>
            </div>
            <div>
              <span className="lease-mid num">{money(f.dueAtSigning)}</span>
              <span className="small">due at lease signing</span>
            </div>
            <div>
              <span className="lease-mid num">{money(f.leaseEnd)}</span>
              <span className="small">lease end purchase option</span>
            </div>
          </div>
          <div className="row mt-2">
            <Link to="/new-vehicles/mdx" className="btn">
              Shop MDX
            </Link>
            <button type="button" className="btn btn-secondary" onClick={() => setDisc(true)}>
              View Disclaimer
            </button>
          </div>
        </div>
      </article>
      <Section id="more" title="More offers">
        <div className="grid grid-3">
          {OFFERS.slice(0, 3).map((o) => (
            <OfferCard key={o.id} o={o} onDetails={setLegal} />
          ))}
        </div>
      </Section>
      <Modal open={disc} onClose={() => setDisc(false)} title="Lease disclaimer">
        <p className="small">
          <WithPlaceholders text={f.disclaimer} />
        </p>
      </Modal>
      <Modal open={!!legal} onClose={() => setLegal(null)} title={legal ? `${legal.eyebrow}: offer details` : ''}>
        <p className="small">
          <WithPlaceholders text={legal?.legal} />
        </p>
      </Modal>
    </Page>
  )
}

export function SpecialsHub() {
  const [legal, setLegal] = useState(null)
  return (
    <Page title="Specials" crumbs={[['Specials']]} intro="Every current offer from Joe Bullard Acura in one place.">
      <div className="grid grid-2">
        {[
          ['New Vehicle Specials', '/new-vehicles/specials', 'car', 'Dealer savings on select new MDX models.'],
          ['New Lease Specials', '/new-lease-specials', 'tag', `Featured: 2026 MDX SH-AWD from $${FEATURED_LEASE.monthly}/mo.`],
          ['Used Car Specials', '/used-vehicles/specials', 'dollar', 'Pre-owned vehicles priced to move.'],
          ['Service Specials & Coupons', '/service-specials', 'wrench', 'Spend & Save up to $100 and more.'],
          ['Acura National Offers', '/acura-national-offers', 'star', 'Military, graduate and loyalty offers.'],
        ].map(([t, h, i, d]) => (
          <Link key={h} to={h} className="hub-card card card-pad">
            <Icon name={i} size={28} className="pillar-icon" />
            <span className="h3">{t}</span>
            <span className="muted">{d}</span>
            <Icon name="arrowR" className="quick-arrow" />
          </Link>
        ))}
      </div>
      <Section id="current" title="Featured offers">
        <div className="grid grid-3">
          {OFFERS.slice(0, 3).map((o) => (
            <OfferCard key={o.id} o={o} onDetails={setLegal} />
          ))}
        </div>
      </Section>
      <Modal open={!!legal} onClose={() => setLegal(null)} title={legal ? `${legal.eyebrow}: offer details` : ''}>
        <p className="small">
          <WithPlaceholders text={legal?.legal} />
        </p>
      </Modal>
    </Page>
  )
}

export function NationalOffers() {
  // Amounts and counts come straight from the conditional offers in the inventory data.
  const DESC = {
    'Military Appreciation Offer': 'For active duty, reserve, retired and veteran members of the U.S. military and their spouses.',
    'Acura Graduate Offer': 'For recent college graduates and those about to graduate.',
    'Allegiance Loyalty Offer': 'For current Acura owners and lessees.',
    'AFS Lease Loyalty Offer': 'For current Acura Financial Services lessees.',
  }
  const stats = new Map()
  for (const v of vehicles)
    for (const [label, amt] of v.offers) {
      const s = stats.get(label) || { min: Infinity, max: 0, n: 0 }
      stats.set(label, { min: Math.min(s.min, amt), max: Math.max(s.max, amt), n: s.n + 1 })
    }
  const programs = [...stats.entries()].map(([t, s]) => [
    t,
    DESC[t] || 'Eligibility rules apply.',
    `${s.min === s.max ? money(s.max) : `${money(s.min)} – ${money(s.max)}`} on ${s.n} new vehicles in stock`,
  ])
  return (
    <Page title="Acura National Offers" crumbs={[NEW, ['Acura National Offers']]} intro="Factory offers from Acura that may lower your price. Eligibility rules apply.">
      <div className="grid grid-2">
        {programs.map(([t, d, amt]) => (
          <article key={t} className="card card-pad">
            <h2 className="h3">{t}</h2>
            <p className="price-hint">{amt}</p>
            <p className="mb-0 muted">{d}</p>
          </article>
        ))}
      </div>
      <p className="legal mt-3">
        Amounts shown match the conditional offers listed on individual new vehicles in our inventory. Offers are not combinable in all cases, require proof of
        eligibility and are subject to change. <Placeholder>PLACEHOLDER: confirm current national offer amounts and expiration</Placeholder>
      </p>
      <div className="row">
        <Link to="/new-vehicles" className="btn">
          Shop new inventory
        </Link>
        <Link to="/new-lease-specials" className="btn btn-secondary">
          Lease specials
        </Link>
      </div>
    </Page>
  )
}

export function ReserveNew() {
  const [model, setModel] = useState('')
  return (
    <Page title="Reserve Your New Acura" crumbs={[NEW, ['Reserve Your New Acura']]} intro="Reserve an incoming Acura before it arrives. No deposit required.">
      <fieldset className="card card-pad">
        <legend className="h3">1. Pick a model</legend>
        <div className="model-pick">
          {MODELS.map((m) => (
            <label key={m.model} className={`model-opt${model === m.model ? ' is-on' : ''}`}>
              <input type="radio" name="reserve-model" value={m.model} checked={model === m.model} onChange={() => setModel(m.model)} />
              <Img src={modelImg(m.model)} alt="" ratio="16 / 10" className="cutout" />
              <span className="model-name">{m.model}</span>
              <span className="small muted">{newCount(m.model) ? `${newCount(m.model)} in stock now` : 'Incoming allocation'}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="card card-pad mt-3">
        <h2 className="h3">2. Your reservation</h2>
        {!model ? (
          <p className="muted mb-0">Choose a model above to continue.</p>
        ) : (
          <SmartForm
            key={model}
            refPrefix="RSV"
            submitLabel={`Reserve my ${model}`}
            successTitle={`Your ${model} reservation request is in.`}
            successBody={<p className="mb-0 muted">No deposit was taken. A sales consultant will contact you about incoming units. Demo only — nothing was sent.</p>}
            fields={[
              { name: 'trim', label: 'Trim', type: 'select', options: ['Base', 'Technology Package', 'A-Spec Package', 'Advance Package', 'Type S', 'Not sure yet'] },
              { name: 'color', label: 'Preferred exterior color' },
              { name: 'timing', label: 'When do you want it?', type: 'select', required: true, options: ['As soon as possible', 'Within 3 months', '3-6 months', 'Just researching'] },
              ...CONTACT_FIELDS,
              { name: 'agree', label: 'I understand this is a no-obligation, deposit-free reservation request.', type: 'checkbox', required: true, span: true },
            ]}
          />
        )}
      </div>
    </Page>
  )
}

export function InfoCenter() {
  const topics = [
    ['Trims and packages', 'Base, Technology, A-Spec, Advance and Type S: what each adds and who it fits.'],
    ['SH-AWD explained', 'Super Handling All-Wheel Drive sends torque between the rear wheels for sharper cornering and confident grip in Gulf Coast rain.'],
    ['AcuraWatch', 'Standard driver-assist technology, including adaptive cruise control, lane keeping assist and collision mitigation braking.'],
    ['Maintenance Minder', 'How your Acura tells you when service is due, and what the codes mean.'],
  ]
  return (
    <Page title="Acura Info Center" crumbs={[NEW, ['Acura Info Center']]} intro="Straightforward answers to help you choose and own your Acura.">
      <div className="grid grid-2">
        {topics.map(([t, d]) => (
          <article key={t} className="card card-pad">
            <h2 className="h3">{t}</h2>
            <p className="mb-0">{d}</p>
          </article>
        ))}
      </div>
      <Section id="more" title="Keep exploring">
        <div className="row">
          <Link to="/model-research" className="btn btn-secondary">
            Model research
          </Link>
          <Link to="/acura-ev-education" className="btn btn-secondary">
            Acura EV Education
          </Link>
          <Link to="/why-buy-acura-certified-pre-owned" className="btn btn-secondary">
            Why buy certified
          </Link>
        </div>
      </Section>
    </Page>
  )
}

export function EvEducation() {
  const faqs = [
    ['How do I charge at home?', 'Most drivers use a Level 2 (240-volt) home charger, which can refill a typical battery overnight. A Level 1 standard outlet works for short daily commutes.'],
    ['What about public charging around Mobile?', 'DC fast chargers along I-10 and I-65 make Gulf Coast road trips practical. Your vehicle\'s navigation can route you to compatible stations.'],
    ['Does heat affect range?', 'Hot weather and heavy A/C use can reduce range somewhat. Preconditioning the cabin while plugged in helps.'],
    ['Are there incentives?', 'Federal, state and utility incentives change often. Ask our finance team what applies today.'],
  ]
  return (
    <Page title="Acura EV Education" crumbs={[NEW, ['Acura Info Center', '/acura-info-center'], ['Acura EV Education']]} intro="A plain-English guide to electrified driving with Acura.">
      <p>
        Electrified Acura models combine Precision Crafted Performance with instant torque and quiet operation. Ask our team about the latest electrified models and
        availability. <Placeholder>PLACEHOLDER: confirm current electrified lineup</Placeholder>
      </p>
      <Section id="faq" title="Common questions">
        <Accordion items={faqs.map(([q, a]) => ({ id: q, title: q, content: <p>{a}</p> }))} />
      </Section>
      <div className="row">
        <Link to="/contact" className="btn">
          Ask an expert
        </Link>
      </div>
    </Page>
  )
}

export function ModelResearch() {
  return (
    <Page title="Model Research" crumbs={[NEW, ['Model Research']]} intro="Compare the Acura lineup and see what's in stock at Joe Bullard Acura." sidebar={false}>
      <ul className="model-grid model-grid-5">
        {MODELS.map((m) => {
          const n = newCount(m.model)
          return (
            <li key={m.model}>
              <article className="model-card card">
                <Img src={modelImg(m.model)} alt={`Acura ${m.model}`} ratio="16 / 10" className="cutout" fallbackLabel={`Acura ${m.model}`} />
                <div className="model-body">
                  <h2 className="model-name">{m.model}</h2>
                  <span className="small muted">
                    {m.tagline} · Seats {m.seats}
                  </span>
                  <span className={`stock-count${n ? '' : ' is-zero'}`}>
                    <strong className="num">{n}</strong> new in stock
                  </span>
                  <div className="row mt-1">
                    <Link to={m.href} className="btn btn-sm">
                      {n ? `Shop ${m.model}` : `View ${m.model}`}
                    </Link>
                    <Link to="/reserve-your-new-acura" className="btn btn-sm btn-secondary">
                      Reserve
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </Page>
  )
}

export function WhyCpo() {
  const n = vehicles.filter((v) => v.condition === 'certified').length
  return (
    <Page title="Why Buy Acura Certified Pre-Owned" crumbs={[['Used Vehicles', '/used-vehicles'], ['Why Buy Acura Certified Pre-Owned']]} intro="Acura Precision Certified vehicles give you near-new confidence at a pre-owned price.">
      <div className="grid grid-2">
        {[
          ['shield', 'Rigorous inspection', 'Every vehicle passes a comprehensive multi-point inspection by Acura-trained technicians.'],
          ['check', 'Warranty coverage', 'Acura-backed limited warranty coverage. [PLACEHOLDER: confirm current CPO warranty terms]'],
          ['car', 'Roadside assistance', '24/7 roadside assistance for the duration of the warranty.'],
          ['star', 'Vehicle history report', 'A vehicle history report is included with every certified vehicle.'],
        ].map(([i, t, d]) => (
          <article key={t} className="card card-pad">
            <Icon name={i} size={28} className="pillar-icon" />
            <h2 className="h3">{t}</h2>
            <p className="mb-0">
              <WithPlaceholders text={d} />
            </p>
          </article>
        ))}
      </div>
      <div className="cta-band card card-pad mt-4">
        <div>
          <h2 className="h3">{n} certified vehicles in stock</h2>
          <p className="mb-0">MDX, RDX, Integra and ADX models available now.</p>
        </div>
        <Link to="/used-vehicles/precision-used" className="btn">
          Browse Certified Pre-Owned
        </Link>
      </div>
      <GhostLink to="/used-vehicles">See all used vehicles</GhostLink>
    </Page>
  )
}
