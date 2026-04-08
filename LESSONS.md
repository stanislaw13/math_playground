# Creating Lessons in Math Playground

There are two ways to create a lesson. Use whichever fits the complexity of what you're building.

| | Single-file approach | Multi-file approach |
|---|---|---|
| **Best for** | New lessons you write yourself | Complex lessons with many components |
| **Files to create** | 1 | 5–10+ |
| **i18n required** | ❌ (inline EN + PL) | ✅ (en.json + pl.json) |
| **Live example** | `src/lessons/fractions.lesson.tsx` | `src/app/[locale]/primary/areas/` |

---

## Approach 1: Single-file lesson

Everything — metadata, explorers, games, translations — lives in one file at `src/lessons/{name}.lesson.tsx`. The route and listing page are automatic.

### Step 1 — Create the lesson file

```
src/lessons/my-topic.lesson.tsx
```

Minimal skeleton:

```tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { LessonDef, MatchPairItem } from "@/components/lessons/types";

const MatchPairsGame = dynamic(
  () => import("@/components/lessons/games/MatchPairsGame"),
  { ssr: false }
);

// ─── Explorer component (interactive theory) ────────────────────────────────

function MyExplorer({ locale = "en" }: { locale?: string }) {
  const pl = locale === "pl";
  const [value, setValue] = useState(5);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <h3 className="mb-4 text-lg font-semibold">
        {pl ? "Mój eksplorер" : "My Explorer"}
      </h3>
      <p className="mb-2 text-[var(--color-text-secondary)]">Value: {value}</p>
      <input
        type="range" min={1} max={10} value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

// ─── Match pairs generator ───────────────────────────────────────────────────

function generatePairs(): MatchPairItem[] {
  return [
    { left: "1/2", right: "0.5" },
    { left: "1/4", right: "0.25" },
    { left: "3/4", right: "0.75" },
    { left: "1/5", right: "0.2" },
    { left: "2/5", right: "0.4" },
    { left: "4/5", right: "0.8" },
  ];
}

// ─── Lesson definition ───────────────────────────────────────────────────────

const myLesson: LessonDef = {
  id: "primary-my-topic",          // "primary-" or "highschool-" prefix
  slug: "my-topic",                // URL segment: /primary/my-topic
  category: "primary",
  order: 4,                        // position in the listing (1 = first)

  title: { en: "My Topic", pl: "Mój temat" },
  description: {
    en: "A short description of the lesson",
    pl: "Krótki opis lekcji",
  },

  games: ["my-topic-match"],       // must match gameId props below

  formulas: [
    { label: { en: "Formula", pl: "Wzór" }, latex: "a^2 + b^2 = c^2" },
  ],

  sections: (locale) => {
    const pl = locale === "pl";
    return [
      // Section 1 — interactive theory
      <div key="s1">
        <h2 className="mb-2 text-2xl font-bold">
          {pl ? "Wstęp" : "Introduction"}
        </h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">
          {pl ? "Tekst w języku polskim." : "Introductory text here."}
        </p>
        <MyExplorer locale={locale} />
      </div>,

      // Section 2 — game
      <div key="s2" className="flex items-start justify-center">
        <div className="w-full max-w-3xl">
          <MatchPairsGame
            gameId="my-topic-match"
            lessonId="primary-my-topic"
            title={pl ? "Dopasuj pary" : "Match the pairs"}
            description={pl ? "Znajdź pasujące pary." : "Find the matching pairs."}
            generatePairs={generatePairs}
            gridCols={4}
          />
        </div>
      </div>,
    ];
  },
};

export default myLesson;
```

### Step 2 — Register in `src/content/lessons.ts`

Add two lines:

```ts
import myLesson from "@/lessons/my-topic.lesson";

export const lessons: LessonMeta[] = [
  // ... existing lessons ...
  registerLesson(myLesson),    // ← append, never reorder existing entries
];
```

**That's it.** The route `/[locale]/primary/my-topic` and listing card are automatic.

---

## Approach 2: Multi-file lesson (traditional)

Use this when the lesson is complex enough that a single file would be unwieldy — many explorers, multiple custom game types, SVG diagrams, etc. This is how `areas` and `decimals` are built.

### Step 1 — Register in `src/content/lessons.ts`

```ts
{
  id: "primary-my-topic",
  titleKey: "primary.myTopic.title",
  descriptionKey: "primary.myTopic.description",
  path: "/primary/my-topic",
  category: "primary",
  order: 4,
  games: ["game-a", "game-b", "game-c", "game-d"],
},
```

