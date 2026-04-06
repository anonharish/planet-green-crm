import React, { useEffect, useState, useMemo } from 'react';
import { Loader2, User, Bot, AlertCircle } from 'lucide-react';
import { formatDate } from '../../../../utils';
import type { LeadChat } from '../../types';
import { usePermissions } from '../../../../hooks/usePermissions';
import { useGetAllUsersQuery } from '../../../users/api/usersApi';

interface ChatMessage {
  timestamp: string;
  uuid: string;
  direction: 'sent' | 'received';
  from_number: string;
  to_number: string;
  message: string;
  template_name?: string;
}

interface LeadChatsTabProps {
  chats?: LeadChat[];
}

export const LeadChatsTab = ({ chats }: LeadChatsTabProps) => {
  const { user: currentUser } = usePermissions();
  const { data: users = [] } = useGetAllUsersQuery({ offset: 0 });
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Identify current user's phone number to filter irrelevant chat files
  const currentUserPhone = useMemo(() => {
    const loginUser = users.find(u => String(u.id) === String(currentUser?.id));
    return loginUser?.phone_number;
  }, [users, currentUser]);

  useEffect(() => {
    const fetchChatData = async () => {
      if (!chats || chats.length === 0) return;

      // Filter out files that contain the current user's phone number in the URL
      // The user specified: "if it consists the user phone number... ignore that url"
      const validChat = chats.find(c => {
        if (!c.chat_file_location) return false;
        if (currentUserPhone && c.chat_file_location.includes(currentUserPhone)) return false;
        return true;
      }) || chats[0]; // Fallback to first if filtering logic finds nothing

      if (!validChat?.chat_file_location) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(validChat.chat_file_location);
        if (!response.ok) throw new Error('Failed to fetch chat messages');
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Chat Fetch Error:', err);
        setError('Unable to load chat history. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatData();
  }, [chats, currentUserPhone]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-indigo-500" />
        <p className="text-sm font-medium">Fetching secure chat history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center border border-red-100 dark:border-red-900/30 rounded-xl mt-4 bg-red-50/50 dark:bg-red-900/10">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  if (!chats || chats.length === 0 || messages.length === 0) {
    return (
      <div className="p-12 text-center text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl mt-4 bg-white dark:bg-zinc-950">
        <Bot className="h-10 w-10 text-zinc-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">No Conversations Yet</h3>
        <p className="text-sm">When the lead interacts via WhatsApp, their history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col h-[600px] bg-[#efeae2] dark:bg-zinc-900 shadow-inner">
      {/* WhatsApp style header */}
      <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-sm">WhatsApp Conversation</h3>
          <p className="text-[10px] opacity-80 italic">End-to-end encrypted</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
        {messages.map((msg, idx) => {
          const isSent = msg.direction === 'sent';

          return (
            <div
              key={`${msg.uuid}-${idx}`}
              className={`flex w-full ${isSent ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex flex-col max-w-[85%] ${isSent ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-3 py-2 rounded-lg text-sm leading-relaxed shadow-sm relative ${
                    isSent
                      ? 'bg-[#dcf8c6] dark:bg-emerald-900/30 text-zinc-800 dark:text-zinc-100 rounded-tr-none'
                      : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-none'
                  }`}
                >
                  {/* Message content */}
                  <div className="whitespace-pre-wrap">{msg.message}</div>
                  
                  {/* Template info */}
                  {/* {msg.template_name && (
                    <div className={`mt-2 pt-2 border-t text-[9px] uppercase tracking-wider font-bold opacity-50 ${
                      isSent ? 'border-emerald-200 dark:border-emerald-800' : 'border-zinc-100 dark:border-zinc-700'
                    }`}>
                      Template: {msg.template_name}
                    </div>
                  )} */}

                  {/* Timestamp inside bubble for true WA look */}
                  <div className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 opacity-60 ${
                    isSent ? 'text-emerald-900 dark:text-emerald-400' : 'text-zinc-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isSent && <span className="text-blue-500 font-bold ml-0.5">✓✓</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Safe Bottom Padding */}
        <div className="h-2" />
      </div>

      {/* Footer bar for completeness */}
      <div className="bg-[#f0f2f5] dark:bg-zinc-950 p-2 border-t border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-[10px] text-zinc-400">Interaction logged from Official WhatsApp Business API</p>
      </div>
    </div>
  );
};