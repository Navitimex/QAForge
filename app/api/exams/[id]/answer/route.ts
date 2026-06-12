import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireSession } from '@/lib/auth'
import { ok, fail, validationFail, serverError, isValidId } from '@/lib/api'
import { SubmitAnswerSchema } from '@/lib/validations'
import { evaluateAnswer, computeStatsDelta, isZeroDelta } from '@/lib/services/scoring-service'
import Exam from '@/models/Exam'
import ExamAnswer from '@/models/ExamAnswer'
import Question from '@/models/Question'
import UserStats from '@/models/UserStats'

type RouteParams = { params: { id: string } }

/**
 * POST /api/exams/[id]/answer
 *
 * Submit or update an answer for a question in an exam.
 *
 * Body: { questionId, userAnswer?, selfRating?, timeSpentSeconds, skipped? }
 *
 * Business rules:
 *   - Exam must belong to the user and not be completed
 *   - The question must belong to this exam (security)
 *   - For open questions: isCorrect derives from selfRating (knew/partial/missed)
 *   - For multiple/true_false: isCorrect compared against correctAnswer
 *   - UserStats updated incrementally (re-answer safe — see computeStatsDelta)
 *
 * Returns: { answerId, isCorrect, correctAnswer, explanation }
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()
    const session = await requireSession()
    if (session instanceof NextResponse) return session

    if (!isValidId(params.id)) return fail('Exam not found', 404)

    const body = await req.json()
    const parsed = SubmitAnswerSchema.safeParse(body)
    if (!parsed.success) return validationFail(parsed.error)

    const { questionId, userAnswer, selfRating, timeSpentSeconds, skipped } = parsed.data
    if (!isValidId(questionId)) return fail('Question not found', 404)

    // Verify exam exists, belongs to user, and is still open
    const exam = await Exam.findById(params.id).lean()
    if (!exam) return fail('Exam not found', 404)
    if (exam.userId.toString() !== session.user.id) return fail('Forbidden', 403)
    if (exam.status === 'completed') return fail('Exam is already completed', 409)

    // Verify question belongs to this exam
    const questionBelongs = exam.questionIds.some(id => id.toString() === questionId)
    if (!questionBelongs) return fail('Question does not belong to this exam', 400)

    // Load question to determine isCorrect and get topicId
    const question = await Question.findById(questionId).lean()
    if (!question) return fail('Question not found', 404)

    const isCorrect = evaluateAnswer({
      questionType:  question.type,
      correctAnswer: question.correctAnswer ?? null,
      userAnswer,
      selfRating,
      skipped,
    })

    const userId  = session.user.id
    const topicId = question.topicId.toString()

    // Snapshot the previous answer (if any) BEFORE upserting,
    // so stats can be adjusted incrementally without double-counting.
    const prevAnswer = await ExamAnswer.findOne({ examId: params.id, questionId }).lean()

    const answer = await ExamAnswer.findOneAndUpdate(
      { examId: params.id, questionId },
      {
        $set: {
          examId:           params.id,
          userId,
          questionId,
          topicId,
          questionType:     question.type,
          userAnswer:       userAnswer ?? null,
          isCorrect,
          selfRating:       selfRating ?? null,
          skipped:          skipped ?? false,
          timeSpentSeconds: timeSpentSeconds ?? 0,
          answeredAt:       new Date(),
        },
      },
      { upsert: true, new: true }
    )

    // Incremental UserStats update (re-answer safe)
    const delta = computeStatsDelta(
      prevAnswer ? { isCorrect: prevAnswer.isCorrect ?? null, skipped: prevAnswer.skipped ?? false } : null,
      { isCorrect, skipped: skipped ?? false }
    )

    if (!isZeroDelta(delta)) {
      await UserStats.findOneAndUpdate(
        { userId, topicId },
        { $inc: delta, $set: { lastAttemptAt: new Date() } },
        { upsert: true }
      )
    }

    return ok({
      answerId:      answer._id,
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation:   question.explanation,
    })
  } catch (error) {
    return serverError('POST /api/exams/[id]/answer', error)
  }
}
