'use client';

import { useState } from 'react';
import { Question } from '@/lib/types';
import { VoiceRecorder } from './VoiceRecorder';

interface FormSubmissionProps {
  formId: string;
  questions: Question[];
}

export function FormSubmission({ formId, questions }: FormSubmissionProps) {
  const [answers, setAnswers] = useState<
    Record<
      string,
      {
        answer_text?: string | null;
        audio_url?: string | null;
        transcript_text?: string | null;
      }
    >
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateAnswer = (
    questionId: string,
    value: string,
    audioUrl?: string,
    transcript?: string
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        answer_text: value,
        audio_url: audioUrl || prev[questionId]?.audio_url,
        transcript_text: transcript || prev[questionId]?.transcript_text,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required questions
    const requiredQuestions = questions.filter((q) => q.required);
    for (const question of requiredQuestions) {
      if (!answers[question.id!]?.answer_text?.trim()) {
        alert(`Please answer the required question: ${question.prompt}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            question_id: questionId,
            answer_text: answer.answer_text,
            audio_url: answer.audio_url,
            transcript_text: answer.transcript_text,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit form');
      }

      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert(error.message || 'Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Response Submitted!
        </h2>
        <p className="text-gray-600">Thank you for your response.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {questions.map((question, index) => (
        <div key={question.id || index} className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            {question.prompt}
            {question.required && (
              <span className="text-red-600 ml-1">*</span>
            )}
          </label>

          {question.type === 'short' && (
            <input
              type="text"
              value={answers[question.id!]?.answer_text || ''}
              onChange={(e) =>
                updateAnswer(question.id!, e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required={question.required}
            />
          )}

          {question.type === 'long' && (
            <div className="space-y-3">
              <textarea
                value={answers[question.id!]?.answer_text || ''}
                onChange={(e) =>
                  updateAnswer(question.id!, e.target.value)
                }
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Type your answer or use voice recording..."
                required={question.required}
              />
              <VoiceRecorder
                formId={formId}
                questionId={question.id!}
                onTranscript={(transcript, audioUrl) => {
                  updateAnswer(question.id!, transcript, audioUrl, transcript);
                }}
              />
            </div>
          )}

          {question.type === 'mcq' && (
            <div className="space-y-2">
              {question.options?.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={
                      answers[question.id!]?.answer_text === option
                    }
                    onChange={(e) =>
                      updateAnswer(question.id!, e.target.value)
                    }
                    className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500"
                    required={question.required}
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}

