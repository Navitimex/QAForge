import { describe, it, expect } from 'vitest'
import { evaluateAnswer, computeFinalScore, computeStatsDelta, isZeroDelta } from '@/lib/services/scoring-service'
import type { EvaluateAnswerInput } from '@/lib/services/scoring-service'

// ── evaluateAnswer ────────────────────────────────────────────────────────

describe('evaluateAnswer — skipped', () => {
  it('returns null when the question is skipped (no score impact)', () => {
    const input: EvaluateAnswerInput = {
      questionType:  'multiple',
      correctAnswer: 'A',
      skipped:       true,
    }
    expect(evaluateAnswer(input)).toBeNull()
  })

  it('treats skipped=true as null even if userAnswer is provided', () => {
    expect(evaluateAnswer({
      questionType:  'multiple',
      correctAnswer: 'A',
      userAnswer:    'A',
      skipped:       true,
    })).toBeNull()
  })
})

describe('evaluateAnswer — open questions (self-rated)', () => {
  const open: EvaluateAnswerInput = { questionType: 'open', correctAnswer: null }

  it('returns true for self-rating "knew"', () => {
    expect(evaluateAnswer({ ...open, selfRating: 'knew' })).toBe(true)
  })

  it('returns false for self-rating "missed"', () => {
    expect(evaluateAnswer({ ...open, selfRating: 'missed' })).toBe(false)
  })

  it('returns null for self-rating "partial" (no score impact)', () => {
    expect(evaluateAnswer({ ...open, selfRating: 'partial' })).toBeNull()
  })

  it('returns null when no rating has been given', () => {
    expect(evaluateAnswer({ ...open })).toBeNull()
  })
})

describe('evaluateAnswer — multiple choice', () => {
  const mc = (userAnswer: string | null) => evaluateAnswer({
    questionType:  'multiple',
    correctAnswer: 'B',
    userAnswer,
  })

  it('returns true when the answer matches correctAnswer', () => {
    expect(mc('B')).toBe(true)
  })

  it('returns false when the answer does not match', () => {
    expect(mc('A')).toBe(false)
    expect(mc('C')).toBe(false)
  })

  it('returns null when no answer has been provided', () => {
    expect(mc(null)).toBeNull()
    expect(mc(undefined as unknown as null)).toBeNull()
  })
})

describe('evaluateAnswer — true/false', () => {
  it('returns true when "true" matches correctAnswer "true"', () => {
    expect(evaluateAnswer({
      questionType:  'true_false',
      correctAnswer: 'true',
      userAnswer:    'true',
    })).toBe(true)
  })

  it('returns false when "false" does not match "true"', () => {
    expect(evaluateAnswer({
      questionType:  'true_false',
      correctAnswer: 'true',
      userAnswer:    'false',
    })).toBe(false)
  })
})

// ── computeFinalScore ─────────────────────────────────────────────────────

describe('computeFinalScore', () => {
  it('returns the raw correct count (not a percentage)', () => {
    expect(computeFinalScore(7, 10)).toBe(7)
  })

  it('returns null for an all-open exam (scorableCount === 0)', () => {
    expect(computeFinalScore(0, 0)).toBeNull()
  })

  it('handles a perfect score', () => {
    expect(computeFinalScore(10, 10)).toBe(10)
  })

  it('handles zero correct answers', () => {
    expect(computeFinalScore(0, 10)).toBe(0)
  })

  it('result feeds correctly into percentage formula used by pages', () => {
    // pages compute: pct = Math.round((score / scorableCount) * 100)
    const score = computeFinalScore(7, 10)!
    const pct   = Math.round((score / 10) * 100)
    expect(pct).toBe(70)
  })
})

// ── computeStatsDelta — re-answer safe UserStats updates ─────────────────

describe('computeStatsDelta', () => {
  it('first correct answer adds 1 answered + 1 correct', () => {
    expect(computeStatsDelta(null, { isCorrect: true, skipped: false }))
      .toEqual({ totalAnswered: 1, totalCorrect: 1, totalSkipped: 0 })
  })

  it('first wrong answer adds 1 answered only', () => {
    expect(computeStatsDelta(null, { isCorrect: false, skipped: false }))
      .toEqual({ totalAnswered: 1, totalCorrect: 0, totalSkipped: 0 })
  })

  it('first skip adds 1 skipped only', () => {
    expect(computeStatsDelta(null, { isCorrect: null, skipped: true }))
      .toEqual({ totalAnswered: 0, totalCorrect: 0, totalSkipped: 1 })
  })

  it('open question without selfRating contributes nothing', () => {
    expect(computeStatsDelta(null, { isCorrect: null, skipped: false }))
      .toEqual({ totalAnswered: 0, totalCorrect: 0, totalSkipped: 0 })
  })

  it('re-answering a skipped question converts skip → answered (no double count)', () => {
    expect(computeStatsDelta(
      { isCorrect: null, skipped: true },
      { isCorrect: true, skipped: false }
    )).toEqual({ totalAnswered: 1, totalCorrect: 1, totalSkipped: -1 })
  })

  it('changing a correct answer to wrong removes the correct count only', () => {
    expect(computeStatsDelta(
      { isCorrect: true, skipped: false },
      { isCorrect: false, skipped: false }
    )).toEqual({ totalAnswered: 0, totalCorrect: -1, totalSkipped: 0 })
  })

  it('re-submitting the same correct answer is a no-op', () => {
    const delta = computeStatsDelta(
      { isCorrect: true, skipped: false },
      { isCorrect: true, skipped: false }
    )
    expect(isZeroDelta(delta)).toBe(true)
  })

  it('rating a previously revealed open question adds the contribution once', () => {
    // First POST: revealed but unrated (isCorrect null) → nothing
    // Second POST: selfRating "knew" → isCorrect true
    expect(computeStatsDelta(
      { isCorrect: null, skipped: false },
      { isCorrect: true, skipped: false }
    )).toEqual({ totalAnswered: 1, totalCorrect: 1, totalSkipped: 0 })
  })
})

describe('isZeroDelta', () => {
  it('detects the zero delta', () => {
    expect(isZeroDelta({ totalAnswered: 0, totalCorrect: 0, totalSkipped: 0 })).toBe(true)
  })

  it('detects non-zero deltas', () => {
    expect(isZeroDelta({ totalAnswered: 0, totalCorrect: 0, totalSkipped: -1 })).toBe(false)
  })
})
