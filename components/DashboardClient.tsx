'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Form } from '@/lib/types';
import { FormCard } from './FormCard';
import { FormCardSkeleton } from './LoadingSkeleton';

interface DashboardClientProps {
  initialForms: Form[];
}

export function DashboardClient({ initialForms }: DashboardClientProps) {
  const [forms, setForms] = useState<Form[]>(initialForms);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = (formId: string) => {
    setForms(forms.filter((f) => f.id !== formId));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <FormCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">You haven't created any forms yet.</p>
        <Link
          href="/dashboard/forms/new"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Create your first form →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {forms.map((form) => (
        <FormCard key={form.id} form={form} onDelete={handleDelete} />
      ))}
    </div>
  );
}

