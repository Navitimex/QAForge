# CLAUDE.md — QA Interview Prep System

> Este archivo es el contrato de desarrollo entre el desarrollador y Claude.
> Léelo completo antes de tocar cualquier archivo del proyecto.
> Actualízalo cuando cambien decisiones de arquitectura o convenciones.

---

## 1. Visión general del proyecto

**QA Interview Prep** es una aplicación web full-stack para que profesionales de QA practiquen preguntas de entrevista técnica. Permite crear exámenes personalizados por topic, dificultad y cantidad de preguntas, ver respuestas, guardar progreso, rastrear rendimiento por área temática y aplicar un sistema de ponderación para reforzar los puntos débiles.

**Stack:**
- **Framework:** Next.js 14 (App Router)
- **Estilos:** Tailwind CSS
- **Base de datos:** MongoDB Atlas (M0 gratuito) via Mongoose
- **Autenticación:** NextAuth.js **v4** (Google OAuth como método principal; credentials solo para la cuenta admin)
- **Deploy:** Vercel Hobby (gratuito)
- **Lenguaje:** TypeScript estricto en todo el proyecto

---

## 2. Decisiones de autenticación

### Flujo de usuarios normales
- **Solo Google OAuth** — no hay registro público con email/password.
- El usuario hace click en "Continuar con Google", se crea la cuenta automáticamente si es la primera vez con `role: 'user'`.
- No existe página `/register`. Solo `/login` con el botón de Google.

### Cuenta admin
- Creada únicamente via `scripts/seed.ts` — nunca via UI.
- Usa `provider: 'credentials'` con email/password (bcrypt).
- No existe formulario de registro admin. Si se necesita un nuevo admin, se crea directo en la DB o via seed.
- El rol `admin` se asigna manualmente en la DB o en el seed; no hay UI para promover usuarios.

### Por qué no NextAuth v5
NextAuth v5 sigue en fase beta con breaking changes frecuentes. Se usa **v4** que es la versión estable y ampliamente documentada.

---

## 3. Estructura del proyecto

