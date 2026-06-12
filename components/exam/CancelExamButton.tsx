'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

interface Props {
  examId: string
}

/**
 * Cancels (deletes) a pending exam from the history list.
 * Asks for confirmation, calls DELETE /api/exams/[id], then refreshes the page data.
 */
export default function CancelExamButton({ examId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    if (!confirm('Cancel this exam? Saved answers for it will be removed.')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/exams/${examId}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleCancel} disabled={loading}>
      {loading ? '…' : 'Cancel'}
    </Button>
  )
}
