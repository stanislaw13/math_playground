# Adaptive Engine Integration Guide

The adaptive engine tracks student performance across skill categories and intelligently selects what to practice next. It lives in two files:

- `src/lib/adaptiveEngine.ts` — pure logic (no React dependency)
- `src/hooks/useAdaptiveEngine.ts` — React hook wrapper

## Core Concepts

### Skill Categories
Each game defines a set of **skill categories** — specific sub-skills within the lesson topic. For example, a decimals lesson might have:

```typescript
const CATEGORIES: SkillCategory[] = [
  { id: "decimal-add", label: "Adding Decimals" },
  { id: "decimal-subtract", label: "Subtracting Decimals" },
  { id: "decimal-multiply", label: "Multiplying Decimals" },
  { id: "decimal-compare", label: "Comparing Decimals" },
  { id: "decimal-place-value", label: "Place Value" },
];
```

Good categories are specific enough to be meaningful but broad enough that multiple questions fit under each one. Aim for 3-6 categories per game.

### Difficulty Levels
Each category has its own difficulty level: `"easy"`, `"medium"`, or `"hard"`. The engine promotes difficulty when a student gets 3 in a row correct, and demotes when they get 3 out of 4 wrong. Categories progress independently — a student might be at "hard" for addition but "easy" for multiplication.

### Weighted Selection
The engine picks the next question category using weighted random selection:
- **Weak categories** (accuracy < 60%) get 3× the base weight — they appear much more often
- **Strong categories at max difficulty** get 0.3× the base weight — they nearly disappear
- **Strong categories not yet at max difficulty** get 0.6× — they still appear but less often
- **Unpracticed categories** keep their initial weight — they get a fair chance to appear

This means if a student struggles with triangles, they'll see mostly triangle questions. As they improve, the engine shifts focus to the next weakest area.

## How to Use

### Step 1: Define Categories

Think about what distinct sub-skills the lesson teaches. Each category should represent a meaningfully different type of problem.

```typescript
import type { SkillCategory } from "@/lib/adaptiveEngine";

const CATEGORIES: SkillCategory[] = [
  { id: "triangle-area", label: "Triangle Area" },
  { id: "rectangle-area", label: "Rectangle Area" },
  // ...
];
```

### Step 2: Initialize the Hook

```typescript
import useAdaptiveEngine from "@/hooks/useAdaptiveEngine";

export default function MyGame() {
  const engine = useAdaptiveEngine(CATEGORIES);
  // ...
}
```

### Step 3: Generate Questions Based on Engine's Pick

```typescript
function generateQuestion(category: string, difficulty: Difficulty): Question {
  switch (category) {
    case "triangle-area": {
      const base = adaptiveInt(difficulty, [2, 8], [5, 20], [10, 50]);
      const height = adaptiveInt(difficulty, [2, 8], [5, 20], [10, 50]);
      const area = (base * height) / 2;
      return {
        category,
        questionText: `Triangle with base ${base} and height ${height}. Area = ?`,
        answer: area,
        hints: [
          { text: "Area of triangle = base × height ÷ 2", latex: "A = \\frac{a \\cdot h}{2}" },
          { text: `Substitute values`, latex: `A = \\frac{${base} \\cdot ${height}}{2}` },
          { text: `Calculate`, latex: `A = \\frac{${base * height}}{2} = ${area}` },
        ],
      };
    }
    // ... other categories
  }
}

// In the game loop:
const { category, difficulty } = engine.pickNext();
const question = generateQuestion(category, difficulty);
```

### Step 4: Record Results

After each answer, tell the engine whether it was correct:

```typescript
engine.record(question.category, wasCorrect);
```

This updates the rolling accuracy window, adjusts weights, and may promote/demote difficulty.

### Step 5: Show Summary at End

```typescript
const summary = engine.getSummary();
// summary.weakToStrong — categories sorted weakest → strongest
// summary.overallAccuracy — overall correct/total ratio
// summary.totalAttempts — total questions answered
```

Display this in the finish screen so students see what they need to practice more.

## Number Generation Helpers

### adaptiveInt(difficulty, easyRange, mediumRange, hardRange)

Returns a random integer within a range that scales with difficulty:

```typescript
import { adaptiveInt } from "@/lib/adaptiveEngine";

// For primary school addition:
const a = adaptiveInt(difficulty, [1, 10], [10, 50], [50, 200]);

// For highschool coefficients:
const coeff = adaptiveInt(difficulty, [1, 5], [-10, 10], [-20, 20]);
```

### adaptiveDecimal(difficulty, easyRange, mediumRange, hardRange, precision?)

Same but for decimals. Precision defaults to 1/2/3 based on difficulty:

```typescript
import { adaptiveDecimal } from "@/lib/adaptiveEngine";

// For decimal arithmetic:
const x = adaptiveDecimal(difficulty, [0.1, 2.0], [1.0, 10.0], [0.01, 100.0]);
```

## Design Principles

1. **Categories should be pedagogically meaningful.** Don't create categories just for variety — each should represent a skill that some students find harder than others.

2. **Difficulty should change the nature of the problem, not just the size of numbers.** At "easy", give direct formula application. At "hard", require combining concepts or solving backwards.

3. **10-15 questions per game is a good target.** Enough for the engine to learn the student's weaknesses but not so many it becomes tedious.

4. **The first 2-3 questions will be somewhat random** since the engine has no data yet. That's fine — it learns quickly.

5. **Don't forget hints.** Every question needs 3 progressive hint steps. The HintSystem unlocks after 3 wrong attempts by default.

## Example: Full Adaptive Game Flow

```
Round starts → engine has no data → picks randomly (roughly equal)
Q1: Triangle area (easy) → Student gets it right
Q2: Rectangle area (easy) → Student gets it right
Q3: Diamond area (easy) → Student gets it WRONG
Q4: Diamond area (easy) → Student gets it WRONG  ← engine boosts diamond weight
Q5: Diamond area (easy) → Student gets it right
Q6: Diamond area (easy) → Student gets it right
Q7: Triangle area (easy) → Student gets it right  ← streak=3, promote to medium!
Q8: Diamond area (easy) → Student gets it right   ← streak=3, promote to medium!
Q9: Triangle area (medium) → Student gets it right
Q10: Rectangle area (easy) → Student gets it right ← streak=3, promote!
...
```

The engine ensures students spend most of their time practicing what they need, not what they've already mastered.
