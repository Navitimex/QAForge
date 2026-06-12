'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, GraduationCap, Mic, Code2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Button from '@/components/ui/Button'
import SectionLabel from '@/components/ui/SectionLabel'
import Chip from '@/components/ui/Chip'
import ToggleGroup from '@/components/ui/ToggleGroup'
import { cn } from '@/lib/cn'
import type { ITopic, ApiResponse } from '@/types'

const DIFFICULTIES = ['easy', 'medium', 'hard', 'mixed'] as const
const COUNTS       = [5, 10, 15, 20, 30] as const

type Difficulty = typeof DIFFICULTIES[number]
type Mode       = 'practice' | 'exam' | 'interview' | 'code'

interface ModeOption {
  id: Mode
  label: string
  description: string
  icon: LucideIcon
}

const MODES: ModeOption[] = [
  { id: 'practice',  label: 'Practice',  description: 'Instant feedback after each answer',           icon: Zap },
  { id: 'exam',      label: 'Exam',      description: 'Answers hidden until you finish',              icon: GraduationCap },
  { id: 'interview', label: 'Interview', description: 'Answer out loud, then reveal & self-rate',     icon: Mic },
  { id: 'code',      label: 'Code',      description: 'Coding exercises with a hidden solution',      icon: Code2 },
]

interface Props {
  topics: ITopic[]
}

export default function NewExamClient({ topics }: Props) {
  const router = useRouter()
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [difficulty, setDifficulty]         = useState<Difficulty>('mixed')
  const [mode, setMode]                     = useState<Mode>('practice')
  const [count, setCount]                   = useState(10)
  const [available, setAvailable]           = useState<number | null>(null)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')

  function toggleTopic(id: string) {
    setSelectedTopics(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  function toggleAll() {
    setSelectedTopics(p => p.length === topics.length ? [] : topics.map(t => String(t._id)))
  }

  // Live availability for the current selection
  useEffect(() => {
    if (selectedTopics.length === 0) { setAvailable(null); return }
    let cancelled = false
    const params = new URLSearchParams({
      topicIds: selectedTopics.join(','),
      difficulty,
      mode,
    })
    fetch(`/api/questions/availability?${params}`)
      .then(r => r.json())
      .then((json: ApiResponse<{ count: number }>) => {
        if (!cancelled && json.success) setAvailable(json.data.count)
      })
      .catch(() => { if (!cancelled) setAvailable(null) })
    return () => { cancelled = true }
  }, [selectedTopics, difficulty, mode])

  const effectiveCount = available !== null ? Math.min(count, available) : count
  const noQuestions    = available === 0

  async function handleCreate() {
    if (selectedTopics.length === 0) { setError('Select at least one topic'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicIds: selectedTopics, difficulty, mode, size: count }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to create exam')
      router.push(`/exam/${json.data.examId}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
      setLoading(false)
    }
  }

  return (
    <div className="px-6 py-7 max-w-[620px] mx-auto w-full">
      <div className="mb-7">
        <h1 className="text-[22px] font-bold font-display text-text mb-1 tracking-[-0.02em]">New Exam</h1>
        <p className="text-sm text-text-3">Configure and start a study session.</p>
      </div>

      {/* Mode */}
      <div className="mb-6">
        <SectionLabel>Mode</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map(({ id, label, description, icon: Icon }) => {
            const active = mode === id
            return (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={cn(
                  'text-left p-[12px_14px] rounded-xl border cursor-pointer font-[inherit]',
                  'transition-all duration-[120ms]',
                  active
                    ? 'border-accent bg-accent/[0.08]'
                    : 'border-border bg-card',
                )}
              >
                <div className="flex items-center gap-[7px] mb-1">
                  <Icon size={14} className={active ? 'text-accent' : 'text-text-3'} />
                  <span className={cn('text-[13px] font-semibold', active ? 'text-accent' : 'text-text')}>{label}</span>
                </div>
                <p className="text-[11px] text-text-3 leading-[1.45] m-0">{description}</p>
              </button>
            )
          })}
        </div>
        {mode === 'code' && (
          <p className="text-xs text-text-3 mt-2">
            Code exercises are available for topics like Java, Playwright, Postman and SQL.
          </p>
        )}
      </div>

      {/* Topics */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <SectionLabel className="mb-0">Topics</SectionLabel>
          <button
            onClick={toggleAll}
            className="text-[11px] text-accent bg-transparent border-none cursor-pointer font-[inherit] font-semibold"
          >
            {selectedTopics.length === topics.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {topics.map(topic => (
            <Chip
              key={String(topic._id)}
              label={topic.name}
              selected={selectedTopics.includes(String(topic._id))}
              onClick={() => toggleTopic(String(topic._id))}
            />
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-6">
        <SectionLabel>Difficulty</SectionLabel>
        <ToggleGroup
          options={DIFFICULTIES.map(d => ({ id: d, label: d[0].toUpperCase() + d.slice(1) }))}
          value={difficulty}
          onChange={v => setDifficulty(v as Difficulty)}
        />
      </div>

      {/* Question count */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <SectionLabel className="mb-0">Questions</SectionLabel>
          {available !== null && (
            <span
              className="text-[11px] font-semibold"
              style={{ color: noQuestions ? 'hsl(0, 75%, 57%)' : 'var(--text-3)' }}
            >
              {available} available
            </span>
          )}
        </div>
        <ToggleGroup
          options={COUNTS.map(n => ({
            id: String(n),
            label: String(n),
            disabled: available !== null && available > 0 && n > available,
          }))}
          value={String(effectiveCount === count ? count : effectiveCount)}
          onChange={v => setCount(Number(v))}
        />
        {available !== null && available > 0 && available < count && (
          <p className="text-xs text-text-3 mt-2">
            Only {available} question{available !== 1 ? 's' : ''} match this selection — the exam will use all of them.
          </p>
        )}
      </div>

      {error && <p className="text-[13px] text-[hsl(0,80%,60%)] mb-[14px]">{error}</p>}

      <Button
        variant="primary"
        size="lg"
        onClick={handleCreate}
        disabled={loading || selectedTopics.length === 0 || noQuestions}
      >
        {loading ? 'Creating…' : noQuestions ? 'No questions for this selection' : 'Start Exam'}
      </Button>
    </div>
  )
}
