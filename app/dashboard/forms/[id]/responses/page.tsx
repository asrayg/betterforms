import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ResponsesList } from '@/components/ResponsesList';

export default async function ResponsesPage({
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
        <p className="text-gray-600">View and manage responses</p>
      </div>

      <ResponsesList formId={id} />
    </div>
  );
}

