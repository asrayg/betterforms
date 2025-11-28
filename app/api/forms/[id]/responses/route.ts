import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
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

    // Fetch responses with answers and questions
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('*')
      .eq('form_id', id)
      .order('created_at', { ascending: false });

    if (responsesError) {
      console.error('Error fetching responses:', responsesError);
      return NextResponse.json(
        { error: responsesError.message },
        { status: 500 }
      );
    }

    // Fetch answers for each response
    const responsesWithAnswers = await Promise.all(
      (responses || []).map(async (response) => {
        const { data: answers } = await supabase
          .from('answers')
          .select('*, question:questions(*)')
          .eq('response_id', response.id);

        return {
          ...response,
          answers: answers || [],
        };
      })
    );

    return NextResponse.json(responsesWithAnswers);
  } catch (error: any) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

