'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'

interface DataPoint {
  month: string
  income: number
  expenses: number
}

function formatMonth(m: string) {
  const [year, month] = m.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
}

function formatAmount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toFixed(0)
}

interface TooltipPayload {
  name: string
  value: number
  color: string
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink text-white text-xs rounded-lg px-3 py-2.5 shadow-lg space-y-1 min-w-[140px]">
      <p className="font-medium mb-1.5 text-sidebar-text">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="tabular-nums font-medium">{p.value.toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD</span>
        </div>
      ))}
    </div>
  )
}

export function MonthlyBarChart({ data }: { data: DataPoint[] }) {
  const formatted = data.map((d) => ({ ...d, month: formatMonth(d.month) }))

  return (
    <div className="min-h-[200px]">
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formatted} barCategoryGap="30%" barGap={4}>
        <CartesianGrid vertical={false} stroke="#d2e0d8" strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#6b8880' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatAmount}
          tick={{ fontSize: 11, fill: '#6b8880' }}
          axisLine={false}
          tickLine={false}
          width={42}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(27,94,62,0.04)' }} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
          formatter={(v) => <span style={{ color: '#6b8880' }}>{v}</span>}
        />
        <Bar dataKey="income" name="Income" fill="#1b5e3e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="#b91c1c" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
    </div>
  )
}
