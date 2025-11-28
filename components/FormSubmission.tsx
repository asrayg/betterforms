'use client';

import { useState } from 'react';
import { Question } from '@/lib/types';
import { VoiceRecorder } from './VoiceRecorder';
import { TranscriptBox } from './TranscriptBox';

interface FormSubmissionProps {
  formId: string;
  questions: Question[];
  settings?: {
    collect_email?: boolean;
    limit_one_response?: boolean;
    show_progress_bar?: boolean;
    confirmation_message?: string;
  } | null;
}

export function FormSubmission({ formId, questions, settings }: FormSubmissionProps) {
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
  const [respondentEmail, setRespondentEmail] = useState('');
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
      const oldTranscript = currentAnswer?.transcript_text || '';
      
      // Get text before the transcript (user's typed text)
      let textBeforeTranscript = currentText;
      if (oldTranscript) {
        // Try to find and remove the transcript portion
        const transcriptIndex = currentText.lastIndexOf(oldTranscript);
        if (transcriptIndex !== -1) {
          textBeforeTranscript = currentText.substring(0, transcriptIndex).trim();
        } else {
          // If transcript was appended with newlines, try that pattern
          const pattern = '\n\n' + oldTranscript;
          const patternIndex = currentText.lastIndexOf(pattern);
          if (patternIndex !== -1) {
            textBeforeTranscript = currentText.substring(0, patternIndex).trim();
          }
        }
      }
      
      // Rebuild answer_text with new transcript
      const newText = textBeforeTranscript
        ? `${textBeforeTranscript}\n\n${newTranscript}`
        : newTranscript;
      
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
      const oldTranscript = currentAnswer?.transcript_text || '';
      
      // Remove the transcript portion from answer_text
      let newText = currentText;
      if (oldTranscript) {
        // Try to find and remove the transcript
        const transcriptIndex = currentText.lastIndexOf(oldTranscript);
        if (transcriptIndex !== -1) {
          newText = currentText.substring(0, transcriptIndex).trim();
        } else {
          // Try pattern with newlines
          const pattern = '\n\n' + oldTranscript;
          const patternIndex = currentText.lastIndexOf(pattern);
          if (patternIndex !== -1) {
            newText = currentText.substring(0, patternIndex).trim();
          }
        }
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

  const validateAnswer = (question: Question, answer: string | null | undefined): string | null => {
    if (!answer) return null;

    if (question.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(answer)) {
        return 'Please enter a valid email address';
      }
    }

    if (question.type === 'number') {
      const num = parseFloat(answer);
      if (isNaN(num)) {
        return 'Please enter a valid number';
      }
      if (question.validation?.min !== undefined && num < question.validation.min) {
        return `Value must be at least ${question.validation.min}`;
      }
      if (question.validation?.max !== undefined && num > question.validation.max) {
        return `Value must be at most ${question.validation.max}`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email if required
    if (settings?.collect_email) {
      if (!respondentEmail.trim()) {
        alert('Please enter your email address');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(respondentEmail)) {
        alert('Please enter a valid email address');
        return;
      }
    }

    // Validate required questions
    const requiredQuestions = questions.filter((q) => q.required);
    for (const question of requiredQuestions) {
      const answer = answers[question.id!]?.answer_text;
      if (!answer?.trim()) {
        alert(`Please answer the required question: ${question.prompt}`);
        return;
      }
      
      // Validate answer format
      const error = validateAnswer(question, answer);
      if (error) {
        alert(`${question.prompt}: ${error}`);
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
          respondent_email: settings?.collect_email ? respondentEmail : null,
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
        <p className="text-gray-600">
          {settings?.confirmation_message || 'Thank you for your response.'}
        </p>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(answers).filter(
    (qId) => answers[qId]?.answer_text?.trim()
  ).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {settings?.show_progress_bar && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{answeredQuestions} of {totalQuestions}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {settings?.collect_email && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            Email Address <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            value={respondentEmail}
            onChange={(e) => setRespondentEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
            placeholder="your.email@example.com"
          />
        </div>
      )}

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

          {question.type === 'email' && (
            <input
              type="email"
              value={answers[question.id!]?.answer_text || ''}
              onChange={(e) =>
                updateAnswer(question.id!, e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required={question.required}
              placeholder="example@email.com"
            />
          )}

          {question.type === 'number' && (
            <input
              type="number"
              value={answers[question.id!]?.answer_text || ''}
              onChange={(e) =>
                updateAnswer(question.id!, e.target.value)
              }
              min={question.validation?.min}
              max={question.validation?.max}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required={question.required}
              placeholder={
                question.validation?.min !== undefined || question.validation?.max !== undefined
                  ? `${question.validation?.min || ''} - ${question.validation?.max || ''}`
                  : 'Enter a number'
              }
            />
          )}

          {question.type === 'date' && (
            <input
              type="date"
              value={answers[question.id!]?.answer_text || ''}
              onChange={(e) =>
                updateAnswer(question.id!, e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required={question.required}
            />
          )}

          {question.type === 'time' && (
            <input
              type="time"
              value={answers[question.id!]?.answer_text || ''}
              onChange={(e) =>
                updateAnswer(question.id!, e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required={question.required}
            />
          )}

          {question.type === 'checkbox' && (
            <div className="space-y-2">
              {question.options?.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name={`question-${question.id}`}
                    value={option}
                    checked={
                      answers[question.id!]?.answer_text?.includes(option) || false
                    }
                    onChange={(e) => {
                      const currentAnswer = answers[question.id!]?.answer_text || '';
                      const selectedOptions = currentAnswer
                        ? currentAnswer.split(',').filter((opt) => opt.trim())
                        : [];
                      
                      if (e.target.checked) {
                        selectedOptions.push(option);
                      } else {
                        const index = selectedOptions.indexOf(option);
                        if (index > -1) selectedOptions.splice(index, 1);
                      }
                      
                      updateAnswer(question.id!, selectedOptions.join(', '));
                    }}
                    className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'linear_scale' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>{question.validation?.min || 1}</span>
                <span>{question.validation?.max || 5}</span>
              </div>
              <div className="flex items-center gap-3">
                {Array.from(
                  { 
                    length: (question.validation?.max || 5) - (question.validation?.min || 1) + 1 
                  }, 
                  (_, i) => {
                    const value = (question.validation?.min || 1) + i;
                    return (
                      <label
                        key={value}
                        className="flex flex-col items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer flex-1"
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={value.toString()}
                          checked={
                            answers[question.id!]?.answer_text === value.toString()
                          }
                          onChange={(e) =>
                            updateAnswer(question.id!, e.target.value)
                          }
                          className="mb-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                          required={question.required}
                        />
                        <span className="text-sm text-gray-900">{value}</span>
                      </label>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {question.type === 'long' && (
            <div className="space-y-3">
              <div className="space-y-2">
                {answers[question.id!]?.audio_url && answers[question.id!]?.transcript_text && (
                  <TranscriptBox
                    transcript={answers[question.id!]!.transcript_text!}
                    audioUrl={answers[question.id!]!.audio_url!}
                    onTranscriptChange={(newTranscript) => {
                      updateTranscriptText(question.id!, newTranscript);
                    }}
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
                        updateAnswer(question.id!, transcript, audioUrl, transcript);
                      } catch (error: any) {
                        console.error('Error re-transcribing:', error);
                        alert(error.message || 'Failed to transcribe audio. Please try again.');
                      }
                    }}
                    onRemove={() => {
                      removeAudio(question.id!);
                    }}
                  />
                )}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Type your answer or use voice recording..."
                  required={question.required}
                />
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

