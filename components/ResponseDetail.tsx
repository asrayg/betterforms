'use client';

import { ResponseWithAnswers } from '@/lib/types';
import { Play } from 'lucide-react';

interface ResponseDetailProps {
  response: ResponseWithAnswers;
}

export function ResponseDetail({ response }: ResponseDetailProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Response Details
        </h2>
        <p className="text-sm text-gray-600">
          Submitted on {new Date(response.created_at).toLocaleString()}
        </p>
      </div>

      <div className="space-y-6">
        {response.answers.map((answer) => (
          <div key={answer.id} className="border-b border-gray-200 pb-6 last:border-0">
            <h3 className="font-medium text-gray-900 mb-2">
              {answer.question.prompt}
            </h3>

            {answer.question.type === 'mcq' && (
              <p className="text-gray-700">{answer.answer_text}</p>
            )}

            {answer.question.type === 'short' && (
              <p className="text-gray-700">{answer.answer_text}</p>
            )}

            {answer.question.type === 'long' && (
              <div className="space-y-3">
                <div className="text-gray-900 whitespace-pre-wrap text-base">
                  {answer.answer_text}
                </div>

                {answer.audio_url && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">
                        Audio Recording:
                      </span>
                      <audio controls className="flex-1">
                        <source src={answer.audio_url} type="audio/webm" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

