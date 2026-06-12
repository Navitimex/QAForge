'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/cn'
import { NAV_ITEMS, ADMIN_NAV_ITEMS } from '@/lib/constants/nav'

export default function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'

  const items = isAdmin ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS

  return (
    <div className="shrink-0 h-nav flex bg-surface border-t border-border">
      {items.map(({ href, mobileLabel, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-[3px] no-underline',
              'transition-colors duration-[120ms]',
              active ? 'text-accent' : 'text-text-3',
            )}
          >
            <Icon size={19} />
            <span className="text-[9px] font-semibold tracking-[0.04em] uppercase">
              {mobileLabel}
            </span>
          </Link>
        )
      })}

      {/* Sign out — mobile has no sidebar, so it lives here */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="flex-1 flex flex-col items-center justify-center gap-[3px] bg-transparent border-none cursor-pointer text-text-3 transition-colors duration-[120ms]"
      >
        <LogOut size={19} />
        <span className="text-[9px] font-semibold tracking-[0.04em] uppercase">Exit</span>
      </button>
    </div>
  )
}
