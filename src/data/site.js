// Static dealership content: contact info, navigation, offers, staff, coupons.
// Anything marked PLACEHOLDER must be confirmed before launch (see README).

export const DEALER = {
  name: 'Joe Bullard Acura',
  street: '1151 E I-65 Service Rd. S.',
  city: 'Mobile',
  state: 'AL',
  zip: '36606',
  address: '1151 E I-65 Service Rd. S., Mobile, AL 36606',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Joe+Bullard+Acura+1151+E+I-65+Service+Rd+S+Mobile+AL+36606',
  directionsUrl: (from = '') =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('Joe Bullard Acura, 1151 E I-65 Service Rd. S., Mobile, AL 36606')}${from ? `&origin=${encodeURIComponent(from)}` : ''}`,
  googleReviewsUrl: 'https://www.google.com/search?q=Joe+Bullard+Acura+reviews',
  googleWriteReviewUrl: 'https://www.google.com/search?q=Joe+Bullard+Acura+Mobile+AL#lrd=,3',
  yelpUrl: 'https://www.yelp.com/search?find_desc=Joe+Bullard+Acura&find_loc=Mobile%2C+AL',
  liveSite: 'https://www.joebullardacura.com',
  social: [
    { label: 'X (Twitter)', href: 'https://x.com/', icon: 'x' },
    { label: 'Facebook', href: 'https://www.facebook.com/', icon: 'facebook' },
    { label: 'YouTube', href: 'https://www.youtube.com/', icon: 'youtube' },
  ],
  serviceArea: 'Serving Mobile, Daphne, Fairhope, Pensacola, Gulfport, Biloxi and Orange Beach',
}

export const PHONES = {
  main: { label: 'Main', number: '251-237-9452' },
  sales: { label: 'Sales', number: '251-237-9447' },
  service: { label: 'Service', number: '251-237-9452' },
  parts: { label: 'Parts', number: '251-302-0763' },
}
export const tel = (n) => `tel:+1${String(n).replace(/\D/g, '').slice(-10)}`

export const HOURS = {
  sales: [
    ['Mon - Fri', '9:00 AM - 7:00 PM'],
    ['Sat', '9:00 AM - 6:00 PM'],
    ['Sun', 'Closed'],
  ],
  service: [
    ['Mon - Fri', '7:30 AM - 5:30 PM'],
    ['Sat', '8:00 AM - 4:00 PM'],
    ['Sun', 'Closed'],
  ],
}

// Main navigation. Every href is a real route in src/routes.jsx.
export const NAV = [
  {
    label: 'New',
    href: '/new-vehicles',
    items: [
      ['All New', '/new-vehicles'],
      ['MDX', '/new-vehicles/mdx'],
      ['Integra', '/new-vehicles/integra'],
      ['RDX', '/new-vehicles/rdx'],
      ['ADX', '/new-vehicles/adx'],
      ['TLX', '/new-vehicles/tlx'],
      ['New SUVs', '/new-vehicles/suvs'],
      ['New Vehicle Specials', '/new-vehicles/specials'],
      ['New Lease Specials', '/new-lease-specials'],
      ['Acura National Offers', '/acura-national-offers'],
      ['Reserve Your New Acura', '/reserve-your-new-acura'],
      ['Acura Info Center', '/acura-info-center'],
      ['Model Research', '/model-research'],
    ],
  },
  {
    label: 'Pre-Owned',
    href: '/used-vehicles',
    items: [
      ['All Used', '/used-vehicles'],
      ['Precision Certified Used', '/used-vehicles/precision-used'],
      ['Used Car Specials', '/used-vehicles/specials'],
      ['Used SUVs', '/used-vehicles/suvs'],
      ['Used Trucks', '/used-vehicles/trucks'],
      ['Used Under 20K', '/used-vehicles/under-20k'],
      ['Low Mileage Used Vehicles', '/used-vehicles/low-mileage'],
      ['Why Buy Acura Certified Pre-Owned', '/why-buy-acura-certified-pre-owned'],
    ],
  },
  { label: 'Sell/Trade', href: '/sell-to-us', items: [['Sell Your Car', '/sell-to-us']] },
  {
    label: 'Service & Parts',
    href: '/service',
    items: [
      ['Service Center', '/service'],
      ['Schedule Service', '/schedule-service'],
      ['Service Specials & Coupons', '/service-specials'],
      ['Service & Parts Buy Now Pay Later', '/service-parts-buy-now-pay-later'],
      ['Acura Accelerated Service', '/acura-accelerated-service'],
      ['Parts Department', '/parts'],
      ['Order Acura Parts', '/order-parts'],
      ['Order Tires', '/order-tires'],
      ['Collision Center', '/collision-center'],
      ['Recall Lookup', '/recall-lookup'],
    ],
  },
  {
    label: 'Specials',
    href: '/specials',
    items: [
      ['New Vehicle Specials', '/new-vehicles/specials'],
      ['New Lease Specials', '/new-lease-specials'],
      ['Used Car Specials', '/used-vehicles/specials'],
      ['Service Specials & Coupons', '/service-specials'],
      ['Acura National Offers', '/acura-national-offers'],
    ],
  },
  {
    label: 'Finance Center',
    href: '/finance',
    items: [
      ['Finance Department', '/finance'],
      ['Apply For Financing', '/apply-for-financing'],
      ['Value Your Trade', '/value-your-trade'],
      ['Car Payment Calculator', '/car-payment-calculator'],
      ['Acura Lease Return', '/acura-lease-return'],
      ['Turn in Your Honda Lease', '/turn-in-your-honda-lease'],
    ],
  },
  {
    label: 'Dealership',
    href: '/about-us',
    items: [
      ['About Us', '/about-us'],
      ['Meet Our Staff', '/staff'],
      ['Customer Testimonials', '/testimonials'],
      ['Acura Precision Team', '/acura-precision-team'],
      ['Joe Bullard Acura Blog', '/blog'],
      ['Leave Us A Review', '/leave-a-review'],
      ['Acura Dealer near Me', '/acura-dealer-near-me'],
      ['Used Car Dealer near Me', '/used-car-dealer-near-me'],
    ],
  },
]

export const FOOTER_COLUMNS = [
  {
    title: 'Inventory',
    links: [
      ['New Acuras For Sale Mobile', '/new-vehicles'],
      ['Used Cars For Sale Mobile', '/used-vehicles'],
      ['Certified Pre-Owned', '/used-vehicles/precision-used'],
      ['New Specials', '/new-vehicles/specials'],
      ['Used Specials', '/used-vehicles/specials'],
    ],
  },
  {
    title: 'Financing',
    links: [
      ['Get Approved', '/apply-for-financing'],
      ['Value Trade-In', '/value-your-trade'],
      ['Finance Center', '/finance'],
      ['Car Payment Calculator', '/car-payment-calculator'],
    ],
  },
  {
    title: 'Service & Parts',
    links: [
      ['Schedule Service', '/schedule-service'],
      ['Service Specials & Coupons', '/service-specials'],
      ['Order OEM Acura Parts in Mobile, AL', '/order-parts'],
      ['Acura Parts Specials & Coupons', '/service-specials#parts'],
    ],
  },
  {
    title: 'About',
    links: [
      ['Our Reviews', '/testimonials'],
      ['Directions', '/directions'],
      ['About Us', '/about-us'],
      ['Careers', '/careers'],
    ],
  },
]

// Shared offer copy so homepage hero, New Lease Specials and Specials hub always match.
const PH = '[PLACEHOLDER: confirm current offer]'
export const OFFERS = [
  {
    id: 'adx-lease',
    model: 'ADX',
    eyebrow: '2026 Acura ADX',
    headline: '$369/mo for 36 months',
    sub: 'Base lease · $3,399 due at signing',
    cta: ['Shop ADX', '/new-vehicles/adx'],
    stockPhotoOf: 'ADX',
    legal:
      `Closed-end lease for a 2026 Acura ADX base model through Acura Financial Services, on approved credit. $369 per month for 36 months, $3,399 due at signing (includes first month's payment; excludes tax, title, license, registration and dealer fees). Mileage allowance, acquisition fee, residual value and offer expiration: ${PH}. Not all buyers will qualify. See Joe Bullard Acura for complete details.`,
  },
  {
    id: 'mdx-lease',
    model: 'MDX',
    eyebrow: '2026 Acura MDX',
    headline: '$539/mo lease',
    sub: `Term and due at signing ${PH}`,
    cta: ['Shop MDX', '/new-vehicles/mdx'],
    stockPhotoOf: 'MDX',
    legal:
      `Closed-end lease for a 2026 Acura MDX through Acura Financial Services, on approved credit. $539 per month. Term, amount due at signing, mileage allowance, residual value and expiration: ${PH}. Excludes tax, title, license, registration and dealer fees. Not all buyers will qualify. See Joe Bullard Acura for complete details.`,
  },
  {
    id: 'integra-lease',
    model: 'Integra',
    eyebrow: '2026 Acura Integra',
    headline: '$329/mo for 36 months',
    sub: 'Lease · $3,099 due at signing',
    cta: ['Shop Integra', '/new-vehicles/integra'],
    stockPhotoOf: 'Integra',
    legal:
      `Closed-end lease for a 2026 Acura Integra through Acura Financial Services, on approved credit. $329 per month for 36 months, $3,099 due at signing (includes first month's payment; excludes tax, title, license, registration and dealer fees). Trim, mileage allowance, residual value and expiration: ${PH}. Not all buyers will qualify. See Joe Bullard Acura for complete details.`,
  },
  {
    id: 'cpo',
    eyebrow: 'Acura Precision Certified',
    headline: 'Certified pre-owned, inspected to Acura standards',
    sub: 'Multi-point inspection, warranty coverage and roadside assistance.',
    cta: ['Browse certified', '/used-vehicles/precision-used'],
    stockPhotoOf: 'certified',
    legal:
      'Acura Precision Certified coverage terms, inspection points and roadside assistance details are set by American Honda Motor Co., Inc. and may change. See dealer for the full Acura Precision Certified warranty and program details.',
  },
  {
    id: 'service',
    eyebrow: 'Service & Parts',
    headline: 'Acura-trained technicians. Genuine Acura parts.',
    sub: 'Book online in minutes or call Service at 251-237-9452.',
    cta: ['Schedule service', '/schedule-service'],
    stockPhotoOf: null,
    legal:
      'Service specials require a coupon presented at write-up and cannot be combined with other offers. Valid at Joe Bullard Acura only. See Service Specials & Coupons for terms and expiration dates.',
  },
]

