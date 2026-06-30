// Run: node scripts/gen-2026-excels.mjs
// Generates realistic 2026 monthly expense Excel files in /tmp/

import * as XLSX from 'xlsx'
import { writeFileSync } from 'fs'

// Achraf, 28, software developer living in Casablanca
// Monthly salary ~12,000 MAD, rents an apartment, has a car, enjoys going out

const months = [
  { name: 'January',  num: '01', year: 2026 },
  { name: 'February', num: '02', year: 2026 },
  { name: 'March',    num: '03', year: 2026 },
  { name: 'April',    num: '04', year: 2026 },
  { name: 'May',      num: '05', year: 2026 },
  { name: 'June',     num: '06', year: 2026 },
]

function d(year, month, day) {
  return `${String(day).padStart(2,'0')}/${String(month).padStart(2,'0')}/${year}`
}

function rows(year, m) {
  const mo = parseInt(m)

  // Each month has slightly different expenses to feel real
  const base = [
    // ── INCOME ────────────────────────────────────────────────────────────────
    { date: d(year,mo,1),  description: 'Virement Salaire',            amount:  12000.00, type: 'income'   },

    // ── RENT & BILLS ──────────────────────────────────────────────────────────
    { date: d(year,mo,2),  description: 'Loyer Appartement',           amount:  -3800.00, type: 'expense'  },
    { date: d(year,mo,3),  description: 'Lydec Electricite & Eau',     amount:   -280.00, type: 'expense'  },
    { date: d(year,mo,3),  description: 'Maroc Telecom Internet',      amount:   -299.00, type: 'expense'  },
    { date: d(year,mo,5),  description: 'Inwi Mobile Forfait',         amount:    -99.00, type: 'expense'  },

    // ── GROCERIES ─────────────────────────────────────────────────────────────
    { date: d(year,mo,4),  description: 'Carrefour Market',            amount:   -620.00, type: 'expense'  },
    { date: d(year,mo,11), description: 'Marjane Hypermarche',         amount:   -430.00, type: 'expense'  },
    { date: d(year,mo,18), description: 'BIM Epicerie',                amount:   -185.00, type: 'expense'  },
    { date: d(year,mo,25), description: 'Acima Supermarche',           amount:   -310.00, type: 'expense'  },

    // ── RESTAURANTS & CAFES ───────────────────────────────────────────────────
    { date: d(year,mo,6),  description: 'Restaurant Le Relais',        amount:   -180.00, type: 'expense'  },
    { date: d(year,mo,9),  description: 'Cafe Paul Maarif',            amount:    -85.00, type: 'expense'  },
    { date: d(year,mo,13), description: 'Pizza Hut Casablanca',        amount:   -145.00, type: 'expense'  },
    { date: d(year,mo,16), description: 'Sushi Shop Livraison',        amount:   -220.00, type: 'expense'  },
    { date: d(year,mo,20), description: 'McDonalds Twin Center',       amount:    -95.00, type: 'expense'  },
    { date: d(year,mo,23), description: 'Boulangerie Paul',            amount:    -55.00, type: 'expense'  },
    { date: d(year,mo,27), description: 'Restaurant La Sqala',         amount:   -210.00, type: 'expense'  },

    // ── TRANSPORT ─────────────────────────────────────────────────────────────
    { date: d(year,mo,5),  description: 'Total Essence Station',       amount:   -400.00, type: 'expense'  },
    { date: d(year,mo,14), description: 'Total Essence Station',       amount:   -380.00, type: 'expense'  },
    { date: d(year,mo,8),  description: 'InDriver Course',             amount:    -45.00, type: 'expense'  },
    { date: d(year,mo,17), description: 'Carwash Sidi Maarouf',        amount:    -60.00, type: 'expense'  },

    // ── HEALTH ────────────────────────────────────────────────────────────────
    { date: d(year,mo,10), description: 'Pharmacie Atlas',             amount:   -145.00, type: 'expense'  },

    // ── ENTERTAINMENT & SUBSCRIPTIONS ─────────────────────────────────────────
    { date: d(year,mo,1),  description: 'Netflix Abonnement',          amount:    -99.00, type: 'expense'  },
    { date: d(year,mo,1),  description: 'Spotify Premium',             amount:    -49.00, type: 'expense'  },

    // ── SHOPPING ─────────────────────────────────────────────────────────────
    { date: d(year,mo,15), description: 'Amazon.fr Commande',          amount:   -350.00, type: 'expense'  },

    // ── SAVINGS TRANSFER ──────────────────────────────────────────────────────
    { date: d(year,mo,2),  description: 'Virement Epargne CIH',       amount:  -1500.00, type: 'transfer' },
  ]

  // Month-specific extras to make each month feel different
  const extras = {
    '01': [
      { date: d(year,mo,7),  description: 'Fnac Casablanca Livre Tech', amount:  -280.00, type: 'expense' },
      { date: d(year,mo,20), description: 'Hammam & Spa',               amount:  -120.00, type: 'expense' },
      { date: d(year,mo,28), description: 'Remboursement Ami Karim',    amount:   300.00, type: 'income'  },
    ],
    '02': [
      { date: d(year,mo,14), description: 'Diner Saint Valentin Nobu',  amount:  -480.00, type: 'expense' },
      { date: d(year,mo,10), description: 'Fleurs Florist',             amount:   -95.00, type: 'expense' },
      { date: d(year,mo,22), description: 'Cinema Megarama IMAX',       amount:   -90.00, type: 'expense' },
    ],
    '03': [
      { date: d(year,mo,3),  description: 'Revisione Voiture Garage',   amount:  -850.00, type: 'expense' },
      { date: d(year,mo,19), description: 'Zara Vetements',             amount:  -620.00, type: 'expense' },
      { date: d(year,mo,25), description: 'H&M Achats',                 amount:  -310.00, type: 'expense' },
    ],
    '04': [
      { date: d(year,mo,10), description: 'Billet ONCF Casa-Rabat A/R', amount:  -140.00, type: 'expense' },
      { date: d(year,mo,12), description: 'Hotel Rabat Sofitel',        amount:  -890.00, type: 'expense' },
      { date: d(year,mo,21), description: 'Dentiste Dr. Benali',        amount:  -600.00, type: 'expense' },
    ],
    '05': [
      { date: d(year,mo,8),  description: 'MacBook Pro Accessoire',     amount:  -750.00, type: 'expense' },
      { date: d(year,mo,18), description: 'Salle de Sport Fitness Park',amount:  -350.00, type: 'expense' },
      { date: d(year,mo,29), description: 'Freelance Projet Web',       amount:  3500.00, type: 'income'  },
    ],
    '06': [
      { date: d(year,mo,5),  description: 'Billet Royal Air Maroc',     amount: -1800.00, type: 'expense' },
      { date: d(year,mo,15), description: 'Hotel Agadir Riu',           amount: -2200.00, type: 'expense' },
      { date: d(year,mo,17), description: 'Resto Plage Agadir',         amount:  -340.00, type: 'expense' },
      { date: d(year,mo,28), description: 'Climatiseur Achat',          amount: -3200.00, type: 'expense' },
    ],
  }

  return [...base, ...(extras[m] ?? [])].sort((a,b) => {
    const [da,ma] = a.date.split('/').map(Number)
    const [db,mb] = b.date.split('/').map(Number)
    return da - db
  })
}

for (const { name, num, year } of months) {
  const data = rows(year, num)
  const headers = ['Date', 'Description', 'Amount', 'Type']
  const wsData = [headers, ...data.map(r => [r.date, r.description, r.amount, r.type])]

  const ws = XLSX.utils.aoa_to_sheet(wsData)
  ws['!cols'] = [{ wch: 12 }, { wch: 38 }, { wch: 12 }, { wch: 10 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, name)

  const path = `/tmp/reckon-${year}-${num}-${name}.xlsx`
  XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  writeFileSync(path, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
  console.log(`✓ ${path}`)
}
