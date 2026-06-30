'use client'

interface Option { value: string; label: string }

export function MonthPicker({ value, options }: { value: string; options: Option[] }) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const url = new URL(window.location.href)
        url.searchParams.set('month', e.target.value)
        window.location.href = url.toString()
      }}
      className="rounded-lg border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-forest transition-colors cursor-pointer"
    >
      {options.map((m) => (
        <option key={m.value} value={m.value}>{m.label}</option>
      ))}
    </select>
  )
}
