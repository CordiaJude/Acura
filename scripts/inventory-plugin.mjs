// Vite plugin that turns src/data/inventory.json into code-split modules:
//   virtual:inventory          -> slim index of every vehicle (for listings, home, search)
//   virtual:vehicle/<stock>    -> the full record for one vehicle (loaded by the detail page)
// The 2.3 MB source file never ships as a single chunk, so listing pages stay fast.
import fs from 'node:fs'
import path from 'node:path'

const INDEX_ID = 'virtual:inventory'
const VEHICLE_PREFIX = 'virtual:vehicle/'
const CARD_PHOTOS = 5

export function slimVehicle(v) {
  return {
    stock: v.stock,
    vin: v.vin,
    title: v.title,
    condition: v.condition,
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim,
    body: v.body,
    fuel: v.fuel,
    price: v.price,
    msrp: v.msrp,
    exterior: v.colors?.exterior ?? null,
    interior: v.colors?.interior ?? null,
    drivetrain: v.drivetrain,
    transmission: v.transmission,
    engine: v.engine,
    mpg: v.mpg,
    mileage: v.mileage,
    keyFeatures: v.keyFeatures || [],
    photos: (v.photos || []).slice(0, CARD_PHOTOS),
    photoCount: (v.photos || []).length,
    stockPhotos: !!v.stockPhotos,
    dateInStock: v.dateInStock,
    offers: (v.priceBreakdown || []).filter((b) => b.kind === 'conditional_offer').map((b) => [b.label, b.amount]),
  }
}

export function inventoryPlugin() {
  const file = path.resolve(process.cwd(), 'src/data/inventory.json')
  let cache = null
  const load = () => {
    if (!cache) cache = JSON.parse(fs.readFileSync(file, 'utf8'))
    return cache
  }
  return {
    name: 'jba-inventory',
    resolveId(id) {
      if (id === INDEX_ID || id.startsWith(VEHICLE_PREFIX)) return '\0' + id
    },
    load(id) {
      if (!id.startsWith('\0virtual:')) return
      this.addWatchFile(file)
      const data = load()
      if (id === '\0' + INDEX_ID) {
        const meta = { dealer: data.dealer, site: data.site, captured: data.captured, count: data.count }
        const loaders = data.vehicles
          .map((v) => `  ${JSON.stringify(v.stock)}: () => import(${JSON.stringify(VEHICLE_PREFIX + v.stock)})`)
          .join(',\n')
        return [
          `export const meta = ${JSON.stringify(meta)};`,
          // JSON.parse on a string literal parses faster than an equivalent object literal.
          `export const vehicles = JSON.parse(${JSON.stringify(JSON.stringify(data.vehicles.map(slimVehicle)))});`,
          `export const loaders = {\n${loaders}\n};`,
        ].join('\n')
      }
      const stock = id.slice(('\0' + VEHICLE_PREFIX).length)
      const v = data.vehicles.find((x) => x.stock === stock)
      return `export default ${JSON.stringify(v || null)};`
    },
    handleHotUpdate(ctx) {
      if (ctx.file === file) cache = null
    },
  }
}
