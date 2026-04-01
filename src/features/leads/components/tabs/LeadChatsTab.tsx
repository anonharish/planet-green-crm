import React from 'react';
import { formatDate } from '../../../../utils';
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
    <div className="mt-6 px-2">

      {/* TODAY LABEL */}
      <div className="text-center text-xs text-zinc-400 mb-6 font-medium">
        TODAY
      </div>

      <div className="space-y-6">
        {chats.map((c, index) => {
          const isSender = index % 2 === 1; // TEMP (replace later with real sender logic)

          return (
            <div
              key={c.id}
              className={`flex items-end gap-2 ${
                isSender ? 'justify-end' : 'justify-start'
              }`}
            >

              {/* LEFT SIDE (Customer) */}
              {!isSender && (
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-200 text-[10px] font-semibold text-zinc-700">
                  AS
                </div>
              )}

              {/* MESSAGE */}
              <div className="max-w-[420px]">

                <div
                  className={`px-4 py-2 rounded-xl text-sm leading-relaxed ${
                    isSender
                      ? 'bg-blue-900 text-white rounded-br-sm'
                      : 'bg-zinc-100 text-zinc-800 rounded-bl-sm'
                  }`}
                >
                  {c.chat_summary || 'No message'}
                </div>

                <div
                  className={`text-[10px] mt-1 ${
                    isSender ? 'text-right text-zinc-400' : 'text-left text-zinc-400'
                  }`}
                >
                  {formatDate(c.created_on)}
                </div>
              </div>

              {/* RIGHT SIDE (Agent) */}
              {isSender && (
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-900 text-white text-[10px] font-semibold">
                  VS
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};