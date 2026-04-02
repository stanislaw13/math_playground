"use client";

import { useState, useCallback, useRef } from "react";
import {
  createAdaptiveEngine,
  type SkillCategory,
  type AdaptiveEngineState,
  type PickResult,
  type AdaptiveEngineSummary,
  type SkillRecord,
} from "@/lib/adaptiveEngine";

/**
 * React hook wrapping the adaptive engine.
 * Triggers re-renders when performance data changes so the UI can react
 * (e.g. showing a "you're improving at triangles!" message).
 *
 * Usage:
 *   const engine = useAdaptiveEngine(categories);
 *   const { category, difficulty } = engine.pickNext();
 *   // ... student answers ...
 *   engine.record("triangle-area", true);
 */
export interface UseAdaptiveEngineReturn {
  pickNext: () => PickResult;
  record: (categoryId: string, correct: boolean) => void;
  getSummary: () => AdaptiveEngineSummary;
  getRecord: (categoryId: string) => SkillRecord | undefined;
  /** Increments on every record() call — use to trigger re-renders. */
  updateCount: number;
}

export default function useAdaptiveEngine(
  categories: SkillCategory[]
): UseAdaptiveEngineReturn {
  // The engine itself is a ref (mutable, no re-render on internal changes).
  // We use a counter to signal React when the UI should update.
  const engineRef = useRef<AdaptiveEngineState | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  // Lazy-init the engine so it's stable across re-renders.
  if (!engineRef.current) {
    engineRef.current = createAdaptiveEngine(categories);
  }

  const pickNext = useCallback((): PickResult => {
    return engineRef.current!.pickNext();
  }, []);

  const record = useCallback((categoryId: string, correct: boolean) => {
    engineRef.current!.record(categoryId, correct);
    setUpdateCount((c) => c + 1);
  }, []);

  const getSummary = useCallback((): AdaptiveEngineSummary => {
    return engineRef.current!.getSummary();
  }, []);

  const getRecord = useCallback(
    (categoryId: string): SkillRecord | undefined => {
      return engineRef.current!.getRecord(categoryId);
    },
    []
  );

  return { pickNext, record, getSummary, getRecord, updateCount };
}
