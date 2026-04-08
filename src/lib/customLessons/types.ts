// ---------------------------------------------------------------------------
// Content element — the atomic unit of user-created content
// ---------------------------------------------------------------------------

export interface ContentElement {
  type: "text" | "latex" | "image";
  /** Plain text, LaTeX string, or image URL. */
  value: string;
}

// ---------------------------------------------------------------------------
// Section configs (stored as JSONB in custom_sections.config)
// ---------------------------------------------------------------------------

export interface CustomMatchPairsConfig {
  gridCols: number;
  pairs: { left: ContentElement; right: ContentElement }[];
}

export interface CustomComparisonConfig {
  prompt: string;
  showEqualButton: boolean;
  totalQuestions: number;
  pairs: {
    left: ContentElement;
    right: ContentElement;
    correct: "left" | "right" | "equal";
  }[];
}

export interface CustomLatexConfig {
  content: string;
  displayMode: boolean;
}

export type CustomSectionType = "match_pairs" | "comparison" | "latex";

// ---------------------------------------------------------------------------
// Database row types
// ---------------------------------------------------------------------------

export interface CustomSection {
  id: string;
  lesson_id: string;
  position: number;
  type: CustomSectionType;
  title: string;
  config: CustomMatchPairsConfig | CustomComparisonConfig | CustomLatexConfig;
  created_at: string;
}

export interface CustomLesson {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: "primary" | "highschool";
  created_at: string;
  updated_at: string;
  sections?: CustomSection[];
}

export interface LessonShare {
  id: string;
  lesson_id: string;
  shared_with: string;
  created_at: string;
}
