import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { FormSubmission } from '@/components/FormSubmission';
import Image from 'next/image';
import Link from 'next/link';

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: form, error } = await supabase
    .from('forms')
    .select('*, questions(*)')
    .eq('id', id)
    .single();

  if (error || !form) {
    notFound();
  }

  if (!form.published) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="BetterForms"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-primary-600">BetterForms</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Form Not Available
          </h1>
          <p className="text-gray-600">
            This form is not published and cannot be accessed.
          </p>
        </div>
      </div>
    );
  }

  const sortedQuestions = (form.questions || []).sort(
    (a: any, b: any) => a.order_index - b.order_index
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex justify-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="BetterForms"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-primary-600">BetterForms</span>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-gray-600 mb-8">{form.description}</p>
          )}
          <FormSubmission 
            formId={form.id} 
            questions={sortedQuestions}
            settings={form.settings}
          />
        </div>
      </div>
    </div>
  );
}

