'use client'

interface GreetingProps {
  name: string
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function Greeting({ name }: GreetingProps) {
  const firstName = name.split(' ')[0]
  return (
    <div className="animate-fade-up" style={{ animationDelay: '0ms' }}>
      <h1 className="text-2xl font-semibold text-ink tracking-tight">
        {getGreeting()}, {firstName}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        Here&apos;s your financial overview.
      </p>
    </div>
  )
}
