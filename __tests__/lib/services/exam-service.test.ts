import { describe, it, expect } from 'vitest'
import { buildExamTitle, countScorableQuestions, buildQuestionFilter } from '@/lib/services/exam-service'

// ── buildExamTitle ────────────────────────────────────────────────────────

describe('buildExamTitle', () => {
  it('returns a fallback for empty topic list', () => {
    expect(buildExamTitle([])).toBe('Untitled exam')
  })

  it('returns the topic name directly for a single topic', () => {
    expect(buildExamTitle(['Selenium']).trim()).toBe('Selenium')
  })

  it('joins two topics with " + "', () => {
    expect(buildExamTitle(['Selenium', 'API Testing'])).toBe('Selenium + API Testing')
  })

  it('shows "+1" when there are three topics', () => {
    expect(buildExamTitle(['A', 'B', 'C'])).toBe('A + B +1')
  })

  it('shows "+2" when there are four topics', () => {
    expect(buildExamTitle(['A', 'B', 'C', 'D'])).toBe('A + B +2')
  })

  it('always caps at first two explicit names', () => {
    expect(buildExamTitle(['T1', 'T2', 'T3', 'T4', 'T5'])).toBe('T1 + T2 +3')
  })
})

// ── countScorableQuestions ────────────────────────────────────────────────

describe('countScorableQuestions', () => {
  it('counts multiple and true_false but not open', () => {
    const questions = [
      { type: 'multiple' },
      { type: 'true_false' },
      { type: 'open' },
      { type: 'multiple' },
    ]
    expect(countScorableQuestions(questions)).toBe(3)
  })

  it('returns 0 for all-open exam', () => {
    expect(countScorableQuestions([{ type: 'open' }, { type: 'open' }])).toBe(0)
  })

  it('returns 0 for empty array', () => {
    expect(countScorableQuestions([])).toBe(0)
  })

  it('returns full count for all scorable questions', () => {
    const questions = [{ type: 'multiple' }, { type: 'true_false' }, { type: 'multiple' }]
    expect(countScorableQuestions(questions)).toBe(3)
  })

  it('excludes code exercises from the score', () => {
    expect(countScorableQuestions([{ type: 'code' }, { type: 'multiple' }])).toBe(1)
  })
})

// ── buildQuestionFilter ───────────────────────────────────────────────────

describe('buildQuestionFilter', () => {
  it('includes the topicIds filter', () => {
    const f = buildQuestionFilter(['t1', 't2'], 'mixed')
    expect(f.topicId).toEqual({ $in: ['t1', 't2'] })
  })

  it('sets isActive to true', () => {
    const f = buildQuestionFilter(['t1'], 'easy')
    expect(f.isActive).toBe(true)
  })

  it('includes difficulty when not "mixed"', () => {
    expect(buildQuestionFilter(['t1'], 'easy').difficulty).toBe('easy')
    expect(buildQuestionFilter(['t1'], 'medium').difficulty).toBe('medium')
    expect(buildQuestionFilter(['t1'], 'hard').difficulty).toBe('hard')
  })

  it('omits the difficulty key when set to "mixed"', () => {
    const f = buildQuestionFilter(['t1'], 'mixed')
    expect(Object.prototype.hasOwnProperty.call(f, 'difficulty')).toBe(false)
  })

  it('interview mode filters to open questions only', () => {
    expect(buildQuestionFilter(['t1'], 'mixed', 'interview').type).toBe('open')
  })

  it('code mode filters to code exercises only', () => {
    expect(buildQuestionFilter(['t1'], 'mixed', 'code').type).toBe('code')
  })

  it('practice mode excludes code exercises but includes open', () => {
    expect(buildQuestionFilter(['t1'], 'mixed', 'practice').type).toEqual({ $in: ['multiple', 'true_false', 'open'] })
  })

  it('exam mode only includes scorable types (no open, no code)', () => {
    expect(buildQuestionFilter(['t1'], 'mixed', 'exam').type).toEqual({ $in: ['multiple', 'true_false'] })
  })
})
