// Run: node scripts/seed-demo.mjs
// Seeds categories and 3 months of demo transactions for the first user found.

import mongoose from 'mongoose'
import crypto from 'crypto'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
// Parse .env.local manually — no dotenv dependency needed
const envFile = join(__dirname, '../.env.local')
for (const line of readFileSync(envFile, 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const uri = process.env.MONGODB_URI
if (!uri) { console.error('MONGODB_URI missing'); process.exit(1) }

await mongoose.connect(uri)
console.log('Connected to MongoDB')

// ── Schemas ─────────────────────────────────────────────────────────────────

const CategorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, default: null },
  name: String, type: String, color: String, icon: String,
  keywords: [String], isSystem: Boolean,
}, { timestamps: true })
CategorySchema.index({ user: 1, name: 1 }, { unique: true })

const TransactionSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  date: Date, description: String, merchant: String,
  amount: mongoose.Schema.Types.Decimal128,
  currency: String, type: String,
  category: mongoose.Schema.Types.ObjectId,
  source: String, dedupeHash: String,
}, { timestamps: true })
TransactionSchema.index({ user: 1, dedupeHash: 1 }, { unique: true, sparse: true })

const UserSchema = new mongoose.Schema({ name: String, email: String, passwordHash: String })

const Category = mongoose.models.Category ?? mongoose.model('Category', CategorySchema)
const Transaction = mongoose.models.Transaction ?? mongoose.model('Transaction', TransactionSchema)
const User = mongoose.models.User ?? mongoose.model('User', UserSchema)

// ── Find user ────────────────────────────────────────────────────────────────

const user = await User.findOne().lean()
if (!user) { console.error('No user found — register first at /register'); process.exit(1) }
const userId = user._id
console.log(`Seeding for user: ${user.email}`)

// ── Categories ───────────────────────────────────────────────────────────────

const categories = [
  { name: 'Salary',        type: 'income',   color: '#1b5e3e', icon: 'banknote',     keywords: ['salaire', 'salary', 'virement reçu', 'paie'] },
  { name: 'Freelance',     type: 'income',   color: '#2d7a56', icon: 'laptop',       keywords: ['freelance', 'prestation', 'honoraires'] },
  { name: 'Groceries',     type: 'expense',  color: '#0891b2', icon: 'shopping-cart',keywords: ['carrefour', 'marjane', 'lidl', 'supermarché', 'courses', 'hypermarché', 'bim', 'acima'] },
  { name: 'Restaurants',   type: 'expense',  color: '#d97706', icon: 'utensils',     keywords: ['restaurant', 'café', 'pizza', 'burger', 'mcdo', 'kfc', 'sushi', 'brasserie'] },
  { name: 'Transport',     type: 'expense',  color: '#7c3aed', icon: 'car',          keywords: ['taxi', 'essence', 'total', 'station', 'indriver', 'uber', 'train', 'oncf'] },
  { name: 'Housing',       type: 'expense',  color: '#be185d', icon: 'home',         keywords: ['loyer', 'rent', 'appartement'] },
  { name: 'Utilities',     type: 'expense',  color: '#0e7490', icon: 'zap',          keywords: ['électricité', 'one', 'eau', 'lydec', 'radeema', 'internet', 'telecom', 'inwi', 'maroc telecom'] },
  { name: 'Health',        type: 'expense',  color: '#dc2626', icon: 'heart',        keywords: ['pharmacie', 'médecin', 'docteur', 'dentiste', 'clinique', 'hôpital', 'labo'] },
  { name: 'Entertainment', type: 'expense',  color: '#ea580c', icon: 'play',         keywords: ['netflix', 'spotify', 'cinema', 'youtube', 'disney', 'prime'] },
  { name: 'Shopping',      type: 'expense',  color: '#9333ea', icon: 'bag',          keywords: ['amazon', 'zara', 'h&m', 'librairie', 'fnac', 'jumia'] },
  { name: 'Sport & Fitness', type: 'expense', color: '#16a34a', icon: 'dumbbell',   keywords: ['salle de sport', 'gym', 'fitness', 'coach', 'piscine'] },
  { name: 'Transfers',     type: 'transfer', color: '#64748b', icon: 'arrow-right',  keywords: ['virement', 'transfer', 'remboursement'] },
]

await Category.deleteMany({ isSystem: true, user: null })
const catDocs = await Category.insertMany(
  categories.map(c => ({ ...c, isSystem: true, user: null }))
)
console.log(`Inserted ${catDocs.length} categories`)

const catMap = Object.fromEntries(catDocs.map(c => [c.name, c._id]))

// ── Transaction factory ───────────────────────────────────────────────────────

function hash(userId, date, amount, merchant) {
  return crypto.createHash('sha256')
    .update(`${userId}|${date}|${amount}|${merchant.toLowerCase().trim()}`)
    .digest('hex')
}

