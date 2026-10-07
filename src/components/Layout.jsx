import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import { AcuraMark, Modal, PrecisionBadge, Wordmark } from './ui.jsx'
import { DEALER, FOOTER_COLUMNS, HOURS, NAV, PHONES, tel } from '../data/site.js'
import { useGarage } from '../lib/garage.jsx'
import Chat from './Chat.jsx'
import CompareDrawer from './CompareDrawer.jsx'

function UtilityBar() {
  const [lang, setLang] = useState(false)
  const [note, setNote] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    if (!lang) return
    const off = (e) => !ref.current?.contains(e.target) && setLang(false)
    const esc = (e) => e.key === 'Escape' && setLang(false)
    document.addEventListener('click', off)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('click', off)
      document.removeEventListener('keydown', esc)
    }
  }, [lang])
  return (
    <div className="utility on-dark">
      <div className="container utility-inner">
        <ul className="utility-list">
          <li>
            <a href={tel(PHONES.sales.number)}>
              <Icon name="phone" size={16} /> Sales: <span className="num">{PHONES.sales.number}</span>
            </a>
          </li>
          <li>
            <a href={tel(PHONES.service.number)}>
              <Icon name="phone" size={16} /> Service: <span className="num">{PHONES.service.number}</span>
            </a>
          </li>
          <li className="hide-sm">
            <a href={DEALER.mapsUrl} target="_blank" rel="noopener noreferrer">
              <Icon name="pin" size={16} /> {DEALER.address}
              <span className="sr-only"> (opens Google Maps in a new tab)</span>
            </a>
          </li>
          <li className="hide-md">
            <Icon name="clock" size={16} /> Sales: 9am-7pm&nbsp;&nbsp;Service: 7:30am-5:30pm
          </li>
        </ul>
        <div className="lang" ref={ref}>
          <button type="button" className="lang-btn" aria-expanded={lang} aria-controls="lang-menu" onClick={() => setLang(!lang)}>
            <Icon name="globe" size={16} /> Languages <Icon name="chevD" size={14} />
          </button>
          {lang && (
            <ul id="lang-menu" className="lang-menu glass">
              <li>
                <button type="button" aria-current="true" onClick={() => { setNote(''); setLang(false) }}>
                  English
                </button>
              </li>
              <li>
                <button type="button" lang="es" onClick={() => { setNote('La versión en español estará disponible pronto. [PLACEHOLDER]'); setLang(false) }}>
                  Español
                </button>
              </li>
            </ul>
          )}
          <span role="status" className="lang-note">{note}</span>
        </div>
      </div>
    </div>
  )
}