### Step 2 — Add translations

`src/messages/en.json` — add new keys (never modify existing ones):
```json
{
  "primary": {
    "myTopic": {
      "title": "My Topic",
      "description": "A short description"
    }
  },
  "myTopic": {
    "title": "My Topic",
    "introText": "Introductory paragraph...",
    "formulaLabel1": "Area",
    "gameTitle": "Find the Value",
    "gameDesc": "Solve for the missing value.",
    "questionOf": "Question {current} of {total}",
    "yourAnswer": "Your answer",
    "check": "Check",
    "correct": "Correct!",
    "incorrect": "Try again.",
    "keepPracticing": "Keep practising"
  }
}
```

`src/messages/pl.json` — same keys, Polish values.

### Step 3 — Create the lesson page

`src/app/[locale]/primary/my-topic/page.tsx`

```tsx
"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import LessonShell from "@/components/lessons/LessonShell";
import { MyExplorer } from "@/components/lessons/my-topic/MyExplorer";
import type { LessonConfig } from "@/components/lessons/types";

const MyGame = dynamic(
  () => import("@/components/lessons/my-topic/MyGame"),
  { ssr: false }
);

export default function MyTopicPage() {
  const t = useTranslations("myTopic");

  const config: LessonConfig = {
    id: "primary-my-topic",
    sections: [],
    formulas: [
      { label: t("formulaLabel1"), latex: "A = \\frac{1}{2} b h" },
    ],
  };

  return (
    <LessonShell config={config}>
      {[
        <div key="s1">
          <h2 className="mb-2 text-2xl font-bold">{t("title")}</h2>
          <p className="mb-6 text-[var(--color-text-secondary)]">{t("introText")}</p>
          <MyExplorer />
        </div>,

        <div key="s2" className="flex items-start justify-center">
          <MyGame />
        </div>,
      ]}
    </LessonShell>
  );
}
```

### Step 4 — Create components

`src/components/lessons/my-topic/`

Each file in this directory is a lesson-specific component. See the component patterns below.

---

## Component Patterns

### Interactive Explorer

An explorer is a theory section with live controls — sliders, inputs, graphs. Students manipulate values and see immediate visual feedback.

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
// import { Mafs, Coordinates, Point } from "mafs";  ← for graphs
// import "mafs/core.css";

export function MyExplorer() {
  const t = useTranslations("myTopic");
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);

  const result = Math.sqrt(a ** 2 + b ** 2);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <h3 className="mb-4 text-lg font-semibold">{t("explorerTitle")}</h3>

      {/* Visual output */}
      <p className="mb-6 text-center font-mono text-xl">
        {a}² + {b}² = <span className="text-[var(--color-accent)]">{result.toFixed(2)}</span>²
      </p>

      {/* Controls */}
      <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">a = {a}</label>
      <input type="range" min={1} max={10} value={a}
        onChange={(e) => setA(Number(e.target.value))} className="mb-4 w-full" />

      <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">b = {b}</label>
      <input type="range" min={1} max={10} value={b}
        onChange={(e) => setB(Number(e.target.value))} className="w-full" />
    </div>
  );
}
```

**Available visual libraries:**
- **Mafs** — interactive coordinate systems, points, polygons, lines. Import `{ Mafs, Coordinates, Point, Polygon, Line, ... }` from `"mafs"` and `"mafs/core.css"`.
- **KaTeX** — render LaTeX in JSX. Use `dangerouslySetInnerHTML={{ __html: katex.renderToString("...") }}`.

---

### Adaptive Game

Games use the **adaptive engine** to automatically focus on the sub-skills a student struggles with.

```tsx
"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/context";
import { getPointsForAttempt, getMaxPerQuestion } from "@/lib/scoring";
import { saveGameScore } from "@/lib/progress";
import useAdaptiveEngine from "@/hooks/useAdaptiveEngine";
import { adaptiveInt, adaptiveDecimal, type Difficulty, type SkillCategory } from "@/lib/adaptiveEngine";
import HintSystem, { type HintStep } from "@/components/lessons/HintSystem";

// 1. Define skill categories — each is a distinct sub-skill
const CATEGORIES: SkillCategory[] = [
  { id: "cat-addition",    label: "Addition" },
  { id: "cat-subtraction", label: "Subtraction" },
  { id: "cat-comparison",  label: "Comparison" },
];