function dec(n) { return mongoose.Types.Decimal128.fromString(Math.abs(n).toFixed(2)) }

function tx(date, description, amount, catName) {
  const type = amount > 0 ? 'income' : amount < 0 ? 'expense' : 'transfer'
  const merchant = description
  const dateStr = new Date(date).toISOString().split('T')[0]
  return {
    user: userId,
    date: new Date(date),
    description,
    merchant,
    amount: dec(amount),
    currency: 'MAD',
    type,
    category: catMap[catName] ?? undefined,
    source: 'import',
    dedupeHash: hash(String(userId), dateStr, Math.abs(amount).toFixed(2), merchant),
  }
}

// ── 3 months of data ──────────────────────────────────────────────────────────

const transactions = [
  // ── April 2024 ──
  tx('2024-04-01', 'Salaire Avril',               15000,  'Salary'),
  tx('2024-04-02', 'Loyer Avril',                 -4500,  'Housing'),
  tx('2024-04-03', 'Carrefour Courses',           -320,   'Groceries'),
  tx('2024-04-04', 'Station Total Essence',       -350,   'Transport'),
  tx('2024-04-05', 'Restaurant Le Bab',           -180,   'Restaurants'),
  tx('2024-04-06', 'Pharmacie Centrale',          -95,    'Health'),
  tx('2024-04-07', 'Netflix Abonnement',          -109,   'Entertainment'),
  tx('2024-04-08', 'Taxi InDriver',               -42,    'Transport'),
  tx('2024-04-09', 'Marjane Hypermarché',         -510,   'Groceries'),
  tx('2024-04-10', 'Prestation Design Web',       4500,   'Freelance'),
  tx('2024-04-11', 'Électricité ONE',             -285,   'Utilities'),
  tx('2024-04-12', 'Zara Achat Vêtements',        -650,   'Shopping'),
  tx('2024-04-13', 'Café Borj Déjeuner',          -95,    'Restaurants'),
  tx('2024-04-14', 'Salle de Sport Fitness+',     -250,   'Sport & Fitness'),
  tx('2024-04-15', 'Amazon Commande Livres',      -320,   'Shopping'),
  tx('2024-04-16', 'Spotify Premium',             -39,    'Entertainment'),
  tx('2024-04-17', 'Maroc Telecom Internet',      -199,   'Utilities'),
  tx('2024-04-18', 'Dentiste Dr. Benali',         -600,   'Health'),
  tx('2024-04-19', 'BIM Supermarché',             -180,   'Groceries'),
  tx('2024-04-20', 'Pizza Hut Soirée',            -145,   'Restaurants'),
  tx('2024-04-21', 'ONCF Billet Train',           -87,    'Transport'),
  tx('2024-04-22', 'Librairie Al Maarif',         -230,   'Shopping'),
  tx('2024-04-23', 'Remboursement Karim',         350,    'Transfers'),
  tx('2024-04-24', 'Acima Épicerie',              -210,   'Groceries'),
  tx('2024-04-25', 'Uber Trajet',                 -55,    'Transport'),
  tx('2024-04-26', 'Médecin Généraliste',         -200,   'Health'),
  tx('2024-04-27', 'Disney+ Abonnement',          -79,    'Entertainment'),
  tx('2024-04-28', 'H&M Shopping',                -480,   'Shopping'),
  tx('2024-04-29', 'Restaurant Casa Tapas',       -210,   'Restaurants'),
  tx('2024-04-30', 'Eau LYDEC',                   -120,   'Utilities'),

  // ── May 2024 ──
  tx('2024-05-01', 'Salaire Mai',                 15000,  'Salary'),
  tx('2024-05-02', 'Loyer Mai',                   -4500,  'Housing'),
  tx('2024-05-03', 'Carrefour Courses',           -290,   'Groceries'),
  tx('2024-05-04', 'Netflix Abonnement',          -109,   'Entertainment'),
  tx('2024-05-05', 'Station Total Essence',       -400,   'Transport'),
  tx('2024-05-06', 'Prestation Dev App',          6000,   'Freelance'),
  tx('2024-05-07', 'Restaurant Pizzeria Roma',    -165,   'Restaurants'),
  tx('2024-05-08', 'Salle de Sport Fitness+',     -250,   'Sport & Fitness'),
  tx('2024-05-09', 'Pharmacie Ibn Sina',          -130,   'Health'),
  tx('2024-05-10', 'Marjane Courses',             -445,   'Groceries'),
  tx('2024-05-11', 'Spotify Premium',             -39,    'Entertainment'),
  tx('2024-05-12', 'Taxi InDriver Aéroport',      -120,   'Transport'),
  tx('2024-05-13', 'Électricité ONE',             -310,   'Utilities'),
  tx('2024-05-14', 'Jumia Commande',              -870,   'Shopping'),
  tx('2024-05-15', 'Café Paul Petit-Déjeuner',    -75,    'Restaurants'),
  tx('2024-05-16', 'Maroc Telecom Internet',      -199,   'Utilities'),
  tx('2024-05-17', 'BIM Épicerie',                -160,   'Groceries'),
  tx('2024-05-18', 'Cinéma Megarama',             -90,    'Entertainment'),
  tx('2024-05-19', 'Fnac Casablanca',             -420,   'Shopping'),
  tx('2024-05-20', 'Restaurant Le Petit Zinc',    -240,   'Restaurants'),
  tx('2024-05-21', 'Labo Analyses Médicales',     -350,   'Health'),
  tx('2024-05-22', 'Uber Trajet Casa-Anfa',       -48,    'Transport'),
  tx('2024-05-23', 'Amazon Gadgets',              -560,   'Shopping'),
  tx('2024-05-24', 'Acima Supermarché',           -195,   'Groceries'),
  tx('2024-05-25', 'Coach Sportif',               -400,   'Sport & Fitness'),
  tx('2024-05-26', 'Eau LYDEC',                   -115,   'Utilities'),
  tx('2024-05-27', 'Virement Reçu Client',        2000,   'Freelance'),
  tx('2024-05-28', 'KFC Dîner',                   -110,   'Restaurants'),
  tx('2024-05-29', 'Librairie Chatr',             -195,   'Shopping'),
  tx('2024-05-30', 'Taxi InDriver',               -38,    'Transport'),
  tx('2024-05-31', 'Pharmacie Nuit',              -75,    'Health'),

  // ── June 2024 ──
  tx('2024-06-01', 'Salaire Juin',                15000,  'Salary'),
  tx('2024-06-02', 'Loyer Juin',                  -4500,  'Housing'),
  tx('2024-06-03', 'Carrefour Marché',            -375,   'Groceries'),
  tx('2024-06-04', 'Station Total Essence',       -380,   'Transport'),
  tx('2024-06-05', 'Netflix Abonnement',          -109,   'Entertainment'),
  tx('2024-06-06', 'Restaurant Terrasse 33',      -290,   'Restaurants'),
  tx('2024-06-07', 'Prestation Branding',         5500,   'Freelance'),
  tx('2024-06-08', 'Salle de Sport Fitness+',     -250,   'Sport & Fitness'),
  tx('2024-06-09', 'Électricité ONE',             -330,   'Utilities'),
  tx('2024-06-10', 'Pharmacie Centrale',          -85,    'Health'),
  tx('2024-06-11', 'Marjane Courses Semaine',     -490,   'Groceries'),
  tx('2024-06-12', 'Spotify Premium',             -39,    'Entertainment'),
  tx('2024-06-13', 'Amazon Prime Achat',          -680,   'Shopping'),
  tx('2024-06-14', 'Taxi InDriver Soirée',        -60,    'Transport'),
  tx('2024-06-15', 'Café Boulangerie Mogador',    -65,    'Restaurants'),
  tx('2024-06-16', 'Maroc Telecom Internet',      -199,   'Utilities'),
  tx('2024-06-17', 'H&M Soldes',                  -720,   'Shopping'),
  tx('2024-06-18', 'BIM Courses',                 -145,   'Groceries'),
  tx('2024-06-19', 'Médecin Ophtalmologue',       -400,   'Health'),
  tx('2024-06-20', 'Restaurant Sushi Shop',       -310,   'Restaurants'),
  tx('2024-06-21', 'ONCF Billet Marrakech',       -156,   'Transport'),
  tx('2024-06-22', 'Prime Video Abonnement',      -59,    'Entertainment'),
  tx('2024-06-23', 'Eau LYDEC',                   -105,   'Utilities'),
  tx('2024-06-24', 'Zara Été Collection',         -890,   'Shopping'),
  tx('2024-06-25', 'Acima Supermarché',           -220,   'Groceries'),
  tx('2024-06-26', 'Clinique Dentaire',           -950,   'Health'),
  tx('2024-06-27', 'Virement Reçu Remboursement', 500,   'Transfers'),
  tx('2024-06-28', 'McDonalds Repas',             -98,    'Restaurants'),
  tx('2024-06-29', 'Librairie Al Maarif',         -270,   'Shopping'),
  tx('2024-06-30', 'Uber Aéroport',               -145,   'Transport'),
]

// Upsert — safe to re-run
let inserted = 0, skipped = 0
for (const t of transactions) {
  try {
    await Transaction.updateOne(
      { user: userId, dedupeHash: t.dedupeHash },
      { $setOnInsert: t },
      { upsert: true }
    )
    inserted++
  } catch (e) {
    if (e.code === 11000) skipped++
    else console.error('Error:', e.message)
  }
}

console.log(`Transactions: ${inserted} upserted, ${skipped} already existed`)
console.log('Done! Visit http://localhost:3000')
await mongoose.disconnect()
