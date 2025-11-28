export type QuestionType = 'short' | 'long' | 'mcq';

export interface Question {
  id?: string;
  form_id?: string;
  order_index: number;
  type: QuestionType;
  prompt: string;
  required: boolean;
  options?: string[] | null;
}

export interface Form {
  id: string;
  owner_id: string;
  title: string;
  description?: string | null;
  published: boolean;
  created_at: string;
}

export interface Response {
  id: string;
  form_id: string;
  created_at: string;
  respondent_meta?: Record<string, any> | null;
}

export interface Answer {
  id: string;
  response_id: string;
  question_id: string;
  answer_text?: string | null;
  audio_url?: string | null;
  transcript_text?: string | null;
  created_at: string;
}

export interface FormWithQuestions extends Form {
  questions: Question[];
}

export interface ResponseWithAnswers extends Response {
  answers: (Answer & { question: Question })[];
}

