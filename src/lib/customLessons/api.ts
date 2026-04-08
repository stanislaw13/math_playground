import { createClient } from "@/lib/supabase/client";
import type { CustomLesson, CustomSection, LessonShare } from "./types";

function getClient() {
  const client = createClient();
  if (!client) throw new Error("Supabase not configured");
  return client;
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export async function fetchMyLessons(userId: string): Promise<CustomLesson[]> {
  const { data, error } = await getClient()
    .from("custom_lessons")
    .select("*")
    .eq("creator_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchSharedLessons(userId: string): Promise<(CustomLesson & { creator_username?: string })[]> {
  const sb = getClient();
  const { data: shares, error: sharesErr } = await sb
    .from("lesson_shares")
    .select("lesson_id")
    .eq("shared_with", userId);
  if (sharesErr) throw sharesErr;
  if (!shares?.length) return [];

  const lessonIds = shares.map((s) => s.lesson_id);
  const { data, error } = await sb
    .from("custom_lessons")
    .select("*")
    .in("id", lessonIds)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchLesson(lessonId: string): Promise<CustomLesson & { sections: CustomSection[] }> {
  const sb = getClient();
  const { data: lesson, error } = await sb
    .from("custom_lessons")
    .select("*")
    .eq("id", lessonId)
    .single();
  if (error) throw error;

  const { data: sections, error: secErr } = await sb
    .from("custom_sections")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("position", { ascending: true });
  if (secErr) throw secErr;

  return { ...lesson, sections: sections ?? [] };
}

export async function createLesson(
  creatorId: string,
  title: string,
  description: string,
  category: "primary" | "highschool",
): Promise<CustomLesson> {
  const { data, error } = await getClient()
    .from("custom_lessons")
    .insert({ creator_id: creatorId, title, description, category })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLesson(
  lessonId: string,
  updates: Partial<Pick<CustomLesson, "title" | "description" | "category">>,
): Promise<void> {
  const { error } = await getClient()
    .from("custom_lessons")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", lessonId);
  if (error) throw error;
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const { error } = await getClient()
    .from("custom_lessons")
    .delete()
    .eq("id", lessonId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export async function addSection(
  lessonId: string,
  type: CustomSection["type"],
  title: string,
  config: CustomSection["config"],
  position: number,
): Promise<CustomSection> {
  const { data, error } = await getClient()
    .from("custom_sections")
    .insert({ lesson_id: lessonId, type, title, config, position })
    .select()
    .single();
  if (error) throw error;
  // Touch parent updated_at
  await getClient()
    .from("custom_lessons")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", lessonId);
  return data;
}

export async function updateSection(
  sectionId: string,
  updates: Partial<Pick<CustomSection, "title" | "config" | "position">>,
): Promise<void> {
  const { error } = await getClient()
    .from("custom_sections")
    .update(updates)
    .eq("id", sectionId);
  if (error) throw error;
}

export async function deleteSection(sectionId: string): Promise<void> {
  const { error } = await getClient()
    .from("custom_sections")
    .delete()
    .eq("id", sectionId);
  if (error) throw error;
}

export async function reorderSections(
  lessonId: string,
  sectionIds: string[],
): Promise<void> {
  const sb = getClient();
  for (let i = 0; i < sectionIds.length; i++) {
    const { error } = await sb
      .from("custom_sections")
      .update({ position: i })
      .eq("id", sectionIds[i])
      .eq("lesson_id", lessonId);
    if (error) throw error;
  }
}

// ---------------------------------------------------------------------------
// Shares
// ---------------------------------------------------------------------------

export async function shareLessonWithUser(
  lessonId: string,
  username: string,
): Promise<LessonShare> {
  const sb = getClient();
  // Look up user by username
  const { data: profile, error: profileErr } = await sb
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();
  if (profileErr) throw new Error("User not found");

  const { data, error } = await sb
    .from("lesson_shares")
    .insert({ lesson_id: lessonId, shared_with: profile.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeShare(shareId: string): Promise<void> {
  const { error } = await getClient()
    .from("lesson_shares")
    .delete()
    .eq("id", shareId);
  if (error) throw error;
}

export async function fetchShares(
  lessonId: string,
): Promise<(LessonShare & { username: string })[]> {
  const sb = getClient();
  const { data, error } = await sb
    .from("lesson_shares")
    .select("*, profiles!shared_with(username)")
    .eq("lesson_id", lessonId);
  if (error) throw error;
  return (data ?? []).map((row: unknown) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      lesson_id: r.lesson_id as string,
      shared_with: r.shared_with as string,
      created_at: r.created_at as string,
      username: (r.profiles as { username: string })?.username ?? "",
    };
  });
}
