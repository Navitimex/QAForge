import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import ExamModel from '@/models/Exam'
import ExamAnswerModel from '@/models/ExamAnswer'
import QuestionModel from '@/models/Question'
import TopicModel from '@/models/Topic'
import ProgressRing from '@/components/ui/ProgressRing'
import Button from '@/components/ui/Button'
import SectionLabel from '@/components/ui/SectionLabel'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import { scoreColor, scoreColorDim, fmtTime, fmtRelativeDate } from '@/lib/utils'
import { isValidId } from '@/lib/api'

interface Props {
  params: { id: string }
}

export default async function ReviewPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  if (!isValidId(params.id)) notFound()

  await connectDB()

  const exam = await ExamModel.findOne({ _id: params.id, userId: session.user.id }).lean()
  if (!exam) notFound()

  const [questions, answers, topics] = await Promise.all([
    QuestionModel.find({ _id: { $in: exam.questionIds } }).lean(),
    ExamAnswerModel.find({ examId: params.id }).lean(),
    TopicModel.find({ _id: { $in: exam.topicIds } }).lean(),
  ])

  const qMap   = Object.fromEntries(questions.map(q => [String(q._id), q]))
  const ansMap = Object.fromEntries(answers.map(a => [String(a.questionId), a]))

  const orderedQA = exam.questionIds.map((id: unknown) => ({
    q: qMap[String(id)],
    a: ansMap[String(id)],
  })).filter(({ q }) => q)

  const topicNames = topics.map(t => t.name).join(', ')
  const score      = exam.score ?? 0
  const pct        = exam.scorableCount > 0 ? Math.round((score / exam.scorableCount) * 100) : 0
  const totalTime  = answers.reduce((s, a) => s + (a.timeSpentSeconds ?? 0), 0)

  return (
    <div className="px-6 py-7 max-w-[700px] mx-auto w-full">
      {/* Results header */}
      <div className="flex gap-5 items-center mb-7">
        <ProgressRing score={pct} size={72} strokeWidth={5} />
        <div>
          <h1 className="text-[22px] font-bold font-display text-text mb-1 tracking-[-0.02em]">Exam Results</h1>
          <p className="text-sm text-text-3 mb-2">{topicNames}</p>
          <div className="flex gap-2 flex-wrap">
            <Badge color={scoreColor(pct)}>{score}/{exam.scorableCount} correct</Badge>
            <Badge>{fmtTime(totalTime)} total</Badge>
            <Badge>{fmtRelativeDate(exam.createdAt)}</Badge>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-[10px] mb-7">
        <StatCard label="Score"     value={`${pct}%`}                              color={scoreColor(pct)} />
        <StatCard label="Correct"   value={String(score)}                          color={scoreColor(100)} />
        <StatCard label="Incorrect" value={String(exam.scorableCount - score)}     color={scoreColor(0)} />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-8">
        <Link href="/exam/new" className="flex-1 no-underline">
          <Button variant="primary"   size="md" className="w-full">New Exam</Button>
        </Link>
        <Link href="/history" className="flex-1 no-underline">
          <Button variant="secondary" size="md" className="w-full">History</Button>
        </Link>
        <Link href="/dashboard" className="flex-1 no-underline">
          <Button variant="ghost"     size="md" className="w-full">Dashboard</Button>
        </Link>
      </div>

      {/* Question-by-question review */}
      <SectionLabel>Question review</SectionLabel>
      <div className="flex flex-col gap-3">
        {orderedQA.map(({ q, a }, i) => {
          if (!q) return null
          const isOpen      = q.type === 'open' || q.type === 'code'
          const isCorrect   = isOpen ? a?.selfRating === 'knew'   : a?.isCorrect === true
          const isWrong     = isOpen ? a?.selfRating === 'missed' : a?.isCorrect === false
          const statusColor = a?.skipped ? 'var(--text-3)' : isCorrect ? scoreColor(100) : isWrong ? scoreColor(0) : scoreColor(55)

          // True/false questions store no options — render fixed ones
          const opts: { label: string; text: string }[] = q.type === 'true_false'
            ? [{ label: 'true', text: 'True' }, { label: 'false', text: 'False' }]
            : ((q.options ?? []) as { label: string; text: string }[])

          return (
            <details
              key={String(q._id)}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <summary className="px-4 py-[14px] cursor-pointer flex items-center gap-3 list-none select-none">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: statusColor }} />
                <span className="text-[13px] text-text flex-1 leading-[1.4]">
                  <span className="text-text-3 mr-[6px]">{i + 1}.</span>
                  {q.text.length > 80 ? q.text.slice(0, 80) + '…' : q.text}
                </span>
                <span className="text-[11px] text-text-3 shrink-0">
                  {a?.timeSpentSeconds ? fmtTime(a.timeSpentSeconds) : '—'}
                </span>
              </summary>

              <div className="px-4 pb-4 border-t border-border">
                <p className="text-[15px] text-text leading-[1.6] my-[14px]">{q.text}</p>

                {/* Options for multiple/TF */}
                {opts.length > 0 && (
                  <div className="flex flex-col gap-[6px] mb-3">
                    {opts.map(opt => {
                      const isSelected   = a?.userAnswer === opt.label
                      const isCorrectOpt = q.correctAnswer === opt.label
                      const state = isCorrectOpt ? 'correct' : (isSelected && !isCorrectOpt ? 'wrong' : 'default')

                      return (
                        <div
                          key={opt.label}
                          className="flex items-start gap-[10px] px-3 py-[10px] rounded-btn border"
                          style={{
                            borderColor: state === 'correct' ? scoreColor(100) : state === 'wrong' ? scoreColor(0) : 'var(--border)',
                            background:  state === 'correct' ? scoreColorDim(100) : state === 'wrong' ? scoreColorDim(0) : 'transparent',
                          }}
                        >
                          <span className="text-[11px] font-bold text-text-3 min-w-[20px]">{opt.label}</span>
                          <span className="text-[13px] text-text leading-[1.5]">{opt.text}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Self rating for open */}
                {isOpen && a?.selfRating && (
                  <div className="mb-3">
                    <Badge color={statusColor}>Self-rated: {a.selfRating}</Badge>
                  </div>
                )}

                {/* Code exercise: snippet + solution */}
                {q.code && (
                  <div className="mb-3">
                    <p className="text-[11px] font-bold text-text-3 uppercase tracking-[0.08em] mb-[6px]">Exercise code</p>
                    <pre className="bg-surface border border-border rounded-lg p-3 overflow-x-auto text-[12.5px] leading-[1.6] text-text font-mono whitespace-pre m-0">{q.code}</pre>
                  </div>
                )}
                {q.type === 'code' && q.solutionCode && (
                  <div className="mb-3">
                    <p className="text-[11px] font-bold text-text-3 uppercase tracking-[0.08em] mb-[6px]">Solution</p>
                    <pre className="bg-surface border border-border rounded-lg p-3 overflow-x-auto text-[12.5px] leading-[1.6] text-text font-mono whitespace-pre m-0">{q.solutionCode}</pre>
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="bg-surface rounded-lg p-3 border border-border">
                    <p className="text-[11px] font-bold text-text-3 uppercase tracking-[0.08em] mb-[6px]">Explanation</p>
                    <p className="text-[13px] text-text-2 leading-[1.6] m-0">{q.explanation}</p>
                  </div>
                )}
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}
