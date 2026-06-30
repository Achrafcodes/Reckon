import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import mongoose from 'mongoose'

const __dirname = dirname(fileURLToPath(import.meta.url))
for (const line of readFileSync(join(__dirname, '../.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/); if (m) process.env[m[1].trim()] = m[2].trim()
}

await mongoose.connect(process.env.MONGODB_URI)

const CategorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, default: null },
  name: String, type: String, color: String, icon: String,
  keywords: [String], isSystem: Boolean,
}, { timestamps: true })
CategorySchema.index({ user: 1, name: 1 }, { unique: true })
const Category = mongoose.models.Category ?? mongoose.model('Category', CategorySchema)

await Category.deleteMany({ isSystem: true, user: null })

const categories = [
  { name: 'Salary',          type: 'income',   color: '#1b5e3e', icon: 'banknote',      keywords: ['salaire', 'salary', 'virement reçu', 'paie'] },
  { name: 'Freelance',       type: 'income',   color: '#2d7a56', icon: 'laptop',        keywords: ['freelance', 'prestation', 'honoraires', 'virement reçu client'] },
  { name: 'Groceries',       type: 'expense',  color: '#0891b2', icon: 'shopping-cart', keywords: ['carrefour', 'marjane', 'lidl', 'supermarché', 'courses', 'hypermarché', 'bim', 'acima', 'épicerie'] },
  { name: 'Restaurants',     type: 'expense',  color: '#d97706', icon: 'utensils',      keywords: ['restaurant', 'café', 'pizza', 'burger', 'mcdo', 'kfc', 'sushi', 'brasserie', 'déjeuner', 'dîner', 'tapas', 'boulangerie'] },
  { name: 'Transport',       type: 'expense',  color: '#7c3aed', icon: 'car',           keywords: ['taxi', 'essence', 'total', 'station', 'indriver', 'uber', 'train', 'oncf', 'aéroport'] },
  { name: 'Housing',         type: 'expense',  color: '#be185d', icon: 'home',          keywords: ['loyer', 'rent', 'appartement'] },
  { name: 'Utilities',       type: 'expense',  color: '#0e7490', icon: 'zap',           keywords: ['électricité', 'one', 'eau', 'lydec', 'radeema', 'internet', 'telecom', 'inwi', 'maroc telecom'] },
  { name: 'Health',          type: 'expense',  color: '#dc2626', icon: 'heart',         keywords: ['pharmacie', 'médecin', 'docteur', 'dentiste', 'clinique', 'hôpital', 'labo', 'ophtalmologue', 'analyses'] },
  { name: 'Entertainment',   type: 'expense',  color: '#ea580c', icon: 'play',          keywords: ['netflix', 'spotify', 'cinema', 'youtube', 'disney', 'prime', 'megarama'] },
  { name: 'Shopping',        type: 'expense',  color: '#9333ea', icon: 'bag',           keywords: ['amazon', 'zara', 'h&m', 'librairie', 'fnac', 'jumia', 'vêtements', 'soldes', 'collection'] },
  { name: 'Sport & Fitness', type: 'expense',  color: '#16a34a', icon: 'dumbbell',      keywords: ['salle de sport', 'gym', 'fitness', 'coach', 'piscine', 'sportif'] },
  { name: 'Leisure',         type: 'expense',  color: '#0284c7', icon: 'coffee',        keywords: ['leisure', 'cinema', 'loisir', 'jeux', 'sortie', 'bowling', 'parc', 'musée', 'concert'] },
  { name: 'Rent & Bills',   type: 'expense',  color: '#7e22ce', icon: 'home',          keywords: ['loyer', 'rent', 'facture', 'bill', 'assurance', 'insurance', 'abonnement', 'lydec', 'one', 'radeema'] },
  { name: 'Unplanned',      type: 'expense',  color: '#64748b', icon: 'alert',         keywords: ['inattendu', 'urgence', 'imprévu', 'unplanned', 'emergency'] },
  { name: 'Transfers',      type: 'transfer', color: '#94a3b8', icon: 'arrow-right',   keywords: ['remboursement', 'virement'] },
]

const docs = await Category.insertMany(categories.map(c => ({ ...c, isSystem: true, user: null })))
console.log(`Inserted ${docs.length} categories`)
await mongoose.disconnect()
