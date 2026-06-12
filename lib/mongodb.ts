/**
 * lib/mongodb.ts — MongoDB Atlas singleton connection
 *
 * ALWAYS import and call connectDB() from this module.
 * Caches the connection to avoid exhausting Atlas free-tier connections
 * across Next.js hot-reloads and serverless function invocations.
 */

import mongoose from 'mongoose'

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Use a module-level variable that persists across hot-reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null }

if (!global._mongooseCache) {
  global._mongooseCache = cached
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    // Validated lazily (not at import time) so builds and tests don't require the env var
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined. Add it to .env.local (or Vercel env vars)')
    }
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
    throw err
  }

  return cached.conn
}
