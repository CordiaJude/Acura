// Sanity-checks src/data/inventory.json after a refresh: required fields, kinds, photos.
import fs from 'node:fs'

const data = JSON.parse(fs.readFileSync(new URL('../src/data/inventory.json', import.meta.url), 'utf8'))
const required = ['stock', 'vin', 'title', 'condition', 'year', 'make', 'model', 'price', 'priceBreakdown', 'photos', 'specs']
const kinds = new Set(['base', 'fee', 'total', 'conditional_offer'])
const errors = []
const seen = new Set()
for (const v of data.vehicles) {
  for (const k of required) if (v[k] === undefined || v[k] === null) errors.push(`${v.stock}: missing ${k}`)
  if (seen.has(v.stock)) errors.push(`${v.stock}: duplicate stock`)
  seen.add(v.stock)
  if (!['new', 'certified', 'used'].includes(v.condition)) errors.push(`${v.stock}: bad condition ${v.condition}`)
  for (const b of v.priceBreakdown || []) if (!kinds.has(b.kind)) errors.push(`${v.stock}: bad price kind ${b.kind}`)
  if (!(v.priceBreakdown || []).some((b) => b.kind === 'total')) errors.push(`${v.stock}: no total line`)
  if (!v.photos?.length) errors.push(`${v.stock}: no photos`)
}
const by = (f) => data.vehicles.reduce((m, v) => ((m[f(v)] = (m[f(v)] || 0) + 1), m), {})
console.log(`captured ${data.captured}: ${data.vehicles.length} vehicles (count field says ${data.count})`)
console.log('by condition', by((v) => v.condition))
console.log('new by model', by((v) => (v.condition === 'new' ? v.model : '-')))
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log('OK')
