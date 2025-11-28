'use client';

import { useState } from 'react';
import { Question, QuestionType } from '@/lib/types';
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';

interface FormBuilderProps {
  initialForm: {
    title: string;
    description?: string;
    published: boolean;
    questions: Question[];
  };
  onSave: (formData: {
    title: string;
    description?: string;
    published: boolean;
    questions: Question[];
  }) => void;
  loading?: boolean;
}

export function FormBuilder({
  initialForm,
  onSave,
  loading = false,
}: FormBuilderProps) {
  const [title, setTitle] = useState(initialForm.title);
  const [description, setDescription] = useState(initialForm.description || '');
  const [published, setPublished] = useState(initialForm.published);
  const [questions, setQuestions] = useState<Question[]>(
    initialForm.questions.map((q, idx) => ({
      ...q,
      order_index: q.order_index ?? idx,
    }))
  );

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      order_index: questions.length,
      type,
      prompt: '',
      required: false,
      options: type === 'mcq' ? ['Option 1', 'Option 2'] : null,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = questions
      .filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, order_index: i }));
    setQuestions(updated);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const updated = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated[index].order_index = index;
    updated[newIndex].order_index = newIndex;
    setQuestions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a form title');
      return;
    }

    const questionsWithIndices = questions.map((q, idx) => ({
      ...q,
      order_index: idx,
    }));

    onSave({
      title,
      description,
      published,
      questions: questionsWithIndices,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Form Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Untitled Form"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
            placeholder="Form description (optional)"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="published" className="ml-2 text-sm text-gray-700">
            Published (form is publicly accessible)
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="mb-2">
                  <input
                    type="text"
                    value={question.prompt}
                    onChange={(e) =>
                      updateQuestion(index, { prompt: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Question prompt"
                  />
                </div>

                {question.type === 'mcq' && question.options && (
                  <div className="space-y-2 mt-3">
                    {question.options.map((option, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...question.options!];
                            newOptions[optIdx] = e.target.value;
                            updateQuestion(index, { options: newOptions });
                          }}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder={`Option ${optIdx + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = question.options!.filter(
                              (_, i) => i !== optIdx
                            );
                            updateQuestion(index, {
                              options: newOptions.length > 0 ? newOptions : null,
                            });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        updateQuestion(index, {
                          options: [...(question.options || []), 'New Option'],
                        });
                      }}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      + Add Option
                    </button>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4">
                  <select
                    value={question.type}
                    onChange={(e) => {
                      const newType = e.target.value as QuestionType;
                      updateQuestion(index, {
                        type: newType,
                        options:
                          newType === 'mcq'
                            ? ['Option 1', 'Option 2']
                            : null,
                      });
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="short">Short Answer</option>
                    <option value="long">Long Answer</option>
                    <option value="mcq">Multiple Choice</option>
                  </select>

                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) =>
                        updateQuestion(index, { required: e.target.checked })
                      }
                      className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    Required
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1 ml-4">
                <button
                  type="button"
                  onClick={() => moveQuestion(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveQuestion(index, 'down')}
                  disabled={index === questions.length - 1}
                  className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addQuestion('short')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Short Answer
          </button>
          <button
            type="button"
            onClick={() => addQuestion('long')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Long Answer
          </button>
          <button
            type="button"
            onClick={() => addQuestion('mcq')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Multiple Choice
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Form'}
        </button>
      </div>
    </form>
  );
}

