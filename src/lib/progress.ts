import { createClient } from "@/lib/supabase/client";
import { lessons } from "@/content/lessons";

export async function saveGameScore(
  userId: string,
  lessonId: string,
  gameId: string,
  score: number,
  maxScore: number
) {
  const supabase = createClient();
  if (!supabase) return;

  const accuracy = maxScore > 0 ? (score / maxScore) * 100 : 0;

  await supabase.from("game_attempts").insert({
    user_id: userId,
    lesson_id: lessonId,
    game_id: gameId,
    score,
    max_score: maxScore,
    accuracy,
  });

  await updateLessonProgress(userId, lessonId);
}

async function updateLessonProgress(userId: string, lessonId: string) {
  const supabase = createClient();
  if (!supabase) return;

  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) return;

  // Get best score for each game in this lesson
  const { data: allAttempts } = await supabase
    .from("game_attempts")
    .select("game_id, score, max_score")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId);

  if (!allAttempts) return;

  // For each game, find best score percentage
  let totalPercent = 0;
  const gameCount = lesson.games.length;

  for (const gameId of lesson.games) {
    const gameAttempts = allAttempts.filter((a) => a.game_id === gameId);
    if (gameAttempts.length > 0) {
      const best = gameAttempts.reduce((max, a) =>
        a.score > max.score ? a : max
      );
      totalPercent += best.max_score > 0 ? (best.score / best.max_score) * 100 : 0;
    }
  }

  // Average percentage across all games
  const progressPercent = Math.round(totalPercent / gameCount);
  const isComplete = progressPercent >= 80;

  await supabase.from("lesson_progress").upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completed: isComplete,
      completed_at: isComplete ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,lesson_id" }
  );
}
