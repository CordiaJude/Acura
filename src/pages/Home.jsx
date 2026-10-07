import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Accordion, GhostLink, Img, Modal, Tabs, WithPlaceholders } from '../components/ui.jsx'
import { useTitle } from '../components/Page.jsx'
import Icon from '../components/Icon.jsx'
import { HOURS, OFFERS } from '../data/site.js'
import { newCount, vehicles } from '../lib/inventory.js'

const stockShot = (model) => vehicles.find((v) => v.stockPhotos && v.model === model)?.photos[0]
const firstPhoto = (pred) => vehicles.find(pred)?.photos[0]
const HERO_IMG = {
  ADX: stockShot('ADX'),
  MDX: stockShot('MDX'),
  Integra: stockShot('Integra'),
  certified: firstPhoto((v) => v.condition === 'certified' && v.model === 'MDX'),
}

function usePrefersReducedMotion() {
  const [r, setR] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setR(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return r
}

function Hero() {
  const reduce = usePrefersReducedMotion()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hover, setHover] = useState(false)
  const [legal, setLegal] = useState(null)
  const n = OFFERS.length
  useEffect(() => setPaused((p) => p || reduce), [reduce])
  useEffect(() => {
    if (paused || hover || legal) return
    const t = setTimeout(() => setI((x) => (x + 1) % n), 8000) // never faster than 7 s
    return () => clearTimeout(t)
  }, [i, paused, hover, legal, n])
  const o = OFFERS[i]
  const img = o.stockPhotoOf ? HERO_IMG[o.stockPhotoOf] : null
  return (
    <section
      className="hero on-dark"
      aria-roledescription="carousel"
      aria-label="Current offers"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <div className="container hero-inner">
        <div className="hero-slide" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${n}: ${o.eyebrow}`} key={o.id}>
          <div className="hero-panel glass-dark">
            <p className="eyebrow">{o.eyebrow}</p>
            <h2 className="hero-h">{o.headline}</h2>
            <p className="hero-sub">
              <WithPlaceholders text={o.sub} />
            </p>
            <div className="row mt-2">
              <Link to={o.cta[1]} className="btn btn-light">
                {o.cta[0]}
              </Link>
              <button type="button" className="btn btn-outline-light btn-sm" onClick={() => setLegal(o)}>
                See details
              </button>
            </div>
          </div>
          <div className={`hero-media ${o.stockPhotoOf && o.stockPhotoOf !== 'certified' ? 'is-cutout' : ''}`}>
            {img ? (
              <Img src={img} alt={o.stockPhotoOf === 'certified' ? 'Acura Precision Certified MDX at Joe Bullard Acura' : `2026 Acura ${o.model}`} eager={i === 0} ratio="16 / 10" className="dark-frame" />
            ) : (
              <div className="hero-service" aria-hidden="true">
                <Icon name="wrench" size={120} />
              </div>
            )}
          </div>
        </div>
        <div className="hero-controls">
          <div className="dots" role="group" aria-label="Choose slide">
            {OFFERS.map((s, k) => (
              <button key={s.id} type="button" className={`dot${k === i ? ' is-on' : ''}`} aria-label={`Slide ${k + 1}: ${s.eyebrow}`} aria-current={k === i ? 'true' : undefined} onClick={() => setI(k)} />
            ))}
          </div>
          <button type="button" className="icon-btn icon-btn-dark" onClick={() => setPaused(!paused)} aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}>
            <Icon name={paused ? 'play' : 'pause'} />
          </button>
        </div>
      </div>
      <Modal open={!!legal} onClose={() => setLegal(null)} title={legal ? `${legal.eyebrow}: offer details` : ''}>
        <p className="small">
          <WithPlaceholders text={legal?.legal} />
        </p>
      </Modal>
    </section>
  )
}

function QuickLinks() {
  const cards = [
    ['New Vehicles', '/new-vehicles', 'car', `${vehicles.filter((v) => v.condition === 'new').length} in stock`],
    ['Pre-Owned Vehicles', '/used-vehicles', 'tag', `${vehicles.filter((v) => v.condition !== 'new').length} in stock`],
    ['Schedule Service', '/schedule-service', 'wrench', 'Book in minutes'],
    ['Value Your Trade', '/value-your-trade', 'dollar', 'Get an offer'],
  ]
  return (
    <section className="section-sm quick" aria-label="Quick links">
      <div className="container">
        <ul className="quick-grid">
          {cards.map(([label, href, icon, sub]) => (
            <li key={label}>
              <Link to={href} className="quick-card card">
                <span className="quick-icon">
                  <Icon name={icon} size={26} />
                </span>
                <span className="quick-label">{label}</span>
                <span className="small muted">{sub}</span>
                <Icon name="arrowR" className="quick-arrow" />
              </Link>
            </li>
          ))}
        </ul>
        <ul className="quick-text">
          <li><Link to="/new-vehicles">New Vehicles</Link></li>
          <li><Link to="/used-vehicles/precision-used">Certified Pre-Owned Vehicles</Link></li>
          <li><Link to="/used-vehicles">Used Vehicles</Link></li>
          <li><Link to="/schedule-service">Schedule Service</Link></li>
        </ul>
      </div>
    </section>
  )
}

function OurVehicles() {
  const rdxImg = firstPhoto((v) => v.model === 'RDX')
  const cards = [
    { model: 'MDX', tag: 'Three-row luxury SUV', img: HERO_IMG.MDX, href: '/new-vehicles/mdx' },
    { model: 'ADX', tag: 'Compact premium SUV', img: HERO_IMG.ADX, href: '/new-vehicles/adx' },
    { model: 'Integra', tag: 'Premium sport compact', img: HERO_IMG.Integra, href: '/new-vehicles/integra' },
    { model: 'RDX', tag: 'Sport SUV with SH-AWD', img: rdxImg, href: '/used-vehicles/precision-used?model=RDX' },
  ]
  return (
    <section className="section fill" aria-labelledby="ov-h">
      <div className="container">
        <div className="section-head">
          <h2 id="ov-h">Our Vehicles</h2>
          <GhostLink to="/model-research">Research all models</GhostLink>
        </div>
        <ul className="model-grid">
          {cards.map((c) => {
            const count = newCount(c.model)
            const cpo = vehicles.filter((v) => v.condition === 'certified' && v.model === c.model).length
            return (
              <li key={c.model}>
                <Link to={c.href} className="model-card card">
                  <Img src={c.img} alt={c.model === 'RDX' ? 'Acura Precision Certified RDX' : `2026 Acura ${c.model}`} ratio="16 / 10" className={c.model !== 'RDX' ? 'cutout' : ''} />
                  <span className="model-body">
                    <span className="model-name">{c.model}</span>
                    <span className="small muted">{c.tag}</span>
                    <span className={`stock-count${count ? '' : ' is-zero'}`}>
                      {count ? (
                        <>
                          <strong className="num">{count}</strong> new in stock
                        </>
                      ) : (
                        <>
                          <strong className="num">0</strong> new in stock - see certified RDX ({cpo})
                        </>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function CpoBanner() {
  return (
    <section className="cpo-banner on-dark" aria-labelledby="cpo-h">
      <div className="container cpo-inner">
        <div>
          <p className="eyebrow">Acura Precision Certified</p>
          <h2 id="cpo-h">Check out our Acura Precision Used Vehicles</h2>
        </div>
        <Link to="/used-vehicles/precision-used" className="btn btn-light">
          Browse Certified Pre-Owned
        </Link>
      </div>
    </section>
  )
}

function LeaseReturns() {
  return (
    <section className="section" aria-labelledby="lr-h">
      <div className="container split">
        <div>
          <h2 id="lr-h">Acura Lease Returns at Joe Bullard</h2>
          <p>
            Lease ending soon? Return it, buy it or move into a new Acura. Our team makes the hand-off simple and walks you through every option, including
            off-lease vehicles you can buy from our pre-owned inventory.
          </p>
          <div className="row">
            <Link to="/used-vehicles" className="btn">
              Browse Inventory
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              Contact Us
            </Link>
          </div>
        </div>
        <ul className="option-cards">
          <li className="card card-pad"><strong>Return and lease a new one</strong><span className="small muted">Option 1</span></li>
          <li className="card card-pad"><strong>Purchase your leased Acura</strong><span className="small muted">Option 2</span></li>
          <li className="card card-pad"><strong>Return your leased Acura</strong><span className="small muted">Option 3</span></li>
        </ul>
      </div>
    </section>
  )
}

function ServiceBlock() {
  return (
    <>
      <section className="hours-bar" aria-labelledby="svc-hours-h">
        <div className="container hours-bar-inner">
          <h2 id="svc-hours-h" className="h4 mb-0">
            Service hours
          </h2>
          <ul className="hours-inline">
            {HOURS.service.map(([d, h]) => (
              <li key={d}>
                <strong>{d}</strong> <span className="num">{h}</span>
              </li>
            ))}
          </ul>
          <div className="row">
            <Link to="/service-specials" className="btn btn-secondary btn-sm">
              Service Specials
            </Link>
            <Link to="/schedule-service" className="btn btn-sm">
              Schedule Service
            </Link>
          </div>
        </div>
      </section>
      <section className="section" aria-labelledby="svc-h">
        <div className="container">
          <div className="service-panel">
            <div className="service-img on-dark" aria-hidden="true">
              <Icon name="wrench" size={96} />
              <span className="placeholder-tag">PLACEHOLDER: service department photo</span>
            </div>
            <div className="service-copy card-pad">
              <p className="eyebrow">Service Department</p>
              <h2 id="svc-h">Full service center and auto body repair</h2>
              <p>
                Joe Bullard Acura is home to a full service center and auto body repair shop. Manned by Acura-Trained technician teams using Genuine Acura parts and
                fluids, we're experts at keeping Acura cars running as smoothly as the day they first rolled out of the factory.
              </p>
              <div className="row">
                <Link to="/service" className="btn btn-secondary">
                  Explore the service center
                </Link>
                <GhostLink to="/collision-center">Collision center</GhostLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

const PILLARS = {
  safety: ['Blind Spot Monitor', 'Lane Departure Warning', 'Forward Collision Warning', 'Backup Camera', 'Parking Sensors / Assist', 'Side-Impact Air Bags', 'Adaptive Cruise Control', 'Rain Sensing Wipers', 'Fog Lights'],
  inspiration: ['Apple CarPlay', 'Android Auto', 'Premium Audio', 'WiFi Hotspot', 'Navigation System', 'Heated Seats', 'Leather Seats', 'Memory Seats', 'Moonroof', 'Panoramic Sunroof', '3rd Row Seat', 'Hands-Free Liftgate', 'Power Liftgate'],
}

function pillarData(model) {
  const pool = vehicles.filter((v) => v.make === 'Acura' && v.model === model && v.condition !== 'used')
  const share = (f) => pool.filter((v) => v.keyFeatures.includes(f)).length
  const feats = (list) =>
    list
      .map((f) => [f, share(f)])
      .filter(([, c]) => c > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  const engines = [...new Set(pool.map((v) => v.engine).filter(Boolean))].slice(0, 2)
  const drives = [...new Set(pool.map((v) => v.drivetrain).filter(Boolean))]
  const mpg = [...new Set(pool.map((v) => v.mpg).filter(Boolean))][0]
  return { pool, engines, drives, mpg, safety: feats(PILLARS.safety), inspiration: feats(PILLARS.inspiration) }
}

function ChooseAcura() {
  const tabs = ['MDX', 'ADX', 'Integra', 'RDX'].map((m) => {
    const d = pillarData(m)
    const n = d.pool.length
    const src = m === 'RDX' ? 'certified RDX' : `new ${m}`
    return {
      id: m,
      label: m,
      content: (
        <div className="pillars">
          <article className="pillar card card-pad">
            <Icon name="spark" size={28} className="pillar-icon" />
            <h3>Precision Crafted Performance</h3>
            <ul className="list-check">
              {d.engines.map((e) => (
                <li key={e}>{e}</li>
              ))}
              <li>{d.drives.join(' or ')} drivetrain</li>
              {d.mpg && <li>EPA-estimated {d.mpg.toLowerCase()}</li>}
            </ul>
          </article>
          <article className="pillar card card-pad">
            <Icon name="shield" size={28} className="pillar-icon" />
            <h3>Safety</h3>
            <ul className="list-check">
              {d.safety.map(([f, c]) => (
                <li key={f}>
                  {f} <span className="small muted num">({c} of {n})</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="pillar card card-pad">
            <Icon name="star" size={28} className="pillar-icon" />
            <h3>Inspiration</h3>
            <ul className="list-check">
              {d.inspiration.map(([f, c]) => (
                <li key={f}>
                  {f} <span className="small muted num">({c} of {n})</span>
                </li>
              ))}
            </ul>
          </article>
          <p className="small muted span-all mb-0">
            Feature counts are from the {n} {src} {n === 1 ? 'model' : 'models'} in our inventory today.{' '}
            <Link to={m === 'RDX' ? '/used-vehicles/precision-used?model=RDX' : `/new-vehicles/${m.toLowerCase()}`}>Shop {src}</Link>
          </p>
        </div>
      ),
    }
  })
  return (
    <section className="section fill" aria-labelledby="choose-h">
      <div className="container">
        <h2 id="choose-h">See What You Get When You Choose Acura</h2>
        <p className="lead">Every Acura is built around three pillars. Pick a model to see what's on the vehicles in our inventory.</p>
        <Tabs tabs={tabs} label="Acura models" />
      </div>
    </section>
  )
}

function SeoBlock() {
  const items = [
    ['New Acura Models near Mobile, AL', 'Shop the latest Acura MDX, ADX and Integra, plus RDX and TLX as they arrive. Every new Acura comes with the Acura Precision Crafted Performance you expect, along with available SH-AWD, AcuraWatch safety technology and premium audio. Browse online, compare trims and schedule a test drive at our Mobile showroom.'],
    ['Used Car Dealership in Mobile, AL', 'Our pre-owned lot includes Acura Precision Certified models as well as quality trade-ins from Honda, Toyota, Lexus, BMW, Ford, Chevrolet and more. Every used vehicle is inspected before it is offered for sale, and our team can help you find the right fit for your budget.'],
    ['Acura Info Center', 'Not sure which Acura is right for you? Our Info Center explains trims, packages and technology so you can shop with confidence before you visit.'],
    ['Acura EV Education', 'Curious about electrified driving? Learn how charging works, what to expect from range in Gulf Coast weather and how federal and state incentives may apply.'],
    ['Acura Service Center', 'Acura-trained technicians, Genuine Acura parts and a full collision center keep your vehicle running like new. Schedule online, view current coupons or call 251-237-9452.'],
    ['Acura Lease and Finance Center', 'Our finance team works with Acura Financial Services and local lenders to find a lease or loan that fits. Apply online, estimate payments and value your trade before you arrive.'],
    ['Contact Us to Learn More', 'Have a question? Call Sales at 251-237-9447, stop by 1151 E I-65 Service Rd. S. in Mobile or send us a message online. We serve drivers from Mobile, Daphne, Fairhope, Pensacola, Gulfport, Biloxi and Orange Beach.'],
  ]
  return (
    <section className="section" aria-labelledby="seo-h">
      <div className="container seo">
        <h2 id="seo-h">Premier Acura Dealership in Mobile, AL</h2>
        <p>
          Joe Bullard Acura has served drivers along the Gulf Coast as part of the Joe Bullard family of dealerships. We combine a large selection of new Acura
          vehicles and quality pre-owned cars with a service department staffed by Acura-trained technicians.
        </p>
        <p>
          Whether you are shopping for a three-row MDX, a sporty Integra or a certified pre-owned vehicle, our team is here to make buying, financing and
          servicing your vehicle straightforward.
        </p>
        <Accordion headingLevel={3} defaultOpen={[]} items={items.map(([t, body]) => ({ id: t, title: t, content: <p>{body}</p> }))} />
      </div>
    </section>
  )
}

export default function Home() {
  useTitle(null)
  return (
    <>
      <section className="welcome on-dark" aria-labelledby="welcome-h">
        <div className="container welcome-inner">
          <h1 id="welcome-h">Welcome to Joe Bullard Acura</h1>
          <Link to="/schedule-service" className="btn">
            Schedule a Service Appointment
          </Link>
        </div>
      </section>
      <Hero />
      <QuickLinks />
      <OurVehicles />
      <CpoBanner />
      <LeaseReturns />
      <ServiceBlock />
      <ChooseAcura />
      <SeoBlock />
    </>
  )
}
