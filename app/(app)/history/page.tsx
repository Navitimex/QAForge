import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import ExamModel from '@/models/Exam'
import { getTopicMap } from '@/lib/services/topic-service'
import ProgressRing from '@/components/ui/ProgressRing'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import CancelExamButton from '@/components/exam/CancelExamButton'
import { scoreColor, fmtRelativeDate } from '@/lib/utils'

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  await connectDB()

  const [exams, topicMap] = await Promise.all([
    ExamModel.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean(),
    getTopicMap(),
  ])

  return (
    <div className="px-6 py-7 max-w-[700px] mx-auto w-full">
      <div className="mb-7">
        <h1 className="text-[22px] font-bold font-display text-text mb-1 tracking-[-0.02em]">
          Exam History
        </h1>
        <p className="text-sm text-text-3">
          {exams.length} exam{exams.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {exams.length === 0 ? (
        <EmptyState
          title="No exams yet"
          description="Complete your first exam to see it here."
          action={{ label: 'Start your first exam', href: '/exam/new' }}
          className="py-12"
        />
      ) : (
        <div className="flex flex-col gap-[10px]">
          {exams.map(exam => {
            const score       = exam.score ?? 0
            const pct         = exam.scorableCount > 0 ? Math.round((score / exam.scorableCount) * 100) : 0
            const topics      = (exam.topicIds ?? []).map((id: unknown) => topicMap[String(id)]).filter(Boolean) as string[]
            const isCompleted = exam.status === 'completed'
            const href        = isCompleted ? `/review/${exam._id}` : `/exam/${exam._id}`

            return (
              <Card key={String(exam._id)} className="p-4 rounded-card">
                <Link href={href} className="no-underline flex gap-4 items-start">
                  <ProgressRing score={pct} size={48} strokeWidth={4} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-[6px]">
                      <div className="text-sm font-semibold text-text leading-[1.4]">
                        {topics.length > 0 ? topics.join(', ') : `${exam.size} questions`}
                      </div>
                      <span
                        className="text-[13px] font-bold font-display shrink-0 ml-2"
                        style={{ color: isCompleted ? scoreColor(pct) : 'var(--text-3)' }}
                      >
                        {isCompleted ? `${pct}%` : '—'}
                      </span>
                    </div>
                    <div className="flex gap-[6px] flex-wrap items-center">
                      <Badge color={isCompleted ? scoreColor(pct) : '#EAB308'}>
                        {exam.status}
                      </Badge>
                      <Badge>{exam.mode}</Badge>
                      <Badge>{exam.difficulty}</Badge>
                      <span className="text-[11px] text-text-3 ml-auto">{fmtRelativeDate(exam.createdAt)}</span>
                    </div>
                  </div>
                </Link>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  {isCompleted ? (
                    <Link href={`/review/${exam._id}`} className="no-underline">
                      <Button variant="secondary" size="sm">Review</Button>
                    </Link>
                  ) : (
                    <>
                      <Link href={`/exam/${exam._id}`} className="no-underline">
                        <Button variant="primary" size="sm">Resume</Button>
                      </Link>
                      <CancelExamButton examId={String(exam._id)} />
                    </>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
