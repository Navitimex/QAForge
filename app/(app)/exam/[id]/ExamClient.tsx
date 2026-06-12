'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, ChevronLeft, ChevronRight, Mic, Code2, Eye } from 'lucide-react'
import OptionCard from '@/components/ui/OptionCard'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import ToggleGroup from '@/components/ui/ToggleGroup'
import { cn } from '@/lib/cn'
import { fmtTime, scoreColor, scoreColorDim } from '@/lib/utils'
import type { IExamFull, IExamAnswer, IQuestion, ApiResponse } from '@/types'

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
function displayOptions(q: IQuestion) {
  if (q.type === 'true_false') {
    return [
      { value: 'true',  label: 'T', text: 'True'  },
      { value: 'false', label: 'F', text: 'False' },
    ]
  }
  return (q.options ?? []).map(o => ({ value: o.label, label: o.label, text: o.text }))
}

/** Monospace code block used for starter snippets and solutions. */
function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] font-bold text-text-3 uppercase tracking-[0.08em] mb-[6px]">{label}</p>
      <pre className="bg-surface border border-border rounded-lg p-3 overflow-x-auto text-[12.5px] leading-[1.6] text-text font-mono whitespace-pre m-0">
        {code}
      </pre>
    </div>
  )
}

const TYPE_LABEL: Record<string, string> = {
  multiple:   'multiple',
  true_false: 'true/false',
  open:       'open',
  code:       'code',
}

