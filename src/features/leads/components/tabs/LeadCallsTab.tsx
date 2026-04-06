import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUpRight, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Sparkles,
  Loader2 
} from 'lucide-react';
import { cn } from '../../../../utils';
import type { LeadCall } from '../../types';

interface LeadCallsTabProps {
  calls?: LeadCall[];
}

const formatCallDate = (dateString: string) => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date).replace(',', ' •'); // Example: Oct 26, 2023 • 02:15 PM
};

const formatDuration = (seconds: number | null) => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const CallAudioPlayer = ({ url, durationSec, fileName }: { url: string; durationSec: number; fileName: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'recording.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to traditional link if fetch fails
      window.open(url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-4 dark:bg-zinc-900/50 dark:border-zinc-800">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        muted={isMuted}
      />
      
      <button 
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-[#063669] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-md shrink-0"
      >
        {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 space-y-1">
        <input
          type="range"
          min="0"
          max={durationSec || 100}
          value={currentTime}
          onChange={handleProgressChange}
          className="w-full h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-[#063669] dark:bg-zinc-700"
        />
        <div className="flex justify-between text-[11px] font-bold text-zinc-400 tracking-wider">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(durationSec)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-zinc-400 shrink-0">
        <button onClick={toggleMute} className="hover:text-zinc-600 transition-colors">
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
        <button 
          onClick={handleDownload} 
          disabled={isDownloading}
          className={cn("hover:text-zinc-600 transition-colors", isDownloading && "opacity-50 cursor-wait")}
          title="Download Recording"
        >
          {isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};

export const LeadCallsTab = ({ calls }: LeadCallsTabProps) => {
  if (!calls || calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] border border-zinc-100 rounded-2xl bg-white/50 backdrop-blur-sm">
        <p className="text-sm text-zinc-400 font-medium italic">No call history available for this lead.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-6">
      {calls.map((c) => {
        const recordingUrl = `https://crm-demo-data-bucket.s3.ap-south-1.amazonaws.com/lead/${c.lead_uuid}/call/${c.call_s3_data}/recording.mp3`;

        return (
          <div
            key={c.id}
            className="rounded-2xl border border-zinc-100 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:bg-zinc-950 dark:border-zinc-800 overflow-hidden"
          >
            {/* Header Section */}
            <div className="flex justify-between items-start p-6 pb-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Outgoing Call - Connected
                  </h4>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                    {formatCallDate(c.created_on)}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                {formatDuration(c.call_duration_in_seconds)}
              </span>
            </div>

            {/* Content Body */}
            <div className="px-6 pb-6 space-y-6">
              {/* Functional Audio Player */}
              <CallAudioPlayer 
                url={recordingUrl} 
                durationSec={c.call_duration_in_seconds || 0} 
                fileName={`recording_${c.id}_${c.created_on.slice(0, 10)}.mp3`}
              />

              {/* AI Summary Section */}
              {c.call_summary && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-widest leading-none">
                      AI Call Summary
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-3xl">
                    {c.call_summary}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};