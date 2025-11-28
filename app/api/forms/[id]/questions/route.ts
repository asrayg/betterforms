import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateQuestionsSchema } from '@/lib/validations';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: form } = await supabase
      .from('forms')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!form || form.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateQuestionsSchema.parse({
      ...body,
      form_id: id,
    });

    // Delete existing questions
    await supabase.from('questions').delete().eq('form_id', id);

    // Insert new questions
    const questionsToInsert = validated.questions.map((q) => ({
      form_id: id,
      order_index: q.order_index,
      type: q.type,
      prompt: q.prompt,
      required: q.required,
      options: q.options || null,
      validation: q.validation || null,
    }));

    const { data, error } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (error) {
      console.error('Error saving questions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ questions: data });
  } catch (error: any) {
    console.error('Error in questions route:', error);
    if (error.name === 'ZodError') {
      console.error('Validation errors:', error.errors);
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

