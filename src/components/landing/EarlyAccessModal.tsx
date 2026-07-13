'use client'
import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { joinEarlyAccessAction } from '@/server/actions/early-access'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface EarlyAccessModalProps {
  /** The trigger element — receives an onClick prop to open the modal. */
  children: (props: { onClick: () => void }) => ReactNode
  /** Where this trigger lives on the page — stored with the signup. */
  source: string
}

export function EarlyAccessModal({ children, source }: EarlyAccessModalProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  function openModal() {
    setOpen(true)
    setStatus('idle')
    setError('')
  }

  function closeModal() {
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    setTimeout(() => emailRef.current?.focus(), 50)
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal()
    }
    function onOutside(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) closeModal()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onOutside)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onOutside)
      document.body.style.overflow = ''
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting' || status === 'success') return

    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email address.')
      setStatus('error')
      return
    }

    setStatus('submitting')
    setError('')

    const result = await joinEarlyAccessAction({ email: email.trim(), firstName: firstName.trim(), source })

    if (!result.ok) {
      setError(result.error)
      setStatus('error')
      return
    }

    setStatus('success')
  }

  return (
    <>
      {children({ onClick: openModal })}

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="early-access-title"
              className="relative w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>

              {status === 'success' ? (
                <div className="py-4 text-center">
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-zinc-900">
                    Got it — we&apos;ll email you to set up your account.
                  </p>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <h2 id="early-access-title" className="text-lg font-bold text-zinc-900 tracking-tight">
                    Request access
                  </h2>
                  <p className="mt-1.5 text-sm text-zinc-500">
                    Reckon isn&apos;t self-serve yet — leave your details and we&apos;ll set your account up personally.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                    <div>
                      <label htmlFor="ea-email" className="sr-only">Email</label>
                      <input
                        ref={emailRef}
                        id="ea-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
                        disabled={status === 'submitting'}
                        className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label htmlFor="ea-name" className="sr-only">First name (optional)</label>
                      <input
                        id="ea-name"
                        type="text"
                        placeholder="First name (optional)"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={status === 'submitting'}
                        className="w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 disabled:opacity-60"
                      />
                    </div>

                    {status === 'error' && (
                      <p className="text-xs font-medium text-red-600" role="alert">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === 'submitting' ? 'Sending…' : 'Request access'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
