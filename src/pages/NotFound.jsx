import { Link } from 'react-router-dom'
import { useTitle } from '../components/Page.jsx'
import Icon from '../components/Icon.jsx'

export default function NotFound() {
  useTitle('Page not found')
  return (
    <section className="section">
      <div className="container notfound">
        <p className="eyebrow">Error 404</p>
        <h1>We can't find that page</h1>
        <p className="lead">The link may be old, or the vehicle may have sold. Try one of these instead:</p>
        <div className="grid grid-3 mt-3">
          {[
            ['New vehicles', '/new-vehicles', 'car'],
            ['Pre-owned vehicles', '/used-vehicles', 'tag'],
            ['Service', '/service', 'wrench'],
          ].map(([t, h, i]) => (
            <Link key={h} to={h} className="hub-card card card-pad">
              <Icon name={i} size={28} className="pillar-icon" />
              <span className="h4">{t}</span>
              <Icon name="arrowR" className="quick-arrow" />
            </Link>
          ))}
        </div>
        <p className="mt-3">
          Or <Link to="/">go to the homepage</Link>.
        </p>
      </div>
    </section>
  )
}
