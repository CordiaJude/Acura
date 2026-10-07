import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Page, { Section } from '../components/Page.jsx'
import { Accordion, GhostLink, Placeholder, WithPlaceholders } from '../components/ui.jsx'
import SmartForm, { COMMENTS, CONTACT_FIELDS, Field, makeRef, SuccessState, validateField } from '../components/Form.jsx'
import Icon from '../components/Icon.jsx'
import { COUPON_EXPIRY, COUPONS, HOURS, PHONES, STAFF, tel } from '../data/site.js'

const SVC = ['Service & Parts', '/service']
const YEARS = Array.from({ length: 2027 - 2005 }, (_, i) => String(2027 - i))
const ACURA_MODELS = ['ADX', 'Integra', 'MDX', 'RDX', 'TLX', 'ZDX', 'ILX', 'TL', 'TSX', 'RLX', 'NSX', 'Other']

function ServiceCtas() {
  return (
    <>
      <Link to="/schedule-service" className="btn">
        Schedule service
      </Link>
      <a href={tel(PHONES.service.number)} className="btn btn-secondary">
        <Icon name="phone" size={18} /> {PHONES.service.number}
      </a>
    </>
  )
}

export function ServiceCenter() {
  const faqs = [
    ['How often should I service my Acura?', 'Follow your Maintenance Minder. It tracks engine operating conditions and shows a code (like A1 or B12) when service is due, usually every 5,000 to 7,500 miles.'],
    ['Do I need an appointment?', 'Appointments are recommended so we can have parts ready and minimize your wait. Express services can often be handled same-day; call 251-237-9452.'],
    ['Do you use Genuine Acura parts?', 'Yes. Our technicians use Genuine Acura parts and fluids designed specifically for your vehicle and backed by Acura\'s parts warranty.'],
    ['Can you service vehicles that are not Acuras?', 'Our technicians specialize in Acura, but we can help with many other makes. Call us to check availability for your vehicle.'],
    ['Do you offer financing for repairs?', 'Yes. See Service & Parts Buy Now Pay Later for flexible payment options on repairs and maintenance.'],
  ]
  return (
    <Page title="Service Center" crumbs={[SVC, ['Service Center']]} hero intro="Acura-trained technicians, Genuine Acura parts and a full collision center in Mobile, AL." actions={<ServiceCtas />}>
      <div className="panel panel-red">
        <h2>Welcome to the Joe Bullard Acura Service Center</h2>
        <p>
          From your first oil change to major repairs, our service team keeps your Acura running the way it was engineered to. We are open six days a week with
          easy online scheduling, service specials and a comfortable customer lounge.
        </p>
        <Link to="/schedule-service" className="btn btn-light">
          Book an appointment
        </Link>
      </div>
      <Section id="svc-your" title="Service Your Vehicle">
        <ul className="grid grid-3 plain">
          {[
            ['Maintenance Minder services', 'A and B services, plus sub-codes 1-7.'],
            ['Brakes, tires and alignment', 'Genuine Acura brake pads, tire sales and mounting.'],
            ['Batteries and electrical', 'Testing and replacement with Genuine Acura batteries.'],
            ['Diagnostics and repairs', 'Check-engine lights, drivability and warranty repairs.'],
            ['Recalls and campaigns', 'Free safety recall work on eligible Acura vehicles.'],
            ['Collision and body', 'Full auto body repair on site.'],
          ].map(([t, d]) => (
            <li key={t} className="card card-pad">
              <h3 className="h4">{t}</h3>
              <p className="mb-0 muted">{d}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section id="mpi" title="What Does Our Multi-Point Inspection Include">
        <ul className="list-check two-col-list">
          {['Brake pads and rotors', 'Tire tread depth and pressure', 'Battery test', 'Fluid levels and condition', 'Belts and hoses', 'Wiper blades', 'Lights and signals', 'Suspension and steering', 'Air and cabin filters', 'Exhaust system'].map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </Section>
      <Section id="aas" title="Acura Accelerated Service">
        <p>Short on time? Acura Accelerated Service gets routine maintenance done quickly with a dedicated team, so you can be back on the road sooner.</p>
        <GhostLink to="/acura-accelerated-service">Learn about Accelerated Service</GhostLink>
      </Section>
      <Section id="faq" title="FAQs">
        <Accordion items={faqs.map(([q, a]) => ({ id: q, title: q, content: <p>{a}</p> }))} />
      </Section>
      <div className="cta-band card card-pad">
        <div>
          <h2 className="h3">Schedule Your Service Appointment</h2>
          <p className="mb-0">Pick a time online in about two minutes.</p>
        </div>
        <div className="row">
          <ServiceCtas />
        </div>
      </div>
    </Page>
  )
}

const SERVICES = [
  'Oil and filter change',
  'Maintenance Minder service (A/B)',
  'Tire rotation',
  'Brake inspection',
  'Battery test',
  'Alignment',
  'Cabin air filter',
  'Diagnose a warning light',
  'Recall / campaign work',
  'Other (describe below)',
]

function slotsFor(dateStr) {
  if (!dateStr) return []
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  if (day === 0) return []
  const [start, end] = day === 6 ? [8, 15.5] : [7.5, 16.5]
  const out = []
  for (let t = start; t <= end; t += 0.5) {
    const h = Math.floor(t)
    const m = t % 1 ? '30' : '00'
    out.push(`${((h + 11) % 12) + 1}:${m} ${h < 12 ? 'AM' : 'PM'}`)
  }
  return out
}

export function ScheduleService() {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])
  const [vals, setVals] = useState({ services: [] })
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(null)
  const today = new Date().toISOString().slice(0, 10)
  const advisors = STAFF.find((d) => d.dept === 'Service').people.filter((p) => p.title === 'Service Advisor').map((p) => p.name)
  const slots = useMemo(() => slotsFor(vals.date), [vals.date])

  const steps = [
    {
      title: 'Vehicle',
      fields: [
        { name: 'year', label: 'Year', type: 'select', required: true, options: YEARS },
        { name: 'model', label: 'Acura model', type: 'select', required: true, options: ACURA_MODELS },
        { name: 'mileage', label: 'Current mileage', type: 'number', min: 0, max: 500000 },
        { name: 'vin', label: 'VIN (optional)', type: 'vin' },
      ],
    },
    {
      title: 'Services',
      fields: [
        { name: 'services', label: 'What do you need?', type: 'checkgroup', required: true, options: SERVICES, span: true },
        { ...COMMENTS, label: 'Describe any concerns' },
      ],
    },
    {
      title: 'Advisor & time',
      fields: [
        { name: 'advisor', label: 'Service advisor', type: 'radio', options: [...advisors, 'No preference'], required: true, span: true },
        {
          name: 'date',
          label: 'Date',
          type: 'date',
          required: true,
          min: today,
          validate: (v) => (new Date(v + 'T12:00:00').getDay() === 0 ? 'We are closed on Sundays. Pick another day.' : v < today ? 'Pick a future date.' : ''),
        },
        { name: 'transport', label: 'While you wait', type: 'select', options: ['Wait in the lounge', 'Drop off', 'Shuttle [PLACEHOLDER: confirm availability]'] },
      ],
    },
    { title: 'Contact', fields: CONTACT_FIELDS },
  ]
  const cur = steps[step]
  const timeField = { name: 'time', label: 'Time', required: true }

  const next = (e) => {
    e.preventDefault()
    const errs = {}
    for (const f of cur.fields) {
      const m = validateField(f, vals[f.name])
      if (m) errs[f.name] = m
    }
    if (step === 2 && !vals.time && slots.length) errs.time = 'Choose a time.'
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) {
      document.querySelector(`[name="${first}"]`)?.focus()
      return
    }
    if (step < steps.length - 1) setStep(step + 1)
    else setDone(makeRef('SVC'))
  }

  return (
    <Page
      title="Schedule Service"
      crumbs={[SVC, ['Schedule Service']]}
      intro={
        <>
          Book your appointment online. Or call <a href={tel(PHONES.service.number)}>{PHONES.service.number}</a>
        </>
      }
    >
      <div className="card card-pad scheduler">
        {loading ? (
          <div aria-busy="true" aria-label="Loading scheduler">
            <div className="skeleton" style={{ height: 28, width: '40%' }} />
            <div className="form-grid mt-3">
              {[0, 1, 2, 3].map((k) => (
                <div key={k} className="skeleton" style={{ height: 48, borderRadius: 999 }} />
              ))}
            </div>
            <div className="skeleton mt-3" style={{ height: 48, width: 200, borderRadius: 999 }} />
          </div>
        ) : done ? (
          <SuccessState refNo={done} title="Your service appointment request is in." onReset={() => { setDone(null); setStep(0); setVals({ services: [] }) }}>
            <p className="mb-0">
              {vals.year} Acura {vals.model} · {vals.date} at {vals.time} with {vals.advisor}. We'll confirm by {vals.email ? 'email' : 'phone'}. Demo only — nothing was sent.
            </p>
          </SuccessState>
        ) : (
          <form onSubmit={next} noValidate aria-label="Schedule service">
            <ol className="steps" aria-label="Scheduler progress">
              {steps.map((s, i) => (
                <li key={s.title} aria-current={i === step ? 'step' : undefined} className={i < step ? 'done' : undefined}>
                  <span className="dot" aria-hidden="true">{i < step ? '✓' : i + 1}</span>
                  {s.title}
                </li>
              ))}
            </ol>
            <h2 className="h3">{cur.title}</h2>
            <div className="form-grid">
              {cur.fields.map((f) => (
                <Field key={f.name} f={f} idBase="svc" value={vals[f.name]} error={errors[f.name]} onChange={(v) => setVals((s) => ({ ...s, [f.name]: v, ...(f.name === 'date' ? { time: '' } : {}) }))} onBlur={() => setErrors((e) => ({ ...e, [f.name]: validateField(f, vals[f.name]) }))} />
              ))}
              {step === 2 && vals.date && (
                <fieldset className="field span-all" aria-describedby={errors.time ? 'svc-time-err' : undefined}>
                  <legend>
                    {timeField.label}
                    <span className="req" aria-hidden="true">*</span>
                  </legend>
                  {slots.length ? (
                    <div className="slot-grid">
                      {slots.map((s) => (
                        <label key={s} className={`option${vals.time === s ? ' is-on' : ''}`}>
                          <input type="radio" name="time" value={s} checked={vals.time === s} onChange={() => setVals((v) => ({ ...v, time: s }))} />
                          <span className="num">{s}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="muted">Closed this day.</p>
                  )}
                  {errors.time && (
                    <span className="error" id="svc-time-err">
                      {errors.time}
                    </span>
                  )}
                </fieldset>
              )}
            </div>
            <div className="row mt-3">
              {step > 0 && (
                <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>
                  Back
                </button>
              )}
              <button className="btn" type="submit">
                {step < steps.length - 1 ? `Continue to ${steps[step + 1].title}` : 'Request appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
      <p className="mt-2">
        Or call <a href={tel(PHONES.service.number)} className="num">{PHONES.service.number}</a>. Service hours: Mon-Fri 7:30 AM-5:30 PM, Sat 8:00 AM-4:00 PM.
      </p>
    </Page>
  )
}

export function ServiceSpecials() {
  return (
    <Page title="Service Specials & Coupons" crumbs={[SVC, ['Service Specials & Coupons']]} intro="Save on maintenance and repairs at Joe Bullard Acura. Show a coupon on your phone at write-up.">
      <ul className="coupon-grid">
        {COUPONS.map((c) => (
          <li key={c.title} className="coupon card">
            <div className="coupon-top">
              <span className="chip chip-exp">
                <Icon name="calendar" size={16} /> Expires {COUPON_EXPIRY}
              </span>
              <h2 className="h3">{c.title}</h2>
              <p className="coupon-value">
                <WithPlaceholders text={c.value} />
              </p>
            </div>
            {c.tier && (
              <table className="tier">
                <caption className="sr-only">Spend and save tiers</caption>
                <thead>
                  <tr>
                    <th scope="col">Spend</th>
                    <th scope="col">Save</th>
                  </tr>
                </thead>
                <tbody>
                  {c.tier.map(([a, b]) => (
                    <tr key={a}>
                      <td className="num">{a}</td>
                      <td className="num">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="small">{c.body}</p>
            <p className="legal">Present coupon at write-up. Cannot be combined with other offers. Valid at Joe Bullard Acura only. Expires {COUPON_EXPIRY}.</p>
            <div className="row coupon-actions">
              <Link to="/schedule-service" className="btn btn-sm">
                Schedule service
              </Link>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                Print coupon
              </button>
            </div>
          </li>
        ))}
      </ul>
      <Section id="parts" title="Acura Parts Specials & Coupons">
        <p>Parts coupons for Genuine Acura accessories and parts are posted here as they become available. <Placeholder>PLACEHOLDER: add current parts coupons</Placeholder></p>
        <GhostLink to="/order-parts">Order Acura parts</GhostLink>
      </Section>
    </Page>
  )
}

export function BuyNowPayLater() {
  return (
    <Page title="Service & Parts Buy Now Pay Later" crumbs={[SVC, ['Buy Now Pay Later']]} intro="Split the cost of maintenance, repairs and parts into smaller payments.">
      <Section id="how" title="How it works">
        <ol className="num-steps">
          <li><strong>Get your estimate.</strong> Your service advisor reviews the work with you.</li>
          <li><strong>Choose pay over time.</strong> Apply at checkout in a few minutes. <Placeholder>PLACEHOLDER: confirm financing partner</Placeholder></li>
          <li><strong>Drive away.</strong> Make your first payment later, on approved credit.</li>
        </ol>
      </Section>
      <Section id="eligible" title="What's eligible">
        <ul className="list-check">
          <li>Maintenance Minder services and repairs</li>
          <li>Tires, brakes and batteries</li>
          <li>Genuine Acura parts and accessories</li>
          <li>Collision center repairs (deductible portion)</li>
        </ul>
        <p className="legal">Subject to credit approval. Terms vary. Ask your service advisor for details.</p>
      </Section>
      <div className="row">
        <ServiceCtas />
      </div>
    </Page>
  )
}

export function AcceleratedService() {
  return (
    <Page title="Acura Accelerated Service" crumbs={[SVC, ['Acura Accelerated Service']]} intro="Routine maintenance done fast, by a dedicated team of Acura-trained technicians.">
      <div className="grid grid-3">
        {[
          ['clock', 'Quick turnaround', 'Oil changes, rotations and Maintenance Minder A services are handled by a dedicated express team.'],
          ['wrench', 'Same Acura standards', 'Genuine Acura parts and fluids, plus a complimentary multi-point inspection.'],
          ['calendar', 'Book or drop in', 'Schedule online for the shortest wait, or stop by during service hours.'],
        ].map(([i, t, d]) => (
          <div key={t} className="card card-pad">
            <Icon name={i} size={28} className="pillar-icon" />
            <h2 className="h3">{t}</h2>
            <p className="mb-0">{d}</p>
          </div>
        ))}
      </div>
      <Section id="aas-hours" title="Hours">
        <p>
          Mon-Fri 7:30 AM-5:30 PM · Sat 8:00 AM-4:00 PM · Sun Closed. Express lane hours: <Placeholder>PLACEHOLDER: confirm express lane hours</Placeholder>
        </p>
        <div className="row">
          <ServiceCtas />
        </div>
      </Section>
    </Page>
  )
}

const PARTS_FIELDS = [
  ...CONTACT_FIELDS,
  { name: 'year', label: 'Vehicle year', type: 'select', required: true, options: YEARS },
  { name: 'model', label: 'Model', type: 'select', required: true, options: ACURA_MODELS },
  { name: 'vin', label: 'VIN', type: 'vin', hint: 'Helps us match the exact part.' },
  { name: 'part', label: 'Part name or number', required: true, span: true },
  { name: 'qty', label: 'Quantity', type: 'number', min: 1, max: 99 },
  { name: 'pickup', label: 'Pickup or ship', type: 'select', options: ['Pick up at dealership', 'Ship to me'] },
  COMMENTS,
]

export function PartsDepartment() {
  return (
    <Page title="Parts Department" crumbs={[SVC, ['Parts Department']]} intro="Genuine Acura parts and accessories, in stock or ordered for you.">
      <div className="grid grid-2">
        <div className="card card-pad">
          <h2 className="h3">Contact Parts</h2>
          <p>
            <a href={tel(PHONES.parts.number)} className="btn btn-secondary">
              <Icon name="phone" size={18} /> {PHONES.parts.number}
            </a>
          </p>
          <dl className="dl">
            {HOURS.service.map(([d, h]) => (
              <div key={d} className="hours-row">
                <dt>{d}</dt>
                <dd className="num">{h}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="card card-pad">
          <h2 className="h3">Why Genuine Acura parts</h2>
          <ul className="list-check">
            <li>Engineered for your exact Acura</li>
            <li>Backed by the Acura parts warranty</li>
            <li>Installed by Acura-trained technicians</li>
          </ul>
          <GhostLink to="/order-parts">Order online</GhostLink>
        </div>
      </div>
      <Section id="parts-req" title="Parts request">
        <SmartForm fields={PARTS_FIELDS} refPrefix="PRT" submitLabel="Send parts request" successTitle="Parts request received." />
      </Section>
    </Page>
  )
}

export function OrderParts() {
  return (
    <Page title="Order Acura Parts" crumbs={[SVC, ['Order Acura Parts']]} intro="Order OEM Acura parts in Mobile, AL. Tell us what you need and our parts team will confirm price and availability.">
      <SmartForm
        steps={[
          { title: 'Your vehicle', fields: PARTS_FIELDS.slice(4, 7) },
          { title: 'Parts', fields: PARTS_FIELDS.slice(7) },
          { title: 'Contact', fields: CONTACT_FIELDS },
        ]}
        refPrefix="ORD"
        submitLabel="Submit order request"
        successTitle="Order request received."
        successBody={<p className="mb-0 muted">Our parts team will call to confirm price and availability before anything is charged. Demo only — nothing was sent.</p>}
      />
    </Page>
  )
}

const WIDTHS = ['205', '215', '225', '235', '245', '255', '265', '275']
const RATIOS = ['35', '40', '45', '50', '55', '60', '65']
const RIMS = ['17', '18', '19', '20', '21', '22']

export function OrderTires() {
  const [mode, setMode] = useState('size')
  const [size, setSize] = useState({ w: '', r: '', d: '' })
  const [shown, setShown] = useState(false)
  const ready = size.w && size.r && size.d
  return (
    <Page title="Order Tires" crumbs={[SVC, ['Order Tires']]} intro="Find tires for your Acura by size or by vehicle, then request a quote with installation.">
      <div className="card card-pad">
        <div className="tabs" role="radiogroup" aria-label="Search tires by">
          {[['size', 'By tire size'], ['vehicle', 'By vehicle']].map(([k, l]) => (
            <button key={k} type="button" role="radio" aria-checked={mode === k} className="tab" onClick={() => { setMode(k); setShown(false) }}>
              {l}
            </button>
          ))}
        </div>
        {mode === 'size' ? (
          <>
            <div className="tire-size" aria-hidden="true">
              <span className="num">{size.w || '___'}</span>/<span className="num">{size.r || '__'}</span>R<span className="num">{size.d || '__'}</span>
            </div>
            <p className="small muted">Find your size on the tire sidewall or the sticker inside the driver's door jamb.</p>
            <div className="form-grid">
              {[['w', 'Width', WIDTHS], ['r', 'Aspect ratio', RATIOS], ['d', 'Rim diameter', RIMS]].map(([k, l, opts]) => (
                <div className="field" key={k}>
                  <label htmlFor={`tire-${k}`}>{l}</label>
                  <select id={`tire-${k}`} className="select" value={size[k]} onChange={(e) => { setSize({ ...size, [k]: e.target.value }); setShown(false) }}>
                    <option value="">Select</option>
                    {opts.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="form-grid">
            <div className="field">
              <label htmlFor="tv-year">Year</label>
              <select id="tv-year" className="select" onChange={() => setShown(false)}>
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="tv-model">Model</label>
              <select id="tv-model" className="select" onChange={() => setShown(false)}>
                {ACURA_MODELS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
        )}
        <button type="button" className="btn mt-3" onClick={() => setShown(true)} disabled={mode === 'size' && !ready}>
          Find tires
        </button>
        {shown && (
          <div className="mt-3" role="status">
            <h2 className="h3">Request a tire quote</h2>
            <p className="muted">
              We stock major brands for {mode === 'size' ? `${size.w}/${size.r}R${size.d}` : 'your Acura'}. Live pricing isn't available online yet{' '}
              <Placeholder>PLACEHOLDER: connect tire catalog</Placeholder>, so we'll send a quote with mounting and balancing.
            </p>
            <SmartForm fields={[...CONTACT_FIELDS, { name: 'qty', label: 'How many tires?', type: 'select', options: ['1', '2', '4'], required: true }]} refPrefix="TIRE" submitLabel="Get tire quote" successTitle="Tire quote requested." />
          </div>
        )}
      </div>
    </Page>
  )
}

export function CollisionCenter() {
  return (
    <Page title="Collision Center" crumbs={[SVC, ['Collision Center']]} hero intro="On-site auto body repair with Genuine Acura parts." actions={<a href={tel(PHONES.service.number)} className="btn btn-light"><Icon name="phone" size={18} /> Call {PHONES.service.number}</a>}>
      <p>
        <Placeholder>PLACEHOLDER: collision center details</Placeholder> — hours, direct phone, certifications, insurance partners and estimate process. The live
        page currently returns a 404.
      </p>
      <Section id="cc-what" title="What we repair">
        <ul className="list-check two-col-list">
          <li>Dents, dings and scratches</li>
          <li>Bumper and panel replacement</li>
          <li>Paint matching</li>
          <li>Frame and structural repair</li>
          <li>Glass and lights</li>
          <li>ADAS sensor recalibration</li>
        </ul>
      </Section>
      <Section id="cc-est" title="Request a repair estimate">
        <SmartForm
          refPrefix="COL"
          submitLabel="Request estimate"
          successTitle="Estimate request received."
          fields={[
            ...CONTACT_FIELDS,
            { name: 'year', label: 'Vehicle year', type: 'select', options: YEARS, required: true },
            { name: 'model', label: 'Model', type: 'select', options: ACURA_MODELS, required: true },
            { name: 'insurance', label: 'Insurance company' },
            { name: 'claim', label: 'Claim number' },
            { ...COMMENTS, label: 'Describe the damage' },
          ]}
        />
      </Section>
    </Page>
  )
}

export function RecallLookup() {
  const [vin, setVin] = useState('')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState(false)
  const f = { name: 'vin', label: 'VIN', type: 'vin', required: true }
  return (
    <Page title="Recall Lookup" crumbs={[SVC, ['Recall Lookup']]} intro="Check your Acura for open safety recalls. Recall repairs are free at Joe Bullard Acura.">
      <form
        className="card card-pad"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          const m = validateField(f, vin)
          setErr(m)
          setOk(!m)
          if (!m) window.open(`https://www.nhtsa.gov/recalls?vin=${encodeURIComponent(vin.trim().toUpperCase())}`, '_blank', 'noopener')
          else document.getElementById('recall-vin')?.focus()
        }}
      >
        <div className="field">
          <label htmlFor="recall-vin">
            Vehicle Identification Number (VIN)<span className="req" aria-hidden="true">*</span>
          </label>
          <div className="search-row">
            <input id="recall-vin" className="input num" value={vin} maxLength={17} onChange={(e) => setVin(e.target.value.toUpperCase())} aria-invalid={err ? 'true' : undefined} aria-describedby={`recall-hint${err ? ' recall-err' : ''}`} aria-required="true" />
            <button className="btn" type="submit">
              Check on NHTSA <span className="sr-only">(opens in a new tab)</span>
            </button>
          </div>
          <span className="hint" id="recall-hint">
            17 characters. Find it on your registration, insurance card or the driver-side dashboard.
          </span>
          {err && (
            <span className="error" id="recall-err">
              {err}
            </span>
          )}
        </div>
        {ok && (
          <p role="status" className="mt-2 mb-0">
            Opened NHTSA's recall lookup in a new tab. If a recall is open, <Link to="/schedule-service">schedule your free repair</Link>.
          </p>
        )}
      </form>
    </Page>
  )
}
