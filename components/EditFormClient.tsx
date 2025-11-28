'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/lib/types';
import { FormBuilder } from './FormBuilder';

interface EditFormClientProps {
  initialForm: {
    id: string;
    title: string;
    description?: string;
    published: boolean;
    questions: Question[];
  };
}

export function EditFormClient({ initialForm }: EditFormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSave = async (formData: {
    title: string;
    description?: string;
    published: boolean;
    questions: Question[];
  }) => {
    setLoading(true);
    try {
      // Update form
      const formRes = await fetch(`/api/forms/${initialForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          published: formData.published,
        }),
      });

      if (!formRes.ok) {
        throw new Error('Failed to update form');
      }

      // Save questions
      const questionsRes = await fetch(
        `/api/forms/${initialForm.id}/questions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questions: formData.questions,
          }),
        }
      );

      if (!questionsRes.ok) {
        throw new Error('Failed to save questions');
      }

      router.refresh();
      alert('Form saved successfully!');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormBuilder
      initialForm={initialForm}
      onSave={handleSave}
      loading={loading}
    />
  );
}

