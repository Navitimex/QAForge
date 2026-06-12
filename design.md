# QAForge — Design System

> Fuente de verdad visual del proyecto.
> Extraído del prototipo `QAForge.html` y reconciliado con la arquitectura de `CLAUDE.md`.
> Actualizar cuando cambien tokens, componentes o pantallas.

---

## 1. Design Tokens

### 1.1 Colores

#### Tema dark (por defecto)
| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | `#0C0C13` | Fondo exterior del shell, páginas |
| `--surface` | `#0F0F18` | Sidebar, fondo body exterior (dark) |
| `--card` | `#141421` | Cards, inputs, option cards |
| `--border` | `#1C1C2C` | Separadores, bordes de cards/inputs |
| `--accent` | `#4A88EF` | Primario: botón principal, focus, selección |
| `--text` | `#EDEDF5` | Texto principal |
| `--text-2` | `#74748E` | Texto secundario, labels, placeholders |
| `--text-3` | `#38384E` | Texto deshabilitado, timestamps, separadores |

#### Tema light
| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | `#F4F4FA` | Fondo de pantallas |
| `--surface` | `#ECECF5` | Sidebar |
| `--card` | `#FFFFFF` | Cards, inputs |
| `--border` | `#E0E0EE` | Separadores |
| `--accent` | `#3B7BE8` | Primario (ligeramente más oscuro que dark) |
| `--text` | `#0F0F1E` | Texto principal |
| `--text-2` | `#62628A` | Texto secundario |
| `--text-3` | `#ABABCC` | Texto deshabilitado |

> **Nota light:** `body` background = `#D4D4E8`, `#app-shell` tiene `box-shadow: 0 24px 60px rgba(0,0,0,0.13)`.

#### Colores semánticos fijos (no dependen del tema)
| Color | Uso |
|-------|-----|
| `#EAB308` | Streak (racha de días) |
| `#FFFFFF` | Texto sobre `--accent` o botón primary |

#### scoreColor — gradiente HSL dinámico
```typescript
// Fórmula exacta del prototipo (lib/utils.ts o inline donde se use)
function scoreColor(p: number): string {
  const h = p <= 50 ? (p / 50) * 52 : 52 + ((p - 50) / 50) * 90
  return `hsl(${Math.round(h)}, 75%, 57%)`
}
function scoreColorDim(p: number): string {
  const h = p <= 50 ? (p / 50) * 52 : 52 + ((p - 50) / 50) * 90
  return `hsla(${Math.round(h)}, 75%, 57%, 0.12)`
}
```

| Valor de `p` | H (hue) | Color resultante |
|---|---|---|
| 0% | 0° | Rojo |
| 25% | 26° | Naranja |
| 50% | 52° | Ámbar/amarillo |
| 75% | 97° | Verde lima |
| 100% | 142° | Verde |

**Umbral de rendimiento (de `CLAUDE.md` sección 8):**
- **≥ 70%** → Verde (`scoreColor(70~100)`)
- **40–69%** → Ámbar (`scoreColor(40~69)`)
- **< 40%** → Rojo (`scoreColor(0~39)`)
- **< 60%** → Umbral "weak topic" (alerta/CTA en Dashboard)

---

### 1.2 Tipografía

**Fuentes:**
- **DM Sans** — cuerpo de texto, labels, botones, metadata
- **Space Grotesk** — números grandes, títulos principales, displays de score

```html
<!-- Google Fonts (reemplazar con next/font/google en Next.js) -->
DM Sans: opsz 9..40, weights 400 / 500 / 600 / 700
Space Grotesk: weights 500 / 600 / 700
```

**Escala de tamaños observados:**

