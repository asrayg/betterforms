import { z } from 'zod';

export const createFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  published: z.boolean().default(false),
  settings: z.object({
    collect_email: z.boolean().optional(),
    limit_one_response: z.boolean().optional(),
    show_progress_bar: z.boolean().optional(),
    confirmation_message: z.string().optional(),
  }).nullable().optional(),
});

export const questionSchema = z.object({
  id: z.string().uuid().optional(),
  form_id: z.string().uuid().optional(),
  order_index: z.number().int().min(0),
  type: z.enum(['short', 'long', 'mcq', 'checkbox', 'email', 'number', 'date', 'time', 'linear_scale']),
  prompt: z.string().min(1, 'Question prompt is required'),
  required: z.boolean().default(false),
  options: z.array(z.string()).nullable().optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).nullable().optional(),
});

export const updateQuestionsSchema = z.object({
  form_id: z.string().uuid(),
  questions: z.array(questionSchema),
});

export const submitResponseSchema = z.object({
  form_id: z.string().uuid(),
  answers: z.array(
    z.object({
      question_id: z.string().uuid(),
      answer_text: z.string().nullable().optional(),
      audio_url: z.string().nullable().optional(),
      transcript_text: z.string().nullable().optional(),
    })
  ),
  respondent_meta: z.record(z.any()).optional(),
  respondent_email: z.string().email().optional().nullable(),
});

export const transcribeSchema = z.object({
  audio_url: z.string().url(),
});

