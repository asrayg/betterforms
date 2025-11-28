export type QuestionType = 
  | 'short' 
  | 'long' 
  | 'mcq' 
  | 'checkbox' 
  | 'email' 
  | 'number' 
  | 'date' 
  | 'time' 
  | 'linear_scale';

export interface Question {
  id?: string;
  form_id?: string;
  order_index: number;
  type: QuestionType;
  prompt: string;
  required: boolean;
  options?: string[] | null;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  } | null;
}

export interface Form {
  id: string;
  owner_id: string;
  title: string;
  description?: string | null;
  published: boolean;
  settings?: {
    collect_email?: boolean;
    limit_one_response?: boolean;
    show_progress_bar?: boolean;
    confirmation_message?: string;
  } | null;
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

