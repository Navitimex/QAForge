'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import SectionLabel from '@/components/ui/SectionLabel'
import Chip from '@/components/ui/Chip'
import ToggleGroup from '@/components/ui/ToggleGroup'
import type { ITopic } from '@/types'

const DIFFICULTIES = ['easy', 'medium', 'hard', 'mixed'] as const
const MODES        = ['practice', 'exam'] as const
const COUNTS       = [5, 10, 15, 20, 30] as const

type Difficulty = typeof DIFFICULTIES[number]
type Mode       = typeof MODES[number]

interface Props {
  topics: ITopic[]
}

export default function NewExamClient({ topics }: Props) {
  const router = useRouter()
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [difficulty, setDifficulty]         = useState<Difficulty>('mixed')
  const [mode, setMode]                     = useState<Mode>('practice')
  const [count, setCount]                   = useState(10)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')

  function toggleTopic(id: string) {
    setSelectedTopics(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  function toggleAll() {
    setSelectedTopics(p => p.length === topics.length ? [] : topics.map(t => String(t._id)))
  }

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
    <div className="px-6 py-7 max-w-[600px] mx-auto w-full">
      <div className="mb-7">
        <h1 className="text-[22px] font-bold font-display text-text mb-1 tracking-[-0.02em]">New Exam</h1>
        <p className="text-sm text-text-3">Configure and start a practice session.</p>
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

      {/* Mode */}
      <div className="mb-6">
        <SectionLabel>Mode</SectionLabel>
        <ToggleGroup
          options={MODES.map(m => ({ id: m, label: m[0].toUpperCase() + m.slice(1) }))}
          value={mode}
          onChange={v => setMode(v as Mode)}
        />
        <p className="text-xs text-text-3 mt-2">
          {mode === 'practice' ? 'See correct answers immediately after each question.' : 'Answers revealed only after completing the exam.'}
        </p>
      </div>

      {/* Question count */}
      <div className="mb-8">
        <SectionLabel>Questions — {count}</SectionLabel>
        <ToggleGroup
          options={COUNTS.map(n => ({ id: String(n), label: String(n) }))}
          value={String(count)}
          onChange={v => setCount(Number(v))}
        />
      </div>

      {error && <p className="text-[13px] text-[hsl(0,80%,60%)] mb-[14px]">{error}</p>}

      <Button
        variant="primary"
        size="lg"
        onClick={handleCreate}
        disabled={loading || selectedTopics.length === 0}
      >
        {loading ? 'Creating…' : 'Start Exam'}
      </Button>
    </div>
  )
}
