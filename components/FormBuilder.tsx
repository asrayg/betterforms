'use client';

import { useState } from 'react';
import { Question, QuestionType } from '@/lib/types';
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';

interface FormBuilderProps {
  initialForm: {
    title: string;
    description?: string;
    published: boolean;
    settings?: {
      collect_email?: boolean;
      limit_one_response?: boolean;
      show_progress_bar?: boolean;
      confirmation_message?: string;
    } | null;
    questions: Question[];
  };
  onSave: (formData: {
    title: string;
    description?: string;
    published: boolean;
    settings?: {
      collect_email?: boolean;
      limit_one_response?: boolean;
      show_progress_bar?: boolean;
      confirmation_message?: string;
    } | null;
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
  const [settings, setSettings] = useState(initialForm.settings || {
    collect_email: false,
    limit_one_response: false,
    show_progress_bar: false,
    confirmation_message: 'Thank you for your response!',
  });
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
      options: 
        type === 'mcq' || type === 'checkbox' 
          ? ['Option 1', 'Option 2'] 
          : type === 'linear_scale'
          ? ['1', '2', '3', '4', '5']
          : null,
      validation: 
        type === 'number' 
          ? { min: undefined, max: undefined }
          : type === 'linear_scale'
          ? { min: 1, max: 5 }
          : null,
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
      // Will be handled by required attribute, but keeping for safety
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
      settings,
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

        <div className="space-y-3">
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
          
          <div className="border-t border-gray-200 pt-3 space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Form Settings</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.collect_email || false}
                  onChange={(e) => setSettings({ ...settings, collect_email: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Collect email addresses</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.limit_one_response || false}
                  onChange={(e) => setSettings({ ...settings, limit_one_response: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Limit to 1 response per person</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.show_progress_bar || false}
                  onChange={(e) => setSettings({ ...settings, show_progress_bar: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Show progress bar</span>
              </label>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Confirmation Message</label>
                <input
                  type="text"
                  value={settings.confirmation_message || 'Thank you for your response!'}
                  onChange={(e) => setSettings({ ...settings, confirmation_message: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Thank you for your response!"
                />
              </div>
            </div>
          </div>
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

                {(question.type === 'mcq' || question.type === 'checkbox') && question.options && (
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

                {question.type === 'linear_scale' && (
                  <div className="space-y-3 mt-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Min</label>
                        <input
                          type="number"
                          value={question.validation?.min || 1}
                          onChange={(e) => {
                            const min = parseInt(e.target.value) || 1;
                            updateQuestion(index, {
                              validation: { ...question.validation, min, max: question.validation?.max || 5 },
                            });
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Max</label>
                        <input
                          type="number"
                          value={question.validation?.max || 5}
                          onChange={(e) => {
                            const max = parseInt(e.target.value) || 5;
                            updateQuestion(index, {
                              validation: { ...question.validation, min: question.validation?.min || 1, max },
                            });
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{question.validation?.min || 1}</span>
                      {Array.from({ length: (question.validation?.max || 5) - (question.validation?.min || 1) + 1 }, (_, i) => (
                        <span key={i} className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded">
                          {(question.validation?.min || 1) + i}
                        </span>
                      ))}
                      <span>{question.validation?.max || 5}</span>
                    </div>
                  </div>
                )}

                {(question.type === 'number') && (
                  <div className="flex items-center gap-4 mt-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Min Value</label>
                      <input
                        type="number"
                        value={question.validation?.min ?? ''}
                        onChange={(e) => {
                          const min = e.target.value ? parseFloat(e.target.value) : undefined;
                          updateQuestion(index, {
                            validation: { ...question.validation, min },
                          });
                        }}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="No limit"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Max Value</label>
                      <input
                        type="number"
                        value={question.validation?.max ?? ''}
                        onChange={(e) => {
                          const max = e.target.value ? parseFloat(e.target.value) : undefined;
                          updateQuestion(index, {
                            validation: { ...question.validation, max },
                          });
                        }}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="No limit"
                      />
                    </div>
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
                          newType === 'mcq' || newType === 'checkbox'
                            ? ['Option 1', 'Option 2']
                            : newType === 'linear_scale'
                            ? ['1', '2', '3', '4', '5']
                            : null,
                        validation:
                          newType === 'number'
                            ? { min: undefined, max: undefined }
                            : newType === 'linear_scale'
                            ? { min: 1, max: 5 }
                            : null,
                      });
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="short">Short Answer</option>
                    <option value="long">Long Answer</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="time">Time</option>
                    <option value="mcq">Multiple Choice</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="linear_scale">Linear Scale</option>
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

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addQuestion('short')}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
          >
            <Plus className="w-3 h-3 inline mr-1" />
            Short
          </button>
          <button
            type="button"
            onClick={() => addQuestion('long')}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
          >
            <Plus className="w-3 h-3 inline mr-1" />
            Long
          </button>
          <button
            type="button"
            onClick={() => addQuestion('email')}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
          >
            <Plus className="w-3 h-3 inline mr-1" />
            Email
          </button>
          <button
            type="button"
            onClick={() => addQuestion('number')}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
          >
            <Plus className="w-3 h-3 inline mr-1" />
            Number
          </button>
          <button
            type="button"
            onClick={() => addQuestion('date')}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
          >
            <Plus className="w-3 h-3 inline mr-1" />
            Date
          </button>
          <button
            type="button"
            onClick={() => addQuestion('time')}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
          >
            <Plus className="w-3 h-3 inline mr-1" />
            Time
          </button>
          <button
            type="button"
            onClick={() => addQuestion('mcq')}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
          >
            <Plus className="w-3 h-3 inline mr-1" />
            Multiple Choice
          </button>
          <button
            type="button"
            onClick={() => addQuestion('checkbox')}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
          >
            <Plus className="w-3 h-3 inline mr-1" />
            Checkbox
          </button>
          <button
            type="button"
            onClick={() => addQuestion('linear_scale')}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
          >
            <Plus className="w-3 h-3 inline mr-1" />
            Linear Scale
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

