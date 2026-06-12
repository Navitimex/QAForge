import mongoose, { Schema, Document, Model } from 'mongoose'

export interface TopicDocument extends Document {
  name: string
  slug: string
  description: string
  color: string
  icon: string
  isActive: boolean
  createdAt: Date
}

const TopicSchema = new Schema<TopicDocument>(
  {
    name:        { type: String, required: true },
    slug:        { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    color:       { type: String, required: true },  // hex
    icon:        { type: String, required: true },  // lucide-react icon name
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const Topic: Model<TopicDocument> =
  (mongoose.models.Topic as Model<TopicDocument>) ||
  mongoose.model<TopicDocument>('Topic', TopicSchema)

export default Topic