function DesktopNav() {
  const [open, setOpen] = useState(null)
  const navRef = useRef(null)
  const loc = useLocation()
  const closeTimer = useRef()
  const hoverAt = useRef(0)
  useEffect(() => setOpen(null), [loc.pathname, loc.search])
  useEffect(() => {
    const off = (e) => !navRef.current?.contains(e.target) && setOpen(null)
    document.addEventListener('click', off)
    return () => document.removeEventListener('click', off)
  }, [])
  // Highlight only the first section that owns the current page (some pages sit in two menus).
  const activeIndex = NAV.findIndex(
    (item) => item.items.some(([, h]) => loc.pathname === h.split('#')[0]) || loc.pathname.startsWith(item.href + '/'),
  )
  const onKey = (e, i) => {
    if (e.key === 'Escape' && open !== null) {
      setOpen(null)
      navRef.current?.querySelectorAll('.nav-top')[i]?.focus()
    }
  }
  return (
    <nav aria-label="Main" className="nav-desktop" ref={navRef}>
      <ul className="nav-list">
        {NAV.map((item, i) => {
          const isOpen = open === i
          const active = i === activeIndex
          return (
            <li
              key={item.label}
              className="nav-item"
              onMouseEnter={() => { clearTimeout(closeTimer.current); if (open !== i) hoverAt.current = Date.now(); setOpen(i) }}
              onMouseLeave={() => { closeTimer.current = setTimeout(() => setOpen((o) => (o === i ? null : o)), 140) }}
              onKeyDown={(e) => onKey(e, i)}
            >
              <button
                type="button"
                className={`nav-top${active ? ' is-active' : ''}`}
                aria-expanded={isOpen}
                aria-controls={`menu-${i}`}
                onClick={() => {
                  // A mouse click right after hover-open should not immediately close the menu.
                  if (isOpen && Date.now() - hoverAt.current < 600) return
                  setOpen(isOpen ? null : i)
                }}
              >
                {item.label}
                <Icon name="chevD" size={14} className="nav-chev" />
              </button>
              <div id={`menu-${i}`} className={`nav-menu glass-dark${item.items.length > 4 ? ' two-col' : ''}`} hidden={!isOpen}>
                <ul>
                  {item.items.map(([label, href]) => (
                    <li key={label + href}>
                      <NavLink to={href} end>
                        {label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function MobileNav({ open, onClose }) {
  const [section, setSection] = useState(null)
  const loc = useLocation()
  useEffect(() => onClose(), [loc.pathname]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Modal open={open} onClose={onClose} title="Menu" wide>
      <nav aria-label="Main mobile" className="nav-mobile">
        <ul>
          {NAV.map((item, i) => (
            <li key={item.label}>
              <button type="button" className="acc-btn" aria-expanded={section === i} aria-controls={`m-menu-${i}`} onClick={() => setSection(section === i ? null : i)}>
                {item.label}
                <Icon name="chevD" className="chev" />
              </button>
              <ul id={`m-menu-${i}`} hidden={section !== i} className="nav-mobile-sub">
                {item.items.map(([label, href]) => (
                  <li key={label + href}>
                    <Link to={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="row mt-3">
          <a className="btn" href={tel(PHONES.sales.number)}>
            <Icon name="phone" size={18} /> Call Sales
          </a>
          <a className="btn btn-secondary" href={tel(PHONES.service.number)}>
            Call Service
          </a>
        </div>
      </nav>
    </Modal>
  )
}

export function SearchDialog({ open, onClose }) {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  return (
    <Modal open={open} onClose={onClose} title="Search Joe Bullard Acura">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
          navigate(`/search?q=${encodeURIComponent(q.trim())}`)
        }}
      >
        <label htmlFor="site-search" className="label">
          Search inventory and pages
        </label>
        <div className="search-row mt-1">
          <input id="site-search" className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="MDX, VIN, stock #, service…" autoFocus />
          <button className="btn btn-navy" type="submit">
            <Icon name="search" size={18} /> Search
          </button>
        </div>
        <p className="small muted mt-2">
          Popular: <Link to="/new-vehicles/mdx" onClick={onClose}>New MDX</Link> · <Link to="/used-vehicles/precision-used" onClick={onClose}>Certified pre-owned</Link> ·{' '}
          <Link to="/schedule-service" onClick={onClose}>Schedule service</Link>
        </p>
      </form>
    </Modal>
  )
}

function Header({ onSearch }) {
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 48)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`site-header on-dark${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Joe Bullard Acura home">
          <AcuraMark size={30} />
          <span className="brand-text">Joe Bullard Acura</span>
        </Link>
        <Link to="/acura-precision-team" className="award" aria-label="Acura Precision Team 2025 award">
          <PrecisionBadge />
        </Link>
        <DesktopNav />
        <div className="header-actions">
          <button type="button" className="icon-btn icon-btn-dark" onClick={onSearch} aria-label="Search">
            <Icon name="search" />
          </button>
          <button type="button" className="icon-btn icon-btn-dark menu-btn" onClick={() => setMenu(true)} aria-label="Open menu" aria-haspopup="dialog">
            <Icon name="menu" />
          </button>
        </div>
      </div>
      <MobileNav open={menu} onClose={() => setMenu(false)} />
    </header>
  )
}

export function MapBand() {
  const [from, setFrom] = useState('')
  return (
    <section className="map-band on-dark" aria-labelledby="map-band-h">
      <div className="container map-grid">
        <a className="map-img" href={DEALER.mapsUrl} target="_blank" rel="noopener noreferrer">
          <StaticMap />
          <span className="sr-only">Open in Google Maps (new tab)</span>
        </a>
        <div className="map-copy">
          <p className="eyebrow">Visit us</p>
          <h2 id="map-band-h">Joe Bullard Acura</h2>
          <address>
            {DEALER.street}
            <br />
            {DEALER.city}, {DEALER.state} {DEALER.zip}
          </address>
          <p className="mt-1">
            Sales <a href={tel(PHONES.sales.number)} className="num">{PHONES.sales.number}</a> · Service{' '}
            <a href={tel(PHONES.service.number)} className="num">{PHONES.service.number}</a>
          </p>
          <form
            className="dir-form"
            onSubmit={(e) => {
              e.preventDefault()
              window.open(DEALER.directionsUrl(from.trim()), '_blank', 'noopener')
            }}
          >
            <label htmlFor="dir-from" className="sr-only">
              Your starting address
            </label>
            <input id="dir-from" className="input" placeholder="Enter your starting address" value={from} onChange={(e) => setFrom(e.target.value)} autoComplete="street-address" />
            <button type="submit" className="btn btn-light">
              Get Directions <span className="sr-only">(opens Google Maps in a new tab)</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

function StaticMap() {
  // Static map placeholder (no map API). [PLACEHOLDER: swap for a static map image]
  return (
    <svg viewBox="0 0 480 300" role="img" aria-label="Map placeholder showing Joe Bullard Acura beside Interstate 65 in Mobile, Alabama">
      <rect width="480" height="300" fill="#eeeeee" />
      <g stroke="#ffffff" strokeWidth="10" fill="none">
        <path d="M0 210 L480 160" />
        <path d="M60 0 L140 300" />
        <path d="M330 0 L300 300" />
      </g>
      <path d="M250 0 L210 300" stroke="#afafaf" strokeWidth="18" fill="none" />
      <path d="M250 0 L210 300" stroke="#ffffff" strokeWidth="2" strokeDasharray="10 10" fill="none" />
      <rect x="196" y="20" width="44" height="22" rx="11" fill="#004b87" />
      <text x="218" y="36" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="800" fontFamily="Mulish, sans-serif">I-65</text>
      <g transform="translate(250 128)">
        <circle r="30" fill="#005cd3" opacity=".18" />
        <path d="M0 18s-16-14-16-26a16 16 0 0132 0c0 12-16 26-16 26z" fill="#e6231e" />
        <circle cy="-8" r="6" fill="#fff" />
      </g>
      <rect x="276" y="104" width="168" height="34" rx="17" fill="#fff" />
      <text x="360" y="126" textAnchor="middle" fill="#111" fontSize="14" fontWeight="700" fontFamily="Mulish, sans-serif">Joe Bullard Acura</text>
    </svg>
  )
}

function Footer() {
  return (
    <footer className="site-footer on-dark">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <Wordmark />
              <span className="sr-only"> home page</span>
            </Link>
            <address className="mt-2">
              <a href={DEALER.mapsUrl} target="_blank" rel="noopener noreferrer">
                {DEALER.street}
                <br />
                {DEALER.city}, {DEALER.state} {DEALER.zip}
                <span className="sr-only"> (opens Google Maps in a new tab)</span>
              </a>
            </address>
            <ul className="footer-phones">
              {Object.values(PHONES).map((p) => (
                <li key={p.label}>
                  <span>{p.label}</span> <a href={tel(p.number)} className="num">{p.number}</a>
                </li>
              ))}
            </ul>
            <div className="footer-hours">
              <HoursTable title="Sales" rows={HOURS.sales} />
              <HoursTable title="Service & Parts" rows={HOURS.service} />
            </div>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="footer-col">
              <h2 className="footer-h">{col.title}</h2>
              <ul>
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link to={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer-bottom">
          <ul className="social" aria-label="Social media">
            {DEALER.social.map((s) => (
              <li key={s.icon}>
                <a className="icon-btn icon-btn-dark" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${s.label} (opens in a new tab)`}>
                  <Icon name={s.icon} />
                </a>
              </li>
            ))}
          </ul>
          <p className="service-area">{DEALER.serviceArea}</p>
          <p className="legal footer-legal">
            © 2026 Joe Bullard Acura. Prices exclude tax, title, license and registration. ·{' '}
            <Link to="/privacy">Privacy</Link> · <Link to="/accessibility">Accessibility</Link> · <Link to="/sitemap">Site map</Link> · <Link to="/contact">Contact</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

export function HoursTable({ title, rows }) {
  return (
    <table className="hours">
      <caption>{title}</caption>
      <tbody>
        {rows.map(([d, h]) => (
          <tr key={d}>
            <th scope="row">{d}</th>
            <td className="num">{h}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function BottomBar({ onSearch }) {
  const { saved } = useGarage()
  return (
    <nav className="bottom-bar glass-dark on-dark" aria-label="Quick actions">
      <Link to="/contact">
        <Icon name="phone" /> <span>Contact</span>
      </Link>
      <button type="button" onClick={onSearch}>
        <Icon name="search" /> <span>Search</span>
      </button>
      <Link to="/accessibility">
        <Icon name="access" /> <span>Accessibility</span>
      </Link>
      <Link to="/my-profile">
        <Icon name="user" /> <span>My Profile</span>
        {saved.length > 0 && (
          <span className="count-dot" aria-label={`${saved.length} saved`}>
            {saved.length}
          </span>
        )}
      </Link>
    </nav>
  )
}

function RouteEffects() {
  const { pathname, hash } = useLocation()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [pathname, hash])
  return null
}

export default function Layout() {
  const [search, setSearch] = useState(false)
  const { message } = useGarage()
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <RouteEffects />
      <UtilityBar />
      <Header onSearch={() => setSearch(true)} />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <MapBand />
      <Footer />
      <BottomBar onSearch={() => setSearch(true)} />
      <CompareDrawer />
      <Chat />
      <SearchDialog open={search} onClose={() => setSearch(false)} />
      <div className="toast" role="status" aria-live="polite">
        {message && <span className="toast-msg">{message}</span>}
      </div>
    </>
  )
}
