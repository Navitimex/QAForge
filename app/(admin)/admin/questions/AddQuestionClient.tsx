'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import SectionLabel from '@/components/ui/SectionLabel'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Tabs from '@/components/ui/Tabs'
import { scoreColor } from '@/lib/utils'
import type { ITopic } from '@/types'

const LABELS = ['A', 'B', 'C', 'D'] as const

const ManualSchema = z.object({
  topicId:       z.string().min(1, 'Topic required'),
  type:          z.enum(['multiple', 'true_false', 'open']),
  difficulty:    z.enum(['easy', 'medium', 'hard']),
  text:          z.string().min(10, 'Question too short'),
  explanation:   z.string().min(10, 'Explanation must be at least 10 characters'),
  optionA:       z.string().optional(),
  optionB:       z.string().optional(),
  optionC:       z.string().optional(),
  optionD:       z.string().optional(),
  correctAnswer: z.string().optional(),
})
type ManualForm = z.infer<typeof ManualSchema>

interface Props {
  topics: ITopic[]
}

const FORM_TABS = [
  { id: 'manual' as const,  label: 'Manual' },
  { id: 'import' as const,  label: 'Import' },
]

export default function AddQuestionClient({ topics }: Props) {
  const [tab, setTab]           = useState<'manual' | 'import'>('manual')
  const [success, setSuccess]   = useState('')
  const [error, setError]       = useState('')
  const [jsonText, setJsonText] = useState('')
  const [preview, setPreview]   = useState<unknown[] | null>(null)
  const [importing, setImporting]     = useState(false)
  const [importResult, setImportResult] = useState<{ inserted: number; errors: { index: number; reason: string }[] } | null>(null)

  const {
    register, handleSubmit, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm<ManualForm>({
    resolver: zodResolver(ManualSchema),
    defaultValues: { type: 'multiple', difficulty: 'medium' },
  })

  const type = watch('type')

  async function onManualSubmit(data: ManualForm) {
    setError('')
    setSuccess('')

    let options: { label: string; text: string }[] = []
    if (type === 'multiple') {
      options = [data.optionA, data.optionB, data.optionC, data.optionD]
        .map((text, i) => ({ label: LABELS[i], text: text ?? '' }))
        .filter(o => o.text)
    }
    // true_false stores no options — the exam UI renders fixed True/False buttons

    const body = {
      topicId:       data.topicId,
      type:          data.type,
      difficulty:    data.difficulty,
      text:          data.text,
      explanation:   data.explanation,
      options,
      correctAnswer: type === 'open' ? null : data.correctAnswer,
    }

    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Failed to create'); return }
    setSuccess('Question created!')
    reset()
  }

  function handleJsonChange(text: string) {
    setJsonText(text)
    setPreview(null)
    setImportResult(null)
    try {
      const parsed = JSON.parse(text)
      setPreview(Array.isArray(parsed) ? parsed : [parsed])
    } catch {}
  }

  async function handleImport() {
    if (!preview) return
    setImporting(true)
    setError('')
    // The API expects the raw JSON array as the request body
    const res = await fetch('/api/questions/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preview),
    })
    const json = await res.json()
    setImporting(false)
    if (!res.ok) { setError(json.error ?? 'Import failed'); return }
    setImportResult(json.data)
    setJsonText('')
    setPreview(null)
  }

  return (
    <div className="px-6 py-7 max-w-[680px] mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-[10px] mb-1">
          <h1 className="text-[22px] font-bold font-display text-text tracking-[-0.02em] m-0">
            Add Questions
          </h1>
          <Badge color="var(--accent)">Admin</Badge>
        </div>
        <p className="text-sm text-text-3">Create questions manually or import from JSON.</p>
      </div>

      {/* Tab switcher */}
      <Tabs
        tabs={FORM_TABS}
        active={tab}
        onChange={t => { setTab(t); setError(''); setSuccess('') }}
        className="mb-6"
      />

      {/* Manual form */}
      {tab === 'manual' && (
        <form onSubmit={handleSubmit(onManualSubmit)} className="flex flex-col gap-[18px]">
          {/* Topic */}
          <div>
            <SectionLabel>Topic</SectionLabel>
            <Select {...register('topicId')}>
              <option value="">Select topic…</option>
              {topics.map(t => (
                <option key={String(t._id)} value={String(t._id)}>{t.name}</option>
              ))}
            </Select>
            {errors.topicId && <FieldError msg={errors.topicId.message!} />}
          </div>

          {/* Type + Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <SectionLabel>Type</SectionLabel>
              <Select {...register('type')}>
                <option value="multiple">Multiple choice</option>
                <option value="true_false">True / False</option>
                <option value="open">Open</option>
              </Select>
            </div>
            <div>
              <SectionLabel>Difficulty</SectionLabel>
              <Select {...register('difficulty')}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            </div>
          </div>

          {/* Question text */}
          <div>
            <SectionLabel>Question</SectionLabel>
            <Textarea {...register('text')} rows={3} placeholder="Enter question text…" />
            {errors.text && <FieldError msg={errors.text.message!} />}
          </div>

          {/* Options for multiple choice */}
          {type === 'multiple' && (
            <div>
              <SectionLabel>Options</SectionLabel>
              <div className="flex flex-col gap-2">
                {(['A', 'B', 'C', 'D'] as const).map((label) => (
                  <div key={label} className="flex gap-2 items-center">
                    <span className="text-xs font-bold text-text-3 w-[18px] text-center">{label}</span>
                    <Input
                      {...register(`option${label}` as 'optionA' | 'optionB' | 'optionC' | 'optionD')}
                      placeholder={`Option ${label}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-[10px]">
                <SectionLabel>Correct answer</SectionLabel>
                <Select {...register('correctAnswer')}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </Select>
              </div>
            </div>
          )}

          {/* True/False correct answer */}
          {type === 'true_false' && (
            <div>
              <SectionLabel>Correct answer</SectionLabel>
              <Select {...register('correctAnswer')}>
                <option value="true">True</option>
                <option value="false">False</option>
              </Select>
            </div>
          )}

          {/* Explanation */}
          <div>
            <SectionLabel>Explanation</SectionLabel>
            <Textarea {...register('explanation')} rows={3} placeholder="Explain why the answer is correct…" />
            {errors.explanation && <FieldError msg={errors.explanation.message!} />}
          </div>

          {error   && <p className="text-[13px] text-[hsl(0,80%,60%)] m-0">{error}</p>}
          {success && <p className="text-[13px] m-0" style={{ color: scoreColor(100) }}>{success}</p>}

          <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Create question'}
          </Button>
        </form>
      )}

      {/* Import JSON */}
      {tab === 'import' && (
        <div className="flex flex-col gap-4">
          <div>
            <SectionLabel>JSON array of questions</SectionLabel>
            <Textarea
              value={jsonText}
              onChange={e => handleJsonChange(e.target.value)}
              rows={12}
              placeholder={`[\n  {\n    "topicSlug": "playwright",\n    "type": "multiple",\n    "difficulty": "medium",\n    "text": "What does page.locator() return?",\n    "options": [\n      { "label": "A", "text": "An ElementHandle" },\n      { "label": "B", "text": "A Locator" },\n      { "label": "C", "text": "A Promise<Element>" },\n      { "label": "D", "text": "A CSS string" }\n    ],\n    "correctAnswer": "B",\n    "explanation": "page.locator() returns a lazy Locator object."\n  }\n]`}
              className="font-mono text-xs"
            />
          </div>

          {/* Preview */}
          {preview && (
            <Card className="p-[14px_16px] rounded-btn">
              <p className="text-xs font-semibold text-text-3 mb-2">
                Preview: {preview.length} question{preview.length !== 1 ? 's' : ''} detected
              </p>
              <div className="flex flex-col gap-[6px] max-h-[200px] overflow-y-auto">
                {preview.slice(0, 10).map((q: unknown, i: number) => (
                  <div key={i} className="text-xs text-text-2 leading-[1.5]">
                    {i + 1}. {typeof q === 'object' && q !== null && 'text' in q ? String((q as { text: string }).text).slice(0, 80) : '—'}
                  </div>
                ))}
                {preview.length > 10 && (
                  <div className="text-[11px] text-text-3">…and {preview.length - 10} more</div>
                )}
              </div>
            </Card>
          )}

          {importResult && (
            <Card className="p-[14px_16px] rounded-btn">
              <p className="text-[13px] font-semibold mb-1" style={{ color: scoreColor(100) }}>
                Imported {importResult.inserted} questions
              </p>
              {importResult.errors.length > 0 && (
                <div className="text-xs" style={{ color: scoreColor(0) }}>
                  <p className="m-0 mb-1">{importResult.errors.length} failed:</p>
                  {importResult.errors.slice(0, 5).map(err => (
                    <p key={err.index} className="m-0">#{err.index + 1}: {err.reason}</p>
                  ))}
                  {importResult.errors.length > 5 && (
                    <p className="m-0">…and {importResult.errors.length - 5} more</p>
                  )}
                </div>
              )}
            </Card>
          )}

          {error && <p className="text-[13px] text-[hsl(0,80%,60%)]">{error}</p>}

          <Button
            variant="primary"
            size="md"
            onClick={handleImport}
            disabled={!preview || importing}
          >
            {importing ? 'Importing…' : `Import ${preview?.length ?? 0} questions`}
          </Button>
        </div>
      )}
    </div>
  )
}

function FieldError({ msg }: { msg: string }) {
  return <p className="text-xs text-[hsl(0,80%,60%)] mt-1 mb-0">{msg}</p>
}
