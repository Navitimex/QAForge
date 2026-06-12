import { vi, describe, it, expect } from 'vitest'

// Mock Next.js and NextAuth — they have no runtime in a pure Node test environment
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('next/server', () => ({
  NextResponse: { json: vi.fn((_body: unknown, _init?: unknown) => ({ _body, _init })) },
}))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))

import { scoreColor, scoreColorDim, fmtTime, fmtRelativeDate, calcAccuracy, calcStreak } from '@/lib/utils'

// ── scoreColor ────────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns an hsl() string for all inputs', () => {
    expect(scoreColor(0)).toMatch(/^hsl\(/)
    expect(scoreColor(50)).toMatch(/^hsl\(/)
    expect(scoreColor(100)).toMatch(/^hsl\(/)
  })

  it('0% → hue 0 (red)', () => {
    expect(scoreColor(0)).toBe('hsl(0, 75%, 57%)')
  })

  it('50% → hue 52 (amber)', () => {
    expect(scoreColor(50)).toBe('hsl(52, 75%, 57%)')
  })

  it('100% → hue 142 (green)', () => {
    expect(scoreColor(100)).toBe('hsl(142, 75%, 57%)')
  })
})

describe('scoreColorDim', () => {
  it('returns an hsla() string', () => {
    expect(scoreColorDim(50)).toMatch(/^hsla\(/)
  })

  it('includes 0.12 alpha', () => {
    expect(scoreColorDim(0)).toContain('0.12')
  })
})

// ── fmtTime ───────────────────────────────────────────────────────────────

describe('fmtTime', () => {
  it('formats 0 seconds as 00:00', () => expect(fmtTime(0)).toBe('00:00'))
  it('formats 59 seconds as 00:59', () => expect(fmtTime(59)).toBe('00:59'))
  it('formats 60 seconds as 01:00', () => expect(fmtTime(60)).toBe('01:00'))
  it('formats 65 seconds as 01:05', () => expect(fmtTime(65)).toBe('01:05'))
  it('formats 3600 seconds as 60:00', () => expect(fmtTime(3600)).toBe('60:00'))
  it('handles negative values (abs)', () => expect(fmtTime(-30)).toBe('00:30'))
})

// ── fmtRelativeDate ───────────────────────────────────────────────────────

describe('fmtRelativeDate', () => {
  it('shows minutes ago for recent dates', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000)
    expect(fmtRelativeDate(fiveMinutesAgo)).toBe('5m ago')
  })

  it('shows hours ago for dates within 24h', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3_600_000)
    expect(fmtRelativeDate(twoHoursAgo)).toBe('2h ago')
  })

  it('shows days ago for dates within a week', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000)
    expect(fmtRelativeDate(threeDaysAgo)).toBe('3d ago')
  })

  it('accepts a string date', () => {
    const date = new Date(Date.now() - 10 * 60_000).toISOString()
    expect(fmtRelativeDate(date)).toBe('10m ago')
  })
})

// ── calcAccuracy ──────────────────────────────────────────────────────────

describe('calcAccuracy', () => {
  it('returns 0 when no answers have been given', () => {
    expect(calcAccuracy(0, 0)).toBe(0)
  })

  it('returns 70 for 7 correct out of 10', () => {
    expect(calcAccuracy(10, 7)).toBe(70)
  })

  it('returns 100 for a perfect score', () => {
    expect(calcAccuracy(5, 5)).toBe(100)
  })

  it('rounds to nearest integer', () => {
    expect(calcAccuracy(3, 1)).toBe(33)
  })
})

// ── calcStreak ────────────────────────────────────────────────────────────

describe('calcStreak', () => {
  it('starts streak at 1 for a brand-new user (no prior practice)', () => {
    const r = calcStreak(0, 0, null)
    expect(r.currentStreak).toBe(1)
    expect(r.longestStreak).toBe(1)
  })

  it('increments streak by 1 for a consecutive day', () => {
    const yesterday = new Date(Date.now() - 86_400_000)
    const r = calcStreak(3, 3, yesterday)
    expect(r.currentStreak).toBe(4)
    expect(r.longestStreak).toBe(4)
  })

  it('updates longestStreak when new streak exceeds it', () => {
    const yesterday = new Date(Date.now() - 86_400_000)
    const r = calcStreak(10, 8, yesterday)
    expect(r.longestStreak).toBe(11)
  })

  it('resets streak to 1 when gap is more than 1 day', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000)
    const r = calcStreak(5, 7, threeDaysAgo)
    expect(r.currentStreak).toBe(1)
    expect(r.longestStreak).toBe(7) // keeps the highest ever
  })

  it('keeps streak unchanged when already practiced today', () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const r = calcStreak(3, 3, today)
    expect(r.currentStreak).toBe(3)
  })

  it('sets lastPracticeDate to today', () => {
    const r = calcStreak(1, 1, null)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expect(r.lastPracticeDate.getTime()).toBe(today.getTime())
  })
})
