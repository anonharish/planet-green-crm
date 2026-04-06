import React from 'react';
import { Loader2 } from 'lucide-react';

interface FullScreenLoaderProps {
  message?: string;
  isOverlay?: boolean;
}

export const FullScreenLoader = ({ 
  message = "Please wait...", 
  isOverlay = true 
}: FullScreenLoaderProps) => {
  const containerClasses = isOverlay 
    ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/40 dark:bg-zinc-950/40 backdrop-blur-[1px]"
    : "flex flex-col items-center justify-center p-12 w-full h-full";

  return (
    <div className={containerClasses}>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center min-w-[200px]">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
        </div>
        <p className="mt-4 text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          {message}
        </p>
      </div>
    </div>
  );
};
