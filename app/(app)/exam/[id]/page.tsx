import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import ExamModel from '@/models/Exam'
import ExamAnswerModel from '@/models/ExamAnswer'
import QuestionModel from '@/models/Question'
import ExamClient from './ExamClient'
import { isValidId } from '@/lib/api'
import type { IExamFull } from '@/types'

interface Props {
  params: { id: string }
}

export default async function ExamPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  if (!isValidId(params.id)) notFound()

  await connectDB()

  const exam = await ExamModel.findOne({ _id: params.id, userId: session.user.id }).lean()
  if (!exam) notFound()
  if (exam.status === 'completed') redirect(`/review/${params.id}`)

  // In exam mode, correct answers must not reach the browser while the exam is
  // running (they would be visible in the page payload). Open questions keep
  // their explanation — it is the "expected answer" needed for self-rating.
  const hideAnswers = exam.mode === 'exam'

  const [questions, answers] = await Promise.all([
    QuestionModel.find({ _id: { $in: exam.questionIds } }).lean(),
    ExamAnswerModel.find({ examId: params.id }).lean(),
  ])

  // Preserve order from exam.questionIds
  const qMap = Object.fromEntries(questions.map(q => [String(q._id), q]))

  const orderedQuestions = exam.questionIds
    .map((id: unknown) => qMap[String(id)])
    .filter(Boolean)
    .map((q) => ({
      _id:           String(q._id),
      topicId:       String(q.topicId),
      text:          q.text,
      type:          q.type,
      difficulty:    q.difficulty,
      options:       q.options ?? [],
      correctAnswer: hideAnswers && q.type !== 'open' ? null : (q.correctAnswer ?? null),
      explanation:   hideAnswers && q.type !== 'open' ? ''   : q.explanation,
      tags:          q.tags ?? [],
      version:       q.version ?? null,
      isActive:      q.isActive ?? true,
      createdAt:     q.createdAt,
      updatedAt:     q.updatedAt,
    }))

  const safeAnswers = answers.map(a => ({
    _id:              String(a._id),
    examId:           String(a.examId),
    userId:           String(a.userId),
    questionId:       String(a.questionId),
    topicId:          String(a.topicId),
    questionType:     a.questionType,
    userAnswer:       a.userAnswer ?? null,
    isCorrect:        a.isCorrect ?? null,
    selfRating:       a.selfRating ?? null,
    skipped:          a.skipped ?? false,
    timeSpentSeconds: a.timeSpentSeconds ?? 0,
    answeredAt:       a.answeredAt,
  }))

  const examFull: IExamFull = {
    _id:           String(exam._id),
    userId:        String(exam.userId),
    title:         exam.title,
    topicIds:      exam.topicIds.map(String),
    questionIds:   exam.questionIds.map(String),
    size:          exam.size,
    difficulty:    exam.difficulty,
    mode:          exam.mode,
    status:        exam.status,
    score:         exam.score ?? null,
    scorableCount: exam.scorableCount,
    startedAt:     exam.startedAt,
    completedAt:   exam.completedAt ?? null,
    createdAt:     exam.createdAt,
    questions:     orderedQuestions,
    answers:       safeAnswers,
  }

  return <ExamClient exam={examFull} />
}