| Uso | Tamaño | Peso | Fuente | Notas |
|-----|--------|------|--------|-------|
| Section label (SL) | 10px | 700 | DM Sans | uppercase, letter-spacing: 0.1em |
| Chip text | 10px | 600 | DM Sans | uppercase, letter-spacing: 0.04em |
| Timestamp / metadata pequeña | 11px | 400 / 500 | DM Sans | — |
| Score label chico, avg label | 10px | 600 | DM Sans | uppercase |
| Texto secundario, descripciones | 12px | 400 / 500 | DM Sans | — |
| Cuerpo principal, opciones | 13–14px | 400 / 500 | DM Sans | line-height: 1.55–1.65 |
| Botones | 12–15px | 600 | DM Sans | letter-spacing: -0.01em |
| Nav items sidebar | 13px | 400 / 600 | DM Sans | — |
| Headers de pantalla (mobile) | 17–18px | 700 | Space Grotesk | letter-spacing: -0.02em |
| Headers de pantalla (desktop) | 20–22px | 700 | Space Grotesk | letter-spacing: -0.04em |
| Score grande en Results | 24–26px | 700 | Space Grotesk | letter-spacing: -0.04em |
| Stats numbers en Dashboard | 26–28px | 700 | Space Grotesk | letter-spacing: -0.04em |
| Score en History card | 22px | 700 | Space Grotesk | letter-spacing: -0.03em |
| Score en ring SVG | ~21% del tamaño del ring | 700 | Space Grotesk | calculado: `size * 0.21` |

**Configuración base:**
```css
font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
-webkit-font-smoothing: antialiased;
```

---

### 1.3 Border Radius

| Valor | Usos observados |
|-------|-----------------|
| 5–6px | Badges inline (Chip, score badge en review) |
| 7–8px | Botones sm, labels de opción, select, nav items |
| 9–10px | Botones md, inputs, difficulty/mode selectors, week topics card |
| 10–11px | Botones lg, mode cards, score stats en Results |
| 12px | OptionCard, answer reveal card, review accordion items, history card, import area |
| 18px | Shell desktop completo, sidebar (top-left/bottom-left) |
| 50% | Avatar circular |
| 99px | Progress bar (Bar component) |

---

### 1.4 Spacing

**Padding estándar por breakpoint:**
| Zona | Mobile | Desktop |
|------|--------|---------|
| Header de pantalla | `22–28px 20px` | `32px 40px` |
| Contenido principal | `16–24px 20px` | `24–32px 40px` |
| Nav footer action | `12px 20px 28px` | `14–16px 40px 28px` |
| Sidebar (interna) | — | `12–20px` horizontal |

**Gaps comunes:** 4px, 6px, 7px, 8px, 10px, 12px, 14px, 16px, 20px, 22px, 24px, 28px, 36px, 40px.

---

### 1.5 Alturas fijas / dimensiones de shell

| Elemento | Valor |
|----------|-------|
| Shell móvil max-width | 430px |
| Shell desktop max-width | 1080px |
| Shell desktop max-height | `min(820px, 100dvh - 48px)` |
| Shell desktop border-radius | 18px |
| Shell desktop border | `1px solid rgba(255,255,255,0.055)` |
| Shell desktop shadow | `0 40px 90px rgba(0,0,0,0.72)` |
| Sidebar width (expandida) | 200px |
| Sidebar logo area height | 103px |
| Mobile bottom nav height | 58px |
| Breakpoint desktop | 768px |
| Avatar usuario | 32px × 32px |
| Botón toggle sidebar | 28px × 28px (circular) |

---

### 1.6 Animación

```css
/* Animación de entrada de pantalla (.screen) */
@keyframes si {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.screen { animation: si 0.22s cubic-bezier(0.22, 1, 0.36, 1) both; }

/* Transición sidebar */
transition: width 0.22s cubic-bezier(0.22, 1, 0.36, 1);

/* Transición barra de progreso */
transition: width 0.5s ease;

/* Transición ring de score */
transition: stroke-dashoffset 1s ease;
```

---

## 2. Layout y Shell

### 2.1 Estructura del shell