export const FEATURED_LEASE = {
  title: '2026 MDX SH-AWD 10 Speed Automatic',
  label: 'Featured Special Lease',
  monthly: 469,
  months: 36,
  dueAtSigning: 4999,
  leaseEnd: 32715,
  disclaimer:
    'Closed-end lease offered through Acura Financial Services to well-qualified lessees on approved credit. $469 per month for 36 months; $4,999 due at lease signing (includes first month\'s payment; excludes tax, title, license, registration and dealer fees). Purchase option at lease end $32,715. Mileage allowance, excess-mileage charge, acquisition fee and offer expiration: [PLACEHOLDER: confirm current offer]. Lessee is responsible for maintenance, repairs and excess wear. Not all lessees will qualify. See Joe Bullard Acura for complete details.',
}

export const COUPON_EXPIRY = '10/31/2026'
export const COUPONS = [
  {
    title: 'Spend & Save',
    value: 'Up to $100 off',
    body: 'Spend $300, save $30. Spend $600, save $60. Spend $1,000 or more, save $100. Maximum discount $100.',
    tier: [['$300+', '$30'], ['$600+', '$60'], ['$1,000+', '$100']],
  },
  { title: 'Fall Road-Ready Special', value: '[PLACEHOLDER: copy exact amounts from live site]', body: 'Get ready for fall travel with a seasonal check of tires, brakes, battery and fluids.' },
  { title: "Don't Get Stranded", value: '[PLACEHOLDER: copy exact amounts from live site]', body: 'Battery test and replacement offer with a Genuine Acura battery.' },
  { title: 'Fresh Air for Fall', value: '[PLACEHOLDER: copy exact amounts from live site]', body: 'Cabin air filter replacement to keep allergens and dust out of the cabin.' },
  { title: 'Maintenance Minder Bonus', value: '[PLACEHOLDER: copy exact amounts from live site]', body: 'Savings on your next Maintenance Minder service (A, B and sub-codes) performed by Acura-trained technicians.' },
]