// 2. Define the question shape
interface Question {
  category: string;
  questionText: string;
  answer: number;
  hints: HintStep[];
}

// 3. Generate a question for a given category + difficulty
function generateQuestion(category: string, difficulty: Difficulty): Question {
  switch (category) {
    case "cat-addition": {
      const a = adaptiveInt(difficulty, [1, 10], [10, 99], [100, 999]);
      const b = adaptiveInt(difficulty, [1, 10], [10, 99], [100, 999]);
      return {
        category,
        questionText: `${a} + ${b} = ?`,
        answer: a + b,
        hints: [
          { text: "Add the numbers together" },
          { text: `Start with ${a}, then add ${b}` },
          { text: `${a} + ${b} = ${a + b}`, latex: `${a} + ${b} = ${a + b}` },
        ],
      };
    }
    // ... other categories
    default: throw new Error(`Unknown: ${category}`);
  }
}

const TOTAL = 10;

export default function MyGame() {
  const t = useTranslations("myTopic");
  const tg = useTranslations("games");
  const { user } = useAuth();
  const engine = useAdaptiveEngine(CATEGORIES);

  const [started, setStarted]         = useState(false);
  const [finished, setFinished]       = useState(false);
  const [qIndex, setQIndex]           = useState(0);
  const [current, setCurrent]         = useState<Question | null>(null);
  const [answer, setAnswer]           = useState("");
  const [feedback, setFeedback]       = useState<"correct" | "wrong" | null>(null);
  const [wrongCount, setWrongCount]   = useState(0);
  const [score, setScore]             = useState(0);

  const next = useCallback(() => {
    const { category, difficulty } = engine.pickNext();
    return generateQuestion(category, difficulty);
  }, [engine]);

  const start = () => {
    setCurrent(next()); setQIndex(0); setAnswer(""); setFeedback(null);
    setWrongCount(0); setScore(0); setFinished(false); setStarted(true);
  };

  const check = () => {
    if (!current) return;
    const val = parseFloat(answer);
    if (isNaN(val)) return;

    const correct = Math.abs(val - current.answer) < 0.001;
    engine.record(current.category, correct);

    if (correct) {
      const pts = getPointsForAttempt(wrongCount + 1, getMaxPerQuestion(TOTAL));
      setScore((s) => s + pts);
      setFeedback("correct");
    } else {
      setWrongCount((w) => w + 1);
      setFeedback("wrong");
    }
  };

  const advance = () => {
    if (qIndex + 1 >= TOTAL) {
      setFinished(true);
      if (user) saveGameScore(user.id, "primary-my-topic", "my-game", score, 1000);
      return;
    }
    setQIndex((i) => i + 1);
    setCurrent(next());
    setAnswer(""); setFeedback(null); setWrongCount(0);
  };

  // ── Start screen ──────────────────────────────────────────────────────────
  if (!started) return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
      <h2 className="mb-2 text-2xl font-bold">{t("gameTitle")}</h2>
      <p className="mb-6 text-[var(--color-text-secondary)]">{t("gameDesc")}</p>
      <button onClick={start}
        className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
        {tg("startGame")}
      </button>
    </div>
  );

  // ── Finish screen ─────────────────────────────────────────────────────────
  if (finished) {
    const summary = engine.getSummary();
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">{tg("complete")}</h2>
        <p className="mb-4 text-3xl font-bold text-[var(--color-accent)]">{score} / 1000</p>
        {summary.weakToStrong.filter((s) => s.accuracy < 0.7).length > 0 && (
          <div className="mb-6 rounded-lg bg-[var(--color-bg-tertiary)] p-4 text-left text-sm">
            <p className="mb-2 font-medium text-[var(--color-text-secondary)]">{t("keepPracticing")}:</p>
            {summary.weakToStrong.filter((s) => s.accuracy < 0.7).map((s) => (
              <p key={s.id}>{s.label} — {Math.round(s.accuracy * 100)}%</p>
            ))}
          </div>
        )}
        <button onClick={start}
          className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
          {tg("tryAgain")}
        </button>
      </motion.div>
    );
  }

  // ── Active question ───────────────────────────────────────────────────────
  if (!current) return null;
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t("questionOf", { current: qIndex + 1, total: TOTAL })}
          </p>
          <p className="text-xs font-mono text-[var(--color-accent)]">{score} pts</p>
        </div>
        <HintSystem steps={current.hints} wrongAttempts={wrongCount} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={qIndex}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <div className="mb-4 rounded-lg bg-[var(--color-bg-tertiary)] p-4">
            <p className="text-lg font-medium">{current.questionText}</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="number" step="any" value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { feedback === "correct" ? advance() : check(); }
              }}
              placeholder={t("yourAnswer")} autoFocus disabled={feedback === "correct"}
              className="w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
            {feedback !== "correct"
              ? <button onClick={check} className="rounded-lg bg-[var(--color-accent)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">{t("check")}</button>
              : <button onClick={advance} className="rounded-lg bg-[var(--color-success)] px-4 py-2 font-medium text-white">{t("next")}</button>
            }
          </div>
          {feedback && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`mt-3 text-sm font-medium ${feedback === "correct" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}>
              {feedback === "correct" ? t("correct") : t("incorrect")}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

---

### MatchPairs game (no custom code needed)

Just write a pair generator function and pass it to the shared component:

```tsx
import dynamic from "next/dynamic";
import type { MatchPairItem } from "@/components/lessons/types";

const MatchPairsGame = dynamic(
  () => import("@/components/lessons/games/MatchPairsGame"),
  { ssr: false }
);

// Pairs can be strings, numbers, JSX — anything ReactNode
function generatePairs(): MatchPairItem[] {
  const pool = [
    { left: "1/2",  right: "0.5"  },
    { left: "1/4",  right: "0.25" },
    { left: "3/4",  right: "0.75" },
    { left: "1/5",  right: "0.2"  },
    { left: "2/5",  right: "0.4"  },
    { left: "4/5",  right: "0.8"  },
    { left: "1/10", right: "0.1"  },
    { left: "3/10", right: "0.3"  },
  ];
  // Shuffle and pick a subset for variety
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
}

// Use anywhere in a section:
<MatchPairsGame
  gameId="fractions-match"
  lessonId="primary-fractions"
  title="Match fractions to decimals"
  description="Find each matching pair"
  generatePairs={generatePairs}
  gridCols={4}               // 4 columns = 8 cards per row
/>
```

**Generating random pairs** — you have full control. Use `Math.random()`, ranges, exclusion sets, etc.:

```ts
function generateDecimalPairs(): MatchPairItem[] {
  const denoms = [2, 4, 5, 10, 20];
  const seen = new Set<number>();
  const pairs: MatchPairItem[] = [];

  while (pairs.length < 6) {
    const den = denoms[Math.floor(Math.random() * denoms.length)];
    const num = Math.floor(Math.random() * den) + 1;
    const val = num / den;
    if (seen.has(val)) continue;       // no duplicate decimals
    seen.add(val);
    pairs.push({ left: `${num}/${den}`, right: String(val) });
  }
  return pairs;
}
```

---

## Adaptive Engine Quick Reference

The adaptive engine tracks per-skill accuracy and adjusts what gets asked next. Weak skills appear more often; mastered ones recede.

```ts
import useAdaptiveEngine from "@/hooks/useAdaptiveEngine";
import { adaptiveInt, adaptiveDecimal, type Difficulty, type SkillCategory } from "@/lib/adaptiveEngine";

// Define categories
const CATS: SkillCategory[] = [
  { id: "addition",    label: "Addition" },
  { id: "subtraction", label: "Subtraction" },
];

// Inside your component:
const engine = useAdaptiveEngine(CATS);

// Pick what to ask next
const { category, difficulty } = engine.pickNext();
// difficulty is "easy" | "medium" | "hard"

// Generate numbers scaled to difficulty
const a = adaptiveInt(difficulty,
  [1, 10],    // easy range
  [10, 99],   // medium range
  [100, 999]  // hard range
);

const x = adaptiveDecimal(difficulty,
  [0.1, 1.0],   // easy
  [1.0, 9.9],   // medium
  [10.0, 99.9]  // hard
);

// After the student answers:
engine.record(category, wasCorrect);  // updates weights + difficulty

// End of game:
const { weakToStrong, overallAccuracy } = engine.getSummary();
```

**Difficulty promotion/demotion:**
- 3 correct in a row → promote to next difficulty
- 3 wrong out of 4 → demote to easier difficulty
- Categories are tracked independently

---

## Localisation (Polish / English)

### In single-file lessons

Use `LocaleString` for any text that needs both languages:

```ts
// In LessonDef:
title: { en: "My Topic", pl: "Mój temat" },
description: {
  en: "Description in English",
  pl: "Opis po polsku",
},
formulas: [
  { label: { en: "Area", pl: "Pole" }, latex: "A = \\pi r^2" },
],

// In sections — locale is passed as an argument:
sections: (locale) => {
  const pl = locale === "pl";
  return [
    <div key="s1">
      <h2>{pl ? "Tytuł" : "Title"}</h2>
      <MyExplorer locale={locale} />
    </div>,
  ];
},
```

Plain strings also work (English only, no Polish) — use when a lesson doesn't need Polish yet:

```ts
title: "My Topic",          // string — same in all languages
```

### In multi-file lessons

Use `useTranslations()` and add all text to `en.json` / `pl.json`:

```tsx
const t = useTranslations("myTopic");
// ...
<h2>{t("title")}</h2>
```

---

## Shared Translation Keys

These already exist — use them directly in both approaches:

| Key | Value |
|-----|-------|
| `games.startGame` | "Start Game" / "Rozpocznij grę" |
| `games.tryAgain` | "Try Again" / "Spróbuj ponownie" |
| `games.complete` | "Complete!" / "Ukończono!" |
| `games.matched` | "Matched!" |
| `games.allMatched` | "All matched!" |
| `common.formulas` | "Formulas" / "Wzory" |
| `common.bestScore` | "Best Score" / "Najlepszy wynik" |
| `common.attempts` | "Attempts" / "Próby" |

---

## Styling Cheatsheet

Always use CSS variables — never hardcode colors:

```
var(--color-accent)           # blue/purple — buttons, highlights
var(--color-accent-hover)     # darker accent for hover states
var(--color-bg-primary)       # page background
var(--color-bg-secondary)     # card background
var(--color-bg-tertiary)      # nested element background
var(--color-border)           # border color
var(--color-text-primary)     # main text
var(--color-text-secondary)   # muted / label text
var(--color-success)          # correct / green
var(--color-error)            # wrong / red
```

Common patterns:
```tsx
// Card
<div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">

// Primary button
<button className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">

// Input field
<input className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]">

