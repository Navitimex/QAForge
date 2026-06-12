/**
 * lib/services/exam-service.ts
 *
 * Pure business-logic functions for exam creation.
 * No database or HTTP dependencies — fully unit-testable.
 */

import type { ExamDifficulty } from '@/types'

/**
 * Builds a MongoDB query filter for question selection.
 * When difficulty is 'mixed', all difficulty levels are included.
 */
export function buildQuestionFilter(
  topicIds: string[],
  difficulty: ExamDifficulty
): Record<string, unknown> {
  const filter: Record<string, unknown> = {
    topicId:  { $in: topicIds },
    isActive: true,
  }
  if (difficulty !== 'mixed') {
    filter.difficulty = difficulty
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
 * Open questions are excluded — they are self-rated and not automatically evaluable.
 */
export function countScorableQuestions<T extends { type: string }>(questions: T[]): number {
  return questions.filter(q => q.type !== 'open').length
}
