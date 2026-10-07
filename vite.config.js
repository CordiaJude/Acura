import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { inventoryPlugin } from './scripts/inventory-plugin.mjs'

// `vite preview`: serve prerendered dist/<route>/index.html for /<route> (no trailing slash),
// the same way static hosts do, instead of falling back to the homepage HTML.
const prerenderedRoutes = () => ({
  name: 'jba-prerendered-routes',
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      const [pathname, query = ''] = req.url.split('?')
      if (pathname !== '/' && !path.extname(pathname)) {
        const file = path.join('dist', decodeURIComponent(pathname), 'index.html')
        if (fs.existsSync(file)) req.url = pathname.replace(/\/$/, '') + '/index.html' + (query ? '?' + query : '')
      }
      next()
    })
  },
})

export default defineConfig({
  plugins: [react(), inventoryPlugin(), prerenderedRoutes()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 700,
  },
})
