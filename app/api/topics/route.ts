import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireSession } from '@/lib/auth'
import { ok, serverError } from '@/lib/api'
import { getActiveTopics } from '@/lib/services/topic-service'

/** GET /api/topics — list all active topics */
export async function GET() {
  try {
    await connectDB()
    const session = await requireSession()
    if (session instanceof NextResponse) return session

    return ok(await getActiveTopics())
  } catch (error) {
    return serverError('GET /api/topics', error)
  }
}
