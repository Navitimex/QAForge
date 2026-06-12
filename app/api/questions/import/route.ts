import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import { ok, fail, serverError } from '@/lib/api'
import { ImportQuestionSchema } from '@/lib/validations'
import Question from '@/models/Question'
import Topic from '@/models/Topic'

/**
 * POST /api/questions/import — bulk import JSON array (admin only)
 *
 * Body: array of question objects (topicSlug instead of topicId)
 * Response: { inserted: N, errors: [{ index, reason }] }
 *
 * Uses insertMany with ordered:false so individual errors don't abort the batch.
 */
export async function POST(req: Request) {
  try {
    await connectDB()
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return fail('Invalid JSON', 400)
    }

    if (!Array.isArray(body) || body.length === 0) {
      return fail('Body must be a non-empty array', 400)
    }

    // Cache topic slug → ObjectId lookup
    const topicCache = new Map<string, string>()
    const allTopics = await Topic.find({ isActive: true }).lean()
    for (const t of allTopics) {
      topicCache.set(t.slug, t._id.toString())
    }

    const toInsert: object[] = []
    const errors: { index: number; reason: string }[] = []

    for (let i = 0; i < body.length; i++) {
      const parsed = ImportQuestionSchema.safeParse(body[i])

      if (!parsed.success) {
        errors.push({ index: i, reason: parsed.error.issues[0]?.message ?? 'Validation failed' })
        continue
      }

      const { topicSlug, ...rest } = parsed.data
      const topicId = topicCache.get(topicSlug)

      if (!topicId) {
        errors.push({ index: i, reason: `Unknown topicSlug: "${topicSlug}"` })
        continue
      }

      toInsert.push({ ...rest, topicId, isActive: true })
    }

    let inserted = 0

    if (toInsert.length > 0) {
      try {
        const result = await Question.insertMany(toInsert, { ordered: false })
        inserted = result.length
      } catch (bulkError: unknown) {
        // With ordered:false, some documents may still be inserted even if others fail
        const err = bulkError as { result?: { insertedCount?: number }; message?: string }
        inserted = err?.result?.insertedCount ?? 0
        if (inserted === 0) {
          return fail('Bulk insert failed', 500, err?.message)
        }
      }
    }

    return ok({ inserted, errors })
  } catch (error) {
    return serverError('POST /api/questions/import', error)
  }
}
