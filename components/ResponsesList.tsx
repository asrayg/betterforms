'use client';

import { useState, useEffect } from 'react';
import { ResponseWithAnswers } from '@/lib/types';
import { ResponseDetail } from './ResponseDetail';
import { ResponseSkeleton } from './LoadingSkeleton';

interface ResponsesListProps {
  formId: string;
}

export function ResponsesList({ formId }: ResponsesListProps) {
  const [responses, setResponses] = useState<ResponseWithAnswers[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);

  useEffect(() => {
    fetchResponses();
  }, [formId]);

  const fetchResponses = async () => {
    try {
      const res = await fetch(`/api/forms/${formId}/responses`);
      if (!res.ok) throw new Error('Failed to fetch responses');
      const data = await res.json();
      setResponses(data);
    } catch (error) {
      console.error('Error fetching responses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ResponseSkeleton />
        </div>
        <div className="lg:col-span-2">
          <ResponseSkeleton />
        </div>
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No responses yet.</p>
      </div>
    );
  }

  const selectedResponseData = responses.find(
    (r) => r.id === selectedResponse
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">
              Responses ({responses.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {responses.map((response) => (
              <button
                key={response.id}
                onClick={() => setSelectedResponse(response.id)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                  selectedResponse === response.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="text-sm font-medium text-gray-900">
                  Response #{responses.length - responses.indexOf(response)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(response.created_at).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedResponseData ? (
          <ResponseDetail response={selectedResponseData} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center text-gray-500">
            Select a response to view details
          </div>
        )}
      </div>
    </div>
  );
}

