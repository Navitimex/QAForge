/**
 * lib/validations.ts — Zod schemas
 *
 * Single source of truth for validation.
 * Reused in both API route handlers (server) and react-hook-form resolvers (client).
 */

import { z } from 'zod'

// MongoDB ObjectId — validated by shape (regex) so this file stays
// importable from Client Components without pulling in mongoose.
export const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid id')

// ── Exam ──────────────────────────────────────────────────────────────────

export const CreateExamSchema = z.object({
  topicIds:   z.array(ObjectIdSchema).min(1, 'Select at least one topic'),
  size:       z.number().int().min(5).max(50),
  difficulty: z.enum(['mixed', 'easy', 'medium', 'hard']),
  mode:       z.enum(['exam', 'practice', 'interview', 'code']),
})

export type CreateExamInput = z.infer<typeof CreateExamSchema>

export const SubmitAnswerSchema = z.object({
  questionId:       ObjectIdSchema,
  userAnswer:       z.string().nullable().optional(),
  selfRating:       z.enum(['knew', 'partial', 'missed']).nullable().optional(),
  timeSpentSeconds: z.number().int().min(0).default(0),
  skipped:          z.boolean().optional().default(false),
})

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>

export const PatchExamSchema = z.object({
  status: z.enum(['paused', 'completed']),
})

export type PatchExamInput = z.infer<typeof PatchExamSchema>

// ── Question (admin) ──────────────────────────────────────────────────────

const QuestionOptionSchema = z.object({
  label: z.enum(['A', 'B', 'C', 'D']),
  text:  z.string().min(1),
})

export const CreateQuestionSchema = z.object({
  topicId:       ObjectIdSchema,
  text:          z.string().min(5, 'Question text must be at least 5 characters'),
  type:          z.enum(['multiple', 'true_false', 'open', 'code']),
  difficulty:    z.enum(['easy', 'medium', 'hard']),
  options:       z.array(QuestionOptionSchema).optional().default([]),
  correctAnswer: z.string().nullable().optional(),
  code:          z.string().nullable().optional().default(null),
  solutionCode:  z.string().nullable().optional().default(null),
  explanation:   z.string().min(10, 'Explanation must be at least 10 characters'),
  tags:          z.array(z.string()).optional().default([]),
  version:       z.string().nullable().optional().default(null),
})
.superRefine((data, ctx) => {
  if (data.type === 'multiple') {
    if (!data.options || data.options.length !== 4) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Multiple choice requires exactly 4 options', path: ['options'] })
    }
    if (!data.correctAnswer || !['A', 'B', 'C', 'D'].includes(data.correctAnswer)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Correct answer must be A, B, C, or D', path: ['correctAnswer'] })
    }
  }
  if (data.type === 'true_false') {
    if (!data.correctAnswer || !['true', 'false'].includes(data.correctAnswer)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Correct answer must be "true" or "false"', path: ['correctAnswer'] })
    }
  }
})

export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>

// Import schema for bulk import (topicSlug instead of topicId)
export const ImportQuestionSchema = z.object({
  topicSlug:     z.string().min(1),
  text:          z.string().min(5),
  type:          z.enum(['multiple', 'true_false', 'open', 'code']),
  difficulty:    z.enum(['easy', 'medium', 'hard']),
  options:       z.array(QuestionOptionSchema).optional().default([]),
  correctAnswer: z.string().nullable().optional(),
  code:          z.string().nullable().optional().default(null),
  solutionCode:  z.string().nullable().optional().default(null),
  explanation:   z.string().min(10),
  tags:          z.array(z.string()).optional().default([]),
  version:       z.string().nullable().optional().default(null),
})

export const BulkImportSchema = z.array(ImportQuestionSchema).min(1)

export type ImportQuestionInput = z.infer<typeof ImportQuestionSchema>

// ── Topic (admin) ─────────────────────────────────────────────────────────

export const CreateTopicSchema = z.object({
  name:        z.string().min(2),
  slug:        z.string().min(2).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, hyphens'),
  description: z.string().optional().default(''),
  color:       z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color'),
  icon:        z.string().min(1),
})

export type CreateTopicInput = z.infer<typeof CreateTopicSchema>
