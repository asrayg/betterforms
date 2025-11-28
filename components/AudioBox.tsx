'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface AudioBoxProps {
  audioUrl: string;
  onReTranscribe: () => void;
  isTranscribing?: boolean;
}

export function AudioBox({
  audioUrl,
  onReTranscribe,
  isTranscribing = false,
}: AudioBoxProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  return (
    <div className="flex flex-col gap-1.5 p-2 bg-white border border-gray-300 rounded-md shadow-sm">
      <button
        type="button"
        onClick={togglePlayback}
        className="flex items-center justify-center gap-1.5 px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors text-xs"
        title={isPlaying ? 'Pause' : 'Play audio'}
      >
        {isPlaying ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3" />
        )}
        <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
      </button>
      <button
        type="button"
        onClick={onReTranscribe}
        disabled={isTranscribing}
        className="flex items-center justify-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs disabled:opacity-50"
        title="Re-transcribe audio"
      >
        <RefreshCw className={`w-3 h-3 ${isTranscribing ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline text-xs">
          {isTranscribing ? 'Transcribing...' : 'Re-transcribe'}
        </span>
      </button>
      <audio
        ref={audioRef}
        src={audioUrl}
        className="hidden"
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}

