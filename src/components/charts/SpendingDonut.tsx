'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface CategorySpend {
  categoryId: string
  name: string
  color: string
  total: number
}

interface TooltipPayload {
  name: string
  value: number
  payload: CategorySpend
}

export function SpendingDonut({ data, currency = 'MAD' }: { data: CategorySpend[]; currency?: string }) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-[220px] text-xs text-ink-muted">No expense data</div>
  )

  function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
    if (!active || !payload?.length) return null
    const d = payload[0]
    return (
      <div className="bg-ink text-white text-xs rounded-lg px-3 py-2 shadow-lg">
        <p className="font-medium" style={{ color: d.payload.color }}>{d.name}</p>
        <p className="tabular-nums mt-0.5">{d.value.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}</p>
      </div>
    )
  }

  return (
    <div className="min-h-[200px]">
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell key={entry.categoryId} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
    </div>
  )
}
