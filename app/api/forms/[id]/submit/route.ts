import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { submitResponseSchema } from '@/lib/validations';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const serviceSupabase = createServiceRoleClient();

    // Check if form exists and is published
    const { data: form, error: formError } = await serviceSupabase
      .from('forms')
      .select('id, published, settings')
      .eq('id', id)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (!form.published) {
      return NextResponse.json(
        { error: 'Form is not published' },
        { status: 403 }
      );
    }

    // Get questions to validate required fields
    const { data: questions } = await serviceSupabase
      .from('questions')
      .select('id, required')
      .eq('form_id', id);

    const body = await request.json();
    const validated = submitResponseSchema.parse({
      ...body,
      form_id: id,
    });

    // Check if limit_one_response is enabled and email is provided
    if (form.settings?.limit_one_response && validated.respondent_email) {
      const { data: existingResponse } = await serviceSupabase
        .from('responses')
        .select('id')
        .eq('form_id', id)
        .eq('respondent_email', validated.respondent_email)
        .single();

      if (existingResponse) {
        return NextResponse.json(
          { error: 'You have already submitted a response to this form' },
          { status: 400 }
        );
      }
    }

    // Validate required questions
    const requiredQuestionIds = new Set(
      questions?.filter((q) => q.required).map((q) => q.id) || []
    );
    const answeredQuestionIds = new Set(
      validated.answers.map((a) => a.question_id)
    );

    for (const requiredId of requiredQuestionIds) {
      if (!answeredQuestionIds.has(requiredId)) {
        return NextResponse.json(
          { error: `Question ${requiredId} is required` },
          { status: 400 }
        );
      }
    }

    // Get user agent
    const userAgent = request.headers.get('user-agent') || '';

    // Create response
    const { data: response, error: responseError } = await serviceSupabase
      .from('responses')
      .insert({
        form_id: id,
        respondent_email: validated.respondent_email || null,
        respondent_meta: {
          userAgent,
          ...validated.respondent_meta,
        },
      })
      .select()
      .single();

    if (responseError) {
      console.error('Error creating response:', responseError);
      return NextResponse.json(
        { error: responseError.message },
        { status: 500 }
      );
    }

    // Create answers
    const answersToInsert = validated.answers.map((answer) => ({
      response_id: response.id,
      question_id: answer.question_id,
      answer_text: answer.answer_text || null,
      audio_url: answer.audio_url || null,
      transcript_text: answer.transcript_text || null,
    }));

    const { error: answersError } = await serviceSupabase
      .from('answers')
      .insert(answersToInsert);

    if (answersError) {
      console.error('Error creating answers:', answersError);
      return NextResponse.json(
        { error: answersError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, response_id: response.id });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error submitting response:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

