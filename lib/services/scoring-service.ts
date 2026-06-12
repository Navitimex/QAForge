/**
 * lib/services/scoring-service.ts
 *
 * Pure business-logic functions for answer evaluation and exam scoring.
 * No database or HTTP dependencies — fully unit-testable.
 */

import type { QuestionType, SelfRating } from '@/types'

export interface EvaluateAnswerInput {
  questionType:  QuestionType
  correctAnswer: string | null
  userAnswer?:   string | null
  selfRating?:   SelfRating | null
  skipped?:      boolean
}

/**
 * Determines `isCorrect` for a submitted answer.
 *
 * Rules:
 *   - skipped              → null  (no score impact)
 *   - open + knew          → true
 *   - open + missed        → false
 *   - open + partial       → null  (acknowledged, no score impact)
 *   - open + no rating     → null
 *   - multiple / true_false → compare userAnswer to correctAnswer; null if no answer
 */
export function evaluateAnswer(input: EvaluateAnswerInput): boolean | null {
  const { questionType, correctAnswer, userAnswer, selfRating, skipped } = input

  if (skipped) return null

  if (questionType === 'open') {
    if (selfRating === 'knew')   return true
    if (selfRating === 'missed') return false
    return null // partial or not yet rated
  }

  // multiple | true_false
  return userAnswer != null ? userAnswer === correctAnswer : null
}

/**
 * Calculates the raw correct-answer count to store on the Exam document.
 * Returns null when there are no scorable questions (all-open exam).
 *
 * NOTE: pages compute the display percentage as Math.round((score / scorableCount) * 100).
 * Store raw count here; never store the pre-computed percentage.
 */
export function computeFinalScore(
  correctCount: number,
  scorableCount: number
): number | null {
  if (scorableCount === 0) return null
  return correctCount
}

// ── UserStats delta (re-answer safe) ──────────────────────────────────────

export interface AnswerSnapshot {
  isCorrect: boolean | null
  skipped: boolean
}

export interface StatsDelta {
  totalAnswered: number
  totalCorrect: number
  totalSkipped: number
}

/**
 * What a single answer contributes to UserStats counters.
 *   - skipped                → counts as 1 skipped
 *   - isCorrect true/false   → counts as 1 answered (+1 correct if true)
 *   - isCorrect null         → contributes nothing (open question pending rating / partial)
 */
function contribution(a: AnswerSnapshot | null): StatsDelta {
  if (!a) return { totalAnswered: 0, totalCorrect: 0, totalSkipped: 0 }
  if (a.skipped) return { totalAnswered: 0, totalCorrect: 0, totalSkipped: 1 }
  if (a.isCorrect === null) return { totalAnswered: 0, totalCorrect: 0, totalSkipped: 0 }
  return { totalAnswered: 1, totalCorrect: a.isCorrect ? 1 : 0, totalSkipped: 0 }
}

/**
 * Incremental UserStats update when an answer is created OR re-submitted.
 * Subtracts the previous answer's contribution and adds the new one, so
 * re-answering (e.g. a skipped question, or changing a practice answer)
 * never double-counts.
 */
export function computeStatsDelta(
  prev: AnswerSnapshot | null,
  next: AnswerSnapshot
): StatsDelta {
  const p = contribution(prev)
  const n = contribution(next)
  return {
    totalAnswered: n.totalAnswered - p.totalAnswered,
    totalCorrect:  n.totalCorrect  - p.totalCorrect,
    totalSkipped:  n.totalSkipped  - p.totalSkipped,
  }
}

/** True when a stats delta is a no-op (avoids a pointless DB write). */
export function isZeroDelta(d: StatsDelta): boolean {
  return d.totalAnswered === 0 && d.totalCorrect === 0 && d.totalSkipped === 0
}
