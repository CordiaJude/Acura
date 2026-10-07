import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Page, { Section } from '../components/Page.jsx'
import { GhostLink, Modal, Placeholder, PrecisionBadge, Tabs, WithPlaceholders } from '../components/ui.jsx'
import SmartForm, { COMMENTS, CONTACT_FIELDS, CONTACT_PREF } from '../components/Form.jsx'
import Icon from '../components/Icon.jsx'
import { HoursTable } from '../components/Layout.jsx'
import { DEALER, HOURS, NAV, PHONES, POSTS, STAFF, tel } from '../data/site.js'
import { vehicles } from '../lib/inventory.js'
import NotFound from './NotFound.jsx'

const DLR = ['Dealership', '/about-us']

export function AboutUs() {
  return (
    <Page title="About Us" crumbs={[DLR, ['About Us']]} intro="Joe Bullard Acura is part of the Joe Bullard family of dealerships serving the Gulf Coast.">
      <p>
        From our showroom on the I-65 Service Road in Mobile, we sell new Acura vehicles, Acura Precision Certified and quality pre-owned vehicles, and offer a full
        service center, parts department and collision center. Our team was named to the Acura Precision Team for 2025.
      </p>
      <p>
        We are proud to serve drivers from Mobile, Daphne, Fairhope, Pensacola, Gulfport, Biloxi and Orange Beach. <Placeholder>PLACEHOLDER: dealership history and founding year</Placeholder>
      </p>
      <div className="grid grid-3 mt-3">
        {[
          ['Meet Our Staff', '/staff', 'user'],
          ['Customer Testimonials', '/testimonials', 'star'],
          ['Careers', '/careers', 'spark'],
        ].map(([t, h, i]) => (
          <Link key={h} to={h} className="hub-card card card-pad">
            <Icon name={i} size={26} className="pillar-icon" />
            <span className="h4">{t}</span>
            <Icon name="arrowR" className="quick-arrow" />
          </Link>
        ))}
      </div>
    </Page>
  )
}

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
}

function StaffCard({ p }) {
  const [email, setEmail] = useState(false)
  return (
    <li className="staff-card card card-pad">
      <div className="avatar" aria-hidden="true">
        <span>{initials(p.name)}</span>
      </div>
      <span className="placeholder-tag avatar-tag">PLACEHOLDER photo</span>
      <h3 className="h4 mb-0">{p.name}</h3>
      <p className="small muted mb-0">{p.title}</p>
      {p.note && (
        <p className="small mb-0">
          <WithPlaceholders text={p.note} />
        </p>
      )}
      {p.phone && (
        <a href={tel(p.phone)} className="num staff-phone">
          {p.phone}
        </a>
      )}
      <button type="button" className="btn btn-secondary btn-sm mt-1" onClick={() => setEmail(true)}>
        <Icon name="mail" size={16} /> Email Me<span className="sr-only">: {p.name}</span>
      </button>
      <Modal open={email} onClose={() => setEmail(false)} title={`Email ${p.name}`}>
        <SmartForm refPrefix="MSG" submitLabel="Send message" successTitle={`Message for ${p.name} received.`} fields={[...CONTACT_FIELDS, { ...COMMENTS, label: 'Message', required: true }]} />
      </Modal>
    </li>
  )
}

export function Staff() {
  return (
    <Page title="Meet Our Staff" crumbs={[DLR, ['Meet Our Staff']]} intro="The people behind Joe Bullard Acura." sidebar={false}>
      <Tabs
        label="Departments"
        tabs={STAFF.map((d) => ({
          id: d.dept,
          label: d.dept,
          content: (
            <>
              <h2 className="sr-only">{d.dept}</h2>
              <ul className="staff-grid">
                {d.people.map((p) => (
                  <StaffCard key={p.name} p={p} />
                ))}
              </ul>
            </>
          ),
        }))}
      />
    </Page>
  )
}

export function Testimonials() {
  return (
    <Page title="Customer Testimonials" crumbs={[DLR, ['Customer Testimonials']]} intro="Hear from Joe Bullard Acura customers in their own words.">
      <div className="card card-pad">
        <p>
          <Placeholder>PLACEHOLDER: reviews</Placeholder> We don't publish made-up quotes. Read verified reviews from real customers on Google.
        </p>
        <div className="row">
          <a href={DEALER.googleReviewsUrl} className="btn" target="_blank" rel="noopener noreferrer">
            Read our Google reviews <span className="sr-only">(opens in a new tab)</span>
          </a>
          <Link to="/leave-a-review" className="btn btn-secondary">
            Leave us a review
          </Link>
        </div>
      </div>
    </Page>
  )
}

