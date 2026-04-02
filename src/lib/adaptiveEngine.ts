/**
 * Adaptive Engine — tracks student performance by skill category and
 * intelligently selects the next question to maximize learning.
 *
 * Core ideas:
 *  - Each question belongs to a "skill category" (e.g. "triangle-area", "square-perimeter").
 *  - The engine tracks correct/incorrect attempts per category.
 *  - Weak categories get more questions; strong ones appear less often.
 *  - Within a category, difficulty can scale: easy → medium → hard.
 *  - After a streak of success on a category, the engine promotes the difficulty
 *    OR deprioritises the category in favour of weaker ones.
 *
 * Usage in a game component:
 *
 *   const engine = useAdaptiveEngine(skillCategories);
 *   const next = engine.pickNext();          // returns { category, difficulty }
 *   engine.record(category, correct);        // after student answers
 *   const summary = engine.getSummary();     // for end-of-game report
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Difficulty = "easy" | "medium" | "hard";

export interface SkillCategory {
  /** Unique key like "triangle-area" or "decimal-multiply". */
  id: string;
  /** Human label for display. */
  label: string;
  /** Starting weight — higher means shown more often at the start. Defaults to 1. */
  initialWeight?: number;
}

export interface SkillRecord {
  id: string;
  label: string;
  correct: number;
  incorrect: number;
  /** Rolling window of the last N attempts (true = correct). */
  recentAttempts: boolean[];
  /** Current difficulty level for this category. */
  difficulty: Difficulty;
  /** Number of consecutive correct answers at the current difficulty. */
  streak: number;
  /** Current selection weight (higher = more likely to be picked). */
  weight: number;
}

export interface PickResult {
  category: string;
  difficulty: Difficulty;
}

export interface AdaptiveEngineSummary {
  /** Categories ordered from weakest to strongest. */
  weakToStrong: { id: string; label: string; accuracy: number; difficulty: Difficulty }[];
  /** Overall accuracy across all categories. */
  overallAccuracy: number;
  totalAttempts: number;
}

