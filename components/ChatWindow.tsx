import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end animate-slide-in-right' : 'items-start animate-pop-in'}`}>
          <div className={`max-w-md rounded-2xl px-5 py-3 text-white shadow-md ${msg.sender === 'user' ? 'bg-gradient-to-br from-blue-500 to-purple-600 rounded-tr-none' : 'bg-slate-800/80 rounded-bl-none'}`}>
            <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-start animate-pop-in ml-1">
          <div className="max-w-md rounded-2xl rounded-bl-none bg-slate-800/80 px-4 py-3 text-slate-300 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-sky-300 [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 animate-pulse rounded-full bg-sky-300 [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 animate-pulse rounded-full bg-sky-300"></div>
              <span className="text-sm italic">Aura is thinking...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;