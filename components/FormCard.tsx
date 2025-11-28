'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Form } from '@/lib/types';
import { Share2, Trash2 } from 'lucide-react';
import { AlertModal } from './AlertModal';
import { ShareModal } from './ShareModal';
import toast from 'react-hot-toast';

interface FormCardProps {
  form: Form;
  onDelete: (formId: string) => void;
}

export function FormCard({ form, onDelete }: FormCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/forms/${form.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete form');
      }

      toast.success('Form deleted successfully');
      onDelete(form.id);
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Failed to delete form');
    } finally {
      setIsDeleting(false);
    }
  };

  const formUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/f/${form.id}`
    : '';

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <Link
          href={`/dashboard/forms/${form.id}/edit`}
          className="block"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {form.title}
            </h3>
            <span
              className={`text-xs px-2 py-1 rounded ${
                form.published
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {form.published ? 'Published' : 'Draft'}
            </span>
          </div>
          {form.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {form.description}
            </p>
          )}
        </Link>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex gap-4 text-sm text-gray-500">
            <Link
              href={`/dashboard/forms/${form.id}/analytics`}
              className="hover:text-primary-600"
            >
              Analytics
            </Link>
            <Link
              href={`/dashboard/forms/${form.id}/responses`}
              className="hover:text-primary-600"
            >
              Responses
            </Link>
            <Link
              href={`/f/${form.id}`}
              target="_blank"
              className="hover:text-primary-600"
            >
              View Form
            </Link>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareModal(true);
              }}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
              title="Share form"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              disabled={isDeleting}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              title="Delete form"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Form"
        message={`Are you sure you want to delete "${form.title}"? This action cannot be undone and will delete all responses.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        formUrl={formUrl}
        formTitle={form.title}
      />
    </>
  );
}

