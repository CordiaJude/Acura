import { useId, useState } from 'react'
import { money, money2, monthlyPayment } from '../lib/inventory.js'

const TERMS = [36, 48, 60, 72, 84]

/** Front-end loan math only. Estimates exclude tax, title and fees. */
export default function PaymentCalculator({ price = 45000, compact = false, headingLevel = 3 }) {
  const id = useId()
  const [vals, setVals] = useState({ price: String(Math.round(price)), down: String(Math.round(price * 0.1)), term: 60, apr: '6.9', trade: '0' })
  const num = (s) => Math.max(0, Number(String(s).replace(/[^0-9.]/g, '')) || 0)
  const principal = num(vals.price) - num(vals.down) - num(vals.trade)
  const apr = Math.min(30, num(vals.apr))
  const pay = monthlyPayment(principal, apr, Number(vals.term))
  const total = pay * Number(vals.term)
  const interest = Math.max(0, total - Math.max(0, principal))
  const set = (k) => (e) => setVals({ ...vals, [k]: e.target.value })
  const H = `h${headingLevel}`
  return (
    <div className={`calc ${compact ? 'is-compact' : ''}`}>
      <div className="calc-inputs form-grid">
        <div className="field">
          <label htmlFor={`${id}-price`}>Vehicle price</label>
          <input id={`${id}-price`} className="input num" inputMode="decimal" value={vals.price} onChange={set('price')} />
        </div>
        <div className="field">
          <label htmlFor={`${id}-down`}>Down payment</label>
          <input id={`${id}-down`} className="input num" inputMode="decimal" value={vals.down} onChange={set('down')} />
        </div>
        <div className="field">
          <label htmlFor={`${id}-trade`}>Trade-in value</label>
          <input id={`${id}-trade`} className="input num" inputMode="decimal" value={vals.trade} onChange={set('trade')} />
        </div>
        <div className="field">
          <label htmlFor={`${id}-apr`}>APR (%)</label>
          <input id={`${id}-apr`} className="input num" inputMode="decimal" value={vals.apr} onChange={set('apr')} aria-describedby={`${id}-apr-h`} />
          <span className="hint" id={`${id}-apr-h`}>
            Your rate depends on credit approval.
          </span>
        </div>
        <fieldset className="field span-all">
          <legend>Term (months)</legend>
          <div className="seg">
            {TERMS.map((t) => (
              <label key={t} className={`seg-opt${Number(vals.term) === t ? ' is-on' : ''}`}>
                <input type="radio" name={`${id}-term`} value={t} checked={Number(vals.term) === t} onChange={() => setVals({ ...vals, term: t })} />
                <span className="num">{t}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="calc-result" aria-live="polite">
        <H className="calc-h">Estimated payment</H>
        <p className="calc-pay num">
          {money(pay)}
          <span>/mo</span>
        </p>
        <dl className="dl small">
          <dt>Amount financed</dt>
          <dd className="num">{money(Math.max(0, principal))}</dd>
          <dt>Total interest</dt>
          <dd className="num">{money2(interest)}</dd>
          <dt>Term</dt>
          <dd className="num">
            {vals.term} months at {apr}% APR
          </dd>
        </dl>
        <p className="legal mt-1 mb-0">Estimate only. Excludes tax, title, license and fees. Not an offer of credit.</p>
      </div>
    </div>
  )
}
