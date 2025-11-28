import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const serviceSupabase = createServiceRoleClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: form } = await serviceSupabase
      .from('forms')
      .select('owner_id, title')
      .eq('id', id)
      .single();

    if (!form || form.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all responses
    const { data: responses, error: responsesError } = await serviceSupabase
      .from('responses')
      .select('id, created_at, respondent_email')
      .eq('form_id', id)
      .order('created_at', { ascending: false });

    if (responsesError) {
      console.error('Error fetching responses:', responsesError);
      return NextResponse.json(
        { error: responsesError.message },
        { status: 500 }
      );
    }

    // Get all questions
    const { data: questions } = await serviceSupabase
      .from('questions')
      .select('*')
      .eq('form_id', id)
      .order('order_index', { ascending: true });

    // Get all answers with questions
    const { data: answers } = await serviceSupabase
      .from('answers')
      .select('*, question:questions(*)')
      .in(
        'response_id',
        (responses || []).map((r) => r.id)
      );

    // Calculate statistics
    const totalResponses = responses?.length || 0;
    const lastResponse = responses && responses.length > 0 
      ? responses[0].created_at 
      : null;
    const firstResponse = responses && responses.length > 0
      ? responses[responses.length - 1].created_at
      : null;

    // Response rate over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentResponses = (responses || []).filter(
      (r) => new Date(r.created_at) >= thirtyDaysAgo
    );

    // Group responses by date
    const responsesByDate: Record<string, number> = {};
    recentResponses.forEach((response) => {
      const date = new Date(response.created_at).toISOString().split('T')[0];
      responsesByDate[date] = (responsesByDate[date] || 0) + 1;
    });

    // Question-level analytics
    const questionAnalytics = (questions || []).map((question) => {
      const questionAnswers = (answers || []).filter(
        (a: any) => a.question_id === question.id
      );

      const answeredCount = questionAnswers.length;
      const skippedCount = totalResponses - answeredCount;
      const completionRate = totalResponses > 0 
        ? (answeredCount / totalResponses) * 100 
        : 0;

      let distribution: Record<string, number> = {};
      
      if (question.type === 'mcq' || question.type === 'checkbox') {
        questionAnswers.forEach((answer: any) => {
          if (question.type === 'checkbox' && answer.answer_text) {
            // Checkbox answers are comma-separated
            const options = answer.answer_text.split(',').map((o: string) => o.trim());
            options.forEach((option: string) => {
              distribution[option] = (distribution[option] || 0) + 1;
            });
          } else if (answer.answer_text) {
            distribution[answer.answer_text] = (distribution[answer.answer_text] || 0) + 1;
          }
        });
      } else if (question.type === 'linear_scale') {
        questionAnswers.forEach((answer: any) => {
          if (answer.answer_text) {
            distribution[answer.answer_text] = (distribution[answer.answer_text] || 0) + 1;
          }
        });
      }

      return {
        question_id: question.id,
        prompt: question.prompt,
        type: question.type,
        answered_count: answeredCount,
        skipped_count: skippedCount,
        completion_rate: completionRate,
        distribution,
      };
    });

    // Average responses per day (if form has been live)
    let avgResponsesPerDay = 0;
    if (firstResponse && totalResponses > 0) {
      const daysSinceFirst = Math.max(
        1,
        Math.ceil(
          (new Date().getTime() - new Date(firstResponse).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      avgResponsesPerDay = totalResponses / daysSinceFirst;
    }

    // Response completion time (if we have metadata)
    const completionTimes: number[] = [];
    // This would require tracking start/end times, which we don't currently do
    // But we can add it in the future

    return NextResponse.json({
      form_id: id,
      form_title: form.title,
      total_responses: totalResponses,
      last_response: lastResponse,
      first_response: firstResponse,
      avg_responses_per_day: avgResponsesPerDay,
      responses_by_date: responsesByDate,
      question_analytics: questionAnalytics,
      unique_respondents: new Set(
        (responses || [])
          .map((r) => r.respondent_email)
          .filter((email) => email)
      ).size,
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

