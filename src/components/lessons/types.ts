import React, { ReactNode, ComponentType } from "react";

// ---------------------------------------------------------------------------
// Localisation helper — used by the single-file lesson system
// ---------------------------------------------------------------------------

/**
 * A string value that is either plain English (backward-compatible)
 * or a map of locale → translation, e.g. `{ en: "Areas", pl: "Pola" }`.
 */
export type LocaleString = string | Record<string, string>;

/**
 * Resolves a LocaleString to a plain string for the given locale.
 * Falls back to "en", then to the first available translation.
 */
export function resolveLocaleString(s: LocaleString, locale: string): string {
  if (typeof s === "string") return s;
  return s[locale] ?? s["en"] ?? Object.values(s)[0] ?? "";
}

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

// ---------------------------------------------------------------------------
// Minimal-code lesson authoring — entire lesson in one file
// ---------------------------------------------------------------------------

/**
 * Self-contained lesson definition for single-file lesson authoring.
 * Metadata lives here (no lessons.ts entry, no JSON translations needed).
 * Register with `registerLesson(def)` in src/content/lessons.ts.
 */
/** A FormulaItem whose label can be localised. */
export interface LessonDefFormula {
  label: LocaleString;
  latex: string;
  svg?: React.ReactNode;
}

export interface LessonDef {
  id: string;
  slug: string;
  category: "primary" | "highschool";
  order: number;
  /**
   * Lesson title. Can be a plain English string or a locale map,
   * e.g. `{ en: "Fractions", pl: "Ułamki" }`.
   */
  title: LocaleString;
  /**
   * Lesson description. Can be a plain English string or a locale map.
   */
  description: LocaleString;
  formulas?: LessonDefFormula[];
  /**
   * Returns the lesson sections as ReactNode[].
   * Must be a function (not a static array) so that components using
   * hooks (useState, etc.) are instantiated inside the React render tree.
   * Receives the active locale so sections can render localised content.
   */
  sections: (locale: string) => React.ReactNode[];
  /** Game IDs for progress tracking — must match gameId on GameWrapper/MatchPairsGame. */
  games: string[];
}
