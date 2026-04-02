---
name: lesson-planner
description: "Plan and build interactive math lessons for math_playground. Use this skill whenever the user wants to create a new lesson, plan lesson content, add games or exercises, or discuss lesson structure for the math teaching website. Trigger on: 'new lesson', 'plan a lesson', 'create a lesson about', 'add a lesson for', 'lesson about fractions/decimals/equations/etc', 'math_playground lesson', or any mention of creating educational math content with interactive games. This skill handles the full workflow: gathering requirements, designing the lesson plan (theory + adaptive games), and generating all the code files."
---

# Lesson Planner for math_playground

You are building an interactive math lesson for the **math_playground** web application. This skill guides you through the full workflow: understanding what the lesson should teach, designing a lesson plan with interactive theory and adaptive games, and generating all the code.

## Critical Rule: Isolation

**Never modify existing lesson files, shared components, or the general website code.** Each lesson is self-contained. You will only:

1. Add an entry to `src/content/lessons.ts` (append to the array — don't change existing entries)
2. Add translation keys to `src/messages/en.json` and `src/messages/pl.json` (add new top-level keys — don't modify existing ones)
3. Create new files under `src/app/[locale]/primary/<lesson-slug>/` or `src/app/[locale]/highschool/<lesson-slug>/`
4. Create new component files under `src/components/lessons/<lesson-slug>/`

That's it. No touching `LessonShell.tsx`, `GameWrapper.tsx`, `MatchPairsGame.tsx`, `HintSystem.tsx`, `scoring.ts`, `adaptiveEngine.ts`, or any other shared infrastructure.

## Workflow

### Phase 1: Understand the Lesson

Start by asking the user these questions (use AskUserQuestion if available, otherwise ask conversationally):

1. **Topic**: What mathematical concept does this lesson cover? (e.g., "decimal fractions", "linear equations", "Pythagorean theorem")
2. **Level**: Primary school or high school?
3. **Prerequisites**: What should students already know before this lesson?
4. **Specific requirements**: Are there particular types of exercises, edge cases, or pedagogical approaches you want? Any specific formulas that must be covered?
5. **Game preferences**: Do you want to reuse existing game types (MatchPairs, Detective-style, ShapeBuilder-style) or design brand new game mechanics?

Don't ask all at once if the user has already given context — extract what you can from the conversation first.

### Phase 2: Design the Lesson Plan

Propose a lesson plan with this structure:

#### Theory Introduction (1-3 sections)
Interactive sections where students explore the concept. These should NOT be static text — they should have:
- **Interactive explorers** with sliders, inputs, or draggable elements (like the ShapeExplorer components in the areas lesson)
- **Visual explanations** using Mafs graphs, SVG diagrams, or animated illustrations
- **KaTeX-rendered formulas** in a formula sidebar
- The theory should build up gradually: introduce the simplest case first, then add complexity

#### Games (2-6 games, typically 4)
Each game should:
- Use the **adaptive engine** (`useAdaptiveEngine` hook) to track which skill categories the student struggles with
- Define clear **skill categories** (e.g., for decimals: "decimal-addition", "decimal-multiplication", "decimal-comparison", "decimal-place-value")
- Scale difficulty within each category using the `adaptiveInt()` / `adaptiveDecimal()` helpers
- Use the **HintSystem** for stepped hints
- Use the **GameWrapper** or manage its own start/play/finish screens
- Score using the standard 1000-point system via `getPointsForAttempt()` and `getMaxPerQuestion()`

Present the plan to the user and wait for approval/feedback before generating code.

### Phase 3: Generate the Code

Before writing any code, read these reference files:
- `references/codebase-patterns.md` — file structure, routing, styling conventions
- `references/game-types.md` — catalog of reusable game types and patterns for new ones
- `references/adaptive-engine.md` — how to integrate the adaptive engine into games

Then generate all files. The typical file set for a lesson:

```
src/content/lessons.ts                          ← append entry
src/messages/en.json                            ← add translation keys
src/messages/pl.json                            ← add translation keys
src/app/[locale]/primary/<slug>/page.tsx        ← lesson page
src/components/lessons/<slug>/                  ← lesson-specific components
  ├── <Explorer1>.tsx                           ← interactive theory component(s)
  ├── <Explorer2>.tsx
  ├── <Game1>.tsx                               ← game components
  ├── <Game2>.tsx
  ├── <Game3>.tsx
  ├── <Game4>.tsx
  ├── <slug>MatchPairs.tsx                      ← pair generators (if using MatchPairs)
  └── <slug>SVGs.tsx                            ← SVG diagrams (if needed)
```

### Phase 4: Verify

After generating the code:
1. Check that `lessons.ts` has the new entry appended (not replacing anything)
2. Check that translations are added (not overwriting existing keys)
3. Verify all imports resolve to existing shared components or newly created files
4. Make sure no existing files were modified (except the two registries: lessons.ts and translation files)
5. Run `npx tsc --noEmit` to check for type errors if possible

## Key Technical Patterns

Read the reference files for full details. Here's a quick summary:

### The Lesson Page Pattern
```tsx
"use client";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import LessonShell from "@/components/lessons/LessonShell";
import type { LessonConfig } from "@/components/lessons/types";

// Dynamic imports for game components (ssr: false for interactive content)
const Game1 = dynamic(() => import("@/components/lessons/<slug>/Game1"), { ssr: false });

export default function LessonPage() {
  const t = useTranslations("<slug>");
  const config: LessonConfig = {
    id: "<category>-<slug>",
    sections: [], // Using children override
    formulas: [
      { label: t("formulaLabel"), latex: "A = \\pi r^2" },
    ],
  };

  return (
    <LessonShell config={config}>
      {[
        <div key="s1">
          {/* Theory section with interactive explorers */}
        </div>,
        <div key="s2">
          {/* Game section */}
          <Game1 />
        </div>,
      ]}
    </LessonShell>
  );
}
```

### The Adaptive Game Pattern
```tsx
"use client";
import useAdaptiveEngine from "@/hooks/useAdaptiveEngine";
import { adaptiveInt, type Difficulty } from "@/lib/adaptiveEngine";
import { getPointsForAttempt, getMaxPerQuestion } from "@/lib/scoring";
import HintSystem from "@/components/lessons/HintSystem";

const SKILL_CATEGORIES = [
  { id: "cat-a", label: "Category A" },
  { id: "cat-b", label: "Category B" },
];

function generateQuestion(category: string, difficulty: Difficulty) {
  // Generate a question appropriate for the category and difficulty
  // Use adaptiveInt() / adaptiveDecimal() for number ranges
}

export default function AdaptiveGame() {
  const engine = useAdaptiveEngine(SKILL_CATEGORIES);
  // Use engine.pickNext() to select what to ask next
  // Use engine.record(categoryId, correct) after each answer
  // Use engine.getSummary() for the end-of-game report
}
```

### Styling
- Use CSS variables: `var(--color-accent)`, `var(--color-bg-secondary)`, `var(--color-border)`, etc.
- Use Tailwind utility classes
- Use `rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6` for card containers
- Use Framer Motion for animations (`motion.div` with `initial`/`animate`/`exit`)

### Libraries Available
- **Mafs** — interactive math graphs, polygons, coordinates
- **KaTeX** — LaTeX formula rendering
- **Framer Motion** — animations
- **next-intl** — translations with `useTranslations()`

## Lesson Quality Checklist

Before presenting the lesson plan, verify:

- [ ] Theory sections are interactive, not just text
- [ ] Each game has clear skill categories defined
- [ ] Games use the adaptive engine to adjust question selection and difficulty
- [ ] Hints are progressive (formula → substitution → full solution)
- [ ] Numbers in exercises are appropriate for the age group
- [ ] The lesson builds from simple to complex
- [ ] All text uses i18n keys (no hardcoded strings in components)
- [ ] Formula sidebar includes all relevant formulas with optional SVG diagrams
- [ ] Games vary in mechanics (not just 4 copies of the same game type)
