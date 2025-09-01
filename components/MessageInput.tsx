import React, { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onTyping: (isTyping: boolean) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading, onTyping }) => {
  const [input, setInput] = useState('');
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    if (!onTyping) return;

    onTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      onTyping(false);
    }, 1500); // User is considered "stopped typing" after 1.5s
  };

  const handleSend = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      onTyping(false);
    }

    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-700/50 bg-black/20 p-4">
      <div className="flex items-center space-x-2 rounded-full bg-slate-900/50 p-2 border border-slate-600 focus-within:ring-2 focus-within:ring-purple-500 transition-all">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Ask anything..."
          className="flex-1 bg-transparent px-3 text-white placeholder-slate-400 focus:outline-none"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white transition-transform hover:scale-105 active:scale-95 disabled:from-slate-600 disabled:to-slate-700 disabled:opacity-70 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;