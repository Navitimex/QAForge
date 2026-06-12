import { LayoutGrid, Clock, Plus, PenLine } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  mobileLabel: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', mobileLabel: 'Home',    icon: LayoutGrid },
  { href: '/history',   label: 'History',   mobileLabel: 'History', icon: Clock      },
  { href: '/exam/new',  label: 'New Exam',  mobileLabel: 'Exam',    icon: Plus       },
]

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: '/admin/questions', label: 'Add Question', mobileLabel: 'Add', icon: PenLine },
]
