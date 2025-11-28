'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface TranscriptBoxProps {
  transcript: string;
  audioUrl: string;
  onTranscriptChange: (newTranscript: string) => void;
  onReTranscribe: () => void;
  onRemove: () => void;
  isTranscribing?: boolean;
}

export function TranscriptBox({
  transcript,
  audioUrl,
  onTranscriptChange,
  onReTranscribe,
  onRemove,
  isTranscribing = false,
}: TranscriptBoxProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState(transcript);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setEditedTranscript(transcript);
  }, [transcript]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      return () => {
        audioRef.current?.removeEventListener('ended', () =>
          setIsPlaying(false)
        );
      };
    }
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleBlur = () => {
    onTranscriptChange(editedTranscript);
  };

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-md p-3 mb-2">
      <div className="flex items-start gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={togglePlayback}
            className="flex items-center justify-center w-7 h-7 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            title={isPlaying ? 'Pause' : 'Play audio'}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3" />
            )}
          </button>
          <button
            type="button"
            onClick={onReTranscribe}
            disabled={isTranscribing}
            className="flex items-center justify-center w-7 h-7 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
            title="Re-transcribe audio"
          >
            <RefreshCw className={`w-3 h-3 ${isTranscribing ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center justify-center w-7 h-7 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
            title="Remove audio"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            onBlur={handleBlur}
            rows={3}
            className="w-full px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Edit transcription..."
          />
          <p className="text-xs text-gray-500 mt-1">Click play to hear, edit text to correct transcription</p>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={audioUrl}
        className="hidden"
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}