export const STAFF = [
  {
    dept: 'Management',
    people: [
      { name: 'Deven Le', title: 'General Manager', phone: '251-301-0507' },
      { name: 'Stuart Cheyette', title: 'Sales Manager', phone: '251-378-4361' },
      { name: 'Ginger Hamilton', title: 'Service Manager', phone: '(251) 378-4374' },
    ],
  },
  {
    dept: 'Sales',
    people: [
      { name: 'Patrick Norton', title: 'Senior Sales Consultant', phone: '(251) 378-4281' },
      { name: 'Larry Stewart', title: 'Acura Sales Consultant', phone: '(251) 478-7779', note: '[PLACEHOLDER: confirm - same as Ty Bullard]' },
      { name: 'John McBryde', title: 'Acura Sales Consultant', phone: '(251) 378-4297' },
      { name: 'Collin Ryan', title: 'Acura Sales Consultant', phone: '(251) 378-4351' },
      { name: 'Ignacio Salas', title: 'Acura Sales Consultant', phone: '251-237-9447', note: 'Habla Español' },
      { name: 'Isaac West', title: 'Sales Porter' },
    ],
  },
  { dept: 'Finance', people: [{ name: 'Clarence Mullins', title: 'Business Manager', phone: '(251) 378-4314' }] },
  {
    dept: 'Service',
    people: [
      { name: 'Haley Barnes', title: 'Service Advisor', phone: '251-378-4374' },
      { name: 'Lindsey Patterson', title: 'Service Advisor', phone: '251-301-0511' },
      { name: 'Aryn McGraw', title: 'Service Business Development Coordinator', phone: '251-237-9452' },
      { name: 'Julia Conklan', title: 'Service Business Development Coordinator', phone: '251-237-9452' },
      { name: 'Brittany Lett', title: 'Service Business Development Coordinator', phone: '251-237-9452' },
    ],
  },
  {
    dept: 'Parts',
    people: [
      { name: 'Will Chavers', title: 'Acura Parts Manager', phone: '(251) 378-4251' },
      { name: 'Juan Armstead', title: 'Parts Associate', phone: '(251) 378-4252' },
      { name: 'Andre Boykin', title: 'Parts Associate', phone: '251-378-4255' },
    ],
  },
  {
    dept: 'Technicians',
    people: [
      { name: 'DJ A', title: 'Shop Foreman' },
      { name: 'Aaron C', title: 'Technician' },
      { name: 'Duy B', title: 'Technician' },
      { name: 'Nic S', title: 'Technician' },
      { name: 'Tyler C', title: 'Technician' },
      { name: 'Daniel H', title: 'Technician' },
    ],
  },
  {
    dept: 'Bullard Leadership',
    people: [
      { name: 'Ty Bullard', title: 'Dealer Principal', phone: '(251) 478-7779' },
      { name: 'John Galanos', title: 'Chief Financial Officer', phone: '(251) 378-8088' },
      { name: 'Kevin Dean', title: 'Chief Development Officer', phone: '251-591-4018' },
    ],
  },
  {
    dept: 'Marketing',
    people: [
      { name: 'Casey Wright', title: 'Marketing Director', phone: '(251) 378-4360' },
      { name: 'Morgan Wilson', title: 'Marketing & Social Media Coordinator', phone: '251-544-7332' },
      { name: 'Zack Romero', title: 'Marketing & Social Media Coordinator', phone: '251-301-0880' },
    ],
  },
]

