import mongoose, { Schema, Document, Model } from 'mongoose'
import type { QuestionType, Difficulty } from '@/types'

export interface QuestionDocument extends Document {
  topicId: mongoose.Types.ObjectId
  text: string
  type: QuestionType
  difficulty: Difficulty
  options: { label: 'A' | 'B' | 'C' | 'D'; text: string }[]
  correctAnswer: string | null
  explanation: string
  tags: string[]
  version: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const QuestionSchema = new Schema<QuestionDocument>(
  {
    topicId:       { type: Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
    text:          { type: String, required: true },
    type:          { type: String, enum: ['multiple', 'true_false', 'open'], required: true },
    difficulty:    { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    options: [
      {
        label: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
        text:  { type: String, required: true },
      },
    ],
    correctAnswer: { type: String, default: null },
    explanation:   { type: String, required: true },
    tags:          [{ type: String }],
    version:       { type: String, default: null },
    isActive:      { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
)

// Full-text search index on question text
QuestionSchema.index({ text: 'text' })

const Question: Model<QuestionDocument> =
  (mongoose.models.Question as Model<QuestionDocument>) ||
  mongoose.model<QuestionDocument>('Question', QuestionSchema)

export default Question
