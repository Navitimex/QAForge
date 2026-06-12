/**
 * lib/api.ts — shared helpers for API route handlers
 *
 * Standard response envelope (see CLAUDE.md §5):
 *   { success: true, data: T }
 *   { success: false, error: string, details?: unknown }
 */

import { NextResponse } from 'next/server'
import { isValidObjectId } from 'mongoose'
import type { ZodError } from 'zod'

/** 200/201 success response with the standard envelope. */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status })
}

/** Error response with the standard envelope. */
export function fail(error: string, status: number, details?: unknown): NextResponse {
  return NextResponse.json(
    details === undefined ? { success: false, error } : { success: false, error, details },
    { status }
  )
}

/** 400 validation error from a ZodError. */
export function validationFail(error: ZodError): NextResponse {
  return fail('Validation failed', 400, error.flatten())
}

/** 500 + server-side log. Never leaks internals to the client. */
export function serverError(route: string, error: unknown): NextResponse {
  console.error(`[${route}]`, error)
  return fail('Internal server error', 500)
}

/**
 * Returns true when `id` is a valid MongoDB ObjectId.
 * Use before findById/findOne to avoid CastError → 500 on malformed URLs.
 */
export function isValidId(id: string): boolean {
  return isValidObjectId(id)
}
