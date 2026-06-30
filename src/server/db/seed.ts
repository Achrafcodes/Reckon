import 'server-only'
import { connectDB } from './connect'
import { Category } from './models'

const SYSTEM_CATEGORIES = [
  { name: 'Groceries', type: 'expense', color: '#16a34a', icon: 'shopping-cart', keywords: ['carrefour', 'marjane', 'label vie', 'supermarket', 'grocery', 'épicerie', 'bim', 'lidl', 'aldi'] },
  { name: 'Junk Food', type: 'expense', color: '#f59e0b', icon: 'pizza', keywords: ['mcdonalds', 'kfc', 'burger', 'pizza', 'dominos', 'subway', 'fastfood', 'fast food'] },
  { name: 'Shopping', type: 'expense', color: '#8b5cf6', icon: 'bag', keywords: ['amazon', 'jumia', 'zara', 'h&m', 'clothing', 'shoes', 'mall'] },
  { name: 'Transport', type: 'expense', color: '#0ea5e9', icon: 'car', keywords: ['uber', 'taxi', 'careem', 'bus', 'train', 'fuel', 'petrol', 'essence', 'parking', 'toll'] },
  { name: 'Bills', type: 'expense', color: '#ef4444', icon: 'lightning', keywords: ['electricity', 'water', 'internet', 'phone', 'mobile', 'rent', 'loyer', 'maroc telecom', 'inwi', 'orange', 'amendis', 'redal', 'lydec'] },
  { name: 'Entertainment', type: 'expense', color: '#ec4899', icon: 'film', keywords: ['netflix', 'spotify', 'cinema', 'games', 'steam', 'youtube', 'disney'] },
  { name: 'Healthcare', type: 'expense', color: '#14b8a6', icon: 'heart', keywords: ['pharmacy', 'pharmacie', 'doctor', 'hospital', 'clinic', 'dentist', 'medecin'] },
  { name: 'Investments', type: 'expense', color: '#f97316', icon: 'trending-up', keywords: ['investment', 'stock', 'crypto', 'bourse', 'cih', 'attijariwafa', 'bmce', 'banque populaire'] },
  { name: 'Salary', type: 'income', color: '#22c55e', icon: 'banknote', keywords: ['salary', 'salaire', 'virement', 'payroll', 'wage'] },
  { name: 'Savings', type: 'transfer', color: '#6366f1', icon: 'piggy-bank', keywords: ['savings', 'epargne', 'transfer', 'virement'] },
  { name: 'Education', type: 'expense', color: '#0284c7', icon: 'book', keywords: ['school', 'ecole', 'university', 'tuition', 'course', 'udemy', 'coursera', 'books', 'livres'] },
  { name: 'Travel', type: 'expense', color: '#d97706', icon: 'plane', keywords: ['airline', 'hotel', 'booking', 'airbnb', 'ryanair', 'royal air maroc', 'ram', 'airport'] },
  { name: 'Unplanned', type: 'expense', color: '#94a3b8', icon: 'question', keywords: [] },
  { name: 'Other', type: 'expense', color: '#64748b', icon: 'tag', keywords: [] },
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
