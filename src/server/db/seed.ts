// 'server-only' is a Next.js stub — not available when running seed directly via tsx
import { connectDB } from './connect'
import { Category } from './models'

const SYSTEM_CATEGORIES = [
  {
    name: 'Groceries',
    type: 'expense',
    color: '#16a34a',
    icon: 'shopping-cart',
    keywords: [
      // Canada / Quebec
      'iga', 'metro', 'loblaws', 'provigo', 'maxi', 'sobeys', 'superstore', 'costco',
      'whole foods', 'wholefood', 'fresh co', 'freshco', 'foodbasics', 'food basics',
      'walmart', 'walmart delivery', 'super c', 'suprc',
      'depanneur', 'dépanneur', 'dep ', 'epicerie', 'épicerie',
      // Generic
      'supermarket', 'grocery', 'marché', 'marche', 'alimentation',
      // Morocco / France
      'carrefour', 'marjane', 'label vie', 'bim', 'lidl', 'aldi', 'casino', 'monoprix',
    ],
  },
  {
    name: 'Food Delivery',
    type: 'expense',
    color: '#f97316',
    icon: 'pizza',
    keywords: [
      'doordash', 'dd/doordash', 'ubereats', 'uber eats', 'skip the dishes', 'skipthedishes',
      'grubhub', 'foodora', 'ritual', 'deliveroo',
    ],
  },
  {
    name: 'Restaurants & Cafés',
    type: 'expense',
    color: '#f59e0b',
    icon: 'utensils',
    keywords: [
      'mcdonalds', 'mcdonald', 'kfc', 'burger king', 'subway', 'tim hortons', 'timhorton',
      'starbucks', 'second cup', 'van houtte', 'dominos', 'pizza hut', 'little caesars',
      'poulet royal', 'b12burger', 'restaurant', 'brasserie', 'bistro', 'café', 'cafe',
      'sushi', 'ramen', 'poutine', 'fast food', 'fastfood',
    ],
  },
  {
    name: 'Shopping',
    type: 'expense',
    color: '#8b5cf6',
    icon: 'bag',
    keywords: [
      'amazon', 'amazon.ca', 'amazon.com', 'klarna', 'decathlon', 'sport chek', 'sportchek',
      'zara', 'h&m', 'simons', 'reitmans', 'garage', 'dynamite', 'ardene', 'winners',
      'dollarama', 'best buy', 'bestbuy', 'ikea', 'structube', 'ali express', 'aliexpress',
      'shein', 'clothing', 'shoes', 'vêtements', 'vetements',
      // Morocco
      'jumia', 'mall',
    ],
  },
  {
    name: 'Transport',
    type: 'expense',
    color: '#0ea5e9',
    icon: 'car',
    keywords: [
      // Ride & transit
      'ubertrip', 'uber canada/ubertrip', 'uber holdings', 'taxi', 'lyft',
      'stm', 'bixi', 'exo', 'presto', 'via rail', 'viarail', 'amtrak',
      'bus ', 'train', 'metro', 'tramway', 'rtc ',
      // Fuel & parking
      'esso', 'petro canada', 'petrocanada', 'shell', 'ultramar', 'couche-tard', 'couche tard',
      'fuel', 'petrol', 'essence', 'parking', 'stationnement', 'toll', 'peage', 'péage',
      // Morocco
      'careem',
    ],
  },
  {
    name: 'Bills & Utilities',
    type: 'expense',
    color: '#ef4444',
    icon: 'lightning',
    keywords: [
      // Quebec / Canada
      'hydro-quebec', 'hydro quebec', 'hydroquebec', 'hydro one', 'hydro ',
      'videotron', 'vidéotron', 'bell ', 'bell mobility', 'rogers', 'telus', 'fido',
      'fizz', 'koodo', 'public mobile', 'virgin mobile', 'freedom mobile',
      'gaz metro', 'énergir', 'energir', 'enbridge',
      'coinamatic', 'laundry',
      // Generic
      'electricity', 'water', 'internet', 'loyer', 'rent', 'hydro',
      // Morocco
      'maroc telecom', 'inwi', 'orange', 'amendis', 'redal', 'lydec',
    ],
  },
  {
    name: 'Subscriptions',
    type: 'expense',
    color: '#ec4899',
    icon: 'refresh-cw',
    keywords: [
      'netflix', 'spotify', 'disney', 'apple tv', 'apple.com/bill', 'apple.com',
      'youtube premium', 'twitch', 'hbo', 'crave', 'tubi',
      'claude.ai', 'openai', 'chatgpt', 'microsoft 365', 'microsoft365',
      'adobe', 'dropbox', 'google one', 'icloud', 'nordvpn', 'expressvpn',
      'notion', 'figma', 'github', 'jetbrains',
      'walmart delivery pass', 'walmart delivery',
    ],
  },
  {
    name: 'Entertainment & Gaming',
    type: 'expense',
    color: '#a855f7',
    icon: 'film',
    keywords: [
      'steam', 'xbox', 'playstation', 'psn', 'nintendo', 'riot', 'riot*',
      'epic games', 'blizzard', 'ea ', 'ubisoft', 'gaming', 'jeu', 'jeux',
      'cinema', 'cinéma', 'cineplex', 'theatre', 'théâtre',
    ],
  },
  {
    name: 'Healthcare',
    type: 'expense',
    color: '#14b8a6',
    icon: 'heart',
    keywords: [
      'pharmaprix', 'jean coutu', 'uniprix', 'proxim', 'shoppers drug mart', 'shoppers',
      'pharmacy', 'pharmacie', 'pharmacien', 'clinique', 'clinic',
      'doctor', 'medecin', 'médecin', 'hospital', 'hôpital', 'dentist', 'dentiste',
      'optique', 'optical', 'visuelle',
    ],
  },
  {
    name: 'Fitness',
    type: 'expense',
    color: '#06b6d4',
    icon: 'activity',
    keywords: [
      'm fitness', 'goodlife', 'anytime fitness', 'planet fitness', 'ymca', 'nautilus plus',
      'éconofitness', 'econofitness', 'altitude gym', 'crossfit', 'gym', 'fitness',
      'yoga', 'pilates', 'sport', 'académie de conduite', 'academie de conduite',
      'decathlon', // shared with shopping but fitness context wins if listed here first
    ],
  },
  {
    name: 'Education',
    type: 'expense',
    color: '#0284c7',
    icon: 'book',
    keywords: [
      'school', 'ecole', 'école', 'university', 'université', 'college', 'cegep', 'cégep',
      'tuition', 'frais scolaires', 'udemy', 'coursera', 'skillshare', 'duolingo',
      'books', 'livres', 'indigo', 'renaud-bray',
      'cs henri-bour', 'c.s. henri', // commission scolaire from the sample
    ],
  },
  {
    name: 'Travel',
    type: 'expense',
    color: '#d97706',
    icon: 'plane',
    keywords: [
      'airline', 'air canada', 'aircanada', 'westjet', 'sunwing', 'transat',
      'hotel', 'booking', 'airbnb', 'expedia', 'trivago', 'kayak',
      'airport', 'aéroport', 'aeroporto', 'ryanair', 'royal air maroc', 'ram',
    ],
  },
  {
    name: 'Salary & Income',
    type: 'income',
    color: '#22c55e',
    icon: 'banknote',
    keywords: [
      'salary', 'salaire', 'payroll', 'wage', 'paie',
      'mi-gso', 'pcubed', 'pcube', 'pay ', 'direct deposit', 'dépôt direct', 'depot direct',
      'gouv. quebec', 'gouv quebec', 'gouvernement', 'government', 'revenu',
    ],
  },
  {
    name: 'Government & Benefits',
    type: 'income',
    color: '#84cc16',
    icon: 'landmark',
    keywords: [
      'gouv. quebec', 'gouv quebec', 'stc', 'msp', 'retraite quebec', 'rqap',
      'assurance emploi', 'ei benefit', 'cra', 'agence revenu', 'tax refund',
      'allocation', 'prestations',
    ],
  },
  {
    name: 'Transfers',
    type: 'transfer',
    color: '#6366f1',
    icon: 'arrow-left-right',
    keywords: [
      'send e-tfr', 'e-transfer', 'etransfer', 'interac',
      'td visa', 'visa payment', 'credit card payment', 'payment - thank you',
      'rbc payplan', 'loan payment', 'remboursement',
      'savings', 'épargne', 'epargne',
    ],
  },
  {
    name: 'Loans & Credit',
    type: 'expense',
    color: '#dc2626',
    icon: 'credit-card',
    keywords: [
      'loan', 'interest charge', 'intérêt', 'interet', 'monthly account fee',
      'service fee', 'frais de service', 'frais bancaires',
      'rbc payplan pro loan', 'credit line', 'ligne de crédit',
    ],
  },
  {
    name: 'Other',
    type: 'expense',
    color: '#64748b',
    icon: 'tag',
    keywords: [],
  },
] as const

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('[seed] Refusing to run in production. Set NODE_ENV=development to proceed.')
    process.exit(1)
  }

  await connectDB()
  console.log('🌱 Seeding system categories...')

  for (const cat of SYSTEM_CATEGORIES) {
    await Category.updateOne(
      { name: cat.name, user: null, isSystem: true },
      { $set: { ...cat, user: null, isSystem: true } },
      { upsert: true },
    )
  }

  console.log(`✅ Seeded ${SYSTEM_CATEGORIES.length} system categories.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
