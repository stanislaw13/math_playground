/**
 * Scoring system: each game is worth 1000 points total.
 * Points per question decrease with each wrong attempt:
 *   1st try: 100% of max per question
 *   2nd try: 75%
 *   3rd try: 50%
 *   4+ tries: 25%
 */

export function getPointsForAttempt(
  tryNumber: number,
  maxPerQuestion: number
): number {
  if (tryNumber <= 1) return maxPerQuestion;
  if (tryNumber === 2) return Math.round(maxPerQuestion * 0.75);
  if (tryNumber === 3) return Math.round(maxPerQuestion * 0.5);
  return Math.round(maxPerQuestion * 0.25);
}

export function getMaxPerQuestion(totalQuestions: number): number {
  return Math.round(1000 / totalQuestions);
}