export interface AdaptiveEngineState {
  records: Record<string, SkillRecord>;
  /** Pick the next question's category + difficulty. */
  pickNext: () => PickResult;
  /** Record a student's answer. */
  record: (categoryId: string, correct: boolean) => void;
  /** Get performance summary. */
  getSummary: () => AdaptiveEngineSummary;
  /** Get the current record for a category. */
  getRecord: (categoryId: string) => SkillRecord | undefined;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** How many recent attempts to keep in the rolling window. */
const WINDOW_SIZE = 6;

/** Consecutive correct answers needed to promote difficulty. */
const PROMOTE_STREAK = 3;

/** Weight multiplier for categories the student is struggling with. */
const WEAK_BOOST = 3.0;

/** Weight multiplier for categories the student has mastered at current difficulty. */
const STRONG_DAMPEN = 0.3;

/** Base weight for any category. */
const BASE_WEIGHT = 1.0;

/** Accuracy threshold below which a category is considered "weak". */
const WEAK_THRESHOLD = 0.6;

/** Accuracy threshold above which a category is considered "strong". */
const STRONG_THRESHOLD = 0.85;

// ---------------------------------------------------------------------------
// Pure engine (no React dependency — can be used in any context)
// ---------------------------------------------------------------------------

export function createAdaptiveEngine(
  categories: SkillCategory[]
): AdaptiveEngineState {
  const records: Record<string, SkillRecord> = {};

  for (const cat of categories) {
    records[cat.id] = {
      id: cat.id,
      label: cat.label,
      correct: 0,
      incorrect: 0,
      recentAttempts: [],
      difficulty: "easy",
      streak: 0,
      weight: cat.initialWeight ?? BASE_WEIGHT,
    };
  }

  function getRecentAccuracy(rec: SkillRecord): number {
    if (rec.recentAttempts.length === 0) return 0.5; // no data → neutral
    const correct = rec.recentAttempts.filter(Boolean).length;
    return correct / rec.recentAttempts.length;
  }

  function updateWeights() {
    for (const rec of Object.values(records)) {
      const accuracy = getRecentAccuracy(rec);
      const total = rec.correct + rec.incorrect;

      if (total === 0) {
        // Not yet attempted — keep initial weight
        continue;
      }

      if (accuracy < WEAK_THRESHOLD) {
        rec.weight = BASE_WEIGHT * WEAK_BOOST;
      } else if (accuracy > STRONG_THRESHOLD && rec.difficulty === "hard") {
        // Mastered at hard level — show much less
        rec.weight = BASE_WEIGHT * STRONG_DAMPEN;
      } else if (accuracy > STRONG_THRESHOLD) {
        // Strong but not at max difficulty yet — moderate dampening
        rec.weight = BASE_WEIGHT * 0.6;
      } else {
        rec.weight = BASE_WEIGHT;
      }
    }
  }

  function pickNext(): PickResult {
    const entries = Object.values(records);
    const totalWeight = entries.reduce((sum, r) => sum + r.weight, 0);

    // Weighted random selection
    let rand = Math.random() * totalWeight;
    let chosen = entries[0];
    for (const rec of entries) {
      rand -= rec.weight;
      if (rand <= 0) {
        chosen = rec;
        break;
      }
    }

    return { category: chosen.id, difficulty: chosen.difficulty };
  }

  function promoteDifficulty(rec: SkillRecord) {
    if (rec.difficulty === "easy") rec.difficulty = "medium";
    else if (rec.difficulty === "medium") rec.difficulty = "hard";
    // At "hard" — stays hard, weight dampening handles deprioritisation
  }

  function demoteDifficulty(rec: SkillRecord) {
    if (rec.difficulty === "hard") rec.difficulty = "medium";
    else if (rec.difficulty === "medium") rec.difficulty = "easy";
  }

  function record(categoryId: string, correct: boolean) {
    const rec = records[categoryId];
    if (!rec) return;

    if (correct) {
      rec.correct++;
      rec.streak++;
    } else {
      rec.incorrect++;
      rec.streak = 0;
    }

    // Update rolling window
    rec.recentAttempts.push(correct);
    if (rec.recentAttempts.length > WINDOW_SIZE) {
      rec.recentAttempts.shift();
    }

    // Promote difficulty on streak
    if (rec.streak >= PROMOTE_STREAK) {
      promoteDifficulty(rec);
      rec.streak = 0;
    }

    // Demote difficulty if struggling (3 wrong in last 4)
    const recent4 = rec.recentAttempts.slice(-4);
    if (recent4.length >= 4) {
      const wrongCount = recent4.filter((a) => !a).length;
      if (wrongCount >= 3) {
        demoteDifficulty(rec);
      }
    }

    updateWeights();
  }

  function getSummary(): AdaptiveEngineSummary {
    const entries = Object.values(records);
    const totalAttempts = entries.reduce(
      (sum, r) => sum + r.correct + r.incorrect,
      0
    );
    const totalCorrect = entries.reduce((sum, r) => sum + r.correct, 0);

    const weakToStrong = entries
      .map((r) => ({
        id: r.id,
        label: r.label,
        accuracy:
          r.correct + r.incorrect > 0
            ? r.correct / (r.correct + r.incorrect)
            : 0,
        difficulty: r.difficulty,
      }))
      .sort((a, b) => a.accuracy - b.accuracy);

    return {
      weakToStrong,
      overallAccuracy: totalAttempts > 0 ? totalCorrect / totalAttempts : 0,
      totalAttempts,
    };
  }

  function getRecord(categoryId: string): SkillRecord | undefined {
    return records[categoryId];
  }

  return { records, pickNext, record, getSummary, getRecord };
}

// ---------------------------------------------------------------------------
// Difficulty-aware number generation helpers
// ---------------------------------------------------------------------------

/** Generate a random integer within a range that scales with difficulty. */
export function adaptiveInt(
  difficulty: Difficulty,
  easy: [number, number],
  medium: [number, number],
  hard: [number, number]
): number {
  const [min, max] =
    difficulty === "easy" ? easy : difficulty === "medium" ? medium : hard;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Generate a random decimal with appropriate precision for difficulty. */
export function adaptiveDecimal(
  difficulty: Difficulty,
  easy: [number, number],
  medium: [number, number],
  hard: [number, number],
  /** Decimal places */
  precision?: number
): number {
  const dp = precision ?? (difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3);
  const [min, max] =
    difficulty === "easy" ? easy : difficulty === "medium" ? medium : hard;
  const raw = Math.random() * (max - min) + min;
  return parseFloat(raw.toFixed(dp));
}
