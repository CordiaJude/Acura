import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { PHONES, tel } from '../data/site.js'

// Front-end chat. Never auto-opens; canned replies only, nothing is sent anywhere.
const REPLIES = {
  inventory: {
    q: 'Show me new inventory',
    a: 'We have new MDX, ADX and Integra models on the lot right now.',
    links: [['Browse new vehicles', '/new-vehicles'], ['New vehicle specials', '/new-vehicles/specials']],
  },
  service: {
    q: 'I need to schedule service',
    a: `Our service drive is open Mon-Fri 7:30 AM-5:30 PM and Sat 8:00 AM-4:00 PM. You can book online or call ${PHONES.service.number}.`,
    links: [['Schedule service', '/schedule-service'], ['Service coupons', '/service-specials']],
  },
  trade: {
    q: 'What is my trade worth?',
    a: 'Tell us about your vehicle and a Joe Bullard appraiser will get back to you with a value.',
    links: [['Value your trade', '/value-your-trade']],
  },
  hours: {
    q: 'Hours and directions',
    a: 'Sales: Mon-Fri 9:00 AM-7:00 PM, Sat 9:00 AM-6:00 PM. We are at 1151 E I-65 Service Rd. S., Mobile, AL 36606.',
    links: [['Get directions', '/directions']],
  },
}

export default function Chat() {
  const [open, setOpen] = useState(false)
  const [log, setLog] = useState([])
  const [text, setText] = useState('')
  const panel = useRef(null)
  const btn = useRef(null)
  const end = useRef(null)

  useEffect(() => {
    if (!open) return
    panel.current?.querySelector('input')?.focus()
    const esc = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        btn.current?.focus()
      }
    }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [open])
  useEffect(() => end.current?.scrollIntoView({ block: 'nearest' }), [log])

  const ask = (key) => {
    const r = REPLIES[key]
    setLog((l) => [...l, { from: 'me', text: r.q }, { from: 'jessica', text: r.a, links: r.links }])
  }
  const send = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    setText('')
    setLog((l) => [
      ...l,
      { from: 'me', text: t },
      {
        from: 'jessica',
        text: `Thanks! This demo chat can't reach a live person yet. For a quick answer, call Sales at ${PHONES.sales.number} or Service at ${PHONES.service.number}.`,
        links: [['Contact us', '/contact']],
      },
    ])
  }

  return (
    <>
      <button
        ref={btn}
        type="button"
        className="chat-fab glass-dark on-dark"
        aria-expanded={open}
        aria-controls="chat-panel"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close chat' : 'Chat with Joe Bullard Acura'}
      >
        <Icon name={open ? 'close' : 'chat'} size={24} />
        {!open && <span className="notif-dot" aria-hidden="true" />}
      </button>
      {open && (
        <section id="chat-panel" className="chat-panel" role="dialog" aria-label="Chat with Jessica" ref={panel}>
          <header className="chat-head on-dark">
            <span className="avatar-sm" aria-hidden="true">J</span>
            <div>
              <strong>Jessica - Joe Bullard Acura</strong>
              <span className="small">Typically replies in minutes</span>
            </div>
            <button type="button" className="icon-btn icon-btn-dark" onClick={() => { setOpen(false); btn.current?.focus() }} aria-label="Close chat">
              <Icon name="close" />
            </button>
          </header>
          <div className="chat-log" aria-live="polite">
            <p className="bubble from-jessica">Hi, I'm Jessica with Joe Bullard Acura. How can I help you today?</p>
            {log.map((m, i) => (
              <div key={i} className={`bubble from-${m.from}`}>
                <span className="sr-only">{m.from === 'me' ? 'You said: ' : 'Jessica said: '}</span>
                {m.text}
                {m.links && (
                  <span className="bubble-links">
                    {m.links.map(([l, h]) => (
                      <Link key={h} to={h} onClick={() => setOpen(false)} className="btn btn-sm btn-secondary">
                        {l}
                      </Link>
                    ))}
                  </span>
                )}
              </div>
            ))}
            <div ref={end} />
          </div>
          <div className="chat-quick" role="group" aria-label="Suggested questions">
            {Object.entries(REPLIES).map(([k, r]) => (
              <button key={k} type="button" className="chip" onClick={() => ask(k)}>
                {r.q}
              </button>
            ))}
          </div>
          <form className="chat-form" onSubmit={send}>
            <label htmlFor="chat-input" className="sr-only">
              Type a message
            </label>
            <input id="chat-input" className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" autoComplete="off" />
            <button type="submit" className="icon-btn btn-send" aria-label="Send message">
              <Icon name="arrowR" />
            </button>
          </form>
          <p className="small chat-foot">
            Prefer to talk? <a href={tel(PHONES.sales.number)}>Call {PHONES.sales.number}</a>
          </p>
        </section>
      )}
    </>
  )
}
