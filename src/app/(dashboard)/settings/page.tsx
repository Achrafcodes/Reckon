import { getCurrentUser } from '@/server/auth/session'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { PasswordForm } from '@/components/settings/PasswordForm'
import { DangerZone } from '@/components/settings/DangerZone'

export const metadata = { title: 'Settings — Reckon' }

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-rule">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description && <p className="text-xs text-ink-muted mt-0.5">{description}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-ink-muted">Manage your account and preferences.</p>
      </div>

      <Section title="Profile" description="Update your name, email, and preferred currency.">
        <ProfileForm
          name={user.name}
          email={user.email}
          baseCurrency={user.settings?.baseCurrency ?? 'MAD'}
        />
      </Section>

      <Section title="Password" description="Use a strong password of at least 8 characters.">
        <PasswordForm />
      </Section>

      <Section title="Danger zone">
        <DangerZone />
      </Section>
    </div>
  )
}