// Success / error text
<p className="text-[var(--color-success)]">Correct!</p>
<p className="text-[var(--color-error)]">Try again.</p>
```

---

## Hint Design

Every game question should have 3 hint steps. The HintSystem unlocks after 3 wrong attempts:

```ts
hints: [
  // Step 1 — which formula / rule applies
  { text: "The area of a triangle is base × height ÷ 2", latex: "A = \\frac{b \\cdot h}{2}" },
  // Step 2 — substitute the actual numbers
  { text: "Substitute the values", latex: `A = \\frac{6 \\cdot 4}{2}` },
  // Step 3 — full worked answer
  { text: "Calculate", latex: `A = \\frac{24}{2} = 12` },
],
```

Usage (already built into the adaptive game template above):
```tsx
<HintSystem steps={current.hints} wrongAttempts={wrongCount} />
```

---

## Available Shared Components

| Component | Import | What it does |
|-----------|--------|--------------|
| `LessonShell` | `@/components/lessons/LessonShell` | Full-viewport section navigator with progress dots and formula sidebar |
| `GameWrapper` | `@/components/lessons/GameWrapper` | Wraps a game with start/finish screens and Supabase score saving |
| `MatchPairsGame` | `@/components/lessons/games/MatchPairsGame` | Card matching game — just pass a `generatePairs` function |
| `ComparisonGame` | `@/components/lessons/games/ComparisonGame` | Two-card choice game with adaptive engine — just pass a `generatePair` function |
| `HintSystem` | `@/components/lessons/HintSystem` | Progressive hints that unlock after N wrong attempts |

---

## ComparisonGame

A two-card choice game. Each round shows a pair of items; the student clicks the "correct" one. The adaptive engine tracks per-category accuracy and automatically shows more of the weakest pair types on replay.

Works with any content: numbers, KaTeX fractions, SVG shapes, images — anything that can go in a `ReactNode`.

### API

```tsx
import dynamic from "next/dynamic";
import type { ComparisonPair } from "@/components/lessons/games/ComparisonGame";
import type { SkillCategory } from "@/lib/adaptiveEngine";
import { type Difficulty } from "@/lib/adaptiveEngine";

