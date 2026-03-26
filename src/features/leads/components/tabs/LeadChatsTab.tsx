import React from 'react';
import { formatDate } from '../../../../utils';
import { MessageSquare, Paperclip } from 'lucide-react';
import type { LeadChat } from '../../types';

interface LeadChatsTabProps {
  chats?: LeadChat[];
}

export const LeadChatsTab = ({ chats }: LeadChatsTabProps) => {
  if (!chats || chats.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-xl mt-4 bg-white dark:bg-zinc-950">
        No chat logs found.
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {chats.map((c) => (
        <div key={c.id} className="flex gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all hover:shadow-md">
          <div className="mt-1 bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full h-fit shrink-0">
            <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Chat Interaction
              </p>
              <span className="text-xs text-zinc-500 font-medium">
                {formatDate(c.created_on)}
              </span>
            </div>
            
            {c.chat_summary && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {c.chat_summary}
              </p>
            )}

            {c.chat_file_location && (
              <a 
                href={c.chat_file_location}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2 py-1.5 rounded-md font-medium transition-colors"
              >
                <Paperclip className="h-3.5 w-3.5" />
                Attached File
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
