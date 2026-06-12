import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AppShell from '@/components/layout/AppShell'
import type { ReactNode } from 'react'

// Guard: requires session AND role === 'admin'
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'admin') redirect('/dashboard')

  return <AppShell userId={session.user.id}>{children}</AppShell>
}
