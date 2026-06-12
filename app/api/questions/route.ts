import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireSession, requireAdmin } from '@/lib/auth'
import { ok, fail, validationFail, serverError, isValidId } from '@/lib/api'
import { CreateQuestionSchema } from '@/lib/validations'
import Question from '@/models/Question'

const DIFFICULTIES = ['easy', 'medium', 'hard']
const TYPES        = ['multiple', 'true_false', 'open']

/** parseInt with NaN fallback (malformed query params must not reach MongoDB). */
function intParam(value: string | null, fallback: number): number {
  const n = parseInt(value ?? '', 10)
  return Number.isNaN(n) ? fallback : n
}

/**
 * GET /api/questions
 * Query params: topicId, difficulty, type, search, page (default 1), limit (default 20)
 * Requires valid session. Returns active questions only.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await requireSession()
    if (session instanceof NextResponse) return session

    const { searchParams } = req.nextUrl
    const topicId    = searchParams.get('topicId')
    const difficulty = searchParams.get('difficulty')
    const type       = searchParams.get('type')
    const search     = searchParams.get('search')
    const page       = Math.max(1, intParam(searchParams.get('page'), 1))
    const limit      = Math.min(100, Math.max(1, intParam(searchParams.get('limit'), 20)))

    if (topicId && !isValidId(topicId))                  return fail('Invalid topicId', 400)
    if (difficulty && !DIFFICULTIES.includes(difficulty)) return fail('Invalid difficulty', 400)
    if (type && !TYPES.includes(type))                    return fail('Invalid type', 400)

    const filter: Record<string, unknown> = { isActive: true }

    if (topicId)    filter.topicId    = topicId
    if (difficulty) filter.difficulty = difficulty
    if (type)       filter.type       = type

    if (search) {
      filter.$text = { $search: search }
    }

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Question.countDocuments(filter),
    ])

    return ok({ questions, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (error) {
    return serverError('GET /api/questions', error)
  }
}

/**
 * POST /api/questions — create a question (admin only)
 */
export async function POST(req: Request) {
  try {
    await connectDB()
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    const body = await req.json()
    const parsed = CreateQuestionSchema.safeParse(body)
    if (!parsed.success) return validationFail(parsed.error)

    const question = await Question.create(parsed.data)
    return ok(question, 201)
  } catch (error) {
    return serverError('POST /api/questions', error)
  }
}
