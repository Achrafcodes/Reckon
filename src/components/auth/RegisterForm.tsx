'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerSchema, type RegisterInput } from '@/schemas/auth'
import { registerAction } from '@/server/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function RegisterForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(data: RegisterInput) {
    const result = await registerAction(data)
    if (!result.ok) {
      if (result.fields) {
        for (const [field, messages] of Object.entries(result.fields)) {
          setError(field as keyof RegisterInput, { message: messages[0] })
        }
      } else {
        setError('root', { message: result.error })
      }
      return
    }
    router.push(result.data.redirectTo)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Create your account</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Start tracking your expenses today.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {errors.root && (
          <div className="rounded-md bg-danger-bg border border-danger/20 px-4 py-3 text-sm text-danger">
            {errors.root.message}
          </div>
        )}

        <Input
          id="name"
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Achraf"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full" size="lg">
          Create account
        </Button>
      </form>

      <p className="mt-7 text-sm text-ink-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-forest hover:text-forest-hover transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