export function PrecisionTeam() {
  return (
    <Page title="Acura Precision Team" crumbs={[DLR, ['Acura Precision Team']]} intro="Joe Bullard Acura is a 2025 Acura Precision Team award recipient.">
      <div className="award-card card card-pad on-dark">
        <PrecisionBadge />
        <div>
          <h2 className="h3">2025 Acura Precision Team</h2>
          <p className="mb-0">
            The Precision Team award recognizes Acura dealers for excellence in sales, service and customer experience.{' '}
            <Placeholder>PLACEHOLDER: confirm award criteria copy</Placeholder>
          </p>
        </div>
      </div>
      <Section id="means" title="What it means for you">
        <ul className="list-check">
          <li>A sales team focused on a transparent, respectful experience</li>
          <li>Acura-trained technicians and Genuine Acura parts</li>
          <li>Follow-through after the sale</li>
        </ul>
      </Section>
      <GhostLink to="/staff">Meet the team</GhostLink>
    </Page>
  )
}


export function Blog() {
  return (
    <Page title="Joe Bullard Acura Blog" crumbs={[DLR, ['Blog']]} intro="News, tips and Acura know-how from our team.">
      <ul className="grid grid-3 plain">
        {POSTS.map((p) => (
          <li key={p.slug} className="card card-pad blog-card">
            <Placeholder>PLACEHOLDER post</Placeholder>
            <h2 className="h4 mt-1">
              <Link to={`/blog/${p.slug}`}>{p.title}</Link>
            </h2>
            <p className="small muted">
              <time dateTime={p.date}>{new Date(p.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
            </p>
            <p className="mb-0">{p.excerpt}</p>
          </li>
        ))}
      </ul>
    </Page>
  )
}

export function BlogPost() {
  const { slug } = useParams()
  const p = POSTS.find((x) => x.slug === slug)
  if (!p) return <NotFound />
  return (
    <Page title={p.title} crumbs={[DLR, ['Blog', '/blog'], [p.title]]}>
      <p className="small muted">
        <time dateTime={p.date}>{p.date}</time> · <Placeholder>PLACEHOLDER post</Placeholder>
      </p>
      <p>{p.excerpt}</p>
      <p>
        <Placeholder>PLACEHOLDER: full article copy</Placeholder>
      </p>
      <GhostLink to="/blog">Back to the blog</GhostLink>
    </Page>
  )
}

export function LeaveReview() {
  return (
    <Page title="Leave Us A Review" crumbs={[DLR, ['Leave Us A Review']]} intro="Thanks for choosing Joe Bullard Acura. Your feedback helps us and helps other drivers.">
      <div className="row">
        <a href={DEALER.googleWriteReviewUrl} className="btn" target="_blank" rel="noopener noreferrer">
          Review us on Google <span className="sr-only">(opens in a new tab)</span>
        </a>
        <a href={DEALER.yelpUrl} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
          Review us on Yelp <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </Page>
  )
}

export function DealerNearMe({ used = false }) {
  const n = vehicles.filter((v) => (used ? v.condition !== 'new' : v.condition === 'new')).length
  const title = used ? 'Used Car Dealer near Me' : 'Acura Dealer near Me'
  return (
    <Page title={title} crumbs={[DLR, [title]]} intro={`Joe Bullard Acura is the ${used ? 'pre-owned' : 'Acura'} dealer for Mobile and the Gulf Coast.`}>
      <p>
        Located right off I-65 at {DEALER.address}, we're an easy drive from Daphne, Fairhope, Pensacola, Gulfport, Biloxi and Orange Beach. We have {n}{' '}
        {used ? 'pre-owned vehicles, including Acura Precision Certified models and trade-ins of many makes,' : 'new Acura vehicles'} in stock today.
      </p>
      <div className="grid grid-2 mt-3">
        {[
          ['Pensacola, FL', 'About an hour west on I-10.'],
          ['Daphne & Fairhope', 'About 20-30 minutes across the Bayway.'],
          ['Gulfport & Biloxi, MS', 'About an hour east on I-10.'],
          ['Orange Beach', 'About an hour and 15 minutes.'],
        ].map(([t, d]) => (
          <div key={t} className="card card-pad">
            <h2 className="h4">{t}</h2>
            <p className="mb-0 muted">{d}</p>
          </div>
        ))}
      </div>
      <div className="row mt-3">
        <Link to={used ? '/used-vehicles' : '/new-vehicles'} className="btn">
          Shop {used ? 'used' : 'new'} inventory
        </Link>
        <Link to="/directions" className="btn btn-secondary">
          Get directions
        </Link>
      </div>
    </Page>
  )
}

export function Careers() {
  return (
    <Page title="Careers" crumbs={[DLR, ['Careers']]} intro="Build your career with the Joe Bullard family of dealerships.">
      <p>
        We hire for sales, service, parts, detail and administrative roles. <Placeholder>PLACEHOLDER: link to current job openings</Placeholder>
      </p>
      <Section id="apply" title="Express interest">
        <SmartForm
          refPrefix="JOB"
          submitLabel="Send"
          fields={[...CONTACT_FIELDS, { name: 'role', label: 'Area of interest', type: 'select', required: true, options: ['Sales', 'Service technician', 'Service advisor', 'Parts', 'Detail / porter', 'Finance', 'Other'] }, { ...COMMENTS, label: 'Tell us about yourself' }]}
        />
      </Section>
    </Page>
  )
}

export function Directions() {
  return (
    <Page title="Directions" crumbs={[DLR, ['Directions']]} intro={DEALER.address}>
      <div className="row">
        <a href={DEALER.directionsUrl()} className="btn" target="_blank" rel="noopener noreferrer">
          <Icon name="pin" size={18} /> Get Directions <span className="sr-only">(opens Google Maps in a new tab)</span>
        </a>
        <a href={tel(PHONES.main.number)} className="btn btn-secondary">
          Call {PHONES.main.number}
        </a>
      </div>
      <Section id="from" title="Getting here">
        <ul className="list-check">
          <li>From I-65: take the exit for the East I-65 Service Road South; we're on the service road. <Placeholder>PLACEHOLDER: confirm exit number</Placeholder></li>
          <li>From I-10 (Pensacola, Fairhope, Daphne): head west into Mobile, then north on I-65.</li>
          <li>From Mississippi: I-10 east to I-65 north.</li>
        </ul>
      </Section>
      <div className="hours-grid">
        <HoursTable title="Sales hours" rows={HOURS.sales} />
        <HoursTable title="Service & Parts hours" rows={HOURS.service} />
      </div>
    </Page>
  )
}

export function Contact() {
  return (
    <Page title="Contact Us" crumbs={[['Contact Us']]} intro="Questions about a vehicle, service or financing? Send us a note or give us a call.">
      <div className="card card-pad">
        <SmartForm
          refPrefix="CNT"
          submitLabel="Send message"
          successTitle="Thanks — your message is in."
          fields={[...CONTACT_FIELDS, CONTACT_PREF, { name: 'dept', label: 'Department', type: 'select', required: true, options: ['Sales', 'Service', 'Parts', 'Finance', 'Collision', 'General'] }, { ...COMMENTS, required: true, label: 'How can we help?' }]}
        />
      </div>
    </Page>
  )
}

export function Privacy() {
  return (
    <Page title="Privacy" crumbs={[['Privacy']]}>
      <p>This demo site does not send form data anywhere. Saved vehicles and compare lists are stored only in your browser (localStorage) and can be cleared from My Profile.</p>
      <p>
        <Placeholder>PLACEHOLDER: dealership privacy policy</Placeholder>
      </p>
    </Page>
  )
}

export function Accessibility() {
  return (
    <Page title="Accessibility" crumbs={[['Accessibility']]} intro="We want everyone to be able to shop, finance and service with us online.">
      <p>This site is designed to meet WCAG 2.1 AA. That includes:</p>
      <ul className="list-check">
        <li>Keyboard access to every menu, gallery and form, with visible focus rings</li>
        <li>Text alternatives for vehicle photos</li>
        <li>Color contrast that meets AA, and no information conveyed by color alone</li>
        <li>Reduced motion and reduced transparency respected from your system settings</li>
        <li>Form errors announced and linked to their fields</li>
      </ul>
      <p>
        Having trouble? Call us at <a href={tel(PHONES.main.number)}>{PHONES.main.number}</a> or <Link to="/contact">send a message</Link> and we'll help you directly.
      </p>
    </Page>
  )
}

export function SiteMap() {
  return (
    <Page title="Site map" crumbs={[['Site map']]} sidebar={false}>
      <div className="grid grid-3">
        {NAV.map((n) => (
          <nav key={n.label} aria-label={n.label}>
            <h2 className="h4">{n.label}</h2>
            <ul className="plain-list">
              {n.items.map(([l, h]) => (
                <li key={l + h}>
                  <Link to={h}>{l}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <nav aria-label="More">
          <h2 className="h4">More</h2>
          <ul className="plain-list">
            {[
              ['Home', '/'],
              ['Contact', '/contact'],
              ['Directions', '/directions'],
              ['Careers', '/careers'],
              ['My Profile', '/my-profile'],
              ['Compare', '/compare'],
              ['Search', '/search'],
              ['Accessibility', '/accessibility'],
              ['Privacy', '/privacy'],
              ['Specials', '/specials'],
              ['Value Your Trade', '/value-your-trade'],
              ['Acura EV Education', '/acura-ev-education'],
            ].map(([l, h]) => (
              <li key={h}>
                <Link to={h}>{l}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Page>
  )
}
