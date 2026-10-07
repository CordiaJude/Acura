import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Page, { Section } from '../components/Page.jsx'
import { Accordion, GhostLink, Placeholder } from '../components/ui.jsx'
import SmartForm, { COMMENTS, CONTACT_FIELDS } from '../components/Form.jsx'
import PaymentCalculator from '../components/PaymentCalculator.jsx'
import Icon from '../components/Icon.jsx'
import { MODELS, PHONES, tel } from '../data/site.js'
import { byStock, vehicleName } from '../lib/inventory.js'

const FIN = ['Finance Center', '/finance']
const STATES = ['AL', 'FL', 'MS', 'GA', 'LA', 'TN', 'Other']

export function FinanceDepartment() {
  const [leaseModel, setLeaseModel] = useState('')
  const faqs = [
    ['Should I lease or buy?', 'Leasing usually means lower monthly payments and a new Acura every few years. Buying builds equity and has no mileage limits. Our finance team can show you both side by side.'],
    ['Can I get financing with less-than-perfect credit?', 'We work with Acura Financial Services and a network of lenders to find options for many credit situations.'],
    ['What do I need to bring?', 'A valid driver\'s license, proof of insurance, and if trading in, your title or loan payoff information.'],
    ['Can I pay off my loan early?', 'Most auto loans can be paid off early without penalty, but check the terms of your specific contract.'],
  ]
  return (
    <Page title="Finance Department" crumbs={[FIN, ['Finance Department']]} hero intro="Lease and loan options from Acura Financial Services and local lenders." actions={<Link to="/apply-for-financing" className="btn btn-light">Apply for financing</Link>}>
      <div className="panel panel-red">
        <h2>Welcome to the Joe Bullard Acura Finance Department</h2>
        <p>Our finance team makes it easy to understand your options, compare lease and loan offers and drive home in the Acura you want, on terms that fit your budget.</p>
        <a href={tel(PHONES.sales.number)} className="btn btn-light">
          <Icon name="phone" size={18} /> Talk to finance
        </a>
      </div>
      <Section id="tools" title="Check Out Our Online Finance Tools">
        <div className="grid grid-3">
          {[
            ['Apply For Financing', '/apply-for-financing', 'Get pre-approved online.'],
            ['Value Your Trade', '/value-your-trade', 'See what your vehicle is worth.'],
            ['Car Payment Calculator', '/car-payment-calculator', 'Estimate your monthly payment.'],
          ].map(([t, h, d]) => (
            <Link key={h} to={h} className="hub-card card card-pad">
              <span className="h4">{t}</span>
              <span className="muted small">{d}</span>
              <Icon name="arrowR" className="quick-arrow" />
            </Link>
          ))}
        </div>
      </Section>
      <Section id="leasing" title="Explore Leasing Options">
        <p>Choose a model to see current lease specials and inventory.</p>
        <div className="search-row" style={{ maxWidth: 520 }}>
          <label htmlFor="lease-model" className="sr-only">
            Model to lease
          </label>
          <select id="lease-model" className="select" value={leaseModel} onChange={(e) => setLeaseModel(e.target.value)}>
            <option value="">Choose a model to lease</option>
            {MODELS.map((m) => (
              <option key={m.model} value={m.href}>
                {m.model}
              </option>
            ))}
          </select>
          <Link to={leaseModel || '/new-lease-specials'} className="btn">
            {leaseModel ? 'View inventory' : 'View lease specials'}
          </Link>
        </div>
      </Section>
      <Section id="specials" title="Navigate Our Specials">
        <div className="row">
          <Link to="/new-lease-specials" className="btn btn-secondary">New lease specials</Link>
          <Link to="/new-vehicles/specials" className="btn btn-secondary">New vehicle specials</Link>
          <Link to="/acura-national-offers" className="btn btn-secondary">Acura national offers</Link>
        </div>
      </Section>
      <Section id="faq" title="FAQs">
        <Accordion items={faqs.map(([q, a]) => ({ id: q, title: q, content: <p>{a}</p> }))} />
      </Section>
    </Page>
  )
}

export function ApplyForFinancing() {
  const [params] = useSearchParams()
  const target = byStock.get(params.get('stock') || '')
  return (
    <Page title="Apply For Financing" crumbs={[FIN, ['Apply For Financing']]} intro="Start your credit application in a few minutes. We never ask for your Social Security number online.">
      {target && (
        <p className="card card-pad small">
          Applying for: <Link to={`/inventory/${target.stock}`}>{vehicleName(target)}</Link> (stock <span className="num">{target.stock}</span>)
        </p>
      )}
      <div className="card card-pad">
        <SmartForm
          refPrefix="CRD"
          submitLabel="Submit application"
          successTitle="Application started."
          successBody={<p className="mb-0"><strong>A finance manager will call you to finish securely.</strong> Demo only — nothing was sent.</p>}
          steps={[
            {
              title: 'About you',
              fields: CONTACT_FIELDS,
              note: 'We never ask for your Social Security number or date of birth online.',
            },
            {
              title: 'Address',
              fields: [
                { name: 'street', label: 'Street address', required: true, autoComplete: 'street-address', span: true },
                { name: 'city', label: 'City', required: true, autoComplete: 'address-level2' },
                { name: 'state', label: 'State', type: 'select', required: true, options: STATES },
                { name: 'zip', label: 'ZIP code', type: 'zip', required: true, autoComplete: 'postal-code' },
                { name: 'housing', label: 'Housing', type: 'select', required: true, options: ['Own', 'Rent', 'Live with family', 'Other'] },
                { name: 'yearsAt', label: 'Years at address', type: 'number', min: 0, max: 80 },
              ],
            },
            {
              title: 'Employment',
              fields: [
                { name: 'employer', label: 'Employer', required: true },
                { name: 'jobTitle', label: 'Job title' },
                { name: 'income', label: 'Gross monthly income ($)', type: 'number', required: true, min: 0, max: 1000000 },
                { name: 'yearsJob', label: 'Years at job', type: 'number', min: 0, max: 60 },
              ],
            },
            {
              title: 'Review',
              intro: 'Last step. A finance manager will call you to finish securely, including any identity verification.',
              fields: [
                { name: 'type', label: 'I want to', type: 'select', required: true, options: ['Finance (buy)', 'Lease', 'Not sure'] },
                { name: 'down', label: 'Planned down payment ($)', type: 'number', min: 0 },
                COMMENTS,
                { name: 'consent', label: 'I authorize Joe Bullard Acura to contact me about this application.', type: 'checkbox', required: true, span: true },
              ],
              note: 'A finance manager will call you to finish securely.',
            },
          ]}
        />
      </div>
    </Page>
  )
}

