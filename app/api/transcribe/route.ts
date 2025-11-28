import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { transcribeSchema } from '@/lib/validations';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audio_url } = transcribeSchema.parse(body);

    // Download audio from Supabase Storage
    const supabase = createServiceRoleClient();
    
    // Parse the storage path from the public URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlPattern = /\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/;
    const match = audio_url.match(urlPattern);
    
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid audio URL format' },
        { status: 400 }
      );
    }

    const bucketName = match[1];
    const filePath = match[2];

    const { data: audioBlob, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (downloadError || !audioBlob) {
      console.error('Error downloading audio:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download audio file' },
        { status: 500 }
      );
    }

    // Convert blob to File for OpenAI
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const file = new File([buffer], 'audio.webm', { type: 'audio/webm' });

    // Transcribe with OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    });

    return NextResponse.json({ transcript: transcription.text });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

