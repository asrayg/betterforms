'use client';

import { useState } from 'react';
import { Question } from '@/lib/types';
import { VoiceRecorder } from './VoiceRecorder';
import { TranscriptBox } from './TranscriptBox';

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
    setAnswers((prev) => {
      const currentAnswer = prev[questionId];
      
      // If transcript is provided, append to existing text (or set if empty)
      // Otherwise, just update with the value (user typing)
      let newText = value;
      if (transcript !== undefined) {
        newText = currentAnswer?.answer_text
          ? `${currentAnswer.answer_text}\n\n${transcript}`
          : transcript;
      }
      
      return {
        ...prev,
        [questionId]: {
          answer_text: newText,
          audio_url: audioUrl !== undefined ? audioUrl : currentAnswer?.audio_url,
          transcript_text: transcript !== undefined ? transcript : currentAnswer?.transcript_text,
        },
      };
    });
  };

  const updateTranscriptText = (questionId: string, newTranscript: string) => {
    setAnswers((prev) => {
      const currentAnswer = prev[questionId];
      const currentText = currentAnswer?.answer_text || '';
      const transcriptText = currentAnswer?.transcript_text || '';
      
      // Replace the transcript portion in answer_text with the edited version
      let newText = currentText;
      if (transcriptText && currentText.includes(transcriptText)) {
        newText = currentText.replace(transcriptText, newTranscript);
      } else if (currentText.endsWith('\n\n' + transcriptText)) {
        newText = currentText.replace('\n\n' + transcriptText, '\n\n' + newTranscript);
      } else {
        // If transcript is at the end, replace it
        newText = currentText.replace(new RegExp(transcriptText + '$'), newTranscript);
      }
      
      return {
        ...prev,
        [questionId]: {
          ...currentAnswer,
          answer_text: newText,
          transcript_text: newTranscript,
        },
      };
    });
  };

  const removeAudio = (questionId: string) => {
    setAnswers((prev) => {
      const currentAnswer = prev[questionId];
      const currentText = currentAnswer?.answer_text || '';
      const transcriptText = currentAnswer?.transcript_text || '';
      
      // Remove the transcript portion from answer_text
      let newText = currentText;
      if (transcriptText) {
        // Remove transcript and any preceding newlines
        newText = currentText
          .replace(new RegExp('\\n\\n' + transcriptText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), '')
          .replace(new RegExp(transcriptText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), '')
          .trim();
      }
      
      return {
        ...prev,
        [questionId]: {
          answer_text: newText,
          audio_url: null,
          transcript_text: null,
        },
      };
    });
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required={question.required}
            />
          )}

          {question.type === 'long' && (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  value={answers[question.id!]?.answer_text || ''}
                  onChange={(e) => {
                    const currentAnswer = answers[question.id!];
                    updateAnswer(
                      question.id!,
                      e.target.value,
                      currentAnswer?.audio_url,
                      undefined
                    );
                  }}
                  rows={6}
                  className="w-full px-4 py-2 pr-24 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Type your answer or use voice recording..."
                  required={question.required}
                />
                {answers[question.id!]?.audio_url && (
                  <div className="absolute top-2 right-2 z-10">
                    <AudioBox
                      audioUrl={answers[question.id!]!.audio_url!}
                      isTranscribing={false}
                      onReTranscribe={async () => {
                        const audioUrl = answers[question.id!]?.audio_url;
                        if (!audioUrl) return;
                        
                        try {
                          const transcribeRes = await fetch('/api/transcribe', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ audio_url: audioUrl }),
                          });

                          if (!transcribeRes.ok) {
                            throw new Error('Transcription failed');
                          }

                          const { transcript } = await transcribeRes.json();
                          // Replace the textarea content with new transcript
                          updateAnswer(question.id!, transcript, audioUrl, transcript);
                        } catch (error: any) {
                          console.error('Error re-transcribing:', error);
                          alert(error.message || 'Failed to transcribe audio. Please try again.');
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              <VoiceRecorder
                formId={formId}
                questionId={question.id!}
                currentAudioUrl={answers[question.id!]?.audio_url}
                onTranscript={(transcript, audioUrl) => {
                  // Append transcript to existing text or replace if empty
                  const currentText = answers[question.id!]?.answer_text || '';
                  const newText = currentText
                    ? `${currentText}\n\n${transcript}`
                    : transcript;
                  updateAnswer(question.id!, newText, audioUrl, transcript);
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

