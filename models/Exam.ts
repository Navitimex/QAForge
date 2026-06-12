import mongoose, { Schema, Document, Model } from 'mongoose'
import type { ExamDifficulty, ExamMode, ExamStatus } from '@/types'

export interface ExamDocument extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  topicIds: mongoose.Types.ObjectId[]
  questionIds: mongoose.Types.ObjectId[]
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

const ExamSchema = new Schema<ExamDocument>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title:       { type: String, required: true },
    topicIds:    [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
    questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    // Requested size is validated by Zod (5–50). The stored size can be
    // smaller when fewer questions are available than requested.
    size:        { type: Number, required: true, min: 1 },
    difficulty:  { type: String, enum: ['mixed', 'easy', 'medium', 'hard'], required: true },
    mode:        { type: String, enum: ['exam', 'practice'], required: true },
    status:      { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
    score:       { type: Number, default: null },
    scorableCount: { type: Number, required: true },
    startedAt:   { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

// NOTE: currentQuestionIndex intentionally omitted.
// Position is derived from ExamAnswer documents (first questionId with no ExamAnswer).

const Exam: Model<ExamDocument> =
  (mongoose.models.Exam as Model<ExamDocument>) ||
  mongoose.model<ExamDocument>('Exam', ExamSchema)

export default Exam
