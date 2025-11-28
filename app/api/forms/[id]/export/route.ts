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

    // Fetch responses with answers and questions
    const { data: responses, error: responsesError } = await serviceSupabase
      .from('responses')
      .select('*, answers(*, question:questions(*))')
      .eq('form_id', id)
      .order('created_at', { ascending: false });

    if (responsesError) {
      console.error('Error fetching responses:', responsesError);
      return NextResponse.json(
        { error: responsesError.message },
        { status: 500 }
      );
    }

    // Get all questions in order
    const { data: questions } = await serviceSupabase
      .from('questions')
      .select('*')
      .eq('form_id', id)
      .order('order_index', { ascending: true });

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'No questions found' }, { status: 404 });
    }

    // Build CSV
    const headers = ['Timestamp', 'Email'];
    questions.forEach((q) => {
      headers.push(q.prompt);
    });

    const rows: string[][] = [];
    (responses || []).forEach((response: any) => {
      const row: string[] = [
        new Date(response.created_at).toISOString(),
        response.respondent_email || '',
      ];

      questions.forEach((question) => {
        const answer = response.answers?.find(
          (a: any) => a.question_id === question.id
        );
        let answerText = '';
        
        if (answer) {
          if (question.type === 'checkbox' && answer.answer_text) {
            // Checkbox answers are comma-separated
            answerText = answer.answer_text;
          } else {
            answerText = answer.answer_text || '';
          }
        }
        
        row.push(answerText);
      });

      rows.push(row);
    });

    // Convert to CSV
    const escapeCSV = (str: string) => {
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${form.title.replace(/[^a-z0-9]/gi, '_')}_responses.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting responses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

