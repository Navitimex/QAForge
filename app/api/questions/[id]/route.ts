import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireSession, requireAdmin } from '@/lib/auth'
import { ok, fail, validationFail, serverError, isValidId } from '@/lib/api'
import { CreateQuestionSchema } from '@/lib/validations'
import Question from '@/models/Question'

type RouteParams = { params: { id: string } }

/** GET /api/questions/[id] */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()
    const session = await requireSession()
    if (session instanceof NextResponse) return session

    if (!isValidId(params.id)) return fail('Question not found', 404)

    const question = await Question.findById(params.id).lean()
    if (!question) return fail('Question not found', 404)

    return ok(question)
  } catch (error) {
    return serverError('GET /api/questions/[id]', error)
  }
}

/** PUT /api/questions/[id] — update question (admin only) */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    if (!isValidId(params.id)) return fail('Question not found', 404)

    const body = await req.json()
    const parsed = CreateQuestionSchema.safeParse(body)
    if (!parsed.success) return validationFail(parsed.error)

    const question = await Question.findByIdAndUpdate(
      params.id,
      { $set: parsed.data },
      { new: true }
    )
    if (!question) return fail('Question not found', 404)

    return ok(question)
  } catch (error) {
    return serverError('PUT /api/questions/[id]', error)
  }
}

/**
 * DELETE /api/questions/[id] — soft delete (admin only)
 * Sets isActive: false — questions are never hard-deleted to preserve exam history.
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    if (!isValidId(params.id)) return fail('Question not found', 404)

    const question = await Question.findByIdAndUpdate(
      params.id,
      { $set: { isActive: false } },
      { new: true }
    )
    if (!question) return fail('Question not found', 404)

    return ok({ id: params.id, isActive: false })
  } catch (error) {
    return serverError('DELETE /api/questions/[id]', error)
  }
}
