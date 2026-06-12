/**
 * lib/exam-weights.ts
 *
 * Weighted random sampling for exam question selection.
 * Implements: peso = 1 + (1 - accuracy) * 2
 *
 *   Accuracy 0%   → weight 3.0  (3× more likely to appear)
 *   Accuracy 50%  → weight 2.0
 *   Accuracy 100% → weight 1.0  (minimum)
 *   Never answered → weight 2.0 (neutral-high, prioritized over known questions)
 */

import type { IQuestion, IUserStats } from '@/types'

/**
 * Calculates the selection weight for a question based on the user's
 * accuracy in the question's topic.
 */
function questionWeight(topicId: string, statsMap: Map<string, number>): number {
  const accuracy = statsMap.get(topicId) // undefined if never answered
  if (accuracy === undefined) return 2.0  // neutral-high for new topics
  return 1 + (1 - accuracy) * 2
}

/**
 * Builds a Map<topicId, accuracy> from UserStats documents.
 * accuracy is a 0–1 fraction (not percentage).
 */
export function buildAccuracyMap(stats: IUserStats[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const s of stats) {
    if (s.totalAnswered > 0) {
      map.set(s.topicId, s.totalCorrect / s.totalAnswered)
    }
  }
  return map
}

/**
 * Weighted random sampling WITHOUT replacement.
 * Returns `count` questions selected proportionally to their weights.
 *
 * If fewer questions are available than `count`, returns all of them.
 */
export function weightedSample(
  questions: IQuestion[],
  statsMap: Map<string, number>,
  count: number
): IQuestion[] {
  if (questions.length === 0) return []
  if (questions.length <= count) return shuffle([...questions])

  const pool = [...questions]
  const selected: IQuestion[] = []

  for (let i = 0; i < count; i++) {
    if (pool.length === 0) break

    // Calculate weights for remaining pool
    const weights = pool.map(q => questionWeight(q.topicId, statsMap))
    const totalWeight = weights.reduce((a, b) => a + b, 0)

    // Pick a random point in the cumulative weight space
    let rand = Math.random() * totalWeight
    let pickedIdx = 0

    for (let j = 0; j < weights.length; j++) {
      rand -= weights[j]
      if (rand <= 0) {
        pickedIdx = j
        break
      }
    }

    selected.push(pool[pickedIdx])
    pool.splice(pickedIdx, 1) // remove selected item (no replacement)
  }

  return selected
}

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
