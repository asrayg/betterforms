import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Form } from '@/lib/types';
import { DashboardClient } from '@/components/DashboardClient';

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

      <DashboardClient initialForms={forms || []} />
    </div>
  );
}

