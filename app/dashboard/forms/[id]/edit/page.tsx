import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditFormClient } from '@/components/EditFormClient';

export default async function EditFormPage({
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

  const { data: form, error } = await supabase
    .from('forms')
    .select('*, questions(*)')
    .eq('id', id)
    .single();

  if (error || !form) {
    redirect('/dashboard');
  }

  // Verify ownership
  if (form.owner_id !== user.id) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <EditFormClient
        initialForm={{
          id: form.id,
          title: form.title,
          description: form.description || '',
          published: form.published,
          questions: (form.questions || []).sort(
            (a: any, b: any) => a.order_index - b.order_index
          ),
        }}
      />
    </div>
  );
}

