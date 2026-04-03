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

const ParsedCallSummary = ({ summary }: { summary: string }) => {
  try {
    const data = JSON.parse(summary);
    
    // Check if it's the expected object structure
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-3xl">{summary}</p>;
    }

    const { overview, keyPoints, sentiment, callOutcome, allQuestions, speakers } = data;

    return (
      <div className="space-y-6 pt-2">
        {/* Overview */}
        {overview && (
          <div className="space-y-2">
            <h5 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Overview</h5>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              {overview}
            </p>
          </div>
        )}

        {/* Key Points */}
        {keyPoints && keyPoints.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Key Discussion Points</h5>
            <div className="grid gap-2">
              {keyPoints.map((point: string, idx: number) => (
                <div key={idx} className="flex gap-3 items-start group">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action/Outcome Bar */}
        <div className="flex flex-wrap gap-4 items-center">
            {callOutcome && (
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest leading-none">Outcome</span>
                    <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                        callOutcome.toLowerCase().includes('follow-up') 
                            ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20"
                    )}>
                        {callOutcome.replace(/-/g, ' ')}
                    </span>
                </div>
            )}

            {sentiment && (
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest leading-none">Sentiment</span>
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                            sentiment.overall === 'positive' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                        )}>
                            {sentiment.overall} ({sentiment.score}/10)
                        </span>
                        <p className="text-[11px] font-medium text-zinc-500 italic">
                            — {sentiment.reason}
                        </p>
                    </div>
                </div>
            )}
        </div>

        {/* Speakers Highlights */}
        {speakers && speakers.length > 0 && (
            <div className="space-y-4 pt-2">
                <h5 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Participants & Highlights</h5>
                <div className="grid md:grid-cols-2 gap-4">
                    {speakers.map((s: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex gap-3 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-600 shrink-0 uppercase">
                                {s.initials || s.name[0]}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{s.name}</span>
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest border border-zinc-200 rounded px-1.5 py-0.5">
                                        {s.role}
                                    </span>
                                </div>
                                <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                                    "{s.highlight}"
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* All Questions */}
        {allQuestions && allQuestions.length > 0 && (
          <div className="space-y-3 pt-2">
            <h5 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Captured Questions</h5>
            <div className="flex flex-wrap gap-2">
                {allQuestions.map((q: string, idx: number) => (
                    <div key={idx} className="px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:border-indigo-200 transition-colors cursor-default">
                        {q}
                    </div>
                ))}
            </div>
          </div>
        )}

      </div>
    );
  } catch (e) {
    // If parsing fails, just return plain text
    return <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-3xl">{summary}</p>;
  }
};

export const LeadCallsTab = ({ calls }: LeadCallsTabProps) => {
  if (!calls || calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] border border-zinc-100 rounded-2xl bg-white/50 backdrop-blur-sm dark:bg-zinc-950 dark:border-zinc-800">
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
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 flex items-center justify-center shrink-0">
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
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 px-1.5 rounded-md bg-indigo-50 border border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500/20" />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-zinc-900 dark:text-zinc-100 leading-none">
                      AI Call Insights
                    </span>
                  </div>
                  <div className="pl-0">
                    <ParsedCallSummary summary={c.call_summary} />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};