```
┌─────────────────────────────────────────┐  ← #app-shell
│ ┌──────────┐ ┌───────────────────────┐  │
│ │ sidebar  │ │    content-area       │  │  ← desktop
│ │ (200px)  │ │  (flex: 1, scroll)    │  │
│ └──────────┘ └───────────────────────┘  │
└─────────────────────────────────────────┘

Mobile (< 768px):
┌─────────────────────────────────────────┐
│            content-area                 │
│         (flex: 1, scroll)               │
├─────────────────────────────────────────┤
│         mobile-nav (58px)               │
└─────────────────────────────────────────┘
```

### 2.2 Sidebar (desktop únicamente)

**Secciones de arriba a abajo:**
1. **Logo** (height: 103px, padding 20px): ícono checkmark en caja 22×22px `--accent` + texto "QAForge" Space Grotesk 14px bold.
2. **Nav** (flex: 1, padding 10–12px): 4 items (Dashboard, History, Add Question, New Exam). Item activo: bg `rgba(255,255,255,0.06)`, color `--text`, font 600. Inactivo: color `--text-2`, opacity 0.6 en ícono.
3. **Perfil de usuario**: avatar circular 32px (iniciales en `--accent` si no hay imagen), nombre 13px/600, email 11px `--text-3`.
4. **Stats globales**: streak (🔥 `#EAB308`), toggle de tema (botón 28px), accuracy global con `Bar`.
5. **Botón colapsar** (posición absoluta): círculo 28px con borde, `top: 37px`, `left: calc(200px - 14px)` expandida / `14px` colapsada. Animación `left` con misma curva del sidebar. Ícono `<` que rota 180° cuando está colapsado.

### 2.3 Mobile bottom nav

4 items: Home (Dashboard), History, Add (+), Exam (grid). Item activo color `--accent`. Inactivo `--text-3`. Label 9px/600 uppercase. Ícono 19px.

### 2.4 Footer de acción (CTA)

Patrón recurrente en pantallas: botón primario flotante fijo al fondo con gradiente encima del contenido scroll:
```css
background: linear-gradient(to top, var(--bg) 60%, transparent);
padding: 12px 20px 28px; /* mobile */
padding: 14-16px 40px 28px; /* desktop */
```

---

## 3. Primitivas UI

### 3.1 `Btn`

```typescript
interface BtnProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'green'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  style?: CSSProperties
}
```

| Size | Padding | Font | Radius |
|------|---------|------|--------|
| `sm` | 6px 12px | 12px/600 | 8px |
| `md` | 10px 16px | 14px/600 | 10px |
| `lg` | 13px 20px | 15px/600 | 11px, width 100% |

| Variant | Background | Color | Border |
|---------|-----------|-------|--------|
| `primary` | `--accent` | `#fff` | ninguno |
| `secondary` | transparent | `--text` | `1px solid --border` |
| `ghost` | transparent | `--text-2` | `1px solid --border` |
| `green` | `scoreColor(100)` | `#fff` | ninguno |

- `disabled`: `opacity: 0.38`, `cursor: not-allowed`
- Transición: `opacity 0.12s`
- Sin tap-highlight (mobile)

**Clases Tailwind equivalentes (referencia):**
```
primary: "bg-accent text-white font-semibold"
secondary: "bg-transparent text-text border border-border font-semibold"
ghost: "bg-transparent text-text-2 border border-border font-semibold"
sm: "px-3 py-1.5 text-xs rounded-lg"
md: "px-4 py-2.5 text-sm rounded-[10px]"
lg: "px-5 py-3 text-[15px] rounded-[11px] w-full"
```

---

### 3.2 `Bar` (ProgressBar)

```typescript
interface BarProps {
  value: number
  max?: number   // default 100
  color?: string // default --accent
  h?: number     // height en px, default 2
}
```

- Track: `--border`, border-radius 99px
- Fill: color prop, border-radius 99px, `transition: width 0.5s ease`
- Ancho: `Math.min(100, max > 0 ? (value / max) * 100 : 0)%`

---

### 3.3 `Ring` (ProgressRing / ScoreRing)

