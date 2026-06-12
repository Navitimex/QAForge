import { connectDB } from '@/lib/mongodb'
import { getActiveTopics } from '@/lib/services/topic-service'
import AddQuestionClient from './AddQuestionClient'

export default async function AddQuestionPage() {
  await connectDB()
  const topics = await getActiveTopics()

  return <AddQuestionClient topics={topics} />
}
