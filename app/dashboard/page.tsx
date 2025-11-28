import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Form } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: forms, error } = await supabase
    .from('forms')
    .select('*')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching forms:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Forms</h1>
        <Link
          href="/dashboard/forms/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          Create Form
        </Link>
      </div>

      {!forms || forms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't created any forms yet.</p>
          <Link
            href="/dashboard/forms/new"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Create your first form →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form: Form) => (
            <Link
              key={form.id}
              href={`/dashboard/forms/${form.id}/edit`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
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
              <div className="flex gap-4 text-sm text-gray-500">
                <Link
                  href={`/dashboard/forms/${form.id}/responses`}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-primary-600"
                >
                  View Responses
                </Link>
                <Link
                  href={`/f/${form.id}`}
                  onClick={(e) => e.stopPropagation()}
                  target="_blank"
                  className="hover:text-primary-600"
                >
                  View Form
                </Link>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