```typescript
interface RingProps {
  score: number  // 0–100
  size?: number  // default 128px
  sw?: number    // strokeWidth, default 8
}
```

- SVG con dos círculos: track (`--border`) + fill (color de `scoreColor(score)`).
- Rotado -90° para empezar desde arriba.
- Dasharray y dashoffset calculados del radio.
- Centro: score% en Space Grotesk bold, `size * 0.21` px, color del ring.
- `transition: stroke-dashoffset 1s ease`

---

### 3.4 `TopicChip`

Botón pill para selección de topics.
- No seleccionado: borde `1.5px solid --border`, bg transparente, color `--text-2`
- Seleccionado: borde `1.5px solid topic.color`, bg `topic.color + '18'`, color `topic.color`
- `padding: 7px 13px`, `border-radius: 99px`, `font-size: 13px / 500`

---

### 3.5 `OptionCard`

Opciones de múltiple choice y true/false.

```typescript
type OptionState = 'default' | 'selected' | 'correct' | 'wrong'
interface OptionCardProps {
  label: string     // 'A' | 'B' | 'C' | 'D' | '✓' | '✗'
  text: string
  state?: OptionState
  onClick?: () => void
}
```

| State | BG | Border | Label BG | Label Color | Text Color |
|-------|----|----|--------|------------|-----------|
| `default` | transparent | `--border` | `--card` | `--text-2` | `--text` |
| `selected` | `rgba(74,136,239,0.08)` | `--accent` | `--accent` | `#fff` | `--text` |
| `correct` | `scoreColorDim(100)` | `scoreColor(100)` | `scoreColor(100)` | `#fff` | `--text` |
| `wrong` | `scoreColorDim(0)` | `scoreColor(0)` | `scoreColor(0)` | `#fff` | `--text-2` |

- Layout: flex row, gap 12px, `padding: 12px 14px`, `border-radius: 12px`
- Label box: `min-width: 26px`, `height: 26px`, `border-radius: 7px`, `font-size: 12px / 700`
- Text: `font-size: 14px`, `line-height: 1.55`, `text-wrap: pretty`
- `cursor: pointer` solo si `onClick` definido

---

### 3.6 `Chip`

Badge inline pequeño para tipo/modo/dificultad.
```typescript
interface ChipProps {
  children: ReactNode
  color?: string  // si se pasa: bg = color+'18', text = color
                  // si no: bg = --card, text = --text-3
}
```
- `padding: 2px 7px`, `border-radius: 5px`, `font-size: 10px / 600`
- `text-transform: uppercase`, `letter-spacing: 0.04em`

---

### 3.7 `SL` (Section Label)

Label de sección en uppercase:
- `font-size: 10px`, `font-weight: 700`, `letter-spacing: 0.1em`
- `text-transform: uppercase`, `color: --text-3`
- `margin-bottom: 14px`

---

### 3.8 Íconos SVG

Todos son SVG inline, `stroke="currentColor"`, `fill="none"` (excepto Flame y IcoPlus/IcoMinus que usan `fill` en algunos casos).

| Nombre | Tamaño default | Uso principal |
|--------|---------------|---------------|
| `IcoLeft` | 18px | Back button, sidebar arrow |
| `IcoDown` | 14px | Accordion toggle (rota 180° cuando abierto) |
| `IcoRight` | 15px | Arrow en botones CTA, next |
| `IcoPlus` | 16px | New exam, add |
| `IcoMinus` | 16px | Decrementar count |
| `IcoClock` | 14px | Timer, history, tiempo por pregunta |
| `IcoFlame` | 14px | Streak (fill, no stroke) |
| `IcoRotate` | 14px | Retry / retake |
| `IcoBook` | 14px | Review |
| `IcoEye` | 14px | Ver respuesta modelo (open questions) |
| `IcoGrid` | 15px | Dashboard / Home |
| `IcoSun` | 14px | Toggle a light mode |
| `IcoMoon` | 14px | Toggle a dark mode |
| `IcoPencil` | 14px | Add Question / Admin |

