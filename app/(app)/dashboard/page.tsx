import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { getUserGlobalStats, getUserStreak } from '@/lib/services/stats-service'
import { getTopicMap } from '@/lib/services/topic-service'
import ExamModel from '@/models/Exam'
import ProgressRing from '@/components/ui/ProgressRing'
import ProgressBar from '@/components/ui/ProgressBar'
import Button from '@/components/ui/Button'
import SectionLabel from '@/components/ui/SectionLabel'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import EmptyState from '@/components/ui/EmptyState'
import { scoreColor, fmtRelativeDate, calcAccuracy } from '@/lib/utils'

// Threshold (accuracy %) below which a topic needs attention
const WEAK_THRESHOLD = 60

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  await connectDB()

  const [globalStats, streak, recentExams, topicMap] = await Promise.all([
    getUserGlobalStats(session.user.id),
    getUserStreak(session.user.id),
    ExamModel.find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(5).lean(),
    getTopicMap(),
  ])

  const { statsRows, totalAnswered, globalAccuracy: globalAcc } = globalStats

  const weakTopics = statsRows
    .filter(r => r.totalAnswered >= 5)
    .map(r => ({ ...r, accuracy: calcAccuracy(r.totalAnswered, r.totalCorrect) }))
    .filter(r => r.accuracy < WEAK_THRESHOLD)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 4)

  return (
    <div className="px-6 py-7 max-w-[700px] mx-auto w-full">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[22px] font-bold font-display text-text mb-1 tracking-[-0.02em]">
          Good day{session.user.name ? `, ${session.user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-text-3">
          {totalAnswered === 0 ? 'Start your first exam to track progress.' : `${totalAnswered} questions answered · ${streak} day streak`}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        <StatCard label="Global accuracy" value={`${globalAcc}%`} color={scoreColor(globalAcc)} />
        <StatCard label="Questions answered" value={String(totalAnswered)} />
        <StatCard label="Current streak" value={`${streak}d`} color="#EAB308" />
      </div>

      {/* Weak topics */}
      {weakTopics.length > 0 && (
        <div className="mb-7">
          <SectionLabel>Needs attention</SectionLabel>
          <div className="flex flex-col gap-2">
            {weakTopics.map(wt => (
              <Card key={String(wt._id)} className="p-[14px_16px] flex items-center gap-[14px]">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-text mb-[6px]">
                    {topicMap[String(wt.topicId)] ?? 'Unknown topic'}
                  </div>
                  <ProgressBar value={wt.accuracy} color={scoreColor(wt.accuracy)} height={3} />
                </div>
                <span className="text-[13px] font-bold font-display shrink-0" style={{ color: scoreColor(wt.accuracy) }}>
                  {wt.accuracy}%
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Performance by topic */}
      {statsRows.length > 0 && (
        <div className="mb-7">
          <SectionLabel>Performance by topic</SectionLabel>
          <Card className="rounded-card overflow-hidden">
            {statsRows.map((row, i) => {
              const acc = calcAccuracy(row.totalAnswered, row.totalCorrect)
              return (
                <div
                  key={String(row._id)}
                  className="flex items-center gap-[14px] px-4 py-3"
                  style={{ borderBottom: i < statsRows.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-[5px]">
                      <span className="text-[13px] text-text font-medium">
                        {topicMap[String(row.topicId)] ?? 'Unknown'}
                      </span>
                      <span className="text-[11px] text-text-3">{row.totalAnswered} q</span>
                    </div>
                    <ProgressBar value={acc} color={scoreColor(acc)} height={3} />
                  </div>
                  <span className="text-xs font-bold font-display shrink-0 min-w-[32px] text-right" style={{ color: scoreColor(acc) }}>
                    {acc}%
                  </span>
                </div>
              )
            })}
          </Card>
        </div>
      )}

      {/* Recent exams */}
      <div className="mb-7">
        <div className="flex justify-between items-center mb-[14px]">
          <SectionLabel className="mb-0">Recent exams</SectionLabel>
          {recentExams.length > 0 && (
            <Link href="/history" className="text-xs text-accent no-underline">View all →</Link>
          )}
        </div>

        {recentExams.length === 0 ? (
          <EmptyState
            title="No exams yet. Start your first one!"
            action={{ label: 'New Exam', href: '/exam/new' }}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {recentExams.map(exam => {
              const score = exam.score ?? 0
              const pct   = exam.scorableCount > 0 ? Math.round((score / exam.scorableCount) * 100) : 0
              return (
                <Link
                  key={String(exam._id)}
                  href={exam.status === 'completed' ? `/review/${exam._id}` : `/exam/${exam._id}`}
                  className="no-underline"
                >
                  <Card className="p-[14px_16px] flex items-center gap-[14px] transition-[border-color] duration-[120ms]">
                    <ProgressRing score={pct} size={40} strokeWidth={3} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-text mb-[3px]">
                        {exam.topicIds?.length ?? 0} topic{(exam.topicIds?.length ?? 0) !== 1 ? 's' : ''} · {exam.size} questions
                      </div>
                      <div className="flex gap-[6px] items-center">
                        <Badge color={exam.status === 'completed' ? scoreColor(pct) : '#EAB308'}>
                          {exam.status}
                        </Badge>
                        <span className="text-[11px] text-text-3">{fmtRelativeDate(exam.createdAt)}</span>
                      </div>
                    </div>
                    <span className="text-[15px] font-bold font-display shrink-0" style={{ color: scoreColor(pct) }}>
                      {exam.status === 'completed' ? `${pct}%` : '…'}
                    </span>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      <Link href="/exam/new">
        <Button variant="primary" size="lg">+ New Exam</Button>
      </Link>
    </div>
  )
}
