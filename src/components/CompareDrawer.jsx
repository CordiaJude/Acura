import { Link, useLocation } from 'react-router-dom'
import { useGarage, COMPARE_MAX } from '../lib/garage.jsx'
import { byStock, money } from '../lib/inventory.js'
import Icon from './Icon.jsx'
import { Img } from './ui.jsx'

export default function CompareDrawer() {
  const { compare, toggleCompare, clearCompare } = useGarage()
  const { pathname } = useLocation()
  if (!compare.length || pathname === '/compare') return null
  const list = compare.map((s) => byStock.get(s)).filter(Boolean)
  return (
    <aside className="compare-drawer" aria-label="Compare vehicles">
      <div className="container compare-inner">
        <p className="compare-title">
          <strong>Compare</strong> <span className="num">({list.length}/{COMPARE_MAX})</span>
        </p>
        <ul className="compare-list">
          {list.map((v) => (
            <li key={v.stock}>
              <Img src={v.photos[0]} alt="" ratio="4 / 3" className="compare-thumb" />
              <span className="compare-name">
                {v.year} {v.model}
                <span className="num small"> {money(v.price)}</span>
              </span>
              <button type="button" className="icon-btn icon-sm" onClick={() => toggleCompare(v.stock)} aria-label={`Remove ${v.year} ${v.make} ${v.model} from compare`}>
                <Icon name="close" size={16} />
              </button>
            </li>
          ))}
        </ul>
        <div className="row">
          <Link to="/compare" className="btn btn-sm" aria-disabled={list.length < 2 ? 'true' : undefined} tabIndex={list.length < 2 ? -1 : undefined}>
            Compare {list.length < 2 ? '(add 2+)' : 'now'}
          </Link>
          <button type="button" className="btn btn-sm btn-ghost" onClick={clearCompare}>
            Clear
          </button>
        </div>
      </div>
    </aside>
  )
}
