import type { Metadata } from 'next'
import { DM_Sans, Space_Grotesk } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Providers from '@/components/layout/Providers'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'QAForge',
  description: 'Practice QA interview questions and track your progress.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    // suppressHydrationWarning prevents mismatch when ThemeProvider sets data-theme on client
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${dmSans.variable} ${spaceGrotesk.variable}`}
    >
      <body className="bg-outer-bg">
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