export const MODELS = [
  { model: 'MDX', tagline: 'Three-row luxury SUV', seats: '7', href: '/new-vehicles/mdx' },
  { model: 'ADX', tagline: 'Compact premium SUV', seats: '5', href: '/new-vehicles/adx' },
  { model: 'Integra', tagline: 'Premium sport compact', seats: '5', href: '/new-vehicles/integra' },
  { model: 'RDX', tagline: 'Sport SUV with SH-AWD', seats: '5', href: '/new-vehicles/rdx' },
  { model: 'TLX', tagline: 'Performance sport sedan', seats: '5', href: '/new-vehicles/tlx' },
]

// [PLACEHOLDER] blog posts until real articles are written.
export const POSTS = [
  { slug: 'mdx-vs-rdx', title: 'MDX vs. RDX: which Acura SUV fits your family?', date: '2026-09-15', excerpt: 'Three rows or two? We break down space, performance and features.' },
  { slug: 'maintenance-minder-codes', title: 'What your Acura Maintenance Minder codes mean', date: '2026-08-28', excerpt: 'A1, B12 and everything in between, explained in plain English.' },
  { slug: 'hurricane-season-car-prep', title: 'Hurricane season car prep for Gulf Coast drivers', date: '2026-07-10', excerpt: 'A simple checklist to keep your Acura ready when storms roll in.' },
]