const ComparisonGame = dynamic(
  () => import("@/components/lessons/games/ComparisonGame"),
  { ssr: false }
);
```

```tsx
<ComparisonGame
  gameId="fractions-comparison"       // for progress tracking
  lessonId="primary-fractions"
  title="Compare Fractions"
  description="Choose the larger value each round"
  prompt="Which is bigger?"           // shown above the cards every question
  categories={myCategories}           // SkillCategory[] for adaptive engine
  generatePair={myGenerator}          // (category, difficulty) => ComparisonPair
  totalQuestions={12}                 // optional, default 12
  showEqualButton={true}              // optional, default false
/>
```

### Defining categories

One category per distinct sub-skill. The engine tracks them separately and focuses on weak ones:

```ts
const CATEGORIES: SkillCategory[] = [
  { id: "frac-vs-dec",   label: "Fraction vs Decimal" },
  { id: "frac-vs-frac",  label: "Fraction vs Fraction" },
  { id: "dec-vs-dec",    label: "Decimal vs Decimal" },
];
```

### Writing a pair generator

The generator receives `(category, difficulty)` from the engine and returns a `ComparisonPair`. You decide all the randomness and content:

```ts
function generatePair(category: string, difficulty: Difficulty): ComparisonPair {
  switch (category) {
    case "frac-vs-dec": {
      // pick a fraction and decimal, decide which is bigger
      const num = 1, den = 4;       // 1/4 = 0.25
      const dec = 0.3;
      return {
        left:    <FracNode num={num} den={den} />,
        right:   <span className="font-mono">{dec}</span>,
        correct: dec > num / den ? "right" : dec < num / den ? "left" : "equal",
        hints: [
          { text: `Convert: ${num}/${den} = ${num/den}` },
          { text: `Compare: ${num/den} vs ${dec}` },
          { text: `${dec} > ${num/den}, so the right card wins`, latex: `${dec} > \\tfrac{${num}}{${den}}` },
        ],
      };
    }
    case "frac-vs-frac": {
      // ...
    }
  }
}
```

**Key rules:**
- `correct: "left"` → student must click the left card
- `correct: "right"` → student must click the right card
- `correct: "equal"` → student must click the `=` button (only possible when `showEqualButton={true}`)
- `hints` is optional but recommended — 3 steps: concept → setup → answer

### Shapes example

```tsx
function TriangleSVG({ base, height }: { base: number; height: number }) {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60">
      <polygon points="40,4 76,56 4,56" fill="var(--color-accent)" opacity="0.3"
        stroke="var(--color-accent)" strokeWidth="2" />
      <text x="40" y="74" textAnchor="middle" fontSize="10"
        fill="var(--color-text-secondary)">
        b={base} h={height}
      </text>
    </svg>
  );
}

