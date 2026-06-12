import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { getActiveTopics } from '@/lib/services/topic-service'
import NewExamClient from './NewExamClient'

export default async function NewExamPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  await connectDB()
  const topics = await getActiveTopics()

  return <NewExamClient topics={topics} />
}
