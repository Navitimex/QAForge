// ── Enums / literals ──────────────────────────────────────────────────────

export type Role        = 'user' | 'admin'
export type Provider    = 'google' | 'credentials'
export type Difficulty  = 'easy' | 'medium' | 'hard'
export type QuestionType = 'multiple' | 'true_false' | 'open' | 'code'
export type ExamDifficulty = 'mixed' | 'easy' | 'medium' | 'hard'
export type ExamMode    = 'exam' | 'practice' | 'interview' | 'code'
export type ExamStatus  = 'active' | 'paused' | 'completed'
export type SelfRating  = 'knew' | 'partial' | 'missed'

// ── Domain models (plain objects — no Mongoose types) ─────────────────────

export interface IUser {
  _id: string
  name: string
  email: string
  image: string | null
  passwordHash: string | null   // only for credentials provider (admin)
  provider: Provider
  role: Role
  currentStreak: number
  longestStreak: number
  lastPracticeDate: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ITopic {
  _id: string
  name: string
  slug: string
  description: string
  color: string     // hex, used for badges
  icon: string      // lucide-react icon name
  isActive: boolean
  createdAt: Date
}

export interface IQuestionOption {
  label: 'A' | 'B' | 'C' | 'D'
  text: string
}

export interface IQuestion {
  _id: string
  topicId: string
  text: string
  type: QuestionType
  difficulty: Difficulty
  options: IQuestionOption[]        // only for type === 'multiple'
  correctAnswer: string | null      // 'A'|'B'|'C'|'D' | 'true'|'false' | null (open/code)
  code: string | null               // starter/reference snippet (type 'code')
  solutionCode: string | null       // solution code revealed on demand (type 'code')
  explanation: string
  tags: string[]
  version: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IExam {
  _id: string
  userId: string
  title: string
  topicIds: string[]
  questionIds: string[]
  size: number
  difficulty: ExamDifficulty
  mode: ExamMode
  status: ExamStatus
  score: number | null
  scorableCount: number
  startedAt: Date
  completedAt: Date | null
  createdAt: Date
}

export interface IExamAnswer {
  _id: string
  examId: string
  userId: string
  questionId: string
  topicId: string
  questionType: QuestionType
  userAnswer: string | null
  isCorrect: boolean | null
  selfRating: SelfRating | null
  skipped: boolean
  timeSpentSeconds: number
  answeredAt: Date
}

export interface IUserStats {
  _id: string
  userId: string
  topicId: string
  totalAnswered: number
  totalCorrect: number
  totalSkipped: number
  lastAttemptAt: Date
  // computed
  accuracy?: number
}

// ── API response envelope ─────────────────────────────────────────────────

export type ApiSuccess<T> = { success: true; data: T }
export type ApiError      = { success: false; error: string; details?: unknown }
export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ── Exam with hydrated questions (for exam screen) ────────────────────────

export interface IExamFull extends IExam {
  questions: IQuestion[]
  answers: IExamAnswer[]
}

// ── Session user (NextAuth augmented) ────────────────────────────────────
// See next-auth.d.ts for augmentation; this mirrors it as plain type

export interface SessionUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: Role
}
