import { describe, it, expect } from 'vitest'
import { buildAccuracyMap, weightedSample } from '@/lib/exam-weights'
import type { IQuestion, IUserStats } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────

function makeQ(id: string, topicId: string, type = 'multiple'): IQuestion {
  return {
    _id: id,
    topicId,
    text:          'What is this?',
    type:          type as IQuestion['type'],
    difficulty:    'easy',
    options:       [],
    correctAnswer: 'A',
    explanation:   '',
    tags:          [],
    version:       null,
    isActive:      true,
    createdAt:     new Date(),
    updatedAt:     new Date(),
  }
}

function makeStats(
  topicId: string,
  totalAnswered: number,
  totalCorrect: number
): IUserStats {
  return {
    _id:           '1',
    userId:        'u1',
    topicId,
    totalAnswered,
    totalCorrect,
    totalSkipped:  0,
    lastAttemptAt: new Date(),
  }
}

// ── buildAccuracyMap ──────────────────────────────────────────────────────

describe('buildAccuracyMap', () => {
  it('maps topicId to 0–1 accuracy fraction', () => {
    const map = buildAccuracyMap([makeStats('t1', 10, 7)])
    expect(map.get('t1')).toBeCloseTo(0.7)
  })

  it('skips topics with zero answers (avoids NaN)', () => {
    const map = buildAccuracyMap([makeStats('t1', 0, 0)])
    expect(map.has('t1')).toBe(false)
  })

  it('handles multiple topics', () => {
    const map = buildAccuracyMap([
      makeStats('t1', 10, 10),
      makeStats('t2', 10, 5),
    ])
    expect(map.get('t1')).toBeCloseTo(1.0)
    expect(map.get('t2')).toBeCloseTo(0.5)
  })

  it('returns empty map for empty stats', () => {
    expect(buildAccuracyMap([])).toEqual(new Map())
  })
})

// ── weightedSample ────────────────────────────────────────────────────────

describe('weightedSample', () => {
  const pool20 = Array.from({ length: 20 }, (_, i) => makeQ(String(i), 't1'))

  it('returns exactly `count` questions', () => {
    const result = weightedSample(pool20, new Map(), 5)
    expect(result).toHaveLength(5)
  })

  it('returns no duplicates', () => {
    const result = weightedSample(pool20, new Map(), 10)
    const ids = result.map(q => q._id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('returns all when pool is smaller than count', () => {
    const small = pool20.slice(0, 3)
    const result = weightedSample(small, new Map(), 10)
    expect(result).toHaveLength(3)
  })

  it('returns empty array for empty pool', () => {
    expect(weightedSample([], new Map(), 5)).toEqual([])
  })

  it('respects weights — weak topic should appear proportionally more', () => {
    // 10 questions from 'weak' (accuracy 0 → weight 3) and 10 from 'strong' (accuracy 1 → weight 1)
    const weakQs   = Array.from({ length: 10 }, (_, i) => makeQ(`w${i}`, 'weak'))
    const strongQs = Array.from({ length: 10 }, (_, i) => makeQ(`s${i}`, 'strong'))
    const statsMap = buildAccuracyMap([
      makeStats('weak',   10, 0),   // accuracy 0 → weight 3
      makeStats('strong', 10, 10),  // accuracy 1 → weight 1
    ])

    // Run 200 trials; weak should win >50% of slots
    let weakCount = 0
    const TRIALS = 200
    for (let t = 0; t < TRIALS; t++) {
      const sample = weightedSample([...weakQs, ...strongQs], statsMap, 4)
      weakCount += sample.filter(q => q.topicId === 'weak').length
    }
    const weakFraction = weakCount / (TRIALS * 4)
    // Theoretical expectation: 3/(3+1) = 0.75 for weak questions
    expect(weakFraction).toBeGreaterThan(0.55)
  })
})
