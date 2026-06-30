import { type NextRequest, NextResponse } from 'next/server'

// Sample CSV template demonstrating the expected transaction list format.
// Negative amounts = expenses, positive = income.
const TEMPLATE = `Date,Description,Amount,Currency,Type
2024-06-01,Salary,3000.00,MAD,income
2024-06-03,Supermarket Carrefour,-145.00,MAD,expense
2024-06-05,Fuel Station,-60.00,MAD,expense
2024-06-07,Netflix Subscription,-15.00,MAD,expense
2024-06-10,Restaurant El Bahia,-85.00,MAD,expense
2024-06-12,Transfer from savings,500.00,MAD,income
2024-06-15,Electricity bill,-320.00,MAD,expense
2024-06-18,Pharmacy,-42.00,MAD,expense
2024-06-22,Grocery shopping,-110.00,MAD,expense
2024-06-28,Freelance payment,800.00,MAD,income
`

export async function GET(_req: NextRequest) {
  return new NextResponse(TEMPLATE, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="reckon-template.csv"',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