```
qa-interview-prep/
├── CLAUDE.md
├── .env.local                         ← nunca al repo
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
│
├── app/
│   ├── layout.tsx                     ← root layout con Providers + fuentes
│   ├── page.tsx                       ← redirect a /dashboard o /login
│   │
│   ├── (auth)/                        ← sin layout de app
│   │   └── login/
│   │       ├── page.tsx               ← Server Component (guard: si hay sesión → /dashboard)
│   │       └── LoginClient.tsx        ← botón Google + form admin discreto (credentials)
│   │
│   ├── (app)/                         ← layout autenticado (guard: sin sesión → /login)
│   │   ├── layout.tsx                 ← usa AppShell (sidebar desktop + bottom nav móvil)
│   │   ├── dashboard/page.tsx         ← stats, weak topics alert, performance by topic, recientes
│   │   ├── exam/
│   │   │   ├── new/
│   │   │   │   ├── page.tsx           ← carga topics desde DB
│   │   │   │   └── NewExamClient.tsx  ← selección topics, dificultad, modo, count
│   │   │   └── [id]/
│   │   │       ├── page.tsx           ← carga exam + questions + answers; si completed → /review
│   │   │       └── ExamClient.tsx     ← examen activo: nav dots, skip, exit/pause, self-rating
│   │   ├── review/[id]/page.tsx       ← resultados + review acordeón por pregunta
│   │   └── history/page.tsx           ← historial: resume / cancel / review
│   │
│   ├── (admin)/                       ← guard: role !== 'admin' → /dashboard
│   │   ├── layout.tsx                 ← usa AppShell (mismo shell que (app))
│   │   └── admin/questions/           ← URL real: /admin/questions
│   │       ├── page.tsx               ← carga topics para el form
│   │       └── AddQuestionClient.tsx  ← tabs "Manual" | "Import JSON"
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── questions/
│       │   ├── route.ts               ← GET (list + search + paginación), POST (create)
│       │   ├── [id]/route.ts          ← GET, PUT, DELETE (soft)
│       │   └── import/route.ts        ← POST (bulk import JSON con topicSlug)
│       ├── topics/
│       │   └── route.ts               ← GET active topics
│       ├── exams/
│       │   ├── route.ts               ← GET list, POST create (weighted sampling)
│       │   └── [id]/
│       │       ├── route.ts           ← GET hydrated, PATCH complete/pause, DELETE cancel
│       │       └── answer/route.ts    ← POST submit answer/skip + UserStats delta
│       └── stats/
│           └── route.ts               ← GET stats por topic del usuario autenticado
│
├── components/
│   ├── ui/                            ← primitivas sin estado propio
│   │   ├── Button.tsx                 ← variants: primary/secondary/ghost/green; sizes: sm/md/lg
│   │   ├── Badge.tsx                  ← chip inline con color opcional
│   │   ├── OptionCard.tsx             ← estados: default/selected/correct/wrong
│   │   ├── ProgressBar.tsx            ← track + fill con transición
│   │   ├── ProgressRing.tsx           ← SVG ring con scoreColor, número Space Grotesk
│   │   └── SectionLabel.tsx           ← 10px uppercase section header
│   │
│   ├── exam/
│   │   └── CancelExamButton.tsx       ← Client: DELETE /api/exams/[id] + refresh (History)
│   │
│   └── layout/
│       ├── AppShell.tsx               ← Server: shell compartido por (app) y (admin); fetch de stats del sidebar
│       ├── AppSidebar.tsx             ← Client: sidebar desktop colapsable; stats, nav, tema, sign out
│       ├── MobileNav.tsx              ← Client: bottom nav móvil (admin-condicional + sign out)
│       ├── Providers.tsx              ← SessionProvider + ThemeProvider
│       └── ThemeProvider.tsx          ← localStorage theme, data-theme, useTheme() hook
│
├── lib/
│   ├── mongodb.ts                     ← singleton connectDB() con caché global (env validada lazy)
│   ├── auth.ts                        ← NextAuth v4: GoogleProvider + CredentialsProvider, JWT
│   ├── api.ts                         ← helpers de API Routes: ok(), fail(), validationFail(), serverError(), isValidId()
│   ├── utils.ts                       ← scoreColor, calcAccuracy, fmtTime, calcStreak…
│   ├── validations.ts                 ← schemas Zod (ObjectIdSchema, CreateExamSchema, SubmitAnswerSchema…)
│   ├── exam-weights.ts                ← weightedSample(), buildAccuracyMap()
│   └── services/
│       ├── exam-service.ts            ← lógica pura: buildQuestionFilter, buildExamTitle, countScorableQuestions
│       ├── scoring-service.ts         ← lógica pura: evaluateAnswer, computeFinalScore, computeStatsDelta
│       ├── stats-service.ts           ← getUserGlobalStats, getUserStreak (con DB)
│       └── topic-service.ts           ← getActiveTopics, getTopicMap (con DB)
│
├── models/
│   ├── User.ts
│   ├── Topic.ts
│   ├── Question.ts
│   ├── Exam.ts
│   ├── ExamAnswer.ts
│   └── UserStats.ts
│
├── types/
│   ├── index.ts                       ← IUser, ITopic, IQuestion, IExam, IExamAnswer, IUserStats…
│   └── next-auth.d.ts                 ← augmenta Session y JWT con id + role
│
└── scripts/
    ├── seed.ts                        ← conecta a Atlas, upsert topics, crea questions + admin
    └── seed-data.ts                   ← 10 topics, 130+ preguntas (multiple/true_false/open)
```

---

## 4. Modelos de datos (Mongoose + TypeScript)

