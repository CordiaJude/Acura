// Writes static HTML for every route into dist/ so pages paint before JavaScript runs.
// Run after `vite build` and `vite build --ssr` (npm run build does both).
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = path.resolve('dist')
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const { render, paths } = await import(pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href)
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

let n = 0
for (const url of paths()) {
  const { html, title } = await render(url)
  if (html.includes('<template id="B:')) throw new Error(`${url} still has a pending Suspense boundary`)
  let page = template.replace('<div id="root"></div>', `<div id="root" data-prerendered="${url}">${html}</div>`)
  if (title) page = page.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
  const file = url === '/' ? path.join(dist, 'index.html') : path.join(dist, url.slice(1), 'index.html')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, page)
  n++
}
// Static hosts can serve this for unknown URLs; the client router then shows the real 404 page.
fs.writeFileSync(path.join(dist, '404.html'), template)
fs.rmSync(path.resolve('dist-ssr'), { recursive: true, force: true })
console.log(`prerendered ${n} pages`)
