/**
 * components/layout/AppShell.tsx — authenticated app shell (Server Component)
 *
 * Sidebar (desktop) + bottom nav (mobile) + scrollable content area.
 * Shared by the (app) and (admin) route groups so both render the same chrome.
 */

import AppSidebar from '@/components/layout/AppSidebar'
import MobileNav from '@/components/layout/MobileNav'
import { connectDB } from '@/lib/mongodb'
import { getUserGlobalStats, getUserStreak } from '@/lib/services/stats-service'
import type { ReactNode } from 'react'

interface Props {
  userId: string
  children: ReactNode
}

export default async function AppShell({ userId, children }: Props) {
  await connectDB()

  let globalAccuracy = 0
  let currentStreak  = 0

  try {
    const [stats, streak] = await Promise.all([
      getUserGlobalStats(userId),
      getUserStreak(userId),
    ])
    globalAccuracy = stats.globalAccuracy
    currentStreak  = streak
  } catch {
    // Sidebar stats are non-critical — render the shell anyway
  }

  return (
    <div className="w-screen h-dvh bg-bg overflow-hidden flex flex-col">

      {/* Sidebar + content row */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Sidebar — hidden on mobile */}
        <div className="hidden md:flex">
          <AppSidebar stats={{ globalAccuracy, currentStreak }} />
        </div>

        {/* Main content */}
        <main className="screen flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <div className="md:hidden">
        <MobileNav />
      </div>

    </div>
  )
}
