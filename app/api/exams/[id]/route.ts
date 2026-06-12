import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireSession } from '@/lib/auth'
import { ok, fail, validationFail, serverError, isValidId } from '@/lib/api'
import { calcStreak } from '@/lib/utils'
import { PatchExamSchema } from '@/lib/validations'
import { computeFinalScore } from '@/lib/services/scoring-service'
import Exam from '@/models/Exam'
import ExamAnswer from '@/models/ExamAnswer'
import Question from '@/models/Question'
import User from '@/models/User'
import type { ExamDocument } from '@/models/Exam'

type RouteParams = { params: { id: string } }

/** Loads the exam and verifies ownership. Returns a NextResponse on failure. */
async function loadOwnExam(
  id: string,
  userId: string
): Promise<ExamDocument | NextResponse> {
  if (!isValidId(id)) return fail('Exam not found', 404)
  const exam = await Exam.findById(id)
  if (!exam) return fail('Exam not found', 404)
  if (exam.userId.toString() !== userId) return fail('Forbidden', 403)
  return exam
}

/**
 * GET /api/exams/[id]
 *
 * Returns the exam with:
 *   - questions (full objects, in order)
 *   - answers (ExamAnswer documents for this exam)
 *
 * The client derives the current position:
 *   first question in questionIds with no ExamAnswer = current position
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()
    const session = await requireSession()
    if (session instanceof NextResponse) return session

    const exam = await loadOwnExam(params.id, session.user.id)
    if (exam instanceof NextResponse) return exam

    const [questions, answers] = await Promise.all([
      Question.find({ _id: { $in: exam.questionIds } }).lean(),
      ExamAnswer.find({ examId: params.id }).lean(),
    ])

    // Re-order questions to match exam.questionIds order
    const qMap = new Map(questions.map(q => [q._id.toString(), q]))
    const orderedQuestions = exam.questionIds.map(id => qMap.get(id.toString())).filter(Boolean)

    return ok({ ...exam.toObject(), questions: orderedQuestions, answers })
  } catch (error) {
    return serverError('GET /api/exams/[id]', error)
  }
}

/**
 * PATCH /api/exams/[id]
 *
 * Body: { status: 'paused' | 'completed' }
 *
 * On completion:
 *   - Calculates score from evaluable (non-open) answers
 *   - Updates user streak (currentStreak, longestStreak, lastPracticeDate)
 *
 * Completed exams are immutable — repeated PATCHes return the exam unchanged.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()
    const session = await requireSession()
    if (session instanceof NextResponse) return session

    const body = await req.json()
    const parsed = PatchExamSchema.safeParse(body)
    if (!parsed.success) return validationFail(parsed.error)

    const exam = await loadOwnExam(params.id, session.user.id)
    if (exam instanceof NextResponse) return exam

    // Completed exams are final — idempotent response, no recalculation
    if (exam.status === 'completed') return ok(exam)

    const { status } = parsed.data

    if (status === 'completed') {
      // Calculate score from evaluable answers (raw correct count, not percentage)
      const answers      = await ExamAnswer.find({ examId: params.id }).lean()
      const correctCount = answers.filter(a => a.isCorrect === true).length

      exam.score       = computeFinalScore(correctCount, exam.scorableCount)
      exam.status      = 'completed'
      exam.completedAt = new Date()
      await exam.save()

      // Update user streak
      const user = await User.findById(session.user.id)
      if (user) {
        const { currentStreak, longestStreak, lastPracticeDate } = calcStreak(
          user.currentStreak,
          user.longestStreak,
          user.lastPracticeDate
        )
        user.currentStreak    = currentStreak
        user.longestStreak    = longestStreak
        user.lastPracticeDate = lastPracticeDate
        await user.save()
      }
    } else {
      exam.status = 'paused'
      await exam.save()
    }

    return ok(exam)
  } catch (error) {
    return serverError('PATCH /api/exams/[id]', error)
  }
}

/**
 * DELETE /api/exams/[id] — cancel/remove an exam
 *
 * Deletes the exam and all of its ExamAnswer documents.
 * UserStats are intentionally NOT reverted: answered questions still reflect
 * real practice, so accuracy history stays meaningful.
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()
    const session = await requireSession()
    if (session instanceof NextResponse) return session

    const exam = await loadOwnExam(params.id, session.user.id)
    if (exam instanceof NextResponse) return exam

    await Promise.all([
      ExamAnswer.deleteMany({ examId: params.id }),
      exam.deleteOne(),
    ])

    return ok({ id: params.id, deleted: true })
  } catch (error) {
    return serverError('DELETE /api/exams/[id]', error)
  }
}
