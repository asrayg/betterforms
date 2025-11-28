import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFormSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createFormSchema.parse(body);

    const { data, error } = await supabase
      .from('forms')
      .insert({
        owner_id: user.id,
        title: validated.title,
        description: validated.description,
        published: validated.published,
        settings: validated.settings || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating form:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in forms route:', error);
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

