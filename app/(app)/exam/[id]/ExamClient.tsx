'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import OptionCard from '@/components/ui/OptionCard'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import ToggleGroup from '@/components/ui/ToggleGroup'
import { fmtTime, scoreColor } from '@/lib/utils'
import type { IExamFull, IExamAnswer, ApiResponse } from '@/types'

type SelfRating = 'knew' | 'partial' | 'missed'

const SKIPPED_COLOR = '#EAB308'

interface Props {
  exam: IExamFull
}

interface SubmitPayload {
  questionId: string
  userAnswer?: string
  selfRating?: SelfRating
  skipped?: boolean
}

/** Options rendered for a question — true/false questions get fixed options. */
function displayOptions(q: IExamFull['questions'][number]) {
  if (q.type === 'true_false') {
    return [
      { value: 'true',  label: 'T', text: 'True'  },
      { value: 'false', label: 'F', text: 'False' },
    ]
  }
  return (q.options ?? []).map(o => ({ value: o.label, label: o.label, text: o.text }))
}

export default function ExamClient({ exam }: Props) {
  const router = useRouter()
  const mode = exam.mode as 'practice' | 'exam'

  const answeredIds     = new Set(exam.answers.filter(a => !a.skipped).map(a => a.questionId))
  const firstUnanswered = exam.questions.findIndex(q => !answeredIds.has(String(q._id)))
  const [idx, setIdx]   = useState(firstUnanswered === -1 ? 0 : firstUnanswered)

  const [answers, setAnswers] = useState<Map<string, IExamAnswer>>(
    new Map(exam.answers.map(a => [a.questionId, a]))
  )
  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [revealed, setRevealed]           = useState(false)
  const [selfRating, setSelfRating]       = useState<SelfRating | null>(null)
  const [submitting, setSubmitting]       = useState(false)
  const [error, setError]                 = useState('')
  const [elapsed, setElapsed]             = useState(0)
  const startRef = useRef(Date.now())

  const question = exam.questions[idx]
  const total    = exam.questions.length
  const progress = Math.round((answers.size / total) * 100)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Sync local question state when navigating between questions.
  // Skipped answers are treated as "not answered yet" so they can be retried.
  useEffect(() => {
    const existing = answers.get(String(question._id))
    if (existing && !existing.skipped) {
      setSelectedValue(existing.userAnswer)
      setSelfRating(existing.selfRating as SelfRating | null)
      // Exam mode never reveals correct/wrong during the exam (open questions do
      // reveal their expected answer — that's required for self-rating).
      setRevealed(mode === 'practice' || question.type === 'open')
    } else {
      setSelectedValue(null)
      setRevealed(false)
      setSelfRating(null)
    }
    setError('')
    startRef.current = Date.now()
    setElapsed(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  const submitAnswer = useCallback(async (payload: SubmitPayload): Promise<boolean> => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/exams/${exam._id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, timeSpentSeconds: elapsed }),
      })
      const json = (await res.json()) as ApiResponse<{ answerId: string; isCorrect: boolean | null }>
      if (!json.success) throw new Error(json.error || 'Failed to save answer')

      const newAnswer: IExamAnswer = {
        _id:              String(json.data.answerId),
        examId:           exam._id,
        userId:           exam.userId,
        questionId:       payload.questionId,
        topicId:          question.topicId,
        questionType:     question.type,
        userAnswer:       payload.userAnswer ?? null,
        isCorrect:        json.data.isCorrect,
        selfRating:       payload.selfRating ?? null,
        skipped:          payload.skipped ?? false,
        timeSpentSeconds: elapsed,
        answeredAt:       new Date(),
      }
      setAnswers(prev => new Map(prev).set(payload.questionId, newAnswer))
      if (!payload.skipped && (mode === 'practice' || question.type === 'open')) setRevealed(true)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save answer')
      return false
    } finally {
      setSubmitting(false)
    }
  }, [exam._id, exam.userId, elapsed, mode, question])

  async function handleSelectOption(value: string) {
    if (revealed || submitting) return
    setSelectedValue(value)
    await submitAnswer({ questionId: String(question._id), userAnswer: value })
  }

  async function handleSelfRate(rating: SelfRating) {
    if (submitting) return
    setSelfRating(rating)
    await submitAnswer({ questionId: String(question._id), selfRating: rating })
  }

  async function handleSkip() {
    if (submitting) return
    const okSubmit = await submitAnswer({ questionId: String(question._id), skipped: true })
    if (okSubmit && idx < total - 1) setIdx(idx + 1)
  }

  async function handleNext() {
    if (idx < total - 1) {
      setIdx(idx + 1)
    } else {
      await completeExam()
    }
  }

  async function completeExam() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/exams/${exam._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })
      const json = (await res.json()) as ApiResponse<unknown>
      if (!json.success) throw new Error(json.error || 'Failed to finish exam')
      router.push(`/review/${exam._id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to finish exam')
      setSubmitting(false)
    }
  }

  async function handleExit() {
    // Pause silently — progress is already persisted answer-by-answer
    try {
      await fetch(`/api/exams/${exam._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paused' }),
      })
    } catch {
      // Even if pausing fails, answers are saved — leave anyway
    }
    router.push('/history')
  }

  const existingAnswer = answers.get(String(question._id))
  const isAnswered     = !!existingAnswer && !existingAnswer.skipped
  const isOpen         = question.type === 'open'
  const isMultiOrTF    = !isOpen
  const isLast         = idx === total - 1
  const allAnswered    = answers.size === total
  const canProceed     = existingAnswer
    ? (existingAnswer.skipped || !isOpen || existingAnswer.selfRating != null || selfRating != null)
    : false

  const options = displayOptions(question)

  function getOptionState(value: string): 'default' | 'selected' | 'correct' | 'wrong' {
    if (!revealed || !isAnswered) return value === selectedValue ? 'selected' : 'default'
    if (value === question.correctAnswer) return 'correct'
    if (value === selectedValue) return 'wrong'
    return 'default'
  }

  function getDotColor(i: number): string {
    const q   = exam.questions[i]
    const ans = answers.get(String(q._id))
    if (!ans) return i === idx ? 'var(--accent)' : 'var(--border)'
    if (ans.skipped) return SKIPPED_COLOR

    if (q.type === 'open') {
      if (ans.selfRating === 'knew')    return scoreColor(100)
      if (ans.selfRating === 'partial') return scoreColor(50)
      if (ans.selfRating === 'missed')  return scoreColor(0)
      return 'var(--text-3)'
    }

    // Exam mode: don't leak correct/incorrect through the dots until completion
    if (mode === 'exam') return 'var(--text-3)'

    if (ans.isCorrect === true)  return scoreColor(100)
    if (ans.isCorrect === false) return scoreColor(0)
    return 'var(--text-3)'
  }

  const selfRatingOptions = [
    { id: 'knew'    as SelfRating, label: 'Knew it',   color: scoreColor(100) },
    { id: 'partial' as SelfRating, label: 'Partial',   color: scoreColor(55)  },
    { id: 'missed'  as SelfRating, label: 'Missed it', color: scoreColor(0)   },
  ]

  return (
    <div className="flex flex-col h-full px-5 pt-5 pb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-[14px] shrink-0">
        <div className="flex items-center gap-[10px]">
          <Button variant="ghost" size="sm" onClick={handleExit} title="Save progress and exit">
            ← Exit
          </Button>
          <span className="text-[13px] font-bold font-display text-text">
            {idx + 1}<span className="text-text-3 font-normal">/{total}</span>
          </span>
          <Badge>{mode}</Badge>
        </div>
        <div className="flex items-center gap-[10px]">
          <span className="text-xs text-text-3 font-display">{fmtTime(elapsed)}</span>
          {allAnswered && (
            <Button variant="primary" size="sm" onClick={completeExam} disabled={submitting}>
              Finish
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-[14px] shrink-0">
        <ProgressBar value={progress} height={3} />
      </div>

      {/* Nav dots */}
      <div className="flex gap-1 flex-wrap mb-5 shrink-0">
        {exam.questions.map((q, i) => (
          <button
            key={String(q._id)}
            onClick={() => setIdx(i)}
            title={`Question ${i + 1}`}
            className="h-2 rounded border-none p-0 cursor-pointer transition-[width,background] duration-[180ms]"
            style={{ width: i === idx ? '18px' : '8px', background: getDotColor(i) }}
          />
        ))}
      </div>

      {/* Question body */}
      <div className="flex-1 overflow-y-auto mb-4">
        <div className="flex gap-[6px] mb-3">
          <Badge>{question.type.replace('_', '/')}</Badge>
          <Badge>{question.difficulty}</Badge>
          {existingAnswer?.skipped && <Badge color={SKIPPED_COLOR}>skipped</Badge>}
        </div>
        <p className="text-base font-semibold text-text leading-[1.6] mb-5">{question.text}</p>

        {/* Multiple / True-False options */}
        {isMultiOrTF && (
          <div className="flex flex-col gap-2">
            {options.map(opt => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                text={opt.text}
                state={getOptionState(opt.value)}
                onClick={(!revealed && !isAnswered) ? () => handleSelectOption(opt.value) : undefined}
              />
            ))}
          </div>
        )}

        {/* Open question */}
        {isOpen && (
          <div>
            {!revealed && (
              <Button variant="secondary" size="md" onClick={() => setRevealed(true)} className="w-full mb-4">
                Show answer
              </Button>
            )}

            {revealed && question.explanation && (
              <Card className="p-4 mb-4">
                <p className="text-[11px] font-bold text-text-3 uppercase tracking-[0.08em] mb-2">Expected answer</p>
                <p className="text-sm text-text leading-[1.6] m-0">{question.explanation}</p>
              </Card>
            )}

            {revealed && !isAnswered && (
              <div>
                <p className="text-[13px] text-text-2 mb-[10px] font-medium">How did you do?</p>
                <ToggleGroup
                  options={selfRatingOptions}
                  value={selfRating ?? ''}
                  onChange={v => handleSelfRate(v as SelfRating)}
                />
              </div>
            )}

            {isAnswered && existingAnswer?.selfRating && (
              <Card className="px-[14px] py-3 rounded-btn">
                <span className="text-xs text-text-3">Rated: </span>
                <span className="text-xs font-semibold text-text capitalize">{existingAnswer.selfRating}</span>
              </Card>
            )}
          </div>
        )}

        {/* Practice mode: explanation after answering */}
        {revealed && isAnswered && mode === 'practice' && question.explanation && isMultiOrTF && (
          <Card className="mt-[14px] p-[14px_16px]">
            <p className="text-[11px] font-bold text-text-3 uppercase tracking-[0.08em] mb-[6px]">Explanation</p>
            <p className="text-sm text-text leading-[1.6] m-0">{question.explanation}</p>
          </Card>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-[13px] m-0 mb-2 shrink-0" style={{ color: scoreColor(0) }}>{error}</p>
      )}

      {/* Navigation */}
      <div className="flex gap-2 shrink-0">
        <Button variant="ghost" size="md" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>
          ←
        </Button>
        {!isAnswered && !existingAnswer?.skipped && (
          <Button variant="ghost" size="md" onClick={handleSkip} disabled={submitting}>
            Skip
          </Button>
        )}
        <Button
          variant="primary"
          size="md"
          onClick={handleNext}
          disabled={!canProceed || submitting}
          className="flex-1"
        >
          {submitting ? '…' : isLast ? 'Finish exam' : 'Next →'}
        </Button>
      </div>
    </div>
  )
}
