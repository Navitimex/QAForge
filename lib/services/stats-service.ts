import UserStats from '@/models/UserStats'
import User from '@/models/User'
import { calcAccuracy } from '@/lib/utils'

export async function getUserGlobalStats(userId: string) {
  const statsRows = await UserStats.find({ userId }).lean()
  const totalAnswered = statsRows.reduce((s, r) => s + (r.totalAnswered ?? 0), 0)
  const totalCorrect  = statsRows.reduce((s, r) => s + (r.totalCorrect  ?? 0), 0)
  return {
    statsRows,
    totalAnswered,
    totalCorrect,
    globalAccuracy: calcAccuracy(totalAnswered, totalCorrect),
  }
}

export async function getUserStreak(userId: string): Promise<number> {
  const user = await User.findById(userId).lean()
  return user?.currentStreak ?? 0
}
