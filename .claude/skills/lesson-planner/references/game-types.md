# Game Types Catalog

This document describes the reusable game types available in math_playground and patterns for creating new game types. Every game should integrate the adaptive engine for intelligent question selection.

## Existing Reusable Game Types

### 1. MatchPairsGame (fully reusable)

**Import:** `@/components/lessons/games/MatchPairsGame`

A card-matching game where students match pairs (e.g., shape to area, expression to result). Cards are shuffled and displayed in a grid.

**How to use:**
```tsx
import MatchPairsGame from "@/components/lessons/games/MatchPairsGame";

// Create a pair generator function
function generateMyPairs(): MatchPairItem[] {
  return [
    { left: <span>0.5 + 0.3</span>, right: <span>0.8</span> },
    { left: <span>1.2 × 3</span>, right: <span>3.6</span> },
    // ... 4-8 pairs recommended
  ];
}

// Use in lesson
<MatchPairsGame
  gameId="my-match"
  lessonId="primary-decimals"
  title={t("matchTitle")}
  description={t("matchDesc")}
  generatePairs={generateMyPairs}
  gridCols={4}
/>
```

**Scoring:** Handled automatically by MatchPairsGame via GameWrapper. Wrong guesses reduce points for that pair.

**Adaptive integration:** The pair generator function can accept difficulty parameters to generate easier or harder pairs. Create a wrapper component that uses the adaptive engine to feed difficulty to the generator.

### 2. Detective-style (pattern to copy)

**Pattern from:** `@/components/lessons/areas/Detective`

A question-answer game where students solve for a missing value given some information. Each question shows given data and asks for a specific value.

**Key elements:**
- Question generator function that returns questions with `givenText`, `askText`, `answer`, and `hints`
- Numeric input field for answers
- HintSystem integration (hints unlock after 3 wrong attempts)
- Sequential questions with progress tracking

**Adaptive version pattern:**
```tsx
const engine = useAdaptiveEngine(SKILL_CATEGORIES);
const [currentQuestion, setCurrentQuestion] = useState(() => generateFromEngine(engine));

function generateFromEngine(eng: UseAdaptiveEngineReturn) {
  const { category, difficulty } = eng.pickNext();
  return generateQuestion(category, difficulty);
}

function onAnswer(correct: boolean) {
  engine.record(currentQuestion.category, correct);
  if (correct) {
    // Show next question using engine.pickNext()
    setCurrentQuestion(generateFromEngine(engine));
  }
}
```

### 3. ShapeBuilder-style (pattern to copy)

**Pattern from:** `@/components/lessons/areas/ShapeBuilder`

A challenge-based game where students manipulate sliders/inputs to match a target. Uses Mafs for visual feedback.

**Key elements:**
- Target value displayed prominently
- Sliders or inputs to adjust parameters
- Visual preview updating in real-time (e.g., Mafs graph)
- Check button to verify the answer
- HintSystem with progressive hints

**Adaptable for:** Any topic where students need to construct or find values (e.g., "build a fraction that equals 0.75", "find coefficients of a quadratic").

## Patterns for New Game Types

When creating a brand new game type, follow these conventions:

### Game Component Structure

