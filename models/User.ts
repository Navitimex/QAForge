import mongoose, { Schema, Document, Model } from 'mongoose'
import type { Role, Provider } from '@/types'

export interface UserDocument extends Document {
  name: string
  email: string
  image: string | null
  passwordHash: string | null
  provider: Provider
  role: Role
  currentStreak: number
  longestStreak: number
  lastPracticeDate: Date | null
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<UserDocument>(
  {
    name:             { type: String, required: true },
    email:            { type: String, required: true, unique: true, lowercase: true },
    image:            { type: String, default: null },
    passwordHash:     { type: String, default: null },
    provider:         { type: String, enum: ['google', 'credentials'], required: true },
    role:             { type: String, enum: ['user', 'admin'], default: 'user' },
    currentStreak:    { type: Number, default: 0 },
    longestStreak:    { type: Number, default: 0 },
    lastPracticeDate: { type: Date, default: null },
  },
  { timestamps: true }
)

// Avoid model recompilation in hot-reload / serverless
const User: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument>) ||
  mongoose.model<UserDocument>('User', UserSchema)

export default User
