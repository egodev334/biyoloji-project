export interface User {
  id: string;
  name: string;
  email?: string;
  role: 'student' | 'admin';
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  exam_count?: number;
  badge_count?: number;
  modules_viewed?: number;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  content?: string;
  category?: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  author_name?: string;
  file_count?: number;
  view_count?: number;
  exam_count?: number;
}

export interface ModuleFile {
  id: string;
  module_id: string;
  filename: string;
  original_name: string;
  file_type: 'pdf' | 'video' | 'image' | 'document';
  file_size?: number;
  mime_type?: string;
  url: string;
  created_at: string;
}

export interface Exam {
  id: string;
  module_id: string;
  module_title?: string;
  title: string;
  description?: string;
  duration_minutes: number;
  pass_score: number;
  question_count?: number;
  is_active: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer?: string;
  explanation?: string;
  order_index: number;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  exam_title?: string;
  module_title?: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken_seconds?: number;
  completed_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  criteria_type?: string;
  module_id?: string;
  earned_at?: string;
  created_at: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  order_index: number;
  topic_count?: number;
  reply_count?: number;
}

export interface ForumTopic {
  id: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  user_id: string;
  author_name?: string;
  author_avatar?: string;
  author_role?: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count?: number;
  last_reply_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ForumReply {
  id: string;
  topic_id: string;
  author_name?: string;
  author_avatar?: string;
  author_role?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PracticeQuestion {
  id: string;
  module_id?: string;
  module_title?: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
