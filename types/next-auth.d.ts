/**
 * Augment NextAuth types so session.user.id and session.user.role
 * are available everywhere without casting.
 */
import type { DefaultSession, DefaultUser } from 'next-auth'
import type { Role } from './index'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: Role
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
  }
}