export default function ExamClient({ exam }: Props) {
  const router = useRouter()
  const mode = exam.mode

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
  const [exiting, setExiting]             = useState(false)
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
      // Exam mode never reveals correct/wrong during the exam (open/code do
      // reveal their expected answer — that's required for self-rating).
      setRevealed(mode !== 'exam' || question.type === 'open' || question.type === 'code')
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
      if (!payload.skipped && mode !== 'exam') setRevealed(true)
      if (!payload.skipped && (question.type === 'open' || question.type === 'code')) setRevealed(true)
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
    const unanswered = total - answers.size
    if (unanswered > 0) {
      const sure = confirm(`You still have ${unanswered} unanswered question${unanswered !== 1 ? 's' : ''}. Finish anyway?`)
      if (!sure) return
    }
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
    // Progress is already saved answer-by-answer; pausing just marks the exam.
    setExiting(true)
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
  const isCode         = question.type === 'code'
  const isSelfRated    = isOpen || isCode
  const isMultiOrTF    = !isSelfRated
  const isLast         = idx === total - 1
  const allAnswered    = answers.size === total
  const canProceed     = existingAnswer
    ? (existingAnswer.skipped || !isSelfRated || existingAnswer.selfRating != null || selfRating != null)
    : false

  const options = displayOptions(question)

  function getOptionState(value: string): 'default' | 'selected' | 'correct' | 'wrong' {
    if (!revealed || !isAnswered) return value === selectedValue ? 'selected' : 'default'
    if (value === question.correctAnswer) return 'correct'
    if (value === selectedValue) return 'wrong'
    return 'default'
  }

  /** Visual state of a question pill in the navigator. */
  function navStyle(i: number): React.CSSProperties {
    const q   = exam.questions[i]
    const ans = answers.get(String(q._id))
    const current = i === idx

    const base: React.CSSProperties = current
      ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
      : { background: 'transparent', color: 'var(--text-3)', borderColor: 'var(--border)' }

    if (!ans) return base
    if (current) return base

    if (ans.skipped) {
      return { background: `${SKIPPED_COLOR}1f`, color: SKIPPED_COLOR, borderColor: `${SKIPPED_COLOR}55` }
    }

    if (q.type === 'open' || q.type === 'code') {
      const p = ans.selfRating === 'knew' ? 100 : ans.selfRating === 'partial' ? 50 : ans.selfRating === 'missed' ? 0 : null
      if (p === null) return { background: 'var(--card)', color: 'var(--text-2)', borderColor: 'var(--border)' }
      return { background: scoreColorDim(p), color: scoreColor(p), borderColor: 'transparent' }
    }

    // Exam mode: answered but result hidden until completion
    if (mode === 'exam') {
      return { background: 'var(--card)', color: 'var(--text-2)', borderColor: 'var(--border)' }
    }

    if (ans.isCorrect === true)  return { background: scoreColorDim(100), color: scoreColor(100), borderColor: 'transparent' }
    if (ans.isCorrect === false) return { background: scoreColorDim(0),   color: scoreColor(0),   borderColor: 'transparent' }
    return { background: 'var(--card)', color: 'var(--text-2)', borderColor: 'var(--border)' }
  }

  const selfRatingOptions = [
    { id: 'knew'    as SelfRating, label: 'Knew it',   color: scoreColor(100) },
    { id: 'partial' as SelfRating, label: 'Partial',   color: scoreColor(55)  },
    { id: 'missed'  as SelfRating, label: 'Missed it', color: scoreColor(0)   },
  ]

  const revealLabel = isCode ? 'Show solution' : mode === 'interview' ? 'Show expected answer' : 'Show answer'

  return (
    <div className="flex flex-col h-full max-w-[760px] mx-auto w-full px-5 pt-4 pb-5">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-3 shrink-0">
        <Button variant="ghost" size="sm" onClick={handleExit} disabled={exiting} title="Your progress is saved — you can resume from History">
          <LogOut size={13} className="rotate-180" />
          {exiting ? 'Saving…' : 'Exit'}
        </Button>

        <div className="flex items-center gap-2">
          <Badge>{mode}</Badge>
          <span className="text-[13px] font-bold font-display text-text">
            {idx + 1}<span className="text-text-3 font-normal">/{total}</span>
          </span>
        </div>

        <div className="flex items-center gap-[10px]">
          <span className="text-xs text-text-3 font-display min-w-[38px] text-right">{fmtTime(elapsed)}</span>
          {allAnswered && (
            <Button variant="green" size="sm" onClick={completeExam} disabled={submitting}>
              Finish
            </Button>
          )}
        </div>
      </div>

      {/* ── Progress ───────────────────────────────────────────────────── */}
      <div className="mb-4 shrink-0">
        <ProgressBar value={progress} height={3} />
        <div className="flex justify-between mt-[6px]">
          <span className="text-[11px] text-text-3">{answers.size} of {total} answered</span>
          <span className="text-[11px] text-text-3">{progress}%</span>
        </div>
      </div>

      {/* ── Question navigator ─────────────────────────────────────────── */}
      <div className="flex gap-[6px] flex-wrap mb-5 shrink-0">
        {exam.questions.map((q, i) => (
          <button
            key={String(q._id)}
            onClick={() => setIdx(i)}
            title={`Question ${i + 1}`}
            className={cn(
              'w-8 h-8 rounded-lg border text-xs font-bold font-display cursor-pointer',
              'flex items-center justify-center transition-all duration-[140ms] p-0',
              i === idx && 'scale-110 shadow-[0_2px_8px_rgba(0,0,0,0.25)]',
            )}
            style={navStyle(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* ── Question body ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto mb-4 min-h-0">
        <div className="flex gap-[6px] mb-3 items-center">
          <Badge>{TYPE_LABEL[question.type] ?? question.type}</Badge>
          <Badge>{question.difficulty}</Badge>
          {existingAnswer?.skipped && <Badge color={SKIPPED_COLOR}>skipped</Badge>}
        </div>

        <p className="text-[17px] font-semibold text-text leading-[1.6] mb-5 [text-wrap:pretty]">{question.text}</p>

        {/* Interview mode hint */}
        {mode === 'interview' && !revealed && (
          <div className="flex items-center gap-2 text-[13px] text-text-2 bg-surface border border-border rounded-lg px-3 py-[10px] mb-4">
            <Mic size={14} className="shrink-0 text-accent" />
            Answer out loud as if you were in a real interview, then reveal the expected answer.
          </div>
        )}

        {/* Code exercise: starter snippet */}
        {isCode && question.code && (
          <CodeBlock label="Exercise code" code={question.code} />
        )}

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

        {/* Open / Code reveal flow */}
        {isSelfRated && (
          <div>
            {!revealed && (
              <Button variant="secondary" size="md" onClick={() => setRevealed(true)} className="w-full mb-4">
                {isCode ? <Code2 size={14} /> : <Eye size={14} />}
                {revealLabel}
              </Button>
            )}

            {revealed && isCode && question.solutionCode && (
              <CodeBlock label="Solution" code={question.solutionCode} />
            )}

            {revealed && question.explanation && (
              <Card className="p-4 mb-4">
                <p className="text-[11px] font-bold text-text-3 uppercase tracking-[0.08em] mb-2">
                  {isCode ? 'How it works' : 'Expected answer'}
                </p>
                <p className="text-sm text-text leading-[1.7] m-0 whitespace-pre-line">{question.explanation}</p>
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
              <Card className="px-[14px] py-3 rounded-btn inline-flex items-center gap-2">
                <span className="text-xs text-text-3">Self-rated:</span>
                <span
                  className="text-xs font-semibold capitalize"
                  style={{ color: scoreColor(existingAnswer.selfRating === 'knew' ? 100 : existingAnswer.selfRating === 'partial' ? 50 : 0) }}
                >
                  {existingAnswer.selfRating}
                </span>
              </Card>
            )}
          </div>
        )}

        {/* Practice mode: explanation after answering */}
        {revealed && isAnswered && mode !== 'exam' && question.explanation && isMultiOrTF && (
          <Card className="mt-[14px] p-[14px_16px]">
            <p className="text-[11px] font-bold text-text-3 uppercase tracking-[0.08em] mb-[6px]">Explanation</p>
            <p className="text-sm text-text leading-[1.7] m-0 whitespace-pre-line">{question.explanation}</p>
          </Card>
        )}
      </div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <p className="text-[13px] m-0 mb-2 shrink-0" style={{ color: scoreColor(0) }}>{error}</p>
      )}

      {/* ── Navigation footer ──────────────────────────────────────────── */}
      <div className="flex gap-2 shrink-0">
        <Button variant="ghost" size="md" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} title="Previous question">
          <ChevronLeft size={15} />
        </Button>
        {!isAnswered && (
          <Button variant="ghost" size="md" onClick={handleSkip} disabled={submitting}>
            Skip
          </Button>
        )}
        <Button
          variant={isLast ? 'green' : 'primary'}
          size="md"
          onClick={handleNext}
          disabled={!canProceed || submitting}
          className="flex-1"
        >
          {submitting ? '…' : isLast ? 'Finish exam' : <>Next <ChevronRight size={15} /></>}
        </Button>
      </div>
    </div>
  )
}
