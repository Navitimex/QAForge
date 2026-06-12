import TopicModel from '@/models/Topic'
import type { ITopic } from '@/types'

/** Active topics serialized as plain objects (safe to pass to Client Components). */
export async function getActiveTopics(): Promise<ITopic[]> {
  const docs = await TopicModel.find({ isActive: true }).sort({ name: 1 }).lean()
  return docs.map(t => ({
    _id:         String(t._id),
    name:        t.name,
    slug:        t.slug,
    description: t.description ?? '',
    color:       t.color ?? '#4A88EF',
    icon:        t.icon ?? 'circle',
    isActive:    t.isActive ?? true,
    createdAt:   t.createdAt,
  }))
}

/** Map of topicId → topic name for active topics. */
export async function getTopicMap(): Promise<Record<string, string>> {
  const docs = await TopicModel.find({ isActive: true }).lean()
  return Object.fromEntries(docs.map(t => [String(t._id), t.name]))
}
