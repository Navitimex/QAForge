// ── Score colors (matches QAForge.html prototype exactly) ─────────────────

/**
 * Returns an HSL color string transitioning from red (0%) → amber (50%) → green (100%).
 * Used for score display, topic accuracy bars, and answer state colors.
 */
export function scoreColor(p: number): string {
  const h = p <= 50 ? (p / 50) * 52 : 52 + ((p - 50) / 50) * 90
  return `hsl(${Math.round(h)}, 75%, 57%)`
}

/**
 * Dimmed (12% alpha) version of scoreColor — used for backgrounds.
 */
export function scoreColorDim(p: number): string {
  const h = p <= 50 ? (p / 50) * 52 : 52 + ((p - 50) / 50) * 90
  return `hsla(${Math.round(h)}, 75%, 57%, 0.12)`
}

// ── Accuracy ──────────────────────────────────────────────────────────────

/** Returns accuracy as a 0–100 integer (0 if no answers yet). */
export function calcAccuracy(totalAnswered: number, totalCorrect: number): number {
  if (!totalAnswered) return 0
  return Math.round((totalCorrect / totalAnswered) * 100)
}

// ── Time formatting ───────────────────────────────────────────────────────

/** Formats seconds as MM:SS */
export function fmtTime(seconds: number): string {
  const n = Math.abs(Math.round(seconds))
  return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`
}

/** Relative timestamp (Xm ago / Xh ago / Xd ago / locale date) */
export function fmtRelativeDate(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(date).toLocaleDateString('en', { day: 'numeric', month: 'short' })
}

// ── Streak logic ─────────────────────────────────────────────────────────

/**
 * Calculates the new streak values when a user completes an exam.
 * Returns updated { currentStreak, longestStreak, lastPracticeDate }.
 */
export function calcStreak(
  current: number,
  longest: number,
  lastPractice: Date | null
): { currentStreak: number; longestStreak: number; lastPracticeDate: Date } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let newStreak = current

  if (!lastPractice) {
    newStreak = 1
  } else {
    const last = new Date(lastPractice)
    last.setHours(0, 0, 0, 0)
    const diffDays = Math.round((today.getTime() - last.getTime()) / 86_400_000)

    if (diffDays === 0) {
      // Already practiced today — no change
      newStreak = current
    } else if (diffDays === 1) {
      // Consecutive day
      newStreak = current + 1
    } else {
      // Streak broken
      newStreak = 1
    }
  }

  return {
    currentStreak:    newStreak,
    longestStreak:    Math.max(longest, newStreak),
    lastPracticeDate: today,
  }
}

// ── Slug helper ───────────────────────────────────────────────────────────

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
