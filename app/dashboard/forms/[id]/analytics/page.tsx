import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AnalyticsClient } from '@/components/AnalyticsClient';

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify ownership
  const { data: form } = await supabase
    .from('forms')
    .select('id, title, owner_id')
    .eq('id', id)
    .single();

  if (!form || form.owner_id !== user.id) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
            <p className="text-gray-600">Form Analytics & Insights</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/dashboard/forms/${id}/responses`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              View Responses
            </Link>
            <Link
              href={`/dashboard/forms/${id}/edit`}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Edit Form
            </Link>
          </div>
        </div>
      </div>

      <AnalyticsClient formId={id} />
    </div>
  );
}

