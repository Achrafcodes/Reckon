/**
 * Merchant Category Code (MCC) → Reckon category name mapping.
 *
 * Source: Citi "Merchant Category Codes" reference (Treasury and Trade
 * Solutions, 2015). Some bank/card exports include an MCC or "Category Code"
 * column alongside the transaction — when present, it's a far more reliable
 * signal than keyword-guessing the merchant name, so the importer checks it
 * first (see categorization/index.ts).
 *
 * Strategy: broad range defaults matching the PDF's own section boundaries,
 * with explicit overrides for codes that would be miscategorized by their
 * section's default (e.g. 5411 Grocery Stores sits inside the 5000–5599
 * "Retail Outlet Services" range but clearly belongs in Groceries, not
 * generic Shopping).
 */

interface MccRange {
  from: number
  to: number
  category: string
}

// Ordered broadly, low to high — matches the PDF's chapter boundaries
const RANGE_DEFAULTS: MccRange[] = [
  { from: 1, to: 2999, category: 'Other' }, // Agricultural / Contracted Services
  { from: 3000, to: 3999, category: 'Travel' }, // Airlines, Car Rental, Lodging
  { from: 4000, to: 4799, category: 'Transport' },
  { from: 4800, to: 4999, category: 'Bills & Utilities' },
  { from: 5000, to: 5699, category: 'Shopping' }, // Retail Outlet + Clothing Stores
  { from: 5700, to: 5799, category: 'Shopping' }, // Furniture / electronics / software stores
  { from: 5800, to: 5899, category: 'Restaurants & Cafés' }, // Caterers, eating places, bars, fast food
  { from: 5900, to: 5999, category: 'Shopping' }, // Specialty retail
  { from: 6000, to: 6099, category: 'Transfers' }, // Member financial institution cash
  { from: 6100, to: 6299, category: 'Other' },
  { from: 6300, to: 6399, category: 'Bills & Utilities' }, // Insurance
  { from: 6500, to: 6599, category: 'Bills & Utilities' }, // Real estate rentals
  { from: 6600, to: 6999, category: 'Transfers' },
  { from: 7000, to: 7099, category: 'Travel' }, // Lodging, timeshares, camps, campgrounds
  { from: 7200, to: 7299, category: 'Bills & Utilities' }, // Cleaning / garment / laundry services
  { from: 7300, to: 7511, category: 'Other' }, // Business services
  { from: 7512, to: 7549, category: 'Transport' }, // Auto rental, parking, towing
  { from: 7600, to: 7699, category: 'Other' }, // Repair shops
  { from: 7800, to: 7999, category: 'Entertainment & Gaming' }, // Lottery, casinos, cinemas, bowling, arcades
  { from: 8000, to: 8099, category: 'Healthcare' },
  { from: 8100, to: 8199, category: 'Other' }, // Legal services
  { from: 8200, to: 8299, category: 'Education' },
  { from: 8300, to: 8999, category: 'Other' }, // Membership orgs, professional services
  { from: 9000, to: 9999, category: 'Other' }, // Government services (see overrides below)
]

// Explicit overrides — code → category, where the range default is wrong
const MCC_OVERRIDES: Record<string, string> = {
  // Transportation Services
  '4111': 'Transport', '4112': 'Transport', '4119': 'Healthcare', // Ambulance
  '4121': 'Transport', '4131': 'Transport', '4784': 'Transport', '4789': 'Transport',
  '4411': 'Travel', '4457': 'Travel', '4511': 'Travel', '4582': 'Travel',
  '4722': 'Travel', '4723': 'Travel',
  // Utility Services
  '4816': 'Subscriptions', // Computer Network/Information Services
  '4829': 'Transfers', // Wire Transfer Money Orders
  // Retail Outlet Services
  '5013': 'Transport', '5172': 'Transport', '5299': 'Transport', '5541': 'Transport',
  '5542': 'Transport', '5532': 'Transport', '5533': 'Transport', '5571': 'Transport',
  '5511': 'Transport', '5521': 'Transport',
  '5047': 'Healthcare', '5122': 'Healthcare',
  '5192': 'Education',
  '5300': 'Groceries', '5411': 'Groceries', '5422': 'Groceries', '5441': 'Groceries',
  '5451': 'Groceries', '5462': 'Groceries', '5499': 'Groceries',
  // Miscellaneous Stores
  '5811': 'Restaurants & Cafés', '5812': 'Restaurants & Cafés', '5813': 'Restaurants & Cafés',
  '5814': 'Restaurants & Cafés',
  '5815': 'Subscriptions', '5817': 'Subscriptions', '5818': 'Subscriptions',
  '5816': 'Entertainment & Gaming', // Digital Goods: Games
  '5912': 'Healthcare', '5975': 'Healthcare', '5976': 'Healthcare',
  '5942': 'Education', '5943': 'Education',
  '5960': 'Bills & Utilities', // Direct Marketing Insurance
  '5962': 'Travel', // Direct Marketing Travel
  '5968': 'Subscriptions', // Direct Marketing Continuity/Subscription
  '5983': 'Bills & Utilities', // Fuel dealers (coal/oil/wood)
  // Financial / Government
  '6211': 'Other', '6300': 'Bills & Utilities', '6381': 'Bills & Utilities',
  '6513': 'Bills & Utilities', // Real Estate Agents–Rentals
  '7011': 'Travel', '7012': 'Travel', '7032': 'Travel', '7033': 'Travel',
  '7210': 'Bills & Utilities', '7211': 'Bills & Utilities', '7216': 'Bills & Utilities',
  '7273': 'Other', '7276': 'Other',
  '7295': 'Other', // Babysitting
  '7297': 'Fitness', '7298': 'Fitness', // Massage parlors, spas
  '7841': 'Entertainment & Gaming', // DVD/Video rental
  '7911': 'Entertainment & Gaming', '7922': 'Entertainment & Gaming', '7929': 'Entertainment & Gaming',
  '7991': 'Travel', '7992': 'Fitness', // Public golf courses
  '7997': 'Fitness', '7998': 'Entertainment & Gaming',
  '8011': 'Healthcare', '8021': 'Healthcare', '8031': 'Healthcare', '8041': 'Healthcare',
  '8042': 'Healthcare', '8043': 'Healthcare', '8049': 'Healthcare', '8050': 'Healthcare',
  '8062': 'Healthcare', '8071': 'Healthcare', '8099': 'Healthcare',
  '8211': 'Education', '8220': 'Education', '8241': 'Education', '8244': 'Education',
  '8249': 'Education', '8299': 'Education', '8351': 'Education', // Child Care
  '9211': 'Other', '9222': 'Loans & Fees', '9223': 'Other',
  '9311': 'Bills & Utilities', // Tax Payments
  '9751': 'Groceries', // UK Supermarkets hotfile
  '9752': 'Transport', // UK Petrol Stations hotfile
  '9754': 'Entertainment & Gaming', // Gambling–Horse/Dog/Lottery
}

/**
 * Resolve an MCC (3–4 digit numeric string, zero-padded or not) to a Reckon
 * category name. Returns null for codes outside any known range.
 */
export function categoryForMcc(mccRaw: string | number): string | null {
  const code = String(mccRaw).trim().replace(/^0+(?=\d)/, '')
  if (!/^\d{1,4}$/.test(code)) return null

  if (MCC_OVERRIDES[code]) return MCC_OVERRIDES[code]

  const n = Number(code)
  const range = RANGE_DEFAULTS.find((r) => n >= r.from && n <= r.to)
  return range?.category ?? null
}
