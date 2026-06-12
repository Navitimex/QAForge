import mongoose, { Schema, Document, Model } from 'mongoose'

export interface UserStatsDocument extends Document {
  userId: mongoose.Types.ObjectId
  topicId: mongoose.Types.ObjectId
  totalAnswered: number   // excludes skipped and open without selfRating
  totalCorrect: number
  totalSkipped: number
  lastAttemptAt: Date
}

const UserStatsSchema = new Schema<UserStatsDocument>(
  {
    userId:       { type: Schema.Types.ObjectId, ref: 'User',  required: true, index: true },
    topicId:      { type: Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
    totalAnswered:{ type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalSkipped: { type: Number, default: 0 },
    lastAttemptAt:{ type: Date,   default: Date.now },
  },
  { timestamps: false }
)

// Unique per user + topic (upsert safe)
UserStatsSchema.index({ userId: 1, topicId: 1 }, { unique: true })

// accuracy = totalCorrect / totalAnswered * 100  — computed at read time

const UserStats: Model<UserStatsDocument> =
  (mongoose.models.UserStats as Model<UserStatsDocument>) ||
  mongoose.model<UserStatsDocument>('UserStats', UserStatsSchema)

export default UserStats
