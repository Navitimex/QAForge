/**
 * lib/services/exam-service.ts
 *
 * Pure business-logic functions for exam creation.
 * No database or HTTP dependencies — fully unit-testable.
 */

import type { ExamDifficulty, ExamMode } from '@/types'

/** Question types that count toward the numeric score. */
export const SCORABLE_TYPES = ['multiple', 'true_false'] as const

/**
 * Builds a MongoDB query filter for question selection.
 *
 * - difficulty 'mixed' → all difficulty levels
 * - mode 'interview'   → open questions only (spoken-answer practice)
 * - mode 'code'        → coding exercises only
 * - mode exam/practice → regular question types (code exercises excluded)
 */
export function buildQuestionFilter(
  topicIds: string[],
  difficulty: ExamDifficulty,
  mode: ExamMode = 'practice'
): Record<string, unknown> {
  const filter: Record<string, unknown> = {
    topicId:  { $in: topicIds },
    isActive: true,
  }
  if (difficulty !== 'mixed') {
    filter.difficulty = difficulty
  }
  if (mode === 'interview') {
    filter.type = 'open'
  } else if (mode === 'code') {
    filter.type = 'code'
  } else {
    filter.type = { $in: ['multiple', 'true_false', 'open'] }
  }
  return filter
}

/**
 * Generates the exam title from an array of topic names.
 * Shows up to 2 names explicitly, then "+N more".
 *
 * Examples:
 *   ['Selenium']            → 'Selenium'
 *   ['Selenium', 'API']     → 'Selenium + API'
 *   ['A', 'B', 'C', 'D']   → 'A + B +2'
 */
export function buildExamTitle(topicNames: string[]): string {
  if (topicNames.length === 0) return 'Untitled exam'
  return (
    topicNames.slice(0, 2).join(' + ') +
    (topicNames.length > 2 ? ` +${topicNames.length - 2}` : '')
  )
}

/**
 * Counts questions that contribute to the score.
 * Open questions and code exercises are excluded — they are self-rated.
 */
export function countScorableQuestions<T extends { type: string }>(questions: T[]): number {
  return questions.filter(q => (SCORABLE_TYPES as readonly string[]).includes(q.type)).length
}
