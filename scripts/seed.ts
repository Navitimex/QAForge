/**
 * scripts/seed.ts
 * Run with: npm run seed
 * (requires MONGODB_URI and SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env.local)
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Load env from .env.local (tsx doesn't auto-load it)
import { config } from 'dotenv'
config({ path: '.env.local' })

import { TOPICS_DATA, QUESTIONS_DATA } from './seed-data'
import { EXTRA_TOPICS, EXTRA_QUESTIONS } from './seed-data-extra'

// Import models directly to avoid Next.js module resolution issues
import Topic from '../models/Topic'
import Question from '../models/Question'
import User from '../models/User'

const MONGODB_URI = process.env.MONGODB_URI
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@qaprep.dev'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD

if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI not set. Create .env.local first.')
  process.exit(1)
}

if (!ADMIN_PASSWORD) {
  console.error('❌  SEED_ADMIN_PASSWORD not set in .env.local')
  process.exit(1)
}

async function seed() {
  console.log('🌱  Connecting to MongoDB Atlas...')
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false })
  console.log('✅  Connected.')

  // ── Topics ─────────────────────────────────────────────────────────────
  console.log('\n📚  Seeding topics...')
  const topicMap = new Map<string, mongoose.Types.ObjectId>()

  const allTopics = [...TOPICS_DATA, ...EXTRA_TOPICS]
  for (const t of allTopics) {
    const doc = await Topic.findOneAndUpdate(
      { slug: t.slug },
      { $setOnInsert: t },
      { upsert: true, new: true }
    )
    topicMap.set(t.slug, doc._id as mongoose.Types.ObjectId)
    console.log(`   ✓ ${t.name}`)
  }

  // ── Questions ──────────────────────────────────────────────────────────
  console.log('\n❓  Seeding questions...')
  let inserted = 0
  let skipped = 0

  const allQuestions = [...QUESTIONS_DATA, ...EXTRA_QUESTIONS]
  for (const q of allQuestions) {
    const topicId = topicMap.get(q.topicSlug)
    if (!topicId) {
      console.warn(`   ⚠  Unknown topicSlug: ${q.topicSlug}`)
      continue
    }

    // Upsert by text to avoid duplicates on re-run
    const exists = await Question.findOne({ text: q.text })
    if (exists) {
      skipped++
      continue
    }

    await Question.create({
      topicId,
      text:          q.text,
      type:          q.type,
      difficulty:    q.difficulty,
      options:       q.options || [],
      correctAnswer: q.correctAnswer,
      code:          ('code' in q ? q.code : null) ?? null,
      solutionCode:  ('solutionCode' in q ? q.solutionCode : null) ?? null,
      explanation:   q.explanation,
      tags:          q.tags || [],
      version:       q.version,
      isActive:      true,
    })
    inserted++
  }

  console.log(`   ✓ Inserted: ${inserted}  |  Already existed: ${skipped}`)

  // ── Admin user ─────────────────────────────────────────────────────────
  console.log('\n👤  Seeding admin user...')
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL })

  if (existingAdmin) {
    console.log(`   ℹ  Admin already exists: ${ADMIN_EMAIL}`)
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD!, 12)
    await User.create({
      name:         'Admin',
      email:        ADMIN_EMAIL,
      image:        null,
      passwordHash,
      provider:     'credentials',
      role:         'admin',
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
    })
    console.log(`   ✓ Admin created: ${ADMIN_EMAIL}`)
  }

  // ── Summary ────────────────────────────────────────────────────────────
  const topicCount    = await Topic.countDocuments()
  const questionCount = await Question.countDocuments()
  const userCount     = await User.countDocuments()

  console.log('\n📊  Database summary:')
  console.log(`   Topics:    ${topicCount}`)
  console.log(`   Questions: ${questionCount}`)
  console.log(`   Users:     ${userCount}`)

  await mongoose.disconnect()
  console.log('\n✅  Seed complete. Connection closed.')
}

seed().catch(err => {
  console.error('❌  Seed failed:', err)
  process.exit(1)
})
