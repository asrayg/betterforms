import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const formId = formData.get('formId') as string;
    const questionId = formData.get('questionId') as string;

    if (!file || !formId || !questionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();
    const tempId = `temp-${Date.now()}`;
    const filePath = `forms/${formId}/responses/${tempId}/${questionId}.webm`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload using service role (bypasses RLS)
    const { data, error } = await supabase.storage
      .from('audio')
      .upload(filePath, buffer, {
        contentType: 'audio/webm',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading audio:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('audio').getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl, path: filePath });
  } catch (error: any) {
    console.error('Error in upload-audio route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

