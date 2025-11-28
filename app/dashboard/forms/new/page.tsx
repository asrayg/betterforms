'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/lib/types';
import { FormBuilder } from '@/components/FormBuilder';
import toast from 'react-hot-toast';

export default function NewFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSave = async (formData: {
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
  }) => {
    setLoading(true);
    try {
      // Create form
      const formRes = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          published: formData.published,
          settings: formData.settings,
        }),
      });

      if (!formRes.ok) {
        const errorData = await formRes.json().catch(() => ({}));
        console.error('Form creation error:', errorData);
        throw new Error(errorData.error || 'Failed to create form');
      }

      const form = await formRes.json();

      // Save questions (filter out questions with empty prompts)
      const validQuestions = formData.questions.filter(
        (q) => q.prompt && q.prompt.trim().length > 0
      );
      
      if (validQuestions.length > 0) {
        // Remove id fields from questions when creating new form
        const questionsToSave = validQuestions.map(({ id, ...q }, idx) => ({
          ...q,
          order_index: idx,
        }));
        
        const questionsRes = await fetch(`/api/forms/${form.id}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questions: questionsToSave,
          }),
        });

        if (!questionsRes.ok) {
          const errorData = await questionsRes.json().catch(() => ({}));
          console.error('Questions API error:', errorData);
          const errorMessage = errorData.details
            ? `Validation error: ${JSON.stringify(errorData.details)}`
            : errorData.error || 'Failed to save questions';
          throw new Error(errorMessage);
        }
      }

      toast.success('Form created successfully!');
      router.push(`/dashboard/forms/${form.id}/edit`);
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FormBuilder
        initialForm={{
          title: '',
          description: '',
          published: false,
          questions: [],
        }}
        onSave={handleSave}
        loading={loading}
      />
    </div>
  );
}

