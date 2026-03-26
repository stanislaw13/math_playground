export interface Profile {
  id: string;
  username: string;
  created_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface GameAttempt {
  id: string;
  user_id: string;
  lesson_id: string;
  game_id: string;
  score: number;
  max_score: number;
  accuracy: number;
  attempted_at: string;
}

export interface TeacherLink {
  id: string;
  student_id: string;
  teacher_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
}
