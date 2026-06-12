import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireSession } from '@/lib/auth'
import { ok, fail, validationFail, serverError } from '@/lib/api'
import { CreateExamSchema } from '@/lib/validations'
import { buildAccuracyMap, weightedSample } from '@/lib/exam-weights'
import { buildQuestionFilter, buildExamTitle, countScorableQuestions } from '@/lib/services/exam-service'
import Exam from '@/models/Exam'
import Question from '@/models/Question'
import UserStats from '@/models/UserStats'
import Topic from '@/models/Topic'

/**
 * GET /api/exams — list exams for the current user
 * Query params: status (optional), limit (default 20), page (default 1)
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await requireSession()
    if (session instanceof NextResponse) return session

    const { searchParams } = req.nextUrl
    const status = searchParams.get('status')
    const rawLimit = parseInt(searchParams.get('limit') || '20', 10)
    const rawPage  = parseInt(searchParams.get('page')  || '1', 10)
    const limit  = Math.min(50, Math.max(1, Number.isNaN(rawLimit) ? 20 : rawLimit))
    const page   = Math.max(1, Number.isNaN(rawPage) ? 1 : rawPage)

    if (status && !['active', 'paused', 'completed'].includes(status)) {
      return fail('Invalid status', 400)
    }

    const filter: Record<string, unknown> = { userId: session.user.id }
    if (status) filter.status = status

    const [exams, total] = await Promise.all([
      Exam.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Exam.countDocuments(filter),
    ])

    return ok({ exams, total, page, limit })
  } catch (error) {
    return serverError('GET /api/exams', error)
  }
}

/**
 * POST /api/exams — create a new exam using weighted question selection
 *
 * Body: { topicIds, size, difficulty, mode }
 *
 * Algorithm:
 * 1. Validate input with Zod
 * 2. Query active questions matching topic + difficulty filters
 * 3. Load user stats for the selected topics
 * 4. Apply weighted random sampling (weak topics prioritized)
 * 5. Calculate scorableCount (non-open questions)
 * 6. Create Exam document
 */
export async function POST(req: Request) {
  try {
    await connectDB()
    const session = await requireSession()
    if (session instanceof NextResponse) return session

    const body = await req.json()
    const parsed = CreateExamSchema.safeParse(body)
    if (!parsed.success) return validationFail(parsed.error)

    const { topicIds, size, difficulty, mode } = parsed.data
    const userId = session.user.id

    // Build question filter
    const qFilter = buildQuestionFilter(topicIds, difficulty, mode)

    // Fetch candidate questions and user stats in parallel
    const [candidates, userStats, topics] = await Promise.all([
      Question.find(qFilter).lean(),
      UserStats.find({ userId, topicId: { $in: topicIds } }).lean(),
      Topic.find({ _id: { $in: topicIds } }).lean(),
    ])

    if (candidates.length === 0) {
      return fail('No questions available for the selected filters', 422)
    }

    // Apply weighted sampling
    const statsMap = buildAccuracyMap(
      userStats.map(s => ({
        ...s,
        _id:      s._id.toString(),
        userId:   s.userId.toString(),
        topicId:  s.topicId.toString(),
        accuracy: s.totalAnswered > 0 ? s.totalCorrect / s.totalAnswered : undefined,
      }))
    )

    const candidatesPlain = candidates.map(q => ({
      ...q,
      _id:     q._id.toString(),
      topicId: q.topicId.toString(),
    }))

    const selected = weightedSample(candidatesPlain as never, statsMap, size)

    // Build title from topic names and count scorable questions
    const title        = buildExamTitle(topics.map(t => t.name))
    const scorableCount = countScorableQuestions(selected)

    const exam = await Exam.create({
      userId,
      title,
      topicIds,
      questionIds:  selected.map(q => q._id),
      size:         selected.length,
      difficulty,
      mode,
      status:       'active',
      score:        null,
      scorableCount,
      startedAt:    new Date(),
      completedAt:  null,
    })

    return ok({ examId: exam._id }, 201)
  } catch (error) {
    return serverError('POST /api/exams', error)
  }
}