### User
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,              // único, lowercase
  image: string | null,       // avatar de Google
  passwordHash: string | null, // solo para cuenta admin con credentials
  provider: 'google' | 'credentials',
  role: 'user' | 'admin',
  // Racha de práctica
  currentStreak: number,      // días consecutivos activo
  longestStreak: number,      // récord histórico
  lastPracticeDate: Date | null, // último día con al menos un examen completado
  createdAt: Date,
  updatedAt: Date
}
```

**Lógica de racha:**
- Al completar un examen: si `lastPracticeDate` es hoy → no cambiar; si es ayer → `currentStreak++`; si es más antiguo → `currentStreak = 1`.
- `longestStreak = Math.max(longestStreak, currentStreak)`.
- Se actualiza en `PATCH /api/exams/[id]` cuando `status → 'completed'`.

### Topic
```typescript
{
  _id: ObjectId,
  name: string,               // "Selenium WebDriver"
  slug: string,               // "selenium-webdriver" — único
  description: string,
  color: string,              // hex, para badges
  icon: string,               // nombre de icono (lucide-react)
  isActive: boolean,
  createdAt: Date
}
```

### Question
```typescript
{
  _id: ObjectId,
  topicId: ObjectId,          // ref: Topic
  text: string,
  type: 'multiple' | 'true_false' | 'open',
  difficulty: 'easy' | 'medium' | 'hard',
  options: [                  // solo para type === 'multiple'
    { label: 'A' | 'B' | 'C' | 'D', text: string }
  ],
  correctAnswer: string | null, // 'A'|'B'|'C'|'D' | 'true'|'false' | null (open)
  explanation: string,
  tags: string[],             // ej: ["POM", "locators", "xpath"]
  version: string | null,     // ej: "Selenium 4" — para preguntas version-específicas
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Exam
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  title: string,
  topicIds: ObjectId[],
  questionIds: ObjectId[],
  size: number,               // pedido: 5–50 (Zod); almacenado puede ser menor si no hay suficientes preguntas
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard',
  mode: 'exam' | 'practice',
  // exam     → respuestas ocultas hasta confirmar
  // practice → puede ver respuesta en cualquier momento sin penalizar
  status: 'active' | 'paused' | 'completed',
  score: number | null,       // conteo bruto de correctas sobre evaluables (excluye open)
  scorableCount: number,      // cantidad de preguntas que cuentan para el score (no open)
  startedAt: Date,
  completedAt: Date | null,
  createdAt: Date
}
```

**Nota:** `currentQuestionIndex` fue eliminado. Al cargar un examen en progreso, la posición actual se deriva de los `ExamAnswer` existentes: la primera pregunta en `questionIds` que no tiene `ExamAnswer` (o cuya answer está `skipped`) es la posición actual. Esto evita desincronización.

### ExamAnswer
```typescript
{
  _id: ObjectId,
  examId: ObjectId,
  userId: ObjectId,           // desnormalizado para stats
  questionId: ObjectId,
  topicId: ObjectId,          // desnormalizado
  questionType: 'multiple' | 'true_false' | 'open', // desnormalizado
  userAnswer: string | null,  // null si skipped
  isCorrect: boolean | null,
  // Para open: se establece según selfRating (ver abajo)
  // null = skipped o pendiente de autoevaluación
  selfRating: 'knew' | 'partial' | 'missed' | null,
  // Solo para preguntas open; null para el resto
  // 'knew'    → isCorrect = true
  // 'partial' → isCorrect = null (no penaliza ni suma)
  // 'missed'  → isCorrect = false
  skipped: boolean,
  timeSpentSeconds: number,   // mostrado en /review/[id] por pregunta
  answeredAt: Date
}
```

**Lógica de `isCorrect` para preguntas `open`:**
- Cuando el usuario revela la respuesta, se muestran los botones de autoevaluación.
- Hasta que el usuario selecciona uno, `isCorrect` y `selfRating` quedan en `null`.
- Al seleccionar, se hace POST al answer endpoint y se actualiza UserStats.

### UserStats
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  topicId: ObjectId,
  totalAnswered: number,      // excluye skipped y open sin selfRating
  totalCorrect: number,
  totalSkipped: number,
  lastAttemptAt: Date,
  // campo calculado al leer:
  // accuracy = totalCorrect / totalAnswered * 100
}
```

> Actualizado con `findOneAndUpdate + upsert` usando **deltas incrementales** (`computeStatsDelta`) — re-responder una pregunta nunca duplica contadores.

