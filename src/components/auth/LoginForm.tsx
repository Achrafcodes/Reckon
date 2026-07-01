'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginSchema, type LoginInput } from '@/schemas/auth'
import { loginAction } from '@/server/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ReckLogo } from '@/components/ui/ReckLogo'

export function LoginForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginInput) {
    const result = await loginAction(data)
    if (!result.ok) {
      if (result.fields) {
        for (const [field, messages] of Object.entries(result.fields)) {
          setError(field as keyof LoginInput, { message: messages[0] })
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
        <ReckLogo width={96} color="#09090b" className="mb-6" />
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Sign in to your account to continue.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {errors.root && (
          <div className="rounded-md bg-danger-bg border border-danger/20 px-4 py-3 text-sm text-danger">
            {errors.root.message}
          </div>
        )}

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
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full" size="lg">
          Sign in
        </Button>
      </form>

      <p className="mt-7 text-sm text-ink-muted">
        No account?{' '}
        <Link href="/register" className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-600 transition-colors">
          Create one
        </Link>
      </p>
    </div>
  )
}
