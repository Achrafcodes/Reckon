'use client'

import { Select } from '@/components/ui/Select'

interface Option { value: string; label: string }

export function MonthPicker({ value, options }: { value: string; options: Option[] }) {
  return (
    <Select
      value={value}
      onChange={(e) => {
        const url = new URL(window.location.href)
        url.searchParams.set('month', e.target.value)
        window.location.href = url.toString()
      }}
      className="w-auto"
    >
      {options.map((m) => (
        <option key={m.value} value={m.value}>{m.label}</option>
      ))}
    </Select>
  )
}