---

## 5. API Routes — contratos

Todas las rutas devuelven JSON con formato estándar:

```typescript
{ success: true, data: T }
{ success: false, error: string, details?: unknown }
```

Todas las rutas `/api/` excepto `/api/auth/` requieren sesión válida.

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/topics` | Lista topics activos |
| GET | `/api/questions?topicId=&difficulty=&search=&limit=&page=` | Lista con filtros y búsqueda full-text |
| POST | `/api/questions` | Crear pregunta (admin) |
| PUT | `/api/questions/[id]` | Editar pregunta (admin) |
| DELETE | `/api/questions/[id]` | Soft delete — pone `isActive: false` (admin) |
| POST | `/api/questions/import` | Bulk import desde JSON (admin) — el body es el array directo |
| POST | `/api/exams` | Crear examen con ponderación |
| GET | `/api/exams` | Lista exámenes del usuario |
| GET | `/api/exams/[id]` | Detalle con preguntas y answers existentes |
| PATCH | `/api/exams/[id]` | Actualizar status; calcula score al completar (idempotente si ya está completado) |
| DELETE | `/api/exams/[id]` | Cancelar/eliminar examen propio + sus ExamAnswers (UserStats no se revierten) |
| POST | `/api/exams/[id]/answer` | Enviar respuesta, skip o autoevaluación (rechazado si el examen está completado) |
| GET | `/api/stats` | Stats del usuario por topic |

**Convenciones de handlers:** usar los helpers de `lib/api.ts` (`ok`, `fail`, `validationFail`, `serverError`) y validar todo `[id]` de URL con `isValidId()` antes de consultar (evita CastError → 500).

---

## 6. Lógica de ponderación de preguntas

Al crear un examen (`POST /api/exams`), las preguntas **no se seleccionan puramente al azar**. Se usa un sistema de pesos basado en el rendimiento previo del usuario.

### Algoritmo (en `lib/exam-weights.ts`)

```
peso = 1 + (1 - accuracy) * 2
```

- Accuracy 0%   → peso 3.0 (aparece 3x más probable)
- Accuracy 50%  → peso 2.0
- Accuracy 100% → peso 1.0 (mínimo)
- Preguntas nunca respondidas → peso 2.0 (neutral-alto, se priorizan sobre las conocidas)

**Implementación:**
1. Obtener `UserStats` del usuario para los topics seleccionados.
2. Para cada pregunta candidata, calcular su peso según la accuracy del topic.
3. Hacer weighted random sampling hasta llenar el `size` del examen.
4. Si no hay suficientes preguntas para el tamaño pedido, usar todas las disponibles.

---

## 7. Score — cálculo correcto

El score solo considera preguntas **evaluables**: `multiple` y `true_false`.

```typescript
scorableCount = questionIds filtradas donde type !== 'open'
score = conteo bruto de correctas en evaluables   // las páginas muestran Math.round((score/scorableCount)*100)
```

Las preguntas `open` con `selfRating: 'knew'` sí actualizan `UserStats` (para ponderación futura), pero **no cuentan en el score numérico del examen**. Esto se deja claro en la UI del resumen.

---

## 8. Weak Topics — umbral unificado

**El umbral es 60% en toda la app.** Sin excepciones.

- Dashboard muestra sección "Needs attention" si accuracy < 60% → botón New Exam
- No existe ruta `/weak-topics` separada: la alerta y el filtrado viven en `dashboard/page.tsx`
- Los colores en la sección de performance por topic vienen de `scoreColor(accuracy)` (gradiente rojo→ámbar→verde)

---

## 9. Bulk import de preguntas (admin)

El endpoint `POST /api/questions/import` acepta un array JSON (el array es el body directo, sin wrapper) con el siguiente formato:

```json
[
  {
    "topicSlug": "selenium-webdriver",
    "text": "¿Qué es el Page Object Model?",
    "type": "open",
    "difficulty": "medium",
    "correctAnswer": null,
    "explanation": "Es un patrón de diseño...",
    "tags": ["POM", "design-patterns"],
    "version": null
  }
]
```

- Se valida cada objeto con Zod antes de insertar.
- Se hace `insertMany` con `ordered: false` para que errores individuales no aborten el lote.
- Respuesta: `{ inserted: N, errors: [{ index, reason }] }`

El tab "Import JSON" dentro de `/admin/questions` (`AddQuestionClient.tsx`) tiene un textarea para pegar JSON y muestra un preview de las preguntas detectadas antes de confirmar la importación.

---

## 10. Flujo de examen — lógica de negocio

### Crear examen (`POST /api/exams`)
1. Recibir: `topicIds[], size, difficulty, mode`
2. Validar `size` entre 5 y 50 y `topicIds` como ObjectIds con Zod.
3. Consultar preguntas activas que cumplan los filtros.
4. Aplicar algoritmo de ponderación (`lib/exam-weights.ts`) para seleccionar.
5. Calcular `scorableCount` (preguntas non-open).
6. Crear documento `Exam` con `status: 'active'`.
7. Devolver `{ examId }` — cliente redirige a `/exam/[id]`.

### Cargar examen en progreso (`GET /api/exams/[id]` o Server Component)
- Devolver el examen con sus preguntas y los `ExamAnswer` existentes.
- El cliente calcula la posición actual: primer índice en `questionIds` sin `ExamAnswer` no-skipped.
- Si el examen está `completed`, la página redirige a `/review/[id]`.

### Enviar respuesta (`POST /api/exams/[id]/answer`)
- Body: `{ questionId, userAnswer?, timeSpentSeconds, selfRating?, skipped? }`
- `selfRating` solo aplica para `type === 'open'`. `skipped: true` marca la pregunta como saltada (se puede re-responder después).
- Rechazar si el examen ya está `completed` (409).
- Verificar que la pregunta pertenece al examen (seguridad).
- Upsert `ExamAnswer` por `examId + questionId`.
- **UserStats se actualiza con delta incremental** (`computeStatsDelta` en scoring-service): se resta la contribución de la respuesta anterior y se suma la nueva, por lo que re-responder o convertir un skip en respuesta nunca duplica contadores.
- Devolver `{ answerId, isCorrect, correctAnswer, explanation }`.

### Completar examen (`PATCH /api/exams/[id]`)
- Body: `{ status: 'completed' }`
- Calcular `score` usando `scorableCount`.
- Actualizar racha del usuario (`User.currentStreak`, `longestStreak`, `lastPracticeDate`).
- Si el examen ya estaba completado, responder idempotente sin recalcular.
- El cliente redirige a `/review/[id]`.

### Pausar / salir (`PATCH /api/exams/[id]` con `{ status: 'paused' }`)
- El botón "← Exit" del examen pausa y navega a `/history`. El progreso ya está guardado respuesta a respuesta.

### Cancelar examen (`DELETE /api/exams/[id]`)
- Borra el examen y sus `ExamAnswer`. UserStats no se revierten (la práctica realizada cuenta).
- Disponible en History para exámenes `active`/`paused` (componente `CancelExamButton`).

### Seguridad del modo exam
En `exam/[id]/page.tsx`, cuando `mode === 'exam'`, las preguntas multiple/true_false se envían al cliente **sin** `correctAnswer` ni `explanation` (no se puede hacer trampa desde devtools). Las open conservan `explanation` porque es la "respuesta esperada" necesaria para autoevaluarse. En modo practice se envía todo.

### True/False — representación
Las preguntas `true_false` se guardan con `options: []` y `correctAnswer: 'true' | 'false'`. La UI (ExamClient y review) renderiza dos opciones fijas True/False cuyos valores son `'true'`/`'false'`. No guardar options A/B para este tipo.

---

## 11. UI — estados de los nav dots (progreso del examen)

Los nav dots son las píldoras de progreso que viven **inline en `ExamClient.tsx`**. Cada dot representa una pregunta y cambia de color según su estado.

| Estado | Color | Condición |
|--------|-------|-----------|
| `current` | Azul (`--accent`) | Pregunta activa (dot ancho 18px) |
| `correct` | Verde (`scoreColor(100)`) | Respondida correctamente (solo practice) |
| `incorrect` | Rojo (`scoreColor(0)`) | Respondida incorrectamente (solo practice) |
| `skipped` | Amarillo (`#EAB308`) | Marcada como skipped |
| `open-rated` | Verde/Ámbar/Rojo | Open con selfRating: knew/partial/missed |
| `open-pending` | Gris (`--text-3`) | Open revelada pero sin selfRating |
| `answered` | Gris (`--text-3`) | Respondida en modo exam (sin revelar resultado) |
| `unanswered` | Borde (`--border`) | No tocada |

