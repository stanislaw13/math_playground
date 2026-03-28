import { ReactNode, ComponentType } from "react";

// ---------------------------------------------------------------------------
// Section configuration — each lesson is a sequence of sections
// ---------------------------------------------------------------------------

/** Interactive playground with graph + sliders (e.g. shape explorers). */
export interface PlaygroundSectionConfig {
  type: "playground";
  title?: string;
  description?: string;
  /** Components to render (1 = full width, 2 = side-by-side grid). */
  components: ComponentType[];
}

/** Wraps a full game component (ShapeBuilder, Detective, etc.). */
export interface GameSectionConfig {
  type: "game";
  title?: string;
  /** The game component — receives no special props, manages its own state. */
  component: ComponentType;
}

/** Match-pairs card game with configurable pairs. */
export interface MatchPairsSectionConfig {
  type: "game_match_pairs";
  title?: string;
  gameId: string;
  lessonId: string;
  /** Factory that produces a fresh set of pairs each game start. */
  generatePairs: () => MatchPairItem[];
  gridCols?: number;
}

/** Arbitrary JSX — for one-off lesson-specific content. */
export interface CustomSectionConfig {
  type: "custom";
  title?: string;
  /** Render function receiving no props. */
  component: ComponentType;
}

export type SectionConfig =
  | PlaygroundSectionConfig
  | GameSectionConfig
  | MatchPairsSectionConfig
  | CustomSectionConfig;

// ---------------------------------------------------------------------------
// Match-pairs game types
// ---------------------------------------------------------------------------

export interface MatchPairItem {
  /** Content shown on the "left" card. */
  left: ReactNode;
  /** Content shown on the "right" card. */
  right: ReactNode;
}

// ---------------------------------------------------------------------------
// Game wrapper types (for reusable start/finish/scoring shell)
// ---------------------------------------------------------------------------

export interface GameContext {
  addScore: (points: number) => void;
  finish: () => void;
  score: number;
  maxScore: number;
}

// ---------------------------------------------------------------------------
// Formula sidebar item
// ---------------------------------------------------------------------------

export interface FormulaItem {
  label: string;
  latex: string;
  svg?: ReactNode;
}

// ---------------------------------------------------------------------------
// Lesson configuration — the top-level definition for a lesson
// ---------------------------------------------------------------------------

export interface LessonConfig {
  id: string;
  sections: SectionConfig[];
  formulas?: FormulaItem[];
}
