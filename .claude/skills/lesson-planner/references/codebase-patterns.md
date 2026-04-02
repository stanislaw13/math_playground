# Codebase Patterns Reference

## Tech Stack
- **Next.js 16.2.1** (App Router) with TypeScript strict mode
- **React 19.2.4**
- **Tailwind CSS 4** with CSS custom properties for theming
- **next-intl** for i18n (English + Polish)
- **Mafs** for interactive math visualisation (graphs, polygons, coordinates)
- **KaTeX** for LaTeX formula rendering
- **Framer Motion 12.x** for animations
- **Supabase** for auth and progress tracking

## Project Structure

```
src/
├── app/[locale]/
│   ├── page.tsx                          # Home page
│   ├── primary/
│   │   ├── page.tsx                      # Primary category index (auto-discovers lessons)
│   │   └── areas/
│   │       └── page.tsx                  # Areas lesson page
│   └── highschool/
│       └── page.tsx                      # High school index
├── components/lessons/
│   ├── LessonShell.tsx                   # Full-viewport section navigation
│   ├── GameWrapper.tsx                   # Reusable start/play/finish shell for games
│   ├── HintSystem.tsx                    # Multi-step hints with unlock mechanics
│   ├── FormulaSidebar.tsx                # Floating formula sidebar with KaTeX
│   ├── types.ts                          # TypeScript interfaces for all lesson types
│   ├── games/
│   │   └── MatchPairsGame.tsx            # Reusable card matching game
│   └── areas/                            # Areas-lesson-specific components
│       ├── ShapeExplorer.tsx             # Interactive shape explorers with sliders
│       ├── ShapeBuilder.tsx              # Build-a-shape game
│       ├── Detective.tsx                 # Missing dimension detective game
│       ├── ShapeSVGs.tsx                 # SVG shape diagrams
│       └── areaMatchPairs.tsx            # Pair generators for match-pairs games
├── content/
│   └── lessons.ts                        # LESSON REGISTRY — single source of truth
├── hooks/
│   └── useAdaptiveEngine.ts              # React hook for adaptive engine
├── lib/
│   ├── adaptiveEngine.ts                 # Pure adaptive engine (no React dependency)
│   ├── scoring.ts                        # 1000-point scoring system
│   ├── progress.ts                       # Supabase: saveGameScore, updateLessonProgress
│   ├── auth/context.tsx                  # Auth context provider
│   └── supabase/                         # Supabase client/server utils
├── i18n/
│   ├── config.ts                         # Locales: ["en", "pl"], default: "en"
│   ├── routing.ts                        # next-intl routing config
│   └── navigation.ts                     # Link and redirect components
└── messages/
    ├── en.json                           # English translations
    └── pl.json                           # Polish translations
```

## How to Register a New Lesson

### 1. Add entry to `src/content/lessons.ts`

Append to the `lessons` array (never reorder or remove existing entries):

```typescript
{
  id: "primary-decimals",           // Format: <category>-<slug>
  titleKey: "primary.decimals.title",
  descriptionKey: "primary.decimals.description",
  path: "/primary/decimals",        // URL path
  category: "primary",              // "primary" | "highschool"
  order: 2,                         // Display order within category
  games: ["decimal-explorer", "decimal-detective", "decimal-match", "decimal-challenge"],
}
```

### 2. Add translations

In `src/messages/en.json`, add a new top-level key matching your lesson slug:

```json
{
  "primary": {
    "decimals": {
      "title": "Decimal Fractions",
      "description": "Learn to work with decimal numbers..."
    }
  },
  "decimals": {
    "title": "Decimal Fractions",
    "intro": "Explore how decimal fractions work...",
    "formulaLabel1": "Place Value",
    ...
  }
}
```

Do the same for `pl.json` with Polish translations.

### 3. Create lesson page

Path: `src/app/[locale]/primary/decimals/page.tsx`

The lesson page uses `LessonShell` with the children-override pattern (pass JSX sections as an array of children rather than using config.sections).

### 4. Create components

Path: `src/components/lessons/decimals/`

Each lesson gets its own directory. Game components and interactive explorers go here.

## Routing

Next.js App Router with `[locale]` dynamic segment handles routing automatically. The primary/highschool index pages discover lessons via `getLessonsByCategory()` from `lessons.ts`. No manual route registration needed.

## Styling Conventions

### CSS Variables (always use these, never hardcode colors)
```
--color-accent          # Primary accent (buttons, highlights)
--color-accent-hover    # Accent hover state
--color-bg-primary      # Main background
--color-bg-secondary    # Card/section background
--color-bg-tertiary     # Nested element background
--color-border          # Border color
--color-text-primary    # Main text
--color-text-secondary  # Muted text
--color-success         # Correct/success green
--color-error           # Wrong/error red
```

### Common Card Pattern
```tsx
<div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
```

### Button Pattern
```tsx
<button className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
```

## Component Imports

Always use the `@/` path alias (maps to `src/`):
```typescript
import LessonShell from "@/components/lessons/LessonShell";
import type { LessonConfig } from "@/components/lessons/types";
import GameWrapper from "@/components/lessons/GameWrapper";
import HintSystem from "@/components/lessons/HintSystem";
import MatchPairsGame from "@/components/lessons/games/MatchPairsGame";
import useAdaptiveEngine from "@/hooks/useAdaptiveEngine";
import { adaptiveInt, adaptiveDecimal } from "@/lib/adaptiveEngine";
import { getPointsForAttempt, getMaxPerQuestion } from "@/lib/scoring";
import { saveGameScore } from "@/lib/progress";
import { useAuth } from "@/lib/auth/context";
```

## Dynamic Imports

Use `dynamic()` with `{ ssr: false }` for all game components and interactive elements that use browser APIs:

```typescript
import dynamic from "next/dynamic";
const MyGame = dynamic(() => import("@/components/lessons/mylesson/MyGame"), { ssr: false });
```

## Translation Pattern

```typescript
const t = useTranslations("decimals");     // lesson-specific translations
const tg = useTranslations("games");       // shared game translations
const th = useTranslations("hints");       // shared hint translations

// Usage
t("title")                                  // "Decimal Fractions"
t("questionOf", { current: 1, total: 5 })   // "Question 1 of 5"
tg("startGame")                             // "Start Game"
```

Shared game translation keys already available: `startGame`, `tryAgain`, `matched`, `moves`, `allMatched`, `wellDone`, `nextChallenge`, `challenge`, `complete`.
