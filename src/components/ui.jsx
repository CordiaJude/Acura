import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon, { CarSilhouette } from './Icon.jsx'

/** Image with lazy loading, fixed aspect ratio and a graceful fallback if the URL fails. */
export function Img({ src, alt, ratio = '4 / 3', eager = false, className = '', fallbackLabel, sizes, style, ...rest }) {
  const [failed, setFailed] = useState(!src)
  const imgRef = useRef(null)
  useEffect(() => {
    // An image that failed before hydration never fires React's onError; check it directly.
    const el = imgRef.current
    setFailed(!src || (!!el && el.complete && el.naturalWidth === 0))
  }, [src])
  return (
    <div className={`img-frame ${className}`} style={{ aspectRatio: ratio, ...style }}>
      {!failed && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : undefined}
          decoding="async"
          sizes={sizes}
          onError={() => setFailed(true)}
          {...rest}
        />
      )}
      {failed && (
        <div className="img-fallback" role={alt ? 'img' : undefined} aria-label={alt || undefined}>
          <div>
            <CarSilhouette />
            <span aria-hidden="true">{fallbackLabel || 'Photo coming soon'}</span>
          </div>
        </div>
      )}
    </div>
  )
}

/** Accessible modal built on <dialog> (focus trap, Esc, top layer for free). */
export function Modal({ open, onClose, title, children, wide = false, labelledBy }) {
  const ref = useRef(null)
  const titleId = useId()
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? 'modal-wide' : ''}`}
      aria-labelledby={labelledBy || titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      {open && (
        <div className="modal-body">
          <button type="button" className="icon-btn modal-close" onClick={onClose} aria-label="Close dialog">
            <Icon name="close" />
          </button>
          {title && <h2 id={titleId}>{title}</h2>}
          {children}
        </div>
      )}
    </dialog>
  )
}

/** Disclosure accordion. `items`: [{ id, title, content }] */
export function Accordion({ items, defaultOpen = [0], headingLevel = 3, multiple = true }) {
  const [open, setOpen] = useState(() => new Set(defaultOpen))
  const base = useId()
  const H = `h${headingLevel}`
  const toggle = (i) =>
    setOpen((prev) => {
      const next = new Set(multiple ? prev : [])
      if (prev.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  return (
    <div className="accordion">
      {items.map((it, i) => {
        const isOpen = open.has(i)
        return (
          <div className="acc-item" key={it.id || i}>
            <H style={{ margin: 0, fontSize: 'inherit' }}>
              <button
                type="button"
                className="acc-btn"
                aria-expanded={isOpen}
                aria-controls={`${base}-p${i}`}
                id={`${base}-b${i}`}
                onClick={() => toggle(i)}
              >
                <span>{it.title}</span>
                <Icon name="chevD" className="chev" />
              </button>
            </H>
            <div id={`${base}-p${i}`} role="region" aria-labelledby={`${base}-b${i}`} className="acc-panel" hidden={!isOpen}>
              {it.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** ARIA tabs with arrow-key navigation. `tabs`: [{ id, label, content }] */
export function Tabs({ tabs, label, initial = 0, onChange }) {
  const [active, setActive] = useState(initial)
  const base = useId()
  const refs = useRef([])
  const select = (i) => {
    setActive(i)
    onChange?.(i)
  }
  const onKey = (e) => {
    let i = active
    if (e.key === 'ArrowRight') i = (active + 1) % tabs.length
    else if (e.key === 'ArrowLeft') i = (active - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') i = 0
    else if (e.key === 'End') i = tabs.length - 1
    else return
    e.preventDefault()
    select(i)
    refs.current[i]?.focus()
  }
  return (
    <div>
      <div className="tabs" role="tablist" aria-label={label} onKeyDown={onKey}>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="tab"
            className="tab"
            id={`${base}-t${i}`}
            aria-selected={i === active}
            aria-controls={`${base}-p${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`${base}-p${i}`} aria-labelledby={`${base}-t${i}`} hidden={i !== active} tabIndex={0}>
          {i === active && t.content}
        </div>
      ))}
    </div>
  )
}

export function Breadcrumbs({ trail }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <span className="bc-label">You Are Here:</span>
      <ol>
        <li>
          <Link to="/">Home</Link>
        </li>
        {trail.map(([label, href], i) => (
          <li key={label + i}>
            {href && i < trail.length - 1 ? <Link to={href}>{label}</Link> : <span aria-current="page">{label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function Placeholder({ children = 'PLACEHOLDER' }) {
  return <span className="placeholder-tag">{children}</span>
}

/** Renders text, turning "[PLACEHOLDER...]" fragments into visible tags. */
export function WithPlaceholders({ text }) {
  if (!text) return null
  const parts = String(text).split(/(\[PLACEHOLDER[^\]]*\])/g)
  return parts.map((p, i) => (p.startsWith('[PLACEHOLDER') ? <Placeholder key={i}>{p.slice(1, -1)}</Placeholder> : p))
}

export function GhostLink({ to, children, ...rest }) {
  return (
    <Link to={to} className="btn btn-ghost" {...rest}>
      {children} <Icon name="arrowR" className="arrow" size={18} />
    </Link>
  )
}

export function AcuraMark({ size = 36, title }) {
  // Simplified caliper-style "A" mark. [PLACEHOLDER: swap for licensed Acura logo SVG]
  return (
    <svg viewBox="0 0 48 40" width={size * 1.2} height={size} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path
        fill="currentColor"
        d="M24 1C14 1 8 3 6 6L1 36c-.2 1.5.8 2.6 2.4 2.4l4.2-.6L13 9.5c.4-2 1.6-3 3.6-3.2L21 6l-6 31.4 4.5-.6 2.2-12h4.6l2.2 12 4.5.6L27 6l4.4.3c2 .2 3.2 1.2 3.6 3.2l5.4 28.3 4.2.6c1.6.2 2.6-.9 2.4-2.4L42 6c-2-3-8-5-18-5zm-1.4 19.2L24 12l1.4 8.2z"
      />
    </svg>
  )
}

export function PrecisionBadge() {
  // [PLACEHOLDER: replace with official Acura Precision Team 2025 badge artwork]
  return (
    <svg viewBox="0 0 120 40" height="40" width="120" role="img" aria-label="Acura Precision Team 2025 award">
      <rect x="0.75" y="0.75" width="118.5" height="38.5" rx="19.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="60" y="17" textAnchor="middle" fill="currentColor" fontFamily="Mulish, sans-serif" fontSize="9.5" fontWeight="800" letterSpacing=".06em">
        PRECISION TEAM
      </text>
      <text x="60" y="30" textAnchor="middle" fill="currentColor" fontFamily="Mulish, sans-serif" fontSize="9" fontWeight="600">
        Acura · 2025
      </text>
    </svg>
  )
}

export function Wordmark({ light = true }) {
  return (
    <span className="wordmark" style={{ color: light ? 'var(--white)' : 'var(--near-black)' }}>
      <span className="wm-script">Joe Bullard</span>{' '}
      <span className="wm-sub">Acura</span>
    </span>
  )
}
