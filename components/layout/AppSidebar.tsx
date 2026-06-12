'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import ProgressBar from '@/components/ui/ProgressBar'
import { cn } from '@/lib/cn'
import { scoreColor } from '@/lib/utils'
import { NAV_ITEMS, ADMIN_NAV_ITEMS } from '@/lib/constants/nav'
import { Flame, Sun, Moon, ChevronLeft, LogOut } from 'lucide-react'

interface SidebarStats {
  globalAccuracy: number
  currentStreak: number
}

interface AppSidebarProps {
  stats?: SidebarStats
}

export default function AppSidebar({ stats }: AppSidebarProps) {
  const [open, setOpen] = useState(true)
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()

  const gPct   = stats?.globalAccuracy ?? 0
  const streak = stats?.currentStreak ?? 0
  const user   = session?.user
  const isAdmin = user?.role === 'admin'

  const allNavItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '??'

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-surface h-full shrink-0 overflow-hidden',
          'transition-[width,border] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'w-[200px] border-r border-border' : 'w-0 border-r-0',
        )}
      >
        {/* Logo */}
        <div className="h-[103px] flex items-center px-5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-[22px] h-[22px] bg-accent rounded-[6px] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <span className="text-[14px] font-bold font-display text-text tracking-[-0.02em]">QAForge</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-[10px]">
          {allNavItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'w-full flex items-center gap-[9px] px-[10px] py-[9px] rounded-lg mb-[2px]',
                  'text-[13px] no-underline transition-all duration-[120ms]',
                  active
                    ? 'bg-white/[0.06] text-text font-semibold'
                    : 'bg-transparent text-text-2 font-normal',
                )}
              >
                <Icon size={14} className={cn(active ? 'opacity-100' : 'opacity-60')} />
                {label}
                {label === 'Add Question' && (
                  <span className="text-[9px] px-[5px] py-[1px] rounded bg-accent text-white font-bold tracking-[0.04em] uppercase ml-auto">
                    admin
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User profile */}
        {user && (
          <div className="px-4 pt-3 pb-[14px] border-t border-border flex items-center gap-[10px]">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name ?? ''} width={32} height={32} className="rounded-full shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent shrink-0 flex items-center justify-center">
                <span className="text-[11px] font-bold text-white">{initials}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-text leading-[1.35] truncate">{user.name}</div>
              <div className="text-[11px] text-text-3 leading-[1.35] truncate">{user.email}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Sign out"
              className="w-7 h-7 rounded-[7px] border border-border bg-transparent cursor-pointer flex items-center justify-center text-text-2 shrink-0 transition-colors duration-150 hover:text-text"
            >
              <LogOut size={12} />
            </button>
          </div>
        )}

        {/* Bottom stats */}
        <div className="px-5 pt-3 pb-4 border-t border-border">
          <div className="flex justify-between items-center mb-[10px]">
            <div className="flex items-center gap-[5px]">
              <span className="text-streak flex"><Flame size={13} /></span>
              <span className="text-[13px] font-semibold font-display text-text">{streak}</span>
              <span className="text-[11px] text-text-3">days</span>
            </div>
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              className="w-7 h-7 rounded-[7px] border border-border bg-transparent cursor-pointer flex items-center justify-center text-text-2 transition-colors duration-150"
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </div>
          <div>
            <div className="flex justify-between mb-[5px]">
              <span className="text-[11px] text-text-3">Global accuracy</span>
              <span className="text-[11px] font-bold font-display" style={{ color: scoreColor(gPct) }}>{gPct}%</span>
            </div>
            <ProgressBar value={gPct} color={scoreColor(gPct)} height={2} />
          </div>
        </div>
      </aside>

      {/* Collapse/expand button */}
      <button
        onClick={() => setOpen(p => !p)}
        title={open ? 'Collapse sidebar' : 'Expand sidebar'}
        className="absolute top-[37px] z-30 w-7 h-7 rounded-full border border-border bg-card cursor-pointer flex items-center justify-center text-text-2 shrink-0 shadow-[0_1px_6px_rgba(0,0,0,0.18)] transition-[left,background] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ left: open ? 'calc(200px - 14px)' : '14px' }}
      >
        <span className={cn('flex transition-transform duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)]', !open && 'rotate-180')}>
          <ChevronLeft size={11} />
        </span>
      </button>
    </>
  )
}
