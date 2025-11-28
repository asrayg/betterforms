'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/lib/types';
import { FormBuilder } from '@/components/FormBuilder';

export default function NewFormPage() {
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
      // Create form
      const formRes = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          published: formData.published,
        }),
      });

      if (!formRes.ok) {
        throw new Error('Failed to create form');
      }

      const form = await formRes.json();

      // Save questions
      if (formData.questions.length > 0) {
        const questionsRes = await fetch(`/api/forms/${form.id}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questions: formData.questions,
          }),
        });

        if (!questionsRes.ok) {
          throw new Error('Failed to save questions');
        }
      }

      router.push(`/dashboard/forms/${form.id}/edit`);
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form. Please try again.');
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

