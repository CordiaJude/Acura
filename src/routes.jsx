import { lazy, Suspense } from 'react'
import { matchRoutes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'

// Route groups are code-split so the homepage ships only what it needs.
// lazyPage(): code-split component that can also be preloaded. Once loaded it renders
// synchronously, so prerendered HTML hydrates without hitting a Suspense fallback.
function lazyPage(loader, name = 'default') {
  let Comp = null
  let promise = null
  const preload = () =>
    (promise ||= loader().then((m) => {
      Comp = m[name]
    }))
  const Lazy = lazy(() => preload().then(() => ({ default: Comp })))
  function Page(props) {
    return Comp ? <Comp {...props} /> : <Lazy {...props} />
  }
  Page.preload = preload
  return Page
}
const Listing = lazyPage(() => import('./pages/Listing.jsx'))
const VehicleDetail = lazyPage(() => import('./pages/VehicleDetail.jsx'))
const svc = () => import('./pages/Service.jsx')
const sales = () => import('./pages/Sales.jsx')
const fin = () => import('./pages/Finance.jsx')
const dlr = () => import('./pages/Dealership.jsx')
const misc = () => import('./pages/Misc.jsx')
const named = (loader, name, props) => {
  const C = lazyPage(loader, name)
  return <C {...props} />
}

function Fallback() {
  return (
    <div className="container" style={{ padding: '48px 0' }} aria-busy="true" aria-label="Loading">
      <div className="skeleton" style={{ height: 40, width: '50%' }} />
      <div className="skeleton mt-3" style={{ height: 320 }} />
    </div>
  )
}
const S = (el) => <Suspense fallback={<Fallback />}>{el}</Suspense>
const preloadOf = (el) => el.props.children.type.preload
const L = (presetKey) => S(<Listing key={presetKey} presetKey={presetKey} />)

// Every route in the site map. README lists these too.
export const ROUTES = [
  ['/new-vehicles', L('new')],
  ['/new-vehicles/mdx', L('new-mdx')],
  ['/new-vehicles/adx', L('new-adx')],
  ['/new-vehicles/integra', L('new-integra')],
  ['/new-vehicles/rdx', L('new-rdx')],
  ['/new-vehicles/tlx', L('new-tlx')],
  ['/new-vehicles/suvs', L('new-suvs')],
  ['/new-vehicles/specials', L('new-specials')],
  ['/used-vehicles', L('used')],
  ['/used-vehicles/precision-used', L('used-cpo')],
  ['/used-vehicles/specials', L('used-specials')],
  ['/used-vehicles/suvs', L('used-suvs')],
  ['/used-vehicles/trucks', L('used-trucks')],
  ['/used-vehicles/under-20k', L('used-under-20k')],
  ['/used-vehicles/low-mileage', L('used-low-mileage')],
  ['/inventory/:stock', S(<VehicleDetail />)],
  ['/new-lease-specials', S(named(sales, 'NewLeaseSpecials'))],
  ['/acura-national-offers', S(named(sales, 'NationalOffers'))],
  ['/reserve-your-new-acura', S(named(sales, 'ReserveNew'))],
  ['/acura-info-center', S(named(sales, 'InfoCenter'))],
  ['/acura-ev-education', S(named(sales, 'EvEducation'))],
  ['/model-research', S(named(sales, 'ModelResearch'))],
  ['/why-buy-acura-certified-pre-owned', S(named(sales, 'WhyCpo'))],
  ['/sell-to-us', S(named(sales, 'SellToUs'))],
  ['/value-your-trade', S(named(sales, 'ValueYourTrade'))],
  ['/specials', S(named(sales, 'SpecialsHub'))],
  ['/service', S(named(svc, 'ServiceCenter'))],
  ['/schedule-service', S(named(svc, 'ScheduleService'))],
  ['/service-specials', S(named(svc, 'ServiceSpecials'))],
  ['/service-parts-buy-now-pay-later', S(named(svc, 'BuyNowPayLater'))],
  ['/acura-accelerated-service', S(named(svc, 'AcceleratedService'))],
  ['/parts', S(named(svc, 'PartsDepartment'))],
  ['/order-parts', S(named(svc, 'OrderParts'))],
  ['/order-tires', S(named(svc, 'OrderTires'))],
  ['/collision-center', S(named(svc, 'CollisionCenter'))],
  ['/recall-lookup', S(named(svc, 'RecallLookup'))],
  ['/finance', S(named(fin, 'FinanceDepartment'))],
  ['/apply-for-financing', S(named(fin, 'ApplyForFinancing'))],
  ['/car-payment-calculator', S(named(fin, 'CalculatorPage'))],
  ['/acura-lease-return', S(named(fin, 'LeaseReturn'))],
  ['/turn-in-your-honda-lease', S(named(fin, 'HondaLease'))],
  ['/about-us', S(named(dlr, 'AboutUs'))],
  ['/staff', S(named(dlr, 'Staff'))],
  ['/testimonials', S(named(dlr, 'Testimonials'))],
  ['/acura-precision-team', S(named(dlr, 'PrecisionTeam'))],
  ['/blog', S(named(dlr, 'Blog'))],
  ['/blog/:slug', S(named(dlr, 'BlogPost'))],
  ['/leave-a-review', S(named(dlr, 'LeaveReview'))],
  ['/acura-dealer-near-me', S(named(dlr, 'DealerNearMe'))],
  ['/used-car-dealer-near-me', S(named(dlr, 'DealerNearMe', { used: true }))],
  ['/careers', S(named(dlr, 'Careers'))],
  ['/directions', S(named(dlr, 'Directions'))],
  ['/contact', S(named(dlr, 'Contact'))],
  ['/privacy', S(named(dlr, 'Privacy'))],
  ['/accessibility', S(named(dlr, 'Accessibility'))],
  ['/sitemap', S(named(dlr, 'SiteMap'))],
  ['/my-profile', S(named(misc, 'MyProfile'))],
  ['/compare', S(named(misc, 'Compare'))],
  ['/search', S(named(misc, 'Search'))],
]

/** Load the page code for a URL (and every page when called with no URL). */
export function preloadRoutes(pathname) {
  const list = pathname ? (matchRoutes(routeObjects, pathname) || []).map((m) => m.route.element) : ROUTES.map(([, el]) => el)
  return Promise.all(list.filter((el) => el?.props?.children?.type?.preload).map((el) => preloadOf(el)()))
}

export const routeObjects = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [{ index: true, element: <Home /> }, ...ROUTES.map(([path, element]) => ({ path, element })), { path: '*', element: <NotFound /> }],
  },
]