> En Next.js, usar `lucide-react` como sustituto con íconos equivalentes. El `CLAUDE.md` sección Topic define `icon: string` como nombre de icono de lucide-react.

---

## 4. Pantallas — Especificaciones

### 4.1 Login (`/login`)

**Propósito:** única pantalla de la zona `(auth)` — sin sidebar ni bottom nav.

**Layout:** centrado vertical + horizontal, fondo `--bg`.

**Contenido:**
- Logo QAForge (ícono + texto)
- Título: "Bienvenido" o "Sign in"
- Botón principal: "Continuar con Google" (full width, variant primary, ícono Google)
- **Admin access (oculto/discreto):** un enlace o sección colapsable "Admin login" que muestra un pequeño form email + password. No debe parecer login público para usuarios normales.

---

### 4.2 Dashboard (`/dashboard`)

**Mobile:**
```
┌─────────────────────────────────┐
│ Logo label (10px)  [theme][🔥5] │  ← header row
│ Hello, [Name]                   │
├─────────────────────────────────┤
│ 24 exams  64% accuracy  2 weak  │  ← stats row (3 números grandes)
├─────────────────────────────────┤
│ PERFORMANCE BY TOPIC            │
│ Selenium       62% ████████░░   │
│ Playwright     75% ████████████ │
│ ...                             │
├─────────────────────────────────┤
│ RECENT EXAMS                    │
│ [card] API Testing · practice · │
│        5q · 2h ago          80% │
│ ...                             │
└─────────────────────────────────┘
│ [+ New Exam]  ← CTA flotante    │
```

**Desktop:** dos columnas. Izquierda: stats row + Performance by topic. Derecha: Recent exams + Weak topics alert card.

