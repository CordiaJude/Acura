import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Breadcrumbs } from './ui.jsx'
import { HOURS, PHONES, tel } from '../data/site.js'
import Icon from './Icon.jsx'

export const fullTitle = (title) => (title ? `${title} | Joe Bullard Acura in Mobile, AL` : 'Joe Bullard Acura | New & Used Acura Dealer in Mobile, AL')

export function useTitle(title) {
  // During prerender there is no document; the build script reads this to write <title>.
  if (typeof document === 'undefined') globalThis.__ssrTitle = fullTitle(title)
  useEffect(() => {
    document.title = fullTitle(title)
  }, [title])
}

export function DealershipInfo() {
  return (
    <aside className="card card-pad dealer-info" aria-labelledby="dealer-info-h">
      <h2 id="dealer-info-h" className="h3">Dealership Info</h2>
      <ul className="info-phones">
        {Object.values(PHONES).map((p) => (
          <li key={p.label}>
            <span>{p.label}</span>
            <a href={tel(p.number)} className="num">
              {p.number}
            </a>
          </li>
        ))}
      </ul>
      <h3 className="h4">Sales hours</h3>
      <HoursList rows={HOURS.sales} />
      <h3 className="h4">Service and Parts hours</h3>
      <HoursList rows={HOURS.service} />
      <Link to="/directions" className="btn btn-secondary btn-sm btn-block mt-2">
        <Icon name="pin" size={18} /> Directions
      </Link>
    </aside>
  )
}

function HoursList({ rows }) {
  return (
    <dl className="dl hours-dl">
      {rows.map(([d, h]) => (
        <div key={d} className="hours-row">
          <dt>{d}</dt>
          <dd className="num">{h}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Standard inner page: breadcrumbs, title band, content + right-hand Dealership Info card.
 * `hero` renders a dark title band; otherwise the title sits above the content.
 */
export default function Page({ title, crumbs, intro, actions, children, sidebar = true, hero = false, eyebrow, wide = false, docTitle }) {
  useTitle(docTitle || title)
  const trail = crumbs || [[title]]
  return (
    <>
      <div className="crumb-bar">
        <div className="container">
          <Breadcrumbs trail={trail} />
        </div>
      </div>
      {hero ? (
        <section className="page-hero on-dark">
          <div className="container">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            {intro && <p className="lead">{intro}</p>}
            {actions && <div className="row mt-2">{actions}</div>}
          </div>
        </section>
      ) : null}
      <div className={`container page-body${sidebar ? ' with-sidebar' : ''}${wide ? ' wide' : ''}`}>
        <div className="page-main">
          {!hero && (
            <header className="page-head">
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              <h1>{title}</h1>
              {intro && <p className="lead">{intro}</p>}
              {actions && <div className="row mt-2">{actions}</div>}
            </header>
          )}
          {children}
        </div>
        {sidebar && (
          <div className="page-side">
            <DealershipInfo />
          </div>
        )}
      </div>
    </>
  )
}

/** Content section helper used by data-driven pages. */
export function Section({ id, title, children, className = '' }) {
  return (
    <section className={`content-section ${className}`} aria-labelledby={id ? `${id}-h` : undefined} id={id}>
      {title && <h2 id={id ? `${id}-h` : undefined}>{title}</h2>}
      {children}
    </section>
  )
}
