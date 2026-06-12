import mongoose, { Schema, Document, Model } from 'mongoose'
import type { QuestionType, SelfRating } from '@/types'

export interface ExamAnswerDocument extends Document {
  examId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId      // denormalized for stats queries
  questionId: mongoose.Types.ObjectId
  topicId: mongoose.Types.ObjectId     // denormalized for topic-level stats
  questionType: QuestionType           // denormalized
  userAnswer: string | null
  isCorrect: boolean | null
  selfRating: SelfRating | null
  skipped: boolean
  timeSpentSeconds: number
  answeredAt: Date
}

const ExamAnswerSchema = new Schema<ExamAnswerDocument>(
  {
    examId:          { type: Schema.Types.ObjectId, ref: 'Exam',     required: true, index: true },
    userId:          { type: Schema.Types.ObjectId, ref: 'User',     required: true, index: true },
    questionId:      { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    topicId:         { type: Schema.Types.ObjectId, ref: 'Topic',    required: true, index: true },
    questionType:    { type: String, enum: ['multiple', 'true_false', 'open', 'code'], required: true },
    userAnswer:      { type: String, default: null },
    isCorrect:       { type: Boolean, default: null },
    selfRating:      { type: String, enum: ['knew', 'partial', 'missed', null], default: null },
    skipped:         { type: Boolean, default: false },
    timeSpentSeconds:{ type: Number, default: 0 },
    answeredAt:      { type: Date, default: Date.now },
  },
  { timestamps: false }
)

// Unique per exam + question (upsert safe)
ExamAnswerSchema.index({ examId: 1, questionId: 1 }, { unique: true })

// isCorrect logic for open questions:
// - selfRating 'knew'    → isCorrect = true
// - selfRating 'partial' → isCorrect = null  (neutral, no penalty)
// - selfRating 'missed'  → isCorrect = false
// This is handled in the API handler, not the schema.

const ExamAnswer: Model<ExamAnswerDocument> =
  (mongoose.models.ExamAnswer as Model<ExamAnswerDocument>) ||
  mongoose.model<ExamAnswerDocument>('ExamAnswer', ExamAnswerSchema)

export default ExamAnswer