export function CalculatorPage() {
  const [params] = useSearchParams()
  const v = byStock.get(params.get('stock') || '')
  return (
    <Page title="Car Payment Calculator" crumbs={[FIN, ['Car Payment Calculator']]} intro="Estimate your monthly payment. Front-end math only — no information is sent.">
      <div className="card card-pad">
        <PaymentCalculator price={v?.price || 45000} headingLevel={2} />
      </div>
      <div className="row mt-3">
        <Link to="/apply-for-financing" className="btn">
          Get pre-approved
        </Link>
        <Link to="/new-vehicles" className="btn btn-secondary">
          Shop new
        </Link>
        <Link to="/used-vehicles" className="btn btn-secondary">
          Shop used
        </Link>
      </div>
    </Page>
  )
}

export function LeaseReturn() {
  return (
    <Page title="Acura Lease Return" crumbs={[FIN, ['Acura Lease Return']]} intro="Your Acura lease is ending. Here are your three options.">
      <ol className="option-list">
        <li className="card card-pad">
          <span className="badge badge-new">Option 1</span>
          <h2 className="h3">Return and lease a new one</h2>
          <p>Turn in your current Acura and drive away in a new one. Loyalty offers may apply to returning Acura lessees.</p>
          <GhostLink to="/new-lease-specials">See lease specials</GhostLink>
        </li>
        <li className="card card-pad">
          <span className="badge badge-new">Option 2</span>
          <h2 className="h3">Purchase your leased Acura</h2>
          <p>Love your Acura? Buy it for the purchase option price in your contract. We can help you finance it.</p>
          <GhostLink to="/apply-for-financing">Apply for financing</GhostLink>
        </li>
        <li className="card card-pad">
          <span className="badge badge-new">Option 3</span>
          <h2 className="h3">Return your leased Acura</h2>
          <p>Schedule a pre-inspection, bring the vehicle, keys and manuals, and we'll handle the return paperwork.</p>
          <GhostLink to="/contact">Schedule your return</GhostLink>
        </li>
      </ol>
      <Section id="checklist" title="Lease-end checklist">
        <ul className="list-check">
          <li>Schedule a complimentary pre-inspection about 90 days before lease end</li>
          <li>Gather both keys, owner's manual and accessories</li>
          <li>Note your odometer reading and any excess wear</li>
          <li>Remove personal items and clear paired phones and garage codes</li>
        </ul>
      </Section>
      <Section id="lr-form" title="Talk to us about your lease">
        <SmartForm
          refPrefix="LSE"
          submitLabel="Send"
          fields={[...CONTACT_FIELDS, { name: 'maturity', label: 'Lease end date (month and year)', placeholder: 'MM/YYYY', required: true }, { name: 'option', label: 'Leaning toward', type: 'select', options: ['Option 1: lease new', 'Option 2: purchase', 'Option 3: return', 'Not sure'] }]}
        />
      </Section>
    </Page>
  )
}

export function HondaLease() {
  return (
    <Page title="Turn in Your Honda Lease" crumbs={[FIN, ['Turn in Your Honda Lease']]} intro="Leasing a Honda? You can turn it in at Joe Bullard Acura and step up to an Acura.">
      <p>
        Honda and Acura leases are both serviced by American Honda Finance, so we can accept your Honda lease return here. Many Honda lessees qualify for Acura
        conquest or loyalty offers. <Placeholder>PLACEHOLDER: confirm current Honda-to-Acura offer</Placeholder>
      </p>
      <ol className="num-steps">
        <li><strong>Bring your Honda</strong>, both keys and your owner's manual.</li>
        <li><strong>We inspect and process the return</strong> with American Honda Finance.</li>
        <li><strong>Pick your Acura</strong> and see if a loyalty offer applies.</li>
      </ol>
      <Section id="form" title="Start your Honda lease turn-in">
        <SmartForm
          refPrefix="HND"
          submitLabel="Start turn-in"
          fields={[...CONTACT_FIELDS, { name: 'hondaModel', label: 'Honda model', required: true }, { name: 'maturity', label: 'Lease end date (month and year)', placeholder: 'MM/YYYY' }, COMMENTS]}
        />
      </Section>
    </Page>
  )
}
