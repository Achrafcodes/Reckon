// 'server-only' is a Next.js stub — not available when running seed directly via tsx
import { connectDB } from './connect'
import { Category } from './models'

// Bank transaction codes that appear as suffixes (e.g. "BELL MOBILITY BPY")
// These are included as keywords so the categorizer can match on them
const SYSTEM_CATEGORIES = [
  {
    name: 'Groceries',
    type: 'expense',
    color: '#16a34a',
    icon: 'shopping-cart',
    keywords: [
      // Universal terms
      'supermarket', 'grocery', 'groceries', 'superstore', 'hypermarket',
      'market', 'marché', 'marche', 'alimentation', 'épicerie', 'epicerie',
      'depanneur', 'dépanneur', 'convenience store',
      // Global chains (alphabetical)
      'aldi', 'asda', 'bim', 'carrefour', 'casino', 'co-op', 'costco',
      'coop', 'edeka', 'esselunga', 'freshco', 'fresh co', 'food basics',
      'foodbasics', 'giant', 'globus', 'h-e-b', 'heb', 'hy-vee',
      'iga ', 'kroger', 'label vie', 'ldi', 'ldl', 'lidl', 'loblaws',
      'marjane', 'maxi ', 'meijer', 'migros', 'monoprix', 'netto',
      'picard', 'provigo', 'publix', 'rewe', 'safeway', 'sainsbury',
      'schnucks', 'spar', 'super c', 'suprc', 'target', 'tesco',
      'trader joe', 'walmart', 'wegmans', 'whole food', 'wholefood',
      'winn dixie', 'woolworth', 'zehrs',
    ],
  },
  {
    name: 'Food Delivery',
    type: 'expense',
    color: '#f97316',
    icon: 'truck',
    keywords: [
      // App prefixes banks truncate to
      'doordash', 'dd/doordash',
      'ubereats', 'uber eats', 'uber canada/ubereats', 'uber holdings canada',
      'skipthedishes', 'skip the dishes', 'skip*',
      'grubhub', 'foodora', 'ritual', 'deliveroo',
      'glovo', 'rappi', 'wolt', 'bolt food',
      'just eat', 'justeat', 'lieferando',
      'menulog', 'postmates', 'seamless',
    ],
  },
  {
    name: 'Restaurants & Cafés',
    type: 'expense',
    color: '#f59e0b',
    icon: 'utensils',
    keywords: [
      // Universal descriptors
      'restaurant', 'cafe', 'café', 'brasserie', 'bistro', 'diner',
      'ristorante', 'pizzeria', 'trattoria', 'tavern', 'pub ',
      // Global fast food & coffee chains
      'mcdonalds', 'mcdonald', 'burger king', 'burgerking',
      'kfc', 'popeyes', 'chick-fil', 'wendys', "wendy's",
      'subway', 'quiznos', 'jersey mike',
      'dominos', 'pizza hut', 'little caesar', 'papa john',
      'starbucks', 'tim horton', 'dunkin', 'costa coffee', 'pret a manger',
      'second cup', 'van houtte', 'lavazza', 'nespresso',
      'chipotle', 'taco bell', 'tacobell', 'five guys', 'fiveguys',
      'nando', 'wagamama', 'pho', 'sushi',
      // Other common
      'poulet royal', 'b12burger', 'ramen', 'boba', 'bubble tea',
    ],
  },
  {
    name: 'Shopping',
    type: 'expense',
    color: '#8b5cf6',
    icon: 'bag',
    keywords: [
      // Universal
      'clothing', 'clothes', 'apparel', 'fashion', 'shoes', 'footwear',
      'boutique', 'vêtements', 'vetements', 'mode',
      // Global e-commerce
      'amazon', 'aliexpress', 'ali express', 'ebay', 'etsy', 'wish ',
      'shein', 'temu', 'asos', 'zalando',
      // Global retail
      'ikea', 'h&m', 'zara', 'uniqlo', 'primark', 'gap ', 'old navy',
      'forever 21', 'forever21', 'urban outfitters', 'anthropologie',
      'marks & spencer', 'm&s', 'next ', 'tk maxx', 'tjmaxx',
      'decathlon', 'sport chek', 'sportchek', 'foot locker', 'footlocker',
      'nike', 'adidas', 'puma', 'new balance',
      'best buy', 'bestbuy', 'media markt', 'fnac ', 'darty',
      // Buy now pay later (always shopping)
      'klarna', 'afterpay', 'sezzle', 'zip pay', 'laybuy',
      // Dept stores
      'walmart supercenter', 'target', 'costco', 'sears', 'jcpenney',
      'macys', "macy's", 'nordstrom', 'bloomingdale',
      // Local patterns
      'dollarama', 'dollar tree', 'dollar general', 'winners', 'simons',
      'reitmans', 'dynamite', 'garage ', 'ardene',
    ],
  },
  {
    name: 'Transport',
    type: 'expense',
    color: '#0ea5e9',
    icon: 'car',
    keywords: [
      // Ride-hailing (global)
      'uber', 'ubertrip', 'lyft', 'bolt ', 'free now',
      'grab', 'gojek', 'didi', 'ola ', 'careem', 'indriver',
      'taxi', 'cab ', 'vtc ',
      // Public transit (generic + major networks)
      'transit', 'transpo', 'public transport',
      'stm ', 'bixi', 'exo ', 'presto', 'via rail', 'viarail',
      'tfl ', 'oyster', 'national rail', 'eurostar', 'thalys',
      'sncf', 'ratp', 'metro ', 'rer ', 'tramway', 'tram ',
      'bus ', 'autobus', 'greyhound', 'flixbus', 'megabus',
      'amtrak', 'rtc ', 'stl ', 'sts ', 'strsm',
      // Micromobility
      'bixi', 'lime ', 'bird ', 'voi ', 'tier ', 'jump ',
      // Parking & toll
      'parking', 'stationnement', 'parkeon', 'parkmobile',
      'toll', 'peage', 'péage', 'autoroute', 'highway',
      // Fuel
      'esso', 'petro canada', 'petrocanada', 'shell', 'ultramar',
      'bp ', 'total ', 'totalenergies', 'q8', 'couche-tard',
      'fuel', 'petrol', 'gasoline', 'essence', 'gas station',
    ],
  },
  {
    name: 'Bills & Utilities',
    type: 'expense',
    color: '#ef4444',
    icon: 'zap',
    keywords: [
      // Universal — also catches "BPY" suffix = bill payment via pattern in categorizer
      'electricity', 'electric', 'power bill', 'energy bill',
      'water bill', 'gas bill', 'utility', 'utilities',
      'internet', 'broadband', 'fibre', 'cable ',
      'phone bill', 'mobile bill', 'cell bill', 'wireless',
      'rent', 'loyer', 'lease', 'mortgage',
      'insurance', 'assurance', 'home insurance', 'auto insurance',
      // North America telecoms
      'bell ', 'bell mobility', 'rogers', 'telus', 'fido',
      'videotron', 'vidéotron', 'fizz ', 'koodo', 'public mobile',
      'virgin mobile', 'freedom mobile', 'chatr', 'lucky mobile',
      // North America energy
      'hydro-quebec', 'hydro quebec', 'hydroquebec', 'hydro-',
      'hydro one', 'bc hydro', 'hydro ottawa',
      'enbridge', 'gaz metro', 'énergir', 'energir',
      'union gas', 'atco gas', 'epcor', 'fortis',
      // Europe telecoms
      'orange', 'sfr ', 'bouygues', 'free mobile', 'sosh ',
      'vodafone', 'o2 ', 't-mobile', 'ee ', 'three ',
      'maroc telecom', 'inwi ', 'redal', 'amendis', 'lydec',
      'proximus', 'base ', 'telenet', 'swisscom',
      // Europe energy
      'edf ', 'engie', 'vattenfall', 'eon ', 'e.on',
      // Laundry (coinop machines in apartments)
      'coinamatic', 'coinamat', 'laundry', 'lessive',
      // Monthly fee catch-all
      'monthly account fee', 'account fee', 'frais mensuel',
      // RBC loan/plan payments
      'rbc payplan', 'payplan pro',
    ],
  },
  {
    name: 'Subscriptions',
    type: 'expense',
    color: '#ec4899',
    icon: 'refresh-cw',
    keywords: [
      // Streaming video
      'netflix', 'disney+', 'disney plus', 'hulu', 'hbo', 'hbomax', 'max ',
      'prime video', 'apple tv', 'peacock', 'paramount', 'crave', 'tubi',
      'youtube premium', 'dazn', 'canal+', 'canalplus',
      // Streaming music
      'spotify', 'apple music', 'tidal', 'deezer', 'amazon music',
      // Cloud & productivity
      'icloud', 'google one', 'dropbox', 'onedrive',
      'microsoft 365', 'microsoft365', 'office 365',
      'adobe', 'figma', 'notion', 'slack', 'zoom',
      'github', 'jetbrains', 'atlassian', 'asana', 'trello',
      // AI tools
      'claude.ai', 'openai', 'chatgpt', 'midjourney', 'runway',
      // Security / VPN
      'nordvpn', 'expressvpn', 'surfshark', '1password', 'lastpass',
      // Apple generic
      'apple.com/bill', 'apple.com',
      // Delivery passes
      'walmart delivery pass', 'instacart express', 'amazon prime',
    ],
  },
  {
    name: 'Entertainment & Gaming',
    type: 'expense',
    color: '#a855f7',
    icon: 'gamepad',
    keywords: [
      // Gaming platforms
      'steam', 'xbox', 'xbox game', 'playstation', 'psn',
      'nintendo', 'nintendo switch', 'eshop',
      'epic games', 'epicgames', 'blizzard', 'battle.net',
      'ea ', 'ea games', 'ubisoft', 'riot ', 'riot*',
      'roblox', 'minecraft', 'genshin', 'league of legends',
      // Cinemas
      'cinema', 'cinéma', 'cineplex', 'vue ', 'odeon ', 'cineworld',
      'pathé', 'pathe', 'amc ', 'regal ',
      // Events & culture
      'theatre', 'théâtre', 'concert', 'ticketmaster', 'eventbrite',
      'musée', 'musee', 'museum', 'gallery',
    ],
  },
  {
    name: 'Healthcare',
    type: 'expense',
    color: '#14b8a6',
    icon: 'heart',
    keywords: [
      // Universal
      'pharmacy', 'pharmacie', 'pharmacien', 'drugstore',
      'doctor', 'médecin', 'medecin', 'physician',
      'hospital', 'hôpital', 'hopital', 'clinic', 'clinique',
      'dentist', 'dentiste', 'dental', 'orthodont',
      'optician', 'optique', 'optical', 'vision',
      'physiotherapy', 'physio', 'chiropract', 'osteopath',
      'mental health', 'therapy', 'psycholog',
      'lab ', 'laboratory', 'labo ', 'diagnostics',
      'ambulance', 'urgence', 'emergency',
      // North America chains
      'pharmaprix', 'jean coutu', 'uniprix', 'proxim',
      'shoppers drug mart', 'rexall', 'london drugs',
      'cvs ', 'walgreens', 'rite aid', 'duane reade',
      // Europe chains
      'boots ', 'lloyds pharmacy',
    ],
  },
  {
    name: 'Fitness',
    type: 'expense',
    color: '#06b6d4',
    icon: 'activity',
    keywords: [
      // Universal
      'gym', 'fitness', 'sport club', 'sports club', 'athletic',
      'yoga', 'pilates', 'crossfit', 'spinning', 'zumba',
      'swimming pool', 'piscine', 'natation',
      'personal trainer', 'coach sportif',
      // Global chains
      'goodlife', 'planet fitness', 'anytime fitness',
      'ymca', 'ywca', 'la fitness', 'equinox', 'orange theory',
      'f45', 'barry', 'soulcycle',
      'nautilus plus', 'éconofitness', 'econofitness',
      'altitude gym', 'fit4less', 'curves',
      // Activities
      'martial arts', 'karate', 'boxing', 'judo', 'taekwondo',
      'rock climbing', 'bouldering', 'escalade',
      'driving school', 'académie de conduite', 'academie de conduite',
      'm fitness',
    ],
  },
  {
    name: 'Education',
    type: 'expense',
    color: '#0284c7',
    icon: 'book',
    keywords: [
      // Universal institution types
      'school', 'ecole', 'école', 'university', 'université',
      'college', 'cegep', 'cégep', 'polytechnic', 'institute',
      'academy', 'académie', 'formation', 'lycée', 'lycee',
      // Abbreviations common in bank statements
      'c.s.', 'cs ', // commission scolaire / school commission
      'tuition', 'frais scolaires', 'scolarité', 'scolarite',
      // Online learning
      'udemy', 'coursera', 'skillshare', 'duolingo', 'babbel',
      'linkedin learning', 'masterclass', 'pluralsight', 'datacamp',
      'khan academy', 'edx ', 'futurelearn',
      // Books & stationery
      'bookstore', 'librairie', 'livres', 'indigo', 'renaud-bray',
      'chapters', 'waterstones', 'fnac',
      'stationery', 'papeterie',
    ],
  },
  {
    name: 'Travel',
    type: 'expense',
    color: '#d97706',
    icon: 'plane',
    keywords: [
      // Booking platforms
      'booking.com', 'airbnb', 'expedia', 'trivago', 'kayak',
      'hotels.com', 'agoda', 'hostelworld', 'vrbo',
      // Airlines (major)
      'airline', 'air canada', 'aircanada', 'westjet', 'sunwing', 'transat',
      'air france', 'lufthansa', 'british airways', 'iberia', 'alitalia',
      'ryanair', 'easyjet', 'vueling', 'transavia', 'wizz air', 'wizzair',
      'emirate', 'qatar air', 'turkish air', 'royal air maroc', 'ram ',
      'delta', 'united', 'american air', 'southwest', 'jetblue',
      // Hotels
      'hotel', 'hôtel', 'marriott', 'hilton', 'hyatt', 'sheraton',
      'holiday inn', 'ibis ', 'novotel', 'accor', 'radisson',
      // Car rental
      'car rental', 'location voiture', 'hertz', 'avis ', 'budget rent',
      'enterprise', 'sixt ',
      // Airports
      'airport', 'aéroport', 'aeropuerto', 'flughafen',
    ],
  },
  {
    name: 'Salary & Income',
    type: 'income',
    color: '#22c55e',
    icon: 'banknote',
    keywords: [
      // Universal
      'salary', 'salaire', 'payroll', 'paie', 'wage', 'stipend',
      'direct deposit', 'dépôt direct', 'depot direct', 'virement salaire',
      'employment income', 'revenu emploi',
      // Bank codes for payroll deposits
      'pay ', ' pay',
      // Freelance / consulting
      'invoice payment', 'consulting', 'freelance', 'honoraires',
      'mi-gso', 'pcubed', 'pcube',
    ],
  },
  {
    name: 'Government & Benefits',
    type: 'income',
    color: '#84cc16',
    icon: 'landmark',
    keywords: [
      // Canada / Quebec
      'gouv. quebec', 'gouv quebec', 'gouvernement',
      'stc ', ' stc', 'msp ', ' msp',
      'retraite quebec', 'rqap', 'assurance emploi', 'ae benefit',
      'cra ', 'agence revenu', 'canada revenue',
      'canada child benefit', 'allocation famille',
      // France
      'caf ', 'pole emploi', 'pôle emploi', 'cpam', 'ameli',
      'revenu solidarite', 'rsa ', 'apl ',
      // Universal
      'tax refund', 'tax credit', 'remboursement impot',
      'social security', 'sécurité sociale', 'pension',
      'allocation', 'prestations', 'benefit',
      'government', 'government of', 'ministry',
    ],
  },
  {
    name: 'Transfers',
    type: 'transfer',
    color: '#6366f1',
    icon: 'arrow-left-right',
    keywords: [
      // Bank transfer keywords & codes
      'e-transfer', 'etransfer', 'e-tfr', 'send e-tfr', 'receive e-tfr',
      'interac', 'wire transfer', 'virement', 'transfert',
      'revolut', 'wise ', 'western union', 'moneygram', 'remittance',
      // Credit card payments (appear in bank statements)
      'td visa', 'rbc visa', 'bmo visa', 'scotiabank visa',
      'visa payment', 'credit card payment', 'mastercard payment',
      'payment - thank you', 'thank you payment',
      'remboursement', 'loan payment',
      // Savings
      'savings', 'épargne', 'epargne', 'tfsa', 'rrsp', 'fhsa',
    ],
  },
  {
    name: 'Loans & Fees',
    type: 'expense',
    color: '#dc2626',
    icon: 'credit-card',
    keywords: [
      // Interest & fees
      'interest charge', 'interest - purchase', 'intérêt', 'interet',
      'service fee', 'bank fee', 'frais de service', 'frais bancaires',
      'overdraft', 'découvert', 'decouvert',
      'nsf fee', 'returned item', 'late fee', 'frais retard',
      // Loans
      'loan', 'personal loan', 'auto loan', 'car loan',
      'credit line', 'ligne de crédit', 'ligne de credit',
      'rbc payplan pro loan',
      'mortgage', 'hypothèque', 'hypotheque',
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