```tsx
"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/context";
import { getPointsForAttempt, getMaxPerQuestion } from "@/lib/scoring";
import { saveGameScore } from "@/lib/progress";
import useAdaptiveEngine from "@/hooks/useAdaptiveEngine";
import { adaptiveInt, type Difficulty, type SkillCategory } from "@/lib/adaptiveEngine";
import HintSystem, { type HintStep } from "@/components/lessons/HintSystem";

// ---------------------------------------------------------------------------
// Skill categories for the adaptive engine
// ---------------------------------------------------------------------------

const CATEGORIES: SkillCategory[] = [
  { id: "cat-a", label: "Category A" },
  { id: "cat-b", label: "Category B" },
  { id: "cat-c", label: "Category C" },
];

// ---------------------------------------------------------------------------
// Question generation
// ---------------------------------------------------------------------------

interface Question {
  category: string;
  difficulty: Difficulty;
  questionText: string;
  answer: number;
  hints: HintStep[];
  // ... any other fields needed
}

function generateQuestion(category: string, difficulty: Difficulty, t: (key: string) => string): Question {
  // Use adaptiveInt() or adaptiveDecimal() for difficulty-scaled numbers
  switch (category) {
    case "cat-a": {
      const a = adaptiveInt(difficulty, [1, 10], [10, 50], [50, 200]);
      const b = adaptiveInt(difficulty, [1, 10], [10, 50], [50, 200]);
      return {
        category,
        difficulty,
        questionText: `${a} + ${b} = ?`,
        answer: a + b,
        hints: [
          { text: "Think about place values" },
          { text: `Start with ${a}...` },
          { text: `${a} + ${b} = ${a + b}`, latex: `${a} + ${b} = ${a + b}` },
        ],
      };
    }
    // ... other categories
    default:
      throw new Error(`Unknown category: ${category}`);
  }
}

// ---------------------------------------------------------------------------
// Total questions per game round
// ---------------------------------------------------------------------------

const TOTAL_QUESTIONS = 10;

// ---------------------------------------------------------------------------
// Game component
// ---------------------------------------------------------------------------

export default function MyAdaptiveGame() {
  const t = useTranslations("myLesson");
  const tg = useTranslations("games");
  const { user } = useAuth();
  const engine = useAdaptiveEngine(CATEGORIES);

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [score, setScore] = useState(0);

  const generateNext = useCallback(() => {
    const { category, difficulty } = engine.pickNext();
    return generateQuestion(category, difficulty, t);
  }, [engine, t]);

  const startGame = useCallback(() => {
    const q = generateNext();
    setCurrentQ(q);
    setQuestionIndex(0);
    setUserAnswer("");
    setFeedback(null);
    setWrongAttempts(0);
    setScore(0);
    setFinished(false);
    setStarted(true);
  }, [generateNext]);

  const checkAnswer = () => {
    if (!currentQ) return;
    const parsed = parseFloat(userAnswer);
    if (isNaN(parsed)) return;

    if (Math.abs(parsed - currentQ.answer) < 0.01) {
      const points = getPointsForAttempt(wrongAttempts + 1, getMaxPerQuestion(TOTAL_QUESTIONS));
      setScore((s) => s + points);
      setFeedback("correct");
      engine.record(currentQ.category, true);
    } else {
      setWrongAttempts((w) => w + 1);
      setFeedback("incorrect");
      engine.record(currentQ.category, false);
    }
  };

  const nextQuestion = () => {
    if (questionIndex + 1 >= TOTAL_QUESTIONS) {
      setFinished(true);
      if (user) {
        saveGameScore(user.id, "lesson-id", "game-id", score, 1000);
      }
      return;
    }
    setQuestionIndex((i) => i + 1);
    setCurrentQ(generateNext());
    setUserAnswer("");
    setFeedback(null);
    setWrongAttempts(0);
  };

  // --- Start screen ---
  if (!started) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">{t("gameTitle")}</h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">{t("gameDesc")}</p>
        <button onClick={startGame} className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
          {tg("startGame")}
        </button>
      </div>
    );
  }

  // --- Finish screen with adaptive summary ---
  if (finished) {
    const summary = engine.getSummary();
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">{tg("complete")}</h2>
        <p className="mb-2 text-3xl font-bold text-[var(--color-accent)]">{score} / 1000</p>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          {Math.round(summary.overallAccuracy * 100)}%
        </p>

        {/* Show weak areas */}
        {summary.weakToStrong.length > 0 && summary.weakToStrong[0].accuracy < 0.7 && (
          <div className="mb-4 rounded-lg bg-[var(--color-bg-tertiary)] p-4 text-left">
            <p className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
              {t("keepPracticing")}:
            </p>
            {summary.weakToStrong
              .filter((s) => s.accuracy < 0.7)
              .map((s) => (
                <p key={s.id} className="text-sm">
                  {s.label} — {Math.round(s.accuracy * 100)}%
                </p>
              ))}
          </div>
        )}

        <button onClick={startGame} className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
          {tg("tryAgain")}
        </button>
      </motion.div>
    );
  }

  // --- Active game ---
  if (!currentQ) return null;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t("questionOf", { current: questionIndex + 1, total: TOTAL_QUESTIONS })}
          </p>
          <p className="text-xs font-mono text-[var(--color-accent)]">{score} pts</p>
        </div>
        <HintSystem steps={currentQ.hints} wrongAttempts={wrongAttempts} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={questionIndex}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          {/* Question display — customise per game type */}
          <div className="mb-4 rounded-lg bg-[var(--color-bg-tertiary)] p-4">
            <p className="text-lg font-medium">{currentQ.questionText}</p>
          </div>

          {/* Answer input */}
          <div className="flex items-center gap-3">
            <input
              type="number" step="any" value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (feedback === "correct") nextQuestion();
                  else checkAnswer();
                }
              }}
              placeholder={t("yourAnswer")}
              className="w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              disabled={feedback === "correct"}
              autoFocus
            />
            {feedback !== "correct" ? (
              <button onClick={checkAnswer}
                className="rounded-lg bg-[var(--color-accent)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
                {t("check")}
              </button>
            ) : (
              <button onClick={nextQuestion}
                className="rounded-lg bg-[var(--color-success)] px-4 py-2 font-medium text-white">
                {t("next")}
              </button>
            )}
          </div>

          {feedback && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`mt-3 text-sm font-medium ${
                feedback === "correct" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"
              }`}>
              {feedback === "correct" ? t("correct") : t("incorrect")}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

## New Game Type Ideas

When designing new game types for a lesson, consider these mechanics:

### Sorting / Ordering Game
Students drag items into the correct order (e.g., order fractions from smallest to largest). Great for comparison skills.

### Fill-in-the-Blank Chain
A series of connected equations where the answer to one feeds into the next. Tests procedural fluency.

### True/False Speed Round
Rapid statements that students judge as true or false. Good for testing conceptual understanding. Timer-based for engagement.

### Visual Builder
Like ShapeBuilder but for non-geometric concepts — e.g., "build a number line showing 0.75" or "place the decimal point to make 34.5".

### Multiple Choice with Distractors
Carefully designed wrong answers that target common misconceptions. The adaptive engine can track which misconceptions the student falls for and generate more questions targeting those.

### Estimation Game
Show a visual and ask students to estimate a value before calculating. Develops number sense.

## Difficulty Scaling Strategies

The adaptive engine provides `easy`, `medium`, `hard` difficulty levels. Here's how to use them well:

### For Number Problems
- **Easy**: Small, round numbers (2, 5, 10). Single operation.
- **Medium**: Larger numbers, may include decimals with 1-2 places. Sometimes two operations.
- **Hard**: Mixed operations, more decimal places, negative numbers (if age-appropriate), multi-step problems.

### For Conceptual Problems
- **Easy**: Direct application of one formula/concept.
- **Medium**: Requires choosing which formula to apply, or applying a formula backwards.
- **Hard**: Combines multiple concepts, requires reasoning about edge cases.

### What NOT to Do
- Don't just make numbers bigger for harder problems — that tests arithmetic, not the concept.
- Don't make easy problems trivially obvious — they should still require thought.
- Keep hard problems solvable without a calculator for primary school.

## Hint Design

Every game question should have 3 hint steps:

1. **Formula / Concept**: Remind the student which formula or rule applies
2. **Substitution / Setup**: Show how to set up the calculation with their specific numbers
3. **Full Solution**: Show the complete worked solution

```typescript
hints: [
  { text: "The area of a triangle is base times height divided by 2", latex: "A = \\frac{a \\cdot h}{2}" },
  { text: "Substitute the values", latex: "A = \\frac{6 \\cdot 4}{2}" },
  { text: "Calculate", latex: "A = \\frac{24}{2} = 12" },
]
```
