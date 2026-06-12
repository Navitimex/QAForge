import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireSession } from '@/lib/auth'
import { ok, serverError } from '@/lib/api'
import { calcAccuracy } from '@/lib/utils'
import UserStats from '@/models/UserStats'
import Topic from '@/models/Topic'

/** GET /api/stats — user stats per topic (for dashboard) */
export async function GET() {
  try {
    await connectDB()
    const session = await requireSession()
    if (session instanceof NextResponse) return session

    const userId = session.user.id

    const [stats, topics] = await Promise.all([
      UserStats.find({ userId }).lean(),
      Topic.find({ isActive: true }).lean(),
    ])

    // Build a map topicId → stats
    const statsMap = new Map(stats.map(s => [s.topicId.toString(), s]))

    // Attach accuracy to each topic
    const data = topics.map(t => {
      const s = statsMap.get(t._id.toString())
      return {
        topic: t,
        totalAnswered: s?.totalAnswered ?? 0,
        totalCorrect:  s?.totalCorrect  ?? 0,
        totalSkipped:  s?.totalSkipped  ?? 0,
        accuracy:      s ? calcAccuracy(s.totalAnswered, s.totalCorrect) : 0,
        lastAttemptAt: s?.lastAttemptAt ?? null,
      }
    })

    return ok(data)
  } catch (error) {
    return serverError('GET /api/stats', error)
  }
}
