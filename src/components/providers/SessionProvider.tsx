'use client'

import { createContext, useContext } from 'react'

export interface SessionUser {
  _id: string
  name: string
  email: string
  baseCurrency: string
}

const SessionContext = createContext<SessionUser | null>(null)

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser
  children: React.ReactNode
}) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
}

export function useSession(): SessionUser {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
