/**
 * lib/auth.ts — NextAuth v4 configuration
 *
 * Providers:
 *   - GoogleProvider: for regular users (role: 'user')
 *   - CredentialsProvider: for admin only (role: 'admin', created via seed)
 *
 * Session strategy: JWT (stateless, works on Vercel serverless)
 * Roles are injected into the JWT and session via callbacks.
 */

import type { NextAuthOptions, Session } from 'next-auth'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import type { Role } from '@/types'

export const authOptions: NextAuthOptions = {
  // ── Session strategy ────────────────────────────────────────────────────
  session: { strategy: 'jwt' },

  // ── Providers ───────────────────────────────────────────────────────────
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: 'Admin credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        await connectDB()

        const user = await User.findOne({
          email:    credentials.email.toLowerCase(),
          provider: 'credentials',
          role:     'admin',
        })

        if (!user || !user.passwordHash) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return {
          id:    user._id.toString(),
          name:  user.name,
          email: user.email,
          image: user.image ?? null,
          role:  user.role as Role,
        }
      },
    }),
  ],

  // ── Pages ────────────────────────────────────────────────────────────────
  pages: {
    signIn: '/login',
  },

  // ── Callbacks ────────────────────────────────────────────────────────────
  callbacks: {
    /**
     * signIn: called when a user signs in.
     * For Google: create the user document on first login with role 'user'.
     * For credentials: user is already validated by `authorize` above.
     */
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB()

        const existing = await User.findOne({ email: user.email!.toLowerCase() })

        if (!existing) {
          await User.create({
            name:             user.name ?? 'User',
            email:            user.email!.toLowerCase(),
            image:            user.image ?? null,
            passwordHash:     null,
            provider:         'google',
            role:             'user',
            currentStreak:    0,
            longestStreak:    0,
            lastPracticeDate: null,
          })
        }
      }
      return true
    },

    /**
     * jwt: called when a JWT is created or updated.
     * On first sign-in, load id and role from DB and embed in the token.
     */
    async jwt({ token, user, account }) {
      // `user` is only present on first sign-in
      if (user) {
        if (account?.provider === 'credentials') {
          // role was already set in `authorize` return value
          token.id   = user.id
          token.role = (user as { role: Role }).role
        } else {
          // Google sign-in: look up role from DB
          await connectDB()
          const dbUser = await User.findOne({ email: token.email! })
          token.id   = dbUser?._id.toString() ?? ''
          token.role = (dbUser?.role ?? 'user') as Role
        }
      }
      return token
    },

    /**
     * session: called when a session is accessed.
     * Expose id and role from the JWT to the session object.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id
        session.user.role = token.role
      }
      return session
    },
  },

  // ── Secret ──────────────────────────────────────────────────────────────
  secret: process.env.NEXTAUTH_SECRET,
}

// ── API route helpers ─────────────────────────────────────────────────────

export async function requireSession(): Promise<Session | NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  return session
}

export async function requireAdmin(): Promise<Session | NextResponse> {
  const result = await requireSession()
  if (result instanceof NextResponse) return result
  if (result.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }
  return result
}
