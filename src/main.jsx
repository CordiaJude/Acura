import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { preloadRoutes, routeObjects } from './routes.jsx'
import { GarageProvider } from './lib/garage.jsx'
import { loadVehicle } from './lib/inventory.js'
import './styles/global.css'
import './styles/layout.css'
import './styles/pages.css'

async function start() {
  const container = document.getElementById('root')
  // Vehicle pages are prerendered with their full record; load it before hydrating so markup matches.
  const m = location.pathname.match(/^\/inventory\/([^/]+)\/?$/)
  // Page code is loaded first too, so hydration never meets a Suspense fallback.
  await Promise.all([m && loadVehicle(decodeURIComponent(m[1])), preloadRoutes(location.pathname)])
  const router = createBrowserRouter(routeObjects)
  const app = (
    <StrictMode>
      <GarageProvider>
        <RouterProvider router={router} />
      </GarageProvider>
    </StrictMode>
  )
  // Hydrate only when the HTML was prerendered for exactly this URL (no query string; a host
  // may also fall back to another page's HTML). Otherwise render fresh.
  const path = location.pathname.replace(/(.)\/$/, '$1')
  if (container.dataset.prerendered === path && !location.search) hydrateRoot(container, app)
  else {
    container.textContent = ''
    createRoot(container).render(app)
  }
}
start()