function generateShapePair(category: string, difficulty: Difficulty): ComparisonPair {
  const b1 = adaptiveInt(difficulty, [2, 6], [4, 12], [6, 20]);
  const h1 = adaptiveInt(difficulty, [2, 6], [4, 12], [6, 20]);
  const b2 = adaptiveInt(difficulty, [2, 6], [4, 12], [6, 20]);
  const h2 = adaptiveInt(difficulty, [2, 6], [4, 12], [6, 20]);

  const area1 = (b1 * h1) / 2;
  const area2 = (b2 * h2) / 2;

  return {
    left:    <TriangleSVG base={b1} height={h1} />,
    right:   <TriangleSVG base={b2} height={h2} />,
    correct: area1 > area2 ? "left" : area1 < area2 ? "right" : "equal",
    hints: [
      { text: "Area of triangle = base × height ÷ 2", latex: "A = \\frac{b \\cdot h}{2}" },
      { text: `Left: A = ${b1}×${h1}÷2 = ${area1}`, latex: `A_1 = \\frac{${b1} \\cdot ${h1}}{2} = ${area1}` },
      { text: `Right: A = ${b2}×${h2}÷2 = ${area2}`, latex: `A_2 = \\frac{${b2} \\cdot ${h2}}{2} = ${area2}` },
    ],
  };
}
```

---

## Complete Examples

| Lesson | Approach | Key techniques |
|--------|----------|----------------|
| `src/lessons/fractions.lesson.tsx` | Single-file | LocaleString, MatchPairs, random pair generation |
| `src/app/[locale]/primary/areas/page.tsx` | Multi-file | Mafs graphs, multiple explorers, Detective game, HintSystem |
| `src/app/[locale]/primary/decimals/page.tsx` | Multi-file | Number line graph, adaptive games, KaTeX rendering |