**Stats row:** 3 valores grandes Space Grotesk (exams totales, accuracy global, # weak topics). Colores: accuracy → `scoreColor(gPct)`, weak → rojo si >0, verde si 0.

**Topic row (Performance by topic):**
- Nombre (13px/500) + porcentaje (`scoreColor(p)`, Space Grotesk) en la misma línea
- `Bar` con altura 2px, color `scoreColor(p)`, debajo

**Recent exams:** lista con borde/divisores. Cada fila: nombre de topics, chips (mode, count), timestamp → score grande a la derecha con `scoreColor`.

**Weak topics alert card** (solo si hay topics < 60%):
- Borde `--card`, padding 14px, título en rojo "N topics to review"
- Por cada topic débil: nombre + porcentaje + Bar
- Umbral: accuracy < 60%

---

### 4.3 New Exam / Config (`/exam/new`)

**Secciones (scroll):**
1. **Topics:** chips filtrables por topic. Mensaje "Select at least one topic" si ninguno.
2. **Difficulty:** grid 4 columnas (Mixed / Easy / Medium / Hard). Botón toggle con borde accent + bg accent/10 cuando activo.
3. **Mode:** grid 2 columnas. Cards con título + descripción.
   - `Practice` → "Instant feedback"
   - `Exam` → "Results at the end"
4. **Questions:** stepper numérico (– / número / +). Mín 5, máx 20 (o `avail` si menor). Mensaje dinámico de disponibilidad.

**CTA footer:** botón "Start →" deshabilitado si no hay topic o no hay preguntas disponibles.

**Desktop:** max-width 560px para el form, alineado a la izquierda.

---

### 4.4 Exam (`/exam/[id]`)

**Header (fijo):**
- Back button (← exit exam)
- Progress bar (preguntas respondidas / total)
- Contador "X/N" (Space Grotesk)
- Timer (solo modo `exam`): `MM:SS` con borde rojo si < 60s

**Sub-header:**
- Chip de dificultad (easy/medium/hard con `scoreColor`)
- Chip de tipo (Multiple / T•F / Open)
- Nombre del topic (12px, `--text-3`)

**Contenido (scroll):**
- Texto de la pregunta (16–17px/500, `line-height: 1.65`, `text-wrap: pretty`)
- Opciones según tipo:
  - **Multiple:** lista vertical de `OptionCard`
  - **True/False:** grid 2 columnas con OptionCard (label ✓ / ✗)
  - **Open:** botón "View model answer" → al revelar: card con respuesta + self-rating buttons

**Self-rating (preguntas open):**
- "How did you do?" (12px, `--text-3`, centrado)
- 3 botones en grid: "Knew it" (verde) / "Partial" (ámbar) / "Didn't know" (rojo)
- Colores usando `scoreColor` + borde `38` alpha + `scoreColorDim` de fondo

**Panel de explicación** (modo practice, después de responder múltiple/TF):
- Card con "Model answer" → texto explicación en `--text-2`, `line-height: 1.8`

**Footer de navegación:**
- `←` (prev, deshabilitado en primera) + botón principal
- Última pregunta: "Finish exam" variant `green`
- Resto: "Next →" variant `primary`

**Desktop:** max-width 680px para el contenido.

---

### 4.5 Results (`/review` — pantalla de resultados)

**Centrado vertical.**

**Contenido:**
1. `Ring` (size 132 mobile / 150 desktop, sw 9) con el score calculado
2. Título: "Passed!" (≥60%) / "Keep practicing" (<60%) / "Completed" (solo open)
3. Subtítulo: "X of N evaluable questions" o "Open questions only"
4. Grid 4 columnas con stats: Correct (verde) / Wrong (rojo) / Time total / Avg/q
5. Nota si hay open questions: "Open questions are not scored" (12px, `--text-3`)

**Footer (3 botones stacked):**
1. "Review answers" (primary)
2. "Try again" (secondary)
3. "New exam" (ghost)

---

### 4.6 Review (`/review/[id]`)

**Header:** back button + título "Review".

**Lista (acordeón):**
Cada pregunta como item con toggle:
- Collapsed: número de pregunta (badge coloreado Q1/Q2...) + texto truncado + resultado (Correct/Wrong/Knew it/Partial/...) + chevron
- Expanded: tu respuesta (si aplica, badge coloreado) + respuesta correcta (si fallaste) + explicación + tiempo en segundos

**Colores por resultado:**
- Correct / Knew it: `scoreColor(100)`
- Wrong / Didn't know: `scoreColor(0)`
- Partial: `scoreColor(50)`
- Not answered / Open sin rating: `--text-3`

**Badge Q#:** fondo `color + '1A'`, texto `color`.
**Chevron:** rota 180° al abrir con `transition: transform 0.18s`.

**Desktop:** max-width 680px.

---

### 4.7 History (`/history`)

**Header:** título "Historial" + contador "(N exams)".

**Empty state:** ícono reloj grande (opacity 0.25) + "No exams yet" + "Complete your first exam..." + botón "New Exam".

**Lista de cards** (gap 8px):
- Nombre de topics (13px/600) + chips (mode, count) + timestamp relativo
- Score grande (`scoreColor`) a la derecha; si solo open: "Solo abiertas"
- `Bar` de score (h=2)
- 2 botones: "Review" (secondary) + "Retake" (primary), tamaño sm

**Timestamp relativo:** "Xm ago" / "Xh ago" / "Xd ago" / fecha locale.

---

### 4.8 Add Question — Admin (`/admin/questions`)

**Solo visible si `role === 'admin'`** (ruta y nav item).

**Tabs (toggle interno):** "Manual" | "Import JSON"
- Selector estilo pill con fondo `--surface`, botón activo `--card` + shadow.

#### Tab Manual:
1. **Topic:** select nativo (styled)
2. **Difficulty:** grid 3 columnas (Easy/Medium/Hard)
3. **Type:** grid 3 columnas (Multiple / T•F / Open)
4. **Question:** textarea
5. **Options** (solo si Multiple): 4 inputs con label letter clickeable para marcar correcta (fondo `--accent` cuando seleccionada)
6. **Correct answer** (solo si T•F): 2 botones (True verde / False rojo)
7. **Explanation:** textarea

**Estado saved:** reemplaza el botón con banner verde "Question saved" por 2s.

#### Tab Import JSON:
1. Card con formato JSON esperado (previewpre con Space Grotesk/mono)
2. Drop zone dashed: sube archivo `.json`
3. Textarea: pegar JSON
4. Error state: banner rojo + mensaje
5. Preview state: lista de preguntas parseadas (texto truncado a 80 chars + chips tipo/difficulty)
6. CTA: "Import N questions" habilitado solo en preview state con ≥1 pregunta
7. Estado done: banner verde "N questions imported" por 2.5s

---

## 5. Estados del Examen (Progress / Nav dots)

Estos estados se usan en los **nav dots inline de `ExamClient.tsx`** — la barra de píldoras que muestra el progreso pregunta a pregunta sobre el área de contenido del examen. No existe un componente `ExamLeftMenu` separado.

| Estado | Tailwind class sugerida | Color | Condición |
|--------|------------------------|-------|-----------|
| `current` | `ring-2 ring-accent` | `--accent` (azul) | Pregunta activa actualmente |
| `correct` | `bg-green-500/15 text-green-400` | `scoreColor(100)` verde | Respondida correctamente |
| `incorrect` | `bg-red-500/15 text-red-400` | `scoreColor(0)` rojo | Respondida incorrectamente |
| `skipped` | `bg-yellow-400/15 text-yellow-400` | `#EAB308` ámbar | Marcada como skipped |
| `open-rated` | `bg-purple-500/15 text-purple-400` | `#A855F7` púrpura | Open con selfRating completado |
| `open-pending` | `bg-surface text-text-3` | `--text-3` gris claro | Open revelada pero sin selfRating |
| `unanswered` | `bg-transparent text-text-3 border border-border` | gris | No tocada |

**Reglas por modo (CLAUDE.md sección 11):**
- Modo `practice`: todos los estados visibles en tiempo real.
- Modo `exam`: solo `current / unanswered / skipped / open-*` durante el examen. `correct/incorrect` se revelan al completar.

---

## 6. Guía de Traslado a Next.js + Tailwind

### 6.1 Tokens como CSS variables + Tailwind theme extend

**`app/globals.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root,
  [data-theme="dark"] {
    --bg:      #0C0C13;
    --surface: #0F0F18;
    --card:    #141421;
    --border:  #1C1C2C;
    --accent:  #4A88EF;
    --text:    #EDEDF5;
    --text-2:  #74748E;
    --text-3:  #38384E;
  }
  [data-theme="light"] {
    --bg:      #F4F4FA;
    --surface: #ECECF5;
    --card:    #FFFFFF;
    --border:  #E0E0EE;
    --accent:  #3B7BE8;
    --text:    #0F0F1E;
    --text-2:  #62628A;
    --text-3:  #ABABCC;
  }
  html, body {
    @apply bg-[#06060D] text-text;
    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    height: 100%; height: 100dvh;
    overscroll-behavior: none;
  }
  * {
    scrollbar-width: none;
    -webkit-tap-highlight-color: transparent;
  }
  ::-webkit-scrollbar { width: 0; height: 0; }
}
```

**`tailwind.config.ts`:**
```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg:      'var(--bg)',
        surface: 'var(--surface)',
        card:    'var(--card)',
        border:  'var(--border)',
        accent:  'var(--accent)',
        text:    'var(--text)',
        'text-2': 'var(--text-2)',
        'text-3': 'var(--text-3)',
      },
      fontFamily: {
        sans:    ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        shell: '18px',
      },
    },
  },
  plugins: [],
} satisfies Config
```

**`app/layout.tsx` (fuentes):**
```typescript
import { DM_Sans, Space_Grotesk } from 'next/font/google'

const dmSans = DM_Sans({
  subsets: ['latin'],
  axes: ['opsz'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
})
// Aplicar: <html className={`${dmSans.variable} ${spaceGrotesk.variable}`} data-theme="dark">
```

---

### 6.2 Theme toggle

El tema se gestiona con `data-theme` en `<html>`. Implementar con un **Client Component** `ThemeProvider` que:
1. Lee el tema de `localStorage` (key `qaf-theme`) al montar.
2. Aplica `document.documentElement.setAttribute('data-theme', theme)`.
3. Expone `toggleTheme()` vía Context.
4. Evitar hydration mismatch con `suppressHydrationWarning` en `<html>`.

---

### 6.3 Animación de pantalla

Aplicar clase `screen` (definida en globals.css) a cada `<div>` raíz de pantalla Server/Client Component.

---

### 6.4 Shell responsive

```tsx
// app/(app)/layout.tsx
<div id="app-shell" className="
  max-w-[430px] md:max-w-[1080px]
  h-dvh md:h-[min(820px,calc(100dvh-48px))]
  mx-auto md:m-auto
  bg-bg overflow-hidden relative
  md:rounded-shell md:border md:border-white/5
  md:shadow-[0_40px_90px_rgba(0,0,0,0.72)]
  md:flex md:flex-row
">
  <AppSidebar />
  <div className="flex-1 overflow-hidden h-full relative bg-bg md:rounded-r-shell">
    {children}
  </div>
</div>
```

---

### 6.5 Componentes — donde viven

| Primitiva del HTML | Componente Next.js | Ruta |
|-------------------|--------------------|------|
| `Btn` | `Button` | `components/ui/Button.tsx` |
| `Bar` | `ProgressBar` | `components/ui/ProgressBar.tsx` |
| `Ring` | `ProgressRing` | `components/ui/ProgressRing.tsx` |
| `TopicChip` | `TopicChip` | `components/ui/TopicChip.tsx` |
| `OptionCard` | `OptionCard` | `components/ui/OptionCard.tsx` |
| `Chip` | `Badge` | `components/ui/Badge.tsx` |
| `SL` | `SectionLabel` | `components/ui/SectionLabel.tsx` |
| Íconos inline | `lucide-react` | inline en components |
| `AppSidebar` | `AppSidebar` | `components/layout/AppSidebar.tsx` (client) |
| `MobileNav` | `MobileNav` | `components/layout/MobileNav.tsx` (client) |
| `scoreColor/scoreColorDim` | funciones | `lib/utils.ts` |

---

### 6.6 Server vs Client Components

| Componente | Tipo | Razón |
|-----------|------|-------|
| Páginas de dashboard, history, review | **Server** | Fetch de datos desde API/DB directo |
| `ExamScreen`, `ConfigScreen` | **Client** | Estado local rico (respuestas, timer, posición) |
| `AppSidebar`, `MobileNav` | **Client** | Navegación activa, toggle sidebar |
| `ThemeProvider` | **Client** | `localStorage` + `document.documentElement` |
| `SessionProvider` | **Client** | NextAuth requiere contexto de cliente |
| Formularios (Add Question, Login) | **Client** | `useState`, `react-hook-form` |
| Todos los demás components/ui | **Server** por defecto | Sin estado/eventos del browser |

---

### 6.7 `scoreColor` en Tailwind

`scoreColor` devuelve HSL dinámico que no puede estar en clases estáticas de Tailwind. Usar **CSS variables inline** o la función directamente en `style={}`:

```tsx
// Opción A: inline style (igual que el prototipo)
<span style={{ color: scoreColor(score) }}>{score}%</span>

// Opción B: CSS variable inline + clase Tailwind
<span style={{ '--score-color': scoreColor(score) } as CSSProperties}
  className="text-[var(--score-color)]">
  {score}%
</span>
```

No intentar mapear el gradiente a clases de Tailwind arbitrarias — mantenlo como función de utilidad.

---

*Última actualización: generado automáticamente desde QAForge.html — Fase 1 del plan de desarrollo.*