En modo `exam`: solo `current / unanswered / skipped / answered / open-*` durante el examen. `correct/incorrect` se revelan en el resumen.
En modo `practice`: todos los estados en tiempo real.

---

## 12. Dashboard — estadísticas

Todo renderizado en el Server Component `dashboard/page.tsx`, reutilizando `stats-service` y `topic-service`.

1. **Stats row:** 3 tarjetas grandes — accuracy global, preguntas respondidas, racha actual
2. **Needs attention:** sección solo si hay topics con accuracy < 60% (mínimo 5 respondidas); barra por topic
3. **Performance by topic:** barra de progreso + accuracy% para cada topic con intentos
4. **Exámenes recientes:** últimos 5 con ProgressRing, estado y fecha; link a `/review/[id]` o a reanudar
5. **CTA "New Exam":** botón primario al fondo

---

## 13. Página de Review (`/review/[id]`)

Muestra por cada pregunta:
- La pregunta y la respuesta del usuario
- Si fue correcta o no (con color); skipped en gris
- La respuesta correcta y explicación
- El `timeSpentSeconds` de esa pregunta
- Para `open`: el selfRating dado

Al final: score final (con nota de que open questions no cuentan).

---

## 14. Variables de entorno

```bash
# .env.example

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority

# NextAuth v4
NEXTAUTH_SECRET=tu_secret_aqui          # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth — obtener en console.cloud.google.com
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret

# Seed admin
SEED_ADMIN_EMAIL=admin@qaprep.dev
SEED_ADMIN_PASSWORD=cambia_esto

# App
NEXT_PUBLIC_APP_NAME=QAForge
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Configurar Google OAuth:**
1. Ir a `console.cloud.google.com` → APIs & Services → Credentials
2. Crear OAuth 2.0 Client ID (Web application)
3. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (dev) y la URL de Vercel (prod)

---

## 15. Conexión a MongoDB — singleton pattern

`lib/mongodb.ts` expone `connectDB()` con caché global (válido para hot-reload y serverless). La variable `MONGODB_URI` se valida **dentro** de `connectDB()` (lazy), no al importar el módulo — así el build de Vercel y los tests no requieren la env var.

**Regla:** Llamar `await connectDB()` al inicio de cada API Route / Server Component antes de cualquier operación de base de datos.

---

## 16. Convenciones de código

### TypeScript
- Strict mode (`"strict": true`)
- Sin `any` implícito — usar `unknown` cuando el tipo no se conoce
- Todos los tipos en `types/index.ts`
- Props de componentes con interfaces

### Naming
```
Componentes:       PascalCase    → QuestionCard.tsx
Utilidades:        camelCase     → mongodb.ts
Modelos:           PascalCase    → Question.ts
Variables/funcs:   camelCase     → getUserStats()
Constantes:        UPPER_SNAKE   → MAX_EXAM_SIZE
Rutas API:         kebab-case    → /api/exams/[id]/answer
```

### Componentes
- Server Components por defecto
- `"use client"` solo cuando se necesita estado/eventos/hooks del browser
- Separar fetching (Server Components) de interactividad (Client Components)
- Lógica de negocio pura en `lib/services/` (testeable sin DB)

### Manejo de errores en API Routes
```typescript
export async function GET(req: Request) {
  try {
    await connectDB()
    const session = await requireSession()
    if (session instanceof NextResponse) return session
    // lógica aquí
    return ok(result)
  } catch (error) {
    return serverError('GET /api/ruta', error)
  }
}
```

### Formularios y validación
- Zod para validar en frontend (react-hook-form) y en API Routes
- Un schema Zod en `lib/validations.ts`, reutilizado en ambos lados

---

## 17. Seguridad — reglas no negociables

1. **Nunca devolver `passwordHash`** en ninguna respuesta
2. **Verificar ownership** en rutas de examen — un usuario no puede ver/modificar/borrar exámenes de otro
3. **Rutas admin** requieren `session.user.role === 'admin'`, verificar en cada handler (`requireAdmin`)
4. **Sanitizar inputs** con Zod antes de cualquier query a MongoDB; validar ObjectIds con `isValidId`
5. **Modo exam:** no enviar `correctAnswer`/`explanation` al cliente durante el examen (excepto open)
6. **Bulk import** solo accesible por admin — verificar rol en el handler

---

## 18. Seed script

```bash
npm run seed
```

Carga:
1. **Topics:** Selenium WebDriver, Playwright, API Testing, Java Basics, CI/CD, TestNG/JUnit, Test Strategy, SQL for QA, Postman, Agile/Scrum for QA
2. **Al menos 15 preguntas por topic** (mezcla de multiple, true/false y open)
3. **Un usuario admin:** email/password configurables via env `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`

Las preguntas van en `scripts/seed-data.ts`, separadas del script principal.

---

## 19. Decisiones de arquitectura

| Decisión | Razón |
|----------|-------|
| App Router en lugar de Pages Router | Estándar actual de Next.js 14, mejor soporte para Server Components |
| API Routes en Next.js en lugar de Express | Un solo repo, un solo deploy, sin CORS |
| Mongoose en lugar de Prisma | Prisma tiene problemas con serverless y MongoDB; Mongoose más estable |
| NextAuth v4 en lugar de v5 | v5 sigue en beta con breaking changes frecuentes |
| Google OAuth como método principal | Cero fricción de registro, sin gestionar passwords de usuarios |
| Credentials solo para admin | El admin se crea via seed, no necesita OAuth |
| UserStats desnormalizado | Evita aggregations costosas en cada carga del dashboard |
| UserStats con delta incremental | Re-responder/des-skipear nunca duplica contadores |
| topicId desnormalizado en ExamAnswer | Permite queries de stats por topic sin joins |
| Score excluye open questions | Sería injusto penalizar preguntas que dependen de autoevaluación |
| Weighted random sampling | Refuerza puntos débiles automáticamente, haciendo la app realmente útil para aprender |
| Sin currentQuestionIndex | Fuente de desincronización; la posición se deriva de ExamAnswer existentes |
| AppShell compartido (app)/(admin) | Un solo lugar para sidebar/bottom-nav y stats del shell |

---

## 20. Lo que NO está en scope

- Compartir exámenes entre usuarios
- Notificaciones o emails
- Modo multijugador o rankings públicos
- Aplicación móvil nativa
- Importar desde CSV/Excel (se usa JSON)
- Algoritmo SM-2 completo (se usa weighted sampling simplificado por ahora)

---

## 21. Checklist antes de cada PR

- [ ] `npm run type-check` sin errores
- [ ] `npm run lint` sin warnings
- [ ] `npm run test` en verde
- [ ] Variables de entorno nuevas en `.env.example`
- [ ] Modelos Mongoose con tipos TypeScript correctos
- [ ] API Routes con helpers de `lib/api.ts` y `try/catch` estándar
- [ ] Verificación de sesión en rutas protegidas
- [ ] Verificación de rol admin en rutas admin
- [ ] Sin `console.log` de debug en código final
- [ ] CLAUDE.md actualizado si cambió arquitectura

---

*Última actualización: 2026-06-11 — revisión completa: admin movido a /admin/questions, DELETE de exámenes (cancelar), skip de preguntas, UserStats con delta incremental, AppShell compartido, helpers lib/api.ts, modo exam sin respuestas en el payload del cliente, sign out, deploy gratuito documentado en README.*
