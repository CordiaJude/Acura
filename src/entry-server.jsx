// Build-time prerender entry (see scripts/prerender.mjs). Not shipped to the browser.
import { StrictMode } from 'react'
import { prerenderToNodeStream } from 'react-dom/static'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom'
import { preloadRoutes, routeObjects, ROUTES } from './routes.jsx'
import { GarageProvider } from './lib/garage.jsx'
import { loadVehicle, vehicles } from './lib/inventory.js'
import { POSTS } from './data/site.js'

export function paths() {
  return [
    '/',
    ...ROUTES.map(([p]) => p).filter((p) => !p.includes(':')),
    ...POSTS.map((p) => `/blog/${p.slug}`),
    ...vehicles.map((v) => `/inventory/${v.stock}`),
  ]
}

export async function render(url) {
  const m = url.match(/^\/inventory\/([^/]+)$/)
  if (m) await loadVehicle(m[1])
  await preloadRoutes()
  globalThis.__ssrTitle = undefined
  const handler = createStaticHandler(routeObjects)
  const context = await handler.query(new Request('http://localhost' + url))
  const router = createStaticRouter(handler.dataRoutes, context)
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <GarageProvider>
        <StaticRouterProvider router={router} context={context} hydrate={false} />
      </GarageProvider>
    </StrictMode>,
    // Never outline large Suspense boundaries into deferred segments; emit plain HTML.
    { progressiveChunkSize: Number.POSITIVE_INFINITY },
  )
  let html = ''
  for await (const chunk of prelude) html += chunk
  return { html, title: globalThis.__ssrTitle }
}
