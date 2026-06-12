import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireSession } from '@/lib/auth'
import { ok, fail, serverError, isValidId } from '@/lib/api'
import { buildQuestionFilter } from '@/lib/services/exam-service'
import Question from '@/models/Question'
import type { ExamDifficulty, ExamMode } from '@/types'

const DIFFICULTIES = ['mixed', 'easy', 'medium', 'hard']
const MODES        = ['practice', 'exam', 'interview', 'code']

/**
 * GET /api/questions/availability?topicIds=a,b,c&difficulty=mixed&mode=practice
 *
 * Returns how many active questions match the current New Exam selection,
 * so the UI can show availability and cap the question count.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await requireSession()
    if (session instanceof NextResponse) return session

    const { searchParams } = req.nextUrl
    const topicIds   = (searchParams.get('topicIds') ?? '').split(',').filter(Boolean)
    const difficulty = searchParams.get('difficulty') ?? 'mixed'
    const mode       = searchParams.get('mode') ?? 'practice'

    if (topicIds.length === 0)            return ok({ count: 0 })
    if (!topicIds.every(isValidId))       return fail('Invalid topicIds', 400)
    if (!DIFFICULTIES.includes(difficulty)) return fail('Invalid difficulty', 400)
    if (!MODES.includes(mode))            return fail('Invalid mode', 400)

    const filter = buildQuestionFilter(topicIds, difficulty as ExamDifficulty, mode as ExamMode)
    const count  = await Question.countDocuments(filter)

    return ok({ count })
  } catch (error) {
    return serverError('GET /api/questions/availability', error)
  }
}
