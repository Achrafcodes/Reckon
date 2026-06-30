import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import mongoose from 'mongoose'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envFile = join(__dirname, '../.env.local')
for (const line of readFileSync(envFile, 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

await mongoose.connect(process.env.MONGODB_URI)
console.log('Connected')

const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }))
const ImportBatch = mongoose.model('ImportBatch', new mongoose.Schema({}, { strict: false }))
const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }))

const t = await Transaction.deleteMany({})
const b = await ImportBatch.deleteMany({})
const c = await Category.deleteMany({ isSystem: true })

console.log(`Deleted: ${t.deletedCount} transactions, ${b.deletedCount} import batches, ${c.deletedCount} system categories`)
await mongoose.disconnect()
